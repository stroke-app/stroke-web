import { SiApple } from "@icons-pack/react-simple-icons";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, HeartIcon } from "lucide-react";

import { WindowsLogo } from "#/components/download-targets";
import { siteButton } from "#/components/page";
import { SIGNING_GOAL_USD, SIGNING_GOALS, SPONSOR_URL } from "#/lib/sponsors";
import { sponsorStatusQueryOptions } from "#/lib/sponsors/functions";
import { cn } from "#/lib/utils";

const GOAL_ICON = { apple: SiApple, windows: WindowsLogo } as const;

export function formatUsd(cents: number) {
  const usd = cents / 100;
  return `$${usd.toLocaleString("en-US", { maximumFractionDigits: usd >= 100 ? 0 : 2 })}`;
}

/** Raised against the yearly signing goal, as a bar with the two goals marked. */
export function SponsorProgress({ className }: { className?: string }) {
  const { data } = useQuery(sponsorStatusQueryOptions());
  const raised = data?.raisedCents ?? 0;
  const goal = SIGNING_GOAL_USD * 100;
  const pct = Math.min(100, (raised / goal) * 100);
  const apple = (SIGNING_GOALS[0].usd / SIGNING_GOAL_USD) * 100;

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[28px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
          {formatUsd(raised)}
          <span className="ml-2 text-[15px] font-normal tracking-normal text-muted-foreground">
            of ${SIGNING_GOAL_USD} this year
          </span>
        </p>
        <p className="text-[13px] text-muted-foreground tabular-nums">
          {data ? `${data.sponsors} ${data.sponsors === 1 ? "sponsor" : "sponsors"}` : ""}
        </p>
      </div>
      <div
        className="relative mt-4 h-2 overflow-hidden rounded-full bg-ink/[0.08]"
        role="meter"
        aria-label="Raised toward the signing certificates"
        aria-valuemin={0}
        aria-valuemax={SIGNING_GOAL_USD}
        aria-valuenow={Math.round(raised / 100)}
      >
        <div
          className="h-full rounded-full bg-[var(--amber)] transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
        <span
          aria-hidden="true"
          className="absolute top-0 h-full w-px bg-background"
          style={{ left: `${apple}%` }}
        />
      </div>
      <div className="mt-2 flex text-[12px] text-muted-foreground">
        <span style={{ width: `${apple}%` }}>macOS · ${SIGNING_GOALS[0].usd}</span>
        <span>Windows · ${SIGNING_GOALS[1].usd}</span>
      </div>
    </div>
  );
}

/**
 * Where sponsoring happens: the Dodo checkout when the product exists, GitHub
 * Sponsors otherwise. `external` says to open it in a new tab.
 */
export function useSponsorLink() {
  const { data } = useQuery(sponsorStatusQueryOptions());
  return { href: data?.checkoutUrl ?? SPONSOR_URL, external: !data?.checkoutUrl };
}

/** The sponsor button: Dodo checkout when the product exists, GitHub Sponsors otherwise. */
export function SponsorButton({
  size = "lg",
  className,
}: {
  size?: "md" | "lg";
  className?: string;
}) {
  const { data } = useQuery(sponsorStatusQueryOptions());
  const href = data?.checkoutUrl ?? SPONSOR_URL;
  return (
    <a
      href={href}
      target={data?.checkoutUrl ? undefined : "_blank"}
      rel="noopener noreferrer"
      className={cn(siteButton({ size }), className)}
    >
      <HeartIcon className="size-4" />
      Sponsor any amount
    </a>
  );
}

/** Home page band: why, how far along, and the button, as one warm card. */
export function SponsorBand() {
  return (
    <section aria-labelledby="sponsor-title" className="mt-32 px-5 sm:px-8 md:mt-44 lg:px-10">
      <div className="grid grid-cols-1 gap-10 rounded-[32px] bg-card p-8 md:p-12 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="flex items-center gap-2 text-[14px] font-medium text-[var(--link)]">
            <HeartIcon className="size-[15px]" strokeWidth={2} />
            Sponsor
          </p>
          <h2 id="sponsor-title" className="mt-3 text-[2rem] text-balance md:text-[2.5rem]">
            Help sign Stroke.
            <span className="title-sub block">On Mac and Windows.</span>
          </h2>
          <p className="mt-5 max-w-md text-[16px] leading-[1.6] text-pretty text-muted-foreground">
            <span className="text-foreground">Signed apps install without scary warnings.</span> The
            certificates cost ${SIGNING_GOAL_USD} a year. Give any amount and it goes straight to
            them.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
            <SponsorButton />
            <Link
              to="/sponsors"
              className="group inline-flex items-center gap-1 text-[16px] font-medium text-[var(--link)] hover:underline hover:underline-offset-4"
            >
              Where it goes
              <ArrowRightIcon className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-6">
          <SponsorProgress />
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SIGNING_GOALS.map((g) => {
              const Icon = GOAL_ICON[g.id];
              return (
                <li key={g.id} className="rounded-2xl bg-raised p-5 shadow-[var(--shadow-card)]">
                  <Icon className="size-4 text-soft" />
                  <p className="mt-4 text-[14px] font-semibold">
                    {g.title}{" "}
                    <span className="font-normal text-muted-foreground">· ${g.usd}/yr</span>
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-pretty text-muted-foreground">
                    {g.body}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
