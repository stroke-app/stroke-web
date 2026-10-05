import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRightIcon,
  CheckIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  ShieldCheckIcon,
  ZapIcon,
} from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";
import { toast } from "sonner";

import { SmartDownloadButton } from "#/components/download-button";
import { buttonVariants } from "#/components/ui/button";
import { useAuth } from "#/lib/auth/hooks";
import { billingQueryOptions, licenseQueryOptions } from "#/lib/billing/functions";
import { cn } from "#/lib/utils";

const RELEASES_URL = "https://github.com/stroke-app/stroke/releases";

// Card shell and the well inset inside it. Concentric: 18px outer = 10px inner + 8px inset.
const CARD = "rounded-2xl border border-border/60 bg-card";
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

function Dashboard() {
  const { user } = useAuth();
  const billing = useQuery(billingQueryOptions());
  const licenseQuery = useQuery(licenseQueryOptions());
  const subscription = billing.data;
  const license = licenseQuery.data;

  const loading = billing.isPending || licenseQuery.isPending;
  const isPro = subscription?.status === "active";

  return (
    <div className="mx-auto max-w-2xl">
      <header>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-2xl leading-tight font-medium tracking-[-0.02em] text-balance">
            {user?.name}
          </h1>
          {!loading && <PlanBadge pro={isPro} />}
        </div>
        <p className="mt-1 text-sm break-words text-muted-foreground">{user?.email}</p>
      </header>

      <div className="mt-8 flex flex-col gap-4">
        {loading ? (
          <div aria-hidden="true" className={cn(CARD, "h-48 animate-pulse bg-muted/40")} />
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

        <section className={cn(CARD, "p-5")}>
          <h2 className="text-sm font-medium">Stroke for desktop</h2>
          <p className="mt-1 text-sm text-muted-foreground">macOS, Windows, and Linux.</p>
          <div className="mt-4 flex flex-wrap items-start gap-2">
            <SmartDownloadButton size="default" variant={isPro ? "default" : "outline"} />
            <a
              href={RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "ghost" })}
            >
              All releases
              <ArrowUpRightIcon className="size-3.5" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

function PlanBadge({ pro }: { pro: boolean }) {
  return pro ? (
    <span className="inline-flex h-6 items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 text-xs font-medium whitespace-nowrap text-emerald-600 dark:text-emerald-400">
      <ZapIcon className="size-3" />
      Pro
    </span>
  ) : (
    <span className="inline-flex h-6 items-center rounded-full bg-muted px-2.5 text-xs font-medium whitespace-nowrap text-muted-foreground">
      Free
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
  const meta = [
    term,
    `${maxDevices} ${maxDevices === 1 ? "device" : "devices"}`,
    since ? `Since ${formatDate(since)}` : null,
  ].filter(Boolean);

  return (
    <section className={CARD}>
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <KeyRoundIcon className="size-4 text-muted-foreground" />
            <span className="capitalize">{plan}</span> license
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{meta.join(" · ")}</p>
        </div>
        <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 text-xs font-medium whitespace-nowrap text-emerald-600 dark:text-emerald-400">
          <span className="size-1.5 rounded-full bg-current" />
          Active
        </span>
      </div>

      {/* The key text starts at 8px inset + 12px padding = the card's 20px text edge. */}
      <div className="mx-2 flex items-center gap-1 rounded-lg bg-muted/60 py-1 pr-1 pl-3">
        <code
          className={cn(
            "min-w-0 flex-1 py-1.5 font-mono text-sm text-foreground/90",
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
          className="flex size-8 shrink-0 items-center justify-center self-start rounded-sm text-muted-foreground transition-[background-color,color,scale] duration-150 ease-out hover:bg-foreground/8 hover:text-foreground active:scale-[0.96]"
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
          className="flex h-8 shrink-0 items-center gap-1.5 self-start rounded-sm px-2.5 text-sm text-muted-foreground transition-[background-color,color,scale] duration-150 ease-out hover:bg-foreground/8 hover:text-foreground active:scale-[0.96]"
        >
          <span className="relative">
            <CheckIcon
              className={cn(
                "absolute inset-0 size-4 text-emerald-500",
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

      <p className="px-5 pt-4 pb-5 text-sm text-pretty text-muted-foreground">
        Open <span className="font-medium text-foreground">Stroke</span>, go to{" "}
        <span className="font-medium text-foreground">Settings → License</span>, and paste your key
        to activate.
      </p>
    </section>
  );
}

/** Paid, but the key hasn't been issued yet (the payment webhook can lag). */
function PendingLicenseCard() {
  return (
    <section className={cn(CARD, "p-5")}>
      <h2 className="text-sm font-medium">Your license is on its way</h2>
      <p className="mt-1 text-sm text-pretty text-muted-foreground">
        Your payment went through. The key usually appears within a minute.
      </p>
      <Link to="/app/billing" className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
        Check status
      </Link>
    </section>
  );
}

function UpsellCard({ lapsed }: { lapsed: string | null }) {
  return (
    <section className={CARD}>
      <div className="px-5 pt-5 pb-4">
        <h2 className="text-sm font-medium">Stroke Pro, yours for life</h2>
        <p className="mt-1 text-sm text-pretty text-muted-foreground">
          One-time purchase. All features, all platforms, free updates forever.
        </p>
        {lapsed && (
          <p className="mt-2 text-sm text-muted-foreground">
            Previous plan: <span className="capitalize">{lapsed}</span>
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-border/60 px-5 py-4">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheckIcon className="size-3.5 shrink-0" />
          Secure checkout via Dodo Payments
        </p>
        <Link
          to="/app/billing"
          onClick={() => posthog.capture("buy_license_clicked", { source: "app_home" })}
          className={buttonVariants()}
        >
          <KeyRoundIcon className="size-3.5" />
          Buy license
        </Link>
      </div>
    </section>
  );
}
