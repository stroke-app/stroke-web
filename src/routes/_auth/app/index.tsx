import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckIcon,
  DatabaseBackupIcon,
  HelpCircleIcon,
  LaptopIcon,
  PlugIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";
import posthog from "posthog-js";

import { AccountDevices } from "#/components/account-devices";
import { appButton } from "#/components/app-ui";
import { SmartDownloadButton } from "#/components/download-button";
import { useNow } from "#/components/license-panel";
import { SyncStatus } from "#/components/sync-status";
import { useAuth } from "#/lib/auth/hooks";
import { backupsQueryOptions, formatBytes } from "#/lib/backups/client";
import { accountDevicesQueryOptions, accountPlanQueryOptions } from "#/lib/desktop/functions";
import { PRO_PRICE } from "#/lib/pricing";
import { syncStatusQueryOptions } from "#/lib/sync/functions";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/_auth/app/")({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(accountPlanQueryOptions());
    context.queryClient.prefetchQuery(accountDevicesQueryOptions());
    context.queryClient.prefetchQuery(syncStatusQueryOptions());
  },
  component: Overview,
});

const DAY = 86_400_000;

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
    body: "Questions, bugs, or a billing problem.",
  },
];

/** One status tile: a label, a big value, a line of detail and an action. */
function Stat({
  icon: Icon,
  label,
  value,
  detail,
  action,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[156px] flex-col bg-background p-5">
      <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <Icon className="size-[15px]" strokeWidth={1.75} />
        {label}
      </p>
      <p className="mt-4 text-[22px] leading-none font-semibold tracking-[-0.02em] tabular-nums">
        {value}
      </p>
      {detail && <p className="mt-2 text-[13px] text-muted-foreground">{detail}</p>}
      {children}
      {action && <div className="mt-auto pt-4 text-[13px]">{action}</div>}
    </div>
  );
}

function StatLink({
  to,
  children,
}: {
  to: React.ComponentProps<typeof Link>["to"];
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1 font-medium text-foreground hover:text-soft"
    >
      {children}
      <ArrowRightIcon className="size-3 transition-transform duration-150 group-hover:translate-x-0.5" />
    </Link>
  );
}

function PlanStat() {
  const { data: plan, isPending } = useQuery(accountPlanQueryOptions());
  const now = useNow();
  if (isPending || !plan) {
    return (
      <Stat
        icon={ShieldCheckIcon}
        label="Plan"
        value={<span className="text-muted-foreground">…</span>}
      />
    );
  }
  if (plan.status === "pro") {
    return (
      <Stat
        icon={ShieldCheckIcon}
        label="Plan"
        value="Pro"
        detail={plan.plan === "team" ? "Covered by your team" : "Yours for good"}
        action={<StatLink to="/app/billing">Receipts and details</StatLink>}
      />
    );
  }
  const left =
    plan.trialEndsAt && now !== null
      ? Math.max(0, Math.ceil((plan.trialEndsAt - now) / DAY))
      : plan.trialDays;
  const used = Math.min(1, Math.max(0, 1 - left / plan.trialDays));
  return (
    <Stat
      icon={ShieldCheckIcon}
      label="Plan"
      value={
        plan.status === "trial"
          ? `${left} ${left === 1 ? "day" : "days"} left`
          : plan.status === "ended"
            ? "Trial ended"
            : "Trial"
      }
      detail={
        plan.status === "not-started"
          ? `Starts when you sign in to the app. ${plan.trialDays} days.`
          : plan.status === "trial"
            ? "Free trial, every feature"
            : "Get Pro to keep using Stroke"
      }
      action={<StatLink to="/app/billing">Get Pro for {PRO_PRICE}</StatLink>}
    >
      {plan.status === "trial" && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-ink/[0.08]" aria-hidden="true">
          <div className="h-full rounded-full bg-copper" style={{ width: `${used * 100}%` }} />
        </div>
      )}
    </Stat>
  );
}

