import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { user } from "./auth.schema";

/**
 * Scheduled backups (Pro). The desktop app runs them: it holds the database
 * credentials, and an S3 destination's keys stay in its keychain. The server
 * keeps the schedule, the history, and the files sent to Stroke Cloud (R2).
 */
export const backupJobs = sqliteTable(
  "backup_jobs",
  {
    /** Chosen by the app (a UUID), so a retried create is the same job. */
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** The app's saved-connection id; only the app can resolve it. */
    connectionId: text("connection_id").notNull(),
    /** Shown on the website: the connection's name as the app sent it. */
    label: text("label").notNull(),
    driver: text("driver").notNull(),
    /** Five-field cron, read in `timezone`. At most one run an hour. */
    cron: text("cron").notNull(),
    timezone: text("timezone").notNull().default("UTC"),
    /** "stroke" (R2) or "s3" (the user's own bucket). */
    destination: text("destination").notNull(),
    /** S3 bucket, endpoint and key prefix, for display. Never the keys. */
    s3Bucket: text("s3_bucket"),
    s3Endpoint: text("s3_endpoint"),
    s3Prefix: text("s3_prefix"),
    /** Successful backups kept on Stroke Cloud; older ones are deleted. */
    keep: integer("keep").notNull().default(7),
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
    /** "Run now" from the website or another device; the app picks it up. */
    runRequestedAt: integer("run_requested_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [index("backup_jobs_user_idx").on(t.userId)],
);

/**
 * One run of a job. `slot` is the schedule tick it is for (ISO time) or
 * `manual:<ms>`; the unique index makes two devices racing for the same tick
 * end with one run.
 */
export const backupRuns = sqliteTable(
  "backup_runs",
  {
    id: text("id").primaryKey(),
    jobId: text("job_id")
      .notNull()
      .references(() => backupJobs.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    slot: text("slot").notNull(),
    /** "running" | "success" | "failed". */
    status: text("status").notNull(),
    destination: text("destination").notNull(),
    /** R2 key (stroke) or the object key in the user's bucket (s3). */
    objectKey: text("object_key"),
    /** R2 multipart upload in progress, and its parts as JSON. */
    uploadId: text("upload_id"),
    parts: text("parts"),
    bytes: integer("bytes").notNull().default(0),
    tables: integer("tables").notNull().default(0),
    rows: integer("rows").notNull().default(0),
    error: text("error"),
    /** Encrypted on the user's computer (see src/lib/backups/crypto.ts). */
    encrypted: integer("encrypted", { mode: "boolean" }).notNull().default(false),
    /** Which sync key wrapped the data key: 16 hex characters. */
    keyId: text("key_id"),
    /** base64url of the 72-byte wrapped data key. Useless without the sync key. */
    wrappedKey: text("wrapped_key"),
    deviceName: text("device_name"),
    startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
    finishedAt: integer("finished_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    uniqueIndex("backup_runs_job_slot_idx").on(t.jobId, t.slot),
    index("backup_runs_user_idx").on(t.userId, t.startedAt),
  ],
);
