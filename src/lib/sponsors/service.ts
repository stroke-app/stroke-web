import "@tanstack/react-start/server-only";
import { and, eq, gte, sql } from "drizzle-orm";

import { env } from "#/env/server";
import type { BillingEventData } from "#/lib/billing/providers/types";
import { db } from "#/lib/db";
import { sponsorPayments } from "#/lib/db/schema";

export function isSponsorPayment(productIds: string[] | undefined): boolean {
  const id = env.DODO_SPONSOR_PRODUCT_ID;
  return !!id && !!productIds?.includes(id);
}

export async function recordSponsorPayment(data: BillingEventData) {
  if (!data.paymentId) return;
  await db
    .insert(sponsorPayments)
    .values({
      id: data.paymentId,
      amount: Math.max(0, Math.round(data.amount ?? 0)),
      currency: (data.currency ?? "USD").toUpperCase(),
      name: data.customerName?.trim().slice(0, 80) || null,
    })
    .onConflictDoNothing();
}

export async function refundSponsorPayment(paymentId: string) {
  await db.update(sponsorPayments).set({ refunded: true }).where(eq(sponsorPayments.id, paymentId));
}

/** Dodo's hosted checkout for the sponsor product; the payer picks the amount. */
export function sponsorCheckoutUrl(): string | null {
  const id = env.DODO_SPONSOR_PRODUCT_ID;
  if (!id) return null;
  const host =
    env.DODO_ENVIRONMENT === "live_mode"
      ? "checkout.dodopayments.com"
      : "test.checkout.dodopayments.com";
  const back = encodeURIComponent(`${env.VITE_BASE_URL}/sponsors?thanks=1`);
  return `https://${host}/buy/${id}?quantity=1&redirect_url=${back}`;
}

/** USD raised over the last 365 days (the goals are yearly), and how many people gave. */
export async function sponsorTotals() {
  const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const [row] = await db
    .select({
      cents: sql<number>`coalesce(sum(${sponsorPayments.amount}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(sponsorPayments)
    .where(
      and(
        eq(sponsorPayments.refunded, false),
        eq(sponsorPayments.currency, "USD"),
        gte(sponsorPayments.createdAt, since),
      ),
    );
  return { raisedCents: Number(row?.cents ?? 0), sponsors: Number(row?.count ?? 0) };
}
