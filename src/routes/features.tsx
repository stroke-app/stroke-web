import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ActivityIcon,
  BotIcon,
  BoxesIcon,
  BracesIcon,
  CableIcon,
  ChartLineIcon,
  CheckIcon,
  Columns2Icon,
  CommandIcon,
  DatabaseBackupIcon,
  FileCode2Icon,
  GitCompareIcon,
  Grid3x3Icon,
  HistoryIcon,
  KeyboardIcon,
  LayersIcon,
  LayoutDashboardIcon,
  ListTreeIcon,
  LockIcon,
  MapIcon,
  MousePointerClickIcon,
  NetworkIcon,
  NotebookPenIcon,
  PaletteIcon,
  PencilLineIcon,
  PlugIcon,
  PuzzleIcon,
  RadioIcon,
  ReplaceIcon,
  ScanSearchIcon,
  ScrollTextIcon,
  SearchIcon,
  ShieldCheckIcon,
  SquareFunctionIcon,
  TablePropertiesIcon,
  TerminalIcon,
} from "lucide-react";

import { SmartDownloadButton } from "#/components/download-button";
import { FeatureShot } from "#/components/feature-shot";
import { PageHeader, PageShell, WRAP } from "#/components/page";
import { buttonVariants } from "#/components/ui/button";
import { seo } from "#/lib/seo";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/features")({
  head: () =>
    seo({
      title: "Features · Stroke",
      description:
        "Everything in Stroke: a data grid for millions of rows, staged edits, a SQL editor with EXPLAIN plans, schema timeline, data diff, ER diagrams, maps, security and RLS, instance insights, backup and restore, codegen, an AI chat, and a built-in MCP server.",
      path: "/features",
      breadcrumbs: [{ name: "Features", path: "/features" }],
    }),
  component: FeaturesPage,
});

interface Shot {
  src: string;
  width: number;
  height: number;
  alt: string;
}

interface Feature {
  icon: React.ElementType;
  title: string;
  desc: string;
  points?: string[];
  shot?: Shot;
  /** "beta" and similar, shown beside the title. */
  tag?: string;
}

interface Group {
  id: string;
  label: string;
  intro: string;
  features: Feature[];
}

const shot = (name: string, width: number, height: number, alt: string): Shot => ({
  src: `/features/${name}.webp`,
  width,
  height,
  alt,
});

