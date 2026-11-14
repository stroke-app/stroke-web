import {
  SiApachecassandra,
  SiApachecouchdb,
  SiClickhouse,
  SiCloudflare,
  SiCockroachlabs,
  SiDuckdb,
  SiElasticsearch,
  SiFirebase,
  SiMariadb,
  SiMongodb,
  SiMysql,
  SiOpensearch,
  SiPostgresql,
  SiPosthog,
  SiRedis,
  SiSqlite,
  SiTurso,
} from "@icons-pack/react-simple-icons";
import { DatabaseIcon } from "lucide-react";

/**
 * Every engine Stroke opens, in one place: the home page's wall of logos,
 * /databases and its per-engine pages, the comparison table and the roadmap
 * all read this. Claims here are what the app does today; anything not yet
 * shipped is `status: "soon"`.
 */

export type EngineCategory = "relational" | "document" | "key-value" | "analytics" | "search";
export type EngineStatus = "stable" | "beta" | "soon";

export interface Engine {
  slug: string;
  name: string;
  Icon: React.ElementType;
  color: string;
  category: EngineCategory;
  status: EngineStatus;
  /** What people search for: "PostgreSQL GUI", "Oracle client for Mac". */
  searchTitle: string;
  /** One sentence for the card and the meta description. */
  summary: string;
  /** What Stroke does with this engine, specifically. */
  highlights: string[];
  /** How to connect: the URL to paste, the provider, the Docker image. */
  connect: string[];
}

export const CATEGORY_LABEL: Record<EngineCategory, string> = {
  relational: "Relational",
  document: "Document",
  "key-value": "Key-value",
  analytics: "Analytics",
  search: "Search",
};

const RELATIONAL_BASE = [
  "Browse schemas and tables with row counts, then edit cells, insert and delete rows with a review of the SQL first",
  "A SQL editor with completion from your schema, formatting, history and saved queries",
  "Schema diagrams, EXPLAIN plans and a terminal tab running the engine's own CLI",
];

