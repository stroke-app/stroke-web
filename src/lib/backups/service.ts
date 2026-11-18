import "@tanstack/react-start/server-only";
import { env } from "cloudflare:workers";
import { Cron } from "croner";
import { and, desc, eq, inArray, lt, sql } from "drizzle-orm";

import { auth } from "#/lib/auth/auth";
import { db } from "#/lib/db";
import { backupJobs, backupRuns } from "#/lib/db/schema";
import { accountHasPaidPro, authenticateDesktop, paidProRequired } from "#/lib/desktop/service";

/**
 * Scheduled backups. The desktop app runs every job (it holds the database
 * credentials); this keeps the schedule and history, and stores the files
 * sent to Stroke Cloud in R2. See src/lib/db/schema/backups.schema.ts.
 */

export const MAX_JOBS = 10;
/** Stroke Cloud storage per account. */
export const QUOTA_BYTES = 5 * 1024 ** 3;
export const MAX_KEEP = 30;
/** A run still "running" after this is treated as failed (the app was closed). */
const STALE_MS = 6 * 60 * 60 * 1000;
const DRIVERS = new Set(["postgres", "mysql", "sqlite", "d1", "libsql", "duckdb", "mssql"]);

type Caller = { userId: string; email: string; deviceName: string | null; desktop: boolean };

export function apiError(status: number, code: string, message: string): Response {
  return Response.json({ error: code, message }, { status });
}

/** The app's bearer token, or a website session. */
export async function caller(request: Request): Promise<Caller | null> {
  const desktop = await authenticateDesktop(request);
  if (desktop) {
    return {
      userId: desktop.user.id,
      email: desktop.user.email,
      deviceName: desktop.token.deviceName ?? null,
      desktop: true,
    };
  }
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null);
  if (!session) return null;
  return { userId: session.user.id, email: session.user.email, deviceName: null, desktop: false };
}

export const signInRequired = () => apiError(401, "unauthorized", "Sign in to Stroke.");

async function requirePro(c: Caller): Promise<Response | null> {
  if (await accountHasPaidPro(c.userId, c.email)) return null;
  return paidProRequired("Scheduled backups");
}

/** Rejects crons that can't be read or would run more than once an hour. */
export function checkCron(expr: string, timezone: string): string | null {
  const fields = expr.trim().split(/\s+/);
  if (fields.length !== 5) return "Use a five-field cron, like 0 3 * * * (every day at 03:00).";
  let job: Cron;
  try {
    job = new Cron(expr, { timezone, paused: true });
  } catch (e) {
    return `That schedule isn't valid: ${e instanceof Error ? e.message : String(e)}`;
  }
  const runs = job.nextRuns(6);
  for (let i = 1; i < runs.length; i++) {
    if (runs[i]!.getTime() - runs[i - 1]!.getTime() < 55 * 60 * 1000) {
      return "Scheduled backups run at most once an hour.";
    }
  }
  return null;
}

function nextRun(expr: string, timezone: string): number | null {
  try {
    return new Cron(expr, { timezone, paused: true }).nextRun()?.getTime() ?? null;
  } catch {
    return null;
  }
}

type RunRow = typeof backupRuns.$inferSelect;
type StoredPart = { partNumber: number; etag: string; size: number };
type JobRow = typeof backupJobs.$inferSelect;

function publicRun(r: RunRow) {
  const stale = r.status === "running" && Date.now() - r.startedAt.getTime() > STALE_MS;
  return {
    id: r.id,
    slot: r.slot,
    status: stale ? "failed" : r.status,
    destination: r.destination,
    object_key: r.objectKey,
    bytes: r.bytes,
    tables: r.tables,
    rows: r.rows,
    error: stale ? "The app stopped before the backup finished." : r.error,
    encrypted: r.encrypted,
    key_id: r.keyId,
    wrapped_key: r.wrappedKey,
    device_name: r.deviceName,
    started_at: r.startedAt.getTime(),
    finished_at: r.finishedAt?.getTime() ?? null,
  };
}

function publicJob(j: JobRow, runs: RunRow[]) {
  return {
    id: j.id,
    connection_id: j.connectionId,
    label: j.label,
    driver: j.driver,
    cron: j.cron,
    timezone: j.timezone,
    destination: j.destination,
    s3_bucket: j.s3Bucket,
    s3_endpoint: j.s3Endpoint,
    s3_prefix: j.s3Prefix,
    keep: j.keep,
    enabled: j.enabled,
    run_requested_at: j.runRequestedAt?.getTime() ?? null,
    created_at: j.createdAt.getTime(),
    next_run_at: j.enabled ? nextRun(j.cron, j.timezone) : null,
    runs: runs.map(publicRun),
  };
}

