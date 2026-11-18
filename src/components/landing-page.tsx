import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  BotIcon,
  CheckIcon,
  CommandIcon,
  DatabaseBackupIcon,
  DatabaseIcon,
  GaugeIcon,
  KeyRoundIcon,
  LockKeyholeIcon,
  MapIcon,
  NetworkIcon,
  PaletteIcon,
  PlusIcon,
  RefreshCwIcon,
  ReplaceIcon,
  Share2Icon,
  SquareTerminalIcon,
  TableIcon,
  TerminalIcon,
} from "lucide-react";
import { useState } from "react";

import { InstallCommand, SmartDownloadButton } from "#/components/download-button";
import {
  AGENT_COMMANDS,
  CommandChip,
  CommandMenu,
  DocsButton,
  INSTALL_COMMANDS,
} from "#/components/hero-commands";
import { HeroConsole } from "#/components/hero-console";
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
import { StrokeIcon } from "#/components/stroke-icon";
import { useAuth } from "#/lib/auth/hooks";
import { SHIPPED_ENGINES } from "#/lib/engines";
import { PRO_PRICE, TRIAL_DAYS } from "#/lib/pricing";
import { useLatestRelease } from "#/lib/releases";
import { approvedReviewsQueryOptions } from "#/lib/reviews/functions";
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
      <ClosingCta />
    </PageShell>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const { data: release } = useLatestRelease();
  const [scene, setScene] = useState(0);
  return (
    <section className="pt-16 md:pt-24">
      <div className={GUTTER}>
        <span className="flex size-9 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
          <StrokeIcon className="size-5" />
        </span>
        <h1 className="mt-7 text-[2.75rem] leading-[1] tracking-[-0.05em] sm:text-[4rem] md:text-[4.75rem]">
          Every database.
          <br />
          <span className="text-muted-foreground">One fast app.</span>
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-[1.6] text-pretty text-muted-foreground md:text-[18px]">
          A native client for Postgres, MySQL, MongoDB, Redis and {SHIPPED_ENGINES.length - 4} more,
          with agents built in.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-2.5">
          <CommandChip command="npx strokedb" />
          <CommandMenu label="Install" items={INSTALL_COMMANDS} />
          <CommandMenu label="For agents" items={AGENT_COMMANDS} />
          <DocsButton />
        </div>
        <p className="mt-4 text-[13px] text-faint">
          {release ? `Currently ${release.tag_name}` : "macOS, Windows, Linux"} · {TRIAL_DAYS} days
          free, then {PRO_PRICE} once
        </p>
      </div>
      <div className={cn(GUTTER, "mt-14 md:mt-16")}>
        <HeroConsole index={scene} onIndex={setScene} />
      </div>
    </section>
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
    <section className={cn(GUTTER, "py-20 md:py-28")}>
      <div className="grid grid-cols-1 items-center gap-10 rounded-2xl bg-card p-8 shadow-[0_0_0_1px_var(--border)_inset] md:p-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <p className="text-[19px] font-medium tracking-[-0.01em]">Introducing</p>
          <p className="mt-1 bg-gradient-to-r from-[#f5b400] via-[#ff7a59] to-[#c46bff] bg-clip-text text-[3rem] leading-[1.1] font-semibold tracking-[-0.04em] text-transparent md:text-[3.5rem]">
            Agents
          </p>
          <p className="mt-4 max-w-sm text-[17px] leading-[1.6] text-pretty text-muted-foreground">
            Give Claude, Codex or Cursor your database, with the access level you choose.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            <Link to="/docs/mcp" className={siteButton({ size: "lg" })}>
              Get started
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
    <section className="border-t border-border" aria-labelledby="engines-title">
      <div
        className={cn(GUTTER, "flex flex-col gap-6 py-10 md:flex-row md:items-center md:gap-10")}
      >
        <h2
          id="engines-title"
          className="shrink-0 text-[14px] font-medium tracking-normal text-muted-foreground"
        >
          {SHIPPED_ENGINES.length} databases
        </h2>
        <ul className="flex flex-1 flex-wrap items-center gap-x-7 gap-y-4">
          {SHIPPED_ENGINES.map((e) => (
            <li key={e.slug}>
              <Link
                to="/databases/$engine"
                params={{ engine: e.slug }}
                title={e.name}
                aria-label={e.name}
                className="block opacity-80 transition-[opacity,scale] duration-150 hover:scale-110 hover:opacity-100"
              >
                <e.Icon className="size-6" color={e.color} />
              </Link>
            </li>
          ))}
        </ul>
        <ArrowLink to="/databases" className="shrink-0 text-[13px]">
          All databases
        </ArrowLink>
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
      src: "/shots/table.webp",
      alt: "A movies table open in Stroke's grid",
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
      src: "/shots/mongo.webp",
      alt: "A MongoDB orders collection shown as a grid",
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
            Most database clients rent themselves to you for $100 or more a year. Stroke is{" "}
            <strong>{PRO_PRICE} once</strong>, with every update included and nothing to cancel.
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
                "AI chat and MCP server",
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
    q: "Is Stroke open source?",
    a: "Yes. The whole app, Pro features included, is on GitHub. It's free to read and build yourself, just not to resell.",
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

function ClosingCta() {
  return (
    <section className="relative isolate overflow-hidden border-t border-border">
      <div
        aria-hidden="true"
        className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_80%_at_50%_100%,black,transparent)]"
      />
      <div className={cn(GUTTER, "flex flex-col items-center py-24 text-center md:py-32")}>
        <h2 className="max-w-[18ch] text-[2.5rem] text-balance md:text-[3.5rem]">
          Open your database in Stroke today.
        </h2>
        <p className="mt-5 text-[17px] text-muted-foreground">
          {TRIAL_DAYS} days free with everything. {PRO_PRICE} once if you keep it.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <SmartDownloadButton size="lg" variant="default" align="center" alternates={false} />
          <Link to="/docs" className={siteButton({ variant: "secondary", size: "lg" })}>
            Read the docs
          </Link>
        </div>
        <InstallCommand className="mt-6" />
      </div>
    </section>
  );
}

export { Pricing } from "#/components/pricing-plans";
