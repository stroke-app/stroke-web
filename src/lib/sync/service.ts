import "@tanstack/react-start/server-only";
import { and, asc, count, eq, gt, inArray, lte, max, sql } from "drizzle-orm";

import { db } from "#/lib/db";
import { SYNC_QUOTA_BYTES, syncKeys, syncRecords, syncState } from "#/lib/db/schema";
import { apiError } from "#/lib/desktop/service";

/**
 * End-to-end encrypted sync (docs/accounts-and-sync.md, Appendix B). The
 * server stores opaque strings and enforces versions, sequence numbers and
 * limits; it never sees plaintext.
 *
 * D1 has no interactive transactions, so every multi-statement write is one
 * `db.batch` (a single SQLite transaction, all or nothing). The version check
 * lives inside the SQL of each write rather than in a read before it, so two
 * devices pushing at once can't both win the same version, and `seq` is
 * taken from `sync_state.last_seq` inside the same batch, so it is strictly
 * increasing per user.
 */

export const SYNC_KINDS = ["workspace", "connection", "settings"] as const;
export type SyncKind = (typeof SYNC_KINDS)[number];

export const MAX_PUSH_RECORDS = 200;
export const MAX_CIPHERTEXT_CHARS = 1_500_000;
const MAX_CHANGES_LIMIT = 500;
/** Ciphertext per /changes page: keeps the response well inside Worker memory. */
const CHANGES_PAGE_CHARS = 8_000_000;
/** D1 allows 100 bound parameters per statement. */
const IN_CHUNK = 90;

const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
/** base64url, optionally padded. Ciphertext and wrapped keys are both base64url. */
const B64URL_RE = /^[A-Za-z0-9_-]+={0,2}$/;

// ---------------------------------------------------------------------------
// Key
// ---------------------------------------------------------------------------

export async function getSyncKey(userId: string): Promise<Response> {
  const [row] = await db.select().from(syncKeys).where(eq(syncKeys.userId, userId)).limit(1);
  if (!row) return apiError(404, "no_sync_key", "Sync isn't set up for this account yet.");
  return Response.json(
    {
      wrapped_key: row.wrappedKey,
      kdf: JSON.parse(row.kdf) as unknown,
      created_at: row.createdAt.getTime(),
    },
    { headers: { "cache-control": "no-store" } },
  );
}

type KdfParams = { alg: "argon2id"; salt: string; m: number; t: number; p: number };

function parseKdf(value: unknown): KdfParams | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const k = value as Record<string, unknown>;
  const posInt = (n: unknown, maxValue: number) =>
    typeof n === "number" && Number.isInteger(n) && n > 0 && n <= maxValue;
  if (k.alg !== "argon2id") return null;
  if (typeof k.salt !== "string" || k.salt.length > 128 || !B64URL_RE.test(k.salt)) return null;
  if (!posInt(k.m, 4_194_304) || !posInt(k.t, 100) || !posInt(k.p, 64)) return null;
  return k as KdfParams;
}

/**
 * PUT /api/sync/key. Without `replace`, only stores a first key (`201`) and
 * refuses to overwrite one (`409 key_exists`). With `replace: true` (reset
 * sync) it replaces the key and deletes every record in one transaction.
 * `last_seq` survives the reset so other devices' `since` never runs ahead.
 */
