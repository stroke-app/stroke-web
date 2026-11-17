import { Section, SectionIntro } from "#/components/page";
import { clip, shot, ShowcaseSection, TileGrid } from "#/components/showcase";

/** The home page's feature sections, each shown with real screenshots. */

export function BrowseShowcase() {
  return (
    <ShowcaseSection
      id="browse"
      eyebrow="Browse and edit"
      title="A grid that keeps up with you."
      intro={
        <p>
          Sort, filter, pin and hide columns. <strong>Every edit is staged</strong> and marked in
          the grid until you apply it.
        </p>
      }
      link={{ to: "/features", label: "Every feature" }}
      tiles={[
        {
          span: 4,
          title: "Column stats in one click",
          body: "Nulls, distinct values, min and max for any column, beside the rows.",
          media: shot(
            "column-stats",
            1600,
            1005,
            "A table with the column menu open and the column stats panel on the right",
          ),
        },
        {
          span: 2,
          title: "Seven views of the same rows",
          body: "Table, JSON, record, text, chart, schema diagram and structure.",
          media: shot(
            "view-menu",
            1144,
            1481,
            "The view menu listing Table, JSON, Record, Text, Chart, Schema diagram and Structure",
            true,
          ),
        },
        {
          span: 2,
          title: "Changes wait for you",
          body: "New rows, edits and deletes stay marked until you press Apply.",
          media: shot(
            "staged-insert-crop",
            1230,
            460,
            "A new row staged at the top of a movies table, marked until it is applied",
            true,
          ),
        },
        {
          span: 2,
          title: "Filters that know SQL",
          body: "Build a WHERE clause from pickers, or type one with autocomplete.",
          media: shot(
            "filter-suggest",
            956,
            506,
            "A filter row suggesting LIKE while typing a condition",
            true,
          ),
        },
        {
          span: 2,
          title: "Find and replace, previewed",
          body: "See every cell that will change before you replace it.",
          media: shot(
            "find-replace",
            1600,
            408,
            "Find and replace showing 12 Market St becoming testing Market St",
            true,
          ),
        },
      ]}
    />
  );
}

export function QueryShowcase() {
  return (
    <ShowcaseSection
      id="query"
      eyebrow="Query"
      title="Write SQL, read the result your way."
      intro={
        <p>
          Run a whole script, then look at each result as a <strong>table, JSON, a chart</strong> or
          a query plan.
        </p>
      }
      tiles={[
        {
          title: "Every result in its own tab",
          body: "Run several statements and each one gets a tab with its time and row count.",
          media: shot(
            "multi-result",
            1600,
            1005,
            "The SQL editor with two queries and the second result shown as JSON",
          ),
        },
        {
          title: "Charts from any result",
          body: "Pick a category and a value, then switch between bar, line, area, pie and more.",
          media: shot(
            "chart-bar",
            1600,
            1004,
            "A query result drawn as a bar chart, with category and value pickers above",
          ),
        },
        {
          span: 2,
          title: "Plans you can read",
          body: "EXPLAIN as a list of steps with rows, cost and each step's share.",
          media: shot("query-plan", 1600, 1005, "A query plan shown as a table of steps"),
        },
        {
          span: 2,
          title: "JSONPath on results",
          body: "Filter a JSON result down to the field you need.",
          media: shot("json-path", 1600, 1005, "A result as JSON filtered with a JSONPath"),
        },
        {
          span: 2,
          title: "Map view",
          body: "PostGIS rows on a map, clustered when there are too many points to draw.",
          media: shot("view-map", 1472, 1040, "GPS points drawn in clusters on a world map"),
        },
      ]}
    />
  );
}

export function AgentsShowcase() {
  return (
    <Section id="agents">
      <SectionIntro
        eyebrow="AI and agents"
        title="Hand your database to an agent."
        link={{ to: "/docs/mcp", label: "Set up MCP" }}
      >
        <p>
          Ask the chat in the app, or let <strong>Claude, Cursor or any MCP client</strong> read
          your schema and run queries through the built-in MCP server.
        </p>
      </SectionIntro>
      <TileGrid
        className="mt-14 md:mt-20"
        tiles={[
          {
            title: "It shows its work",
            body: "Every query and schema read the agent runs is listed as it happens.",
            media: shot(
              "ai-steps",
              1600,
              1004,
              "The AI chat creating tables and inserting rows, each step listed",
            ),
          },
          {
            title: "Answers you can look at",
            body: "Ask about a schema and get an ER diagram you can save and open later.",
            media: shot(
              "erd",
              1600,
              1004,
              "An ER diagram of a movie database drawn from the AI chat",
            ),
          },
        ]}
      />
    </Section>
  );
}

