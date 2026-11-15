import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth.schema";

/**
 * Share links. Only metadata lives here: the content is end-to-end encrypted
 * in the app, uploaded to R2 under the same id, and its key is the link's
 * #fragment, which browsers never send. The server can count and expire a
 * share; it can't read one.
 */
export const shares = sqliteTable(
  "shares",
  {
    /** 12 characters of base62, also the R2 object key. */
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** "table" | "result" | "query" | "erd" | "mermaid" | "chart", for the viewer to pick a renderer. */
    kind: text("kind").notNull(),
    /** Ciphertext size in bytes. */
    size: integer("size").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    /** Views allowed in total (burn after reading is 1); null is unlimited. */
    maxViews: integer("max_views"),
    views: integer("views").notNull().default(0),
    /** Base64 PBKDF2 salt when the sharer set a password; null otherwise. */
    passwordSalt: text("password_salt"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    lastViewedAt: integer("last_viewed_at", { mode: "timestamp_ms" }),
    revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
  },
  (t) => [index("shares_owner_idx").on(t.ownerId), index("shares_expires_idx").on(t.expiresAt)],
);