export async function putSyncKey(userId: string, body: Record<string, unknown>) {
  const wrappedKey = body.wrapped_key;
  if (
    typeof wrappedKey !== "string" ||
    wrappedKey.length < 16 ||
    wrappedKey.length > 1024 ||
    !B64URL_RE.test(wrappedKey)
  ) {
    return apiError(400, "invalid_request", "wrapped_key must be a base64url string.");
  }
  const kdf = parseKdf(body.kdf);
  const kdfJson = kdf ? JSON.stringify(kdf) : "";
  if (!kdf || kdfJson.length > 1024) {
    return apiError(
      400,
      "invalid_request",
      'kdf must be { alg: "argon2id", salt, m, t, p } with a base64url salt and positive integers.',
    );
  }
  if (body.replace !== undefined && typeof body.replace !== "boolean") {
    return apiError(400, "invalid_request", "replace must be a boolean.");
  }

  const now = new Date();
  const ensureState = db.insert(syncState).values({ userId }).onConflictDoNothing();

  if (body.replace !== true) {
    const [, inserted] = await db.batch([
      ensureState,
      db
        .insert(syncKeys)
        .values({ userId, wrappedKey, kdf: kdfJson, createdAt: now, updatedAt: now })
        .onConflictDoNothing()
        .returning({ userId: syncKeys.userId }),
    ]);
    if (inserted.length === 0) {
      return apiError(
        409,
        "key_exists",
        "This account already has a sync key. Unlock with its passphrase, or reset sync.",
      );
    }
    return Response.json({ ok: true }, { status: 201 });
  }

  // Reset: the existence check runs inside the batch, so the status code
  // reflects the state the replace actually saw.
  const [existing] = await db.batch([
    db.select({ userId: syncKeys.userId }).from(syncKeys).where(eq(syncKeys.userId, userId)),
    ensureState,
    db
      .insert(syncKeys)
      .values({ userId, wrappedKey, kdf: kdfJson, createdAt: now, updatedAt: now })
      .onConflictDoUpdate({
        target: syncKeys.userId,
        set: { wrappedKey, kdf: kdfJson, createdAt: now, updatedAt: now },
      }),
    db.delete(syncRecords).where(eq(syncRecords.userId, userId)),
    db.update(syncState).set({ totalBytes: 0 }).where(eq(syncState.userId, userId)),
  ]);
  return Response.json({ ok: true }, { status: existing.length ? 200 : 201 });
}

// ---------------------------------------------------------------------------
// Records
// ---------------------------------------------------------------------------

type RecordRow = typeof syncRecords.$inferSelect;

/** A record as /changes and push conflicts send it. */
function wireRecord(r: RecordRow) {
  return {
    id: r.id,
    kind: r.kind,
    version: r.version,
    deleted: r.deleted,
    ciphertext: r.deleted ? null : r.ciphertext,
    updated_at: r.updatedAt.getTime(),
    seq: r.seq,
  };
}

/** GET /api/sync/changes?since=<seq>&limit=<1..500> */
export async function syncChanges(userId: string, url: URL): Promise<Response> {
  const sinceRaw = url.searchParams.get("since") ?? "0";
  const limitRaw = url.searchParams.get("limit") ?? String(MAX_CHANGES_LIMIT);
  if (!/^\d{1,15}$/.test(sinceRaw) || !/^\d{1,6}$/.test(limitRaw)) {
    return apiError(400, "invalid_request", "since and limit must be non-negative integers.");
  }
  const since = Number(sinceRaw);
  const limit = Math.min(MAX_CHANGES_LIMIT, Math.max(1, Number(limitRaw)));

  // Size the page first (seq + length only), so one page never pulls more
  // ciphertext than a Worker comfortably holds. At least one record always fits.
  const sizes = await db
    .select({
      seq: syncRecords.seq,
      chars: sql<number>`coalesce(length(${syncRecords.ciphertext}), 0)`,
    })
    .from(syncRecords)
    .where(and(eq(syncRecords.userId, userId), gt(syncRecords.seq, since)))
    .orderBy(asc(syncRecords.seq))
    .limit(limit + 1);

  let take = 0;
  let chars = 0;
  while (take < Math.min(limit, sizes.length)) {
    chars += sizes[take]!.chars;
    if (take > 0 && chars > CHANGES_PAGE_CHARS) break;
    take++;
  }
  const more = sizes.length > take;

  const rows = take
    ? await db
        .select()
        .from(syncRecords)
        .where(
          and(
            eq(syncRecords.userId, userId),
            gt(syncRecords.seq, since),
            lte(syncRecords.seq, sizes[take - 1]!.seq),
          ),
        )
        .orderBy(asc(syncRecords.seq))
    : [];

  return Response.json(
    {
      records: rows.map(wireRecord),
      next_since: rows.length ? rows[rows.length - 1]!.seq : since,
      more,
    },
    { headers: { "cache-control": "no-store" } },
  );
}

type PushRecord = {
  id: string;
  kind: SyncKind;
  version: number;
  deleted: boolean;
  ciphertext: string | null;
};

