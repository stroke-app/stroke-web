import {
  SiCloudflare,
  SiPlanetscale,
  SiPosthog,
  SiPrisma,
  SiRailway,
  SiSupabase,
  SiTidb,
  SiTurso,
  SiUpstash,
} from "@icons-pack/react-simple-icons";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  BotIcon,
  CheckIcon,
  CodeIcon,
  DownloadIcon,
  GitPullRequestIcon,
  KeyboardIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  MousePointerClickIcon,
  PencilLineIcon,
  PlugIcon,
  PlusIcon,
  ReplaceIcon,
  StarIcon,
  TerminalIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { LaunchVideo } from "#/components/app-window";
import { SmartDownloadButton } from "#/components/download-button";
import { GiveawayCard } from "#/components/giveaway";
import { AgentsMockup, NeonGlyph } from "#/components/landing-mockups";
import { Section, SectionIntro, SITE, siteButton, WRAP } from "#/components/page";
import { ProductTour } from "#/components/product-tour";
import { REPO_URL, SiteFooter, SiteHeader } from "#/components/site-chrome";
import { useAuth } from "#/lib/auth/hooks";
import { SHIPPED_ENGINES } from "#/lib/engines";
import { useLatestRelease } from "#/lib/releases";
import { approvedReviewsQueryOptions } from "#/lib/reviews/functions";
import { cn } from "#/lib/utils";

export function LandingPage() {
  return (
    <div className={SITE}>
      <SiteHeader />
      <main>
        <Hero />
        <Tour />
        <Features />
        <Agents />
        <Demo />
        <Reviews />
        <Pricing />
        <Faq />
        <OpenSource />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  );
}

/**
 * Linear's feature row under a section's visual: short items side by side,
 * separated by hairlines, each an icon and one paragraph led by its title.
 */
function FeatureRow({
  items,
  className,
}: {
  items: { icon: React.ElementType; title: string; body: string }[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "mt-16 grid grid-cols-1 border-t border-border sm:grid-cols-2 md:mt-20",
        items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <li
          key={item.title}
          className="border-b border-border py-7 sm:odd:pr-8 sm:even:border-l sm:even:pl-8 lg:border-b-0 lg:border-l lg:px-7 lg:first:border-l-0 lg:first:pl-0 lg:odd:pr-7"
        >
          <item.icon className="size-[18px] text-muted-foreground" strokeWidth={1.6} />
          <p className="mt-4 text-[15px] leading-relaxed text-pretty text-muted-foreground">
            <span className="font-medium text-foreground">{item.title}.</span> {item.body}
          </p>
        </li>
      ))}
    </ul>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function ReleasePill() {
  const { data: release } = useLatestRelease();
  return (
    <Link
      to="/changelog"
      className="group inline-flex h-7 items-center gap-2 rounded-full border border-border bg-white/[0.03] pr-3 pl-1 text-[13px] text-muted-foreground transition-colors hover:border-white/15 hover:text-foreground"
    >
      <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] font-[510] text-foreground">
        New
      </span>
      {release ? `${release.tag_name} is out` : "See what's new"}
      <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

// The launch video lives in the `stroke` R2 bucket, served at media.stroke.click
// (R2 answers range requests, which Safari needs to play an mp4).
const LAUNCH_MEDIA = "https://media.stroke.click/launch";
// Bump when the files in R2 are replaced, so the CDN serves the new ones at once.
const LAUNCH_VERSION = "?v=1";

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        className={cn(WRAP, "flex flex-col items-center pt-20 pb-16 text-center md:pt-28 md:pb-20")}
      >
        <div className="animate-fade-up">
          <ReleasePill />
        </div>

        <h1
          className="animate-fade-up mt-7 max-w-[16ch] text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.035em] text-balance min-[430px]:text-[3rem] sm:text-[3.5rem] md:text-[4.25rem]"
          style={{ animationDelay: "60ms" }}
        >
          The database studio for agents and humans.
        </h1>

        <p
          className="animate-fade-up mt-6 max-w-[52ch] text-[17px] leading-[1.6] text-pretty text-muted-foreground"
          style={{ animationDelay: "120ms" }}
        >
          Browse, query and edit {SHIPPED_ENGINES.length} databases in one native app, and hand the
          same database to Claude, Cursor or any agent through a built-in MCP server.
        </p>

        <div
          className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "180ms" }}
        >
          <SmartDownloadButton size="lg" variant="default" align="center" alternates={false} />
          <Link to="/pricing" className={siteButton({ variant: "ghost", size: "lg" })}>
            $9.99 once, no subscription
          </Link>
        </div>
        <p
          className="animate-fade-up mt-4 text-[13px] text-muted-foreground"
          style={{ animationDelay: "180ms" }}
        >
          macOS, Windows and Linux · Free to try, no account needed ·{" "}
          <Link to="/download" className="underline-offset-4 hover:text-foreground hover:underline">
            Other downloads
          </Link>
        </p>

        {/* The product itself, not a mockup: a real screenshot in a window
            frame, the largest thing on the page. */}
        <div className="animate-fade-up mt-14 w-full md:mt-20" style={{ animationDelay: "260ms" }}>
          <div className="overflow-hidden rounded-xl bg-[#0a0a0b] shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_32px_80px_-20px_rgb(0_0_0/0.8)]">
            <img
              src="/features/view-table.webp"
              width={1472}
              height={1040}
              alt="Stroke showing a table in the grid, the sidebar of tables and the status bar"
              fetchPriority="high"
              decoding="async"
              className="block h-auto w-full"
            />
          </div>
        </div>
      </div>

      <Databases />
    </section>
  );
}

