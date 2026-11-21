import "@tanstack/react-start/server-only";
import { env } from "cloudflare:workers";
import { and, desc, eq, gt, isNull, or, sql } from "drizzle-orm";

import { userHasActiveLicense } from "#/lib/billing/service";
import { db } from "#/lib/db";
import { shares } from "#/lib/db/schema";

/**
 * Share links: the server stores ciphertext it cannot read and the rules for
 * handing it out (expiry, view limit, revocation). The app encrypts; the
 * viewer page decrypts with the key from the link's #fragment.
 */

export const SHARE_KINDS = ["table", "result", "query", "erd", "mermaid", "chart", "json"] as const;
export type ShareKind = (typeof SHARE_KINDS)[number];

/** What each plan may do. Row caps are applied in the app before encrypting. */
export const SHARE_PLANS = {
  free: {
    maxBytes: 1 * 1024 * 1024,
    maxActive: 5,
    maxExpirySeconds: 7 * 86400,
    never: false,
    password: false,
    rows: 1000,
  },
  pro: {
    maxBytes: 10 * 1024 * 1024,
    maxActive: Infinity,
    maxExpirySeconds: Infinity,
    never: true,
    password: true,
    rows: 100_000,
  },
} as const;
export type SharePlanId = keyof typeof SHARE_PLANS;

/** The expiries the app offers, in seconds; null is "never" (Pro). */
export const SHARE_EXPIRIES = [3600, 86400, 7 * 86400, 30 * 86400, null] as const;

export async function sharePlanFor(userId: string): Promise<SharePlanId> {
  return (await userHasActiveLicense(userId)) ? "pro" : "free";
}

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
/** 12 base62 characters: 71 bits, unguessable and short enough to read out. */
export function newShareId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  let out = "";
  for (const b of bytes) out += ALPHABET[b % 62];
  return out;
}

export function isShareId(id: string): boolean {
  return /^[0-9A-Za-z]{12}$/.test(id);
}

