import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { user } from "./auth.schema";

export type SubscriptionStatus = "active" | "cancelled" | "on_hold" | "expired";
export type PaymentStatus = "succeeded" | "failed" | "refunded";

export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(), // 'dodo' | 'stripe'
    providerCustomerId: text("provider_customer_id").notNull(),
    providerSubscriptionId: text("provider_subscription_id").notNull().unique(),
    plan: text("plan").notNull().default("pro"),
    status: text("status").notNull().default("active").$type<SubscriptionStatus>(),
    currentPeriodEnd: integer("current_period_end", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("subscriptions_user_id_idx").on(table.userId),
    index("subscriptions_provider_sub_id_idx").on(table.providerSubscriptionId),
    index("subscriptions_provider_customer_id_idx").on(table.providerCustomerId),
  ],
);

export const payments = sqliteTable(
  "payments",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    subscriptionId: text("subscription_id").references(() => subscriptions.id),
    provider: text("provider").notNull(),
    providerPaymentId: text("provider_payment_id").notNull().unique(),
    amount: integer("amount").notNull(), // in smallest currency unit (cents)
    currency: text("currency").notNull().default("USD"),
    status: text("status").notNull().$type<PaymentStatus>(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("payments_user_id_idx").on(table.userId),
    index("payments_provider_payment_id_idx").on(table.providerPaymentId),
  ],
);

export const licenses = sqliteTable(
  "licenses",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .unique(),
    licenseKey: text("license_key").notNull().unique(),
    plan: text("plan").notNull().default("pro"),
    // The column default stays 2 (changing it means rebuilding this table,
    // which activations reference): licenses are issued with
    // DEFAULT_MAX_DEVICES (3) explicitly, and 0014 raised the existing ones.
    // More on request, set per license by an admin (device_requests).
    maxDevices: integer("max_devices").notNull().default(2),
    issuedAt: integer("issued_at", { mode: "timestamp_ms" }).notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("licenses_user_id_idx").on(table.userId)],
);

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(user, { fields: [subscriptions.userId], references: [user.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(user, { fields: [payments.userId], references: [user.id] }),
  subscription: one(subscriptions, {
    fields: [payments.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export type EnterpriseDomainStatus = "active" | "refunded";

/**
 * A company domain covered by a one-time Team purchase. Any user whose
 * verified email matches an active domain is auto-issued a per-member license
 * (see src/lib/license). One row per domain; the buyer is `ownerUserId`.
 */
export const enterpriseDomains = sqliteTable(
  "enterprise_domains",
  {
    id: text("id").primaryKey(),
    domain: text("domain").notNull().unique(), // lowercased, e.g. "acme.com"
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    plan: text("plan").notNull().default("team"),
    provider: text("provider").notNull(), // 'dodo'
    providerCustomerId: text("provider_customer_id"),
    providerPaymentId: text("provider_payment_id").notNull().unique(),
    status: text("status").notNull().default("active").$type<EnterpriseDomainStatus>(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("enterprise_domains_owner_user_id_idx").on(table.ownerUserId),
    index("enterprise_domains_domain_idx").on(table.domain),
  ],
);

export const enterpriseDomainsRelations = relations(enterpriseDomains, ({ one }) => ({
  owner: one(user, { fields: [enterpriseDomains.ownerUserId], references: [user.id] }),
}));

export const activations = sqliteTable(
  "activations",
  {
    id: text("id").primaryKey(),
    licenseId: text("license_id")
      .notNull()
      .references(() => licenses.id, { onDelete: "cascade" }),
    deviceId: text("device_id").notNull(),
    hostname: text("hostname"),
    /** "macos" | "windows" | "linux", reported by the app; null for older clients. */
    os: text("os"),
    /** App version last reported by this device, e.g. "2.3.0". */
    appVersion: text("app_version"),
    activatedAt: integer("activated_at", { mode: "timestamp_ms" }).notNull(),
    lastSeenAt: integer("last_seen_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("activations_license_id_idx").on(table.licenseId),
    uniqueIndex("activations_license_device_uniq").on(table.licenseId, table.deviceId),
  ],
);

/**
 * Server-authoritative free-trial ledger, keyed by device fingerprint.
 * The desktop app phones home with its `device_id` on launch; the server
 * records the trial start the first time it sees a device and always keeps
 * the EARLIEST start thereafter. This makes the trial reinstall- and
 * disk-wipe-proof: clearing local files can't grant a fresh trial because
 * the server remembers when this device first started.
 */
export const deviceTrials = sqliteTable("device_trials", {
  deviceId: text("device_id").primaryKey(),
  startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
  hostname: text("hostname"),
  lastSeenAt: integer("last_seen_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

export const licensesRelations = relations(licenses, ({ one, many }) => ({
  user: one(user, { fields: [licenses.userId], references: [user.id] }),
  activations: many(activations),
}));

export const activationsRelations = relations(activations, ({ one }) => ({
  license: one(licenses, { fields: [activations.licenseId], references: [licenses.id] }),
}));

export type DeviceRequestStatus = "pending" | "approved" | "declined";

/**
 * "I need more devices": a user's request for more seats on their license,
 * with their reason. An admin sets the new limit (POST
 * /api/admin/license/devices), which approves the pending request.
 */
export const deviceRequests = sqliteTable(
  "device_requests",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    licenseId: text("license_id")
      .notNull()
      .references(() => licenses.id, { onDelete: "cascade" }),
    requested: integer("requested").notNull(),
    reason: text("reason").notNull(),
    status: text("status").$type<DeviceRequestStatus>().notNull().default("pending"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    resolvedAt: integer("resolved_at", { mode: "timestamp_ms" }),
  },
  (table) => [index("device_requests_license_idx").on(table.licenseId)],
);
