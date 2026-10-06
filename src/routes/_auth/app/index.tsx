import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  CheckIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  HelpCircleIcon,
  PlugIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";
import { toast } from "sonner";

import { BrewCommand, SmartDownloadButton } from "#/components/download-button";
import { siteButton } from "#/components/page";
import { useAuth } from "#/lib/auth/hooks";
import { billingQueryOptions, licenseQueryOptions } from "#/lib/billing/functions";
import { cn } from "#/lib/utils";

const RELEASES_URL = "https://github.com/stroke-app/stroke/releases";

const CARD = "rounded-xl border border-border bg-card";
const ICON_SWAP = "transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]";

export const Route = createFileRoute("/_auth/app/")({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(billingQueryOptions());
    context.queryClient.prefetchQuery(licenseQueryOptions());
  },
  component: Dashboard,
});

/** Fixed locale and zone, so the server and the browser render the same day. */
function formatDate(value: string | number | Date) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

const QUICK_LINKS = [
  {
    to: "/docs" as const,
    icon: BookOpenIcon,
    title: "Getting started",
    body: "Connect your first database in a minute.",
  },
  {
    to: "/docs/mcp" as const,
    icon: PlugIcon,
    title: "Connect an agent",
    body: "Hand Stroke's MCP server to Claude or Cursor.",
  },
  {
    to: "/changelog" as const,
    icon: SparklesIcon,
    title: "What's new",
    body: "Every release, with what changed.",
  },
  {
    to: "/app/support" as const,
    icon: HelpCircleIcon,
    title: "Support",
    body: "Questions, bugs, or a license problem.",
  },
];

