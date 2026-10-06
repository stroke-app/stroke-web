import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  Building2Icon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  Loader2Icon,
  LockIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SmartDownloadButton } from "#/components/download-button";
import { siteButton } from "#/components/page";
import { authClient } from "#/lib/auth/auth-client";
import {
  $recoverLicense,
  billingQueryOptions,
  enterpriseQueryOptions,
  licenseQueryOptions,
} from "#/lib/billing/functions";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/_auth/app/billing")({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(billingQueryOptions());
    context.queryClient.prefetchQuery(licenseQueryOptions());
    context.queryClient.prefetchQuery(enterpriseQueryOptions());
  },
  component: BillingPage,
});

const PRO_PERKS = [
  "All ten engines, from Postgres to DuckDB",
  "Built-in MCP server for Claude & Cursor",
  "macOS, Windows & Linux, 2 devices at once",
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
    a: "Your key can be active on up to 2 devices at a time. To switch, deactivate it in Stroke on the old machine (Settings → License), or email support@stroke.click if that machine is gone.",
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
const ACTIVE_PILL = "border-[#4cb782]/25 bg-[#4cb782]/10 text-[#4cb782]";
// The plan surface: one step up from the page, with a brighter hairline.
const PLAN_CARD =
  "rounded-2xl border border-white/[0.14] bg-[#141516] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]";
const TEXT_LINK =
  "text-soft underline decoration-white/25 underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-white/60";

/** Fixed locale and zone, so the server and the browser print the same day. */
function formatDate(value: string | number | Date) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

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
      <div className="mx-auto max-w-3xl">
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
          <Link to="/app/billing" className={siteButton({ variant: "ghost", size: "md" })}>
            Back to billing
          </Link>
        </div>
      </div>
    );
  }

  // ── Post-payment activation flow ──────────────────────────────────────────
  if (success) {
    return (
      <div className="mx-auto max-w-3xl">
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
            <LicenseCard license={license} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
              <KeyRoundIcon className="size-5 text-faint" />
              <p className="text-[15px] text-muted-foreground">
                Your key will appear here once confirmed
              </p>
            </div>
          )}
        </div>

        {license && (
          <section aria-labelledby="activate-title" className="mt-14">
            <h2 id="activate-title" className="text-xl">
              Activate in 3 steps
            </h2>
            <ol className="mt-5 divide-y divide-border border-y border-border">
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
                  className="flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4"
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
          <Link to="/app" className={siteButton({ variant: license ? "primary" : "secondary" })}>
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
    <div className="mx-auto max-w-3xl">
      <PageTitle title="License & billing">{subtitle}</PageTitle>

      <div className="mt-10 space-y-4">
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
          <LicenseCard
            license={license}
            dateLabel={enterprise?.role === "member" ? "Issued" : "Purchased"}
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
                <p className="text-[15px] font-[510]">{p.title}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-pretty text-muted-foreground">
                  {p.body}
                </p>
              </li>
            ))}
          </ul>

          <section aria-labelledby="buyer-faq" className="mt-16">
            <h2 id="buyer-faq" className="text-xl">
              Questions before you buy
            </h2>
            <div className="mt-5 divide-y divide-border border-y border-border">
              {BUYER_FAQ.map((item) => (
                <details key={item.q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-[15px] font-[510] transition-colors hover:text-soft [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <PlusIcon
                      className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                      strokeWidth={1.75}
                    />
                  </summary>
                  <p className="-mt-1 pb-5 text-[15px] leading-relaxed text-pretty text-muted-foreground">
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

          <div className="mt-14 flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div>
              <p className="text-[17px] font-[510]">Stroke Pro · $9.99 once</p>
              <p className="mt-1 text-[15px] text-muted-foreground">
                Every feature and every update, on 2 devices.
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
      <h1 className="text-[1.75rem] text-balance md:text-[2rem]">{title}</h1>
      {children && (
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-pretty text-muted-foreground">
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
      className={cn(siteButton({ size }), className)}
    >
      {loading && <Loader2Icon className="size-4 motion-safe:animate-spin" />}
      {loading ? "Redirecting…" : label}
    </button>
  );
}

const MARK_TONES = {
  success: ACTIVE_PILL,
  danger: "border-red-400/25 bg-red-400/10 text-red-300",
  neutral: "border-border bg-white/[0.04] text-muted-foreground",
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
    <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-white/[0.04] text-soft">
        <Building2Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[15px] font-[510]">{title}</p>
        <p className="mt-1 text-[15px] leading-relaxed text-pretty text-muted-foreground [&_strong]:font-[510] [&_strong]:text-foreground">
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
      <div className="flex flex-col p-6 sm:p-8">
        <div className="flex h-6 items-center justify-between gap-3">
          <h2 id="pro-title" className="text-[17px]">
            Stroke Pro
          </h2>
          <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[12px] font-[510] text-soft">
            Pay once
          </span>
        </div>
        <p className="mt-7 flex items-baseline gap-2">
          <span className="text-[3rem] leading-none font-[510] tracking-[-0.03em] tabular-nums">
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

      <div className="border-t border-white/[0.08] p-6 sm:p-8 lg:border-t-0 lg:border-l">
        <p className="text-[13px] font-[510] text-muted-foreground">What you get</p>
        <ul className="mt-5 space-y-3.5">
          {PRO_PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-3 text-[15px]">
              <CheckIcon className="mt-[3px] size-4 shrink-0 text-foreground" strokeWidth={2} />
              <span className="text-pretty text-soft">{perk}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 border-t border-white/[0.08] pt-5 text-[15px] text-pretty text-muted-foreground">
          Try every feature free for 17 days first, no account needed.
        </p>
      </div>
    </section>
  );
}

/** The license the account holds: status, the facts, and the key itself. */
function LicenseCard({
  license,
  dateLabel = "Purchased",
}: {
  license: {
    licenseKey: string;
    plan: string;
    maxDevices: number;
    createdAt: string | number | Date;
    expiresAt: string | number | Date | null;
  };
  dateLabel?: string;
}) {
  const facts = [
    { label: "Plan", value: <span className="capitalize">{license.plan}</span> },
    {
      label: "Devices",
      value: `${license.maxDevices} ${license.maxDevices === 1 ? "device" : "devices"}`,
    },
    { label: dateLabel, value: formatDate(license.createdAt) },
  ];

  return (
    <section aria-labelledby="license-title" className={cn(PLAN_CARD, "p-6 sm:p-8")}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id="license-title" className="text-xl">
            Stroke <span className="capitalize">{license.plan}</span>
          </h2>
          <p className="mt-2 text-[15px] text-muted-foreground">
            {license.expiresAt
              ? `Test license · expires ${formatDate(license.expiresAt)}`
              : "Lifetime license · no expiry, no renewals"}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[13px] font-[510]",
            ACTIVE_PILL,
          )}
        >
          <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
          Active
        </span>
      </div>

      {/* Label-value rows on phones, three columns from sm up. */}
      <dl className="mt-7 grid grid-cols-1 border-t border-white/[0.08] sm:grid-cols-3 sm:pt-6">
        {facts.map((f) => (
          <div
            key={f.label}
            className="flex min-w-0 items-baseline justify-between gap-4 border-white/[0.08] py-3 not-first:border-t sm:block sm:py-0 sm:not-first:border-t-0 sm:not-first:border-l sm:not-first:pl-6"
          >
            <dt className="text-[13px] text-muted-foreground">{f.label}</dt>
            <dd className="truncate text-[15px] font-[510] tabular-nums sm:mt-1.5">{f.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 text-[13px] font-[510] text-muted-foreground sm:mt-8">License key</p>
      <LicenseKeyField licenseKey={license.licenseKey} />
      <p className="mt-4 text-[15px] text-pretty text-muted-foreground">
        Open <span className="text-foreground">Stroke</span> →{" "}
        <span className="text-foreground">Settings → License</span> and paste your key to activate.
      </p>
    </section>
  );
}

/** The key, masked until revealed, with a copy button that never changes width. */
function LicenseKeyField({ licenseKey }: { licenseKey: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyKey() {
    await navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    toast.success("License key copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-2 flex items-start gap-1 rounded-xl border border-white/[0.08] bg-black/40 py-1 pr-1 pl-4">
      <code
        className={cn(
          "min-w-0 flex-1 py-2 font-mono text-[13px] leading-relaxed text-soft",
          revealed ? "break-all" : "truncate",
        )}
      >
        {revealed ? licenseKey : licenseKey.slice(0, 6) + "•".repeat(42)}
      </code>
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        aria-label={revealed ? "Hide license key" : "Show license key"}
        aria-pressed={revealed}
        title={revealed ? "Hide key" : "Reveal key"}
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 outline-none hover:bg-white/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {revealed ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
      </button>
      <button
        type="button"
        onClick={copyKey}
        className="flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-[13px] text-muted-foreground transition-colors duration-150 outline-none hover:bg-white/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? <CheckIcon className="size-4 text-[#4cb782]" /> : <CopyIcon className="size-4" />}
        {/* Both labels share one grid cell, so the button never changes width. */}
        <span className="grid">
          <span className={cn("col-start-1 row-start-1", copied && "invisible")}>Copy</span>
          <span className={cn("col-start-1 row-start-1", !copied && "invisible")}>Copied</span>
        </span>
      </button>
    </div>
  );
}
