import {
  SiClaude,
  SiCloudflare,
  SiCursor,
  SiGooglegemini,
  SiPlanetscale,
  SiPrisma,
  SiRailway,
  SiSinglestore,
  SiSupabase,
  SiTidb,
  SiTurso,
  SiUpstash,
} from "@icons-pack/react-simple-icons";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  CheckIcon,
  ChevronRightIcon,
  CommandIcon,
  CornerDownLeftIcon,
  KeyRoundIcon,
  LockKeyholeIcon,
  MinusIcon,
  PlayIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldCheckIcon,
  SquareIcon,
  TableIcon,
  TerminalIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { FadeUp } from "#/components/amicro/fade-up";
import { ScrollReveal } from "#/components/amicro/scroll-reveal";
import { AGENT_COMMANDS, CommandMenu } from "#/components/hero-commands";
import { HeroDownload } from "#/components/hero-download";
import { NeonGlyph } from "#/components/landing-mockups";
import { ArrowLink, GUTTER, LINK, PageShell, Panel, Section, Title } from "#/components/page";
import { LoopVideo } from "#/components/showcase";
import { StrokeAppTile } from "#/components/stroke-icon";
import { useAuth } from "#/lib/auth/hooks";
import { SHIPPED_ENGINES } from "#/lib/engines";
import { FAQ_ITEMS } from "#/lib/faq";
import { latestReleaseQueryOptions } from "#/lib/latest-release";
import { PRO_PRICE, TRIAL_DAYS } from "#/lib/pricing";
import { approvedReviewsQueryOptions } from "#/lib/reviews/functions";
import { cn } from "#/lib/utils";

export function LandingPage() {
  return (
    <PageShell>
      <Hero />
      <ProductTour />
      <EngineStrip />
      <HardCases />
      <SafeChanges />
      <Engines />
      <Providers />
      <Comparison />
      <Features />
      <Shortcuts />
      <Agents />
      <Private />
      <Reviews />
      <PricingTeaser />
      <Faq />
    </PageShell>
  );
}

/** Scroll entrance for a block: rises 24px and fades, once. */
function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ScrollReveal yOffset={24} scale={1} duration={0.7} className={className}>
      {children}
    </ScrollReveal>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const { data: release } = useQuery(latestReleaseQueryOptions());
  const others = SHIPPED_ENGINES.length - 5;
  return (
    <section className={cn(GUTTER, "flex flex-col items-center pt-16 text-center md:pt-24")}>
      <FadeUp className="max-w-[60rem]">
        <h1 className="text-[2.6rem] leading-[1.03] tracking-[-0.05em] text-balance sm:text-[3.5rem] md:text-[4.5rem]">
          The database client for every database.
          <span className="title-sub block">Fast, native and easy to use.</span>
        </h1>
      </FadeUp>
      <FadeUp delay={0.08}>
        <p className="mx-auto mt-7 max-w-[40rem] text-[18px] leading-[1.5] text-pretty text-muted-foreground md:text-[21px]">
          Stroke browses, edits and queries PostgreSQL, MySQL, SQLite, MongoDB, Redis and {others}{" "}
          more databases in one native app. It streams huge results, stops queries cleanly and keeps
          your passwords <strong className="font-semibold text-foreground">on your computer</strong>
          .
        </p>
      </FadeUp>
      <FadeUp delay={0.16} className="mt-10 flex flex-col items-center gap-x-8 gap-y-5 sm:flex-row">
        <HeroDownload install={false} />
        <Link to="/features" className={cn(LINK, "text-[18px]")}>
          Explore Stroke
          <ChevronRightIcon
            className="size-[18px] transition-transform duration-150 group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        </Link>
      </FadeUp>
      <FadeUp delay={0.24}>
        <div className="mt-7 space-y-1 text-[14px] leading-relaxed text-faint">
          <p>
            Free for {TRIAL_DAYS} days with every feature · No subscription ·{" "}
            <Link
              to="/pricing"
              className="text-[var(--link)] hover:underline hover:underline-offset-4"
            >
              See pricing
            </Link>
          </p>
          <p>
            {release ? `Version ${release.tag_name.replace(/^v/, "")} · ` : ""}macOS, Windows and
            Linux · Apple Silicon and Intel
          </p>
        </div>
      </FadeUp>
    </section>
  );
}

// ── Product tour: the app in a device, with a tab per screen ─────────────────

type Screen =
  | { kind: "image"; src: string; alt: string; width: number; height: number }
  | { kind: "video"; name: string; label: string; width: number; height: number };

const TOUR: { id: string; label: string; note: string; screen: Screen }[] = [
  {
    id: "browse",
    label: "Browse",
    note: "A MongoDB collection in the grid, with Postgres, Turso and more in the sidebar.",
    screen: {
      kind: "image",
      src: "/shots/mongo.webp",
      alt: "Stroke with a MongoDB orders collection open in the data grid",
      width: 1600,
      height: 1005,
    },
  },
  {
    id: "query",
    label: "Query",
    note: "A script's results, each statement in its own tab.",
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
    label: "AI and MCP",
    note: "The assistant creating tables, every step listed.",
    screen: {
      kind: "image",
      src: "/shots/ai-steps.webp",
      alt: "The AI chat creating tables, each step listed",
      width: 1600,
      height: 1004,
    },
  },
  {
    id: "admin",
    label: "Server insights",
    note: "A Postgres 16 server's live connections, cache and writes.",
    screen: {
      kind: "image",
      src: "/shots/insights.webp",
      alt: "Instance insights for a Postgres 16 server",
      width: 1600,
      height: 1005,
    },
  },
  {
    id: "plan",
    label: "Query plan",
    note: "EXPLAIN as readable steps, the slowest one marked.",
    screen: {
      kind: "image",
      src: "/shots/query-plan.webp",
      alt: "A query plan drawn as steps with their cost",
      width: 1600,
      height: 1005,
    },
  },
];

