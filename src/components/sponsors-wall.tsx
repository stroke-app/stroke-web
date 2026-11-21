import { Link } from "@tanstack/react-router";
import { ChevronRightIcon, HeartIcon, PlusIcon } from "lucide-react";

import { FRAME, GUTTER } from "#/components/page";
import { SponsorButton } from "#/components/sponsor-goal";
import { SPONSOR_MAILTO, sponsorsIn, type Sponsor } from "#/lib/sponsors";
import { cn } from "#/lib/utils";

/**
 * The sponsors, on every page above the footer: a large partner card, a grid
 * of gold tiles and a line of backers. Real sponsors fill the slots first
 * (`SPONSORS` in lib/sponsors.ts); the rest stay open and say how to take one.
 */

const GOLD_SLOTS = 8;

function Logo({ s, large }: { s: Sponsor; large?: boolean }) {
  return s.logo ? (
    <img
      src={s.logo}
      alt={s.name}
      className={cn("object-contain", large ? "max-h-16 max-w-[70%]" : "max-h-10 max-w-[70%]")}
    />
  ) : (
    <span className={cn("font-semibold tracking-[-0.02em]", large ? "text-[28px]" : "text-[16px]")}>
      {s.name}
    </span>
  );
}

function OpenSlot({ label, className }: { label: string; className?: string }) {
  return (
    <a
      href={SPONSOR_MAILTO}
      className={cn(
        "group flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/15 text-muted-foreground transition-[border-color,background-color,color] duration-200 hover:border-[var(--amber)] hover:bg-[var(--amber)]/[0.06] hover:text-foreground",
        className,
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-background shadow-[var(--shadow-card)] transition-transform duration-200 group-hover:scale-110">
        <PlusIcon className="size-4" strokeWidth={2} />
      </span>
      <span className="text-[12.5px] font-medium">{label}</span>
    </a>
  );
}

export function SponsorsWall() {
  const partner = sponsorsIn("platinum")[0];
  const gold = sponsorsIn("gold").slice(0, GOLD_SLOTS);
  const backers = sponsorsIn("backers");
  return (
    <section aria-labelledby="sponsors-wall-title" className="bg-[var(--band)]">
      <div className={cn(FRAME, GUTTER, "py-24 md:py-28")}>
        <div className="flex flex-col items-center text-center">
          <p className="flex items-center gap-2 text-[14px] font-medium text-[var(--link)]">
            <HeartIcon className="size-[15px]" strokeWidth={2} />
            Sponsors
          </p>
          <h2 id="sponsors-wall-title" className="mt-3 text-[2.25rem] text-balance md:text-[3rem]">
            Built by one developer.
            <span className="title-sub block">Kept going by sponsors.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[17px] leading-[1.55] text-pretty text-muted-foreground">
            Sponsorships pay for the certificates that sign Stroke on macOS and Windows. Your logo
            goes here, on every page of this site.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:gap-5">
          <div className="flex flex-col">
            <p className="mb-3 text-[13px] font-semibold">Signing partner</p>
            {partner ? (
              <a
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex min-h-[15rem] flex-1 items-center justify-center overflow-hidden rounded-[28px] bg-background shadow-[var(--shadow-card)]"
              >
                <Logo s={partner} large />
              </a>
            ) : (
              <a
                href={SPONSOR_MAILTO}
                className="group relative flex min-h-[15rem] flex-1 flex-col items-center justify-center overflow-hidden rounded-[28px] bg-background text-center shadow-[var(--shadow-card)]"
              >
                {/* Fine diagonal rain, Stroke amber, over the card. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(-55deg, color-mix(in oklab, var(--amber) 22%, transparent) 0 1px, transparent 1px 14px)",
                    maskImage: "radial-gradient(80% 70% at 50% 50%, transparent 30%, black)",
                  }}
                />
                <span className="relative flex size-14 items-center justify-center rounded-2xl bg-[var(--amber)] text-[var(--amber-ink)] shadow-[0_8px_24px_-8px_rgb(255_193_7/0.6)]">
                  <PlusIcon className="size-6" strokeWidth={2.2} />
                </span>
                <span className="relative mt-4 text-[17px] font-semibold">Your logo, largest</span>
                <span className="relative mt-1 text-[13px] text-muted-foreground">
                  First on the sponsors page and on every page here
                </span>
                <span className="relative mt-4 rounded-full bg-card px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  Open
                </span>
              </a>
            )}
          </div>

          <div className="flex flex-col">
            <p className="mb-3 text-[13px] font-semibold">Gold sponsors</p>
            <ul className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: GOLD_SLOTS }, (_, i) => {
                const s = gold[i];
                return (
                  <li key={i} className="aspect-[5/4] sm:aspect-square">
                    {s ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl bg-background p-3 shadow-[var(--shadow-card)] transition-transform duration-200 hover:-translate-y-0.5"
                      >
                        <Logo s={s} />
                        <span className="text-[13px] font-medium">{s.name}</span>
                      </a>
                    ) : (
                      <OpenSlot label="Your logo" className="h-full" />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl bg-background px-5 py-4 shadow-[var(--shadow-card)]">
          <span className="me-2 text-[13px] font-semibold">Backers</span>
          {backers.length > 0 ? (
            backers.map((b) => (
              <a
                key={b.name}
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-card px-3 py-1 text-[13px] hover:bg-accent"
              >
                {b.name}
              </a>
            ))
          ) : (
            <span className="text-[13px] text-muted-foreground">
              Any amount puts your name here, with a link.
            </span>
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
          <SponsorButton />
          <Link
            to="/sponsors"
            className="group inline-flex items-center gap-1 text-[16px] font-medium text-[var(--link)] hover:underline hover:underline-offset-4"
          >
            Tiers and where it goes
            <ChevronRightIcon
              className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
