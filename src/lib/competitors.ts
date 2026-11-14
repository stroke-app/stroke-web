/**
 * Other database clients, for /compare. Only what each vendor publishes and
 * is stable: what the app is built on, where it runs, how it is priced. No
 * feature-by-feature "they lack X" claims: those go stale and are easy to get
 * wrong. Corrections go to the address on the page.
 */

export interface Competitor {
  slug: string;
  name: string;
  /** What the app is built on. */
  runtime: string;
  platforms: string;
  pricing: string;
  /** What it needs before it opens a database, if anything. */
  needs: string;
  /** One honest line on who it suits. */
  goodFor: string;
  /** Searches this page should answer. */
  searchTitle: string;
}

export const STROKE_FACTS = {
  runtime: "Native app (Rust core, system webview)",
  platforms: "macOS, Windows, Linux",
  pricing: "Free to try with every feature; $9.99 once for 3 devices, no subscription",
  needs: "Nothing: paste a URL, open a file, or sign in to a provider",
};

/** Things Stroke does, stated as Stroke's, not as others' gaps. */
export const STROKE_EXTRAS = [
  "An AI agent in the app that reads your schema, runs queries, plans multi-step work and asks before anything destructive",
  "A built-in MCP server, so Claude Code, Cursor and other agents can query your database with access levels you set",
  "Start PostgreSQL, MySQL, MongoDB, Redis, Oracle and 13 more in Docker from the command palette, already connected",
  "The engine's own CLI (psql, mysql, sqlcmd, redis-cli…) in a terminal tab, signed in",
  "Connections, workspaces and settings synced across devices, end-to-end encrypted",
  "SQL, document and key-value databases in one app: Postgres to MongoDB to DynamoDB",
];

export const COMPETITORS: Competitor[] = [
  {
    slug: "tableplus",
    name: "TablePlus",
    runtime: "Native app",
    platforms: "macOS, Windows, Linux, iOS",
    pricing: "One-time license; a free tier with limits",
    needs: "Nothing",
    goodFor: "People who want a mature native client and an iOS companion app.",
    searchTitle: "TablePlus alternative",
  },
  {
    slug: "dbeaver",
    name: "DBeaver",
    runtime: "Java (Eclipse platform)",
    platforms: "macOS, Windows, Linux",
    pricing: "Community edition free and open source; PRO editions by subscription",
    needs: "A Java runtime (bundled with the installer)",
    goodFor: "Teams that need a very wide range of JDBC drivers and are fine with a heavier app.",
    searchTitle: "DBeaver alternative",
  },
  {
    slug: "datagrip",
    name: "DataGrip",
    runtime: "Java (JetBrains IDE platform)",
    platforms: "macOS, Windows, Linux",
    pricing: "Subscription; free for non-commercial use",
    needs: "Nothing",
    goodFor: "JetBrains users who want the IDE's refactoring and code inspections for SQL.",
    searchTitle: "DataGrip alternative",
  },
  {
    slug: "beekeeper-studio",
    name: "Beekeeper Studio",
    runtime: "Electron",
    platforms: "macOS, Windows, Linux",
    pricing: "Community edition free and open source; paid editions",
    needs: "Nothing",
    goodFor: "People who want an open-source SQL client with a friendly interface.",
    searchTitle: "Beekeeper Studio alternative",
  },
  {
    slug: "prisma-studio",
    name: "Prisma Studio",
    runtime: "Browser, started from the Prisma CLI",
    platforms: "Anywhere Node.js runs",
    pricing: "Free",
    needs: "A Prisma project and schema",
    goodFor: "Prisma users who want to look at their data next to their schema.",
    searchTitle: "Prisma Studio alternative",
  },
  {
    slug: "drizzle-studio",
    name: "Drizzle Studio",
    runtime: "Browser, started from drizzle-kit",
    platforms: "Anywhere Node.js runs",
    pricing: "Free for local use",
    needs: "A Drizzle project and config",
    goodFor: "Drizzle users who want a quick view of their tables during development.",
    searchTitle: "Drizzle Studio alternative",
  },
];

export function competitorBySlug(slug: string) {
  return COMPETITORS.find((c) => c.slug === slug) ?? null;
}
