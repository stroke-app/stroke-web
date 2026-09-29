import { createFileRoute, Link } from "@tanstack/react-router";

import { DocsNav, NextLinks, PageBody, PageHeader, PageShell, SideNav } from "#/components/page";
import { seo } from "#/lib/seo";

export const Route = createFileRoute("/docs/mcp")({
  head: () =>
    seo({
      title: "MCP for agents · Stroke docs",
      description:
        "Connect Stroke's built-in MCP server to Claude, Cursor, and other agents so they can read your schema and run queries, with your database credentials staying on your machine.",
      path: "/docs/mcp",
      breadcrumbs: [
        { name: "Docs", path: "/docs" },
        { name: "MCP for agents", path: "/docs/mcp" },
      ],
    }),
  component: McpPage,
});

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg border border-border/50 bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground/90">
      <code>{children}</code>
    </pre>
  );
}

const CLAUDE_CONFIG = `{
  "mcpServers": {
    "stroke": {
      "url": "http://127.0.0.1:4319/mcp"
    }
  }
}`;

const CLAUDE_PATHS = `macOS    ~/Library/Application Support/Claude/claude_desktop_config.json
Windows  %APPDATA%\\Claude\\claude_desktop_config.json`;

function slug(title: string) {
  return title
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

const SECTIONS = [
  "Turn on the MCP server",
  "Connect Claude Desktop",
  "Connect Cursor and others",
  "What agents can do",
  "Staying in control",
];

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={slug(title)} className="scroll-mt-20">
      <h2 className="flex items-baseline gap-3 text-lg font-semibold tracking-tight">
        <span className="text-sm font-medium text-copper tabular-nums">{number}</span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-pretty text-muted-foreground [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-foreground [&_code]:rounded [&_code]:bg-muted/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_strong]:font-medium [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}

function McpPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Docs"
        title="MCP for agents"
        description="Stroke ships a built-in MCP (Model Context Protocol) server. Point an agent at it and it can read your schema and run queries against a database you already trust, with the connection and credentials staying on your machine."
      />
      <PageBody
        aside={
          <div className="space-y-8">
            <DocsNav />
            <SideNav
              title="On this page"
              items={SECTIONS.map((t) => ({ label: t, hash: slug(t) }))}
            />
          </div>
        }
      >
        <div className="space-y-12">
          <Section number="01" title="Turn on the MCP server">
            <p>
              Open <strong>Stroke → MCP</strong>, pick the connection you want to expose, and toggle
              the server on. Stroke serves MCP locally and shows the exact endpoint plus a
              copy-ready config for each client. Nothing is exposed to the network beyond your
              machine.
            </p>
          </Section>

          <Section number="02" title="Connect Claude Desktop">
            <p>
              Add Stroke to Claude's MCP config, then restart Claude. Use the snippet Stroke gives
              you (the port may differ); it looks like this:
            </p>
            <CodeBlock>{CLAUDE_CONFIG}</CodeBlock>
            <p>The config file lives at:</p>
            <CodeBlock>{CLAUDE_PATHS}</CodeBlock>
            <p>
              After restarting, Claude lists <strong>stroke</strong> under its tools and can start
              querying.
            </p>
          </Section>

          <Section number="03" title="Connect Cursor and others">
            <p>
              In Cursor, open <strong>Settings → MCP → Add server</strong> and paste the same
              endpoint, or drop it into a project's <code>.cursor/mcp.json</code>. Any
              MCP-compatible client works the same way: point it at the URL Stroke shows and reload.
            </p>
          </Section>

          <Section number="04" title="What agents can do">
            <p>
              Once connected, an agent can inspect tables, columns, indexes, and relationships, then
              run read queries to answer questions or draft SQL for you. It works against the live
              schema, so answers reflect your actual database, not a guess.
            </p>
          </Section>

          <Section number="05" title="Staying in control">
            <p>
              The MCP server only runs while Stroke is open and you've enabled it for a connection.
              Turn it off any time from the same panel. Because everything runs locally, your
              credentials and query results never leave your device. See the{" "}
              <Link to="/privacy">Privacy Policy</Link> for the full picture.
            </p>
          </Section>
        </div>

        <NextLinks>
          <Link to="/docs">← Getting started</Link>
          <Link to="/features">All features →</Link>
          <Link to="/download">Download →</Link>
        </NextLinks>
      </PageBody>
    </PageShell>
  );
}