/** Validate one pushed record; a string is the error response's (code, message). */
function parsePushRecord(value: unknown, index: number): PushRecord | [string, string] {
  const at = `records[${index}]`;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return ["invalid_request", `${at} must be an object.`];
  }
  const r = value as Record<string, unknown>;
  if (typeof r.id !== "string" || !ID_RE.test(r.id)) {
    return ["invalid_id", `${at}.id must be 1-128 characters of A-Z, a-z, 0-9, _ or -.`];
  }
  if (typeof r.kind !== "string" || !(SYNC_KINDS as readonly string[]).includes(r.kind)) {
    return ["invalid_kind", `${at}.kind must be one of ${SYNC_KINDS.join(", ")}.`];
  }
  if (typeof r.version !== "number" || !Number.isSafeInteger(r.version) || r.version < 1) {
    return ["invalid_request", `${at}.version must be a positive integer.`];
  }
  if (typeof r.deleted !== "boolean") {
    return ["invalid_request", `${at}.deleted must be a boolean.`];
  }
  if (r.deleted) {
    if (r.ciphertext !== null && r.ciphertext !== undefined) {
      return ["invalid_request", `${at}: a deleted record has no ciphertext (send null).`];
    }
    return {
      id: r.id,
      kind: r.kind as SyncKind,
      version: r.version,
      deleted: true,
      ciphertext: null,
    };
  }
  if (typeof r.ciphertext !== "string" || r.ciphertext.length === 0) {
    return ["invalid_request", `${at}.ciphertext is required unless the record is deleted.`];
  }
  if (r.ciphertext.length > MAX_CIPHERTEXT_CHARS) {
    return [
      "record_too_large",
      `${at}.ciphertext is over ${MAX_CIPHERTEXT_CHARS.toLocaleString("en-US")} characters.`,
    ];
  }
  if (!B64URL_RE.test(r.ciphertext)) {
    return ["invalid_request", `${at}.ciphertext must be base64url.`];
  }
  return {
    id: r.id,
    kind: r.kind as SyncKind,
    version: r.version,
    deleted: false,
    ciphertext: r.ciphertext,
  };
}

const quotaExceeded = () =>
  apiError(
    413,
    "quota_exceeded",
    `Sync storage is full (${SYNC_QUOTA_BYTES / 1024 / 1024} MB per account). Delete some synced items, or reset sync.`,
  );

/** True for the sync_state quota CHECK failing (D1 wraps the SQLite error). */
function isQuotaViolation(err: unknown): boolean {
  for (let e: unknown = err; e; e = (e as { cause?: unknown }).cause) {
    if (e instanceof Error && /CHECK constraint failed/i.test(e.message)) return true;
  }
  return false;
}

/** POST /api/sync/push */
export async function syncPush(userId: string, body: Record<string, unknown>): Promise<Response> {
  if (!Array.isArray(body.records)) {
    return apiError(400, "invalid_request", "records must be an array.");
  }
  if (body.records.length > MAX_PUSH_RECORDS) {
    return apiError(400, "too_many_records", `Push at most ${MAX_PUSH_RECORDS} records at a time.`);
  }
  const records: PushRecord[] = [];
  for (const [i, value] of body.records.entries()) {
    const parsed = parsePushRecord(value, i);
    if (Array.isArray(parsed)) {
      const [code, message] = parsed;
      return apiError(code === "record_too_large" ? 413 : 400, code, message);
    }
    records.push(parsed);
  }
  if (records.length === 0) return Response.json({ accepted: [], conflicts: [] });

  // Records are encrypted with the account's sync key; without one nothing
  // pushed could ever be read on another device.
  const [key] = await db
    .select({ userId: syncKeys.userId })
    .from(syncKeys)
    .where(eq(syncKeys.userId, userId))
    .limit(1);
  if (!key) return apiError(404, "no_sync_key", "Set up sync (PUT /api/sync/key) before pushing.");

  const now = Date.now();
  // The version check, shared by both statements of a record. Each runs
  // against the same state: nothing else writes in between inside the batch.
  const accepts = (r: PushRecord) => sql`${r.version} = coalesce(
      (select ${syncRecords.version} from ${syncRecords}
        where ${syncRecords.userId} = ${userId} and ${syncRecords.id} = ${r.id}), 0) + 1`;

  const excluded = (column: string) => sql.raw(`excluded.${column}`);
  const statements = records.flatMap((r) => [
    // 1. Take the next seq and account the bytes (old ciphertext out, new in).
    //    The quota CHECK on sync_state fails the whole batch if this goes over.
    db
      .update(syncState)
      .set({
        lastSeq: sql`${syncState.lastSeq} + 1`,
        totalBytes: sql`${syncState.totalBytes} + ${r.ciphertext?.length ?? 0} - coalesce(
          (select length(${syncRecords.ciphertext}) from ${syncRecords}
            where ${syncRecords.userId} = ${userId} and ${syncRecords.id} = ${r.id}), 0)`,
      })
      .where(and(eq(syncState.userId, userId), accepts(r))),
    // 2. Write the record with that seq. No row back means a conflict.
    db
      .insert(syncRecords)
      .select(
        sql`select ${userId}, ${r.id}, ${r.kind}, ${r.version}, ${r.deleted ? 1 : 0},
          ${r.ciphertext}, ${now},
          (select ${syncState.lastSeq} from ${syncState} where ${syncState.userId} = ${userId})
        where ${accepts(r)}`,
      )
      .onConflictDoUpdate({
        target: [syncRecords.userId, syncRecords.id],
        set: {
          kind: excluded("kind"),
          version: excluded("version"),
          deleted: excluded("deleted"),
          ciphertext: excluded("ciphertext"),
          updatedAt: excluded("updated_at"),
          seq: excluded("seq"),
        },
      })
      .returning({ id: syncRecords.id, version: syncRecords.version, seq: syncRecords.seq }),
  ]);

  let results: unknown[];
  try {
    results = await db.batch([
      db.insert(syncState).values({ userId }).onConflictDoNothing(),
      ...statements,
    ]);
  } catch (err) {
    if (isQuotaViolation(err)) return quotaExceeded();
    throw err;
  }

  const accepted: { id: string; version: number; seq: number }[] = [];
  const rejected: PushRecord[] = [];
  records.forEach((r, i) => {
    // Results: [ensure state, (update, insert) per record].
    const rows = results[2 + i * 2] as { id: string; version: number; seq: number }[];
    if (rows[0]) accepted.push({ id: rows[0].id, version: rows[0].version, seq: rows[0].seq });
    else rejected.push(r);
  });

  return Response.json({ accepted, conflicts: await currentRecords(userId, rejected) });
}

