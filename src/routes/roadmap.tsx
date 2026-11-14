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
import { SHIPPED_ENGINES } from "#/lib/engines";
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
    title: `${SHIPPED_ENGINES.length} database engines`,
    body: SHIPPED_ENGINES.map((e) => e.name).join(", ") + ".",
    extra: (
      <ul className="mt-3.5 flex flex-wrap items-center gap-1.5">
        {SHIPPED_ENGINES.map((e) => (
          <li
            key={e.slug}
            className="flex h-6 items-center gap-1.5 rounded-md bg-white/[0.04] px-2 text-[12px] text-muted-foreground"
          >
            <e.Icon className="size-3" color={e.color} />
            {e.name}
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Provider sign-in and create",
    body: "Authorize once, see every database on your account, connect in one click, or create a new one without leaving the app.",
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
    title: "AI agent, built in",
    body: "Plans multi-step work, shows each step, retries what fails, asks before anything destructive, and can work across databases on one server. Opens as a tab beside your tables.",
  },
  {
    title: "Built-in MCP server",
    body: "Claude Code, Cursor and other agents query your database with the access level you choose: read only, read and write, schema changes, or full access.",
  },
  {
    title: "Start a database in Docker",
    body: "18 images from the command palette, from PostgreSQL to Oracle and MongoDB, connected when ready.",
  },
  {
    title: "Terminal tabs",
    body: "psql, mysql, sqlcmd, sqlite3, redis-cli, mongosh and more, signed in, in as many tabs as you want.",
  },
  {
    title: "Encrypted sync",
    body: "Connections, workspaces and settings on every device, end-to-end encrypted with a passphrase only you know.",
  },
  { title: "Workspaces", body: "Group connections into named, coloured workspaces." },
  {
    title: "Paste any connection string",
    body: "URLs, .env lines, JDBC, libpq and ADO.NET strings land on the right form. Copy URL goes the other way.",
  },
  {
    title: "Charts and dashboards",
    body: "Turn query results into charts and pin them to a dashboard.",
  },
  {
    title: "Schema diagrams and relation tree",
    body: "ERDs of your tables and relationships, and a tree of what references what, with row counts.",
  },
  {
    title: "Backup and restore",
    body: "Parallel dumps with progress, and restores that report exactly what failed.",
  },
  {
    title: "Background updates",
    body: "Updates download quietly and install when you quit; What's new shows what changed. A Nightly channel gets every change first.",
  },
  {
    title: "OS keychain storage",
    body: "Passwords, AI keys and provider tokens live in the OS keychain.",
  },
  {
    title: "Keyboard first",
    body: "A command palette, rebindable shortcuts, and a leader key: ⌘; then one letter.",
  },
  { title: "Themes", body: "Build your own theme, or use Glass light and dark." },
  {
    title: "SSH tunnels",
    body: "Connect to databases behind a bastion host without leaving the app.",
  },
  {
    title: "Local AI models",
    body: "Point the AI at a model on your own machine, so schema and data never leave it.",
  },
  {
    title: "Offline Pro",
    body: "A paid license keeps working offline and through outages of stroke.click.",
  },
];

const IN_PROGRESS: RoadmapItem[] = [
  {
    title: "Elasticsearch and OpenSearch",
    body: "Indices with their mappings as columns, documents in the grid, and Query DSL and SQL in the editor.",
  },
  {
    title: "Extension API",
    tag: "Beta",
    body: "Community-built panels and dialect plugins on top of the Extensions panel. Available to try now while the API settles.",
  },
];

const PLANNED: RoadmapItem[] = [
  {
    title: "Signed and notarized builds",
    body: "A Developer ID and notarization on macOS and a signed installer on Windows, so the first launch needs no workaround.",
  },
  {
    title: "Schema diff and migrations",
    body: "Compare two databases, or a database and a snapshot, and get the script that makes one match the other.",
  },
  {
    title: "Import wizard",
    body: "CSV, JSON and Excel into a new or existing table, with column mapping and type detection.",
  },
  {
    title: "More export formats",
    body: "Excel, Parquet, JSONL, Markdown tables and SQL INSERT statements from any grid or result.",
  },
  {
    title: "Test data generator",
    body: "Fill a table with realistic rows that respect its foreign keys.",
  },
  { title: "Data warehouses", body: "Snowflake, BigQuery, Redshift and Databricks." },
  {
    title: "More engines",
    body: "Neo4j, InfluxDB, ScyllaDB, YugabyteDB, AlloyDB and Cloud Spanner, in the order people ask for them.",
  },
  {
    title: "Shared workspaces",
    body: "Connections, saved queries and dashboards shared across a team.",
  },
  {
    title: "Visual relationship editing",
    body: "Draw a foreign key between two tables on the diagram and get the ALTER statement.",
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