function ProductTour() {
  const [active, setActive] = useState(0);
  const tab = TOUR[active];
  return (
    <section className={cn(GUTTER, "mt-16 md:mt-24")} aria-label="Stroke, screen by screen">
      <FadeUp delay={0.3} yOffset={40}>
        <figure className="mx-auto max-w-[68rem]">
          <div className="device">
            <div className="keep-dark relative aspect-[1600/1005] overflow-hidden rounded-[12px] bg-[#0b0b0b]">
              {TOUR.map((t, i) => (
                <img
                  key={t.id}
                  src={
                    t.screen.kind === "image" ? t.screen.src : `/shots/${t.screen.name}-poster.webp`
                  }
                  alt={t.screen.kind === "image" ? t.screen.alt : t.screen.label}
                  width={1600}
                  height={1005}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  decoding="async"
                  aria-hidden={i !== active}
                  className={cn(
                    "absolute inset-0 block h-full w-full object-cover object-top-left transition-opacity duration-500 ease-out",
                    i === active ? "opacity-100" : "opacity-0",
                  )}
                />
              ))}
            </div>
          </div>
          <div className="device-base" aria-hidden="true" />
        </figure>
      </FadeUp>
      <div className="mt-10 flex flex-col items-center">
        <div
          role="tablist"
          aria-label="Screens"
          className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-card p-1"
        >
          {TOUR.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={cn(
                "h-9 shrink-0 rounded-full px-4 text-[13.5px] font-medium transition-[background-color,color,box-shadow] duration-200",
                i === active
                  ? "bg-background text-foreground shadow-[0_1px_3px_rgb(0_0_0/0.12)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-[14px] text-muted-foreground" aria-live="polite">
          {tab.note}
        </p>
        <p className="mt-1 text-[12px] text-faint">Real screenshots of Stroke, not mockups.</p>
      </div>
    </section>
  );
}

// ── The engines, as a line of marks ──────────────────────────────────────────

function EngineStrip() {
  const shown = SHIPPED_ENGINES.slice(0, 8);
  return (
    <section className={cn(GUTTER, "mt-24 text-center md:mt-28")} aria-label="Databases">
      <p className="text-[14px] text-faint">Connects to</p>
      <ul className="mx-auto mt-5 flex max-w-[60rem] flex-wrap items-center justify-center gap-x-7 gap-y-4">
        {shown.map((e) => (
          <li key={e.slug}>
            <Link
              to="/databases/$engine"
              params={{ engine: e.slug }}
              className="flex items-center gap-2 text-[16px] font-semibold tracking-[-0.01em] text-foreground transition-opacity hover:opacity-70"
            >
              <e.Icon className="size-5" color={e.color} />
              {e.name}
            </Link>
          </li>
        ))}
        <li>
          <Link
            to="/databases"
            className="flex items-center gap-1 text-[16px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            and {SHIPPED_ENGINES.length - shown.length} more
            <ChevronRightIcon className="size-4" strokeWidth={2} />
          </Link>
        </li>
      </ul>
    </section>
  );
}

// ── The hard cases, as a bento of cards ──────────────────────────────────────

function Card({
  title,
  body,
  children,
  className,
  tint,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
  className?: string;
  /** A color washed into the card's top corner. */
  tint?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-[28px] bg-card p-7 md:p-9",
        tint && "tinted",
        className,
      )}
      style={tint ? ({ "--tint": tint } as React.CSSProperties) : undefined}
    >
      <h3 className="text-[1.375rem] leading-tight tracking-[-0.025em] md:text-[1.5rem]">
        {title}
      </h3>
      <p className="mt-2.5 max-w-md text-[15px] leading-[1.55] text-pretty text-muted-foreground md:text-[16px]">
        {body}
      </p>
      {children && <div className="mt-8 flex flex-1 items-end justify-center">{children}</div>}
    </div>
  );
}

/** A small floating surface inside a card: the app's UI, drawn light. */
function Float({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl bg-raised p-4 text-left shadow-[var(--shadow-card)] ring-1 ring-black/[0.04] dark:ring-white/[0.06]",
        className,
      )}
    >
      {children}
    </div>
  );
}

const STAGED = [
  ["8812", "Ana Beridze", "paid", "refunded"],
  ["8813", "Luka Maisuradze", "paid", null],
  ["8814", "Jordan Lee", "shipped", null],
] as const;