const DATABASES = SHIPPED_ENGINES.map((e) => ({
  name: e.name,
  Icon: e.Icon,
  color: e.color,
  slug: e.slug,
  tag: e.status === "beta" ? "Beta" : undefined,
}));

// Nile's own mark (thenile.dev/logo.svg), the same one the desktop app draws.
function NileMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 23.6 29.5" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.121 21.658C14.5515 21.0013 9.75863 17.4158 7.56726 12.2611C6.97966 10.8371 5.56944 9.83472 3.93571 9.83472C1.76277 9.83472 0 11.5975 0 13.7681C0 14.8534 0.437813 15.8397 1.15214 16.5494C2.87113 18.2684 2.87113 21.0635 1.15214 22.7825C0.444726 23.4899 0 24.4784 0 25.5637C0 27.7344 1.76277 29.4971 3.93341 29.4971C6.10404 29.4971 7.86681 27.7344 7.86681 25.5637C7.86681 24.4784 7.429 23.4922 6.71467 22.7825C5.44962 21.5174 5.11781 19.6694 5.71231 18.1025C10.3093 19.3376 14.1368 22.6166 16.0286 27.0707C16.6162 28.4948 18.0264 29.4971 19.6601 29.4971C21.8307 29.4971 23.5935 27.7344 23.5935 25.5637C23.5935 23.5452 22.0704 21.8861 20.1187 21.6603L20.121 21.658ZM22.4414 6.71467C23.1488 6.00726 23.5935 5.01872 23.5935 3.93341C23.5935 1.76277 21.8307 0 19.6601 0C17.4895 0 15.7267 1.76277 15.7267 3.93341C15.7267 5.01872 16.1645 6.00495 16.8789 6.71467C18.1439 7.97972 18.4757 9.82775 17.8812 11.3947C13.2842 10.1596 9.45677 6.88058 7.56495 2.42641C6.97736 1.00236 5.56944 0 3.93341 0C1.76277 0 0 1.76277 0 3.93341C0 5.95196 1.52313 7.61104 3.47485 7.83686C9.0443 8.48436 13.828 12.0721 16.0217 17.2268C16.6092 18.6508 18.0195 19.6532 19.6532 19.6532C21.8238 19.6532 23.5866 17.8904 23.5866 15.7198C23.5866 14.6345 23.1488 13.6483 22.4345 12.9385C20.7247 11.2288 20.7247 8.44058 22.4414 6.71467Z" />
    </svg>
  );
}

