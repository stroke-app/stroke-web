import {
  SiApachecassandra,
  SiApachecouchdb,
  SiClickhouse,
  SiCloudflare,
  SiCockroachlabs,
  SiDuckdb,
  SiElasticsearch,
  SiApachehive,
  SiDatabricks,
  SiFirebase,
  SiGooglebigquery,
  SiGooglecloudspanner,
  SiMariadb,
  SiMongodb,
  SiMysql,
  SiOpensearch,
  SiPostgresql,
  SiPosthog,
  SiRedis,
  SiSap,
  SiSqlite,
  SiTeradata,
  SiTrino,
  SiTurso,
} from "@icons-pack/react-simple-icons";
import { CableIcon, DatabaseIcon } from "lucide-react";

/**
 * Every engine Stroke opens, in one place: the home page's wall of logos,
 * /databases and its per-engine pages, the comparison table and the roadmap
 * all read this. Claims here are what the app does today; anything not yet
 * shipped is `status: "soon"`.
 */

export type EngineCategory =
  | "relational"
  | "document"
  | "key-value"
  | "analytics"
  | "search"
  | "odbc";
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
  /** Reached through the ODBC bridge with the vendor's driver, not built in. */
  via?: "odbc";
}

export const CATEGORY_LABEL: Record<EngineCategory, string> = {
  relational: "Relational",
  document: "Document",
  "key-value": "Key-value",
  analytics: "Analytics",
  search: "Search",
  odbc: "Through ODBC",
};

const RELATIONAL_BASE = [
  "Browse schemas and tables with row counts, then edit cells, insert and delete rows with a review of the SQL first",
  "A SQL editor with completion from your schema, formatting, history and saved queries",
  "Schema diagrams, EXPLAIN plans and a terminal tab running the engine's own CLI",
];

const ODBC_BASE = [
  "Schemas, tables, columns, primary and foreign keys from the driver's catalog",
  "Browse, filter, sort and edit rows by primary key, with values bound as parameters",
  "A SQL editor whose results stream in as they arrive, and a Stop that cancels on the server",
];

interface OdbcPresetPage {
  slug: string;
  name: string;
  Icon: React.ElementType;
  color: string;
  vendor: string;
  driver: string;
  fields: string;
}

/** Engines with a preset in the app's ODBC form. */
const ODBC_PRESETS: OdbcPresetPage[] = [
  {
    slug: "db2",
    name: "IBM Db2",
    Icon: DatabaseIcon,
    color: "#0f62fe",
    vendor: "IBM",
    driver: "IBM Data Server Driver for ODBC and CLI",
    fields: "host, port and database",
  },
  {
    slug: "sap-hana",
    name: "SAP HANA",
    Icon: SiSap,
    color: "#0faaff",
    vendor: "SAP",
    driver: "the HANA client (HDBODBC)",
    fields: "host, port and tenant database; HANA Cloud's port turns on TLS",
  },
  {
    slug: "sap-ase",
    name: "SAP ASE (Sybase)",
    Icon: SiSap,
    color: "#0faaff",
    vendor: "SAP",
    driver: "SAP's ASE ODBC driver or FreeTDS",
    fields: "host, port and database",
  },
  {
    slug: "informix",
    name: "Informix",
    Icon: DatabaseIcon,
    color: "#0f62fe",
    vendor: "IBM",
    driver: "the Informix Client SDK",
    fields: "host, port, server name and database",
  },
  {
    slug: "teradata",
    name: "Teradata",
    Icon: SiTeradata,
    color: "#f37440",
    vendor: "Teradata",
    driver: "the Teradata ODBC driver",
    fields: "host and default database",
  },
  {
    slug: "vertica",
    name: "Vertica",
    Icon: DatabaseIcon,
    color: "#5b6ee1",
    vendor: "OpenText",
    driver: "the Vertica client drivers",
    fields: "host, port and database",
  },
  {
    slug: "exasol",
    name: "Exasol",
    Icon: DatabaseIcon,
    color: "#21a685",
    vendor: "Exasol",
    driver: "the Exasol ODBC driver",
    fields: "host, port and certificate fingerprint",
  },
  {
    slug: "firebird",
    name: "Firebird",
    Icon: DatabaseIcon,
    color: "#e2552a",
    vendor: "the Firebird project",
    driver: "the Firebird ODBC driver",
    fields: "host, port and database file or alias",
  },
  {
    slug: "redshift",
    name: "Amazon Redshift",
    Icon: DatabaseIcon,
    color: "#8c4fff",
    vendor: "AWS",
    driver: "the Amazon Redshift ODBC driver",
    fields: "endpoint, port and database",
  },
  {
    slug: "databricks",
    name: "Databricks",
    Icon: SiDatabricks,
    color: "#ff3621",
    vendor: "Databricks",
    driver: "the Databricks ODBC driver",
    fields: "host, HTTP path and an access token",
  },
  {
    slug: "hive",
    name: "Apache Hive",
    Icon: SiApachehive,
    color: "#c9a400",
    vendor: "Cloudera",
    driver: "a Hive ODBC driver",
    fields: "host, port and database",
  },
  {
    slug: "trino",
    name: "Trino and Presto",
    Icon: SiTrino,
    color: "#dd00a1",
    vendor: "Starburst",
    driver: "a Trino or Presto ODBC driver",
    fields: "host, port, catalog and schema",
  },
  {
    slug: "dremio",
    name: "Dremio",
    Icon: DatabaseIcon,
    color: "#31b8c9",
    vendor: "Dremio",
    driver: "the Arrow Flight SQL ODBC driver",
    fields: "host and port",
  },
  {
    slug: "intersystems-iris",
    name: "InterSystems IRIS",
    Icon: DatabaseIcon,
    color: "#2f6db5",
    vendor: "InterSystems",
    driver: "the IRIS ODBC driver",
    fields: "host, port and namespace",
  },
  {
    slug: "microsoft-access",
    name: "Microsoft Access",
    Icon: DatabaseIcon,
    color: "#a4373a",
    vendor: "Microsoft",
    driver: "the Access Database Engine on Windows, or MDB Tools",
    fields: "the .mdb or .accdb file",
  },
];