function bad(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export type CreateShareInput = {
  ownerId: string;
  kind: string;
  expiresIn: number | null;
  maxViews: number | null;
  passwordSalt: string | null;
  body: ArrayBuffer;
};

/** Validate against the owner's plan, store the ciphertext, return the id. */
export async function createShare(input: CreateShareInput): Promise<Response> {
  const plan = SHARE_PLANS[await sharePlanFor(input.ownerId)];
  if (!SHARE_KINDS.includes(input.kind as ShareKind))
    return bad(400, "invalid_kind", "Unknown share kind.");
  if (input.body.byteLength < 28) return bad(400, "invalid_body", "The share is empty.");
  if (input.body.byteLength > plan.maxBytes) {
    return bad(
      413,
      "too_large",
      plan === SHARE_PLANS.free
        ? "This share is over the free plan's 1 MB. Share fewer rows or columns, or upgrade to Pro for up to 10 MB."
        : "This share is over 10 MB. Share fewer rows or columns.",
    );
  }
  if (!SHARE_EXPIRIES.includes(input.expiresIn as (typeof SHARE_EXPIRIES)[number])) {
    return bad(400, "invalid_expiry", "Pick one of the offered expiries.");
  }
  if (input.expiresIn === null && !plan.never)
    return bad(402, "pro_required", "Links that never expire are part of Stroke Pro.");
  if (input.expiresIn !== null && input.expiresIn > plan.maxExpirySeconds) {
    return bad(
      402,
      "pro_required",
      "The free plan keeps links for up to 7 days. Stroke Pro keeps them longer.",
    );
  }
  if (input.passwordSalt !== null && !plan.password)
    return bad(402, "pro_required", "Password-protected links are part of Stroke Pro.");
  if (input.passwordSalt !== null && !/^[A-Za-z0-9+/=_-]{16,64}$/.test(input.passwordSalt)) {
    return bad(400, "invalid_salt", "Invalid password salt.");
  }
  if (
    input.maxViews !== null &&
    (!Number.isInteger(input.maxViews) || input.maxViews < 1 || input.maxViews > 10_000)
  ) {
    return bad(400, "invalid_views", "A view limit is between 1 and 10,000.");
  }

  const now = Date.now();
  if (Number.isFinite(plan.maxActive)) {
    const [row] = await db
      .select({ n: sql<number>`count(*)` })
      .from(shares)
      .where(
        and(
          eq(shares.ownerId, input.ownerId),
          isNull(shares.revokedAt),
          or(isNull(shares.expiresAt), gt(shares.expiresAt, new Date(now))),
        ),
      );
    if ((row?.n ?? 0) >= plan.maxActive) {
      return bad(
        402,
        "too_many",
        `The free plan keeps ${plan.maxActive} links active at a time. Revoke one in My shares, or upgrade to Pro for unlimited links.`,
      );
    }
  }

  const id = newShareId();
  await env.SHARES.put(id, input.body, {
    httpMetadata: { contentType: "application/octet-stream" },
  });
  await db.insert(shares).values({
    id,
    ownerId: input.ownerId,
    kind: input.kind,
    size: input.body.byteLength,
    expiresAt: input.expiresIn === null ? null : new Date(now + input.expiresIn * 1000),
    maxViews: input.maxViews,
    passwordSalt: input.passwordSalt,
  });
  return Response.json({ id, url: `https://stroke.click/s/${id}` }, { status: 201 });
}

type ShareRow = typeof shares.$inferSelect;

/** Why a share can't be shown any more, or null when it can. */
function goneReason(row: ShareRow | undefined, now = Date.now()): string | null {
  if (!row) return "This link doesn't exist.";
  if (row.revokedAt) return "The person who shared this link revoked it.";
  if (row.expiresAt && row.expiresAt.getTime() <= now) return "This link has expired.";
  if (row.maxViews !== null && row.views >= row.maxViews) {
    return row.maxViews === 1
      ? "This link could be opened once, and it has been."
      : "This link has reached its view limit.";
  }
  return null;
}

export async function getShareRow(id: string) {
  const [row] = await db.select().from(shares).where(eq(shares.id, id)).limit(1);
  return row;
}

/** Public metadata: enough to ask for a password and say how long it lasts. */
export async function shareMeta(id: string): Promise<Response> {
  if (!isShareId(id)) return bad(404, "not_found", "This link doesn't exist.");
  const row = await getShareRow(id);
  const gone = goneReason(row);
  if (gone || !row) return bad(410, "gone", gone ?? "This link doesn't exist.");
  return Response.json(
    {
      id: row.id,
      kind: row.kind,
      size: row.size,
      createdAt: row.createdAt.getTime(),
      expiresAt: row.expiresAt?.getTime() ?? null,
      viewsLeft: row.maxViews === null ? null : row.maxViews - row.views,
      passwordSalt: row.passwordSalt,
    },
    { headers: { "cache-control": "no-store" } },
  );
}

/**
 * The ciphertext, counting one view. The count is taken with a conditional
 * update first, so two people opening a burn-after-reading link at the same
 * moment can't both get it. A share that just used its last view is deleted
 * from storage.
 */
export async function shareContent(id: string): Promise<Response> {
  if (!isShareId(id)) return bad(404, "not_found", "This link doesn't exist.");
  const now = new Date();
  const [claimed] = await db
    .update(shares)
    .set({ views: sql`${shares.views} + 1`, lastViewedAt: now })
    .where(
      and(
        eq(shares.id, id),
        isNull(shares.revokedAt),
        or(isNull(shares.expiresAt), gt(shares.expiresAt, now)),
        or(isNull(shares.maxViews), sql`${shares.views} < ${shares.maxViews}`),
      ),
    )
    .returning();
  if (!claimed) {
    const row = await getShareRow(id);
    return bad(410, "gone", goneReason(row) ?? "This link can't be opened.");
  }
  const obj = await env.SHARES.get(id);
  if (!obj) return bad(410, "gone", "This share's content is no longer stored.");
  const body = await obj.arrayBuffer();
  if (claimed.maxViews !== null && claimed.views >= claimed.maxViews) await env.SHARES.delete(id);
  return new Response(body, {
    headers: {
      "content-type": "application/octet-stream",
      "cache-control": "no-store",
      "x-share-kind": claimed.kind,
    },
  });
}

/** The owner's shares, newest first, with view counts. */
export async function listShares(ownerId: string) {
  const rows = await db
    .select()
    .from(shares)
    .where(eq(shares.ownerId, ownerId))
    .orderBy(desc(shares.createdAt))
    .limit(200);
  const now = Date.now();
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    size: r.size,
    createdAt: r.createdAt.getTime(),
    expiresAt: r.expiresAt?.getTime() ?? null,
    maxViews: r.maxViews,
    views: r.views,
    lastViewedAt: r.lastViewedAt?.getTime() ?? null,
    hasPassword: r.passwordSalt !== null,
    revoked: r.revokedAt !== null,
    active: goneReason(r, now) === null,
  }));
}

export async function revokeShare(ownerId: string, id: string): Promise<Response> {
  if (!isShareId(id)) return bad(404, "not_found", "No such share.");
  const [row] = await db
    .update(shares)
    .set({ revokedAt: new Date() })
    .where(and(eq(shares.id, id), eq(shares.ownerId, ownerId)))
    .returning();
  if (!row) return bad(404, "not_found", "No such share.");
  await env.SHARES.delete(id);
  return new Response(null, { status: 204 });
}
