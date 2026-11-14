import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";
import * as z from "zod";

import { env } from "#/env/server";
import { authMiddleware } from "#/lib/auth/middleware";
import { billing } from "#/lib/billing";
import {
  countCoveredMembers,
  getCoveringDomain,
  getOwnedEnterpriseDomain,
} from "#/lib/billing/enterprise";
import { getActiveSubscription, getSubscription } from "#/lib/billing/service";
import { db } from "#/lib/db";
import { activations, deviceRequests, subscriptions } from "#/lib/db/schema";
import { overLimit } from "#/lib/desktop/rate-limit";
import { getLicense, getOrIssueLicense, resolveLicense } from "#/lib/license";

// Checkout is handled by the @dodopayments/better-auth plugin. See
// src/lib/auth/auth.ts. Clients call authClient.dodopayments.checkoutSession().

export const $getSubscription = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return getSubscription(context.user.id);
  });

export const $getLicense = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    // resolveLicense also mints a key for members covered by a Team domain.
    return resolveLicense(context.user.id, context.user.email);
  });

/**
 * Enterprise/Team status for the current user:
 * - "owner": bought Team for their domain (includes seat count)
 * - "member": covered by someone else's Team purchase on their domain
 * - "none": not part of any Team plan
 */
export const $getEnterprise = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const available = Boolean(env.DODO_TEAM_PRODUCT_ID);

    const owned = await getOwnedEnterpriseDomain(context.user.id);
    if (owned && owned.status === "active") {
      const members = await countCoveredMembers(owned.domain);
      return { role: "owner" as const, domain: owned.domain, members, available };
    }

    const covering = await getCoveringDomain(context.user.email);
    if (covering) {
      return { role: "member" as const, domain: covering.domain, members: null, available };
    }

    return { role: "none" as const, domain: null, members: null, available };
  });

/**
 * Attempt to issue a license for the current user.
 *
 * - If sessionId is provided, verifies the payment directly with Dodo (works
 *   even when the webhook hasn't fired yet).
 * - Otherwise falls back to checking whether a subscription already exists.
 *
 * Safe to call multiple times.
 */
export const $recoverLicense = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ sessionId: z.string().optional() }))
  .handler(async ({ context, data }) => {
    // 1. Already have a license, so return it immediately.
    const existing = await getLicense(context.user.id, context.user.email);
    if (existing) return existing;

    // 2. Verify directly with Dodo when we have a checkout session ID.
    if (data.sessionId) {
      try {
        const { succeeded, paymentId } = await billing.verifyCheckoutSession(data.sessionId);
        if (succeeded && paymentId) {
          const existingSub = await getSubscription(context.user.id);
          if (!existingSub) {
            await db.insert(subscriptions).values({
              id: crypto.randomUUID(),
              userId: context.user.id,
              provider: "dodo",
              providerCustomerId: "",
              providerSubscriptionId: paymentId,
              plan: "pro",
              status: "active",
              currentPeriodEnd: null,
            });
          }
          return getOrIssueLicense(context.user.id, context.user.email);
        }
      } catch {
        // Dodo API failure; fall through to subscription check.
      }
    }

    // 3. Fallback: subscription already exists (e.g. webhook fired).
    const sub = await getActiveSubscription(context.user.id);
    if (sub) return getOrIssueLicense(context.user.id, context.user.email);

    // 4. Fallback: covered by a Team domain (member never checks out).
    return resolveLicense(context.user.id, context.user.email);
  });

/** The machines the current user's license is active on, most recently seen first. */
export const $getDevices = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const license = await getLicense(context.user.id);
    if (!license) return [];
    return db
      .select({
        id: activations.id,
        hostname: activations.hostname,
        os: activations.os,
        appVersion: activations.appVersion,
        activatedAt: activations.activatedAt,
        lastSeenAt: activations.lastSeenAt,
      })
      .from(activations)
      .where(eq(activations.licenseId, license.id))
      .orderBy(desc(activations.lastSeenAt));
  });

/**
 * Free a seat from the dashboard, e.g. for a machine the user can no longer
 * reach. The app on that machine drops its key the next time it checks in
 * (`/api/license/check` answers `device_not_activated`).
 */
export const $removeDevice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ context, data }) => {
    const license = await getLicense(context.user.id);
    if (!license) return { removed: false };
    const deleted = await db
      .delete(activations)
      .where(and(eq(activations.id, data.id), eq(activations.licenseId, license.id)))
      .returning({ id: activations.id });
    return { removed: deleted.length > 0 };
  });

/**
 * "I need more devices": record the request and its reason for an admin to
 * act on. One pending request per license; a second one updates it.
 */
export const $requestMoreDevices = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      requested: z.number().int().min(2).max(50),
      reason: z.string().trim().min(10, "Tell us a little about why.").max(1000),
    }),
  )
  .handler(async ({ context, data }) => {
    if ((await overLimit(`device-request:${context.user.id}`, 5, 86_400)) !== null) {
      throw new Error("You've sent a few requests today. We'll get back to you by email.");
    }
    const license = await getLicense(context.user.id);
    if (!license) throw new Error("There's no license on this account yet.");
    if (data.requested <= license.maxDevices) {
      throw new Error(`Your license already covers ${license.maxDevices} devices.`);
    }
    const [pending] = await db
      .select({ id: deviceRequests.id })
      .from(deviceRequests)
      .where(and(eq(deviceRequests.licenseId, license.id), eq(deviceRequests.status, "pending")))
      .limit(1);
    if (pending) {
      await db
        .update(deviceRequests)
        .set({ requested: data.requested, reason: data.reason, createdAt: new Date() })
        .where(eq(deviceRequests.id, pending.id));
    } else {
      await db.insert(deviceRequests).values({
        id: crypto.randomUUID(),
        userId: context.user.id,
        licenseId: license.id,
        requested: data.requested,
        reason: data.reason,
      });
    }
    return { ok: true };
  });

/** The open request, if any: the panel says it is pending instead of offering the form. */
export const $getDeviceRequest = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const license = await getLicense(context.user.id);
    if (!license) return null;
    const [row] = await db
      .select({
        requested: deviceRequests.requested,
        status: deviceRequests.status,
        createdAt: deviceRequests.createdAt,
      })
      .from(deviceRequests)
      .where(and(eq(deviceRequests.licenseId, license.id), eq(deviceRequests.status, "pending")))
      .limit(1);
    return row ?? null;
  });

export const deviceRequestQueryOptions = () =>
  queryOptions({
    queryKey: ["billing", "device-request"],
    queryFn: ({ signal }) => $getDeviceRequest({ signal }),
  });

export const devicesQueryOptions = () =>
  queryOptions({
    queryKey: ["billing", "devices"],
    queryFn: ({ signal }) => $getDevices({ signal }),
  });

export const billingQueryOptions = () =>
  queryOptions({
    queryKey: ["billing", "subscription"],
    queryFn: ({ signal }) => $getSubscription({ signal }),
  });

export const licenseQueryOptions = () =>
  queryOptions({
    queryKey: ["billing", "license"],
    queryFn: ({ signal }) => $getLicense({ signal }),
  });

export const enterpriseQueryOptions = () =>
  queryOptions({
    queryKey: ["billing", "enterprise"],
    queryFn: ({ signal }) => $getEnterprise({ signal }),
  });
