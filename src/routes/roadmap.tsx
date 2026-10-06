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
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { NextLinks, PageBody, PageHeader, PageShell, siteButton } from "#/components/page";
import { REPO_URL } from "#/components/site-chrome";
import { seo } from "#/lib/seo";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/roadmap")({
  head: () =>
    seo({
      title: "Roadmap · Stroke database client",
      description:
        "What has shipped in Stroke, the native database client, what's being built now, and what's planned next, from database engines and provider sign-in to the built-in MCP server.",
      path: "/roadmap",
      breadcrumbs: [{ name: "Roadmap", path: "/roadmap" }],
    }),
  component: RoadmapPage,
});

type ItemState = "done" | "active" | "todo";

interface RoadmapItem {
  title: string;
  body: string;
  /** Short status label shown beside the title, e.g. "Beta". */
  tag?: string;
  extra?: React.ReactNode;
}

const PROVIDERS = [
  { name: "Neon", Icon: null },
  { name: "Supabase", Icon: SiSupabase },
  { name: "Prisma Postgres", Icon: SiPrisma },
  { name: "PlanetScale", Icon: SiPlanetscale },
  { name: "TiDB Cloud", Icon: SiTidb },
  { name: "Turso", Icon: SiTurso },
  { name: "Railway", Icon: SiRailway },
  { name: "Nile", Icon: null },
  { name: "Upstash", Icon: SiUpstash },
  { name: "PostHog", Icon: SiPosthog },
  { name: "Cloudflare D1", Icon: SiCloudflare },
];

