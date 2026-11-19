import { SiGithub } from "@icons-pack/react-simple-icons";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BotIcon,
  CheckIcon,
  CommandIcon,
  DatabaseBackupIcon,
  DatabaseIcon,
  GaugeIcon,
  KeyRoundIcon,
  LockKeyholeIcon,
  MapIcon,
  MonitorIcon,
  NetworkIcon,
  PaletteIcon,
  PlusIcon,
  RefreshCwIcon,
  ReplaceIcon,
  Share2Icon,
  ShieldCheckIcon,
  SquareTerminalIcon,
  TableIcon,
  TerminalIcon,
} from "lucide-react";

import { AGENT_COMMANDS, CommandMenu } from "#/components/hero-commands";
import { HeroDownload } from "#/components/hero-download";
import {
  ArrowLink,
  Cell,
  CellGrid,
  Eyebrow,
  GUTTER,
  Lead,
  PageShell,
  Panel,
  Section,
  SectionIntro,
  siteButton,
} from "#/components/page";
import { LoopVideo } from "#/components/showcase";
import { SponsorBand } from "#/components/sponsor-goal";
import { useAuth } from "#/lib/auth/hooks";
import { SHIPPED_ENGINES } from "#/lib/engines";
import { PRO_PRICE, TRIAL_DAYS } from "#/lib/pricing";
import { approvedReviewsQueryOptions } from "#/lib/reviews/functions";
import { REPO_URL } from "#/lib/seo";
import { cn } from "#/lib/utils";

