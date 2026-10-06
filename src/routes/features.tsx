import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ActivityIcon,
  BotIcon,
  BoxesIcon,
  BracesIcon,
  CableIcon,
  ChartLineIcon,
  Columns2Icon,
  CommandIcon,
  DatabaseBackupIcon,
  FileCode2Icon,
  FileJsonIcon,
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
import { useEffect, useRef, useState } from "react";

import { SmartDownloadButton } from "#/components/download-button";
import { FeatureShot } from "#/components/feature-shot";
import {
  ArrowLink,
  PageHeader,
  PageShell,
  Panel,
  Section,
  SectionIntro,
  siteButton,
  WRAP,
} from "#/components/page";
import { seo } from "#/lib/seo";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/features")({
  head: () =>
    seo({
      title: "Features · Stroke database client",
      description:
        "Every feature in Stroke, the native database client: a data grid for millions of rows, a SQL editor with EXPLAIN plans, ER diagrams, schema timeline, data diff, backup and restore, an AI chat, and a built-in MCP server.",
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
  /**
   * Which part stays in view when a frame crops the shot horizontally:
   * 0 keeps the left edge (the default), 0.5 the middle.
   */
  focus?: number;
}

interface Feature {
  icon: React.ElementType;
  title: string;
  desc: string;
  points?: string[];
  shot?: Shot;
  /** A coded product mockup, for a feature with no screenshot that still gets a visual. */
  mock?: React.ReactNode;
  /** "Beta" and similar, shown beside the title. */
  tag?: string;
  link?: { label: string; to: "/"; hash: string };
}

/** How a group's screenshot features are laid out, in order, above its grid. */
type Showcase =
  /** One screenshot, large, running off the right edge, with the copy beneath. */
  | { kind: "lead"; feature: Feature }
  /**
   * Two visuals stacked like windows on a desk, captioned side by side.
   * `extra` adds caption-only features to the same row.
   */
  | {
      kind: "overlap";
      back: Feature;
      front: Feature;
      extra?: Feature[];
      /** md+ bottom padding, so the front panel has room to hang below the back one. */
      boxClass?: string;
      /** md+ width of the back panel. */
      backClass: string;
      /** md+ position and width of the front panel. */
      frontClass: string;
    }
  /** Two screenshots side by side. */
  | { kind: "pair"; features: [Feature, Feature] }
  /** Copy on the left, a wide screenshot on the right. */
  | { kind: "split"; feature: Feature };

interface Group {
  id: string;
  label: string;
  title: string;
  intro: string;
  link?: React.ComponentProps<typeof SectionIntro>["link"];
  showcase: Showcase[];
  /** Features without a visual, in the hairline grid. */
  grid: Feature[];
}

const shot = (name: string, width: number, height: number, alt: string, focus?: number): Shot => ({
  src: `/features/${name}.webp`,
  width,
  height,
  alt,
  focus,
});

/** The config snippet from the MCP docs, line by line, with the string value picked out. */
const MCP_CONFIG: { code: string; value?: string }[] = [
  { code: "{" },
  { code: '  "mcpServers": {' },
  { code: '    "stroke": {' },
  { code: '      "url": ', value: '"http://127.0.0.1:4319/mcp"' },
  { code: "    }" },
  { code: "  }" },
  { code: "}" },
];

/** The MCP config Stroke hands you, as it looks in Claude Desktop's config file. */
function McpConfigMock() {
  return (
    <div className="mono-shot font-mono text-[11px] leading-[1.8] sm:text-[12px] md:text-[14px]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3 text-[11px] text-muted-foreground md:px-5 md:text-[12px]">
        <FileJsonIcon className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
        claude_desktop_config.json
      </div>
      <pre className="overflow-hidden px-4 py-4 text-soft md:px-5 md:py-6">
        <code>
          {MCP_CONFIG.map((line, i) => (
            <span key={i} className="flex">
              <span aria-hidden="true" className="mr-5 w-4 shrink-0 text-right text-faint">
                {i + 1}
              </span>
              <span className="whitespace-pre">
                {line.code}
                {line.value && <span className="text-[#8fd3a8]">{line.value}</span>}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

const GROUPS: Group[] = [
  {
    id: "data",
    label: "Data",
    title: "Browse, edit, and inspect every row",
    intro:
      "The grid never gets in the way. A million-row table opens as fast as a ten-row one, and every edit waits for your review before it lands.",
    showcase: [
      {
        kind: "lead",
        feature: {
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
      },
      {
        kind: "overlap",
        boxClass: "md:pb-[11%]",
        backClass: "md:w-[76%]",
        frontClass: "md:left-[56%] md:top-[12%] md:w-[42%]",
        back: {
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
        front: {
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
      },
      {
        kind: "pair",
        features: [
          {
            icon: MousePointerClickIcon,
            title: "Everything is a right-click away",
            desc: "Filter by a value or exclude it, set NULL, expand, duplicate, or copy a row as JSON, CSV, Markdown, plain text, or an INSERT statement.",
            shot: shot(
              "context-menu",
              864,
              715,
              "The cell context menu with the Filter submenu open",
            ),
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
        ],
      },
      {
        kind: "split",
        feature: {
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
      },
    ],
    grid: [
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
    title: "Write SQL, and keep it",
    intro:
      "A schema-aware editor that saves everything you run, notebooks for the analysis you hand to someone else, and codegen that turns the schema back into code.",
    showcase: [
      {
        kind: "lead",
        feature: {
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
      },
    ],
    grid: [
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
    title: "See the whole structure, and how it changes",
    intro:
      "Browse every object, walk foreign keys row by row, draw the schema, and see exactly what changed between any two snapshots.",
    showcase: [
      {
        kind: "lead",
        feature: {
          icon: NetworkIcon,
          title: "ER diagrams",
          desc: "Entity-relationship diagrams drawn from the live schema, and five more ways to read the same structure.",
          points: [
            "Primary and foreign keys marked, with 1:N and 1:1 links",
            "Zoom and a minimap",
            "Draw the schema six ways: diagram, hierarchy, Mermaid, tree, data dictionary, and DDL",
          ],
          link: { label: "See it live", to: "/", hash: "schema" },
          shot: shot(
            "view-erd",
            1472,
            1040,
            "An ER diagram linking invoice_item to invoice and item by foreign keys",
          ),
        },
      },
    ],
    grid: [
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
    title: "Results you can see at a glance",
    intro:
      "Turn any query result into a chart, draw every PostGIS layer on a map, and pin the views you keep to a dashboard.",
    showcase: [
      {
        kind: "overlap",
        backClass: "md:w-[70%]",
        frontClass: "md:left-[44%] md:top-[22%] md:w-[52%]",
        back: {
          icon: ChartLineIcon,
          title: "Charts",
          desc: "Turn any query result into a bar, line, area, step, or pie chart, or a geographic choropleth map.",
          shot: shot(
            "view-chart",
            1472,
            1040,
            "An area chart of amount over time across 1,000 rows",
          ),
        },
        front: {
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
        extra: [
          {
            icon: LayoutDashboardIcon,
            title: "Dashboards",
            desc: "Pin charts and saved views to a dashboard you can come back to any time.",
          },
        ],
      },
    ],
    grid: [],
  },
  {
    id: "operate",
    label: "Operate",
    title: "Security, health, and backups",
    intro:
      "See who can read or write what, what the server is doing right now, and every statement that ran. Back up, restore, and browse production read-only.",
    showcase: [],
    grid: [
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
    title: "An assistant that knows your schema",
    intro:
      "Ask in plain language and the AI chat runs the queries. The built-in MCP server opens the same door to the agents you already use.",
    link: { to: "/docs/mcp", label: "Connect an agent" },
    showcase: [
      {
        kind: "overlap",
        backClass: "md:w-[66%]",
        frontClass: "md:left-[50%] md:top-[34%] md:w-[46%]",
        back: {
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
            0.5,
          ),
        },
        front: {
          icon: PlugIcon,
          title: "Built-in MCP server",
          desc: "Start it in Settings, copy the config, and Claude, Cursor, or any MCP client can query your database. A stable token means you configure it once.",
          mock: <McpConfigMock />,
        },
      },
    ],
    grid: [],
  },
  {
    id: "workflow",
    label: "Keyboard and workflow",
    title: "Every feature, without a mouse",
    intro:
      "A command palette, a shortcut for every core view, split panes, and an optional Vim mode. Every feature is reachable from the keyboard.",
    showcase: [
      {
        kind: "lead",
        feature: {
          icon: CommandIcon,
          title: "Command palette",
          desc: "Press Cmd/Ctrl+K and type a table, a feature, or a shortcut to jump there.",
          shot: shot(
            "command-palette",
            1920,
            1080,
            "The command palette listing views with their keyboard shortcuts",
            0.5,
          ),
        },
      },
    ],
    grid: [
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

function showcaseFeatures(s: Showcase): Feature[] {
  switch (s.kind) {
    case "lead":
    case "split":
      return [s.feature];
    case "overlap":
      return [s.back, s.front, ...(s.extra ?? [])];
    case "pair":
      return s.features;
  }
}

const TOTAL = GROUPS.reduce(
  (n, g) => n + g.grid.length + g.showcase.flatMap(showcaseFeatures).length,
  0,
);

/** Visuals that run past the content column toward the window edge. */
const BLEED = "-mr-6 md:-mr-8 xl:-mr-24";

/**
 * A feature's visual: its screenshot (click to zoom) or its coded mockup.
 * A screenshot never shows smaller than `scale` times its pixel size, so on a
 * narrow frame it crops (around its `focus`) rather than shrinking to
 * unreadable; on a wide frame it simply fills the width.
 */
function Visual({ feature, scale = 0.45 }: { feature: Feature; scale?: number }) {
  if (!feature.shot) return feature.mock;
  const min = `max(100%, ${Math.round(feature.shot.width * scale)}px)`;
  return (
    <div
      style={{
        width: min,
        marginLeft: feature.shot.focus
          ? `calc((100% - ${min}) * ${feature.shot.focus})`
          : undefined,
      }}
    >
      <FeatureShot flush {...feature.shot} />
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 rounded-full bg-white/[0.08] px-1.5 py-px text-[11px] font-[510] text-soft">
      {children}
    </span>
  );
}

/** Short points under a description, each behind a small dash. */
function Points({ points, className }: { points: string[]; className?: string }) {
  return (
    <ul className={cn("space-y-2 text-[14px] leading-[1.55] text-muted-foreground", className)}>
      {points.map((point) => (
        <li key={point} className="flex gap-3">
          <span aria-hidden="true" className="mt-[0.7em] h-px w-2.5 shrink-0 bg-faint" />
          <span className="text-pretty">{point}</span>
        </li>
      ))}
    </ul>
  );
}

/** Icon, title, description, and any points: the copy for one feature. */
function FeatureText({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <>
      <Icon className="size-[18px] text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
      <h3 className="mt-5 text-[15px] font-[560] tracking-[-0.01em] text-foreground">
        {feature.title}
        {feature.tag && <Tag>{feature.tag}</Tag>}
      </h3>
      <p className="mt-2 max-w-prose text-[15px] leading-[1.6] text-pretty text-muted-foreground">
        {feature.desc}
      </p>
      {feature.points && <Points points={feature.points} className="mt-5" />}
    </>
  );
}

/**
 * Rows of 3 where they fit, 2 where they don't, so the hairline grid never
 * ends in a ragged row: 4 → 2+2, 5 → 2+3, 7 → 2+2+3.
 */
function rowLengths(n: number): number[] {
  if (n <= 3) return n ? [n] : [];
  const twos = n % 3 === 1 ? 2 : n % 3 === 2 ? 1 : 0;
  return [...Array<number>(twos).fill(2), ...Array<number>((n - twos * 2) / 3).fill(3)];
}

/**
 * Features as a dense grid ruled by 1px hairlines rather than boxed in cards.
 * One column on phones, two on tablets, rows of two or three on desktop
 * (a six-track grid, so a row of two and a row of three both fill it).
 */
function FeatureGrid({ features, className }: { features: Feature[]; className?: string }) {
  if (!features.length) return null;
  const cells = rowLengths(features.length).flatMap((len) =>
    Array.from({ length: len }, (_, pos) => ({ len, pos })),
  );

  return (
    <div
      className={cn(
        "grid grid-cols-1 border-b border-border sm:grid-cols-2 lg:grid-cols-6",
        className,
      )}
    >
      {features.map((feature, i) => {
        const { len, pos } = cells[i];
        const smRight = i % 2 === 1;
        const smFull = i % 2 === 0 && i === features.length - 1;
        return (
          <article
            key={feature.title}
            className={cn(
              "border-t border-border py-8 md:py-10",
              // Tablet: two columns, a lone last card spans both.
              smFull ? "sm:col-span-2" : smRight ? "sm:border-l sm:pl-8" : "sm:pr-8",
              // Desktop: rows of two or three, ruled between columns.
              len === 3 ? "lg:col-span-2" : len === 2 ? "lg:col-span-3" : "lg:col-span-6",
              pos > 0 ? "lg:border-l lg:pl-8" : "lg:border-l-0 lg:pl-0",
              pos < len - 1 ? "lg:pr-8" : "lg:pr-0",
            )}
          >
            <FeatureText feature={feature} />
          </article>
        );
      })}
    </div>
  );
}

/**
 * One screenshot shown large, with its copy in two columns underneath: the
 * title and description, then the points as a ruled list. Without points, the
 * description moves to the right column instead.
 */
function Lead({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  const desc = (
    <>
      <p
        className={cn(
          "text-[16px] leading-[1.6] text-pretty text-soft md:text-[17px]",
          feature.points ? "mt-3" : "md:pt-11",
        )}
      >
        {feature.desc}
      </p>
      {feature.link && (
        <ArrowLink to={feature.link.to} hash={feature.link.hash} className="mt-6">
          {feature.link.label}
        </ArrowLink>
      )}
    </>
  );

  return (
    <div>
      <Panel
        className={cn(
          BLEED,
          "max-h-[340px] mask-r-from-80% mask-b-from-60% sm:max-h-[480px] lg:max-h-[620px]",
        )}
      >
        <Visual feature={feature} scale={0.5} />
      </Panel>
      <div className="mt-10 grid grid-cols-1 gap-x-16 gap-y-4 md:mt-14 md:grid-cols-2 lg:gap-x-24">
        <div>
          <Icon className="size-5 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
          <h3 className="mt-5 text-2xl leading-[1.15] font-[560] tracking-[-0.025em] md:text-[1.75rem]">
            {feature.title}
            {feature.tag && <Tag>{feature.tag}</Tag>}
          </h3>
          {feature.points && desc}
        </div>
        {feature.points ? (
          <ul className="mt-4 border-b border-border text-[15px] leading-[1.55] text-muted-foreground md:mt-1">
            {feature.points.map((point) => (
              <li key={point} className="border-t border-border py-3.5 text-pretty">
                {point}
              </li>
            ))}
          </ul>
        ) : (
          <div>{desc}</div>
        )}
      </div>
    </div>
  );
}

/**
 * Two visuals overlapping like windows on a desk, fading out at the bottom,
 * then their copy (and any caption-only extras) in one ruled row. Phones
 * stack them with a smaller overlap.
 */
function Overlap({ s }: { s: Extract<Showcase, { kind: "overlap" }> }) {
  return (
    <div>
      <div className={cn(BLEED, "relative mask-b-from-70% pb-6", s.boxClass ?? "md:pb-[3%]")}>
        <Panel className={cn("w-[92%] max-md:max-h-[300px]", s.backClass)}>
          <Visual feature={s.back} />
        </Panel>
        <Panel
          className={cn(
            "relative -mt-[18%] ml-auto w-[72%] shadow-[0_1px_0_0_rgb(255_255_255/0.06)_inset,0_32px_80px_-8px_rgb(0_0_0/0.85)] max-md:max-h-[300px] md:absolute md:mt-0 md:ml-0",
            // A coded mockup is text; give it the room to stay legible on a phone.
            !s.front.shot && "max-md:w-[94%]",
            s.frontClass,
          )}
        >
          <Visual feature={s.front} />
        </Panel>
      </div>
      <FeatureGrid features={[s.back, s.front, ...(s.extra ?? [])]} className="mt-10 md:mt-14" />
    </div>
  );
}

/** Two screenshots side by side, cropped to the same frame, each over its copy. */
function Pair({ features }: { features: [Feature, Feature] }) {
  return (
    <div className="grid grid-cols-1 gap-x-16 gap-y-16 sm:grid-cols-2">
      {features.map((feature) => (
        <article key={feature.title}>
          <Panel className="aspect-[10/7] mask-b-from-70%">
            <Visual feature={feature} scale={0.6} />
          </Panel>
          <div className="mt-8 md:mt-10">
            <FeatureText feature={feature} />
          </div>
        </article>
      ))}
    </div>
  );
}

/** Copy on the left, and a wide screenshot running off the right edge. */
function Split({ feature }: { feature: Feature }) {
  return (
    <article className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
      <div>
        <FeatureText feature={feature} />
      </div>
      <Panel className={cn(BLEED, "mask-r-from-70% mask-b-from-80% max-lg:order-first")}>
        <Visual feature={feature} scale={0.7} />
      </Panel>
    </article>
  );
}

function ShowcaseBlock({ s }: { s: Showcase }) {
  switch (s.kind) {
    case "lead":
      return <Lead feature={s.feature} />;
    case "overlap":
      return <Overlap s={s} />;
    case "pair":
      return <Pair features={s.features} />;
    case "split":
      return <Split feature={s.feature} />;
  }
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The group index under the site header. It stays put while you scroll and
 * highlights the group crossing a line 30% down the window. Nothing is
 * highlighted on the server or above the first group.
 */
function GroupNav() {
  const [active, setActive] = useState<string | null>(null);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const crossing = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id);
          else crossing.delete(entry.target.id);
        }
        setActive(GROUPS.find((g) => crossing.has(g.id))?.id ?? null);
      },
      { rootMargin: "-30% 0px -69% 0px" },
    );
    for (const g of GROUPS) {
      const el = document.getElementById(g.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  // On a narrow screen the strip scrolls sideways; keep the current group in view.
  useEffect(() => {
    const ul = list.current;
    const link = active ? ul?.querySelector<HTMLElement>(`a[href="#${active}"]`) : null;
    if (!ul || !link || ul.scrollWidth <= ul.clientWidth) return;
    ul.scrollTo({
      left: link.offsetLeft - 12,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [active]);

  return (
    <nav
      aria-label="Feature groups"
      className="sticky top-16 z-30 border-y border-border bg-background/80 backdrop-blur-xl backdrop-saturate-150"
    >
      <div className={cn(WRAP, "max-md:px-0")}>
        <ul
          ref={list}
          className="relative flex [scrollbar-width:none] overflow-x-auto max-md:mask-r-from-85% max-md:px-3 md:-ml-3 [&::-webkit-scrollbar]:hidden"
        >
          {GROUPS.map((g) => {
            const current = active === g.id;
            return (
              <li key={g.id} className="shrink-0">
                <a
                  href={`#${g.id}`}
                  aria-current={current ? "location" : undefined}
                  onClick={() => setActive(g.id)}
                  className={cn(
                    "relative flex h-11 items-center rounded-md px-3 text-[13px] whitespace-nowrap transition-colors duration-150 outline-none focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    current ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {g.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-3 bottom-0 h-px bg-foreground transition-opacity duration-200",
                      current ? "opacity-100" : "opacity-0",
                    )}
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

function FeaturesPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Features"
        title="Everything you need to work with data"
        description={`${TOTAL} features in one native app for exploring, querying, and running every database you have, with an AI chat and an MCP server so your agents can work alongside you.`}
        actions={
          <>
            <SmartDownloadButton
              size="lg"
              variant="default"
              alternates={false}
              className={siteButton({ size: "lg" })}
            />
            <Link to="/docs" className={siteButton({ variant: "secondary", size: "lg" })}>
              Read the docs
            </Link>
          </>
        }
      />

      <GroupNav />

      {GROUPS.map((group, i) => (
        <Section
          key={group.id}
          id={group.id}
          border={i > 0}
          // html's scroll-padding clears the header alone, and the band's own top
          // padding is generous; pull a jump up so the eyebrow lands just under
          // the header and this nav.
          className="-scroll-mt-4 overflow-x-clip md:-scroll-mt-12"
        >
          <SectionIntro
            index={`${i + 1}.0`}
            eyebrow={group.label}
            title={group.title}
            link={group.link}
          >
            <p>{group.intro}</p>
          </SectionIntro>

          {group.showcase.length > 0 && (
            <div className="mt-16 space-y-24 md:mt-24 md:space-y-32">
              {group.showcase.map((s, j) => (
                <ShowcaseBlock key={j} s={s} />
              ))}
            </div>
          )}

          <FeatureGrid
            features={group.grid}
            className={group.showcase.length ? "mt-24 md:mt-32" : "mt-16 md:mt-24"}
          />
        </Section>
      ))}

      <Section inner="text-center">
        <h2 className="mx-auto max-w-2xl text-[2.5rem] leading-[1.04] font-[560] tracking-[-0.035em] text-balance sm:text-5xl">
          Try it on your own database
        </h2>
        <p className="mt-5 text-[17px] text-soft">
          Free to download. $9.99 once, whenever you decide to keep it.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <SmartDownloadButton
            size="lg"
            variant="default"
            alternates={false}
            className={siteButton({ size: "lg" })}
          />
          <Link to="/pricing" className={siteButton({ variant: "secondary", size: "lg" })}>
            See pricing
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}
