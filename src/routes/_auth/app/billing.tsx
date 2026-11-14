import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  Building2Icon,
  CheckIcon,
  ClockIcon,
  KeyRoundIcon,
  Loader2Icon,
  LockIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { appButton } from "#/components/app-ui";
import { SmartDownloadButton } from "#/components/download-button";
import { LicensePanel } from "#/components/license-panel";
import { authClient } from "#/lib/auth/auth-client";
import {
  $recoverLicense,
  billingQueryOptions,
  devicesQueryOptions,
  enterpriseQueryOptions,
  licenseQueryOptions,
} from "#/lib/billing/functions";
import { SHIPPED_ENGINES } from "#/lib/engines";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/_auth/app/billing")({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(billingQueryOptions());
    context.queryClient.prefetchQuery(licenseQueryOptions());
    context.queryClient.prefetchQuery(enterpriseQueryOptions());
    context.queryClient.prefetchQuery(devicesQueryOptions());
  },
  component: BillingPage,
});

const PRO_PERKS = [
  `All ${SHIPPED_ENGINES.length} engines, from Postgres to MongoDB`,
  "Built-in MCP server for Claude & Cursor",
  "macOS, Windows & Linux, 3 devices at once",
  "Every future update included",
];

// What a careful buyer checks before paying, from the Terms of Service.
const PROMISES = [
  {
    title: "Pay once, keep it",
    body: "No subscription. It never renews or expires, and every update is included.",
  },
  {
    title: "Fixed within 14 days",
    body: "A double charge or a key that won't activate? Email us within 14 days and we'll make it right.",
  },
  {
    title: "We never see your card",
    body: "Payments are handled by Dodo Payments, our merchant of record.",
  },
];

const BUYER_FAQ = [
  {
    q: "Is it really one payment?",
    a: "Yes. $9.99 once, in USD. It isn't a subscription: it never renews, never expires, and includes every future update.",
  },
  {
    q: "What if I switch computers?",
    a: "Your key can be active on up to 3 devices at a time, and you can ask for more under Devices. To switch, remove the old machine under Devices on this page, even if you no longer have it, or deactivate it in Stroke (Settings → License).",
  },
  {
    q: "Can I try it first?",
    a: "Yes. The first time you open Stroke on a device, a 17-day trial starts with every feature unlocked. No account or payment needed.",
  },
  {
    q: "What happens after I pay?",
    a: "You come back to this page and your license key appears, usually within a minute. Paste it into Stroke → Settings → License to activate.",
  },
];

// The paid/active status color, the only color on these pages.
const ACTIVE_PILL =
  "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
// The plan surface: one step up from the page, with a brighter hairline.
const PLAN_CARD = "border-y border-border";
const TEXT_LINK =
  "text-soft underline decoration-foreground/25 underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-foreground/60";

