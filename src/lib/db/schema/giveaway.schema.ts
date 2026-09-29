import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { user } from "./auth.schema";
import { licenses } from "./billing.schema";

/**
 * One row per user per giveaway week. `week` is the Monday (UTC) that opens
 * the week, as YYYY-MM-DD. The unique index is what makes "one entry per
 * week" hold even if the enter button is hit twice.
 */
export const giveawayEntries = sqliteTable(
  "giveaway_entries",
  {
    id: text("id").primaryKey(),
    week: text("week").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("giveaway_entries_week_user_uniq").on(table.week, table.userId),
    index("giveaway_entries_week_idx").on(table.week),
  ],
);

/**
 * The result of a week's draw. `week` is the primary key, so a week can only
 * ever be drawn once: a second cron run or a double admin call is a no-op.
 * `winnerUserId` is null when nobody eligible entered.
 */
export const giveawayDraws = sqliteTable("giveaway_draws", {
  week: text("week").primaryKey(),
  winnerUserId: text("winner_user_id").references(() => user.id, { onDelete: "set null" }),
  entryCount: integer("entry_count").notNull(),
  eligibleCount: integer("eligible_count").notNull(),
  licenseId: text("license_id").references(() => licenses.id, { onDelete: "set null" }),
  drawnAt: integer("drawn_at", { mode: "timestamp_ms" }).notNull(),
  notifiedAt: integer("notified_at", { mode: "timestamp_ms" }),
});

export const giveawayEntriesRelations = relations(giveawayEntries, ({ one }) => ({
  user: one(user, { fields: [giveawayEntries.userId], references: [user.id] }),
}));

export const giveawayDrawsRelations = relations(giveawayDraws, ({ one }) => ({
  winner: one(user, { fields: [giveawayDraws.winnerUserId], references: [user.id] }),
  license: one(licenses, { fields: [giveawayDraws.licenseId], references: [licenses.id] }),
}));