/**
 * The server's copy of each conflicting record. A record the server doesn't
 * have (the client sent version > 1 for a missing id, e.g. after a reset)
 * comes back as a version-0 tombstone with updated_at 0, so the client sees
 * `current_version = 0` and loses no data to it.
 */
async function currentRecords(userId: string, rejected: PushRecord[]) {
  const ids = [...new Set(rejected.map((r) => r.id))];
  const found = new Map<string, RecordRow>();
  for (let i = 0; i < ids.length; i += IN_CHUNK) {
    const rows = await db
      .select()
      .from(syncRecords)
      .where(
        and(eq(syncRecords.userId, userId), inArray(syncRecords.id, ids.slice(i, i + IN_CHUNK))),
      );
    for (const row of rows) found.set(row.id, row);
  }
  const seen = new Set<string>();
  return rejected.flatMap((r) => {
    if (seen.has(r.id)) return [];
    seen.add(r.id);
    const row = found.get(r.id);
    return [
      row
        ? wireRecord(row)
        : {
            id: r.id,
            kind: r.kind,
            version: 0,
            deleted: true,
            ciphertext: null,
            updated_at: 0,
            seq: 0,
          },
    ];
  });
}

// ---------------------------------------------------------------------------
// Account page
// ---------------------------------------------------------------------------

export async function syncStatus(userId: string) {
  const [[key], [state], kinds, [activity]] = await db.batch([
    db.select({ createdAt: syncKeys.createdAt }).from(syncKeys).where(eq(syncKeys.userId, userId)),
    db
      .select({ totalBytes: syncState.totalBytes })
      .from(syncState)
      .where(eq(syncState.userId, userId)),
    db
      .select({ kind: syncRecords.kind, count: count() })
      .from(syncRecords)
      .where(and(eq(syncRecords.userId, userId), eq(syncRecords.deleted, false)))
      .groupBy(syncRecords.kind),
    db
      .select({ last: max(syncRecords.updatedAt) })
      .from(syncRecords)
      .where(eq(syncRecords.userId, userId)),
  ]);
  return {
    setUp: !!key,
    keyCreatedAt: key?.createdAt ?? null,
    lastActivity: activity?.last ?? null,
    counts: Object.fromEntries(kinds.map((k) => [k.kind, k.count])) as Partial<
      Record<SyncKind, number>
    >,
    usedBytes: state?.totalBytes ?? 0,
    quotaBytes: SYNC_QUOTA_BYTES,
  };
}

/** "Reset sync" on the account page: the key and every record, in one go. */
export async function resetSync(userId: string) {
  await db.batch([
    db.delete(syncKeys).where(eq(syncKeys.userId, userId)),
    db.delete(syncRecords).where(eq(syncRecords.userId, userId)),
    db.update(syncState).set({ totalBytes: 0 }).where(eq(syncState.userId, userId)),
  ]);
}
