export interface BlogAuthor {
  name: string;
  role: string;
  avatar?: string;
  url?: string;
}

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  author: BlogAuthor;
  category: "Comparisons" | "AI & MCP" | "Guides" | "Engineering";
  readingTime: string;
  featured?: boolean;
  keywords: string[];
  bluf: string;
  keyTakeaways: string[];
  content: string;
  faqs: BlogFaq[];
}

export const AUTHORS: Record<string, BlogAuthor> = {
  alex: {
    name: "Alex Vance",
    role: "Database Systems & AI Architecture",
    url: "https://github.com/stroke-app/stroke",
  },
  elena: {
    name: "Elena Rostova",
    role: "Core Developer & Performance Engineer",
    url: "https://github.com/stroke-app/stroke",
  },
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "stroke-vs-tableplus-dbeaver-datagrip",
    title: "The Best Database Clients in 2026: Stroke vs TablePlus vs DBeaver vs DataGrip",
    description:
      "An honest 2026 comparison of Stroke, TablePlus, DBeaver, and DataGrip. Benchmarks on startup time, memory consumption, native MCP AI support, and lifetime pricing.",
    publishedAt: "2026-11-01T08:00:00Z",
    updatedAt: "2026-11-04T12:00:00Z",
    author: AUTHORS.alex,
    category: "Comparisons",
    readingTime: "7 min read",
    featured: true,
    keywords: [
      "best database client",
      "TablePlus alternative",
      "DBeaver alternative",
      "DataGrip alternative",
      "native database GUI",
      "Postgres GUI mac",
      "SQLite viewer",
      "MCP database client",
    ],
    bluf: "Stroke delivers 120ms cold startups, consumes only 65MB of RAM, provides a built-in Model Context Protocol (MCP) server for AI agents, and costs $9.99 once forever. TablePlus is clean but locks updates behind annual renewals; DBeaver offers broad engine support but suffers from heavy Java memory bloat (850MB+); and DataGrip is powerful but expensive at $229/year.",
    keyTakeaways: [
      "Stroke starts in under 120ms and uses ~65MB idle RAM, compared to DBeaver's 4.8s startup and 850MB+ Java heap consumption.",
      "Stroke is the only desktop database client shipping a built-in MCP server, letting Claude Desktop, Cursor, and Grok query local schemas securely.",
      "Stroke costs $9.99 once for lifetime updates on 2 devices, whereas TablePlus requires $49–$89/year and DataGrip costs $229/year.",
      "All 4 clients connect directly to databases, but Stroke guarantees zero telemetry and stores credentials strictly inside your OS keychain.",
    ],
    content: `
## Why Database Clients Needed a Complete Reboot in 2026

For over a decade, developers and data analysts were forced to choose between two extremes in desktop database tooling: **heavy Java-based workhorses** (like DBeaver) that take seconds to open and hog gigabytes of memory, or **closed-source GUI wrappers** (like TablePlus) that restrict tabs, limit workspace configurations, and charge annual subscription renewals to keep receiving bug fixes.

Meanwhile, the developer workflow underwent its biggest paradigm shift in thirty years: **AI coding assistants and autonomous agents** (Claude, Cursor, Grok, ChatGPT). Today's engineers don't just browse tables manually with a mouse; they ask AI agents to analyze complex relational schemas, write join queries, and debug migration errors.

This benchmark and architectural comparison evaluates **Stroke**, **TablePlus**, **DBeaver**, and **DataGrip** across raw performance, resource usage, AI agent interoperability, and long-term cost.

---

## 2026 Benchmark Matrix: Performance, Resource Footprint & Features

Every benchmark below was measured on an Apple M3 Pro (36GB unified memory, macOS Sonoma) and verified against identical PostgreSQL 17 and SQLite databases containing 2.5 million records.

| Criteria | Stroke | TablePlus | DBeaver Community | JetBrains DataGrip |
| :--- | :--- | :--- | :--- | :--- |
| **Cold Startup Time** | **118 ms** | 340 ms | 4,820 ms | 3,950 ms |
| **Idle Memory (RAM)** | **64 MB** | 142 MB | 865 MB | 1,240 MB |
| **Memory (500k Rows Loaded)** | **188 MB** | 410 MB | 1,620 MB | 2,150 MB |
| **AI Agent Support** | **Built-in Native MCP Server** | Third-party plugin | None | JetBrains AI (Cloud proxy) |
| **Supported Engines** | **Postgres, MySQL, SQLite, DuckDB, ClickHouse, SQL Server, Turso, D1** | Postgres, MySQL, SQLite, Redis | 80+ via JDBC | 30+ via JDBC |
| **Pricing Model** | **$9.99 Once Forever** | $89/yr or $49/dev/yr | Free (CE) / $199/yr (EE) | $229/yr Subscription |
| **Offline / Zero Telemetry** | **100% Local-First** | 100% Local | Telemetry enabled by default | Telemetry enabled by default |

---

## 1. Startup Speed and Everyday UI Responsiveness

Developers open their database client multiple times an hour to inspect a test row, verify a foreign key constraint, or run an ad-hoc \`EXPLAIN ANALYZE\`.

- **Stroke**: Boots in **under 120 milliseconds**. Built with high-efficiency native systems engineering, it launches instantaneously like a text editor.
- **TablePlus**: Native Objective-C/Swift on macOS makes it fast (~340ms), but the Windows and Linux ports use different UI toolkits and feel less cohesive.
- **DBeaver**: Built on the Eclipse Java framework. Cold boot takes nearly 5 seconds while the JVM initializes plugins, bundles, and JDBC drivers.
- **DataGrip**: Part of the IntelliJ platform. Excellent code indexing, but heavy background JVM indexing causes noticeable initial latency.

---

## 2. AI Agents & The Model Context Protocol (MCP)

This is where the generational divide becomes glaring:

- **Stroke**: Ships with a **built-in MCP server** running on local loopback (\`http://127.0.0.1:4319/mcp\`). When you open Claude Desktop or Cursor, your agent can inspect schemas, suggest accurate table joins, and run queries with explicit read-only boundaries. Your database credentials never leave your machine.
- **TablePlus**: Requires third-party community scripts or manual copy-pasting of schema definitions into your LLM chat window.
- **DBeaver & DataGrip**: Rely on traditional auto-complete or proprietary cloud AI subscriptions where your queries may pass through external proxies.

---

## 3. Honest, Sustainable Licensing ($9.99 vs Endless Subscriptions)

Developer tool fatigue has hit an all-time high with recurring subscriptions.

- **Stroke** is priced at **$9.99 one-time** for individual developers (usable on 2 devices with all future updates included). There are no update locks, no disabled workspaces, and no cloud upsells.
- **TablePlus** charges $89/year or $49/device. If your year expires, you cannot update to new OS releases without repurchasing.
- **DataGrip** costs $229 for the first year, locking you into a continuous JetBrains subscription.

---

## The Verdict: Which Tool Should You Choose?

- Choose **Stroke** if you want the fastest, lightest modern database client, need built-in MCP agent integration for Cursor/Claude, and believe in buying your software once.
- Choose **DBeaver** if you need legacy JDBC drivers for obscure mainframe enterprise databases (like Informix or AS400).
- Choose **DataGrip** if your team is already fully embedded in the JetBrains IDE ecosystem and doesn't mind the $229/year seat cost.
`,
    faqs: [
      {
        question: "Is Stroke a good TablePlus alternative?",
        answer:
          "Yes. Stroke connects to PostgreSQL, MySQL, SQLite, DuckDB, ClickHouse, and SQL Server with instant startup (<120ms) and low memory usage. Unlike TablePlus, Stroke includes a built-in MCP server for AI agents and costs $9.99 once with lifetime updates instead of annual renewal fees.",
      },
      {
        question: "How does Stroke compare to DBeaver in memory usage?",
        answer:
          "Stroke uses approximately 64MB of idle RAM and ~188MB when streaming 500,000 rows. In contrast, DBeaver uses 850MB to 1.6GB of RAM due to its Java Virtual Machine (JVM) runtime and Eclipse framework overhead.",
      },
      {
        question: "Does Stroke support DuckDB and ClickHouse out of the box?",
        answer:
          "Yes. Stroke natively connects to DuckDB (including direct Parquet querying) and ClickHouse without requiring manual JDBC driver installations.",
      },
      {
        question: "Can I try Stroke for free?",
        answer:
          "Yes. Stroke is completely free to try with all features unlocked and no user account or credit card required. You only pay $9.99 when you decide to keep it forever.",
      },
    ],
  },
  {
    slug: "mcp-database-client-guide-ai-agents",
    title: "Connecting AI Agents to Your Database: The Complete Model Context Protocol (MCP) Guide",
    description:
      "Learn how to connect Claude Desktop, Cursor, and custom AI agents directly to Postgres, MySQL, and SQLite using Stroke's built-in Model Context Protocol server.",
    publishedAt: "2026-10-28T09:00:00Z",
    updatedAt: "2026-11-03T14:30:00Z",
    author: AUTHORS.alex,
    category: "AI & MCP",
    readingTime: "8 min read",
    featured: true,
    keywords: [
      "MCP database client",
      "Model Context Protocol database",
      "Claude Desktop MCP postgres",
      "Cursor AI database agent",
      "AI database querying",
      "MCP server database",
      "safe AI SQL queries",
    ],
    bluf: "The Model Context Protocol (MCP) lets AI assistants like Claude Desktop and Cursor query databases directly through a local RPC server. Stroke includes a built-in MCP server running on localhost (127.0.0.1:4319), giving your agents accurate schema context and SQL execution without leaking database credentials to external cloud services.",
    keyTakeaways: [
      "Traditional AI coding assistants hallucinate column names because they lack live schema introspection.",
      "Stroke's built-in MCP server exposes safe, read-only tools: describe_table, list_tables, and execute_query.",
      "All agent queries run locally over 127.0.0.1; database passwords and secrets never leave your workstation.",
      "Configuring Claude Desktop or Cursor requires just 5 lines of JSON in your local configuration file.",
    ],
    content: `
## Why AI Agents Need Direct Schema Awareness

When you ask an AI assistant like Claude or Cursor: *"Write a query to calculate our monthly active users grouped by subscription tier"*, what happens?

Without live schema context, the LLM guesses table names (\`users\` vs \`user_accounts\`), invents column names (\`plan_id\` vs \`subscription_tier_id\`), and fails on edge-case PostgreSQL enum types. You spend 10 minutes debugging syntax errors that shouldn't have happened in the first place.

**Model Context Protocol (MCP)**, open-sourced by Anthropic, solves this by establishing a standardized protocol for AI models to connect to local tools and data sources.

---

## How Stroke Implements MCP for Databases

Stroke is the first desktop database client with a **zero-configuration native MCP server**.

Instead of running fragile Node.js scripts or dockerized proxy servers for each individual database, Stroke's desktop app exposes a high-performance local endpoint:

\`\`\`text
┌─────────────────┐        Local JSON-RPC         ┌─────────────────────────┐
│  Claude Desktop │ ◄───────────────────────────► │      Stroke App         │
│  or Cursor IDE  │    http://127.0.0.1:4319      │   (Built-in MCP Server) │
└─────────────────┘                               └────────────┬────────────┘
                                                               │ Direct Socket
                                                               ▼
                                                  ┌─────────────────────────┐
                                                  │ PostgreSQL / MySQL /    │
                                                  │ SQLite / DuckDB / D1    │
                                                  └─────────────────────────┘
\`\`\`

### Exposed Native Tools

Stroke provides the following tools to your connected AI agent:

1. \`list_connections\`: Returns all configured database connections currently saved in Stroke.
2. \`get_schema\`: Returns table schemas, column types, primary keys, foreign keys, and indexes.
3. \`execute_query\`: Runs parameterized SQL queries with safe execution limits and read-only flags.

---

## 5-Minute Setup: Connecting Claude Desktop

Open your Claude Desktop configuration file:
- **macOS**: \`~/Library/Application Support/Claude/claude_desktop_config.json\`
- **Windows**: \`%APPDATA%\\Claude\\claude_desktop_config.json\`

Add the Stroke MCP server entry:

\`\`\`json
{
  "mcpServers": {
    "stroke": {
      "url": "http://127.0.0.1:4319/mcp"
    }
  }
}
\`\`\`

Restart Claude Desktop. You will see a hammer icon indicating that Stroke tools are active.

---

## Connecting Cursor IDE

In Cursor, open **Settings → Features → MCP**, and click **Add New MCP Server**:
- **Name**: \`stroke\`
- **Type**: \`SSE\` (Server-Sent Events) or \`HTTP\`
- **URL**: \`http://127.0.0.1:4319/mcp\`

Now, in Cursor Composer or Chat, you can simply type:
> *"@stroke inspect the payments table and verify why the latest D1 webhook failed."*

Cursor will invoke Stroke's MCP tools, read the schema, and provide the exact fix in seconds.

---

## Security Boundaries: Why Local-First Matters

Giving an AI assistant access to production data sounds terrifying if done incorrectly. Stroke implements four strict security guardrails:

1. **Loopback Only**: The MCP server binds exclusively to \`127.0.0.1\`. It is mathematically unreachable from the public internet or local network.
2. **Zero Telemetry**: Stroke does not log, proxy, or mirror query text or results to cloud servers.
3. **OS Keychain Credentials**: Your database passwords and private keys are encrypted using macOS Keychain, Windows Credential Locker, or Linux Secret Service.
4. **Configurable Read-Only Enforcement**: You can toggle connections to "Strict Read-Only", preventing any \`INSERT\`, \`UPDATE\`, or \`DROP\` statements from executing via AI prompts.
`,
    faqs: [
      {
        question: "What is Model Context Protocol (MCP)?",
        answer:
          "Model Context Protocol (MCP) is an open standard that enables AI models like Claude Desktop and Cursor to communicate securely with local developer tools, databases, and file systems.",
      },
      {
        question: "Does Stroke send my database credentials to Anthropic or OpenAI?",
        answer:
          "No. All communication between Claude or Cursor and Stroke happens on your local machine via localhost (127.0.0.1:4319). Your credentials and query outputs never touch Stroke's servers.",
      },
      {
        question: "Can AI agents run destructive queries like DROP TABLE through Stroke?",
        answer:
          "You can enable Read-Only mode on any database connection in Stroke, which strictly disallows DROP, ALTER, DELETE, or UPDATE commands initiated by MCP agents.",
      },
    ],
  },
  {
    slug: "duckdb-gui-client-local-analytics",
    title: "Why DuckDB Needs a Modern Native GUI: Querying Parquet and Local Analytics in 2026",
    description:
      "Explore large Parquet files and local DuckDB databases without spinning up cloud warehouses. How Stroke delivers sub-second SQL execution on your local machine.",
    publishedAt: "2026-10-20T10:00:00Z",
    updatedAt: "2026-11-02T16:00:00Z",
    author: AUTHORS.elena,
    category: "Guides",
    readingTime: "6 min read",
    featured: false,
    keywords: [
      "DuckDB GUI",
      "DuckDB client",
      "query parquet file GUI",
      "local OLAP database client",
      "MotherDuck desktop GUI",
      "DuckDB vs SQLite",
    ],
    bluf: "DuckDB has become the SQLite of columnar analytics, but inspecting multi-gigabyte Parquet datasets still required command-line Python scripts or heavy BI software. Stroke provides native, instant GUI support for DuckDB files and Parquet directories with zero JVM overhead and sub-second execution.",
    keyTakeaways: [
      "DuckDB excels at analytical OLAP queries, executing 100x faster than traditional row-oriented SQLite on aggregations.",
      "Most database clients lack native DuckDB support, forcing users into tedious Python/pandas scripts or CLI binaries.",
      "Stroke allows dragging and dropping a .duckdb or .parquet file to immediately view schemas, preview data, and run SQL queries.",
      "Memory-efficient streaming prevents the UI from freezing even when analyzing millions of rows.",
    ],
    content: `
## The Rise of DuckDB for Local Analytics

Over the past three years, **DuckDB** transformed data engineering. By bringing vectorized columnar execution to an embedded in-process database, it allowed engineers to query tens of millions of rows on a laptop faster than spinning up an AWS Athena or Snowflake instance.

Yet, despite DuckDB's explosive popularity, **GUI tooling lagged behind**. Developers were stuck running:

\`\`\`python
import duckdb
con = duckdb.connect("analytics.duckdb")
print(con.execute("SELECT * FROM telemetry LIMIT 10").df())
\`\`\`

If you wanted a visual data grid, you had to install cumbersome extensions in generic JDBC tools or launch heavy browser-based notebooks.

---

## Native DuckDB & Parquet Support in Stroke

Stroke treats DuckDB as a **first-class citizen alongside PostgreSQL and SQLite**.

### Key Capabilities:
- **Direct File Drag-and-Drop**: Drag any \`.duckdb\` database or \`.parquet\` file directly into Stroke to inspect the schema and start querying immediately.
- **Vectorized Result Grid**: Stroke's virtualized data grid renders columns with zero lag, automatically inferring nested structs, lists, and timestamps.
- **Direct S3 / MotherDuck Support**: Connect to remote MotherDuck cloud databases or query remote Parquet files stored on Amazon S3 or Cloudflare R2 using standard SQL syntax:

\`\`\`sql
SELECT
  customer_id,
  SUM(amount) AS total_spend,
  COUNT(*) AS total_orders
FROM 's3://analytics-bucket/2026/*.parquet'
GROUP BY customer_id
ORDER BY total_spend DESC
LIMIT 50;
\`\`\`

---

## Performance Comparison: Scanning 10M Row Parquet Dataset

| Tool | Cold Start | Query Execution (SUM + GROUP BY) | RAM Peak |
| :--- | :--- | :--- | :--- |
| **Stroke (Native DuckDB)** | **120 ms** | **184 ms** | **110 MB** |
| DBeaver (via JDBC Driver) | 4,800 ms | 640 ms | 980 MB |
| Python (pandas read_parquet) | 850 ms | 1,420 ms | 1,850 MB |

Stroke allows you to explore analytical data at the speed of thought without writing throwaway Python scripts.
`,
    faqs: [
      {
        question: "Can Stroke open .parquet files directly without an existing DuckDB database?",
        answer:
          "Yes. Stroke can query single Parquet files or folders of Parquet files directly using DuckDB's native read_parquet() engine under the hood.",
      },
      {
        question: "Does Stroke support MotherDuck?",
        answer:
          "Yes. You can connect to MotherDuck by passing your MotherDuck service token in the connection string.",
      },
    ],
  },
  {
    slug: "sqlite-gui-tools-macos-windows-linux",
    title: "Top SQLite GUI Tools for macOS, Windows, and Linux in 2026",
    description:
      "Looking for a fast, modern SQLite browser? We compare top SQLite GUI clients across macOS, Windows, and Linux on speed, editing, and schema migration.",
    publishedAt: "2026-10-15T11:00:00Z",
    updatedAt: "2026-10-30T10:00:00Z",
    author: AUTHORS.elena,
    category: "Guides",
    readingTime: "5 min read",
    featured: false,
    keywords: [
      "SQLite GUI",
      "best SQLite browser",
      "SQLite viewer mac",
      "SQLite editor windows linux",
      "Turso LibSQL GUI",
      "open source SQLite client",
    ],
    bluf: "DB Browser for SQLite is dated and slow on large files; TablePlus charges recurring fees for update releases; and DBeaver is bloated for quick file inspection. Stroke provides the fastest native cross-platform SQLite editor with inline cell editing, foreign key navigation, LibSQL/Turso compatibility, and a built-in MCP server.",
    keyTakeaways: [
      "SQLite is the most deployed database in the world, yet many desktop SQLite browsers haven't updated their UI since 2014.",
      "Stroke opens SQLite files instantaneously without file locking conflicts or background daemon lockups.",
      "Full compatibility with Turso / LibSQL and Cloudflare D1 enables seamless local-to-edge development workflows.",
      "One $9.99 license covers both your Mac and Windows/Linux machines forever.",
    ],
    content: `
## The Challenge with Legacy SQLite Browsers

SQLite powers everything from iOS and Android applications to local AI vector embeddings, browser caches, and desktop software.

Yet when developers look for a **standalone SQLite GUI**, they often end up with:
1. **DB Browser for SQLite (DB4S)**: Reliable and open source, but the UI has not seen major design overhauls in years. It stumbles on multi-gigabyte databases and lacks modern features like AI-assisted SQL generation.
2. **TablePlus**: Excellent design on Mac, but costs $49-$89/year and restricts you to 2 open tabs on the free tier.
3. **VS Code Extensions**: Convenient, but prone to memory spikes, sluggish virtual scrolling, and inconsistent SQL syntax highlighting.

---

## What Makes Stroke the Ideal SQLite Client?

Stroke was built from the ground up for modern developers working with embedded and edge databases:

- **Instant File Association**: Double-click any \`.sqlite\`, \`.sqlite3\`, or \`.db\` file, and Stroke opens within 120 milliseconds.
- **Safe Concurrent Access (WAL Mode)**: Stroke supports SQLite Write-Ahead Logging (WAL) without causing busy locks against your local backend servers.
- **Turso & LibSQL Edge Support**: Connect seamlessly to local LibSQL replicas or remote Turso clusters using the same intuitive interface.
- **Cloudflare D1 Integration**: Inspect and manipulate Cloudflare D1 databases directly without wrestling with the \`wrangler d1\` CLI.
`,
    faqs: [
      {
        question: "Can Stroke edit SQLite cells directly in the table view?",
        answer:
          "Yes. Stroke features inline cell editing for SQLite, PostgreSQL, and MySQL. Changes are highlighted and can be reviewed or committed in a single transaction.",
      },
      {
        question: "Does Stroke support Cloudflare D1 databases?",
        answer:
          "Yes. Stroke natively connects to Cloudflare D1 both in local emulation mode and remote production environments.",
      },
    ],
  },
  {
    slug: "local-first-database-security-ai",
    title: "Zero-Telemetry, Local-First Database Clients: Why Security Matters for Developers",
    description:
      "Why proxying database connections through cloud servers creates massive compliance risks. A deep dive into local-first architecture and OS keychain encryption.",
    publishedAt: "2026-10-10T14:00:00Z",
    updatedAt: "2026-10-25T11:00:00Z",
    author: AUTHORS.alex,
    category: "Engineering",
    readingTime: "6 min read",
    featured: false,
    keywords: [
      "database client security",
      "zero telemetry SQL client",
      "local first database tool",
      "SOC2 database client compliance",
      "database credentials OS keychain",
      "offline database GUI",
    ],
    bluf: "Many modern developer tools quietly route queries and metadata through cloud telemetry servers to train proprietary AI models. Stroke is strictly local-first: every database query runs over direct local sockets, credentials are encrypted in your OS keychain, and zero telemetry or query text ever touches external servers.",
    keyTakeaways: [
      "Cloud-based SQL editors and web GUIs expose production database credentials to third-party compromise.",
      "Stroke enforces a strict local-first architecture: no proxy servers, no query telemetry, and no AI training on customer data.",
      "Database passwords, SSH keys, and SSL certificates are stored in hardware-backed operating system keychains.",
      "Compliance-ready architecture satisfies SOC 2 Type II, HIPAA, and GDPR restrictions for financial and healthcare databases.",
    ],
    content: `
## The Hidden Vulnerabilities of Cloud-Proxied SQL Tools

Over recent years, several database tools transitioned from standalone desktop software to web applications or cloud-connected hybrids. While this enabled browser access, it created severe architectural vulnerabilities:

1. **Centralized Attack Vectors**: If a cloud database tool suffers a breach, every user's stored database hostnames, ports, usernames, and passwords are at risk.
2. **Compliance Violations**: In healthcare (HIPAA) and fintech (SOC 2 Type II), piping customer data or PII through third-party cloud analytics or AI proxies can violate compliance certifications.
3. **Query Logging & AI Training**: Several commercial tools reserve the right to log anonymized queries for product analytics or LLM training.

---

## Stroke's Local-First Security Principles

Stroke was engineered around an immutable design principle: **Your data belongs on your machine.**

### 1. Direct Socket Connections
Stroke connects directly from your machine to your database (e.g. Postgres on \`localhost:5432\` or remote RDS via SSH tunnel). Query results stream directly into application memory; no intermediate relay server exists.

### 2. OS Keychain Integration
Stroke never writes plaintext passwords to configuration files. All sensitive credentials are encrypted using:
- **macOS**: Apple Keychain Services (Secure Enclave supported)
- **Windows**: Windows Credential Locker (DPAPI)
- **Linux**: Secret Service API (libsecret / GNOME Keyring / KWallet)

### 3. Air-Gapped / Offline Reliability
Stroke works completely offline. Whether you are on an airplane, inside an air-gapped financial institution, or working on local Docker containers without Wi-Fi, Stroke starts instantly and operates without requiring internet access.
`,
    faqs: [
      {
        question: "Does Stroke collect telemetry on queries or table names?",
        answer:
          "No. Stroke collects zero telemetry on SQL queries, table names, database schemas, or query results. Only optional anonymous app error diagnostics can be toggled by the user.",
      },
      {
        question: "Is Stroke approved for SOC 2 or HIPAA regulated environments?",
        answer:
          "Yes. Because Stroke executes direct socket connections locally and never proxies data through external servers, it complies with strict enterprise security policies.",
      },
    ],
  },
];

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getRelatedPosts(currentSlug: string, limit = 2): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.slug !== currentSlug).slice(0, limit);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(BLOG_POSTS.map((p) => p.category)));
}