const GROUPS: Group[] = [
  {
    id: "data",
    label: "Data",
    intro: "Browse, edit, and inspect rows without the grid ever getting in the way.",
    features: [
      {
        icon: Grid3x3Icon,
        title: "A grid built for millions of rows",
        desc: "Rows paint immediately while the total count fills in the background, so a million-row table opens as fast as a ten-row one.",
        points: [
          "Column stats: min, max, average, nulls, and distinct count",
          "Multi-column sort with shift-click, and a visual filter builder with date presets",
          "Click any foreign key to jump straight to the row it points at",
          "Pin, hide, and resize columns, remembered per table",
        ],
        shot: shot(
          "view-table",
          1472,
          1040,
          "The data grid showing the events table: 1,000,000 rows with typed columns",
        ),
      },
      {
        icon: PencilLineIcon,
        title: "Edits you review before they land",
        desc: "Change cells, add rows, and delete rows. Everything is staged and marked in the grid until you apply it.",
        points: [
          "Type-aware editors for text, numbers, booleans, enums, dates, UUIDs, JSON, and Postgres arrays",
          "Stage as many new rows as you like, then apply or discard them together",
          "Preview the generated SQL for any change before it runs",
        ],
        shot: shot(
          "staged-edits",
          1472,
          750,
          "Staged changes: a new row, a row marked for deletion, and a cell being edited",
        ),
      },
      {
        icon: ReplaceIcon,
        title: "Find and replace, previewed",
        desc: "Pick a column, match case, whole word, or a regex, and see every cell that will change before you replace it.",
        shot: shot(
          "find-replace",
          960,
          1000,
          "Find and replace previewing 8 cells that will change, old value beside new",
        ),
      },
      {
        icon: MousePointerClickIcon,
        title: "Everything is a right-click away",
        desc: "Filter by a value or exclude it, set NULL, expand, duplicate, or copy a row as JSON, CSV, Markdown, plain text, or an INSERT statement.",
        shot: shot("context-menu", 864, 715, "The cell context menu with the Filter submenu open"),
      },
      {
        icon: LayersIcon,
        title: "Seven views of the same rows",
        desc: "Every table tab can show its rows as a grid, JSON, a record card, plain text, a chart, an ER diagram, or a map. Switch per tab, or set a default.",
        shot: shot(
          "view-json",
          1472,
          1040,
          "JSON view of a table with the JSONPath filter bar and column picker",
        ),
      },
      {
        icon: BracesIcon,
        title: "Real viewers for real values",
        desc: "Values that don't fit a cell get a viewer instead of being cut off.",
        points: [
          "JSON and JSONB as a collapsible tree, with search and a full-screen editor",
          "pgvector embeddings with dimension, norm, and a value histogram",
          "PostGIS geometry drawn on a pannable map, with its type and SRID",
          "Multi-megabyte cells are capped before they reach the screen, so nothing freezes",
        ],
        shot: shot(
          "row-json",
          1477,
          516,
          "A row expanded inline as a JSON tree with Tree and Raw modes",
        ),
      },
      {
        icon: RadioIcon,
        title: "Live mode",
        desc: "Watch a table in real time. Inserts, updates, and deletes stream into the grid as they happen on the database.",
      },
      {
        icon: SearchIcon,
        title: "Global search",
        desc: "Find in database searches across tables and objects as you type, so you never hunt through the sidebar.",
      },
    ],
  },
  {
    id: "query",
    label: "Query",
    intro: "Write SQL, keep it, and turn the schema back into code.",
    features: [
      {
        icon: TerminalIcon,
        title: "A SQL editor for real work",
        desc: "Schema-aware autocomplete, one keystroke to run, and everything you run saved automatically.",
        points: [
          "EXPLAIN plans, drawn so you can see what the planner decided",
          "Formatting you control: keyword and identifier casing, indent, line breaks",
          "Automatic history plus saved queries for the ones you keep",
          "Export results as CSV, JSON, or SQL",
        ],
        shot: shot(
          "sql-console",
          1473,
          689,
          "The SQL editor running a query with typed results below",
        ),
      },
      {
        icon: NotebookPenIcon,
        title: "SQL notebooks",
        desc: "Mix SQL cells and Markdown in one .sqlnb file. Run cells on their own and keep the results next to the notes. Good for an analysis you hand to someone else.",
      },
      {
        icon: SquareFunctionIcon,
        title: "ORM runner",
        desc: "Write ORM-style queries, preview the SQL they generate, and run them against the connected database.",
      },
      {
        icon: FileCode2Icon,
        title: "Codegen",
        desc: "Read the live schema back out as Prisma or Drizzle source. It introspects once, so switching between the two is instant, even on a large schema.",
      },
    ],
  },
  {
    id: "schema",
    label: "Schema",
    intro: "See the whole structure, and how it changes over time.",
    features: [
      {
        icon: TablePropertiesIcon,
        title: "Schema explorer",
        desc: "Tables, views, materialized views, and foreign tables, with live row counts in the sidebar.",
        points: [
          "An index browser and a DDL viewer for any object",
          "Guided dialogs to create tables, schemas, sequences, triggers, enums, and foreign keys",
          "Manage PostgreSQL enum types",
        ],
      },
      {
        icon: BoxesIcon,
        title: "Database objects",
        desc: "Every table, view, function, trigger, enum, sequence, and index in one browsable list, with owners, estimated rows, and data and index sizes.",
      },
      {
        icon: ListTreeIcon,
        title: "Relation tree",
        desc: "Walk foreign keys as an expandable tree, drilling from one row into everything it references. Row counts stream in without blocking you.",
      },
      {
        icon: NetworkIcon,
        title: "ER diagrams",
        desc: "Entity-relationship diagrams drawn from the live schema: primary and foreign keys marked, 1:N and 1:1 links, zoom, and a minimap.",
        shot: shot(
          "view-erd",
          1472,
          1040,
          "An ER diagram linking invoice_item to invoice and item by foreign keys",
        ),
      },
      {
        icon: HistoryIcon,
        title: "Schema timeline",
        desc: "Snapshot the schema and see exactly which columns, indexes, and constraints were added or removed between any two snapshots. Then generate the migration SQL that gets from one to the other.",
      },
      {
        icon: GitCompareIcon,
        title: "Data diff",
        desc: "Compare two query results or table snapshots row by row. Added, removed, and modified rows are highlighted, including changes inside JSON and array columns.",
      },
    ],
  },
  {
    id: "visualize",
    label: "Visualize",
    intro: "Turn a result into something you can see at a glance.",
    features: [
      {
        icon: ChartLineIcon,
        title: "Charts",
        desc: "Turn any query result into a bar, line, area, step, or pie chart, or a geographic choropleth map.",
        shot: shot("view-chart", 1472, 1040, "An area chart of amount over time across 1,000 rows"),
      },
      {
        icon: LayoutDashboardIcon,
        title: "Dashboards",
        desc: "Pin charts and saved views to a dashboard you can come back to any time.",
      },
      {
        icon: MapIcon,
        title: "Map view",
        desc: "Every PostGIS layer drawn on a map, clustered when there are too many points to draw one by one. The basemap ships with the app, so the default view makes no network requests.",
        shot: shot(
          "view-map",
          1472,
          1040,
          "Map view of 1,000,000 GPS points in 89 clusters on a world map",
        ),
      },
    ],
  },
  {
    id: "operate",
    label: "Operate",
    intro: "Security, health, backups, and a record of everything that ran.",
    features: [
      {
        icon: ShieldCheckIcon,
        title: "Security and RLS",
        desc: "See who can read or write what. Roles, grants, and privileges in one place.",
        points: [
          "A role tree grouped into superusers, login roles, and group roles",
          "Role attributes and inherited-from membership",
          "Per-database access grants",
        ],
      },
      {
        icon: ScanSearchIcon,
        title: "Advisor",
        desc: "A read-only check of the database that ranks what's wrong, worst first. It never reads a row of your data and never runs DDL.",
        points: [
          "Tables without row-level security, and tables with no primary key",
          "Foreign keys with no index, and indexes nothing has scanned",
          "Bloated tables and rows so wide a page of them moves megabytes",
          "Every finding comes with the SQL that would fix it, to read before you run",
        ],
      },
      {
        icon: ActivityIcon,
        title: "Instance insights and config",
        desc: "What the server is doing right now: version, uptime, connections, replication, cache hit rates, sessions, and locks.",
        points: [
          "Activity, State, Config, and Replication tabs with live timelines",
          "A searchable browser of every server setting",
          "Settings that are safe to change can be edited in place",
        ],
      },
      {
        icon: DatabaseBackupIcon,
        title: "Backup and restore",
        desc: "Export a full SQL dump, schema and data, with toggles for what to include and per-table selection. Restore from a .sql file with results per statement.",
        points: [
          "A live log while it runs, and any export can be stopped mid-run",
          "PostgreSQL, MySQL, SQLite, and Cloudflare D1",
        ],
      },
      {
        icon: ScrollTextIcon,
        title: "Activity log",
        desc: "Every statement the app has run, with its duration and outcome, including the ones it ran on your behalf. Nothing the UI does is invisible.",
      },
      {
        icon: LockIcon,
        title: "Read-only mode",
        desc: "Lock any connection so writes are blocked entirely. Browse production without the risk.",
      },
      {
        icon: CableIcon,
        title: "SSH tunnels and local discovery",
        desc: "Connect through a bastion host, or let Stroke find what's already running: Docker containers, local Postgres and MySQL, and the SQLite files your ORM config points at.",
      },
    ],
  },
  {
    id: "ai",
    label: "AI and agents",
    intro: "An assistant that knows your schema, and a door for the agents you already use.",
    features: [
      {
        icon: BotIcon,
        title: "AI chat",
        desc: "An assistant with real database access: it runs queries, reads the schema, explains what it found, and draws charts inline. Destructive statements always ask first.",
        points: [
          "A free tier built in, with no key to configure",
          "Your own key for any OpenAI-compatible provider, or GitHub Copilot",
          "Local models through Ollama and LM Studio",
          "Skills: Markdown files that shape how the agent works on your schema",
        ],
        shot: shot(
          "ai-chat",
          1120,
          836,
          "The AI chat asking what you would like to explore, with suggested prompts",
        ),
      },
      {
        icon: PlugIcon,
        title: "Built-in MCP server",
        desc: "Start it in Settings, copy the config, and Claude, Cursor, or any MCP client can query your database. A stable token means you configure it once.",
      },
    ],
  },
  {
    id: "workflow",
    label: "Keyboard and workflow",
    intro: "Every feature is reachable without a mouse.",
    features: [
      {
        icon: CommandIcon,
        title: "Command palette",
        desc: "Press Cmd/Ctrl+K and type a table, a feature, or a shortcut to jump there.",
        shot: shot(
          "command-palette",
          1920,
          1080,
          "The command palette listing views with their keyboard shortcuts",
        ),
      },
      {
        icon: KeyboardIcon,
        title: "Keyboard first",
        desc: "A shortcut for every core view, drawn as keycaps wherever it appears.",
        points: [
          "Press ? for a searchable list of every shortcut",
          "Reopen a closed tab, jump to tabs 1 to 9, filter by the focused value with Alt+F",
          "An optional Vim mode for the grid and the editors",
        ],
      },
      {
        icon: Columns2Icon,
        title: "Split panes",
        desc: "Drag a tab to either edge to split the window. Compare two tables, or keep a query beside the rows it returns.",
      },
      {
        icon: PuzzleIcon,
        title: "Extensions",
        tag: "Beta",
        desc: "Add new panels, query tools, and integrations with first-party and community extensions.",
      },
      {
        icon: PaletteIcon,
        title: "Themes and grid styles",
        desc: "Dark and light themes, and six grid styles: lines, bordered, striped, dotted, dots, and minimal.",
      },
    ],
  },
];