async function storedBytes(userId: string): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${backupRuns.bytes}), 0)` })
    .from(backupRuns)
    .where(
      and(
        eq(backupRuns.userId, userId),
        eq(backupRuns.destination, "stroke"),
        eq(backupRuns.status, "success"),
      ),
    );
  return Number(row?.total ?? 0);
}

/** GET /api/backups/jobs: every job with its last 20 runs, and the storage used. */
export async function listJobs(c: Caller): Promise<Response> {
  const jobs = await db
    .select()
    .from(backupJobs)
    .where(eq(backupJobs.userId, c.userId))
    .orderBy(backupJobs.createdAt);
  const runs = jobs.length
    ? await db
        .select()
        .from(backupRuns)
        .where(
          inArray(
            backupRuns.jobId,
            jobs.map((j) => j.id),
          ),
        )
        .orderBy(desc(backupRuns.startedAt))
    : [];
  const byJob = new Map<string, RunRow[]>();
  for (const r of runs) {
    const list = byJob.get(r.jobId) ?? [];
    if (list.length < 20) list.push(r);
    byJob.set(r.jobId, list);
  }
  return Response.json({
    jobs: jobs.map((j) => publicJob(j, byJob.get(j.id) ?? [])),
    max_jobs: MAX_JOBS,
    used_bytes: await storedBytes(c.userId),
    quota_bytes: QUOTA_BYTES,
    pro: await accountHasPaidPro(c.userId, c.email),
  });
}

const str = (v: unknown, max = 512) =>
  typeof v === "string" && v.trim() && v.length <= max ? v.trim() : null;

/** POST /api/backups/jobs (app only): create or update a job. */
export async function saveJob(c: Caller, body: Record<string, unknown>): Promise<Response> {
  if (!c.desktop) return apiError(403, "app_only", "Create backup jobs from the Stroke app.");
  const denied = await requirePro(c);
  if (denied) return denied;

  const id = str(body.id, 64);
  const connectionId = str(body.connection_id, 128);
  const label = str(body.label, 200);
  const driver = str(body.driver, 32);
  const cron = str(body.cron, 120);
  const timezone = str(body.timezone, 64) ?? "UTC";
  const destination = body.destination === "s3" ? "s3" : "stroke";
  const keep = Math.min(MAX_KEEP, Math.max(1, Math.floor(Number(body.keep) || 7)));
  if (!id || !connectionId || !label || !driver || !cron) {
    return apiError(
      400,
      "invalid_request",
      "id, connection_id, label, driver and cron are required.",
    );
  }
  if (!DRIVERS.has(driver)) {
    return apiError(400, "unsupported_driver", `Scheduled backups don't support ${driver} yet.`);
  }
  const cronError = checkCron(cron, timezone);
  if (cronError) return apiError(400, "invalid_cron", cronError);
  const s3Bucket = destination === "s3" ? str(body.s3_bucket, 255) : null;
  if (destination === "s3" && !s3Bucket) {
    return apiError(400, "invalid_request", "Name the S3 bucket.");
  }

  const [existing] = await db.select().from(backupJobs).where(eq(backupJobs.id, id)).limit(1);
  if (existing && existing.userId !== c.userId) {
    return apiError(409, "conflict", "That job id is taken.");
  }
  if (!existing) {
    const [{ n }] = await db
      .select({ n: sql<number>`count(*)` })
      .from(backupJobs)
      .where(eq(backupJobs.userId, c.userId));
    if (Number(n) >= MAX_JOBS) {
      return apiError(
        409,
        "job_limit",
        `You have ${MAX_JOBS} scheduled backups, the most a Pro account can have. Delete one first.`,
      );
    }
  }

  const values = {
    connectionId,
    label,
    driver,
    cron,
    timezone,
    destination,
    s3Bucket,
    s3Endpoint: destination === "s3" ? str(body.s3_endpoint, 255) : null,
    s3Prefix: destination === "s3" ? str(body.s3_prefix, 255) : null,
    keep,
    enabled: body.enabled !== false,
    updatedAt: new Date(),
  };
  if (existing) {
    await db.update(backupJobs).set(values).where(eq(backupJobs.id, id));
  } else {
    await db.insert(backupJobs).values({ id, userId: c.userId, ...values });
  }
  return listJobs(c);
}

