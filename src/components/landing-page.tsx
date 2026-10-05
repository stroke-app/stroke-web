import {
  SiClickhouse,
  SiCloudflare,
  SiCockroachlabs,
  SiDuckdb,
  SiMariadb,
  SiMysql,
  SiPlanetscale,
  SiPosthog,
  SiPostgresql,
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
  ChevronDownIcon,
  CodeIcon,
  DatabaseIcon,
  GitForkIcon,
  GitPullRequestIcon,
  Grid3x3Icon,
  KeyboardIcon,
  LayoutDashboardIcon,
  MapIcon,
  ListChecksIcon,
  ListIcon,
  MousePointerClickIcon,
  NetworkIcon,
  PencilLineIcon,
  PlugIcon,
  ReplaceIcon,
  SearchIcon,
  StarIcon,
  StickyNoteIcon,
  TablePropertiesIcon,
  TerminalIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { LaunchVideo, VideoDemo } from "#/components/app-window";
import { SmartDownloadButton } from "#/components/download-button";
import { FeatureShot } from "#/components/feature-shot";
import { GiveawayCard } from "#/components/giveaway";
import { Eyebrow, WRAP } from "#/components/page";
import { BrushStroke, REPO_URL, SiteFooter, SiteHeader } from "#/components/site-chrome";
import { buttonVariants } from "#/components/ui/button";
import { useAuth } from "#/lib/auth/hooks";
import { useLatestRelease } from "#/lib/releases";
import { approvedReviewsQueryOptions } from "#/lib/reviews/functions";
import { cn } from "#/lib/utils";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <Pillars />
        <Connect />
        <Features />
        <Views />
        <Editing />
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

function SectionHeader({
  eyebrow,
  title,
  children,
  center = false,
  as: Heading = "h2",
}: {
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  center?: boolean;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Heading className="mt-3 text-3xl leading-[1.1] font-medium tracking-[-0.035em] text-balance sm:text-[2.75rem]">
        {title}
      </Heading>
      {children && (
        <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-pretty text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  );
}

function ReleasePill() {
  const { data: release } = useLatestRelease();
  return (
    <Link
      to="/changelog"
      className="group inline-flex h-7 items-center gap-2 rounded-full border border-border/60 bg-muted/30 pr-2.5 pl-1 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
    >
      <span className="rounded-full bg-copper/15 px-2 py-0.5 text-[11px] font-medium text-copper">
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
      <div className={cn(WRAP, "pt-16 pb-20 md:pt-28 md:pb-28")}>
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="animate-fade-up">
            <ReleasePill />
          </div>

          <h1
            className="animate-fade-up mt-7 text-[2.1rem] leading-[1.02] font-medium tracking-[-0.045em] text-balance min-[430px]:text-[2.6rem] sm:text-6xl md:text-[4.25rem]"
            style={{ animationDelay: "80ms" }}
          >
            The database studio for{" "}
            <span className="relative inline-block whitespace-nowrap">
              agents and humans
              <BrushStroke
                animate
                className="absolute -bottom-2 left-0 h-2.5 w-full sm:-bottom-3"
              />
            </span>
            .
          </h1>

          <p
            className="animate-fade-up mt-8 max-w-xl text-lg leading-[1.6] text-pretty text-muted-foreground"
            style={{ animationDelay: "160ms" }}
          >
            Fast, elegant, and designed for engineers and analysts who care about their tools.
            Rethink how you query, explore, and work with data.
          </p>

          <div
            className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <SmartDownloadButton size="lg" variant="default" alternates={false} />
            <Link to="/pricing" className={buttonVariants({ variant: "outline", size: "lg" })}>
              $9.99 · Own it forever
            </Link>
          </div>

          <p
            className="animate-fade-up mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground sm:gap-x-2"
            style={{ animationDelay: "300ms" }}
          >
            <span>macOS, Windows, and Linux</span>
            <span aria-hidden="true" className="hidden sm:inline">
              ·
            </span>
            <span>Free to try, no account needed</span>
            <span aria-hidden="true" className="hidden sm:inline">
              ·
            </span>
            <Link
              to="/download"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              Other downloads
            </Link>
          </p>
        </div>

        <div
          className="animate-fade-up mx-auto mt-14 max-w-5xl md:mt-20"
          style={{ animationDelay: "380ms" }}
        >
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

        <Databases />
      </div>
    </section>
  );
}

const DATABASES = [
  { name: "PostgreSQL", Icon: SiPostgresql },
  { name: "MySQL", Icon: SiMysql },
  { name: "MariaDB", Icon: SiMariadb },
  { name: "SQLite", Icon: SiSqlite },
  { name: "DuckDB", Icon: SiDuckdb },
  { name: "SQL Server", Icon: DatabaseIcon },
  { name: "ClickHouse", Icon: SiClickhouse },
  { name: "CockroachDB", Icon: SiCockroachlabs },
  { name: "Turso / LibSQL", Icon: SiTurso },
  { name: "Cloudflare D1", Icon: SiCloudflare },
  { name: "Redis", Icon: SiRedis, tag: "Beta" },
] as const;

function Databases() {
  return (
    <div className="mx-auto mt-16 max-w-5xl">
      <p className="text-center text-sm text-muted-foreground">
        Ten engines today, from a local SQLite file to ClickHouse
      </p>
      <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        {DATABASES.map((db) => (
          <li key={db.name} className="flex items-center gap-2 text-sm text-muted-foreground">
            <db.Icon className="size-4 shrink-0" />
            <span className="font-medium">{db.name}</span>
            {"tag" in db && (
              <span className="rounded-full bg-copper/12 px-1.5 py-px text-[11px] font-medium text-copper">
                {db.tag}
              </span>
            )}
          </li>
        ))}
        <li>
          <Link
            to="/roadmap"
            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            More on the roadmap →
          </Link>
        </li>
      </ul>
    </div>
  );
}

type MarkProps = { className?: string; style?: React.CSSProperties };

function NeonMark({ className, style }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} style={style}>
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2.5" />
      <path d="M8.5 16V8l7 8V8" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

// Nile's own mark (thenile.dev/logo.svg), the same one the desktop app draws.
function NileMark({ className, style }: MarkProps) {
  return (
    <svg
      viewBox="0 0 23.6 29.5"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path d="M20.121 21.658C14.5515 21.0013 9.75863 17.4158 7.56726 12.2611C6.97966 10.8371 5.56944 9.83472 3.93571 9.83472C1.76277 9.83472 0 11.5975 0 13.7681C0 14.8534 0.437813 15.8397 1.15214 16.5494C2.87113 18.2684 2.87113 21.0635 1.15214 22.7825C0.444726 23.4899 0 24.4784 0 25.5637C0 27.7344 1.76277 29.4971 3.93341 29.4971C6.10404 29.4971 7.86681 27.7344 7.86681 25.5637C7.86681 24.4784 7.429 23.4922 6.71467 22.7825C5.44962 21.5174 5.11781 19.6694 5.71231 18.1025C10.3093 19.3376 14.1368 22.6166 16.0286 27.0707C16.6162 28.4948 18.0264 29.4971 19.6601 29.4971C21.8307 29.4971 23.5935 27.7344 23.5935 25.5637C23.5935 23.5452 22.0704 21.8861 20.1187 21.6603L20.121 21.658ZM22.4414 6.71467C23.1488 6.00726 23.5935 5.01872 23.5935 3.93341C23.5935 1.76277 21.8307 0 19.6601 0C17.4895 0 15.7267 1.76277 15.7267 3.93341C15.7267 5.01872 16.1645 6.00495 16.8789 6.71467C18.1439 7.97972 18.4757 9.82775 17.8812 11.3947C13.2842 10.1596 9.45677 6.88058 7.56495 2.42641C6.97736 1.00236 5.56944 0 3.93341 0C1.76277 0 0 1.76277 0 3.93341C0 5.95196 1.52313 7.61104 3.47485 7.83686C9.0443 8.48436 13.828 12.0721 16.0217 17.2268C16.6092 18.6508 18.0195 19.6532 19.6532 19.6532C21.8238 19.6532 23.5866 17.8904 23.5866 15.7198C23.5866 14.6345 23.1488 13.6483 22.4345 12.9385C20.7247 11.2288 20.7247 8.44058 22.4414 6.71467Z" />
    </svg>
  );
}

// Same providers, order, and colours as the desktop app's "Connect with a provider".
const PROVIDERS = [
  { name: "Neon", Icon: NeonMark, color: "#00e599" },
  { name: "Supabase", Icon: SiSupabase, color: "#3ecf8e" },
  { name: "Prisma Postgres", Icon: SiPrisma, color: "#6366f1" },
  { name: "PlanetScale", Icon: SiPlanetscale, color: "currentColor" },
  { name: "TiDB Cloud", Icon: SiTidb, color: "#e30c34" },
  { name: "Turso", Icon: SiTurso, color: "#4ff8d2" },
  { name: "Railway", Icon: SiRailway, color: "currentColor" },
  { name: "Nile", Icon: NileMark, color: "#8a63f9" },
  { name: "Upstash", Icon: SiUpstash, color: "#00e9a3" },
  { name: "PostHog", Icon: SiPosthog, color: "#f9bd2b" },
  { name: "Cloudflare D1", Icon: SiCloudflare, color: "#f38020" },
] as const;

const CONNECT_STEPS = [
  {
    title: "Sign in with your provider",
    body: "Authorize Stroke once from the connection screen.",
  },
  { title: "Pick a database", body: "Every database on your account shows up, ready to open." },
  { title: "You're connected", body: "No connection strings to find, copy, or paste." },
];

function Connect() {
  return (
    <section id="connect" className="scroll-mt-16">
      <div
        className={cn(
          WRAP,
          "grid grid-cols-1 items-center gap-12 py-24 md:py-32 lg:grid-cols-2 lg:gap-20",
        )}
      >
        <div>
          <SectionHeader eyebrow="Connect" title="Sign in. Pick a database. You're in.">
            <p>
              Sign in with your database provider and see every database on your account, then
              connect in one click. Everything else still takes a plain connection string.
            </p>
          </SectionHeader>
          <ol className="mt-10 space-y-5">
            {CONNECT_STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-xs font-medium tabular-nums">
                  {i + 1}
                </span>
                <span className="pt-0.5">
                  <span className="block text-sm font-medium">{step.title}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative">
          <div className="spotlight rounded-3xl border border-white/10 bg-[#050505] p-6 text-white [--spot-glow:oklch(1_0_0/0.07)] [--spot-line:oklch(1_0_0/0.55)] sm:p-8">
            <p className="text-xs font-medium text-white/50">Connect with a provider</p>
            <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {PROVIDERS.map((p) => (
                <li
                  key={p.name}
                  className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium"
                >
                  <p.Icon className="size-4.5 shrink-0" style={{ color: p.color }} />
                  {p.name}
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-white/8 pt-4 text-xs leading-relaxed text-white/45">
              Or paste a connection string for any of the ten engines Stroke supports.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

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
    <section className="border-b border-border/40">
      <div
        className={cn(
          WRAP,
          "grid grid-cols-1 divide-y divide-border/40 md:grid-cols-3 md:divide-x md:divide-y-0",
        )}
      >
        {PILLARS.map((p, i) => (
          <div
            key={p.title}
            className="flex flex-col gap-3 py-12 md:px-10 md:py-16 md:first:pl-0 md:last:pr-0"
          >
            <span className="text-sm font-medium text-copper tabular-nums">0{i + 1}</span>
            <h3 className="text-base font-semibold tracking-tight">{p.title}</h3>
            <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Tile({
  icon: Icon,
  title,
  desc,
  className,
  children,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "spotlight flex flex-col rounded-3xl border border-border bg-card p-7 transition-colors duration-150 hover:border-foreground/20 sm:p-8",
        className,
      )}
    >
      <Icon className="size-4 text-copper" strokeWidth={1.5} />
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
        {desc}
      </p>
      {children && <div className="mt-6 flex flex-1 flex-col justify-end">{children}</div>}
    </div>
  );
}

/** A small app-like panel that frames the illustrations inside feature tiles. */
function Panel({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "overflow-hidden rounded-lg border border-border/60 bg-background font-mono text-[11.5px] leading-relaxed",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-border/50 px-3 py-2">
        <span className="size-2 rounded-full bg-border" />
        <span className="size-2 rounded-full bg-border" />
        <span className="size-2 rounded-full bg-border" />
        <span className="ml-2 text-[10.5px] text-muted-foreground">{label}</span>
      </div>
      {children}
    </div>
  );
}

const K = ({ children }: { children: React.ReactNode }) => (
  <span className="text-copper">{children}</span>
);

const CHART_SHOTS = [
  {
    key: "bar",
    label: "Bar",
    src: "/features/charts-bar.webp",
    alt: "A bar chart of article views by publish date, built from a query result, with a tooltip showing 195,621 views for May 2023",
  },
  {
    key: "area",
    label: "Area",
    src: "/features/charts-area.webp",
    alt: "The same query as an area chart of article views over time, with a tooltip showing 34,730 views for May 2023",
  },
  {
    key: "step",
    label: "Step",
    src: "/features/charts-step.webp",
    alt: "The same query as a step chart of article views over time, with a tooltip showing 220,106 views for May 2023",
  },
] as const;

/** Real chart screenshots from the app, switchable with a small toggle. */
function ChartShowcase() {
  const [active, setActive] = useState<(typeof CHART_SHOTS)[number]["key"]>("bar");

  return (
    <div>
      <fieldset className="mb-3 inline-flex rounded-lg border border-border/60 bg-background p-0.5">
        <legend className="sr-only">Chart type</legend>
        {CHART_SHOTS.map((shot) => (
          <button
            key={shot.key}
            type="button"
            aria-pressed={active === shot.key}
            onClick={() => setActive(shot.key)}
            className={cn(
              "h-7 rounded-md px-3 text-xs font-medium transition-colors duration-150",
              active === shot.key
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {shot.label}
          </button>
        ))}
      </fieldset>
      {/* Both images share one grid cell, so they cross-fade in place. */}
      <div className="grid">
        {CHART_SHOTS.map((shot) => (
          <div
            key={shot.key}
            inert={active !== shot.key}
            className={cn(
              "transition-opacity duration-150 ease-out [grid-area:1/1]",
              active === shot.key ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <FeatureShot src={shot.src} width={1472} height={718} alt={shot.alt} />
          </div>
        ))}
      </div>
    </div>
  );
}

function McpIllustration() {
  return (
    <Panel label="claude_desktop_config.json">
      <pre className="overflow-x-auto p-3 text-foreground/90">
        {"{\n"}
        {"  "}
        <K>"mcpServers"</K>
        {": {\n    "}
        <K>"stroke"</K>
        {": {\n      "}
        <K>"url"</K>
        {': "http://127.0.0.1:4319/mcp"\n    }\n  }\n}'}
      </pre>
    </Panel>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-16">
      <div className={cn(WRAP, "py-24 md:py-32")}>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeader eyebrow="Features" title="Everything you need. Nothing you don't." />
          <Link
            to="/features"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "self-start md:self-auto",
            )}
          >
            See all features
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-16 lg:grid-cols-6">
          <Tile
            icon={TerminalIcon}
            title="SQL console"
            desc="A full editor with schema-aware autocomplete, formatting, execution time, and one-click CSV or JSON export."
            className="sm:col-span-2 lg:col-span-4"
          >
            <FeatureShot
              src="/features/sql-console.webp"
              width={1473}
              height={689}
              alt="The Stroke query editor running SELECT * FROM events LIMIT 10, with ten typed result rows below: 10 rows in 16ms"
            />
          </Tile>
          <Tile
            icon={PlugIcon}
            title="Built-in MCP server"
            desc="Expose your database to Claude, Cursor, and other MCP clients with one-click config."
            className="lg:col-span-2"
          >
            <McpIllustration />
          </Tile>
          <Tile
            icon={TablePropertiesIcon}
            title="Schema explorer"
            desc="Tables, views, materialized views, foreign tables, indexes, and enums, all with live row counts."
            className="lg:col-span-2"
          />
          <Tile
            icon={SearchIcon}
            title="Powerful data grid"
            desc="Paginated browsing, resizable columns, multi-column sort, full-text search, and a visual filter builder."
            className="lg:col-span-2"
          />
          <Tile
            icon={PencilLineIcon}
            title="Inline editing"
            desc="Type-aware editors for text, numbers, booleans, enums, dates, UUIDs, and JSON."
            className="lg:col-span-2"
          />
          <Tile
            icon={BotIcon}
            title="AI chat"
            desc="An assistant with direct database access that runs queries, explains schemas, and generates SQL."
            className="lg:col-span-3"
          >
            <FeatureShot
              src="/features/ai-chat.webp"
              width={1120}
              height={836}
              alt="The Stroke AI chat, connected to the public schema with 6 tables, asking what you would like to explore, with suggestions like Row counts for all tables, Foreign key relationships, and Spot duplicate records"
            />
          </Tile>
          <Tile
            icon={KeyboardIcon}
            title="Command palette"
            desc="Hit Cmd/Ctrl+K to jump anywhere. Every core view has a shortcut."
            className="lg:col-span-3"
          >
            <FeatureShot
              src="/features/command-palette.webp"
              width={1920}
              height={1080}
              alt="The Stroke command palette open over the app, listing views like Table data, Find in database, SQL editor, ORM Runner, ER Diagram, and Schema Explorer with their keyboard shortcuts"
            />
          </Tile>
          <Tile
            icon={LayoutDashboardIcon}
            title="Charts & dashboards"
            desc="Turn any query result into a chart in one click, then pin it to a dashboard you can revisit any time."
            className="sm:col-span-2 lg:col-span-4"
          >
            <ChartShowcase />
          </Tile>
          <Tile
            icon={NetworkIcon}
            title="Schema diagrams"
            desc="Auto-generated ERDs of your tables and relationships with foreign-key navigation."
            className="lg:col-span-2"
          />
          <Link
            to="/features"
            className="group flex flex-col justify-between gap-4 rounded-3xl border border-dashed border-border p-7 transition-colors hover:border-copper/50 hover:bg-muted/20 sm:px-8 lg:col-span-6 lg:flex-row lg:items-center"
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              Exports, shortcuts, and the rest of what ships in the app.
            </p>
            <span className="flex items-center gap-1.5 text-sm font-medium">
              Every feature
              <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

interface ViewInfo {
  key: string;
  label: string;
  icon: React.ElementType;
  title: string;
  what: string;
  why: string;
  shot?: { src: string; width: number; height: number; alt: string };
}

const VIEWS: ViewInfo[] = [
  {
    key: "table",
    label: "Table view",
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
    label: "JSON view",
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
    key: "record",
    label: "Record view",
    icon: ListIcon,
    title: "One row, top to bottom",
    what: "A single row laid out field by field, each with its name and type.",
    why: "Wide tables. A row with forty columns reads down the page instead of scrolling sideways.",
  },
  {
    key: "text",
    label: "Text view",
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
    label: "Chart view",
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
    label: "ERD view",
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
    label: "Map view",
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

const COUNT_WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

/** How long each view stays on stage while the section plays on its own. */
const VIEW_DWELL_MS = 5000;

function Views() {
  // Only views with a real screenshot go on stage.
  const views = VIEWS.filter((v) => v.shot);
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const section = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const view = views[active];

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
    const next = (i + views.length) % views.length;
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
      End: views.length - 1,
    };
    if (e.key in keys) {
      e.preventDefault();
      choose(keys[e.key], true);
    }
  };

  const playing = autoplay && inView && !hovered;

  return (
    <section ref={section} id="views" className="relative isolate scroll-mt-16 overflow-hidden">
      <div className={cn(WRAP, "py-24 md:py-32")}>
        <SectionHeader
          eyebrow="Views"
          title={`One result, ${COUNT_WORDS[views.length] ?? views.length} ways to read it.`}
          center
        >
          <p>
            Switch how any table or query result is shown, without running it again. Each view is
            built for a different question.
          </p>
        </SectionHeader>

        {/* The switcher, styled after the app's own view menu. */}
        <div className="mt-10 flex justify-center">
          <div
            role="tablist"
            aria-label="Views"
            className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-border bg-card p-1"
          >
            {views.map((v, i) => {
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
                    "relative flex h-9 shrink-0 items-center gap-2 overflow-hidden rounded-full px-4 text-sm whitespace-nowrap transition-colors duration-150",
                    selected
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <v.icon className="size-4 shrink-0" strokeWidth={1.75} />
                  {v.label.replace(" view", "")}
                  {selected && autoplay && (
                    <span
                      key={`${v.key}-progress`}
                      aria-hidden="true"
                      onAnimationEnd={() => setActive((i + 1) % views.length)}
                      style={{
                        animationDuration: `${VIEW_DWELL_MS}ms`,
                        animationPlayState: playing ? "running" : "paused",
                      }}
                      className="view-progress absolute inset-x-4 bottom-0.5 h-px origin-left rounded-full bg-copper"
                    />
                  )}
                </button>
              );
            })}
          </div>
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
          className="mx-auto mt-8 max-w-5xl"
        >
          <div className="spotlight rounded-[1.5rem] border border-border [--spot-x:70%]">
            <div className="overflow-hidden rounded-[calc(1.5rem-1px)] bg-[#050505]">
              <div className="flex items-center gap-1.5 border-b border-white/8 px-4 py-2.5">
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="ml-3 flex items-center gap-1.5 text-xs text-white/55">
                  <view.icon className="size-3.5" strokeWidth={1.75} />
                  {view.label}
                </span>
              </div>
              <div className="grid">
                {views.map((v, i) =>
                  v.shot ? (
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
                  ) : null,
                )}
              </div>
            </div>
          </div>

          {/* Caption: what it is and why you would reach for it. */}
          <div
            key={view.key}
            className="animate-fade-up mt-6 grid gap-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] sm:gap-10"
          >
            <div>
              <h3 className="text-lg font-semibold tracking-tight">{view.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">
                {view.what}
              </p>
            </div>
            <div className="border-l-2 border-copper/60 pl-4">
              <p className="text-[13px] font-medium text-copper">Why use it</p>
              <p className="mt-1 text-sm leading-relaxed text-pretty text-foreground/85">
                {view.why}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Editing() {
  return (
    <section id="editing" className="scroll-mt-16">
      <div className={cn(WRAP, "py-24 md:py-32")}>
        <SectionHeader eyebrow="Editing" title="Change data without holding your breath.">
          <p>
            Nothing touches the database until you say so. Every change is previewed first, and
            every action on a cell is one right-click away.
          </p>
        </SectionHeader>

        <div className="mt-14 grid grid-cols-1 gap-4 md:mt-16 lg:grid-cols-6">
          <Tile
            icon={MousePointerClickIcon}
            title="Everything is a right-click away"
            desc="Filter by a value or exclude it, copy in another format, transform, duplicate, or preview the row as JSON, straight from the cell."
            className="lg:col-span-2"
          >
            <FeatureShot
              src="/features/context-menu.webp"
              width={864}
              height={715}
              alt="The cell context menu with Open row, Preview cell, Preview row JSON, Pin column, Edit, Copy as, Filter, Transform, Duplicate row, and Delete row, and the Filter submenu open"
            />
          </Tile>
          <Tile
            icon={BracesIcon}
            title="Open any row as JSON"
            desc="Expand a row in place to read every field, switch between tree and raw, and copy any value with one click."
            className="lg:col-span-4"
          >
            <FeatureShot
              src="/features/row-json.webp"
              width={1477}
              height={516}
              alt="Row 8 expanded inline as a JSON tree with id, doc_id, chunk, source, content, tokens, and embedding, with Tree and Raw toggles and copy buttons"
            />
          </Tile>
          <Tile
            icon={ListChecksIcon}
            title="Every change waits for you"
            desc="Edits, new rows, and deletes are staged and marked right in the grid. Review them, then apply them together, or reset and they never happened."
            className="lg:col-span-4"
          >
            <FeatureShot
              src="/features/staged-edits.webp"
              width={1472}
              height={750}
              alt="Staged changes in the openai_docs table: a new row at the top, a row marked for deletion in red, and a cell being edited with Stage change"
            />
          </Tile>
          <Tile
            icon={ReplaceIcon}
            title="Find and replace, previewed"
            desc="Pick a column, match case, whole word, or a regex, and see every cell that will change, old value beside new, before you replace."
            className="lg:col-span-2"
          >
            <FeatureShot
              src="/features/find-replace.webp"
              width={960}
              height={1000}
              alt="Find and replace on the label column of geom_zoo: point replaced with updated, previewing 8 cells that will change, with match case, regex, and whole word options"
            />
          </Tile>
        </div>
      </div>
    </section>
  );
}

function Demo() {
  return (
    <section className="border-b border-border/40">
      <div className={cn(WRAP, "py-24 md:py-32")}>
        <SectionHeader eyebrow="See it in action" title="A quick tour of Stroke" center>
          <p>Connect, browse, query, and hand the same database to an agent.</p>
        </SectionHeader>
        <VideoDemo
          videoId="xmeVKZShJtQ"
          title="A quick tour of the Stroke database client"
          className="mx-auto mt-14 max-w-5xl md:mt-16"
        />
      </div>
    </section>
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
    <section id="reviews" className="scroll-mt-16">
      <div className={cn(WRAP, "py-24 md:py-32")}>
        <SectionHeader eyebrow="Reviews" title="What people say about Stroke" />

        <div className="mt-14 gap-4 [column-fill:_balance] sm:columns-2 md:mt-16 lg:columns-3">
          {reviews.map((r) => (
            <figure
              key={r.id}
              className="mb-4 flex break-inside-avoid flex-col gap-4 rounded-3xl border border-border bg-card p-6 transition-colors duration-150 hover:border-foreground/20"
            >
              <blockquote className="text-sm leading-relaxed text-foreground/90">
                “{r.body}”
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground/8 text-[10px] font-semibold text-muted-foreground uppercase ring-1 ring-border/60">
                  {initialsFrom(r.authorName)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium">{r.authorName}</span>
                  {r.title ? (
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {r.title}
                    </span>
                  ) : null}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function PerkList({ perks, accent = false }: { perks: string[]; accent?: boolean }) {
  return (
    <ul className="space-y-3 text-sm">
      {perks.map((perk) => (
        <li key={perk} className="flex items-start gap-3">
          <span
            className={cn(
              "mt-px flex size-4.5 shrink-0 items-center justify-center rounded-full",
              accent ? "bg-copper/15 text-copper" : "bg-foreground/8 text-foreground/70",
            )}
          >
            <CheckIcon className="size-3" strokeWidth={2.5} />
          </span>
          <span className="text-pretty text-muted-foreground">{perk}</span>
        </li>
      ))}
    </ul>
  );
}

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
  note: string;
  perks: string[];
  featured?: boolean;
}) {
  return (
    <div className={cn("relative flex flex-col p-7 sm:p-8")}>
      {featured && (
        <span
          aria-hidden="true"
          className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-copper to-transparent"
        />
      )}
      <div className="flex h-6 items-center justify-between gap-3">
        <h3 className="text-sm font-medium">{name}</h3>
        {tag && (
          <span className="rounded-full border border-copper/30 bg-copper/10 px-2 py-0.5 text-[11px] font-medium text-copper">
            {tag}
          </span>
        )}
      </div>
      <p className="mt-6 flex items-baseline gap-1.5">
        <span className="text-5xl font-semibold tracking-[-0.04em] tabular-nums">{price}</span>
        <span className="text-sm text-muted-foreground">{suffix}</span>
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{tagline}</p>

      <div className="mt-7">{cta}</div>
      <p className="mt-3 text-xs text-muted-foreground">{note}</p>

      <div className="mt-7 border-t border-border/60 pt-6">
        <p className="mb-4 text-xs font-medium text-muted-foreground">Includes</p>
        <PerkList perks={perks} accent={featured} />
      </div>
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

/** Pricing cards. Rendered on the landing page and as the /pricing page body. */
export function Pricing({ as = "h2" }: { as?: "h1" | "h2" }) {
  const { user } = useAuth();
  const buyTo = user ? "/app/billing" : "/login";

  return (
    <section id="pricing" className="scroll-mt-16">
      <div className={cn(WRAP, "py-24 md:py-32")}>
        <SectionHeader eyebrow="Pricing" title="Pay once. Own it forever." center as={as}>
          <p>
            Most database clients now charge $100 or more a year, every year. I think a tool you use
            every day should be one you own, so Stroke costs{" "}
            <strong className="font-medium text-foreground">$9.99, once</strong>. That is the lowest
            price I can offer and still keep development going.
          </p>
        </SectionHeader>

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card md:mt-16 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
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
              <Link
                to={buyTo}
                className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full")}
              >
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
              <Link
                to={buyTo}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
              >
                Buy Team
              </Link>
            }
            note="One-time payment. No per-seat billing."
            perks={TEAM_PERKS}
          />
        </div>

        <ul className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
          {["No renewals", "No upsells", "Nothing to cancel", "Free to try"].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <CheckIcon className="size-3.5 text-copper" strokeWidth={2.5} />
              {item}
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-14 max-w-5xl">
          <GiveawayCard />
        </div>
      </div>
    </section>
  );
}

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
    a: "Yes. Your license covers 2 devices at once, and you can deactivate an old device from your dashboard whenever you switch machines. Refunds are covered in the Terms of Service.",
  },
  {
    q: "Is Stroke open source?",
    a: "Yes. The whole app, Pro features included, is on GitHub. It is free to use personally or at work, just not for resale.",
  },
];

/** FAQ accordion. Rendered on the landing page and the /pricing page. */
export function Faq() {
  return (
    <section id="faq" className="scroll-mt-16">
      <div
        className={cn(
          WRAP,
          "grid grid-cols-1 gap-10 py-24 md:py-32 lg:grid-cols-[1fr_1.6fr] lg:gap-16",
        )}
      >
        <div>
          <SectionHeader eyebrow="FAQ" title="Questions, answered." />
          <p className="mt-6 text-sm text-muted-foreground">
            The fine print lives in the{" "}
            <Link to="/terms" className="underline underline-offset-2 hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="divide-y divide-border/50 border-y border-border/50">
          {FAQ_ITEMS.map((item, i) => (
            <details key={item.q} className="group" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium transition-colors hover:text-copper [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-pretty text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

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
    <section id="open-source" className="scroll-mt-16">
      <div
        className={cn(WRAP, "grid grid-cols-1 items-center gap-12 py-24 md:py-32 lg:grid-cols-2")}
      >
        <div>
          <SectionHeader eyebrow="Open source" title="The whole thing is on GitHub.">
            <p>
              Every line, Pro features included. Stroke holds your database credentials and connects
              to your production systems, and you should not have to take anybody's word for what it
              does with them. Read it.
            </p>
            <p>
              Free to use, personally or at work. Not for resale, since that is what keeps it
              funded. If it saves you an afternoon, a star genuinely helps other people find it.
            </p>
          </SectionHeader>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: "default" }), "gap-2")}
            >
              <StarIcon className="size-4" />
              Star on GitHub
            </a>
            <a
              href={`${REPO_URL}/blob/master/CONTRIBUTING.md`}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "default" }), "gap-2")}
            >
              <GitPullRequestIcon className="size-4" />
              Contribute
            </a>
            <a
              href={`${REPO_URL}/issues`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Report a bug
            </a>
          </div>
        </div>

        <ul className="grid gap-3">
          {OPEN_SOURCE_ITEMS.map((item) => (
            <li
              key={item.title}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background">
                <item.icon className="size-4 text-copper" strokeWidth={1.5} />
              </span>
              <span>
                <span className="block text-sm font-medium">{item.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section>
      <div className={cn(WRAP, "py-24 md:py-32")}>
        <div className="spotlight overflow-hidden rounded-3xl border border-border bg-card px-6 py-20 text-center [--spot-x:50%] sm:py-24">
          <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
            Try Stroke on your own database.
          </h2>
          <BrushStroke className="mx-auto mt-4 h-2 w-24" />
          <p className="mt-5 text-sm text-muted-foreground">
            Free to download. $9.99 whenever you decide to keep it.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <SmartDownloadButton size="lg" variant="default" alternates={false} />
            <Link to="/docs" className={buttonVariants({ variant: "ghost", size: "lg" })}>
              Read the docs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