export function LandingPage() {
  return (
    <PageShell>
      <Hero />
      <Engines />
      <Introducing />
      <Features />
      <EverythingElse />
      <Reviews />
      <PricingTeaser />
      <Faq />
      <SponsorBand />
    </PageShell>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const others = SHIPPED_ENGINES.length - 5;
  return (
    <section className="relative isolate">
      {/* A low warm light behind the window, so the screenshot reads as the page's subject. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[22rem] -z-10 h-[38rem] bg-[radial-gradient(50%_50%_at_50%_50%,rgb(245_180_0/0.10),transparent_70%)]"
      />
      <div className={cn(GUTTER, "flex flex-col items-center pt-14 text-center md:pt-20")}>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-2 rounded-full bg-ink/[0.04] px-3.5 text-[13px] text-soft shadow-[0_0_0_1px_var(--border)_inset] transition-colors duration-150 hover:bg-ink/[0.07] hover:text-foreground"
        >
          <SiGithub className="size-3.5" />
          The source is on GitHub
          <ArrowRightIcon className="size-3.5 opacity-60" />
        </a>
        <h1 className="mt-6 max-w-[17ch] text-[2.5rem] leading-[1.04] tracking-[-0.045em] text-balance sm:text-[3.4rem] md:text-[4.1rem]">
          The database client for every database you run
        </h1>
        <p className="mt-6 max-w-[40rem] text-[17px] leading-[1.6] text-pretty text-muted-foreground md:text-[18px]">
          Browse, edit and query PostgreSQL, MySQL, SQLite, MongoDB, Redis and {others} more
          databases in one native app for macOS, Windows and Linux.
        </p>
        <div className="mt-9 flex w-full justify-center">
          <HeroDownload />
        </div>
        <p className="mt-4 text-[13px] text-faint">
          Free for {TRIAL_DAYS} days with every feature. Then {PRO_PRICE} once, no subscription.
        </p>
      </div>
      <div className={cn(GUTTER, "mt-14 md:mt-20")}>
        <HeroShot />
      </div>
      <TrustStrip />
    </section>
  );
}

/** The app itself, in a window frame: the first thing a buyer wants to see. */
function HeroShot() {
  return (
    <figure className="mx-auto max-w-[72rem]">
      <div className="rounded-[14px] bg-gradient-to-b from-ink/[0.14] to-ink/[0.04] p-px shadow-[0_40px_120px_-40px_rgb(0_0_0/0.65)]">
        <div className="keep-dark overflow-hidden rounded-[13px] bg-[#0b0b0b]">
          <img
            src="/shots/mongo.webp"
            alt="Stroke with a MongoDB orders collection open in the data grid, and Postgres, Turso and other connections in the sidebar"
            width={1600}
            height={1005}
            fetchPriority="high"
            decoding="async"
            className="block h-auto w-full"
          />
        </div>
      </div>
    </figure>
  );
}

const TRUST = [
  {
    icon: MonitorIcon,
    title: "Mac, Windows and Linux",
    body: "Apple Silicon and Intel. One purchase covers all your computers.",
  },
  {
    icon: LockKeyholeIcon,
    title: "Credentials stay with you",
    body: "Stroke connects straight from your computer. Passwords live in your OS keychain.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Nothing changes by accident",
    body: "Edits wait until you press Apply. Read-only connections refuse every write.",
  },
  {
    icon: BadgeCheckIcon,
    title: `${PRO_PRICE}, paid once`,
    body: "Every feature and every update. No subscription to cancel.",
  },
];

function TrustStrip() {
  return (
    <div className={cn(GUTTER, "mt-14 md:mt-20")}>
      <ul className="mx-auto grid max-w-[72rem] grid-cols-1 overflow-hidden rounded-xl border border-border sm:grid-cols-2 lg:grid-cols-4">
        {TRUST.map((t, i) => (
          <li
            key={t.title}
            className={cn(
              "flex flex-col gap-3 p-5 md:p-6",
              i > 0 && "border-border max-sm:border-t",
              i % 2 === 1 && "sm:border-l",
              i >= 2 && "sm:max-lg:border-t",
              i === 2 && "lg:border-l",
            )}
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-ink/[0.05] text-foreground">
              <t.icon className="size-[17px]" strokeWidth={1.7} />
            </span>
            <div>
              <p className="text-[15px] font-medium text-foreground">{t.title}</p>
              <p className="mt-1 text-[14px] leading-[1.55] text-pretty text-muted-foreground">
                {t.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One line of an agent's MCP session, as the app logs it. */
const AGENT_STEPS: { tool: string; arg: string; out: string; blocked?: boolean }[] = [
  { tool: "list_tables", arg: "public", out: "21 tables" },
  { tool: "describe_table", arg: "orders", out: "9 columns" },
  { tool: "query", arg: "SELECT status, count(*) FROM orders GROUP BY 1", out: "4 rows · 6 ms" },
  { tool: "query", arg: "UPDATE orders SET status = 'refunded' WHERE id = 8812", out: "1 row" },
  { tool: "query", arg: "DROP TABLE orders", out: "Blocked: needs Full access", blocked: true },
];

function AgentCard() {
  return (
    <div className="keep-dark dark rounded-xl bg-[#0d0d0d] p-5 text-[#e8e8e8] shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_30px_80px_-30px_rgb(0_0_0/0.8)]">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold">Claude Code · prod</p>
        <span className="flex items-center gap-1.5 rounded-full bg-white/[0.07] px-2 py-0.5 text-[12px] text-[#c8c8c8]">
          <span className="size-1.5 rounded-full bg-[#f5b400]" />
          Read and write
        </span>
      </div>
      <p className="mt-1 text-[13px] text-[#8f8f8f]">Every call the agent makes, as it happens.</p>
      <ul className="mt-5 space-y-2.5 font-mono text-[12.5px]">
        {AGENT_STEPS.map((s, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className={cn(
                "mt-[5px] size-1.5 shrink-0 rounded-full",
                s.blocked ? "bg-[#ff5f57]" : "bg-[#28c840]",
              )}
            />
            <span className="flex min-w-0 flex-1 gap-2">
              <span className="shrink-0 text-[#8ab8ff]">{s.tool}</span>
              <span className="truncate text-[#a8a8a8]" title={s.arg}>
                {s.arg}
              </span>
            </span>
            <span className={cn("shrink-0", s.blocked ? "text-[#ff8a80]" : "text-[#6b6b6b]")}>
              {s.out}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The newest thing, as one card: a word, a sentence, a button, a real visual. */
function Introducing() {
  return (
    <section
      className={cn(
        GUTTER,
        "relative isolate overflow-hidden border-t border-border py-20 md:py-28",
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-0 -z-10 h-[28rem] w-[40rem] -translate-y-1/2 bg-[radial-gradient(50%_50%_at_50%_50%,rgb(196_107_255/0.08),transparent_70%)]"
      />
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <p className="text-[19px] font-medium tracking-[-0.01em]">Built in</p>
          <p className="mt-1 bg-gradient-to-r from-[#f5b400] via-[#ff7a59] to-[#c46bff] bg-clip-text text-[3rem] leading-[1.1] font-semibold tracking-[-0.04em] text-transparent md:text-[3.5rem]">
            Agents
          </p>
          <p className="mt-4 max-w-sm text-[17px] leading-[1.6] text-pretty text-muted-foreground">
            Claude Code, Codex and Cursor read your schema and run queries through Stroke, and every
            query is held to the access level you set for that connection.
          </p>
          <ul className="mt-6 flex flex-col gap-2 text-[14.5px] text-soft">
            {[
              "Read only, read and write, or full access, per connection",
              "Every call logged in the app as it happens",
              "Nothing destructive without asking first",
            ].map((x) => (
              <li key={x} className="flex gap-2.5">
                <CheckIcon className="mt-1 size-4 shrink-0 text-[#4cb782]" />
                {x}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-2.5">
            <CommandMenu label="Add to your agent" items={AGENT_COMMANDS} />
            <Link to="/docs/mcp" className={siteButton({ variant: "ghost", size: "lg" })}>
              How it works
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </div>
        <AgentCard />
      </div>
    </section>
  );
}

// ── Engines ──────────────────────────────────────────────────────────────────

function Engines() {
  return (
    <section className="mt-20 border-t border-border md:mt-28" aria-labelledby="engines-title">
      <div className={cn(GUTTER, "py-16 md:py-20")}>
        <div className="flex flex-col items-center text-center">
          <h2
            id="engines-title"
            className="text-[1.75rem] leading-tight tracking-[-0.03em] text-balance md:text-[2.25rem]"
          >
            Works with the {SHIPPED_ENGINES.length} databases you already run
          </h2>
          <p className="mt-3 max-w-xl text-[15px] text-pretty text-muted-foreground">
            SQL, documents, key-value, analytics and search. One app, one set of shortcuts.
          </p>
        </div>
        <ul className="mx-auto mt-10 grid max-w-[64rem] grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
          {SHIPPED_ENGINES.map((e) => (
            <li key={e.slug}>
              <Link
                to="/databases/$engine"
                params={{ engine: e.slug }}
                className="group flex h-full flex-col items-center gap-2.5 rounded-xl bg-ink/[0.02] px-2 py-4 text-center shadow-[0_0_0_1px_var(--border)_inset] transition-[background-color,box-shadow] duration-150 hover:bg-ink/[0.05] hover:shadow-[0_0_0_1px_color-mix(in_oklch,var(--foreground)_22%,transparent)_inset]"
              >
                <span
                  className="flex size-10 items-center justify-center rounded-lg transition-transform duration-150 group-hover:scale-105"
                  style={{ background: `color-mix(in oklch, ${e.color} 14%, transparent)` }}
                >
                  <e.Icon className="size-5" color={e.color} />
                </span>
                <span className="w-full truncate text-[12.5px] text-soft group-hover:text-foreground">
                  {e.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex justify-center">
          <ArrowLink to="/databases" className="text-[14px]">
            What Stroke does with each one
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}

// ── Features ─────────────────────────────────────────────────────────────────

type Screen =
  | { kind: "image"; src: string; alt: string; width: number; height: number }
  | { kind: "video"; name: string; label: string; width: number; height: number };

type Feature = {
  id: string;
  eyebrow: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  lead: string;
  body: string;
  points: string[];
  link?: { to: React.ComponentProps<typeof Link>["to"]; label: string };
  screen: Screen;
};

const FEATURES: Feature[] = [
  {
    id: "browse",
    eyebrow: "Browse and edit",
    icon: TableIcon,
    title: "A grid that keeps up with you.",
    lead: "Sort, filter, pin and edit millions of rows.",
    body: "Every change is staged and marked in the grid until you press Apply, so nothing reaches the database by accident.",
    points: [
      "Filters that write the WHERE clause for you",
      "Column stats: nulls, distinct values, min and max",
      "Seven views of the same rows, from JSON to a map",
    ],
    screen: {
      kind: "image",
      src: "/shots/column-stats.webp",
      alt: "A table in Stroke's grid with a column's menu and its stats: rows, nulls and distinct values",
      width: 1600,
      height: 1005,
    },
  },
  {
    id: "query",
    eyebrow: "Query",
    icon: TerminalIcon,
    title: "Write SQL. Read the result your way.",
    lead: "Run a whole script and every result gets its own tab.",
    body: "Look at each one as a table, JSON, a chart or a query plan, without copying anything into another tool.",
    points: [
      "Autocomplete that knows your schema",
      "Bar, line, area and pie charts from any result",
      "EXPLAIN as readable steps with cost per step",
    ],
    screen: {
      kind: "image",
      src: "/shots/multi-result.webp",
      alt: "The SQL editor with two result tabs",
      width: 1600,
      height: 1005,
    },
  },
  {
    id: "agents",
    eyebrow: "AI and MCP",
    icon: BotIcon,
    title: "Hand your database to an agent.",
    lead: "Ask in the app, or connect Claude, Cursor or Codex.",
    body: "The built-in MCP server lets any agent read your schema and run queries, with read-only and write levels you choose per connection.",
    points: [
      "Every query the agent runs is listed as it happens",
      "Answers come back as tables, charts and ER diagrams",
      "Bring your own key, or use the models built in",
    ],
    link: { to: "/docs/mcp", label: "Set up MCP" },
    screen: {
      kind: "image",
      src: "/shots/ai-steps.webp",
      alt: "The AI chat creating tables, each step listed",
      width: 1600,
      height: 1004,
    },
  },
  {
    id: "nosql",
    eyebrow: "Beyond SQL",
    icon: DatabaseIcon,
    title: "MongoDB, Redis and DynamoDB in the same window.",
    lead: "Documents, keys and items each get a view built for them.",
    body: "Browse a collection as a grid, build an aggregation stage by stage, or watch Redis memory and hit ratio live.",
    points: [
      "Typed document fields, with a JSON view one key away",
      "Redis keys, pub/sub and a server overview",
      "DynamoDB with your AWS profile or DynamoDB Local",
    ],
    screen: {
      kind: "image",
      src: "/shots/mongo-aggregate.webp",
      alt: "A MongoDB aggregation built stage by stage in Stroke",
      width: 1600,
      height: 1005,
    },
  },
  {
    id: "admin",
    eyebrow: "Postgres admin",
    icon: GaugeIcon,
    title: "Run the server, not only the queries.",
    lead: "See what Postgres is doing right now.",
    body: "Connections, cache hit ratio and writes refresh live. Change a setting, manage roles, and turn on row level security per table.",
    points: [
      "Instance insights, refreshed every few seconds",
      "Every server setting, searchable and editable",
      "Roles, grants and RLS in one place",
    ],
    screen: {
      kind: "image",
      src: "/shots/insights.webp",
      alt: "Instance insights for a Postgres 16 server",
      width: 1600,
      height: 1005,
    },
  },
  {
    id: "backup",
    eyebrow: "Backup and restore",
    icon: DatabaseBackupIcon,
    title: "Back up a database in a few clicks.",
    lead: "Export a whole database to a .sql file.",
    body: "Restore it into another one and watch every statement apply, with a live log and the errors collected at the end.",
    points: [
      "Postgres, MySQL, SQLite, D1, Turso, DuckDB, SQL Server",
      "Pick tables, schema, data and functions",
      "Restore across providers, D1 to Postgres included",
    ],
    screen: {
      kind: "video",
      name: "backup",
      label: "Exporting 31 tables from a Cloudflare D1 database",
      width: 1600,
      height: 1008,
    },
  },
  {
    id: "share",
    eyebrow: "Sharing",
    icon: Share2Icon,
    title: "Share a result, not your database.",
    lead: "Send rows, a chart or a schema as a link.",
    body: "It's end-to-end encrypted and expires when you say. The person you send it to needs no account and no app.",
    points: [
      "Pick the columns and mask sensitive values",
      "Set an expiry, a view limit or a password",
      "Revoke it any time from your account",
    ],
    screen: {
      kind: "image",
      src: "/shots/shared-schema.webp",
      alt: "A shared schema diagram open in a browser",
      width: 1600,
      height: 959,
    },
  },
];

function FeatureScreen({ screen }: { screen: Screen }) {
  return (
    <Panel className="aspect-[16/10]">
      {screen.kind === "image" ? (
        <img
          src={screen.src}
          alt={screen.alt}
          width={screen.width}
          height={screen.height}
          loading="lazy"
          decoding="async"
          className="block h-full w-full object-cover object-top-left"
        />
      ) : (
        <LoopVideo
          media={{
            kind: "video",
            src: `/shots/${screen.name}.mp4`,
            poster: `/shots/${screen.name}-poster.webp`,
            width: screen.width,
            height: screen.height,
            label: screen.label,
          }}
        />
      )}
    </Panel>
  );
}

function Features() {
  return (
    <>
      {FEATURES.map((f, i) => (
        <section
          key={f.id}
          id={f.id}
          className="scroll-mt-20 border-t border-border"
          aria-labelledby={`${f.id}-title`}
        >
          <div
            className={cn(
              GUTTER,
              "grid grid-cols-1 items-center gap-10 py-16 md:py-24 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14",
              i % 2 === 1 && "lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]",
            )}
          >
            <div className={cn("max-w-md", i % 2 === 1 && "lg:order-2")}>
              <Eyebrow icon={f.icon}>{f.eyebrow}</Eyebrow>
              <h2
                id={`${f.id}-title`}
                className="mt-4 text-[1.875rem] text-balance md:text-[2.25rem]"
              >
                {f.title}
              </h2>
              <Lead lead={f.lead} className="mt-4 text-[16px] leading-[1.6]">
                {f.body}
              </Lead>
              <ul className="mt-7 space-y-3 border-t border-border pt-6 text-[14px]">
                {f.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-soft">
                    <CheckIcon
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      strokeWidth={2}
                    />
                    {p}
                  </li>
                ))}
              </ul>
              {f.link && (
                <ArrowLink to={f.link.to} className="mt-7">
                  {f.link.label}
                </ArrowLink>
              )}
            </div>
            <div className={cn(i % 2 === 1 && "lg:order-1")}>
              <FeatureScreen screen={f.screen} />
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

const SMALL_FEATURES = [
  {
    icon: CommandIcon,
    lead: "Command palette.",
    body: "Every table, view and action a few keys away with Cmd/Ctrl+K.",
  },
  {
    icon: ReplaceIcon,
    lead: "Find and replace.",
    body: "Preview every cell that will change before you replace it.",
  },
  {
    icon: NetworkIcon,
    lead: "ER diagrams.",
    body: "Draw your schema, or ask the AI for one and save it.",
  },
  {
    icon: MapIcon,
    lead: "Map view.",
    body: "PostGIS rows on a map, clustered when there are too many.",
  },
  {
    icon: SquareTerminalIcon,
    lead: "Built-in terminal.",
    body: "The database's own shell under the grid, already connected.",
  },
  {
    icon: RefreshCwIcon,
    lead: "Sync across devices.",
    body: "Connections and settings, end-to-end encrypted.",
  },
  {
    icon: LockKeyholeIcon,
    lead: "Credentials stay local.",
    body: "Passwords live in your OS keychain, never on our servers.",
  },
  {
    icon: PaletteIcon,
    lead: "Themes.",
    body: "Dark, light and a dozen editor themes to pick from.",
  },
  {
    icon: KeyRoundIcon,
    lead: "Keyboard first.",
    body: "Every action has a shortcut, and you can change them.",
  },
];

function EverythingElse() {
  return (
    <section className="border-t border-border" aria-labelledby="more-title">
      <div className={cn(GUTTER, "pt-20 pb-12 md:pt-28")}>
        <SectionIntro
          eyebrow="And the rest"
          title="The small things you'd miss in other clients."
          link={{ to: "/features", label: "Every feature" }}
        />
      </div>
      <CellGrid cols={3} className="border-b-0">
        {SMALL_FEATURES.map((f) => (
          <Cell key={f.lead} className="min-h-[148px]">
            <f.icon className="size-[18px] text-muted-foreground" strokeWidth={1.6} />
            <Lead lead={f.lead} className="mt-5 text-[15px] leading-[1.55]">
              {f.body}
            </Lead>
          </Cell>
        ))}
      </CellGrid>
    </section>
  );
}

// ── Reviews ──────────────────────────────────────────────────────────────────

function Reviews() {
  const { data: reviews } = useQuery(approvedReviewsQueryOptions());
  if (!reviews || reviews.length === 0) return null;
  return (
    <section className="border-t border-border" aria-labelledby="reviews-title">
      <div className={cn(GUTTER, "pt-20 pb-12 md:pt-28")}>
        <SectionIntro eyebrow="Reviews" title="From people who use it every day." />
      </div>
      <CellGrid cols={3} className="border-b-0">
        {reviews.slice(0, 6).map((r) => (
          <Cell key={r.id} className="flex flex-col justify-between gap-8">
            <blockquote className="text-[15px] leading-[1.6] text-pretty text-soft">
              “{r.body}”
            </blockquote>
            <figcaption className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink/[0.07] text-[12px] font-medium text-foreground">
                {r.authorName.trim().charAt(0).toUpperCase() || "?"}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium">{r.authorName}</span>
                {r.title && (
                  <span className="block truncate text-[12px] text-muted-foreground">
                    {r.title}
                  </span>
                )}
              </span>
            </figcaption>
          </Cell>
        ))}
      </CellGrid>
    </section>
  );
}

// ── Pricing teaser ───────────────────────────────────────────────────────────

function PricingTeaser() {
  const { user } = useAuth();
  return (
    <Section id="pricing">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
        <SectionIntro
          eyebrow="Pricing"
          title={`Try it for ${TRIAL_DAYS} days. Then ${PRO_PRICE}, once.`}
        >
          <p>
            Use every feature free for {TRIAL_DAYS} days. If Stroke earns its place, it's{" "}
            <strong>{PRO_PRICE} once</strong>: every update included, nothing to renew or cancel.
          </p>
        </SectionIntro>
        <div className="rounded-2xl p-1.5 shadow-[0_0_0_1px_var(--border)_inset]">
          <div className="rounded-[calc(1rem-2px)] bg-card p-7 md:p-9">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-[15px] font-medium">Stroke Pro</p>
              <p className="text-[13px] text-muted-foreground">One payment</p>
            </div>
            <p className="mt-6 flex items-baseline gap-2">
              <span className="text-[3.25rem] leading-none font-semibold tracking-[-0.04em] tabular-nums">
                {PRO_PRICE}
              </span>
              <span className="text-[15px] text-muted-foreground">once</span>
            </p>
            <ul className="mt-7 grid grid-cols-1 gap-3 text-[14px] text-soft sm:grid-cols-2">
              {[
                "Every feature and engine",
                "Every future update",
                "All your computers",
                "Sync and scheduled backups",
              ].map((p) => (
                <li key={p} className="flex items-center gap-2.5">
                  <CheckIcon className="size-4 shrink-0 text-muted-foreground" strokeWidth={2} />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={user ? "/app/billing" : "/signup"} className={siteButton({ size: "lg" })}>
                Buy Stroke Pro
              </Link>
              <Link to="/pricing" className={siteButton({ variant: "ghost", size: "lg" })}>
                Compare plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "How much does Stroke cost?",
    a: `${PRO_PRICE}, one time. No subscription, no yearly renewal and no paid upgrade later. Every feature is free for ${TRIAL_DAYS} days first.`,
  },
  {
    q: "Do I need an account?",
    a: "Yes. Sign in with Google or GitHub when you first open the app. Your trial and your purchase belong to that account, so they follow you to every computer you sign in on.",
  },
  {
    q: "I bought a license key for an older version. Does it still work?",
    a: "Yes. Sign in with the email you bought it with and Pro is already on your account. There is no key to enter any more.",
  },
  {
    q: "Which databases does Stroke support?",
    a: `${SHIPPED_ENGINES.length} of them: PostgreSQL, MySQL, MariaDB, SQLite, SQL Server, Oracle, CockroachDB, DuckDB, ClickHouse, Turso, Cloudflare D1, MongoDB, Redis, Valkey, DynamoDB, Elasticsearch, OpenSearch and more. The databases page lists them all.`,
  },
  {
    q: "Does Stroke see my credentials or data?",
    a: "No. Stroke connects to your databases straight from your computer, and passwords are kept in your OS keychain. Query results never pass through our servers. Synced connections are end-to-end encrypted.",
  },
  {
    q: "Can I read the source?",
    a: "Yes. The whole app, Pro features included, is on GitHub. Read it, audit it and build it yourself; reselling it isn't allowed.",
  },
];

/** FAQ accordion. Rendered on the landing page and the /pricing page. */
export function Faq() {
  return (
    <Section id="faq">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <SectionIntro eyebrow="FAQ" title="Questions, answered.">
          <p>
            Anything else? Email{" "}
            <a
              href="mailto:support@stroke.click"
              className="text-foreground underline decoration-ink/25 underline-offset-4 hover:decoration-ink/60"
            >
              support@stroke.click
            </a>
            . I answer every one.
          </p>
        </SectionIntro>
        <div className="divide-y divide-border border-y border-border">
          {FAQ_ITEMS.map((item, i) => (
            <details key={item.q} className="group" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[15px] font-medium transition-colors duration-150 hover:text-soft [&::-webkit-details-marker]:hidden">
                {item.q}
                <PlusIcon
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                  strokeWidth={1.75}
                />
              </summary>
              <p className="-mt-1 pb-6 text-[15px] leading-relaxed text-pretty text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ── Closer ───────────────────────────────────────────────────────────────────

// The pricing page reuses the plans block.
export { Pricing } from "#/components/pricing-plans";