// Same providers and order as the desktop app's "Connect with a provider".
const PROVIDERS = [
  { name: "Neon", Icon: NeonGlyph, color: "#00e599" },
  { name: "Supabase", Icon: SiSupabase, color: "#3ecf8e" },
  { name: "Prisma Postgres", Icon: SiPrisma, color: "#8b8ff8" },
  { name: "PlanetScale", Icon: SiPlanetscale, color: "#f2f2f2" },
  { name: "TiDB Cloud", Icon: SiTidb, color: "#ff3d5a" },
  { name: "Turso", Icon: SiTurso, color: "#4ff8d2" },
  { name: "Railway", Icon: SiRailway, color: "#f2f2f2" },
  { name: "Nile", Icon: NileMark, color: "#8a63f9" },
  { name: "Upstash", Icon: SiUpstash, color: "#00e9a3" },
  { name: "PostHog", Icon: SiPosthog, color: "#f9bd2b" },
  { name: "Cloudflare D1", Icon: SiCloudflare, color: "#f38020" },
];

/** A caption over a hairline grid of marks, the way Linear shows its customers. */
function LogoGrid({
  caption,
  items,
  tail,
  className,
}: {
  caption: React.ReactNode;
  items: readonly {
    name: string;
    Icon: React.ElementType;
    color: string;
    tag?: string;
    slug?: string;
  }[];
  tail: { to: "/roadmap" | "/docs" | "/databases"; label: string };
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[15px] text-muted-foreground">{caption}</p>
      <ul className="mt-8 grid grid-cols-2 border-t border-l border-border sm:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => (
          <EngineCell key={item.name} {...item} />
        ))}
        <li className="h-20 border-r border-b border-border md:h-24">
          <Link
            to={tail.to}
            className="group flex h-full items-center justify-center gap-1.5 px-3 text-[14px] text-muted-foreground transition-colors duration-150 hover:bg-white/[0.02] hover:text-foreground"
          >
            {tail.label}
            <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </li>
      </ul>
    </div>
  );
}

function Databases() {
  return (
    <div className={cn(WRAP, "space-y-16 pb-24 md:space-y-20 md:pb-32")}>
      <LogoGrid
        caption={
          <>
            <span className="text-foreground">{SHIPPED_ENGINES.length} engines today,</span> from a
            local SQLite file to ClickHouse, MongoDB and DynamoDB.
          </>
        }
        items={DATABASES}
        tail={{ to: "/databases", label: "Every database" }}
      />
      <LogoGrid
        caption={
          <>
            <span className="text-foreground">Eleven providers, one click.</span> Sign in and every
            database on your account is ready to open.
          </>
        }
        items={PROVIDERS}
        tail={{ to: "/docs", label: "Or paste a URL" }}
      />
    </div>
  );
}

const SCRAMBLE_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%&*+=?";
const SCRAMBLE_MS = 420;

/**
 * One engine in the grid. On hover the name scrambles and settles left to
 * right, the mark jitters into its brand color, and a soft light follows the
 * pointer. With reduced motion only the color changes.
 */