function StagedEditsMock() {
  return (
    <Float className="max-w-[30rem]">
      <div className="flex items-center gap-2 text-[12px] text-faint">
        <TableIcon className="size-3.5" />
        public.orders
      </div>
      <table className="mt-3 w-full text-[12.5px]">
        <thead>
          <tr className="text-left text-[11px] text-faint">
            <th className="pb-1.5 font-medium">id</th>
            <th className="pb-1.5 font-medium">customer</th>
            <th className="pb-1.5 font-medium">status</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {STAGED.map(([id, name, was, now]) => (
            <tr key={id} className="border-t border-border">
              <td className="py-1.5 text-muted-foreground">{id}</td>
              <td className="py-1.5 font-sans text-foreground">{name}</td>
              <td className="py-1.5">
                {now ? (
                  <span className="rounded-md bg-[var(--amber)]/25 px-1.5 py-0.5 text-foreground">
                    <span className="text-faint line-through">{was}</span> {now}
                  </span>
                ) : (
                  <span className="text-muted-foreground">{was}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-card px-3 py-2">
        <span className="text-[12px] text-muted-foreground">1 change, not applied yet</span>
        <span className="flex gap-1.5">
          <span className="rounded-full px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground">
            Discard
          </span>
          <span className="rounded-full bg-[var(--amber)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--amber-ink)]">
            Apply
          </span>
        </span>
      </div>
    </Float>
  );
}

function StopMock() {
  return (
    <Float className="max-w-[17rem]">
      <div className="flex items-center gap-2.5">
        <span className="relative flex size-7 items-center justify-center rounded-full bg-[#ff3b30]/12">
          <span className="size-2 animate-pulse rounded-full bg-[#ff3b30] motion-reduce:animate-none" />
        </span>
        <span>
          <span className="block text-[13px] font-semibold">Running on prod</span>
          <span className="block text-[11.5px] text-faint">SELECT … FROM events</span>
        </span>
      </div>
      <p className="mt-3 font-mono text-[30px] leading-none font-medium tracking-[-0.03em] tabular-nums">
        00:12.4
      </p>
      <div className="mt-4 flex gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-[#ff3b30] px-3 py-1.5 text-[12px] font-medium text-white">
          <SquareIcon className="size-2.5 fill-current" />
          Stop
        </span>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
        <CheckIcon className="size-3.5 text-[#28a745]" strokeWidth={2.4} />
        Cancelled on the server, connection ready
      </p>
    </Float>
  );
}

function StreamMock() {
  return (
    <Float>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-semibold">2,000,000 rows</span>
        <span className="text-[11.5px] text-faint">streamed</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-card">
        <div className="h-full w-[78%] rounded-full bg-[var(--amber)]" />
      </div>
      <div className="mt-3 flex justify-between text-[11.5px] text-muted-foreground">
        <span>First rows on screen at once</span>
        <span className="tabular-nums">memory flat</span>
      </div>
    </Float>
  );
}

const PLAN = [
  { depth: 0, step: "Sort", ms: "4 ms" },
  { depth: 1, step: "Hash Join", ms: "11 ms" },
  { depth: 2, step: "Seq Scan on events", ms: "312 ms", slow: true },
  { depth: 2, step: "Index Scan on users", ms: "2 ms" },
];

function PlanMock() {
  return (
    <Float>
      <ul className="space-y-1.5 text-[12.5px]">
        {PLAN.map((p) => (
          <li
            key={p.step}
            className={cn(
              "flex items-center justify-between rounded-lg px-2 py-1.5",
              p.slow && "bg-[#ff9500]/14",
            )}
            style={{ marginLeft: p.depth * 14 }}
          >
            <span className={cn(p.slow ? "font-semibold text-foreground" : "text-soft")}>
              {p.step}
            </span>
            <span
              className={cn("tabular-nums", p.slow ? "font-semibold text-[#c26a00]" : "text-faint")}
            >
              {p.ms}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11.5px] text-muted-foreground">
        Full scan throws away most rows. An index would let it read only the matches.
      </p>
    </Float>
  );
}

function TunnelMock() {
  return (
    <Float>
      <div className="flex items-center gap-2.5">
        <span className="flex size-7 items-center justify-center rounded-full bg-[#28a745]/12">
          <RefreshCwIcon className="size-3.5 text-[#1f8a3a]" strokeWidth={2.2} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold">SSH tunnel to bastion</span>
          <span className="block text-[11.5px] text-faint">Reconnected on the same port</span>
        </span>
      </div>
      <div className="mt-3 flex gap-1" aria-hidden="true">
        {Array.from({ length: 22 }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-5 flex-1 rounded-sm",
              i === 13 || i === 14 ? "bg-[#ff3b30]/70" : "bg-[#28a745]/55",
            )}
          />
        ))}
      </div>
      <p className="mt-2 text-[11.5px] text-muted-foreground">Dropped for 4 s. Nothing to redo.</p>
    </Float>
  );
}

function HardCases() {
  return (
    <section className={cn(GUTTER, "mt-32 md:mt-44")} aria-labelledby="cases-title">
      <Reveal>
        <Title id="cases-title" sub="Stroke keeps working.">
          Huge plans, huge results, lost tunnels.
        </Title>
        <p className="mt-6 max-w-2xl text-[17px] leading-[1.55] text-pretty text-muted-foreground md:text-[19px]">
          Any client can draw a grid. These are the moments where most of them fall over, and where
          Stroke was built to hold.
        </p>
      </Reveal>
      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        <Reveal className="md:col-span-2">
          <Card
            className="h-full"
            tint="#ffc107"
            title="Nothing changes by accident."
            body="Edits are staged and marked in the grid until you press Apply. Read-only connections refuse every write."
          >
            <StagedEditsMock />
          </Card>
        </Reveal>
        <Reveal>
          <Card
            className="h-full"
            tint="#ff3b30"
            title="Stop means stopped."
            body="Stop cancels the query on the server, on every engine that can, and leaves the connection ready for the next one."
          >
            <StopMock />
          </Card>
        </Reveal>
        <Reveal>
          <Card
            className="h-full"
            tint="#0a84ff"
            title="A 2 GB result, no freeze."
            body="Rows stream to disk as they arrive, so the grid fills at once and memory stays flat."
          >
            <StreamMock />
          </Card>
        </Reveal>
        <Reveal>
          <Card
            className="h-full"
            tint="#ff9500"
            title="Plans you can read."
            body="EXPLAIN as steps with their time, the slow one marked, for SQL and document engines."
          >
            <PlanMock />
          </Card>
        </Reveal>
        <Reveal>
          <Card
            className="h-full"
            tint="#30d158"
            title="Tunnels come back."
            body="If SSH drops, Stroke reconnects it on the same port and tells you it happened."
          >
            <TunnelMock />
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

// ── A gray band: changing data, step by step ─────────────────────────────────

const STEPS = [
  {
    n: "01",
    title: "Stage the change",
    body: "Edit cells, insert rows or paste a column. Everything waits in the grid, marked.",
  },
  {
    n: "02",
    title: "Try it in a transaction",
    body: "Begin a transaction in the SQL editor, run the change, read the result, then commit or roll back.",
  },
  {
    n: "03",
    title: "Apply all at once",
    body: "On Postgres, MySQL and SQLite the changes go in one transaction, so a failure leaves nothing half done.",
  },
];

function SafeChanges() {
  return (
    <Section band className="mt-32 md:mt-44" inner="py-24 md:py-32">
      <Reveal>
        <p className="text-[14px] font-medium text-[var(--link)]">
          For developers, analysts and DBAs
        </p>
        <h2 className="mt-3 text-[2.25rem] text-balance sm:text-[2.75rem] md:text-[3.25rem]">
          Change production without holding your breath.
        </h2>
        <p className="mt-6 max-w-2xl text-[17px] leading-[1.55] text-pretty text-muted-foreground md:text-[19px]">
          Stroke treats your data the way you would. Nothing reaches the server until you have seen
          it, and a long transaction tells you when it is blocking someone.
        </p>
      </Reveal>
      <ol className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
        {STEPS.map((s) => (
          <Reveal key={s.n}>
            <li className="border-t border-border pt-5">
              <p className="font-mono text-[12px] text-faint">{s.n}</p>
              <h3 className="mt-3 text-[1.25rem] tracking-[-0.02em]">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-[1.55] text-muted-foreground">{s.body}</p>
            </li>
          </Reveal>
        ))}
      </ol>
      <div className="mt-14 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-6 text-[14px]">
        <span className="text-faint">Read more:</span>
        {(
          [
            ["Features", "/features"],
            ["Security", "/security"],
            ["Docs", "/docs"],
            ["Compare", "/compare"],
          ] as const
        ).map(([label, to]) => (
          <Link
            key={to}
            to={to}
            className="text-[var(--link)] underline underline-offset-4 hover:no-underline"
          >
            {label}
          </Link>
        ))}
      </div>
    </Section>
  );
}

// ── Engines grid ─────────────────────────────────────────────────────────────

function Engines() {
  return (
    <section className={cn(GUTTER, "mt-32 md:mt-44")} aria-labelledby="engines-title">
      <Reveal>
        <Title id="engines-title" sub="One set of shortcuts.">
          {SHIPPED_ENGINES.length} databases.
        </Title>
        <p className="mt-6 max-w-2xl text-[17px] leading-[1.55] text-pretty text-muted-foreground md:text-[19px]">
          SQL, documents, key-value, analytics and search, each with a view built for it. Connect in
          one click from Neon, Supabase, PlanetScale, Turso and more.
        </p>
      </Reveal>
      <Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-7">
          {SHIPPED_ENGINES.map((e) => (
            <li key={e.slug}>
              <Link
                to="/databases/$engine"
                params={{ engine: e.slug }}
                className="group flex h-full flex-col items-center gap-2.5 rounded-2xl bg-card px-2 py-4 text-center text-[13.5px] font-semibold tracking-[-0.01em] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-accent"
              >
                <e.Icon
                  className="size-6 shrink-0 transition-transform duration-200 group-hover:scale-110"
                  color={e.color}
                />
                <span className="w-full truncate">{e.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
      <p className="mt-6 text-[13px] text-faint">
        Each engine has its own page with what Stroke does with it.{" "}
        <Link
          to="/databases"
          className="text-[var(--link)] hover:underline hover:underline-offset-4"
        >
          All databases
        </Link>
      </p>
    </section>
  );
}

// ── Providers: connect in one click ──────────────────────────────────────────

type Provider = {
  name: string;
  Icon?: React.ComponentType<{ className?: string; color?: string }>;
  color: string;
  /** How Stroke connects: signing in to the provider, or an API token. */
  via: "sign-in" | "token";
};

/** Neon's glyph in Neon's green (the glyph itself draws in currentColor). */
function NeonMark({ className, color }: { className?: string; color?: string }) {
  return (
    <span className="inline-flex" style={{ color }}>
      <NeonGlyph className={className} />
    </span>
  );
}

const PROVIDERS: Provider[] = [
  { name: "Neon", Icon: NeonMark, color: "#00c781", via: "sign-in" },
  { name: "Supabase", Icon: SiSupabase, color: "#3ecf8e", via: "sign-in" },
  { name: "PlanetScale", Icon: SiPlanetscale, color: "currentColor", via: "sign-in" },
  { name: "Prisma Postgres", Icon: SiPrisma, color: "currentColor", via: "sign-in" },
  { name: "Turso", Icon: SiTurso, color: "#1fb89a", via: "sign-in" },
  { name: "TiDB Cloud", Icon: SiTidb, color: "#e60c0c", via: "sign-in" },
  { name: "Railway", Icon: SiRailway, color: "currentColor", via: "sign-in" },
  { name: "Cloudflare D1", Icon: SiCloudflare, color: "#f38020", via: "sign-in" },
  { name: "Nile", color: "#6d5dfc", via: "sign-in" },
  { name: "Upstash", Icon: SiUpstash, color: "#00c98d", via: "token" },
  { name: "Xata", color: "#c25bf2", via: "token" },
  { name: "SingleStore", Icon: SiSinglestore, color: "#aa00ff", via: "token" },
];

/**
 * Stroke in the middle, wired to providers on a ring around it. Light runs
 * along each wire toward Stroke; the orbit turns slowly. Both stand still
 * under reduced motion.
 */
function WiresArt() {
  const still = useReducedMotion();
  // Six providers around the ring, clockwise from the top left.
  const ring = PROVIDERS.filter((p) =>
    ["Neon", "Supabase", "PlanetScale", "Turso", "Cloudflare D1", "Upstash"].includes(p.name),
  );
  const C = 200;
  const R = 150;
  const nodes = ring.map((p, i) => {
    const a = (-120 + i * 60) * (Math.PI / 180);
    return { p, x: C + R * Math.cos(a), y: C + R * Math.sin(a) };
  });
  const wire = (x: number, y: number) => {
    // A soft curve: out of the node, bending toward the centre.
    const mx = (x + C) / 2 + (y - C) * 0.18;
    const my = (y + C) / 2 - (x - C) * 0.18;
    return `M${x} ${y} Q${mx} ${my} ${C} ${C}`;
  };
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[24rem]" aria-hidden="true">
      <svg viewBox="0 0 400 400" className="absolute inset-0 size-full overflow-visible">
        <defs>
          <linearGradient id="wire-fade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--amber)" stopOpacity="0.15" />
            <stop offset="1" stopColor="var(--amber)" stopOpacity="0.7" />
          </linearGradient>
          <radialGradient id="core-glow">
            <stop offset="0" stopColor="var(--amber)" stopOpacity="0.38" />
            <stop offset="1" stopColor="var(--amber)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r="120" fill="url(#core-glow)" />
        <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border)" strokeWidth="1" />
        <g
          style={{ transformOrigin: "200px 200px" }}
          className={still ? undefined : "animate-[spin_60s_linear_infinite]"}
        >
          <circle
            cx={C}
            cy={C}
            r="92"
            fill="none"
            stroke="color-mix(in oklab, var(--amber) 45%, transparent)"
            strokeWidth="1.2"
            strokeDasharray="2 7"
          />
        </g>
        {nodes.map((n, i) => (
          <g key={n.p.name}>
            <path
              d={wire(n.x, n.y)}
              fill="none"
              stroke="color-mix(in oklab, var(--foreground) 12%, transparent)"
              strokeWidth="1.4"
            />
            {!still && (
              <circle r="3" fill="var(--amber)">
                <animateMotion
                  dur="2.4s"
                  begin={`${i * -0.4}s`}
                  repeatCount="indefinite"
                  path={wire(n.x, n.y)}
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  keyTimes="0;0.15;0.8;1"
                  dur="2.4s"
                  begin={`${i * -0.4}s`}
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        ))}
      </svg>
      {nodes.map((n) => (
        <span
          key={n.p.name}
          title={n.p.name}
          className="absolute flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-raised shadow-[var(--shadow-card)] ring-1 ring-black/[0.05] dark:ring-white/[0.08]"
          style={{ left: `${(n.x / 400) * 100}%`, top: `${(n.y / 400) * 100}%` }}
        >
          {n.p.Icon ? (
            <n.p.Icon
              className="size-6"
              color={n.p.color === "currentColor" ? undefined : n.p.color}
            />
          ) : (
            <span className="text-[18px] font-bold" style={{ color: n.p.color }}>
              {n.p.name[0]}
            </span>
          )}
        </span>
      ))}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <StrokeAppTile className="size-[88px] rounded-[24px]" />
      </span>
    </div>
  );
}

/** The visitor's reduced-motion setting, live. */
function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}

function Providers() {
  return (
    <Section band className="mt-32 md:mt-44" inner="py-24 md:py-32">
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Reveal className="flex flex-col">
          <Title
            sub="From where your databases live."
            className="text-[2.25rem] sm:text-[2.6rem] md:text-[2.75rem]"
          >
            Connect in one click.
          </Title>
          <p className="mt-6 max-w-md text-[17px] leading-[1.55] text-pretty text-muted-foreground">
            Sign in to your provider and pick a database. Stroke makes the credentials, keeps them
            in your keychain, and connects. Or paste any connection string.
          </p>
          <div className="mt-12 lg:mt-14">
            <WiresArt />
          </div>
        </Reveal>
        <Reveal>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PROVIDERS.map((p) => (
              <li key={p.name}>
                <div className="group relative flex h-[76px] items-center gap-3.5 overflow-hidden rounded-2xl bg-raised px-5 shadow-[var(--shadow-card)] transition-transform duration-200 hover:-translate-y-0.5">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: `color-mix(in oklab, ${p.color === "currentColor" ? "var(--foreground)" : p.color} 12%, transparent)`,
                    }}
                  >
                    {p.Icon ? (
                      <p.Icon
                        className="size-5"
                        color={p.color === "currentColor" ? undefined : p.color}
                      />
                    ) : (
                      <span className="text-[16px] font-bold" style={{ color: p.color }}>
                        {p.name[0]}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 truncate text-[17px] font-semibold tracking-[-0.02em]">
                    {p.name}
                  </span>
                  <span
                    className={cn(
                      "absolute top-2.5 right-2.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase",
                      p.via === "sign-in"
                        ? "bg-[var(--amber)]/20 text-[var(--link)]"
                        : "bg-ink/[0.06] text-muted-foreground",
                    )}
                  >
                    {p.via === "sign-in" ? "Sign in" : "API token"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] text-faint">
            Sign in: Stroke creates the credentials for you. API token: paste one key and pick a
            database.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

// ── Comparison// ── Comparison: two cards, the stack and Stroke ──────────────────────────────

const STACK_ROWS = [
  "An app per engine to keep updated",
  "A different set of shortcuts in each",
  "Agents set up again in every tool",
  "History and saved queries split apart",
  "Connections stored several ways",
];

const STROKE_ROWS = [
  "SQL and NoSQL in one window",
  "One set of shortcuts on every engine",
  "One MCP server for Claude, Cursor and Codex",
  "One history and one place for saved queries",
  `${PRO_PRICE} once, on up to 3 computers`,
];

function Comparison() {
  const stack = ["postgresql", "mongodb", "redis"]
    .map((slug) => SHIPPED_ENGINES.find((e) => e.slug === slug))
    .filter((e): e is (typeof SHIPPED_ENGINES)[number] => !!e);
  return (
    <section className={cn(GUTTER, "mt-32 md:mt-44")} aria-labelledby="compare-title">
      <Reveal className="flex flex-col items-center text-center">
        <Title id="compare-title" sub="Or one Stroke.">
          A client per database.
        </Title>
        <p className="mt-6 max-w-xl text-[17px] leading-[1.55] text-pretty text-muted-foreground md:text-[19px]">
          Most teams run a Postgres tool, a Mongo tool and a Redis tool. Stroke replaces the stack.
        </p>
      </Reveal>
      <div className="mx-auto mt-14 grid max-w-[60rem] grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-5">
        <Reveal>
          <div className="flex h-full flex-col rounded-[28px] bg-card p-7 md:p-9">
            <div className="flex items-center gap-4">
              <span className="flex -space-x-3">
                {stack.map((e, i) => (
                  <span
                    key={e.slug}
                    className="flex size-12 items-center justify-center rounded-[14px] bg-raised shadow-[var(--shadow-card)] ring-2 ring-card"
                    style={{ zIndex: 3 - i, transform: `rotate(${(i - 1) * 6}deg)` }}
                  >
                    <e.Icon className="size-6" color={e.color} />
                  </span>
                ))}
              </span>
              <span>
                <span className="block text-[17px] font-semibold tracking-[-0.02em]">
                  A client per database
                </span>
                <span className="block text-[13px] text-muted-foreground">
                  Three apps, and counting
                </span>
              </span>
            </div>
            <ul className="mt-8 space-y-3.5">
              {STACK_ROWS.map((r) => (
                <li key={r} className="flex items-start gap-3 text-[15px] text-muted-foreground">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-ink/[0.07]">
                    <MinusIcon className="size-3 text-faint" strokeWidth={2.6} />
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal>
          <div
            className="tinted relative flex h-full flex-col rounded-[28px] bg-raised p-7 shadow-[0_0_0_1.5px_color-mix(in_oklab,var(--amber)_70%,transparent),0_24px_60px_-28px_rgb(255_170_0/0.55)] md:p-9"
            style={{ "--tint": "#ffc107" } as React.CSSProperties}
          >
            <span className="absolute -top-3 right-7 rounded-full bg-[var(--amber)] px-3 py-1 text-[11px] font-semibold tracking-[0.06em] text-[var(--amber-ink)] uppercase">
              One app
            </span>
            <div className="flex items-center gap-4">
              <StrokeAppTile />
              <span>
                <span className="block text-[17px] font-semibold tracking-[-0.02em]">Stroke</span>
                <span className="block text-[13px] text-muted-foreground">
                  {SHIPPED_ENGINES.length} databases in one window
                </span>
              </span>
            </div>
            <ul className="mt-8 space-y-3.5">
              {STROKE_ROWS.map((r) => (
                <li
                  key={r}
                  className="flex items-start gap-3 text-[15px] font-medium text-foreground"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--amber)]">
                    <CheckIcon className="size-3 text-[var(--amber-ink)]" strokeWidth={3} />
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
      <p className="mt-6 text-center text-[13px] text-faint">
        How Stroke compares to TablePlus, DBeaver and others, feature by feature:{" "}
        <Link to="/compare" className="text-[var(--link)] hover:underline hover:underline-offset-4">
          Compare
        </Link>
      </p>
    </section>
  );
}

// ── Features, screen by screen ───────────────────────────────────────────────

type Feature = {
  id: string;
  title: string;
  sub: string;
  body: string;
  points: { lead: string; body: string }[];
  link?: { to: React.ComponentProps<typeof Link>["to"]; label: string };
  screen: Screen;
};

const FEATURES: Feature[] = [
  {
    id: "browse",
    title: "A grid that keeps up.",
    sub: "Even at millions of rows.",
    body: "Sort, filter, pin and edit, with every change staged until you press Apply.",
    points: [
      {
        lead: "Filters that write the WHERE",
        body: "Pick a column and a value, Stroke writes the clause.",
      },
      { lead: "Column stats", body: "Nulls, distinct values, min and max, one click away." },
      { lead: "Seven views of the same rows", body: "Grid, JSON, text, chart, map and more." },
    ],
    screen: {
      kind: "image",
      src: "/shots/column-stats.webp",
      alt: "A table in Stroke's grid with a column's menu and its stats",
      width: 1600,
      height: 1005,
    },
  },
  {
    id: "query",
    title: "Write SQL.",
    sub: "Read the result your way.",
    body: "Run a whole script and every result gets its own tab: a table, JSON, a chart or a plan.",
    points: [
      {
        lead: "Autocomplete that knows your schema",
        body: "Tables, columns and joins as you type.",
      },
      { lead: "Charts from any result", body: "Bar, line, area and pie, no export needed." },
      { lead: "Transactions you can see", body: "How long locks are held, and who is waiting." },
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
    id: "nosql",
    title: "MongoDB, Redis and DynamoDB.",
    sub: "In the same window.",
    body: "Documents, keys and items each get a view built for them.",
    points: [
      {
        lead: "Aggregations, stage by stage",
        body: "See what each stage returns as you build it.",
      },
      { lead: "Redis keys and a live overview", body: "Memory, hit ratio and pub/sub." },
      { lead: "DynamoDB", body: "With your AWS profile or DynamoDB Local." },
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
    id: "backup",
    title: "Back up a database.",
    sub: "Restore it anywhere.",
    body: "Export a whole database to a .sql file and restore it into another, with a live log.",
    points: [
      { lead: "Seven engines", body: "Postgres, MySQL, SQLite, D1, Turso, DuckDB, SQL Server." },
      { lead: "Pick what goes", body: "Tables, schema, data and functions." },
      { lead: "Across providers", body: "D1 to Postgres included, over SSH too." },
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
    title: "Share a result.",
    sub: "Not your database.",
    body: "Send rows, a chart or a schema as an end-to-end encrypted link that expires when you say.",
    points: [
      { lead: "Mask what is sensitive", body: "Pick the columns, hide the values." },
      { lead: "Expiry, view limit, password", body: "Set any of them per link." },
      { lead: "Revoke any time", body: "From your account, in one click." },
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
    <div className="mt-32 space-y-32 md:mt-44 md:space-y-44">
      {FEATURES.map((f, i) => (
        <section
          key={f.id}
          id={f.id}
          className={cn(GUTTER, "scroll-mt-24")}
          aria-labelledby={`${f.id}-title`}
        >
          <Reveal>
            <Title id={`${f.id}-title`} sub={f.sub}>
              {f.title}
            </Title>
            <p className="mt-6 max-w-2xl text-[17px] leading-[1.55] text-pretty text-muted-foreground md:text-[19px]">
              {f.body}
            </p>
          </Reveal>
          <div
            className={cn(
              "mt-12 grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-12",
              i % 2 === 1 && "lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]",
            )}
          >
            <Reveal className={cn(i % 2 === 1 && "lg:order-2")}>
              <div className="rounded-[28px] bg-card p-3 md:p-5">
                <FeatureScreen screen={f.screen} />
              </div>
            </Reveal>
            <ul className={cn("divide-y divide-border", i % 2 === 1 && "lg:order-1")}>
              {f.points.map((p) => (
                <li key={p.lead} className="py-5 first:pt-0 last:pb-0">
                  <p className="text-[16px] font-semibold tracking-[-0.01em]">{p.lead}</p>
                  <p className="mt-1 text-[14.5px] leading-[1.5] text-muted-foreground">{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
      <div className={cn(GUTTER, "-mt-16 md:-mt-24")}>
        <ArrowLink to="/features">Every feature, screen by screen</ArrowLink>
      </div>
    </div>
  );
}

// ── Shortcuts: the command palette ───────────────────────────────────────────

const PALETTE = [
  { icon: TableIcon, label: "Open table orders", hint: "Table" },
  { icon: TerminalIcon, label: "New SQL tab", hint: "Editor" },
  { icon: PlayIcon, label: "Explain query", hint: "Plan" },
  { icon: SearchIcon, label: "Find in every table", hint: "Search" },
  { icon: LockKeyholeIcon, label: "Make connection read-only", hint: "Connection" },
];

function Key({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <span className="flex size-[72px] flex-col items-center justify-center rounded-2xl bg-raised text-[22px] font-medium shadow-[0_1px_0_rgb(0_0_0/0.06),0_6px_14px_-6px_rgb(0_0_0/0.18)] ring-1 ring-black/[0.06] md:size-20 dark:ring-white/[0.08]">
      {children}
      {label && <span className="mt-1 text-[10px] font-normal text-faint">{label}</span>}
    </span>
  );
}

function Shortcuts() {
  return (
    <section
      className={cn(GUTTER, "mt-32 flex flex-col items-center text-center md:mt-44")}
      aria-labelledby="keys-title"
    >
      <Reveal className="flex flex-col items-center">
        <Title id="keys-title" sub="One shortcut away.">
          Every action.
        </Title>
        <p className="mt-6 max-w-xl text-[17px] leading-[1.55] text-pretty text-muted-foreground md:text-[19px]">
          Press ⌘K (Ctrl+K on Windows and Linux) to open a table, run a query or change a setting,
          without reaching for the mouse.
        </p>
      </Reveal>
      <Reveal className="mt-12 flex items-center gap-3">
        <Key label="command">
          <CommandIcon className="size-6" strokeWidth={1.8} />
        </Key>
        <Key>K</Key>
      </Reveal>
      <Reveal className="mt-8 w-full max-w-[30rem]">
        <Float className="p-2">
          <div className="flex items-center gap-2 rounded-xl bg-card px-3 py-2.5 text-[13.5px] text-faint">
            <SearchIcon className="size-4" />
            Open, run or go to…
          </div>
          <ul className="mt-1.5 space-y-0.5">
            {PALETTE.map((p, i) => (
              <li
                key={p.label}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px]",
                  i === 2 ? "bg-[var(--amber)] text-[var(--amber-ink)]" : "text-foreground",
                )}
              >
                <p.icon className="size-4 shrink-0 opacity-70" />
                <span className="flex-1 text-left">{p.label}</span>
                {i === 2 ? (
                  <CornerDownLeftIcon className="size-3.5 opacity-70" />
                ) : (
                  <span className="text-[12px] text-faint">{p.hint}</span>
                )}
              </li>
            ))}
          </ul>
        </Float>
      </Reveal>
    </section>
  );
}

// ── Agents ───────────────────────────────────────────────────────────────────

const AGENT_STEPS: { at: string; tool: string; arg: string; out: string; blocked?: boolean }[] = [
  { at: "14:02:11", tool: "list_tables", arg: "public", out: "21 tables" },
  { at: "14:02:12", tool: "describe_table", arg: "orders", out: "9 columns" },
  {
    at: "14:02:14",
    tool: "query",
    arg: "SELECT status, count(*) FROM orders GROUP BY 1",
    out: "4 rows",
  },
  { at: "14:02:19", tool: "query", arg: "DROP TABLE orders", out: "Blocked", blocked: true },
];

function AgentLog() {
  return (
    <div className="keep-dark w-full overflow-hidden rounded-2xl bg-[#111113] text-left text-[#e8e8e8] shadow-[0_18px_40px_-24px_rgb(0_0_0/0.6)] ring-1 ring-white/[0.08]">
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <p className="ms-2 text-[12.5px] font-medium text-[#c8c8c8]">Claude Code · prod</p>
        <span className="ms-auto flex items-center gap-1.5 rounded-full bg-white/[0.07] px-2 py-0.5 text-[11px] text-[#c8c8c8]">
          <span className="size-1.5 rounded-full bg-[var(--amber)]" />
          Read and write
        </span>
      </div>
      <ul className="divide-y divide-white/[0.05] font-mono text-[12px]">
        {AGENT_STEPS.map((s, i) => (
          <li
            key={i}
            className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5"
          >
            <span className="text-[#5f5f66] tabular-nums">{s.at}</span>
            <span className={cn("shrink-0", s.blocked ? "text-[#ff8a80]" : "text-[#8ab8ff]")}>
              {s.tool}
            </span>
            <span className="truncate text-[#a8a8b0]" title={s.arg}>
              {s.arg}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-md px-1.5 py-0.5 text-[11px]",
                s.blocked ? "bg-[#ff5f57]/15 text-[#ff8a80]" : "text-[#7c7c85]",
              )}
            >
              {s.out}
            </span>
          </li>
        ))}
      </ul>
      <p className="border-t border-white/[0.07] px-4 py-2.5 text-[11.5px] text-[#7c7c85]">
        DROP needs Full access on this connection. Nothing ran.
      </p>
    </div>
  );
}

const CLIENTS: {
  name: string;
  note: string;
  Icon?: React.ComponentType<{ className?: string; color?: string }>;
  color: string;
}[] = [
  { name: "Claude Code", note: "Anthropic, in your terminal", Icon: SiClaude, color: "#d97757" },
  { name: "Codex", note: "OpenAI's coding agent", color: "#10a37f" },
  { name: "Gemini CLI", note: "Google, in your terminal", Icon: SiGooglegemini, color: "#8e75b2" },
  { name: "Cursor", note: "And Claude Desktop, VS Code…", Icon: SiCursor, color: "currentColor" },
];

function ClientList() {
  return (
    <Float className="p-1.5">
      <ul className="divide-y divide-border">
        {CLIENTS.map((c) => (
          <li key={c.name} className="flex items-center gap-3 px-3 py-3">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: `color-mix(in oklab, ${c.color === "currentColor" ? "var(--foreground)" : c.color} 12%, transparent)`,
              }}
            >
              {c.Icon ? (
                <c.Icon
                  className="size-[18px]"
                  color={c.color === "currentColor" ? undefined : c.color}
                />
              ) : (
                <TerminalIcon className="size-[18px]" style={{ color: c.color }} />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold">{c.name}</span>
              <span className="block truncate text-[12px] text-muted-foreground">{c.note}</span>
            </span>
            <span className="flex items-center gap-1 rounded-full bg-[#30d158]/12 px-2 py-0.5 text-[11px] font-medium text-[#1f8a3a] dark:text-[#30d158]">
              <CheckIcon className="size-3" strokeWidth={3} />
              Works
            </span>
          </li>
        ))}
      </ul>
    </Float>
  );
}

function Agents() {
  return (
    <Section band className="mt-32 md:mt-44" inner="py-24 md:py-32">
      <Reveal className="flex flex-col items-center text-center">
        <Title id="agents-title" sub="In your AI assistant.">
          Your databases.
        </Title>
        <p className="mt-6 max-w-xl text-[17px] leading-[1.55] text-pretty text-muted-foreground md:text-[19px]">
          Stroke's built-in MCP server lets Claude, Cursor and Codex read your schema and run
          queries, held to the access level you set per connection.
        </p>
      </Reveal>
      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-5">
        <Reveal>
          <Card
            className="h-full bg-raised"
            tint="#bf5af2"
            title="Every call, as it happens."
            body="Each query an agent runs is logged in the app. Anything destructive waits for you."
          >
            <AgentLog />
          </Card>
        </Reveal>
        <Reveal>
          <Card
            className="h-full bg-raised"
            tint="#0a84ff"
            title="Works with your agent."
            body="Add Stroke to any MCP client in one step."
          >
            <ClientList />
          </Card>
        </Reveal>
      </div>
      <Reveal>
        <div className="mt-4 flex flex-col items-start gap-5 rounded-[28px] bg-raised p-7 md:mt-5 md:flex-row md:items-center md:justify-between md:p-9">
          <div>
            <h3 className="text-[1.375rem] tracking-[-0.025em]">Connect in one line.</h3>
            <p className="mt-2 max-w-md text-[15px] text-muted-foreground">
              Pick your agent and copy the command, or read the{" "}
              <Link
                to="/docs/mcp"
                className="text-[var(--link)] hover:underline hover:underline-offset-4"
              >
                MCP setup guide
              </Link>
              .
            </p>
          </div>
          <CommandMenu label="Add to your agent" items={AGENT_COMMANDS} />
        </div>
      </Reveal>
    </Section>
  );
}

// ── Private by design ────────────────────────────────────────────────────────

const PRIVATE = [
  {
    icon: LockKeyholeIcon,
    title: "Passwords stay in your keychain.",
    body: "Stroke connects straight from your computer. Credentials never touch our servers.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Read-only means read-only.",
    body: "Mark a connection read-only and every write is refused, by you or an agent.",
  },
  {
    icon: KeyRoundIcon,
    title: "Sync is end-to-end encrypted.",
    body: "Connections and settings sync between your computers, encrypted before they leave.",
  },
];

function Private() {
  return (
    <section className={cn(GUTTER, "mt-32 md:mt-44")} aria-labelledby="private-title">
      <Reveal>
        <Title id="private-title" sub="Plain to see.">
          Private by design.
        </Title>
        <p className="mt-6 max-w-2xl text-[17px] leading-[1.55] text-pretty text-muted-foreground md:text-[19px]">
          What Stroke stores, where, and what it never sees.{" "}
          <Link
            to="/security"
            className="text-[var(--link)] hover:underline hover:underline-offset-4"
          >
            Read the security page
          </Link>
          .
        </p>
      </Reveal>
      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        {PRIVATE.map((p) => (
          <Reveal key={p.title}>
            <div className="h-full rounded-[28px] bg-card p-7 md:p-8">
              <span className="flex size-11 items-center justify-center rounded-full bg-raised shadow-[var(--shadow-card)]">
                <p.icon className="size-5 text-[var(--link)]" strokeWidth={1.8} />
              </span>
              <h3 className="mt-6 text-[1.2rem] leading-snug tracking-[-0.02em]">{p.title}</h3>
              <p className="mt-2 text-[15px] leading-[1.55] text-muted-foreground">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── Reviews ──────────────────────────────────────────────────────────────────

function Reviews() {
  const { data: reviews } = useQuery(approvedReviewsQueryOptions());
  if (!reviews || reviews.length === 0) return null;
  return (
    <section className={cn(GUTTER, "mt-32 md:mt-44")} aria-labelledby="reviews-title">
      <Reveal>
        <Title id="reviews-title" sub="Who use it every day.">
          From people
        </Title>
      </Reveal>
      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {reviews.slice(0, 6).map((r) => (
          <Reveal key={r.id}>
            <figure className="flex h-full flex-col justify-between gap-8 rounded-[28px] bg-card p-7">
              <blockquote className="text-[16px] leading-[1.55] text-pretty text-foreground">
                “{r.body}”
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--amber)] text-[13px] font-semibold text-[var(--amber-ink)]">
                  {r.authorName.trim().charAt(0).toUpperCase() || "?"}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold">{r.authorName}</span>
                  {r.title && (
                    <span className="block truncate text-[12.5px] text-muted-foreground">
                      {r.title}
                    </span>
                  )}
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── Pricing teaser ───────────────────────────────────────────────────────────

function PricingTeaser() {
  const { user } = useAuth();
  return (
    <section
      id="pricing"
      className={cn(GUTTER, "mt-32 scroll-mt-24 md:mt-44")}
      aria-labelledby="price-title"
    >
      <Reveal className="flex flex-col items-center text-center">
        <Title id="price-title" sub="Paid once.">
          One price.
        </Title>
        <p className="mt-6 max-w-xl text-[17px] leading-[1.55] text-pretty text-muted-foreground md:text-[19px]">
          Use every feature free for {TRIAL_DAYS} days. If Stroke earns its place, it's {PRO_PRICE}{" "}
          once: every update included, nothing to renew or cancel.
        </p>
      </Reveal>
      <Reveal>
        <div className="mx-auto mt-12 max-w-[34rem] rounded-[32px] bg-card p-8 text-center md:p-10">
          <p className="text-[15px] font-semibold">Stroke Pro</p>
          <p className="mt-4 flex items-baseline justify-center gap-2">
            <span className="text-[4rem] leading-none font-semibold tracking-[-0.05em] tabular-nums">
              {PRO_PRICE}
            </span>
            <span className="text-[16px] text-muted-foreground">once</span>
          </p>
          <ul className="mx-auto mt-8 grid max-w-sm grid-cols-1 gap-3 text-left text-[15px] sm:grid-cols-2">
            {[
              "Every feature and engine",
              "Every future update",
              "Up to 3 computers",
              "Sync and scheduled backups",
            ].map((p) => (
              <li key={p} className="flex items-center gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--amber)]">
                  <CheckIcon className="size-3 text-[var(--amber-ink)]" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
            <Link
              to={user ? "/app/billing" : "/signup"}
              className="inline-flex h-12 items-center rounded-full bg-[var(--amber)] px-7 text-[16px] font-medium text-[var(--amber-ink)] transition-colors hover:bg-[var(--amber-hover)]"
            >
              Buy Stroke Pro
            </Link>
            <ArrowLink to="/pricing">Compare plans</ArrowLink>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── FAQ ──────────────────────────────────────────────────────────────────────

/** FAQ accordion. Rendered on the landing page and the /pricing page. */
export function Faq() {
  return (
    <section
      id="faq"
      className={cn(GUTTER, "mt-32 scroll-mt-24 md:mt-44")}
      aria-labelledby="faq-title"
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <Title id="faq-title" sub="Answered.">
            Questions?
          </Title>
          <p className="mt-5 text-[16px] text-muted-foreground">
            Something else?{" "}
            <a
              href="mailto:support@stroke.click"
              className="text-[var(--link)] hover:underline hover:underline-offset-4"
            >
              Email me
            </a>
            . I answer every one.
          </p>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {FAQ_ITEMS.map((item, i) => (
            <details key={item.q} className="group" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[16px] font-semibold tracking-[-0.01em] transition-colors duration-150 hover:text-soft [&::-webkit-details-marker]:hidden">
                {item.q}
                <PlusIcon
                  className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-45"
                  strokeWidth={1.75}
                />
              </summary>
              <p className="-mt-1 pb-6 text-[15.5px] leading-relaxed text-pretty text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// The pricing page reuses the plans block.
export { Pricing } from "#/components/pricing-plans";
