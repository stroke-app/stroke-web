import { createFileRoute, Link } from "@tanstack/react-router";
import * as z from "zod";

import { PageHeader, PageShell, siteButton } from "#/components/page";
import { SponsorButton, SponsorProgress } from "#/components/sponsor-goal";
import { REPO_URL, seo } from "#/lib/seo";
import {
  SIGNING_GOAL_USD,
  SIGNING_GOALS,
  SPONSOR_MAILTO,
  SPONSOR_TIERS,
  SPONSOR_URL,
  sponsorsIn,
  type Sponsor,
  type SponsorTier,
  type SponsorTierId,
} from "#/lib/sponsors";
import { sponsorStatusQueryOptions } from "#/lib/sponsors/functions";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/sponsors")({
  validateSearch: z.object({ thanks: z.string().optional() }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(sponsorStatusQueryOptions()).catch(() => null),
  head: () =>
    seo({
      title: "Sponsor Stroke · Help sign it for macOS and Windows",
      description:
        "Help pay for the Apple and Windows signing certificates that let Stroke install without warnings. Give any amount; it goes to the certificates first.",
      path: "/sponsors",
      breadcrumbs: [{ name: "Sponsors", path: "/sponsors" }],
    }),
  component: SponsorsPage,
});

/** Logo grid columns and slot height per tier: bigger tiers get bigger slots. */
const TIER_LAYOUT: Record<SponsorTierId, { grid: string; slot: string }> = {
  platinum: { grid: "grid-cols-1 sm:grid-cols-2", slot: "h-36 md:h-44" },
  gold: { grid: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", slot: "h-28 md:h-32" },
  silver: { grid: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4", slot: "h-20 md:h-24" },
  backers: { grid: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4", slot: "h-12" },
};

const SLOT = "flex min-w-0 items-center justify-center rounded-xl border px-6 transition-colors";

function SponsorSlot({ sponsor, slot }: { sponsor: Sponsor; slot: string }) {
  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="noopener sponsored"
      className={cn(SLOT, slot, "border-border bg-card hover:bg-raised")}
    >
      {sponsor.logo ? (
        <img
          src={sponsor.logo}
          alt={sponsor.name}
          className="max-h-[50%] max-w-[70%] object-contain"
        />
      ) : (
        <span className="truncate text-[15px] font-medium">{sponsor.name}</span>
      )}
    </a>
  );
}

/** The open slot at the end of every tier: a dashed outline that leads to the sponsor page. */
function OpenSlot({ tier, slot, first }: { tier: SponsorTier; slot: string; first: boolean }) {
  const backers = tier.id === "backers";
  return (
    <a
      href={SPONSOR_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        SLOT,
        slot,
        "flex-col gap-1 border-dashed border-ink/[0.14] text-center text-muted-foreground hover:border-ink/30 hover:text-foreground",
        // An empty tier is a single wide slot, not one lonely cell.
        first && "col-span-full",
      )}
    >
      <span className="text-[15px] font-medium text-soft">
        {backers ? "Your name here" : "Your logo here"}
      </span>
      {first && !backers && (
        <span className="text-[13px] text-pretty">
          Be the first {tier.label.toLowerCase()} sponsor
        </span>
      )}
    </a>
  );
}

function TierSection({ tier }: { tier: SponsorTier }) {
  const sponsors = sponsorsIn(tier.id);
  const layout = TIER_LAYOUT[tier.id];
  return (
    <section id={tier.id} aria-labelledby={`${tier.id}-title`} className="scroll-mt-24">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border pb-5">
        <h2 id={`${tier.id}-title`} className="text-[1.75rem] md:text-[2rem]">
          {tier.label}
        </h2>
        {sponsors.length > 0 && (
          <span className="text-sm text-muted-foreground tabular-nums">{sponsors.length}</span>
        )}
        <span className="w-full text-sm text-pretty text-muted-foreground sm:ml-auto sm:w-auto">
          {tier.note}
        </span>
      </div>
      <div className={cn("mt-6 grid gap-3", layout.grid)}>
        {sponsors.map((s) => (
          <SponsorSlot key={s.url} sponsor={s} slot={layout.slot} />
        ))}
        <OpenSlot tier={tier} slot={layout.slot} first={sponsors.length === 0} />
      </div>
    </section>
  );
}

function SponsorsPage() {
  const { thanks } = Route.useSearch();
  return (
    <PageShell>
      <PageHeader
        eyebrow="Sponsor"
        title="Help sign Stroke for macOS and Windows."
        description={`Right now macOS warns that Stroke is from an unidentified developer, and Windows SmartScreen calls the installer unrecognized. Signing certificates fix both, and they cost $${SIGNING_GOAL_USD} a year. Give any amount: every dollar goes to them first.`}
        actions={
          <>
            <SponsorButton />
            <a
              href={SPONSOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={siteButton({ variant: "secondary", size: "lg" })}
            >
              GitHub Sponsors
            </a>
          </>
        }
      >
        {thanks && (
          <p
            role="status"
            className="mt-8 max-w-xl rounded-[24px] bg-card bg-ink/[0.05] px-5 py-4 text-[15px] text-soft"
          >
            <span className="font-medium text-foreground">Thank you.</span> Your sponsorship is on
            its way to the goal below. It can take a minute to show.
          </p>
        )}
      </PageHeader>

      <section aria-label="Progress" className="border-t border-border">
        <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="rounded-[24px] bg-card px-6 py-12 md:px-10 lg:px-14">
            <SponsorProgress />
            <p className="mt-6 text-[14px] leading-relaxed text-pretty text-muted-foreground">
              Counted over the last 12 months, since both certificates renew yearly. Anything above
              the goal pays for build machines and new database engines.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
            {SIGNING_GOALS.map((g) => (
              <li key={g.id} className="rounded-[24px] bg-card p-6 md:p-8">
                <p className="text-[13px] text-muted-foreground tabular-nums">${g.usd} a year</p>
                <p className="mt-3 text-[16px] font-medium">{g.title}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-pretty text-muted-foreground">
                  {g.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-label="How it works" className="border-t border-border">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          {[
            {
              t: "Pick the amount.",
              b: "$5, $50, or whatever you like. Checkout is handled by Dodo Payments, card or wallet.",
            },
            {
              t: "It goes to signing first.",
              b: "Until the year's certificates are paid, nothing else comes out of it.",
            },
            {
              t: "Companies get a logo.",
              b: "Sponsoring as a team? Email me and your logo goes on this page.",
            },
          ].map((x) => (
            <div key={x.t} className="rounded-[24px] bg-card p-6 md:p-8">
              <p className="text-[15px] leading-[1.55] text-pretty text-muted-foreground">
                <span className="font-medium text-foreground">{x.t}</span> {x.b}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-border px-6 py-16 md:px-10 lg:px-14">
        <div className="space-y-16">
          {SPONSOR_TIERS.map((tier) => (
            <TierSection key={tier.id} tier={tier} />
          ))}
        </div>
        <p className="mt-14 max-w-2xl text-[15px] leading-relaxed text-pretty text-muted-foreground">
          Need an invoice or a different arrangement?{" "}
          <a
            href={SPONSOR_MAILTO}
            className="text-foreground underline decoration-ink/25 underline-offset-4 hover:decoration-ink/60"
          >
            Email me about sponsoring
          </a>
          . Prefer code over money? The{" "}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline decoration-ink/25 underline-offset-4 hover:decoration-ink/60"
          >
            source is on GitHub
          </a>{" "}
          and the{" "}
          <Link
            to="/roadmap"
            className="text-foreground underline decoration-ink/25 underline-offset-4 hover:decoration-ink/60"
          >
            roadmap
          </Link>{" "}
          says what's next.
        </p>
      </div>
    </PageShell>
  );
}
