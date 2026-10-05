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
import { ArrowRightIcon, CheckIcon } from "lucide-react";

import { NextLinks, PageBody, PageHeader, PageShell, SideNav } from "#/components/page";
import { REPO_URL } from "#/components/site-chrome";
import { buttonVariants } from "#/components/ui/button";
import { seo } from "#/lib/seo";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/roadmap")({
  head: () =>
    seo({
      title: "Roadmap · Stroke",
      description:
        "What has shipped in Stroke, what's being built now, and what's planned next, from database engines and provider sign-in to the built-in MCP server.",
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
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {PROVIDERS.map((p) => (
          <span
            key={p.name}
            className="flex items-center gap-1.5 rounded-md border border-border/50 px-2.5 py-1 text-xs text-muted-foreground"
          >
            {p.Icon && <p.Icon className="size-3" />}
            {p.name}
          </span>
        ))}
      </div>
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

function Checkbox({ state }: { state: ItemState }) {
  if (state === "done") {
    return (
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-copper text-background">
        <CheckIcon className="size-3.5" strokeWidth={2.75} />
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2 border-copper/70">
        <span className="size-1.5 rounded-full bg-copper" />
      </span>
    );
  }
  return <span className="mt-0.5 size-5 shrink-0 rounded-md border border-border" />;
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
              className="text-foreground underline underline-offset-2"
            >
              open an issue
            </a>
            .
          </>
        }
        actions={
          <>
            <Link to="/changelog" className={buttonVariants({ variant: "outline", size: "lg" })}>
              See every release
              <ArrowRightIcon className="size-4" />
            </Link>
            <span className="text-sm text-muted-foreground">
              {shippedCount} milestones shipped and counting
            </span>
          </>
        }
      />
      <PageBody
        aside={
          <SideNav
            title="On this page"
            items={GROUPS.map((g) => ({
              hash: slug(g.label),
              label: (
                <>
                  {g.label}
                  <span className="pr-1 text-xs text-muted-foreground tabular-nums">
                    {g.items.length}
                  </span>
                </>
              ),
            }))}
          />
        }
      >
        <div className="space-y-14">
          {GROUPS.map((group) => (
            <section key={group.label} id={slug(group.label)} className="scroll-mt-20">
              <div className="flex items-baseline gap-3">
                <h2 className="text-lg font-semibold tracking-tight">{group.label}</h2>
                <span className="text-sm text-muted-foreground">{group.note}</span>
              </div>
              <ul className="mt-5 space-y-5">
                {group.items.map((item) => (
                  <li key={item.title} className="flex gap-3.5">
                    <Checkbox state={group.state} />
                    <div>
                      <h3
                        className={cn(
                          "text-sm font-semibold",
                          group.state === "done" && "text-foreground",
                        )}
                      >
                        {item.title}
                        {item.tag && (
                          <span className="ml-2 rounded-full border border-copper/30 bg-copper/10 px-2 py-0.5 align-[1px] text-[11px] font-medium text-copper">
                            {item.tag}
                          </span>
                        )}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-pretty text-muted-foreground">
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