async function ownJob(c: Caller, id: string): Promise<JobRow | null> {
  const [job] = await db
    .select()
    .from(backupJobs)
    .where(and(eq(backupJobs.id, id), eq(backupJobs.userId, c.userId)))
    .limit(1);
  return job ?? null;
}

const notFound = () => apiError(404, "not_found", "No such backup job.");

/** PATCH /api/backups/jobs/:id: pause, resume, or ask for a run now. */
export async function patchJob(
  c: Caller,
  id: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const job = await ownJob(c, id);
  if (!job) return notFound();
  const set: Partial<JobRow> = { updatedAt: new Date() };
  if (typeof body.enabled === "boolean") set.enabled = body.enabled;
  if (body.run_now === true) {
    const denied = await requirePro(c);
    if (denied) return denied;
    set.runRequestedAt = new Date();
  }
  await db.update(backupJobs).set(set).where(eq(backupJobs.id, id));
  return listJobs(c);
}

/** DELETE /api/backups/jobs/:id: the job, its history and its Stroke Cloud files. */
export async function deleteJob(c: Caller, id: string): Promise<Response> {
  const job = await ownJob(c, id);
  if (!job) return notFound();
  const runs = await db.select().from(backupRuns).where(eq(backupRuns.jobId, id));
  await deleteObjects(runs);
  await db.delete(backupJobs).where(eq(backupJobs.id, id));
  return listJobs(c);
}

async function deleteObjects(runs: RunRow[]) {
  const keys = runs
    .filter((r) => r.destination === "stroke" && r.objectKey)
    .map((r) => r.objectKey!);
  for (let i = 0; i < keys.length; i += 500) await env.BACKUPS.delete(keys.slice(i, i + 500));
  for (const r of runs) {
    if (r.uploadId && r.objectKey && r.status === "running") {
      await env.BACKUPS.resumeMultipartUpload(r.objectKey, r.uploadId)
        .abort()
        .catch(() => {});
    }
  }
}

/**
 * POST /api/backups/runs (app only): claim a schedule tick (or a requested
 * run) for a job. 409 `claimed` when another device already has it.
 */
export async function startRun(c: Caller, body: Record<string, unknown>): Promise<Response> {
  if (!c.desktop) return apiError(403, "app_only", "Backups run from the Stroke app.");
  const denied = await requirePro(c);
  if (denied) return denied;
  const job = await ownJob(c, str(body.job_id, 64) ?? "");
  if (!job) return notFound();
  const slot = str(body.slot, 64);
  if (!slot) return apiError(400, "invalid_request", "slot is required.");
  const encrypted = body.encrypted === true;
  // Stroke Cloud only takes ciphertext: an app that can't encrypt is refused,
  // so a plain backup never reaches our storage.
  if (job.destination === "stroke" && !encrypted) {
    return apiError(
      426,
      "encryption_required",
      "Backups to Stroke Cloud are end-to-end encrypted. Update Stroke and set up sync on this computer.",
    );
  }

  if (job.destination === "stroke" && (await storedBytes(c.userId)) >= QUOTA_BYTES) {
    return apiError(
      409,
      "quota",
      "Stroke Cloud backup storage is full (5 GB). Keep fewer backups, delete some, or use your own S3 bucket.",
    );
  }

  const id = crypto.randomUUID();
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  const objectKey =
    job.destination === "stroke" ? `${c.userId}/${job.id}/${stamp}.sql.gz.stroke` : null;
  const inserted = await db
    .insert(backupRuns)
    .values({
      id,
      jobId: job.id,
      userId: c.userId,
      slot,
      status: "running",
      destination: job.destination,
      objectKey,
      encrypted,
      deviceName: c.deviceName,
      startedAt: now,
    })
    .onConflictDoNothing()
    .returning({ id: backupRuns.id });
  if (!inserted.length) {
    return apiError(409, "claimed", "Another device already ran this backup.");
  }
  if (slot.startsWith("manual:")) {
    await db.update(backupJobs).set({ runRequestedAt: null }).where(eq(backupJobs.id, job.id));
  }
  if (objectKey) {
    const upload = await env.BACKUPS.createMultipartUpload(objectKey, {
      httpMetadata: { contentType: "application/octet-stream" },
    });
    await db
      .update(backupRuns)
      .set({ uploadId: upload.uploadId, parts: "[]" })
      .where(eq(backupRuns.id, id));
  }
  return Response.json(
    { id, destination: job.destination, object_key: objectKey },
    { status: 201 },
  );
}