function Dashboard() {
  const { user } = useAuth();
  const billing = useQuery(billingQueryOptions());
  const licenseQuery = useQuery(licenseQueryOptions());
  const subscription = billing.data;
  const license = licenseQuery.data;

  const loading = billing.isPending || licenseQuery.isPending;
  const isPro = subscription?.status === "active";
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="mx-auto max-w-3xl">
      <header>
        <h1 className="text-[1.75rem] leading-tight md:text-[2rem]">
          {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px] text-muted-foreground">
          <span className="break-all">{user?.email}</span>
          {!loading && <PlanBadge pro={isPro} />}
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-4">
        {loading ? (
          <div aria-hidden="true" className={cn(CARD, "h-52 animate-pulse bg-white/[0.02]")} />
        ) : isPro && license ? (
          <LicenseCard
            licenseKey={license.licenseKey}
            plan={license.plan}
            maxDevices={license.maxDevices}
            expiresAt={license.expiresAt}
            since={subscription?.createdAt}
            recurring={!!subscription?.currentPeriodEnd}
          />
        ) : isPro ? (
          <PendingLicenseCard />
        ) : (
          <UpsellCard
            lapsed={subscription ? `${subscription.plan} · ${subscription.status}` : null}
          />
        )}

        <section className={cn(CARD, "p-6")}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[15px] font-[510]">Stroke for desktop</h2>
            <p className="text-[13px] text-muted-foreground">macOS, Windows, and Linux</p>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <SmartDownloadButton size="default" variant={isPro ? "default" : "outline"} />
            <a
              href={RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={siteButton({ variant: "ghost" })}
            >
              All releases
              <ArrowUpRightIcon className="size-3.5" />
            </a>
          </div>
          <BrewCommand className="mt-4 w-full max-w-md" />
        </section>
      </div>

      <ul className="mt-10 grid grid-cols-1 border-t border-l border-border sm:grid-cols-2">
        {QUICK_LINKS.map((link) => (
          <li key={link.to} className="border-r border-b border-border">
            <Link
              to={link.to}
              className="group flex h-full gap-4 p-5 transition-colors hover:bg-white/[0.02]"
            >
              <link.icon
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[14px] font-[510]">
                  {link.title}
                  <ArrowRightIcon className="size-3.5 text-muted-foreground opacity-0 transition-[opacity,translate] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </span>
                <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">
                  {link.body}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlanBadge({ pro }: { pro: boolean }) {
  return (
    <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full bg-white/[0.06] px-2 text-[12px] font-[510] text-soft">
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", pro ? "bg-[#4cb782]" : "bg-white/40")}
      />
      {pro ? "Pro" : "Free"}
    </span>
  );
}

function LicenseCard({
  licenseKey,
  plan,
  maxDevices,
  expiresAt,
  since,
  recurring,
}: {
  licenseKey: string;
  plan: string;
  maxDevices: number;
  expiresAt: string | number | Date | null | undefined;
  since: string | number | Date | null | undefined;
  recurring: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyKey() {
    await navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    toast.success("License key copied");
    setTimeout(() => setCopied(false), 2000);
  }

  const term = expiresAt
    ? `Expires ${formatDate(expiresAt)}`
    : recurring
      ? "Subscription"
      : "Lifetime";
  const details = [
    { label: "Plan", value: <span className="capitalize">{plan}</span> },
    { label: "Term", value: term },
    { label: "Devices", value: `Up to ${maxDevices}` },
    ...(since ? [{ label: "Since", value: formatDate(since) }] : []),
  ];

  return (
    <section className={CARD}>
      <div className="flex items-center justify-between gap-4 px-6 pt-6">
        <h2 className="text-[15px] font-[510]">Your license</h2>
        <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full bg-[#4cb782]/10 px-2 text-[12px] font-[510] text-[#4cb782]">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
          Active
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-y-4 px-6 sm:grid-cols-4">
        {details.map((d) => (
          <div key={d.label}>
            <dt className="text-[12px] text-muted-foreground">{d.label}</dt>
            <dd className="mt-1 text-[14px]">{d.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mx-6 mt-6 flex items-center gap-1 rounded-lg border border-border bg-background py-1 pr-1 pl-3.5">
        <code
          className={cn(
            "min-w-0 flex-1 py-1.5 font-mono text-[13px] text-soft",
            revealed ? "break-all" : "truncate",
          )}
        >
          {revealed
            ? licenseKey
            : licenseKey.slice(0, 6) + "•".repeat(Math.max(licenseKey.length - 6, 0))}
        </code>
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? "Hide license key" : "Show license key"}
          aria-pressed={revealed}
          title={revealed ? "Hide key" : "Show key"}
          className="flex size-8 shrink-0 items-center justify-center self-start rounded-md text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
        >
          <span className="relative">
            <EyeOffIcon
              className={cn(
                "absolute inset-0 size-4",
                ICON_SWAP,
                revealed ? "blur-0 scale-100 opacity-100" : "scale-[0.25] opacity-0 blur-[4px]",
              )}
            />
            <EyeIcon
              className={cn(
                "size-4",
                ICON_SWAP,
                revealed ? "scale-[0.25] opacity-0 blur-[4px]" : "blur-0 scale-100 opacity-100",
              )}
            />
          </span>
        </button>
        <button
          type="button"
          onClick={copyKey}
          className="flex h-8 shrink-0 items-center gap-1.5 self-start rounded-md px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
        >
          <span className="relative">
            <CheckIcon
              className={cn(
                "absolute inset-0 size-4 text-[#4cb782]",
                ICON_SWAP,
                copied ? "blur-0 scale-100 opacity-100" : "scale-[0.25] opacity-0 blur-[4px]",
              )}
            />
            <CopyIcon
              className={cn(
                "size-4",
                ICON_SWAP,
                copied ? "scale-[0.25] opacity-0 blur-[4px]" : "blur-0 scale-100 opacity-100",
              )}
            />
          </span>
          {/* Both labels share one grid cell, so the button never changes width. */}
          <span className="grid">
            <span className={cn("col-start-1 row-start-1", copied && "invisible")}>Copy</span>
            <span className={cn("col-start-1 row-start-1", !copied && "invisible")}>Copied</span>
          </span>
        </button>
      </div>

      <p className="px-6 pt-4 pb-6 text-[13px] text-pretty text-muted-foreground">
        Open <span className="text-foreground">Stroke</span>, go to{" "}
        <span className="text-foreground">Settings → License</span>, and paste your key to activate.
        Manage devices on{" "}
        <Link
          to="/app/billing"
          className="text-foreground underline decoration-white/25 underline-offset-[3px] hover:decoration-white/60"
        >
          License &amp; billing
        </Link>
        .
      </p>
    </section>
  );
}

/** Paid, but the key hasn't been issued yet (the payment webhook can lag). */
function PendingLicenseCard() {
  return (
    <section className={cn(CARD, "p-6")}>
      <h2 className="text-[15px] font-[510]">Your license is on its way</h2>
      <p className="mt-1.5 text-[14px] text-pretty text-muted-foreground">
        Your payment went through. The key usually appears within a minute.
      </p>
      <Link to="/app/billing" className={cn(siteButton({ variant: "secondary" }), "mt-5")}>
        Check status
      </Link>
    </section>
  );
}

const PRO_PERKS = [
  "Yours forever, nothing to cancel",
  "Up to 2 devices at once",
  "Every future update included",
  "Priority support",
];

function UpsellCard({ lapsed }: { lapsed: string | null }) {
  return (
    <section className={cn(CARD, "overflow-hidden")}>
      <div className="grid gap-8 p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <h2 className="text-[15px] font-[510]">Stroke Pro</h2>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-[2.5rem] leading-none font-[510] tracking-[-0.03em] tabular-nums">
              $9.99
            </span>
            <span className="text-[14px] text-muted-foreground">once</span>
          </p>
          <p className="mt-2 text-[14px] text-pretty text-muted-foreground">
            One payment. Every feature on every platform, yours for good.
          </p>
          {lapsed && (
            <p className="mt-2 text-[13px] text-muted-foreground">
              Previous plan: <span className="capitalize">{lapsed}</span>
            </p>
          )}
        </div>
        <ul className="space-y-2 text-[13px] text-muted-foreground">
          {PRO_PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-2">
              <CheckIcon className="size-3.5 text-foreground" strokeWidth={2.25} />
              {perk}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-border bg-white/[0.015] px-6 py-4">
        <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <ShieldCheckIcon className="size-3.5 shrink-0" />
          Secure checkout via Dodo Payments
        </p>
        <Link
          to="/app/billing"
          onClick={() => posthog.capture("buy_license_clicked", { source: "app_home" })}
          className={siteButton()}
        >
          Buy Stroke · $9.99
        </Link>
      </div>
    </section>
  );
}
