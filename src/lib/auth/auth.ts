import "@tanstack/react-start/server-only";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { checkout, dodopayments, portal, webhooks } from "@dodopayments/better-auth";
import { APIError, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import DodoPayments from "dodopayments";

import { env } from "#/env/server";
import { hasStorageAddon } from "#/lib/backups/storage";
import {
  domainFromEmail,
  getEnterpriseDomain,
  isPublicEmailDomain,
  STROKE_TEAM_SLUG,
  TEAM_PLAN,
} from "#/lib/billing/enterprise";
import { STORAGE_PLAN, STROKE_STORAGE_SLUG } from "#/lib/billing/plans";
import { handleBillingEvent, userHasActiveLicense } from "#/lib/billing/service";
import { db } from "#/lib/db";
import * as schema from "#/lib/db/schema";
import { requestGeo } from "#/lib/geo";
import { createPlunkContact } from "#/lib/mail/client";
import { recordSignIn } from "#/lib/signins";

export const dodoClient = new DodoPayments({
  bearerToken: env.DODO_PAYMENTS_API_KEY,
  environment: env.DODO_ENVIRONMENT,
});

export const STROKE_LICENSE_SLUG = "stroke-license";

const CHECKOUT_PATHS = ["/dodopayments/checkout", "/dodopayments/checkout-session"];

function metadataUserId(metadata: Record<string, unknown> | undefined): string | undefined {
  const value = metadata?.userId;
  return typeof value === "string" ? value : undefined;
}

/**
 * A storage add-on subscription event, as the billing service's own event.
 * The add-on's end of period comes from Dodo's next billing date, so a
 * cancelled add-on keeps its storage until the time already paid for.
 */
async function storageEvent(
  type:
    | "subscription.active"
    | "subscription.renewed"
    | "subscription.on_hold"
    | "subscription.cancelled",
  payload: { data: Record<string, unknown> },
): Promise<void> {
  const d = payload.data as {
    subscription_id?: string;
    product_id?: string;
    customer?: { customer_id?: string };
    metadata?: Record<string, unknown>;
    next_billing_date?: string;
  };
  if (!env.DODO_STORAGE_PRODUCT_ID || d.product_id !== env.DODO_STORAGE_PRODUCT_ID) return;
  const periodEnd = d.next_billing_date ? new Date(d.next_billing_date) : undefined;
  await handleBillingEvent({
    type,
    raw: payload,
    data: {
      subscriptionId: d.subscription_id,
      customerId: d.customer?.customer_id,
      userId: metadataUserId(d.metadata),
      plan: STORAGE_PLAN,
      periodEnd: periodEnd && !Number.isNaN(periodEnd.getTime()) ? periodEnd : undefined,
    },
  } as Parameters<typeof handleBillingEvent>[0]);
}

function metadataPlan(metadata: Record<string, unknown> | undefined): string | undefined {
  const value = metadata?.plan;
  return typeof value === "string" ? value : undefined;
}

// Products offered through the Dodo checkout plugin. The Team product is only
// registered when its id is configured.
const checkoutProducts: { productId: string; slug: string }[] = [
  { productId: env.DODO_PRODUCT_ID, slug: STROKE_LICENSE_SLUG },
];
if (env.DODO_TEAM_PRODUCT_ID) {
  checkoutProducts.push({ productId: env.DODO_TEAM_PRODUCT_ID, slug: STROKE_TEAM_SLUG });
}
if (env.DODO_STORAGE_PRODUCT_ID) {
  checkoutProducts.push({ productId: env.DODO_STORAGE_PRODUCT_ID, slug: STROKE_STORAGE_SLUG });
}

export const auth = betterAuth({
  baseURL: env.VITE_BASE_URL,
  telemetry: {
    enabled: false,
  },
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),

  hooks: {
    // Guard the plugin's checkout endpoints: one license per account, and the
    // payment is linked to the signed-in user server-side (client-supplied
    // metadata can't reassign it).
    before: createAuthMiddleware(async (ctx) => {
      if (!CHECKOUT_PATHS.includes(ctx.path)) return;

      const session = await getSessionFromCtx(ctx);
      if (!session) return; // checkout() already rejects unauthenticated users

      const slug = typeof ctx.body?.slug === "string" ? ctx.body.slug : undefined;
      const productId = typeof ctx.body?.productId === "string" ? ctx.body.productId : undefined;
      const isTeam =
        slug === STROKE_TEAM_SLUG ||
        (Boolean(env.DODO_TEAM_PRODUCT_ID) && productId === env.DODO_TEAM_PRODUCT_ID);
      const isStorage =
        slug === STROKE_STORAGE_SLUG ||
        (Boolean(env.DODO_STORAGE_PRODUCT_ID) && productId === env.DODO_STORAGE_PRODUCT_ID);

      if (isStorage) {
        // Extra Stroke Cloud storage is for Pro owners (cloud backups need
        // Pro), once per account.
        if (!(await userHasActiveLicense(session.user.id))) {
          throw new APIError("FORBIDDEN", {
            message: "Extra Stroke Cloud storage is an add-on to Stroke Pro. Get Pro first.",
          });
        }
        if (await hasStorageAddon(session.user.id)) {
          throw new APIError("CONFLICT", {
            message: "You already have the storage add-on. Manage it from Billing.",
          });
        }
      } else if (isTeam) {
        // Team covers everyone on the buyer's email domain, so it must be a
        // company domain and can't already be covered.
        const domain = domainFromEmail(session.user.email);
        if (!domain || isPublicEmailDomain(domain)) {
          throw new APIError("BAD_REQUEST", {
            message:
              "The Team plan needs a company email. Sign in with your work address and one purchase covers everyone on your domain.",
          });
        }
        const existing = await getEnterpriseDomain(domain);
        if (existing && existing.status === "active") {
          throw new APIError("CONFLICT", {
            message: `${domain} already has a Stroke Team license. Everyone on your domain is covered, so there's nothing more to buy.`,
          });
        }
      } else if (await userHasActiveLicense(session.user.id)) {
        // Personal (Pro) checkout: one license per account.
        throw new APIError("CONFLICT", {
          message:
            "You already own a Stroke license. It's tied to your account, so there's nothing more to buy.",
        });
      }

      return {
        context: {
          ...ctx,
          body: {
            ...ctx.body,
            referenceId: session.user.id,
            metadata: {
              ...(ctx.body?.metadata ?? {}),
              userId: session.user.id,
              plan: isStorage ? STORAGE_PLAN : isTeam ? TEAM_PLAN : "pro",
            },
          },
        },
      };
    }),
  },

  // Add every new user to Plunk as a contact. Best-effort: createPlunkContact
  // never throws, so a mail-provider hiccup can't block sign-up.
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await createPlunkContact({ email: user.email, name: user.name });
        },
      },
    },
    // Where each web sign-in came from: the session keeps its country, and
    // sign_ins gets the full row (see lib/geo.ts).
    session: {
      create: {
        // Neither may fail a sign-in: at worst the country is missing.
        before: async (session, ctx) => {
          try {
            return { data: { ...session, country: requestGeo(ctx?.request).country } };
          } catch {
            return { data: session };
          }
        },
        after: async (session, ctx) => {
          try {
            await recordSignIn({
              userId: session.userId,
              source: "web",
              geo: requestGeo(ctx?.request),
            });
          } catch (e) {
            console.error("sign-in record failed", e);
          }
        },
      },
    },
  },

  // https://www.better-auth.com/docs/integrations/tanstack#usage-tips
  plugins: [
    tanstackStartCookies(),
    dodopayments({
      client: dodoClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: checkoutProducts,
          successUrl: "/app/billing?success=true",
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          webhookKey: env.DODO_WEBHOOK_KEY,
          onPaymentSucceeded: async (payload) => {
            await handleBillingEvent({
              type: "payment.succeeded",
              raw: payload,
              data: {
                paymentId: payload.data.payment_id,
                customerId: payload.data.customer.customer_id,
                amount: payload.data.total_amount,
                currency: payload.data.currency,
                userId: metadataUserId(payload.data.metadata),
                plan: metadataPlan(payload.data.metadata),
                email: payload.data.customer.email,
                customerName: payload.data.customer.name ?? undefined,
                productIds: (payload.data.product_cart ?? []).map((p) => p.product_id),
              },
            });
          },
          // The storage add-on is the only subscription sold; anything else
          // arriving here is ignored.
          onSubscriptionActive: async (payload) => storageEvent("subscription.active", payload),
          onSubscriptionRenewed: async (payload) => storageEvent("subscription.renewed", payload),
          onSubscriptionOnHold: async (payload) => storageEvent("subscription.on_hold", payload),
          onSubscriptionFailed: async (payload) => storageEvent("subscription.on_hold", payload),
          onSubscriptionCancelled: async (payload) =>
            storageEvent("subscription.cancelled", payload),
          onSubscriptionExpired: async (payload) => storageEvent("subscription.cancelled", payload),
          onPaymentFailed: async (payload) => {
            await handleBillingEvent({
              type: "payment.failed",
              raw: payload,
              data: {
                paymentId: payload.data.payment_id,
                customerId: payload.data.customer.customer_id,
                userId: metadataUserId(payload.data.metadata),
              },
            });
          },
          onRefundSucceeded: async (payload) => {
            await handleBillingEvent({
              type: "refund.succeeded",
              raw: payload,
              data: {
                paymentId: payload.data.payment_id ?? undefined,
                amount: payload.data.amount ?? undefined,
                userId: metadataUserId(payload.data.metadata ?? undefined),
              },
            });
          },
        }),
      ],
    }),
  ],

  // https://www.better-auth.com/docs/concepts/session-management#session-caching
  session: {
    // Set by the session hook above, never by the client.
    additionalFields: {
      country: { type: "string", required: false, input: false },
    },
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // https://www.better-auth.com/docs/concepts/users-accounts#account-linking
  // A sign-in whose email matches an existing user joins that user, so one
  // person keeps one account (and license) across GitHub and Google.
  account: {
    accountLinking: {
      enabled: true,
      // Google verifies every address it issues, so its sign-ins always link.
      // GitHub isn't trusted: it can report an address the user never
      // verified, which would hand them someone else's account. It still links
      // whenever GitHub says the email is verified.
      trustedProviders: ["google"],
    },
  },

  // https://www.better-auth.com/docs/concepts/oauth
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID!,
      clientSecret: env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
    },
  },

  emailAndPassword: {
    enabled: false,
  },

  experimental: {
    // https://www.better-auth.com/docs/adapters/drizzle#joins-experimental
    joins: true,
  },
});