// Completed items are drawn from the changelog (stroke.click/changelog).
const SHIPPED: RoadmapItem[] = [
  {
    title: "Ten database engines",
    body: "PostgreSQL, MySQL, MariaDB, SQLite, DuckDB, SQL Server, ClickHouse, CockroachDB, Turso / LibSQL, and Cloudflare D1.",
  },
  {
    title: "Provider sign-in",
    body: "Authorize once, see every database on your account, and connect in one click. No hunting for connection strings.",
    extra: (
      <ul className="mt-3.5 flex flex-wrap items-center gap-1.5">
        {PROVIDERS.map((p) => (
          <li
            key={p.name}
            className="flex h-6 items-center gap-1.5 rounded-md bg-white/[0.04] px-2 text-[12px] text-muted-foreground"
          >
            {p.Icon && <p.Icon className="size-3" />}
            {p.name}
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Built-in MCP server",
    body: "Expose a connection to Claude, Cursor, and other agents in one click, so they work against the live schema.",
  },
  {
    title: "AI chat, built in",
    body: "A schema-aware assistant that runs queries, explains schemas, and drafts SQL right inside the app.",
  },
  {
    title: "Charts and dashboards",
    body: "Turn query results into bar, line, pie, and scatter charts and pin them to a dashboard.",
  },
  {
    title: "Schema diagrams",
    body: "Auto-generated ERDs of your tables and relationships, with foreign-key navigation.",
  },
  {
    title: "Backup and restore",
    body: "Export and restore whole databases or a subset, with per-statement savepoints so one bad row can't abort the job.",
  },
  {
    title: "Signed and notarized builds",
    body: "Code signing on macOS (Developer ID + notarization) and Windows, so the first launch is clean.",
  },
  {
    title: "Auto-update",
    body: "Stroke updates itself in place through the built-in updater. No re-downloading installers.",
  },
  {
    title: "OS keychain storage",
    body: "AI keys and provider tokens live in the OS keychain (Keychain, Credential Manager, Secret Service).",
  },
  {
    title: "Command palette and shortcuts",
    body: "Cmd/Ctrl+K to jump anywhere, plus a deep set of keyboard shortcuts for tabs, search, and navigation.",
  },
  {
    title: "SSH tunnels",
    body: "Connect to databases behind a bastion host without leaving the app.",
  },
  {
    title: "Local AI models",
    body: "Point the AI assistant at a model running on your own machine, so schema and data never leave it.",
  },
];

const IN_PROGRESS: RoadmapItem[] = [
  {
    title: "Extension API",
    tag: "Beta",
    body: "Community-built panels and dialect plugins on top of the Extensions panel. Available to try now while the API settles.",
  },
  {
    title: "Redesigned connection experience",
    body: "A two-pane connect screen: pick your type, driver, and saved connections on the left while editing details in a focused pane on the right.",
  },
  {
    title: "Redis support",
    tag: "Beta",
    body: "A Redis client, in the connection picker and available to try now. It leaves beta once it holds up against real workloads.",
  },
];

const PLANNED: RoadmapItem[] = [
  {
    title: "Sync to your Stroke account",
    body: "Connections, saved queries, and settings saved to your account, so every device you sign in on picks up where you left off.",
  },
  {
    title: "Shared workspaces",
    body: "Connections, saved queries, and dashboards shared across a team.",
  },
  {
    title: "More engines",
    body: "New dialects land regularly, decided by what users ask for. BigQuery and others are in the queue.",
  },
  {
    title: "More export formats",
    body: "Parquet and JSONL export from any grid or query result, alongside the existing CSV and JSON.",
  },
];

const GROUPS: { label: string; note: string; state: ItemState; items: RoadmapItem[] }[] = [
  { label: "Shipped", note: "Done and in your hands", state: "done", items: SHIPPED },
  { label: "In progress", note: "Being built now", state: "active", items: IN_PROGRESS },
  { label: "Planned", note: "Next in line", state: "todo", items: PLANNED },
];

/**
 * Issue-status glyphs in Linear's manner: a filled circle with a check for
 * done, a ring with its right half filled for in progress, and a dashed ring
 * for planned.
 */
function StatusGlyph({ state, className }: { state: ItemState; className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      aria-hidden="true"
      className={cn(
        "size-3.5 shrink-0",
        state === "done" && "text-soft",
        state === "active" && "text-copper",
        state === "todo" && "text-muted-foreground",
        className,
      )}
    >
      {state === "done" && (
        <>
          <circle cx="7" cy="7" r="6.5" fill="currentColor" />
          <path
            d="M4.4 7.2 6.2 9l3.4-3.7"
            fill="none"
            className="stroke-background"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {state === "active" && (
        <>
          <circle cx="7" cy="7" r="5.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 3.5a3.5 3.5 0 0 1 0 7z" fill="currentColor" />
        </>
      )}
      {state === "todo" && (
        <circle
          cx="7"
          cy="7"
          r="5.75"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="1.6 1.86"
        />
      )}
    </svg>
  );
}

function slug(label: string) {
  return label.toLowerCase().replaceAll(" ", "-");
}

function RoadmapPage() {
  const shippedCount = SHIPPED.length;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Roadmap"
        title="Where Stroke is headed"
        description={
          <>
            What has already shipped, what's being built now, and what's next. The order comes from
            what people ask for, so if something you need is missing,{" "}
            <a
              href={`${REPO_URL}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline decoration-white/30 underline-offset-[3px] transition-colors hover:decoration-white/70"
            >
              open an issue
            </a>
            .
          </>
        }
        actions={
          <>
            <Link to="/changelog" className={siteButton({ variant: "secondary" })}>
              See every release
              <ArrowRightIcon className="size-4" />
            </Link>
            <span className="text-sm text-muted-foreground">
              {shippedCount} milestones shipped and counting
            </span>
          </>
        }
      />
      <PageBody wide>
        {/* The page index: one cell per status, split by hairlines. */}
        <nav
          aria-label="Roadmap sections"
          className="grid grid-cols-1 overflow-hidden rounded-xl border border-border sm:grid-cols-3"
        >
          {GROUPS.map((group) => (
            <a
              key={group.label}
              href={`#${slug(group.label)}`}
              className="group flex items-center gap-3 border-border px-5 py-4 transition-colors not-first:border-t hover:bg-white/[0.025] sm:not-first:border-t-0 sm:not-first:border-l"
            >
              <StatusGlyph state={group.state} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{group.label}</span>
                <span className="block text-[13px] text-muted-foreground">{group.note}</span>
              </span>
              <span className="text-[13px] text-muted-foreground tabular-nums transition-colors group-hover:text-foreground">
                {group.items.length}
              </span>
            </a>
          ))}
        </nav>

        <div className="mt-16 space-y-16 md:mt-20 md:space-y-20">
          {GROUPS.map((group) => (
            <section
              key={group.label}
              id={slug(group.label)}
              aria-labelledby={`${slug(group.label)}-title`}
              className="scroll-mt-24"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-4 pb-5">
                <StatusGlyph state={group.state} className="size-4" />
                <h2 id={`${slug(group.label)}-title`} className="text-[1.75rem] md:text-[2rem]">
                  {group.label}
                </h2>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {group.items.length}
                </span>
                <span className="ml-auto hidden text-sm text-muted-foreground sm:block">
                  {group.note}
                </span>
              </div>

              <ul>
                {group.items.map((item) => (
                  <li
                    key={item.title}
                    className="grid grid-cols-[0.875rem_minmax(0,1fr)] items-start gap-x-3.5 gap-y-1.5 border-b border-border px-4 py-5 md:grid-cols-[0.875rem_minmax(0,17rem)_minmax(0,1fr)] md:gap-x-5 lg:grid-cols-[0.875rem_minmax(0,20rem)_minmax(0,1fr)]"
                  >
                    <StatusGlyph state={group.state} className="mt-[3px]" />
                    <h3 className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[15px] leading-snug font-medium">
                      {item.title}
                      {item.tag && (
                        <span className="inline-flex h-5 items-center gap-1.5 rounded-full border border-border px-2 text-[11px] font-medium text-soft">
                          <span aria-hidden="true" className="size-1.5 rounded-full bg-copper" />
                          {item.tag}
                        </span>
                      )}
                    </h3>
                    <div className="col-start-2 md:col-start-3 md:row-start-1">
                      <p className="max-w-[40rem] text-[15px] leading-relaxed text-pretty text-muted-foreground">
                        {item.body}
                      </p>
                      {item.extra}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <NextLinks>
          <Link to="/changelog">Read the changelog →</Link>
          <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer">
            Request a feature →
          </a>
        </NextLinks>
      </PageBody>
    </PageShell>
  );
}