function Overview() {
  const { user } = useAuth();
  const { data: plan } = useQuery(accountPlanQueryOptions());
  const { data: devices } = useQuery(accountDevicesQueryOptions());
  const { data: sync } = useQuery(syncStatusQueryOptions());
  const { data: backups } = useQuery(backupsQueryOptions());
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.03em]">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </h1>
          <p className="mt-1.5 truncate text-[14px] text-muted-foreground">{user?.email}</p>
        </div>
        <SmartDownloadButton size="default" variant="outline" alternates={false} />
      </header>

      <section
        aria-label="At a glance"
        className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-border shadow-[0_0_0_1px_var(--border)] sm:grid-cols-2 lg:grid-cols-4"
      >
        <PlanStat />
        <Stat
          icon={LaptopIcon}
          label="Devices"
          value={devices ? devices.length : "…"}
          detail={
            devices
              ? `${devices.filter((d) => d.signedIn).length} signed in to this account`
              : undefined
          }
          action={
            <a href="#devices-title" className="font-medium text-foreground hover:text-soft">
              Manage
            </a>
          }
        />
        <Stat
          icon={DatabaseBackupIcon}
          label="Scheduled backups"
          value={backups ? `${backups.jobs.length} of ${backups.max_jobs}` : "…"}
          detail={backups ? `${formatBytes(backups.used_bytes)} on Stroke Cloud` : undefined}
          action={<StatLink to="/app/backups">Open backups</StatLink>}
        />
        <Stat
          icon={RefreshCwIcon}
          label="Sync"
          value={sync ? (sync.setUp ? "On" : "Off") : "…"}
          detail={sync?.setUp ? "End-to-end encrypted" : "Turn it on in the app's settings"}
          action={
            <a href="#sync" className="font-medium text-foreground hover:text-soft">
              Details
            </a>
          }
        />
      </section>

      {plan && plan.status !== "pro" && <Upsell ended={plan.status === "ended"} />}

      <AccountDevices />

      <div id="sync" className="scroll-mt-28">
        <SyncStatus />
      </div>

      <section aria-labelledby="resources-title">
        <h2 id="resources-title" className="text-[15px] font-semibold tracking-[-0.01em]">
          Resources
        </h2>
        <ul className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-border shadow-[0_0_0_1px_var(--border)] sm:grid-cols-2">
          {QUICK_LINKS.map((link) => (
            <li key={link.to} className="bg-background">
              <Link
                to={link.to}
                className="group flex h-full items-start gap-3.5 p-5 transition-colors duration-150 hover:bg-ink/[0.03]"
              >
                <link.icon
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[14px] font-medium">
                    {link.title}
                    <ArrowRightIcon className="size-3.5 text-muted-foreground opacity-0 transition-[opacity,translate] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </span>
                  <span className="mt-0.5 block text-[13px] text-muted-foreground">
                    {link.body}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const PRO_PERKS = [
  "Pay once, nothing to cancel",
  "Every future update",
  "All your computers",
  "Priority support",
];

function Upsell({ ended }: { ended: boolean }) {
  return (
    <section
      aria-labelledby="upsell-title"
      className={cn(
        "grid gap-8 rounded-xl bg-card p-6 shadow-[0_0_0_1px_var(--border)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-8",
      )}
    >
      <div>
        <h2 id="upsell-title" className="text-[18px] font-semibold tracking-[-0.02em]">
          {ended ? "Your trial has ended. Keep Stroke for " : "Keep Stroke for "}
          {PRO_PRICE}, once.
        </h2>
        <ul className="mt-4 grid grid-cols-1 gap-2 text-[14px] text-soft sm:grid-cols-2">
          {PRO_PERKS.map((p) => (
            <li key={p} className="flex items-center gap-2.5">
              <CheckIcon className="size-4 text-muted-foreground" strokeWidth={2} />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col items-start gap-2 md:items-end">
        <Link
          to="/app/billing"
          onClick={() => posthog.capture("buy_license_clicked", { source: "app_home" })}
          className={appButton({ size: "lg" })}
        >
          Buy Stroke Pro
        </Link>
        <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <ShieldCheckIcon className="size-3.5" />
          Secure checkout with Dodo Payments
        </span>
      </div>
    </section>
  );
}