/** A landscape screenshot needs both columns; a portrait one reads fine in one. */
const isWideShot = (f: Feature) => !!f.shot && f.shot.width / f.shot.height >= 1.3;

/**
 * Which cards span both columns: wide screenshots, plus any card that would
 * otherwise sit alone in its row (before a wide card, or at the end), so a
 * group never ends up with a gap beside a lone card.
 */
function columnSpans(features: Feature[]): boolean[] {
  const wide = features.map(isWideShot);
  let open = -1; // index of a single card still waiting for a partner
  features.forEach((_, i) => {
    if (wide[i]) {
      if (open !== -1) wide[open] = true;
      open = -1;
    } else if (open === -1) {
      open = i;
    } else {
      open = -1;
    }
  });
  if (open !== -1) wide[open] = true;
  return wide;
}

function FeatureCard({ feature, wide }: { feature: Feature; wide: boolean }) {
  const Icon = feature.icon;
  return (
    <article
      className={cn(
        "flex flex-col rounded-3xl border border-border bg-card p-6 transition-colors duration-150 hover:border-foreground/20 sm:p-7",
        feature.shot && "spotlight",
        wide && "sm:col-span-2",
      )}
    >
      <div
        className={cn(
          "grid gap-6",
          wide && feature.points && "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
        )}
      >
        <div>
          <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-background">
            <Icon className="size-4 text-copper" strokeWidth={1.75} />
          </span>
          <h3 className="mt-4 flex items-center gap-2 text-base font-medium tracking-tight">
            {feature.title}
            {feature.tag && (
              <span className="rounded-full border border-copper/30 bg-copper/10 px-2 py-0.5 text-[11px] font-medium text-copper">
                {feature.tag}
              </span>
            )}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
            {feature.desc}
          </p>
        </div>
        {feature.points && (
          <ul className={cn("space-y-2.5 text-sm", !feature.shot && "mt-1")}>
            {feature.points.map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-copper" strokeWidth={2.5} />
                <span className="text-pretty text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {feature.shot && (
        <div className="mt-7">
          <FeatureShot {...feature.shot} />
        </div>
      )}
    </article>
  );
}

function FeaturesPage() {
  const total = GROUPS.reduce((n, g) => n + g.features.length, 0);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Features"
        title="Everything you need to work with data"
        description={`${total} features across one studio for exploring, querying, and running every database you have, with an AI chat and an MCP server so your agents can work alongside you.`}
        actions={
          <>
            <SmartDownloadButton size="lg" variant="default" alternates={false} />
            <Link to="/docs" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Read the docs
            </Link>
          </>
        }
      />

      {/* Jump bar */}
      <nav
        aria-label="Feature groups"
        className="sticky top-14 z-30 border-b border-border bg-background/85 backdrop-blur-md"
      >
        <ul className={cn(WRAP, "flex gap-1 overflow-x-auto py-2.5")}>
          {GROUPS.map((g) => (
            <li key={g.id}>
              <a
                href={`#${g.id}`}
                className="flex h-8 items-center rounded-full px-3.5 text-sm whitespace-nowrap text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
              >
                {g.label}
                <span className="ml-1.5 text-xs text-muted-foreground/70 tabular-nums">
                  {g.features.length}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={WRAP}>
        {GROUPS.map((group) => (
          <section
            key={group.id}
            id={group.id}
            aria-labelledby={`${group.id}-title`}
            className="grid scroll-mt-32 grid-cols-1 gap-8 border-b border-border py-16 last:border-b-0 md:py-20 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14"
          >
            <div className="lg:sticky lg:top-36 lg:self-start">
              <h2
                id={`${group.id}-title`}
                className="text-2xl font-medium tracking-[-0.03em] sm:text-3xl"
              >
                {group.label}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-pretty text-muted-foreground">
                {group.intro}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(() => {
                const spans = columnSpans(group.features);
                return group.features.map((f, i) => (
                  <FeatureCard key={f.title} feature={f} wide={spans[i]} />
                ));
              })()}
            </div>
          </section>
        ))}
      </div>

      <section className="border-t border-border">
        <div
          className={cn(
            WRAP,
            "flex flex-col items-start justify-between gap-6 py-16 md:flex-row md:items-center",
          )}
        >
          <div>
            <h2 className="text-2xl font-medium tracking-[-0.03em]">
              Try it on your own database.
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Free to download. $9.99 once, whenever you decide to keep it.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SmartDownloadButton size="lg" variant="default" alternates={false} />
            <Link to="/pricing" className={buttonVariants({ variant: "outline", size: "lg" })}>
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