function odbcEngine(p: OdbcPresetPage): Engine {
  return {
    slug: p.slug,
    name: p.name,
    Icon: p.Icon,
    color: p.color,
    category: "odbc",
    status: "beta",
    via: "odbc",
    searchTitle: `${p.name} GUI client for Mac, Windows and Linux`,
    summary: `Browse, edit and query ${p.name} through its ODBC driver, in the same app as your other databases.`,
    highlights: [
      `A ${p.name} preset that picks the installed driver and asks for ${p.fields}`,
      ...ODBC_BASE,
      `Beta: the preset follows ${p.vendor}'s driver documentation and has not yet been run against a live ${p.name}`,
    ],
    connect: [
      `Install ${p.driver}`,
      `Choose ${p.name} under "Through ODBC" and fill in the fields, or pick a data source (DSN)`,
      "Or paste a connection string; the password stays in your OS keychain",
    ],
  };
}

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
    status: "stable",
    searchTitle: "Elasticsearch GUI client for Mac, Windows and Linux",
    summary:
      "Browse indices and documents, run Query DSL, SQL and PPL, and edit documents, from the same app as your SQL databases.",
    highlights: [
      "Indices as a list, their mappings as columns, documents in the grid",
      "A console for Query DSL, with SQL and PPL beside it",
      "Edit and add documents; index deletion and cluster settings stay locked",
      "Agents over MCP get read, write or mapping access by the level you set",
    ],
    connect: [
      "Paste the cluster URL, local or Elastic Cloud",
      "Sign in with an API key, or a user and password",
      "Accept a self-signed certificate for a local cluster",
    ],
  },
  {
    slug: "opensearch",
    name: "OpenSearch",
    Icon: SiOpensearch,
    color: "#005eb8",
    category: "search",
    status: "stable",
    searchTitle: "OpenSearch GUI client for Mac, Windows and Linux",
    summary:
      "Everything the Elasticsearch support does, on OpenSearch: indices, documents, Query DSL, SQL and PPL.",
    highlights: [
      "Indices, mappings and documents in the grid",
      "Query DSL in the console, plus OpenSearch SQL and PPL",
      "Edit and add documents; destructive cluster calls stay locked",
      "Stroke reads the server's answer and talks OpenSearch to it",
    ],
    connect: [
      "Paste the cluster URL with its user and password",
      "Accept the demo certificate of a local OpenSearch",
      "Amazon OpenSearch with its endpoint and credentials",
    ],
  },
  {
    slug: "spanner",
    name: "Google Spanner",
    Icon: SiGooglecloudspanner,
    color: "#4285f4",
    category: "relational",
    status: "beta",
    searchTitle: "Google Cloud Spanner GUI client",
    summary:
      "Browse, edit and query Cloud Spanner databases, GoogleSQL or PostgreSQL dialect, from the same app as everything else.",
    highlights: [
      "Schemas, tables and views with primary keys, foreign keys, indexes and the database's own DDL",
      "Filter, search, sort and edit rows, with every value sent as a typed query parameter",
      "INSERT, UPDATE and DELETE run in a read-write transaction; CREATE, ALTER and DROP as a schema update",
      "Query plans from Spanner's PLAN mode, drawn as a tree, without running the query",
    ],
    connect: [
      "Project, instance and database",
      "Sign in with a service account key, your gcloud login, or point at the emulator",
    ],
  },
  {
    slug: "bigquery",
    name: "Google BigQuery",
    Icon: SiGooglebigquery,
    color: "#669df6",
    category: "analytics",
    status: "beta",
    searchTitle: "BigQuery GUI client and SQL editor",
    summary:
      "Datasets, tables and GoogleSQL in a native window, careful about what you are billed for.",
    highlights: [
      "Paging through a table reads it with tabledata.list, which runs no query and bills nothing",
      "Row counts come from table metadata, and plans are dry runs that say how much a query would read",
      "Stop cancels the query job on BigQuery's side, not just in the window",
      "Results stream page by page, and rows are edited by primary key where a table declares one",
    ],
    connect: [
      "A project ID, with an optional default dataset and location",
      "Sign in with a service account key, your gcloud login, or point at an emulator",
    ],
  },
  {
    slug: "odbc",
    name: "ODBC",
    Icon: CableIcon,
    color: "#8a8f98",
    category: "odbc",
    status: "beta",
    via: "odbc",
    searchTitle: "ODBC database client for Mac, Windows and Linux",
    summary: "Any database with an ODBC driver, through a data source name or a connection string.",
    highlights: [
      "The ODBC driver manager is built into the app; only the database's own driver needs installing",
      "Finds the drivers and data sources already set up on your computer",
      ...ODBC_BASE,
    ],
    connect: [
      "Pick a data source (DSN) from the list",
      "Or paste a connection string; the password stays in your OS keychain",
    ],
  },
  ...ODBC_PRESETS.map(odbcEngine),
];

export function engineBySlug(slug: string) {
  return ENGINES.find((e) => e.slug === slug) ?? null;
}

/** Engines built into the app. The counts on the site are these. */
export const SHIPPED_ENGINES = ENGINES.filter((e) => e.status !== "soon" && !e.via);

/** Engines reached through the ODBC bridge with their vendor's driver. */
export const ODBC_ENGINES = ENGINES.filter((e) => e.via === "odbc");