async function ownRun(c: Caller, id: string): Promise<RunRow | null> {
  const [run] = await db
    .select()
    .from(backupRuns)
    .where(and(eq(backupRuns.id, id), eq(backupRuns.userId, c.userId)))
    .limit(1);
  return run ?? null;
}

const runNotFound = () => apiError(404, "not_found", "No such backup run.");

/** PUT /api/backups/runs/:id/parts/:n (app only): one part of the Stroke Cloud upload. */
export async function uploadPart(
  c: Caller,
  id: string,
  n: number,
  request: Request,
): Promise<Response> {
  if (!c.desktop) return apiError(403, "app_only", "Backups upload from the Stroke app.");
  const run = await ownRun(c, id);
  if (!run) return runNotFound();
  if (run.status !== "running" || !run.uploadId || !run.objectKey) {
    return apiError(409, "not_uploading", "This run isn't taking uploads.");
  }
  if (!Number.isInteger(n) || n < 1 || n > 10_000) {
    return apiError(400, "invalid_part", "Part numbers run from 1 to 10000.");
  }
  const data = await request.arrayBuffer();
  if (data.byteLength === 0) return apiError(400, "invalid_part", "Empty part.");
  const part = await env.BACKUPS.resumeMultipartUpload(run.objectKey, run.uploadId).uploadPart(
    n,
    data,
  );
  // A retried part replaces the earlier one, so its size counts once.
  const parts = (JSON.parse(run.parts ?? "[]") as StoredPart[]).filter((p) => p.partNumber !== n);
  parts.push({ partNumber: part.partNumber, etag: part.etag, size: data.byteLength });
  await db
    .update(backupRuns)
    .set({ parts: JSON.stringify(parts), bytes: parts.reduce((sum, p) => sum + p.size, 0) })
    .where(eq(backupRuns.id, id));
  return new Response(null, { status: 204 });
}

/**
 * PATCH /api/backups/runs/:id (app only): the run finished. On success a
 * Stroke Cloud upload is completed and old backups past `keep` are deleted.
 */
export async function finishRun(
  c: Caller,
  id: string,
  body: Record<string, unknown>,
): Promise<Response> {
  if (!c.desktop) return apiError(403, "app_only", "Backups run from the Stroke app.");
  const run = await ownRun(c, id);
  if (!run) return runNotFound();
  if (run.status !== "running") return apiError(409, "finished", "This run already finished.");

  const ok = body.status === "success";
  const set: Partial<RunRow> = {
    status: ok ? "success" : "failed",
    finishedAt: new Date(),
    tables: Math.max(0, Math.floor(Number(body.tables) || 0)),
    rows: Math.max(0, Math.floor(Number(body.rows) || 0)),
    error: ok ? null : (str(body.error, 2000) ?? "The backup failed."),
    uploadId: null,
    parts: null,
  };
  if (ok && run.encrypted) {
    const keyId = str(body.key_id, 32);
    const wrappedKey = str(body.wrapped_key, 200);
    if (!keyId || !/^[0-9a-f]{16}$/.test(keyId) || !wrappedKey) {
      return apiError(400, "invalid_request", "An encrypted backup needs key_id and wrapped_key.");
    }
    set.keyId = keyId;
    set.wrappedKey = wrappedKey;
  }
  if (run.destination === "s3") {
    set.objectKey = str(body.object_key, 1024);
    set.bytes = Math.max(0, Math.floor(Number(body.bytes) || 0));
  }

  if (run.destination === "stroke" && run.uploadId && run.objectKey) {
    const upload = env.BACKUPS.resumeMultipartUpload(run.objectKey, run.uploadId);
    const parts = (JSON.parse(run.parts ?? "[]") as StoredPart[])
      .sort((a, b) => a.partNumber - b.partNumber)
      .map(({ partNumber, etag }) => ({ partNumber, etag }));
    if (ok && parts.length) {
      try {
        await upload.complete(parts);
      } catch (e) {
        set.status = "failed";
        set.error = `The upload couldn't be finished: ${e instanceof Error ? e.message : String(e)}`;
      }
    } else {
      await upload.abort().catch(() => {});
      if (ok) {
        set.status = "failed";
        set.error = "Nothing was uploaded.";
      }
    }
    if (set.status === "failed") {
      set.objectKey = null;
      set.bytes = 0;
    }
  }
  await db.update(backupRuns).set(set).where(eq(backupRuns.id, id));
  if (set.status === "success") await prune(run.jobId);
  return listJobs(c);
}

