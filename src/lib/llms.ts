import { POSTS } from "#/lib/blog";
import { COMPETITORS, STROKE_EXTRAS, STROKE_FACTS } from "#/lib/competitors";
import { CATEGORY_LABEL, SHIPPED_ENGINES } from "#/lib/engines";
import { FAQ_ITEMS } from "#/lib/faq";
import { PRO_PRICE, TRIAL_DAYS } from "#/lib/pricing";
import { REPO_URL, SITE_URL } from "#/lib/seo";

/**
 * /llms.txt and /llms-full.txt, built from the same data as the pages, so
 * what ChatGPT, Claude, Perplexity and Google's AI read about Stroke is
 * always what the site says now. Plain facts, no marketing.
 */

const SUMMARY = `Stroke is a native desktop database client for macOS, Windows and Linux. It connects to ${SHIPPED_ENGINES.length} databases (${SHIPPED_ENGINES.map((e) => e.name).join(", ")}) in one app, with a data grid, a SQL editor, schema diagrams, charts, an AI agent and a built-in MCP server so AI agents such as Claude Code, Codex and Cursor can query the same databases at an access level the user sets. Connections run directly from the user's computer; credentials stay in the OS keychain and query results never pass through Stroke's servers. Every feature is free for ${TRIAL_DAYS} days after signing in with Google or GitHub; a license costs ${PRO_PRICE} once (no subscription) and covers up to 3 computers per account, with every future update. A Team license costs $99 once for everyone on a company email domain. The source is public on GitHub.`;

const INSTALL = `- macOS and Linux: \`curl -fsSL ${SITE_URL}/install.sh | sh\` (uses Homebrew on macOS and the AUR, apt or dnf on Linux when present)
- Windows (PowerShell): \`irm ${SITE_URL}/install.ps1 | iex\` (uses Scoop when present)
- Homebrew: \`brew install --cask stroke-app/tap/stroke\`
- Scoop: \`scoop bucket add stroke ${REPO_URL}\` then \`scoop install stroke\`
- Arch Linux (AUR): \`yay -S stroke-bin\`
- Direct downloads: ${SITE_URL}/download (.dmg for Apple Silicon and Intel, .exe and .msi, AppImage, .deb, .rpm)`;

const MCP = `Stroke runs an MCP server on the user's computer while the app is open (default endpoint http://127.0.0.1:4319/mcp). Add it to an agent with:
- Claude Code: \`claude mcp add --transport http stroke http://127.0.0.1:4319/mcp\`
- Codex: \`codex mcp add stroke --url http://127.0.0.1:4319/mcp\`
- Cursor, Claude Desktop and other clients: \`{ "mcpServers": { "stroke": { "url": "http://127.0.0.1:4319/mcp" } } }\`
Each connection has an access level (read only, read and write, modify schema, or full access). Statements above the level are refused by Stroke, whatever the model sends; the same check applies to Stroke's built-in AI chat.`;

const link = (path: string) => `${SITE_URL}${path}`;

export function llmsTxt() {
  return `# Stroke

> ${SUMMARY}

## Product

- [Home](${link("/")}): overview, supported databases, pricing, FAQ
- [Features](${link("/features")}): data grid, inline editing, SQL editor, notebooks, schema explorer and ER diagrams, charts and dashboards, migrations (Prisma, Drizzle, Cloudflare D1), local database servers, backups, AI chat, MCP server, command palette
- [Pricing](${link("/pricing")}): ${TRIAL_DAYS}-day free trial, ${PRO_PRICE} once for up to 3 computers, $99 Team license
- [Download](${link("/download")}): macOS, Windows and Linux builds, Homebrew, Scoop, AUR
- [Changelog](${link("/changelog")}): every release
- [Roadmap](${link("/roadmap")})

## Databases

${SHIPPED_ENGINES.map((e) => `- [${e.searchTitle}](${link(`/databases/${e.slug}`)}): ${e.summary}`).join("\n")}

## Comparisons

${COMPETITORS.map((c) => `- [Stroke vs ${c.name}](${link(`/compare/${c.slug}`)}): a ${c.searchTitle}`).join("\n")}

## Docs

- [Getting started](${link("/docs")}): install, connect a database, get Pro, connect agents
- [MCP for agents](${link("/docs/mcp")}): Claude Code, Codex, Cursor and any MCP client

## Blog

${POSTS.map((p) => `- [${p.title}](${link(`/blog/${p.slug}`)}): ${p.description}`).join("\n")}

## Optional

- [Full text for LLMs](${link("/llms-full.txt")})
- [Source code](${REPO_URL})
- [Security](${link("/security")})
- [Privacy Policy](${link("/privacy")})
- [Terms of Service](${link("/terms")})
`;
}

