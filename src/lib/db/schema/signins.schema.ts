import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth.schema";

/**
 * One row per sign-in, on the website or in the desktop app: where it came
 * from (Cloudflare's own geolocation of the request, no third-party lookup),
 * the IP and network, and the client. Feeds the country and growth charts.
 */
export const signIns = sqliteTable(
  "sign_ins",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** "web" (stroke.click session) or "desktop" (app token exchange). */
    source: text("source").notNull(),
    ip: text("ip"),
    /** ISO 3166-1 alpha-2, e.g. "NP"; "XX" when Cloudflare can't tell, "T1" for Tor. */
    country: text("country"),
    continent: text("continent"),
    region: text("region"),
    regionCode: text("region_code"),
    city: text("city"),
    postalCode: text("postal_code"),
    timezone: text("timezone"),
    latitude: real("latitude"),
    longitude: real("longitude"),
    asn: integer("asn"),
    asOrganization: text("as_organization"),
    /** Cloudflare data center that served the request, e.g. "KTM". */
    colo: text("colo"),
    userAgent: text("user_agent"),
    /** Desktop only: the device, app version and OS the app reported. */
    deviceId: text("device_id"),
    appVersion: text("app_version"),
    os: text("os"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (t) => [
    index("sign_ins_user_idx").on(t.userId),
    index("sign_ins_created_idx").on(t.createdAt),
    index("sign_ins_country_idx").on(t.country),
  ],
);
