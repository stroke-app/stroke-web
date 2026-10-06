import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { DocsNav, NextLinks, PageBody, PageHeader, PageShell, SideNav } from "#/components/page";
import { seo } from "#/lib/seo";

export const Route = createFileRoute("/docs/mcp")({
  head: () =>
    seo({
      title: "MCP for agents · Stroke docs",
      description:
        "Connect the Stroke database client's built-in MCP server to Claude, Cursor, and other agents so they can read your schema and run queries, with your database credentials staying on your machine.",
      path: "/docs/mcp",
      breadcrumbs: [
        { name: "Docs", path: "/docs" },
        { name: "MCP for agents", path: "/docs/mcp" },
      ],
    }),
  component: McpPage,
});

const CLAUDE_CONFIG = `{
  "mcpServers": {
    "stroke": {
      "url": "http://127.0.0.1:4319/mcp"
    }
  }
}`;

const CLAUDE_CONFIG_PATHS = [
  { os: "macOS", path: "~/Library/Application Support/Claude/claude_desktop_config.json" },
  { os: "Windows", path: "%APPDATA%\\Claude\\claude_desktop_config.json" },
];

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : label}
      title={copied ? "Copied" : label}
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => setCopied(true));
      }}
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-white/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
    </button>
  );
}

// Keys, strings, and literals of a JSON snippet, colored like the app's editor.
const JSON_TOKEN = /("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g;

function highlightJson(code: string) {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of code.matchAll(JSON_TOKEN)) {
    if (m.index > last) {
      nodes.push(
        <span key={key++} className="text-muted-foreground">
          {code.slice(last, m.index)}
        </span>,
      );
    }
    if (m[1] && m[2]) {
      nodes.push(
        <span key={key++} className="text-[#9fb2f5]">
          {m[1]}
        </span>,
        <span key={key++} className="text-muted-foreground">
          {m[2]}
        </span>,
      );
    } else if (m[1]) {
      nodes.push(
        <span key={key++} className="text-[#e5c890]">
          {m[1]}
        </span>,
      );
    } else {
      nodes.push(
        <span key={key++} className="text-[#ef9f76]">
          {m[0]}
        </span>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < code.length) {
    nodes.push(
      <span key={key++} className="text-muted-foreground">
        {code.slice(last)}
      </span>,
    );
  }
  return nodes;
}

/** A code surface in the app's style: a file-name bar with a copy button over mono text. */
function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <figure className="mt-6 overflow-hidden rounded-xl border border-border bg-[#0b0c0d] shadow-[0_1px_0_0_rgb(255_255_255/0.04)_inset]">
      <figcaption className="flex h-10 items-center justify-between gap-3 border-b border-border pr-1.5 pl-4">
        <span className="truncate font-mono text-[12px] text-muted-foreground">{title}</span>
        <CopyButton text={code} label={`Copy ${title}`} />
      </figcaption>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-[1.7]">
        <code>{highlightJson(code)}</code>
      </pre>
    </figure>
  );
}

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
    <section
      id={slug(title)}
      className="scroll-mt-24 border-t border-border pt-10 first:border-t-0 first:pt-0"
    >
      <p className="font-mono text-[12px] text-faint tabular-nums">{number}</p>
      <h2 className="mt-2 text-[1.75rem]">{title}</h2>
      <div className="mt-4 space-y-4 text-base leading-[1.7] text-pretty text-soft [&_:not(pre)>code]:rounded-[5px] [&_:not(pre)>code]:border [&_:not(pre)>code]:border-white/[0.07] [&_:not(pre)>code]:bg-white/[0.045] [&_:not(pre)>code]:px-[0.35em] [&_:not(pre)>code]:py-px [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.84em] [&_:not(pre)>code]:text-foreground [&_a]:text-foreground [&_a]:underline [&_a]:decoration-white/25 [&_a]:underline-offset-[3px] [&_a]:transition-colors [&_a:hover]:decoration-white/70 [&_strong]:font-[560] [&_strong]:text-foreground">
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
          <div className="space-y-10">
            <DocsNav />
            <SideNav
              title="On this page"
              items={SECTIONS.map((t) => ({ label: t, hash: slug(t) }))}
            />
          </div>
        }
      >
        <div className="max-w-[42rem] space-y-10">
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
            <CodeBlock title="claude_desktop_config.json" code={CLAUDE_CONFIG} />
            <p className="pt-2">The config file lives at:</p>
            <dl className="overflow-hidden rounded-xl border border-border bg-[#0b0c0d]">
              {CLAUDE_CONFIG_PATHS.map((row) => (
                <div
                  key={row.os}
                  className="flex items-center gap-3 border-t border-border py-1.5 pr-1.5 pl-4 first:border-t-0"
                >
                  <dt className="w-16 shrink-0 text-[13px] text-muted-foreground">{row.os}</dt>
                  <dd className="min-w-0 flex-1 py-1.5 font-mono text-[12.5px] leading-relaxed break-all text-soft">
                    {row.path}
                  </dd>
                  <CopyButton text={row.path} label={`Copy the ${row.os} path`} />
                </div>
              ))}
            </dl>
            <p className="pt-2">
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

        <div className="max-w-[42rem]">
          <NextLinks>
            <Link to="/docs">← Getting started</Link>
            <Link to="/features">All features →</Link>
            <Link to="/download">Download →</Link>
          </NextLinks>
        </div>
      </PageBody>
    </PageShell>
  );
}
