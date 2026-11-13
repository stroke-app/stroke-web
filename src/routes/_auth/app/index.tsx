import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  CheckIcon,
  HelpCircleIcon,
  PlugIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";
import posthog from "posthog-js";

import { appButton, Badge, Card, CardBody, CardFooter, CardHeader } from "#/components/app-ui";
import { DesktopSessions } from "#/components/desktop-sessions";
import { BrewCommand, SmartDownloadButton } from "#/components/download-button";
import { LicensePanel } from "#/components/license-panel";
import { SyncStatus } from "#/components/sync-status";
import { useAuth } from "#/lib/auth/hooks";
import {
  billingQueryOptions,
  devicesQueryOptions,
  licenseQueryOptions,
} from "#/lib/billing/functions";
import { desktopSessionsQueryOptions } from "#/lib/desktop/functions";
import { RELEASES_URL } from "#/lib/releases";
import { syncStatusQueryOptions } from "#/lib/sync/functions";

export const Route = createFileRoute("/_auth/app/")({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(billingQueryOptions());
    context.queryClient.prefetchQuery(licenseQueryOptions());
    context.queryClient.prefetchQuery(devicesQueryOptions());
    context.queryClient.prefetchQuery(desktopSessionsQueryOptions());
    context.queryClient.prefetchQuery(syncStatusQueryOptions());
  },
  component: Dashboard,
});

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
  // A license is what unlocks the app, whether bought or covered by a team.
  const isPro = !!license || subscription?.status === "active";
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.02em]">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </h1>
          <p className="mt-1.5 truncate text-[14px] text-muted-foreground">{user?.email}</p>
        </div>
        {!loading && !isPro && <Badge>Free plan</Badge>}
      </header>

      {loading ? (
        <div aria-hidden="true" className="h-48 animate-pulse rounded-lg bg-muted/60" />
      ) : license ? (
        <LicensePanel
          license={license}
          since={subscription?.createdAt ?? license.createdAt}
          recurring={!!subscription?.currentPeriodEnd}
        />
      ) : isPro ? (
        <PendingLicenseCard />
      ) : (
        <UpsellCard
          lapsed={subscription ? `${subscription.plan} · ${subscription.status}` : null}
        />
      )}

      <Card aria-labelledby="desktop-title">
        <CardHeader
          id="desktop-title"
          title="Stroke for desktop"
          description="macOS, Windows, and Linux. Updates install themselves."
          action={
            <a
              href={RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={appButton({ variant: "ghost", size: "sm" })}
            >
              All releases
              <ArrowUpRightIcon className="size-3.5" />
            </a>
          }
        />
        <CardBody className="flex flex-col gap-4">
          <SmartDownloadButton size="default" variant={isPro ? "default" : "outline"} />
          <BrewCommand className="w-full max-w-md" />
        </CardBody>
      </Card>

      <DesktopSessions />

      <SyncStatus />

      <Card aria-labelledby="resources-title">
        <CardHeader id="resources-title" title="Resources" />
        <ul className="mt-2 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          {QUICK_LINKS.map((link) => (
            <li key={link.to} className="border-b border-border">
              <Link
                to={link.to}
                className="group -mx-2 flex items-start gap-3 rounded-md px-2 py-3.5 transition-colors hover:bg-accent/50"
              >
                <link.icon
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <span className="min-w-0 flex-1">
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
      </Card>
    </div>
  );
}

/** Paid, but the key hasn't been issued yet (the payment webhook can lag). */
function PendingLicenseCard() {
  return (
    <Card className="border-t-0 pt-0">
      <CardHeader
        title="Your license is on its way"
        description="Your payment went through. The key usually appears within a minute."
        action={
          <Link to="/app/billing" className={appButton({ variant: "secondary", size: "sm" })}>
            Check status
          </Link>
        }
      />
    </Card>
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
    <Card aria-labelledby="upsell-title" className="border-t-0 pt-0">
      <CardBody className="grid gap-6 pt-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <h2 id="upsell-title" className="text-[15px] font-semibold">
            Stroke Pro
          </h2>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-[2.25rem] leading-none font-semibold tracking-[-0.03em] tabular-nums">
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
      </CardBody>
      <CardFooter className="mt-5 border-t border-border">
        <span className="flex items-center gap-1.5">
          <ShieldCheckIcon className="size-3.5 shrink-0" />
          Secure checkout via Dodo Payments
        </span>
        <Link
          to="/app/billing"
          onClick={() => posthog.capture("buy_license_clicked", { source: "app_home" })}
          className={appButton({ size: "sm" })}
        >
          Buy Stroke · $9.99
        </Link>
      </CardFooter>
    </Card>
  );
}
