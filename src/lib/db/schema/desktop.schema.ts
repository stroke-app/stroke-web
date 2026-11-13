import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth.schema";

/**
 * One-time codes minted by /desktop/sign-in and redeemed once at
 * POST /api/desktop/token. Only the SHA-256 of the code is stored; the code is
 * bound to the user, the PKCE challenge and the device that asked for it.
 */
export const desktopCodes = sqliteTable(
  "desktop_codes",
  {
    /** Hex SHA-256 of the code handed to the app. */
    codeHash: text("code_hash").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** base64url SHA-256 of the app's PKCE verifier (S256). */
    codeChallenge: text("code_challenge").notNull(),
    deviceId: text("device_id").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    usedAt: integer("used_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (t) => [index("desktop_codes_expires_at_idx").on(t.expiresAt)],
);

/**
 * Desktop session tokens: long-lived bearer tokens for the Stroke app, one per
 * signed-in device. Only the SHA-256 of the token is stored. Revoked from the
 * account page or by the app signing out.
 */
export const desktopTokens = sqliteTable(
  "desktop_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    deviceId: text("device_id").notNull(),
    deviceName: text("device_name"),
    /** "macos" | "windows" | "linux", as reported by the app. */
    os: text("os"),
    /** App version at sign-in, e.g. "2.4.0". */
    version: text("version"),
    /** Hex SHA-256 of the bearer token. Never the token itself. */
    tokenHash: text("token_hash").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    lastSeenAt: integer("last_seen_at", { mode: "timestamp_ms" }).notNull(),
    revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    index("desktop_tokens_user_id_idx").on(t.userId),
    index("desktop_tokens_user_device_idx").on(t.userId, t.deviceId),
  ],
);

/**
 * The account trial: one per person, not per device. Starts on the first
 * GET /api/me and runs for TRIAL_DAYS.
 */
export const userTrials = sqliteTable("user_trials", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
});

/**
 * Fixed-window request counters for the desktop auth endpoints. `key` names
 * the bucket and the caller (e.g. "token:ip:1.2.3.4"); `window` is the
 * window's start in unix seconds, so a new window is simply a new row.
 */
export const rateLimits = sqliteTable(
  "rate_limits",
  {
    key: text("key").notNull(),
    window: integer("window").notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.key, t.window] })],
);