export function NoSqlShowcase() {
  return (
    <ShowcaseSection
      id="nosql"
      eyebrow="Beyond SQL"
      title="MongoDB, Redis and DynamoDB in the same window."
      intro={<p>Documents, keys and items each get a view built for them.</p>}
      tiles={[
        {
          span: 4,
          title: "MongoDB collections as a grid",
          body: "Browse documents with typed fields, or switch to the document view.",
          media: shot("mongo", 1600, 1005, "A MongoDB orders collection shown as a grid"),
        },
        {
          span: 2,
          title: "Aggregation pipelines",
          body: "Build a pipeline stage by stage and see what each stage returns.",
          media: shot(
            "mongo-aggregate-crop",
            1238,
            664,
            "A MongoDB aggregation pipeline with stages",
            true,
          ),
        },
        {
          span: 4,
          title: "Redis, from keys to pub/sub",
          body: "Edit keys, publish and listen on channels, and watch memory and hit ratio.",
          media: clip(
            "redis",
            "Editing a Redis key, publishing to a channel, then the server overview",
          ),
        },
        {
          span: 2,
          title: "DynamoDB with your AWS profile",
          body: "Connect with a profile or access keys, or point it at DynamoDB Local.",
          media: shot(
            "dynamodb-connect",
            1200,
            982,
            "The DynamoDB connection form with an AWS profile and endpoint",
            true,
          ),
        },
      ]}
    />
  );
}

export function AdminShowcase() {
  return (
    <ShowcaseSection
      id="admin"
      eyebrow="Postgres admin"
      title="Run the server, not only the queries."
      intro={<p>See what Postgres is doing, change its settings, and manage who can touch what.</p>}
      tiles={[
        {
          title: "Instance insights",
          body: "Connections, transactions, cache hit ratio and row writes, refreshed live.",
          media: shot("insights", 1600, 1005, "Instance insights for a Postgres 16 server"),
        },
        {
          title: "Server settings",
          body: "Search every setting, change one, and see when it needs a restart.",
          media: shot("server-config", 1600, 1005, "Changing wal_level in the server settings"),
        },
        {
          title: "Roles and users",
          body: "Every role with its login, superuser and create rights in one table.",
          media: shot("roles", 1600, 1005, "The roles and users table for a Postgres server"),
        },
        {
          title: "Row level security",
          body: "See which tables are protected and turn RLS on per table.",
          media: shot(
            "row-level-security",
            1600,
            1005,
            "Row level security status for each table in the public schema",
          ),
        },
      ]}
    />
  );
}

export function BackupShowcase() {
  return (
    <ShowcaseSection
      id="backup"
      eyebrow="Backup and restore"
      title="Back up a database in a few clicks."
      intro={
        <p>
          Export a whole database to a <strong>.sql file</strong> and restore it into another one,
          with progress for every table.
        </p>
      }
      tiles={[
        {
          title: "Backup",
          body: "Pick the tables, schema and data you want, then export to a .sql file.",
          media: clip(
            "backup",
            "Exporting 31 tables from a Cloudflare D1 database to a .sql file",
            1600,
            1008,
          ),
        },
        {
          title: "Restore",
          body: "Choose a file and watch each statement apply. Errors are collected and listed at the end.",
          media: clip(
            "restore",
            "Restoring a .sql backup into a new Cloudflare D1 database",
            1600,
            1008,
          ),
        },
      ]}
    />
  );
}

export function ToolsShowcase() {
  return (
    <ShowcaseSection
      id="tools"
      eyebrow="Built in"
      title="A terminal, diagrams and extensions, next to your data."
      intro={<p>The tools you would open in another window are already here.</p>}
      tiles={[
        {
          span: 4,
          title: "A terminal on the same connection",
          body: "Open the database's own shell under the grid, already connected.",
          media: shot(
            "table-terminal",
            1600,
            1005,
            "A TiDB table with the MySQL shell open in a terminal below",
          ),
        },
        {
          span: 2,
          title: "Diagrams in Mermaid",
          body: "Write a sequence or flow diagram and watch it render as you type.",
          media: shot(
            "diagrams-mermaid-crop",
            1430,
            620,
            "A Mermaid sequence diagram and its preview",
            true,
          ),
        },
        {
          title: "Command palette",
          body: "Every view, table and action is a few keys away with Cmd/Ctrl+K.",
          media: shot(
            "command-palette",
            1600,
            1005,
            "The command palette listing views with their keyboard shortcuts",
          ),
        },
        {
          title: "Extensions",
          body: "Formatters, links and cell tools for the grid. Turn on only what you use.",
          media: shot("extensions", 1600, 1005, "The extensions page with formatters and tools"),
        },
      ]}
    />
  );
}

export function ShareShowcase() {
  return (
    <ShowcaseSection
      id="share"
      eyebrow="Sharing"
      title="Share a result, not your database."
      intro={
        <p>
          Send rows, a chart or a schema as an <strong>end-to-end encrypted link</strong> that
          expires.
        </p>
      }
      tiles={[
        {
          span: 2,
          title: "You pick what goes out",
          body: "Choose columns, mask sensitive values, and set an expiry or a password.",
          media: shot(
            "share-rows",
            1200,
            1433,
            "The share rows dialog with columns, masking, expiry and password",
            true,
          ),
        },
        {
          span: 4,
          title: "Opens in any browser",
          body: "The person you send it to needs no account and no app. Only people with the link can read it.",
          media: shot(
            "shared-schema",
            1600,
            959,
            "A shared schema diagram open in a browser, end-to-end encrypted, expiring in 7 days",
          ),
        },
      ]}
    />
  );
}