export function llmsFullTxt() {
  const byCategory = Object.entries(CATEGORY_LABEL)
    .map(([cat, label]) => {
      const list = SHIPPED_ENGINES.filter((e) => e.category === cat);
      if (!list.length) return "";
      return `### ${label}\n\n${list
        .map(
          (e) =>
            `#### ${e.name}${e.status === "beta" ? " (beta)" : ""}\n\n${e.summary}\n\n${e.highlights.map((h) => `- ${h}`).join("\n")}\n\nConnect: ${e.connect.join(" ")}\n\nPage: ${link(`/databases/${e.slug}`)}`,
        )
        .join("\n\n")}`;
    })
    .filter(Boolean)
    .join("\n\n");

  return `# Stroke

> ${SUMMARY}

Website: ${SITE_URL}
Source: ${REPO_URL}
Support: support@stroke.click

## Pricing

- Free trial: every feature for ${TRIAL_DAYS} days, after signing in with Google or GitHub. The trial belongs to the account and to the computer.
- Pro: ${PRO_PRICE} once. No subscription and no renewal. Every future update. Up to 3 computers per account; a computer frees its seat when it signs out or is removed on the account page.
- Team: $99 once, Pro for everyone signing in with the company's email domain.
- Pro adds end-to-end encrypted sync of connections and settings, and scheduled backups to S3 or Stroke Cloud.

## Install

${INSTALL}

Direct downloads aren't code-signed yet: on macOS right-click the app and choose Open the first time; on Windows choose More info, then Run anyway.

## What Stroke does

${STROKE_EXTRAS.map((x) => `- ${x}`).join("\n")}
- A data grid that opens million-row tables quickly, with filters, sorting, column stats, and edits that wait until the user applies them
- A SQL editor with autocomplete from the schema, multiple results, query history, saved queries and notebooks
- Schema explorer and ER diagrams
- Charts and dashboards from any query, in a tab or a window of their own
- Backups, restores and imports (SQL dumps with encoding detection and a preview)
- Read-only connections that refuse every write

## AI agents and MCP

${MCP}

## Supported databases

${byCategory}

## Compared with other database clients

Stroke: built on ${STROKE_FACTS.runtime}; runs on ${STROKE_FACTS.platforms}; ${STROKE_FACTS.pricing}; needs ${STROKE_FACTS.needs.charAt(0).toLowerCase()}${STROKE_FACTS.needs.slice(1)}.

${COMPETITORS.map((c) => `- ${c.name}: built on ${c.runtime}; runs on ${c.platforms}; ${c.pricing}; needs first: ${c.needs}. Suits ${c.goodFor.charAt(0).toLowerCase()}${c.goodFor.slice(1)} (${link(`/compare/${c.slug}`)})`).join("\n")}

## FAQ

${FAQ_ITEMS.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}

## Privacy

Stroke connects to databases straight from the user's computer. Passwords are kept in the OS keychain. Query results never pass through Stroke's servers. Synced data is end-to-end encrypted with a key only the user holds. Details: ${link("/privacy")} and ${link("/security")}.
`;
}
