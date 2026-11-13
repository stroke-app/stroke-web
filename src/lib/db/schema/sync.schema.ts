import { sql } from "drizzle-orm";
import { check, index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth.schema";

/**
 * End-to-end encrypted sync (docs/accounts-and-sync.md, Appendix B). The
 * server only ever stores opaque strings: the sync key wrapped with the
 * user's passphrase, and records encrypted with that key.
 */

/** The account's wrapped sync key. One per user; replaced by "Reset sync". */
export const syncKeys = sqliteTable("sync_keys", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  /** base64url(nonce24 || XChaCha20-Poly1305(kek, nonce, sync_key)). */
  wrappedKey: text("wrapped_key").notNull(),
  /** JSON text: { alg: "argon2id", salt, m, t, p }. */
  kdf: text("kdf").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

/**
 * Encrypted records, last-writer-wins by `version`. `seq` comes from the
 * user's `sync_state.last_seq`, so pulls are a range scan on (user_id, seq).
 * Tombstones keep the row with `deleted = true` and no ciphertext.
 */
export const syncRecords = sqliteTable(
  "sync_records",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    kind: text("kind").notNull(),
    version: integer("version").notNull(),
    deleted: integer("deleted", { mode: "boolean" }).notNull().default(false),
    ciphertext: text("ciphertext"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    seq: integer("seq").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.id] }),
    index("sync_records_user_seq_idx").on(t.userId, t.seq),
  ],
);

/** Per-account sync quota: 50 MB of ciphertext. */
export const SYNC_QUOTA_BYTES = 50 * 1024 * 1024;

/**
 * Per-user sync counters. `last_seq` is the user's sequence (never reset, not
 * even by "Reset sync", so a device's `since` stays meaningful); `total_bytes`
 * is the ciphertext stored. The CHECK enforces the quota inside the push
 * batch itself: a push that would go over it fails as a whole, even when two
 * devices push at once. Changing the quota means a migration.
 */
export const syncState = sqliteTable(
  "sync_state",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    lastSeq: integer("last_seq").notNull().default(0),
    totalBytes: integer("total_bytes").notNull().default(0),
  },
  () => [check("sync_state_quota", sql`total_bytes <= ${sql.raw(String(SYNC_QUOTA_BYTES))}`)],
);
