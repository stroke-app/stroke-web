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
import { useEffect, useRef } from "react";

import { InstallCommand, SmartDownloadButton } from "#/components/download-button";
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
      <Features />
      <EverythingElse />
      <Reviews />
      <PricingTeaser />
      <Faq />
      <ClosingCta />
    </PageShell>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function ReleasePill() {
  const { data: release } = useLatestRelease();
  return (
    <Link
      to="/changelog"
      className="group inline-flex h-7 items-center gap-2 rounded-full pr-3 pl-1 text-[13px] text-muted-foreground shadow-[0_0_0_1px_var(--border)_inset] transition-colors duration-150 hover:text-foreground"
    >
      <span className="flex items-center gap-1.5 rounded-full bg-ink/[0.07] px-2 py-0.5 text-[12px] font-medium text-foreground">
        <span className="size-1.5 rounded-full bg-copper" aria-hidden="true" />
        New
      </span>
      {release ? `Stroke ${release.tag_name.replace(/^v/, "")} is out` : "See what's new"}
      <ArrowRightIcon className="size-3 transition-transform duration-150 group-hover:translate-x-0.5" />
    </Link>
  );
}

/** The AI demo recording: plays once it's on screen, a still with reduced motion. */
function HeroDemo() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.play().catch(() => {});
  }, []);
  return (
    <video
      ref={ref}
      src="/shots/ai-demo.mp4"
      poster="/shots/ai-demo-poster.webp"
      width={1600}
      height={1004}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label="Asking Stroke's AI chat about a database: it reads the schema, runs queries and charts the answer"
      className="block h-auto w-full"
    />
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
      />
      <div className={cn(GUTTER, "flex flex-col items-center pt-16 text-center md:pt-24")}>
        <div className="animate-fade-up">
          <ReleasePill />
        </div>
        <h1
          className="animate-fade-up mt-7 max-w-[15ch] text-[2.75rem] leading-[1.02] tracking-[-0.045em] text-balance sm:text-[3.75rem] md:text-[4.5rem]"
          style={{ animationDelay: "60ms" }}
        >
          Every database you run, in one fast app.
        </h1>
        <p
          className="animate-fade-up mt-6 max-w-[54ch] text-[17px] leading-[1.6] text-pretty text-muted-foreground md:text-[18px]"
          style={{ animationDelay: "120ms" }}
        >
          <span className="text-foreground">
            Stroke is a native client for Postgres, MySQL, SQLite, MongoDB, Redis and{" "}
            {SHIPPED_ENGINES.length - 5} more.
          </span>{" "}
          Query, edit, chart and back up, or hand the database to Claude or Cursor over MCP.
        </p>
        <div
          className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "180ms" }}
        >
          <SmartDownloadButton size="lg" variant="default" align="center" alternates={false} />
          <Link to="/pricing" className={siteButton({ variant: "secondary", size: "lg" })}>
            See pricing
          </Link>
        </div>
        <p
          className="animate-fade-up mt-5 text-[13px] text-muted-foreground"
          style={{ animationDelay: "200ms" }}
        >
          macOS, Windows and Linux · {TRIAL_DAYS}-day free trial · {PRO_PRICE} once, no subscription
        </p>
      </div>

      {/* The product, as large as the frame allows. */}
      <div
        className={cn(GUTTER, "animate-fade-up mt-14 md:mt-20")}
        style={{ animationDelay: "260ms" }}
      >
        <Panel className="rounded-b-none">
          <HeroDemo />
        </Panel>
      </div>
    </section>
  );
}

// ── Engines ──────────────────────────────────────────────────────────────────

function Engines() {
  const shown = SHIPPED_ENGINES.slice(0, 12);
  return (
    <section className="border-t border-border" aria-labelledby="engines-title">
      <div className={cn(GUTTER, "flex flex-wrap items-end justify-between gap-4 pt-12 pb-8")}>
        <h2
          id="engines-title"
          className="text-[15px] font-medium tracking-normal text-muted-foreground"
        >
          <span className="text-foreground">{SHIPPED_ENGINES.length} databases.</span> One app, the
          same shortcuts everywhere.
        </h2>
        <ArrowLink to="/databases" className="text-[13px]">
          All databases
        </ArrowLink>
      </div>
      <ul className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
        {shown.map((e) => (
          <li key={e.slug} className="bg-background">
            <Link
              to="/databases/$engine"
              params={{ engine: e.slug }}
              className="group flex h-24 flex-col items-center justify-center gap-2.5 text-[13px] text-muted-foreground transition-colors duration-150 hover:bg-ink/[0.03] hover:text-foreground"
            >
              <e.Icon className="size-6 text-soft transition-colors group-hover:text-foreground" />
              {e.name}
            </Link>
          </li>
        ))}
      </ul>
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