function EngineCell({
  name,
  Icon,
  color,
  tag,
  slug,
}: {
  name: string;
  Icon: React.ElementType;
  color: string;
  tag?: string;
  slug?: string;
}) {
  // null shows the real name; a string is a frame of the scramble.
  const [label, setLabel] = useState<string | null>(null);
  const frame = useRef(0);
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined);

  const stop = () => {
    cancelAnimationFrame(frame.current);
    clearTimeout(settle.current);
    setLabel(null);
  };

  useEffect(() => stop, []);

  const scramble = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    stop();
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.max(0, Math.min((now - start) / SCRAMBLE_MS, 1));
      if (progress >= 1) return setLabel(null);
      const settled = Math.floor(progress * name.length);
      setLabel(
        Array.from(name, (ch, i) =>
          i < settled || ch === " " || ch === "/"
            ? ch
            : SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)],
        ).join(""),
      );
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    // A throttled or interrupted frame loop must never leave a scrambled name.
    settle.current = setTimeout(stop, SCRAMBLE_MS + 120);
  };

  return (
    <li
      onPointerEnter={scramble}
      onPointerLeave={stop}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      style={{ "--brand": color } as React.CSSProperties}
      className="group/engine relative flex h-20 items-center justify-center gap-2.5 overflow-hidden border-r border-b border-border px-3 text-[14px] text-muted-foreground transition-colors duration-200 hover:text-foreground md:h-24"
    >
      {slug && (
        <Link
          to="/databases/$engine"
          params={{ engine: slug }}
          aria-label={`${name} in Stroke`}
          className="absolute inset-0 z-10 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        />
      )}
      {/* Light that follows the pointer, tinted by the engine's brand color. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/engine:opacity-100"
        style={{
          background:
            "radial-gradient(140px circle at var(--x, 50%) var(--y, 50%), color-mix(in oklab, var(--brand) 14%, transparent), transparent 70%)",
        }}
      />
      <Icon className="engine-jitter relative size-[18px] shrink-0 transition-colors duration-200 group-hover/engine:text-[var(--brand)]" />
      {/* The real name holds the width; the scrambled one is drawn over it. */}
      <span className="relative font-medium">
        <span className="invisible">{name}</span>
        <span aria-hidden="true" className="absolute inset-0 whitespace-nowrap">
          {label ?? name}
        </span>
        <span className="sr-only">{name}</span>
      </span>
      {tag && (
        <span className="relative rounded-full bg-white/[0.08] px-1.5 py-px text-[11px] font-[510] text-soft">
          {tag}
        </span>
      )}
    </li>
  );
}

// ── Principles ───────────────────────────────────────────────────────────────

// ── 1.0 Connect ──────────────────────────────────────────────────────────────

const QUERY_FEATURES = [
  {
    icon: TerminalIcon,
    title: "SQL console",
    body: "Schema-aware autocomplete, formatting, and the execution time of every run.",
  },
  {
    icon: DownloadIcon,
    title: "Export",
    body: "Any result to CSV or JSON in one click.",
  },
  {
    icon: LayoutDashboardIcon,
    title: "Charts & dashboards",
    body: "Turn a result into a chart, then pin it to a dashboard you can revisit any time.",
  },
  {
    icon: KeyboardIcon,
    title: "Command palette",
    body: "Hit Cmd/Ctrl+K to jump anywhere. Every core view has a shortcut.",
  },
];

const EDITING_FEATURES = [
  {
    icon: ListChecksIcon,
    title: "Every change waits for you",
    body: "Edits, new rows, and deletes are staged and marked in the grid. Apply them together, or reset and they never happened.",
  },
  {
    icon: MousePointerClickIcon,
    title: "A right-click away",
    body: "Filter by a value or exclude it, copy in another format, transform, duplicate, or preview the row as JSON, straight from the cell.",
  },
  {
    icon: PencilLineIcon,
    title: "Type-aware editors",
    body: "For text, numbers, booleans, enums, dates, UUIDs, and JSON.",
  },
  {
    icon: ReplaceIcon,
    title: "Find and replace, previewed",
    body: "Match case, whole word, or a regex, and see every cell that will change, old value beside new, before you replace.",
  },
];

// ── Tour and features ────────────────────────────────────────────────────────

