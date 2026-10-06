import {
  SiClickhouse,
  SiCloudflare,
  SiCockroachlabs,
  SiDuckdb,
  SiMariadb,
  SiMysql,
  SiPlanetscale,
  SiPostgresql,
  SiPosthog,
  SiPrisma,
  SiRailway,
  SiRedis,
  SiSqlite,
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
  BracesIcon,
  ChartLineIcon,
  CheckIcon,
  CodeIcon,
  DatabaseIcon,
  DownloadIcon,
  GitForkIcon,
  GitPullRequestIcon,
  Grid3x3Icon,
  KeyboardIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  MapIcon,
  MousePointerClickIcon,
  PencilLineIcon,
  PlugIcon,
  PlusIcon,
  ReplaceIcon,
  StarIcon,
  StickyNoteIcon,
  TerminalIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { LaunchVideo, VideoDemo } from "#/components/app-window";
import { BrewCommand, SmartDownloadButton } from "#/components/download-button";
import { FeatureShot } from "#/components/feature-shot";
import { GiveawayCard } from "#/components/giveaway";
import { AgentsMockup, ConnectMockup, NeonGlyph, QueryMockup } from "#/components/landing-mockups";
import { Panel, Section, SectionIntro, SITE, siteButton, WRAP } from "#/components/page";
import { SchemaShowcase } from "#/components/schema-showcase";
import { REPO_URL, SiteFooter, SiteHeader } from "#/components/site-chrome";
import { useAuth } from "#/lib/auth/hooks";
import { useLatestRelease } from "#/lib/releases";
import { approvedReviewsQueryOptions } from "#/lib/reviews/functions";
import { cn } from "#/lib/utils";

export function LandingPage() {
  return (
    <div className={SITE}>
      <SiteHeader />
      <main>
        <Hero />
        <Pillars />
        <Connect />
        <QuerySection />
        <Views />
        <SchemaSection />
        <Editing />
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
      {/* A faint light at the top of the page, nothing more. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(50%_70%_at_50%_0%,rgb(255_255_255/0.045),transparent)]"
      />
      <div className={cn(WRAP, "pt-20 pb-16 md:pt-32 md:pb-24")}>
        <div className="animate-fade-up">
          <ReleasePill />
        </div>

        <h1
          className="animate-fade-up mt-8 max-w-[18ch] text-[2.5rem] text-balance min-[430px]:text-[3rem] sm:text-[3.75rem] md:text-[4.5rem]"
          style={{ animationDelay: "60ms" }}
        >
          The database studio for agents and humans.
        </h1>

        <div
          className="animate-fade-up mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 md:mt-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-16"
          style={{ animationDelay: "140ms" }}
        >
          <p className="max-w-xl text-[17px] leading-[1.6] text-pretty text-muted-foreground md:text-lg">
            A native database client for engineers and analysts. Query, browse, and edit every
            database you run in one fast app, and hand the same database to your AI agents through a
            built-in MCP server.
          </p>
          <div className="flex min-w-0 flex-col gap-3 md:items-end">
            <div className="flex flex-wrap items-center gap-3">
              <SmartDownloadButton size="lg" variant="default" alternates={false} />
              <Link to="/pricing" className={siteButton({ variant: "secondary", size: "lg" })}>
                $9.99 · Own it forever
              </Link>
            </div>
            <BrewCommand />
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
              <span>macOS, Windows, and Linux</span>
              <span aria-hidden="true">·</span>
              <span>Free to try, no account needed</span>
              <span aria-hidden="true">·</span>
              <Link
                to="/download"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                Other downloads
              </Link>
            </p>
          </div>
        </div>

        <div className="animate-fade-up mt-16 md:mt-24" style={{ animationDelay: "240ms" }}>
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
      </div>

      <Databases />
    </section>
  );
}

const DATABASES = [
  { name: "PostgreSQL", Icon: SiPostgresql, color: "#699eca" },
  { name: "MySQL", Icon: SiMysql, color: "#4f9fd3" },
  { name: "MariaDB", Icon: SiMariadb, color: "#c0765a" },
  { name: "SQLite", Icon: SiSqlite, color: "#44a8e0" },
  { name: "DuckDB", Icon: SiDuckdb, color: "#fff000" },
  { name: "SQL Server", Icon: DatabaseIcon, color: "#e2574c" },
  { name: "ClickHouse", Icon: SiClickhouse, color: "#ffcc01" },
  { name: "CockroachDB", Icon: SiCockroachlabs, color: "#8b6bff" },
  { name: "Turso / LibSQL", Icon: SiTurso, color: "#4ff8d2" },
  { name: "Cloudflare D1", Icon: SiCloudflare, color: "#f38020" },
  { name: "Redis", Icon: SiRedis, color: "#ff4438", tag: "Beta" },
] as const;

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
  items: readonly { name: string; Icon: React.ElementType; color: string; tag?: string }[];
  tail: { to: "/roadmap" | "/docs"; label: string };
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[15px] text-muted-foreground">{caption}</p>
      <ul className="mt-8 grid grid-cols-2 border-t border-l border-border sm:grid-cols-3 lg:grid-cols-6">
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
            <span className="text-foreground">Ten engines today,</span> from a local SQLite file to
            ClickHouse.
          </>
        }
        items={DATABASES}
        tail={{ to: "/roadmap", label: "More on the roadmap" }}
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
}: {
  name: string;
  Icon: React.ElementType;
  color: string;
  tag?: string;
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

const PILLARS = [
  {
    title: "Fast from the first click",
    body: "Stroke opens in an instant and stays light no matter how large your tables get. It never makes your fans spin.",
  },
  {
    title: "Made for agents and people",
    body: "Stroke ships an MCP server, so Claude, Cursor, or any agent can read your schema and run queries in one click. The same schema-aware AI chat lives right inside the app for you.",
  },
  {
    title: "Yours, not rented",
    body: "$9.99 buys the app outright. No subscription, no renewals, no locked features. Try everything free, and pay when you decide to keep it.",
  },
];

function Pillars() {
  return (
    <Section>
      <SectionIntro title="A database client that respects your time.">
        <p>
          Stroke is built for the hours you spend inside your databases.{" "}
          <strong>Three ideas shape every part of it.</strong>
        </p>
      </SectionIntro>
      <ol className="mt-16 grid grid-cols-1 border-t border-border md:mt-24 md:grid-cols-3">
        {PILLARS.map((p, i) => (
          <li
            key={p.title}
            className="border-b border-border py-10 md:border-b-0 md:border-l md:px-10 md:first:border-l-0 md:first:pl-0 md:last:pr-0"
          >
            <span className="font-mono text-[12px] text-faint tabular-nums">0{i + 1}</span>
            <h3 className="mt-5 text-xl font-[560] tracking-[-0.02em]">{p.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-pretty text-muted-foreground">
              {p.body}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

// ── 1.0 Connect ──────────────────────────────────────────────────────────────

const CONNECT_STEPS = [
  {
    icon: PlugIcon,
    title: "Sign in with your provider",
    body: "Authorize Stroke once from the connection screen. Neon, Supabase, Prisma Postgres, PlanetScale, TiDB Cloud, Turso, Railway, Nile, Upstash, PostHog, and Cloudflare D1.",
  },
  {
    icon: DatabaseIcon,
    title: "Pick a database",
    body: "Every database on your account shows up, ready to open.",
  },
  {
    icon: CheckIcon,
    title: "You're connected",
    body: "No connection strings to find, copy, or paste. Everything else still takes a plain connection string.",
  },
];

function Connect() {
  return (
    <Section id="connect">
      <SectionIntro
        index="1.0"
        eyebrow="Connect"
        title="Sign in. Pick a database. You're in."
        link={{ to: "/docs", label: "How connecting works" }}
      >
        <p>
          Sign in with your database provider and see every database on your account, then{" "}
          <strong>connect in one click.</strong> Any of the ten engines also takes a plain
          connection string.
        </p>
      </SectionIntro>
      <ConnectMockup className="mt-16 md:mt-24" />
      <FeatureRow items={CONNECT_STEPS} />
    </Section>
  );
}

// ── 2.0 Query ────────────────────────────────────────────────────────────────

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

function QuerySection() {
  return (
    <Section id="query">
      <SectionIntro
        index="2.0"
        eyebrow="Query"
        title="Write SQL with the schema at hand."
        link={{ to: "/features", label: "Every feature" }}
      >
        <p>
          A full editor that knows your tables and columns as you type.{" "}
          <strong>Run it, read the result, and keep going</strong> without leaving the keyboard.
        </p>
      </SectionIntro>
      <QueryMockup className="mt-16 md:mt-24" />
      <FeatureRow items={QUERY_FEATURES} />
    </Section>
  );
}

// ── 3.0 Views ────────────────────────────────────────────────────────────────

interface ViewInfo {
  key: string;
  label: string;
  icon: React.ElementType;
  title: string;
  what: string;
  why: string;
  shot: { src: string; width: number; height: number; alt: string };
}

const VIEWS: ViewInfo[] = [
  {
    key: "table",
    label: "Table",
    icon: Grid3x3Icon,
    title: "Scan, sort, and edit rows",
    what: "The grid: typed column headers, sort, filter, search, and inline editing, paging smoothly through a million rows.",
    why: "Your everyday view, for scanning lots of rows or fixing values in place.",
    shot: {
      src: "/features/view-table.webp",
      width: 1472,
      height: 1040,
      alt: "Table view of the events table: 1,000,000 rows with typed columns id, ts, device_id, and session",
    },
  },
  {
    key: "json",
    label: "JSON",
    icon: BracesIcon,
    title: "The rows as a JSON array",
    what: "Every row as a JSON object, with a JSONPath bar ($.field, [0], .items[*].name) to pull out just the part you need, and a column picker to hide the rest.",
    why: "When columns hold documents, or you want rows ready to paste into code, a fixture, or an API call.",
    shot: {
      src: "/features/view-json.webp",
      width: 1472,
      height: 1040,
      alt: "JSON view of the vector_zoo table as a syntax-highlighted JSON array, with the JSONPath filter bar and the column visibility picker open",
    },
  },
  {
    key: "text",
    label: "Text",
    icon: StickyNoteIcon,
    title: "Copy-ready text in four formats",
    what: "The result as CSV, TSV, Markdown, or JSON Lines, with one click to copy or download it.",
    why: "Dropping a result into a README, a ticket, or a spreadsheet, or handing it to another tool.",
    shot: {
      src: "/features/view-text.webp",
      width: 1472,
      height: 1040,
      alt: "Text view of the vector_zoo table as a Markdown table, with CSV, TSV, Markdown, and JSON Lines tabs and a Copy button",
    },
  },
  {
    key: "chart",
    label: "Chart",
    icon: ChartLineIcon,
    title: "See the shape of the data",
    what: "Pick a category and a value column, optionally group by a third, then switch between bar, area, step, and more.",
    why: "Trends, spikes, and gaps that never show up in a list of rows.",
    shot: {
      src: "/features/view-chart.webp",
      width: 1472,
      height: 1040,
      alt: "Chart view of the events table: an area chart of amount over ts across 1,000 rows",
    },
  },
  {
    key: "erd",
    label: "ERD",
    icon: GitForkIcon,
    title: "How the tables connect",
    what: "The current table and the tables it references, with primary and foreign keys marked, 1:N and 1:1 links, zoom, and a minimap.",
    why: "Before writing a join, or on your first day with an unfamiliar schema.",
    shot: {
      src: "/features/view-erd.webp",
      width: 1472,
      height: 1040,
      alt: "ERD view of a Cloudflare D1 database: invoice_item linked by foreign keys to invoice and item, with a PK, FK, 1:N, and 1:1 legend and a minimap",
    },
  },
  {
    key: "map",
    label: "Map",
    icon: MapIcon,
    title: "Geometry, on a map",
    what: "Geometry columns plotted on a world map and clustered, so a million points stay readable, with the SRID and live coordinates shown.",
    why: "Spatial data you would otherwise read as raw geometry. See where the points actually are.",
    shot: {
      src: "/features/view-map.webp",
      width: 1472,
      height: 1040,
      alt: "Map view of the gps_pings table: 1,000,000 points in 89 clusters on a world map, SRID 4326",
    },
  },
];

/** How long each view stays on stage while the section plays on its own. */
const VIEW_DWELL_MS = 5000;

function Views() {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const section = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const view = VIEWS[active];

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const choose = (i: number, focus = false) => {
    const next = (i + VIEWS.length) % VIEWS.length;
    setAutoplay(false);
    setActive(next);
    if (focus) tabs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowDown: active + 1,
      ArrowLeft: active - 1,
      ArrowUp: active - 1,
      Home: 0,
      End: VIEWS.length - 1,
    };
    if (e.key in keys) {
      e.preventDefault();
      choose(keys[e.key], true);
    }
  };

  const playing = autoplay && inView && !hovered;

  return (
    <Section id="views">
      <div ref={section}>
        <SectionIntro index="3.0" eyebrow="Views" title="One result, six ways to read it.">
          <p>
            Switch how any table or query result is shown, without running it again.{" "}
            <strong>Each view is built for a different question.</strong>
          </p>
        </SectionIntro>

        {/* The switcher, styled after the app's own view menu. */}
        <div
          role="tablist"
          aria-label="Views"
          className="mt-16 flex max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-white/[0.02] p-1 md:mt-24 md:w-fit"
        >
          {VIEWS.map((v, i) => {
            const selected = i === active;
            return (
              <button
                key={v.key}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`view-tab-${v.key}`}
                aria-selected={selected}
                aria-controls="view-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => choose(i)}
                onKeyDown={onKeyDown}
                className={cn(
                  "relative flex h-9 shrink-0 items-center gap-2 overflow-hidden rounded-lg px-3.5 text-[13px] whitespace-nowrap transition-colors duration-150",
                  selected
                    ? "bg-white/[0.08] text-foreground"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                )}
              >
                <v.icon className="size-4 shrink-0" strokeWidth={1.75} />
                {v.label}
                {selected && autoplay && (
                  <span
                    key={`${v.key}-progress`}
                    aria-hidden="true"
                    onAnimationEnd={() => setActive((i + 1) % VIEWS.length)}
                    style={{
                      animationDuration: `${VIEW_DWELL_MS}ms`,
                      animationPlayState: playing ? "running" : "paused",
                    }}
                    className="view-progress absolute inset-x-3 bottom-0.5 h-px origin-left rounded-full bg-foreground/70"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* The stage: one app window, every view stacked in it, cross-fading in place. */}
        <div
          role="tabpanel"
          id="view-panel"
          aria-labelledby={`view-tab-${view.key}`}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-14"
        >
          <Panel>
            <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-2.5">
              <span className="size-2.5 rounded-full bg-white/12" />
              <span className="size-2.5 rounded-full bg-white/12" />
              <span className="size-2.5 rounded-full bg-white/12" />
              <span className="ml-3 flex items-center gap-1.5 text-xs text-white/50">
                <view.icon className="size-3.5" strokeWidth={1.75} />
                {view.label} view
              </span>
            </div>
            <div className="grid">
              {VIEWS.map((v, i) => (
                <div
                  key={v.key}
                  inert={i !== active}
                  className={cn(
                    "transition-[opacity,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] [grid-area:1/1]",
                    i === active
                      ? "scale-100 opacity-100"
                      : "pointer-events-none scale-[1.01] opacity-0",
                  )}
                >
                  <FeatureShot {...v.shot} flush />
                </div>
              ))}
            </div>
          </Panel>

          {/* Caption: what it is and why you would reach for it. */}
          <div key={view.key} className="animate-fade-up lg:pt-4">
            <h3 className="text-xl font-[560] tracking-[-0.02em]">{view.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-pretty text-muted-foreground">
              {view.what}
            </p>
            <div className="mt-6 border-t border-border pt-6">
              <p className="text-[13px] font-medium text-foreground">Reach for it when</p>
              <p className="mt-2 text-[15px] leading-relaxed text-pretty text-soft">{view.why}</p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ── 4.0 Schema ───────────────────────────────────────────────────────────────

function SchemaSection() {
  return (
    <Section id="schema">
      <SectionIntro
        index="4.0"
        eyebrow="Schema"
        title="One schema, six ways to see it."
        link={{ to: "/features", hash: "schema", label: "Schema features" }}
      >
        <p>
          Open the schema diagram on any connection and switch how it's drawn: an ER diagram, a
          hierarchy, Mermaid for your docs, a tree of foreign keys, a data dictionary, or the DDL.{" "}
          <strong>Try it below on a sample store.</strong>
        </p>
      </SectionIntro>
      <SchemaShowcase className="mt-16 md:mt-24" />
    </Section>
  );
}

// ── 5.0 Editing ──────────────────────────────────────────────────────────────

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

function Editing() {
  return (
    <Section id="editing">
      <SectionIntro
        index="5.0"
        eyebrow="Editing"
        title="Change data without holding your breath."
        link={{ to: "/features", label: "Learn more" }}
      >
        <p>
          <strong>Nothing touches the database until you say so.</strong> Every change is previewed
          first, and every action on a cell is one right-click away.
        </p>
      </SectionIntro>

      {/* The staged-changes grid, with the cell menu laid over its right edge. */}
      <div className="relative mt-16 md:mt-24 md:pb-24">
        <Panel className="md:w-[78%]">
          <FeatureShot
            src="/features/staged-edits.webp"
            width={1472}
            height={750}
            alt="Staged changes in the openai_docs table: a new row at the top, a row marked for deletion in red, and a cell being edited with Stage change"
            flush
          />
        </Panel>
        <Panel className="mt-4 w-[78%] md:absolute md:right-0 md:bottom-0 md:mt-0 md:w-[36%]">
          <FeatureShot
            src="/features/context-menu.webp"
            width={864}
            height={715}
            alt="The cell context menu with Open row, Preview cell, Preview row JSON, Pin column, Edit, Copy as, Filter, Transform, Duplicate row, and Delete row, and the Filter submenu open"
            flush
          />
        </Panel>
      </div>

      <FeatureRow items={EDITING_FEATURES} />
    </Section>
  );
}

// ── 6.0 Agents ───────────────────────────────────────────────────────────────

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
      <SectionIntro title="A quick tour of Stroke.">
        <p>Connect, browse, query, and hand the same database to an agent.</p>
      </SectionIntro>
      <VideoDemo
        videoId="xmeVKZShJtQ"
        title="A quick tour of the Stroke database client"
        className="mt-16 md:mt-24"
      />
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
  "All ten engines, from Postgres to DuckDB",
  "macOS, Windows & Linux",
  "No sign-in required",
];

const LICENSE_PERKS = [
  "The app is yours forever, nothing to cancel",
  "A license key for up to 2 of your devices",
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
    a: "Yes. Your license covers 2 devices at once, and you can deactivate it in the app on your old machine whenever you switch, or email us if that machine is gone. Refunds are covered in the Terms of Service.",
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
