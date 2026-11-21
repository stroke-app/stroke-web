import "@tanstack/react-start/server-only";
import { and, eq } from "drizzle-orm";

import { STORAGE_ADDON_GB, STORAGE_INCLUDED_GB, STORAGE_PLAN } from "#/lib/billing/plans";
import { db } from "#/lib/db";
import { subscriptions } from "#/lib/db/schema";

const GB = 1024 ** 3;

/**
 * Whether the storage add-on is in effect: active, or cancelled with time
 * left on the period already paid for.
 */
export async function hasStorageAddon(userId: string, now = Date.now()): Promise<boolean> {
  const rows = await db
    .select({ status: subscriptions.status, periodEnd: subscriptions.currentPeriodEnd })
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.plan, STORAGE_PLAN)));
  return rows.some(
    (r) =>
      r.status === "active" ||
      (r.status === "cancelled" && !!r.periodEnd && r.periodEnd.getTime() > now),
  );
}

/** Stroke Cloud backup storage for an account, in bytes. */
export async function storageQuotaBytes(userId: string): Promise<number> {
  return ((await hasStorageAddon(userId)) ? STORAGE_ADDON_GB : STORAGE_INCLUDED_GB) * GB;
}