export const ENGINES: Engine[] = [
  {
    slug: "postgresql",
    name: "PostgreSQL",
    Icon: SiPostgresql,
    color: "#699eca",
    category: "relational",
    status: "stable",
    searchTitle: "PostgreSQL GUI client for Mac, Windows and Linux",
    summary:
      "A fast, native PostgreSQL client: browse, edit and query Postgres with an AI that knows your schema.",
    highlights: [
      ...RELATIONAL_BASE,
      "Row-level security, roles and grants, extensions, sequences and triggers in their own pages",
      "Backup and restore with pg_dump and pg_restore, with progress and a report of what failed",
    ],
    connect: [
      "Paste a postgresql:// URL, a .env line or a host=… dbname=… string",
      "Sign in to Neon, Supabase, Prisma Postgres, Nile or Railway and pick a database",
      "Start postgres:17, pgvector, PostGIS or TimescaleDB in Docker from ⌘K",
    ],
  },
  {
    slug: "mysql",
    name: "MySQL",
    Icon: SiMysql,
    color: "#4f9fd3",
    category: "relational",
    status: "stable",
    searchTitle: "MySQL GUI client for Mac, Windows and Linux",
    summary:
      "A native MySQL client with a schema-aware SQL editor, inline editing and an AI that writes MySQL, not Postgres.",
    highlights: [
      ...RELATIONAL_BASE,
      "PlanetScale and TiDB Cloud connections with their own sign-in",
    ],
    connect: [
      "Paste a mysql:// URL",
      "Sign in to PlanetScale or TiDB Cloud",
      "Start mysql:8.4 in Docker from ⌘K",
    ],
  },
  {
    slug: "mariadb",
    name: "MariaDB",
    Icon: SiMariadb,
    color: "#c0765a",
    category: "relational",
    status: "stable",
    searchTitle: "MariaDB GUI client",
    summary:
      "MariaDB with the same editor, grid and AI as MySQL, and its own client in the terminal tab.",
    highlights: RELATIONAL_BASE,
    connect: ["Paste a mariadb:// or mysql:// URL", "Start mariadb:11 in Docker from ⌘K"],
  },
  {
    slug: "sqlite",
    name: "SQLite",
    Icon: SiSqlite,
    color: "#44a8e0",
    category: "relational",
    status: "stable",
    searchTitle: "SQLite browser and editor for Mac, Windows and Linux",
    summary: "Open a .db file and browse, edit and query it, with no server and no setup.",
    highlights: [...RELATIONAL_BASE, "Drop a file on the window or paste its path"],
    connect: [
      "Paste a path to a .db, .sqlite or .sqlite3 file",
      "Or an in-memory database to try things out",
    ],
  },
  {
    slug: "sql-server",
    name: "SQL Server",
    Icon: DatabaseIcon,
    color: "#e2574c",
    category: "relational",
    status: "stable",
    searchTitle: "SQL Server client for Mac and Linux",
    summary:
      "Microsoft SQL Server on any OS: browse, edit and query T-SQL, with sqlcmd in the terminal tab.",
    highlights: RELATIONAL_BASE,
    connect: [
      "Paste a sqlserver:// URL, a JDBC string or an ADO.NET Server=…;Database=… string",
      "Start SQL Server 2022 in Docker from ⌘K",
    ],
  },
  {
    slug: "oracle",
    name: "Oracle",
    Icon: DatabaseIcon,
    color: "#c74634",
    category: "relational",
    status: "stable",
    searchTitle: "Oracle Database client for Mac, Windows and Linux",
    summary:
      "Oracle 12c and later by service name, SID or Easy Connect string, with SQL and PL/SQL in the editor.",
    highlights: [
      "Browse schemas with Oracle's own objects kept out of the way",
      "Run SQL and PL/SQL scripts, with Stop that interrupts the running statement",
      "Edit, insert and delete rows on tables with a primary key",
      "SQL*Plus or SQLcl in the terminal tab",
    ],
    connect: [
      "Host, port and service name (FREEPDB1, XEPDB1…), a SID, or an oracle:// / jdbc:oracle:thin: string",
      "Needs Oracle Instant Client, a free download; Stroke finds it in the usual folders",
      "Start Oracle Database Free in Docker from ⌘K",
    ],
  },
  {
    slug: "cockroachdb",
    name: "CockroachDB",
    Icon: SiCockroachlabs,
    color: "#8b6bff",
    category: "relational",
    status: "stable",
    searchTitle: "CockroachDB GUI client",
    summary: "CockroachDB over the Postgres protocol, with the full editor and grid.",
    highlights: RELATIONAL_BASE,
    connect: [
      "Paste a postgresql:// URL with port 26257",
      "Start a single-node CockroachDB in Docker from ⌘K",
    ],
  },
  {
    slug: "duckdb",
    name: "DuckDB",
    Icon: SiDuckdb,
    color: "#fff000",
    category: "analytics",
    status: "stable",
    searchTitle: "DuckDB GUI and SQL editor",
    summary: "Open a .duckdb file and run analytics SQL locally, with charts from the results.",
    highlights: [
      "Browse tables and views",
      "A SQL editor with completion and charts from any result",
    ],
    connect: ["Paste a path to a .duckdb file"],
  },
  {
    slug: "clickhouse",
    name: "ClickHouse",
    Icon: SiClickhouse,
    color: "#ffcc01",
    category: "analytics",
    status: "stable",
    searchTitle: "ClickHouse GUI client",
    summary: "ClickHouse over HTTP: browse tables, run analytics queries and chart the results.",
    highlights: [
      "Row counts from system tables, not full scans",
      "Charts and dashboards from query results",
    ],
    connect: ["Paste an http(s):// URL on port 8123 or 8443", "Start ClickHouse in Docker from ⌘K"],
  },
  {
    slug: "turso",
    name: "Turso / libSQL",
    Icon: SiTurso,
    color: "#4ff8d2",
    category: "relational",
    status: "stable",
    searchTitle: "Turso and libSQL GUI client",
    summary: "Turso databases and self-hosted libSQL servers, with the SQLite editor and grid.",
    highlights: ["Sign in to Turso and pick a database", "The Turso CLI in the terminal tab"],
    connect: [
      "Paste a libsql:// URL with its auth token",
      "Start a libSQL server in Docker from ⌘K",
    ],
  },
  {
    slug: "cloudflare-d1",
    name: "Cloudflare D1",
    Icon: SiCloudflare,
    color: "#f38020",
    category: "relational",
    status: "stable",
    searchTitle: "Cloudflare D1 GUI client",
    summary:
      "Sign in with Cloudflare and browse, edit and query every D1 database on your account.",
    highlights: [
      "Create a D1 database from the app",
      "Switch between databases from the status bar",
    ],
    connect: ["Sign in with Cloudflare; no keys to copy"],
  },
  {
    slug: "redis",
    name: "Redis",
    Icon: SiRedis,
    color: "#ff4438",
    category: "key-value",
    status: "stable",
    searchTitle: "Redis GUI client for Mac, Windows and Linux",
    summary:
      "A Redis keys table with staged edits, plus server overview, slow log, clients and pub/sub.",
    highlights: [
      "Browse keys by pattern with type, TTL and size",
      "Edit strings, hashes, lists, sets and sorted sets, applied together",
      "redis-cli in the terminal tab",
    ],
    connect: [
      "Paste a redis:// or rediss:// URL",
      "Sign in to Upstash",
      "Start Redis 7 in Docker from ⌘K",
    ],
  },
  {
    slug: "valkey",
    name: "Valkey",
    Icon: DatabaseIcon,
    color: "#6983ff",
    category: "key-value",
    status: "stable",
    searchTitle: "Valkey GUI client",
    summary: "Valkey with everything the Redis support has.",
    highlights: ["The same keys table, editors and server pages as Redis"],
    connect: ["Paste a valkey:// or redis:// URL", "Start Valkey 8 in Docker from ⌘K"],
  },
  {
    slug: "mongodb",
    name: "MongoDB",
    Icon: SiMongodb,
    color: "#47a248",
    category: "document",
    status: "stable",
    searchTitle: "MongoDB GUI client for Mac, Windows and Linux",
    summary:
      "Browse collections, open and edit documents, and run queries, with mongosh in the terminal tab.",
    highlights: ["A document browser with filtering and paging", "Edit and save documents as JSON"],
    connect: [
      "Paste a mongodb:// or mongodb+srv:// URL, Atlas included",
      "Start MongoDB 8 in Docker from ⌘K",
    ],
  },
  {
    slug: "couchdb",
    name: "CouchDB",
    Icon: SiApachecouchdb,
    color: "#e42528",
    category: "document",
    status: "stable",
    searchTitle: "CouchDB GUI client",
    summary: "Browse CouchDB databases and documents and edit them in place.",
    highlights: ["The same document browser as MongoDB"],
    connect: ["Paste the server URL", "Start CouchDB 3 in Docker from ⌘K"],
  },
  {
    slug: "cassandra",
    name: "Cassandra",
    Icon: SiApachecassandra,
    color: "#1287b1",
    category: "document",
    status: "stable",
    searchTitle: "Cassandra and ScyllaDB GUI client",
    summary: "Cassandra and ScyllaDB over CQL: browse keyspaces and tables and run CQL.",
    highlights: ["Keyspaces and tables in the sidebar", "CQL in the editor"],
    connect: [
      "Paste a cassandra:// URL with its contact points",
      "Start Cassandra 5 in Docker from ⌘K",
    ],
  },
  {
    slug: "dynamodb",
    name: "DynamoDB",
    Icon: DatabaseIcon,
    color: "#4053d6",
    category: "key-value",
    status: "stable",
    searchTitle: "DynamoDB GUI client",
    summary: "AWS DynamoDB and DynamoDB Local: browse tables and items and query with PartiQL.",
    highlights: ["Uses your AWS profile or keys", "PartiQL in the editor"],
    connect: [
      "An AWS profile, keys, or a local endpoint",
      "Start DynamoDB Local in Docker from ⌘K",
    ],
  },
  {
    slug: "firestore",
    name: "Firestore",
    Icon: SiFirebase,
    color: "#ffa000",
    category: "document",
    status: "stable",
    searchTitle: "Firestore GUI client",
    summary: "Browse Firestore collections and documents, or point Stroke at the emulator.",
    highlights: ["The same document browser as MongoDB"],
    connect: ["A service account key, or the emulator host"],
  },
  {
    slug: "posthog",
    name: "PostHog",
    Icon: SiPosthog,
    color: "#f9bd2b",
    category: "analytics",
    status: "stable",
    searchTitle: "Query PostHog with SQL",
    summary: "Run HogQL against your PostHog project and chart the results.",
    highlights: ["Read-only by design"],
    connect: ["A personal API key and a project"],
  },
  {
    slug: "elasticsearch",
    name: "Elasticsearch",
    Icon: SiElasticsearch,
    color: "#00bfb3",
    category: "search",
    status: "soon",
    searchTitle: "Elasticsearch GUI client",
    summary: "Browse indices and documents and run queries. Being built now.",
    highlights: ["Indices with their mappings as columns", "Query DSL and SQL in the editor"],
    connect: ["The cluster URL with an API key or user and password"],
  },
  {
    slug: "opensearch",
    name: "OpenSearch",
    Icon: SiOpensearch,
    color: "#005eb8",
    category: "search",
    status: "soon",
    searchTitle: "OpenSearch GUI client",
    summary: "OpenSearch with everything the Elasticsearch support has. Being built now.",
    highlights: ["Indices, mappings and documents", "Query DSL and SQL in the editor"],
    connect: ["The cluster URL with its credentials"],
  },
];

export function engineBySlug(slug: string) {
  return ENGINES.find((e) => e.slug === slug) ?? null;
}

export const SHIPPED_ENGINES = ENGINES.filter((e) => e.status !== "soon");