function Tour() {
  return (
    <Section id="tour">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <h2 className="text-[2rem] leading-[1.1] font-semibold tracking-[-0.03em] text-balance md:text-[2.75rem]">
          Every view you need, one window.
        </h2>
        <p className="mt-4 max-w-[52ch] text-[17px] leading-[1.6] text-pretty text-muted-foreground">
          A SQL console, an AI agent, charts, diagrams and a command palette, beside the grid you
          just saw.
        </p>
      </div>
      <ProductTour className="mt-12 md:mt-16" />
    </Section>
  );
}

const FEATURES = [...QUERY_FEATURES, ...EDITING_FEATURES];

function Features() {
  return (
    <Section id="features">
      <SectionIntro
        title="Small things, done properly."
        link={{ to: "/features", label: "Every feature" }}
      >
        <p>The details you notice after a week of using it every day.</p>
      </SectionIntro>
      <ul className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <li key={f.title} className="flex flex-col gap-2">
            <f.icon className="size-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="mt-2 text-[15px] font-[560] tracking-[-0.01em] text-foreground">
              {f.title}
            </h3>
            <p className="text-[14px] leading-relaxed text-pretty text-muted-foreground">
              {f.body}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

const AGENT_FEATURES = [
  {
    icon: PlugIcon,
    title: "Built-in MCP server",
    body: "Expose your database to Claude, Cursor, and other MCP clients with one-click config.",
  },
  {
    icon: BotIcon,
    title: "AI chat",
    body: "An assistant with direct database access that runs queries, explains schemas, and generates SQL.",
  },
  {
    icon: CodeIcon,
    title: "Same schema, both ways",
    body: "Agents and the in-app chat read the same schema you browse, so answers line up with what you see.",
  },
];

function Agents() {
  return (
    <Section id="agents">
      <SectionIntro
        index="6.0"
        eyebrow="AI and agents"
        title="Hand your database to an agent."
        link={{ to: "/docs/mcp", label: "Set up MCP" }}
      >
        <p>
          Stroke ships an MCP server, so{" "}
          <strong>Claude, Cursor, or any agent can read your schema and run queries</strong> in one
          click. The same schema-aware AI chat lives right inside the app for you.
        </p>
      </SectionIntro>
      <AgentsMockup className="mt-16 md:mt-24" />
      <FeatureRow items={AGENT_FEATURES} />
    </Section>
  );
}

// ── Tour, reviews ────────────────────────────────────────────────────────────

function Demo() {
  return (
    <Section>
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <h2 className="text-[2rem] leading-[1.1] font-semibold tracking-[-0.03em] text-balance md:text-[2.75rem]">
          Stroke in 44 seconds.
        </h2>
        <p className="mt-4 max-w-[52ch] text-[17px] leading-[1.6] text-pretty text-muted-foreground">
          Connect, browse, query, and hand the same database to an agent.
        </p>
      </div>
      <div className="mt-12 md:mt-16">
        <LaunchVideo
          sources={[
            {
              src: `${LAUNCH_MEDIA}/stroke-launch-2160p60.mp4${LAUNCH_VERSION}`,
              media: "(min-width: 1280px)",
            },
            { src: `${LAUNCH_MEDIA}/stroke-launch-1080p60.mp4${LAUNCH_VERSION}` },
          ]}
          poster={`${LAUNCH_MEDIA}/stroke-launch-poster.jpg${LAUNCH_VERSION}`}
          title="Stroke in 44 seconds: the launch video"
        />
      </div>
    </Section>
  );
}

function initialsFrom(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function Reviews() {
  const { data: reviews } = useQuery(approvedReviewsQueryOptions());

  // Nothing approved yet → don't render an empty section.
  if (!reviews || reviews.length === 0) return null;

  return (
    <Section id="reviews">
      <SectionIntro title="What people say about Stroke." />
      <div className="mt-16 border-t border-border [column-fill:_balance] sm:columns-2 md:mt-20 lg:columns-3 lg:gap-12">
        {reviews.map((r) => (
          <figure
            key={r.id}
            className="flex break-inside-avoid flex-col gap-6 border-b border-border py-8"
          >
            <blockquote className="text-[17px] leading-[1.55] text-pretty text-soft">
              “{r.body}”
            </blockquote>
            <figcaption className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[11px] font-semibold text-muted-foreground uppercase ring-1 ring-border">
                {initialsFrom(r.authorName)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium">{r.authorName}</span>
                {r.title ? (
                  <span className="block truncate text-[12px] text-muted-foreground">
                    {r.title}
                  </span>
                ) : null}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

// ── Pricing ──────────────────────────────────────────────────────────────────

function Plan({
  name,
  tag,
  price,
  suffix,
  tagline,
  cta,
  note,
  perks,
  featured = false,
}: {
  name: string;
  tag?: string;
  price: string;
  suffix: string;
  tagline: string;
  cta: React.ReactNode;
  note: React.ReactNode;
  perks: string[];
  featured?: boolean;
}) {
  const body = (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-[calc(1rem-1px)] p-7 sm:p-8",
        featured ? "bg-[#141516]" : "bg-card",
      )}
    >
      <div className="flex h-6 items-center justify-between gap-3">
        <h3 className="text-[15px] font-medium">{name}</h3>
        {tag && (
          <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] font-[510] text-soft">
            {tag}
          </span>
        )}
      </div>
      <p className="mt-8 flex items-baseline gap-2">
        <span className="text-[3rem] leading-none font-[510] tracking-[-0.03em] tabular-nums">
          {price}
        </span>
        <span className="text-[15px] text-muted-foreground">{suffix}</span>
      </p>
      <p className="mt-3 text-[15px] text-soft">{tagline}</p>

      <ul className="mt-8 flex-1 space-y-3 border-t border-border pt-7 text-[14px]">
        {perks.map((perk) => (
          <li key={perk} className="flex items-start gap-3">
            <CheckIcon
              className={cn(
                "mt-0.5 size-4 shrink-0",
                featured ? "text-foreground" : "text-muted-foreground",
              )}
              strokeWidth={2}
            />
            <span className="text-pretty text-muted-foreground">{perk}</span>
          </li>
        ))}
      </ul>

      <div className="mt-10">{cta}</div>
      <p className="mt-3 text-center text-[13px] text-muted-foreground">{note}</p>
    </div>
  );

  return (
    <div
      className={cn(
        "rounded-2xl border",
        featured
          ? "border-white/[0.16] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]"
          : "border-border",
      )}
    >
      {body}
    </div>
  );
}

const FREE_PERKS = [
  "Every feature unlocked while you evaluate",
  `All ${SHIPPED_ENGINES.length} engines, from Postgres to MongoDB`,
  "macOS, Windows & Linux",
  "No sign-in required",
];

const LICENSE_PERKS = [
  "The app is yours forever, nothing to cancel",
  "Pro on up to 3 of your devices, through your account",
  "Every future update included",
  "Priority answers on support and feature requests",
];

const TEAM_PERKS = [
  "Licenses everyone on your company's email domain",
  "Each teammate gets their own key",
  "No seats to manage, no per-user fees",
];

const GUARANTEES = [
  { title: "No renewals", body: "Pay once and keep it. Nothing comes due next year." },
  { title: "No upsells", body: "No locked features, no paid upgrade later." },
  { title: "Nothing to cancel", body: "There is no subscription to remember or forget." },
  { title: "Free to try", body: "Every feature, no account or card needed." },
];

/** Pricing plans. Rendered on the landing page and as the /pricing page body. */
export function Pricing({ as = "h2" }: { as?: "h1" | "h2" }) {
  const { user } = useAuth();
  const buyTo = user ? "/app/billing" : "/login";

  return (
    <Section id="pricing" border={as === "h2"}>
      <SectionIntro eyebrow="Pricing" title="Pay once. Own it forever." as={as}>
        <p>
          Most database clients now charge $100 or more a year, every year. I think a tool you use
          every day should be one you own, so Stroke costs <strong>$9.99, once</strong>. That is the
          lowest price I can offer and still keep development going.
        </p>
      </SectionIntro>

      <div className="mt-16 grid grid-cols-1 gap-4 md:mt-24 lg:grid-cols-3 lg:gap-5">
        <Plan
          name="Try"
          price="$0"
          suffix="to start"
          tagline="Take your time deciding."
          cta={
            <SmartDownloadButton
              size="lg"
              variant="outline"
              alternates={false}
              className="w-full"
            />
          }
          note="No account or card needed."
          perks={FREE_PERKS}
        />
        <Plan
          name="Own"
          tag="Pay once"
          price="$9.99"
          suffix="once"
          tagline="One payment. Yours for good."
          cta={
            <Link to={buyTo} className={cn(siteButton({ size: "lg" }), "w-full")}>
              Buy Stroke
            </Link>
          }
          note="One-time payment. No recurring charges."
          perks={LICENSE_PERKS}
          featured
        />
        <Plan
          name="Team"
          price="$99"
          suffix="once"
          tagline="One purchase, whole company."
          cta={
            // Team checkout is paused for now; teams buy by email instead.
            <button
              type="button"
              disabled
              className={cn(siteButton({ variant: "secondary", size: "lg" }), "w-full")}
            >
              Buy Team
            </button>
          }
          note={
            <>
              Coming soon. To license your team now, email{" "}
              <a
                href="mailto:support@stroke.click?subject=Stroke%20Team%20license"
                className="text-soft underline decoration-white/25 underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-white/60"
              >
                support@stroke.click
              </a>
              .
            </>
          }
          perks={TEAM_PERKS}
        />
      </div>

      <ul className="mt-12 grid grid-cols-1 border-t border-border sm:grid-cols-2 lg:grid-cols-4">
        {GUARANTEES.map((g) => (
          <li
            key={g.title}
            className="border-b border-border py-6 sm:odd:pr-8 sm:even:border-l sm:even:pl-8 lg:border-b-0 lg:border-l lg:px-7 lg:first:border-l-0 lg:first:pl-0 lg:odd:pr-7"
          >
            <p className="flex items-center gap-2 text-[14px] font-medium">
              <CheckIcon className="size-4 text-foreground" strokeWidth={2.25} />
              {g.title}
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{g.body}</p>
          </li>
        ))}
      </ul>

      <div className="mt-24 md:mt-32">
        <GiveawayCard />
      </div>
    </Section>
  );
}

// ── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "How much does Stroke cost?",
    a: "$9.99, one time. There is no subscription, no yearly renewal, and no paid upgrade later. You can try the full app for free before you buy.",
  },
  {
    q: "Why so cheap?",
    a: "Most database clients rent themselves to you for $100 or more a year. I want owning Stroke to be an easy decision, so the price stays low enough that you never have to think twice about it. If Stroke saves you one afternoon, it has paid for itself.",
  },
  {
    q: "Do I need an account to try it?",
    a: "No. Download it, open it, and connect to a database. An account only comes in when you buy a license.",
  },
  {
    q: "Which databases does Stroke support?",
    a: "PostgreSQL, MySQL, MariaDB, SQLite, DuckDB, SQL Server, ClickHouse, CockroachDB, Turso / LibSQL, and Cloudflare D1. Redis is in beta, and the roadmap lists what follows.",
  },
  {
    q: "Does Stroke see my database credentials or data?",
    a: "No. Stroke connects to your databases directly from your machine, and connection credentials are stored locally on your device. Query results never pass through our servers. See the Privacy Policy for the full picture.",
  },
  {
    q: "Can I move my license to a new machine?",
    a: "Yes. Your license covers 3 devices at once (ask for more if you need them), and you can free a seat from your account dashboard whenever you switch, even if the old machine is gone. Refunds are covered in the Terms of Service.",
  },
  {
    q: "Is Stroke open source?",
    a: "Yes. The whole app, Pro features included, is on GitHub. It is free to use personally or at work, just not for resale.",
  },
];

/** FAQ accordion. Rendered on the landing page and the /pricing page. */
export function Faq() {
  return (
    <Section id="faq">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16 lg:gap-24">
        <div>
          <h2 className="text-[2.25rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[2.75rem] md:text-[3.25rem]">
            Questions, answered.
          </h2>
          <p className="mt-6 text-[15px] text-muted-foreground">
            The fine print lives in the{" "}
            <Link to="/terms" className="underline underline-offset-4 hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline underline-offset-4 hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {FAQ_ITEMS.map((item, i) => (
            <details key={item.q} className="group" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[15px] font-medium transition-colors hover:text-soft [&::-webkit-details-marker]:hidden">
                {item.q}
                <PlusIcon
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                  strokeWidth={1.75}
                />
              </summary>
              <p className="pb-6 text-[15px] leading-relaxed text-pretty text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ── Open source, closer ──────────────────────────────────────────────────────

const OPEN_SOURCE_ITEMS = [
  {
    icon: CodeIcon,
    title: "Read it",
    body: "Every line is public. Build it yourself in three commands.",
  },
  {
    icon: GitPullRequestIcon,
    title: "Change it",
    body: "Bugs, features and docs all welcome. CONTRIBUTING.md has the setup.",
  },
  {
    icon: StarIcon,
    title: "Star it",
    body: "The cheapest way to help, and the one that reaches other people.",
  },
];

function OpenSource() {
  return (
    <Section id="open-source">
      <SectionIntro eyebrow="Open source" title="The whole thing is on GitHub.">
        <p>
          Every line, Pro features included. Stroke holds your database credentials and connects to
          your production systems, and{" "}
          <strong>you should not have to take anybody's word for what it does with them.</strong>{" "}
          Read it.
        </p>
        <p className="text-muted-foreground">
          Free to use, personally or at work. Not for resale, since that is what keeps it funded.
        </p>
      </SectionIntro>

      <div className="mt-10 flex flex-wrap items-center gap-3 md:ml-[calc(50%+2rem)] lg:ml-[calc(50%+3rem)]">
        <a href={REPO_URL} target="_blank" rel="noreferrer" className={siteButton()}>
          <StarIcon className="size-4" />
          Star on GitHub
        </a>
        <a
          href={`${REPO_URL}/blob/master/CONTRIBUTING.md`}
          target="_blank"
          rel="noreferrer"
          className={siteButton({ variant: "secondary" })}
        >
          <GitPullRequestIcon className="size-4" />
          Contribute
        </a>
        <a
          href={`${REPO_URL}/issues`}
          target="_blank"
          rel="noreferrer"
          className={siteButton({ variant: "ghost" })}
        >
          Report a bug
        </a>
      </div>

      <FeatureRow items={OPEN_SOURCE_ITEMS} />
    </Section>
  );
}

function ClosingCta() {
  return (
    <section className="relative isolate overflow-hidden border-t border-border">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-full bg-[radial-gradient(45%_70%_at_50%_100%,rgb(255_255_255/0.06),transparent)]"
      />
      <div className={cn(WRAP, "flex flex-col items-center py-28 text-center md:py-40")}>
        <h2 className="max-w-3xl text-[2.5rem] leading-[1.06] font-semibold tracking-[-0.03em] text-balance sm:text-5xl md:text-[4rem]">
          Try Stroke on your own database.
        </h2>
        <p className="mt-6 text-lg text-soft">
          Free to download. $9.99 whenever you decide to keep it.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <SmartDownloadButton size="lg" variant="default" align="center" alternates={false} />
          <Link to="/docs" className={siteButton({ variant: "secondary", size: "lg" })}>
            Read the docs
          </Link>
        </div>
      </div>
    </section>
  );
}
