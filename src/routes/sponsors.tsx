import { createFileRoute, Link } from "@tanstack/react-router";

import { NextLinks, PageBody, PageHeader, PageShell, siteButton } from "#/components/page";
import { REPO_URL, seo } from "#/lib/seo";
import {
  SPONSOR_MAILTO,
  SPONSOR_TIERS,
  SPONSOR_URL,
  sponsorsIn,
  type Sponsor,
  type SponsorTier,
  type SponsorTierId,
} from "#/lib/sponsors";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/sponsors")({
  head: () =>
    seo({
      title: "Sponsors · Stroke database client",
      description:
        "Sponsor Stroke, the fast native database client built in the open. Sponsorship pays for development time, signed builds, and new database engines.",
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
        "flex-col gap-1 border-dashed border-white/[0.14] text-center text-muted-foreground hover:border-white/30 hover:text-foreground",
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
  return (
    <PageShell>
      <PageHeader
        eyebrow="Sponsors"
        title="Sponsor Stroke"
        description="Stroke is a fast, native database client, with its source on GitHub. Sponsorship pays for the time to keep it fast, the signed builds on every platform, and the next database engines."
        actions={
          <>
            <a
              href={SPONSOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={siteButton({ size: "lg" })}
            >
              Become a sponsor
            </a>
            <a href={SPONSOR_MAILTO} className={siteButton({ variant: "ghost", size: "lg" })}>
              Email about sponsoring
            </a>
          </>
        }
      />
      <PageBody wide>
        <div className="space-y-16 md:space-y-20">
          {SPONSOR_TIERS.map((tier) => (
            <TierSection key={tier.id} tier={tier} />
          ))}
        </div>

        <p className="mt-16 max-w-2xl text-[15px] leading-relaxed text-pretty text-muted-foreground">
          Sponsorships run through GitHub Sponsors, monthly or one time. If your company needs an
          invoice or a different arrangement, email us.
        </p>

        <NextLinks>
          <Link to="/roadmap">See what's being built →</Link>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            Stroke on GitHub →
          </a>
        </NextLinks>
      </PageBody>
    </PageShell>
  );
}