/** Keep the newest `keep` successful runs of a job; delete the rest and their files. */
async function prune(jobId: string) {
  const [job] = await db.select().from(backupJobs).where(eq(backupJobs.id, jobId)).limit(1);
  if (!job) return;
  const ok = await db
    .select()
    .from(backupRuns)
    .where(and(eq(backupRuns.jobId, jobId), eq(backupRuns.status, "success")))
    .orderBy(desc(backupRuns.startedAt));
  const old = ok.slice(job.keep);
  // Failed runs older than the oldest kept backup are just noise.
  const floor = ok[Math.min(job.keep, ok.length) - 1]?.startedAt;
  if (old.length) {
    await deleteObjects(old);
    await db.delete(backupRuns).where(
      inArray(
        backupRuns.id,
        old.map((r) => r.id),
      ),
    );
  }
  if (floor) {
    await db
      .delete(backupRuns)
      .where(
        and(
          eq(backupRuns.jobId, jobId),
          eq(backupRuns.status, "failed"),
          lt(backupRuns.startedAt, floor),
        ),
      );
  }
}

/** DELETE /api/backups/runs/:id: one backup and its Stroke Cloud file. */
export async function deleteRun(c: Caller, id: string): Promise<Response> {
  const run = await ownRun(c, id);
  if (!run) return runNotFound();
  await deleteObjects([run]);
  await db.delete(backupRuns).where(eq(backupRuns.id, id));
  return listJobs(c);
}

/** GET /api/backups/runs/:id/download: the .sql.gz from Stroke Cloud. */
export async function downloadRun(c: Caller, id: string): Promise<Response> {
  const run = await ownRun(c, id);
  if (!run) return runNotFound();
  if (run.destination !== "stroke" || run.status !== "success" || !run.objectKey) {
    return apiError(404, "no_file", "This backup has no file on Stroke Cloud.");
  }
  const obj = await env.BACKUPS.get(run.objectKey);
  if (!obj) return apiError(404, "no_file", "The backup file is gone.");
  const [job] = await db.select().from(backupJobs).where(eq(backupJobs.id, run.jobId)).limit(1);
  const name = `${(job?.label ?? "backup").replace(/[^\w.-]+/g, "-")}-${run.startedAt
    .toISOString()
    .slice(0, 16)
    .replace(/[:T]/g, "-")}.sql.gz${run.encrypted ? ".stroke" : ""}`;
  return new Response(obj.body, {
    headers: {
      "content-type": run.encrypted ? "application/octet-stream" : "application/gzip",
      "content-length": String(obj.size),
      "content-disposition": `attachment; filename="${name}"`,
      "cache-control": "no-store",
    },
  });
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const v = (await request.json()) as unknown;
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export const badJson = () => apiError(400, "invalid_json", "The request body isn't valid JSON.");

/** GET /api/backups/keys: every encrypted backup's wrapped key (for a re-wrap after a sync reset). */
export async function listKeys(c: Caller): Promise<Response> {
  const rows = await db
    .select({ id: backupRuns.id, keyId: backupRuns.keyId, wrappedKey: backupRuns.wrappedKey })
    .from(backupRuns)
    .where(and(eq(backupRuns.userId, c.userId), eq(backupRuns.encrypted, true)));
  return Response.json({
    keys: rows
      .filter((r) => r.keyId && r.wrappedKey)
      .map((r) => ({ id: r.id, key_id: r.keyId, wrapped_key: r.wrappedKey })),
  });
}

/** POST /api/backups/keys (app only): store keys re-wrapped under a new sync key. */
export async function rewrapKeys(c: Caller, body: Record<string, unknown>): Promise<Response> {
  if (!c.desktop) return apiError(403, "app_only", "Keys are re-wrapped by the Stroke app.");
  const keys = Array.isArray(body.keys) ? body.keys.slice(0, 1000) : null;
  if (!keys) return apiError(400, "invalid_request", "keys is required.");
  let updated = 0;
  for (const k of keys as Record<string, unknown>[]) {
    const id = str(k?.id, 64);
    const keyId = str(k?.key_id, 32);
    const wrappedKey = str(k?.wrapped_key, 200);
    if (!id || !keyId || !/^[0-9a-f]{16}$/.test(keyId) || !wrappedKey) continue;
    const res = await db
      .update(backupRuns)
      .set({ keyId, wrappedKey })
      .where(
        and(eq(backupRuns.id, id), eq(backupRuns.userId, c.userId), eq(backupRuns.encrypted, true)),
      )
      .returning({ id: backupRuns.id });
    updated += res.length;
  }
  return Response.json({ updated });
}
