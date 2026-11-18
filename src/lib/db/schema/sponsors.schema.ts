import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Pay-what-you-want sponsorships (the Dodo "Sponsor Stroke" product). They pay
 * for the Apple and Windows signing certificates; the total feeds the goal
 * bar on /sponsors. Never linked to a license.
 */
export const sponsorPayments = sqliteTable("sponsor_payments", {
  /** Dodo payment id. */
  id: text("id").primaryKey(),
  /** Smallest currency unit, as Dodo reports it. */
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  name: text("name"),
  refunded: integer("refunded", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});