function BillingPage() {
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  // Dodo appends its own status to our return URL; success=true only means
  // "came back from checkout", not "the payment went through".
  const returnedStatus = search.get("status");
  const paymentFailed = returnedStatus === "failed" || returnedStatus === "cancelled";
  const success = search.get("success") === "true" && !paymentFailed;
  const queryClient = useQueryClient();

  const { data: license } = useQuery(licenseQueryOptions());
  const { data: enterprise } = useQuery(enterpriseQueryOptions());

  const [loading, setLoading] = useState(false);
  const [pollExpired, setPollExpired] = useState(false);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    if (!success || license) return;

    let attempts = 0;

    const id = setInterval(async () => {
      attempts++;
      await queryClient.refetchQueries({ queryKey: ["billing"] });

      if (attempts === 1 || attempts === 5 || attempts === 10) {
        try {
          await $recoverLicense({ data: {} });
          await queryClient.refetchQueries({ queryKey: ["billing"] });
        } catch {
          // keep polling
        }
      }

      if (attempts >= 15) {
        clearInterval(id);
        setPollExpired(true);
      }
    }, 2000);

    return () => clearInterval(id);
  }, [success, license, queryClient]);

  async function handleManualRefresh() {
    setRecovering(true);
    try {
      await $recoverLicense({ data: {} });
      await queryClient.refetchQueries({ queryKey: ["billing"] });
      setPollExpired(false);
    } catch {
      // ignore
    } finally {
      setRecovering(false);
    }
  }

  async function handleUpgrade() {
    setLoading(true);
    const { data, error } = await authClient.dodopayments.checkoutSession({
      slug: "stroke-license",
    });
    if (error || !data?.url) {
      toast.error(error?.message ?? "Failed to start checkout. Please try again.");
      setLoading(false);
      return;
    }
    window.location.href = data.url;
  }

  // ── Failed or cancelled payment ───────────────────────────────────────────
  if (paymentFailed) {
    const cancelled = returnedStatus === "cancelled";
    return (
      <div>
        <StatusMark tone="danger">
          <XIcon className="size-4" strokeWidth={2.25} />
        </StatusMark>
        <PageTitle title={cancelled ? "Payment cancelled" : "Payment failed"} className="mt-6">
          {cancelled
            ? "You cancelled the checkout before it completed."
            : "Your bank or card declined the payment."}{" "}
          You haven't been charged and no license was issued.
        </PageTitle>

        <p className="mt-8 max-w-xl border-t border-border pt-8 text-[15px] leading-relaxed text-pretty text-soft">
          You can try again whenever you're ready. The app keeps working free in the meantime. If
          the problem repeats, a different card usually resolves it, or reach us through the{" "}
          <Link to="/app/support" className={TEXT_LINK}>
            support page
          </Link>
          .
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <BuyButton loading={loading} onClick={handleUpgrade} size="md" label="Try again" />
          <Link to="/app/billing" className={appButton({ variant: "ghost", size: "md" })}>
            Back to billing
          </Link>
        </div>
      </div>
    );
  }

  // ── Post-payment activation flow ──────────────────────────────────────────
  if (success) {
    return (
      <div>
        {license ? (
          <StatusMark tone="success">
            <CheckIcon className="size-4" strokeWidth={2.25} />
          </StatusMark>
        ) : pollExpired ? (
          <StatusMark tone="neutral">
            <ClockIcon className="size-4" />
          </StatusMark>
        ) : (
          <StatusMark tone="neutral">
            <Loader2Icon className="size-4 motion-safe:animate-spin" />
          </StatusMark>
        )}

        {license ? (
          <PageTitle title="Payment confirmed" className="mt-6">
            Your license is ready. Activate it in Stroke → Settings → License.
          </PageTitle>
        ) : pollExpired ? (
          <PageTitle title="Still processing" className="mt-6">
            This can take a moment.{" "}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={recovering}
              className={cn(TEXT_LINK, "disabled:opacity-40")}
            >
              {recovering ? "Checking…" : "Refresh now"}
            </button>
          </PageTitle>
        ) : (
          <PageTitle title="Generating your license…" className="mt-6">
            Usually takes a few seconds.
          </PageTitle>
        )}

        <div className="mt-10">
          {license ? (
            <LicensePanel license={license} since={license.createdAt} sinceLabel="purchased" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
              <KeyRoundIcon className="size-5 text-faint" />
              <p className="text-[15px] text-muted-foreground">
                Your key will appear here once confirmed
              </p>
            </div>
          )}
        </div>

        {license && (
          <section aria-labelledby="activate-title" className="mt-14">
            <h2 id="activate-title" className="text-[16px] font-semibold tracking-[-0.01em]">
              Activate in 3 steps
            </h2>
            <ol className="mt-4 divide-y divide-border border-y border-border">
              {[
                {
                  step: "Download Stroke if you haven't already",
                  action: <SmartDownloadButton size="sm" alternates={false} />,
                },
                { step: "Open Stroke → Settings → License", action: null },
                { step: "Paste your key and press Activate", action: null },
              ].map(({ step, action }, i) => (
                <li
                  key={step}
                  className="flex min-h-14 flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-3 text-[13px] text-faint tabular-nums">{i + 1}</span>
                    <span className="text-[15px] text-soft">{step}</span>
                  </div>
                  {action}
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="mt-10">
          <Link to="/app" className={appButton({ variant: license ? "primary" : "secondary" })}>
            Go to dashboard
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Default billing page (no ?success=true) ───────────────────────────────
  const subtitle = license
    ? enterprise?.role === "member"
      ? `Covered by your team (${enterprise.domain}).`
      : "Your license is active."
    : "Get lifetime access to Stroke.";

  return (
    <div>
      <PageTitle title="License & billing">{subtitle}</PageTitle>

      <div className="mt-8 space-y-4">
        {/* Team owner summary */}
        {enterprise?.role === "owner" && (
          <Notice title={`Team plan · ${enterprise.domain}`}>
            Everyone with an <strong>@{enterprise.domain}</strong> email is licensed automatically
            when they sign in.
            {typeof enterprise.members === "number" &&
              ` ${enterprise.members} ${enterprise.members === 1 ? "member" : "members"} licensed so far.`}
          </Notice>
        )}

        {/* Covered member note */}
        {enterprise?.role === "member" && license && (
          <Notice title="Covered by your team">
            Your {enterprise.domain} organization has a Stroke Team license, so the key below is
            yours at no cost.
          </Notice>
        )}

        {/* License: personal, team owner, or covered member */}
        {license && (
          <LicensePanel
            license={license}
            since={license.createdAt}
            sinceLabel={enterprise?.role === "member" ? "issued" : "purchased"}
          />
        )}

        {/* Personal (Pro) purchase: only when the user has no license at all */}
        {!license && <ProOffer loading={loading} onBuy={handleUpgrade} />}
      </div>

      {/* Team checkout is paused for now; teams buy by email instead. */}
      {(!enterprise || enterprise.role === "none") && (
        <p className="mt-5 text-[15px] text-muted-foreground">
          Buying for a team? Email{" "}
          <a
            href="mailto:support@stroke.click?subject=Stroke%20Team%20license"
            className={TEXT_LINK}
          >
            support@stroke.click
          </a>
        </p>
      )}

      {!license && (
        <>
          <ul className="mt-12 grid grid-cols-1 border-t border-border sm:grid-cols-3">
            {PROMISES.map((p) => (
              <li
                key={p.title}
                className="border-b border-border py-6 sm:border-b-0 sm:not-first:border-l sm:not-first:pl-6 sm:not-last:pr-6"
              >
                <p className="text-[15px] font-medium">{p.title}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-pretty text-muted-foreground">
                  {p.body}
                </p>
              </li>
            ))}
          </ul>

          <section aria-labelledby="buyer-faq" className="mt-16">
            <h2 id="buyer-faq" className="text-[16px] font-semibold tracking-[-0.01em]">
              Questions before you buy
            </h2>
            <div className="mt-4 divide-y divide-border border-y border-border">
              {BUYER_FAQ.map((item) => (
                <details key={item.q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-[14px] font-medium transition-colors hover:text-soft [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <PlusIcon
                      className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                      strokeWidth={1.75}
                    />
                  </summary>
                  <p className="-mt-1 pb-5 text-[14px] leading-relaxed text-pretty text-muted-foreground">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
            <p className="mt-5 text-[15px] text-muted-foreground">
              The full details are in the{" "}
              <Link to="/terms" className={TEXT_LINK}>
                Terms of Service
              </Link>
              .
            </p>
          </section>

          <div className="mt-14 flex flex-col gap-5 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[16px] font-semibold">Stroke Pro · $9.99 once</p>
              <p className="mt-1 text-[15px] text-muted-foreground">
                Every feature and every update, on 3 devices.
              </p>
            </div>
            <BuyButton loading={loading} onClick={handleUpgrade} className="w-full sm:w-auto" />
          </div>
        </>
      )}
    </div>
  );
}

/** The page's title and a soft line under it. */
function PageTitle({
  title,
  className,
  children,
}: {
  title: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className={className}>
      <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.02em] text-balance">
        {title}
      </h1>
      {children && (
        <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-pretty text-muted-foreground">
          {children}
        </p>
      )}
    </header>
  );
}

/** The one purchase button, with its redirecting state. */
function BuyButton({
  loading,
  onClick,
  size = "lg",
  label = "Buy Stroke · $9.99",
  className,
}: {
  loading: boolean;
  onClick: () => void;
  size?: "md" | "lg";
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(appButton({ size }), className)}
    >
      {loading && <Loader2Icon className="size-4 motion-safe:animate-spin" />}
      {loading ? "Redirecting…" : label}
    </button>
  );
}

const MARK_TONES = {
  success: ACTIVE_PILL,
  danger: "border-destructive/25 bg-destructive/10 text-destructive",
  neutral: "border-border bg-muted text-muted-foreground",
};

/** A small round status glyph above a state's title. */
function StatusMark({
  tone,
  children,
}: {
  tone: keyof typeof MARK_TONES;
  children: React.ReactNode;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 items-center justify-center rounded-full border",
        MARK_TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

/** A quiet note about the team that covers this account. */
function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-l-2 border-border py-1 pl-4">
      <span className="flex size-5 shrink-0 items-center justify-center pt-0.5 text-muted-foreground">
        <Building2Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[15px] font-medium">{title}</p>
        <p className="mt-1 text-[15px] leading-relaxed text-pretty text-muted-foreground [&_strong]:font-medium [&_strong]:text-foreground">
          {children}
        </p>
      </div>
    </div>
  );
}

/**
 * Stroke Pro, priced and ready to buy: the price and the button on the left,
 * what the license includes on the right (stacked on narrow screens).
 */
function ProOffer({ loading, onBuy }: { loading: boolean; onBuy: () => void }) {
  return (
    <section
      aria-labelledby="pro-title"
      className={cn(PLAN_CARD, "grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]")}
    >
      <div className="flex flex-col py-6 lg:pr-8">
        <div className="flex h-6 items-center justify-between gap-3">
          <h2 id="pro-title" className="text-[16px] font-semibold">
            Stroke Pro
          </h2>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[12px] font-medium text-soft">
            Pay once
          </span>
        </div>
        <p className="mt-7 flex items-baseline gap-2">
          <span className="text-[3rem] leading-none font-medium tracking-[-0.03em] tabular-nums">
            $9.99
          </span>
          <span className="text-[15px] text-muted-foreground">once</span>
        </p>
        <p className="mt-3 text-[15px] text-pretty text-soft">
          One payment, no subscription. Yours for good.
        </p>
        <div className="mt-8 lg:mt-auto lg:pt-8">
          <BuyButton loading={loading} onClick={onBuy} className="w-full" />
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-muted-foreground">
            <LockIcon className="size-3.5 shrink-0" />
            Secure checkout via Dodo Payments
          </p>
        </div>
      </div>

      <div className="border-t border-border py-6 lg:border-t-0 lg:border-l lg:pl-8">
        <p className="text-[13px] font-medium text-muted-foreground">What you get</p>
        <ul className="mt-5 space-y-3.5">
          {PRO_PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-3 text-[15px]">
              <CheckIcon className="mt-[3px] size-4 shrink-0 text-foreground" strokeWidth={2} />
              <span className="text-pretty text-soft">{perk}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 border-t border-border pt-5 text-[15px] text-pretty text-muted-foreground">
          Try every feature free for 17 days first, no account needed.
        </p>
      </div>
    </section>
  );
}
