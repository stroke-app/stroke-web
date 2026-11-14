import "@tanstack/react-start/server-only";
import { render } from "@react-email/render";

import { env } from "#/env/server";

import { sendTransactionalEmail } from "./client";
import { GiveawayWinnerEmail } from "./templates/giveaway-winner";
import { PaymentFailedEmail } from "./templates/payment-failed";
import { PurchaseSuccessEmail } from "./templates/purchase-success";

/** Format a provider amount (in the smallest currency unit) as e.g. "$29.00". */
function formatAmount(amount?: number, currency = "USD"): string | undefined {
  if (amount == null) return undefined;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

const billingUrl = () => `${env.VITE_BASE_URL}/app/billing`;

export interface PurchaseEmailInput {
  to: string;
  name: string;
  planLabel: string;
  amount?: number;
  currency?: string;
  licenseKey?: string;
}

/** Sent after a payment succeeds and the license is granted. */
export async function sendPurchaseSuccessEmail(input: PurchaseEmailInput): Promise<boolean> {
  const html = await render(
    PurchaseSuccessEmail({
      name: input.name,
      planLabel: input.planLabel,
      amountFormatted: formatAmount(input.amount, input.currency),
      licenseKey: input.licenseKey,
      appUrl: billingUrl(),
    }),
  );

  return sendTransactionalEmail({
    to: input.to,
    subject: `Your ${input.planLabel} purchase is confirmed`,
    body: html,
  });
}

export interface PaymentFailedEmailInput {
  to: string;
  name: string;
  amount?: number;
  currency?: string;
}

/** Sent when a payment attempt fails. */
export async function sendPaymentFailedEmail(input: PaymentFailedEmailInput): Promise<boolean> {
  const html = await render(
    PaymentFailedEmail({
      name: input.name,
      amountFormatted: formatAmount(input.amount, input.currency),
      retryUrl: billingUrl(),
    }),
  );

  return sendTransactionalEmail({
    to: input.to,
    subject: "Your Stroke payment didn't go through",
    body: html,
  });
}

export interface GiveawayWinnerEmailInput {
  to: string;
  name: string;
  licenseKey: string;
}

/** Sent to the weekly giveaway winner with the license they won. */
export async function sendGiveawayWinnerEmail(input: GiveawayWinnerEmailInput): Promise<boolean> {
  const html = await render(
    GiveawayWinnerEmail({
      name: input.name,
      licenseKey: input.licenseKey,
      appUrl: billingUrl(),
      downloadUrl: `${env.VITE_BASE_URL}/download`,
    }),
  );

  return sendTransactionalEmail({
    to: input.to,
    subject: "You won this week's Stroke license",
    body: html,
  });
}
