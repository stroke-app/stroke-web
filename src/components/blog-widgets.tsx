import { Link } from "@tanstack/react-router";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { COMPETITORS, STROKE_FACTS } from "#/lib/competitors";
import { SHIPPED_ENGINES } from "#/lib/engines";
import { cn } from "#/lib/utils";

/**
 * Interactive pieces a blog post can place with a line of its own:
 * `{{client-picker}}`, `{{compare}}`, `{{engines}}` or `{{mcp-config}}`.
 * Everything they say about other clients comes from lib/competitors.ts,
 * which holds only what each vendor publishes.
 */
export function BlogWidget({ name }: { name: string }) {
  switch (name) {
    case "client-picker":
      return <ClientPicker />;
    case "compare":
      return <CompareTable />;
    case "engines":
      return <EngineGrid />;
    case "mcp-config":
      return <McpConfig />;
    default:
      return null;
  }
}

const FRAME = "my-8 rounded-xl bg-white/[0.02] p-5 shadow-[0_0_0_1px_rgb(255_255_255/0.08)] md:p-6";

// ── Client picker ────────────────────────────────────────────────────────────

type Os = "macOS" | "Windows" | "Linux";
type Pay = "free" | "once" | "any";
type Runtime = "native" | "any";

interface Row {
  name: string;
  href?: { to: "/compare/$slug"; slug: string } | { to: "/download" };
  os: Os[];
  pays: Pay[];
  native: boolean;
  needsProject: boolean;
  note: string;
}

/** The published facts, reduced to what the picker filters on. */
const ROWS: Row[] = [
  {
    name: "Stroke",
    href: { to: "/download" },
    os: ["macOS", "Windows", "Linux"],
    pays: ["once"],
    native: true,
    needsProject: false,
    note: STROKE_FACTS.pricing,
  },
  ...COMPETITORS.map(
    (c): Row => ({
      name: c.name,
      href: { to: "/compare/$slug", slug: c.slug },
      os: (["macOS", "Windows", "Linux"] as Os[]).filter(
        (o) => c.platforms.includes(o) || c.platforms.startsWith("Anywhere"),
      ),
      pays: [
        ...(/free/i.test(c.pricing) ? (["free"] as Pay[]) : []),
        ...(/one-time|once/i.test(c.pricing) ? (["once"] as Pay[]) : []),
      ],
      native: /^Native/.test(c.runtime),
      needsProject: /project|config/i.test(c.needs),
      note: c.pricing,
    }),
  ),
];

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-[13px] font-medium text-foreground">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
            className={cn(
              "h-8 rounded-full px-3 text-[13px] transition-[background-color,color,scale] duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]",
              value === o.id
                ? "bg-white/[0.12] text-foreground"
                : "bg-white/[0.03] text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function ClientPicker() {
  const [os, setOs] = useState<Os>("macOS");
  const [pay, setPay] = useState<Pay>("any");
  const [runtime, setRuntime] = useState<Runtime>("any");
  const [standalone, setStandalone] = useState<"yes" | "no">("yes");

  const fits = ROWS.filter(
    (r) =>
      r.os.includes(os) &&
      (pay === "any" || r.pays.includes(pay)) &&
      (runtime === "any" || r.native) &&
      (standalone === "no" || !r.needsProject),
  );

  return (
    <div className={FRAME} role="group" aria-label="Find a database client">
      <p className="text-[15px] font-medium text-foreground">Find a client for how you work</p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Choice
          label="Your computer"
          value={os}
          onChange={setOs}
          options={[
            { id: "macOS", label: "Mac" },
            { id: "Windows", label: "Windows" },
            { id: "Linux", label: "Linux" },
          ]}
        />
        <Choice
          label="How you want to pay"
          value={pay}
          onChange={setPay}
          options={[
            { id: "any", label: "Either" },
            { id: "free", label: "Free" },
            { id: "once", label: "Once, no subscription" },
          ]}
        />
        <Choice
          label="App runtime"
          value={runtime}
          onChange={setRuntime}
          options={[
            { id: "any", label: "Any" },
            { id: "native", label: "Native only" },
          ]}
        />
        <Choice
          label="Works without a project"
          value={standalone}
          onChange={setStandalone}
          options={[
            { id: "yes", label: "Yes" },
            { id: "no", label: "Doesn't matter" },
          ]}
        />
      </div>
      <ul className="mt-6 flex flex-col border-t border-white/[0.06]" aria-live="polite">
        {fits.length === 0 && (
          <li className="py-3 text-[14px] text-muted-foreground">
            Nothing matches all four. Loosen one.
          </li>
        )}
        {fits.map((r) => (
          <li
            key={r.name}
            className="flex flex-col gap-0.5 border-b border-white/[0.06] py-3 sm:flex-row sm:items-baseline sm:gap-4"
          >
            <span className="w-40 shrink-0 text-[14px] font-medium text-foreground">
              {r.href?.to === "/compare/$slug" ? (
                <Link
                  to="/compare/$slug"
                  params={{ slug: r.href.slug }}
                  className="underline-offset-4 hover:underline"
                >
                  {r.name}
                </Link>
              ) : (
                <Link to="/download" className="underline-offset-4 hover:underline">
                  {r.name}
                </Link>
              )}
            </span>
            <span className="text-[13px] text-muted-foreground">{r.note}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[12px] text-faint">
        From each vendor's published platforms and pricing. Corrections welcome on GitHub.
      </p>
    </div>
  );
}

// ── Compare table ────────────────────────────────────────────────────────────

export function CompareTable() {
  const rows = [{ name: "Stroke", ...STROKE_FACTS }, ...COMPETITORS];
  return (
    <div className="my-8 overflow-x-auto rounded-xl shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
      <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
        <thead>
          <tr className="text-faint">
            {["Client", "Built on", "Runs on", "Pricing", "Needs"].map((h) => (
              <th
                key={h}
                scope="col"
                className="border-b border-white/[0.06] px-4 py-3 font-medium"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className={cn(r.name === "Stroke" && "bg-white/[0.03]")}>
              <th
                scope="row"
                className="border-b border-white/[0.06] px-4 py-3 font-medium text-foreground"
              >
                {r.name}
              </th>
              <td className="border-b border-white/[0.06] px-4 py-3 text-muted-foreground">
                {r.runtime}
              </td>
              <td className="border-b border-white/[0.06] px-4 py-3 text-muted-foreground">
                {r.platforms}
              </td>
              <td className="border-b border-white/[0.06] px-4 py-3 text-muted-foreground">
                {r.pricing}
              </td>
              <td className="border-b border-white/[0.06] px-4 py-3 text-muted-foreground">
                {r.needs}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Engines ──────────────────────────────────────────────────────────────────

export function EngineGrid() {
  return (
    <ul className="my-8 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
      {SHIPPED_ENGINES.map((e) => (
        <li key={e.slug}>
          <Link
            to="/databases/$engine"
            params={{ engine: e.slug }}
            className="flex h-10 items-center gap-2.5 rounded-lg bg-white/[0.02] px-3 text-[13px] text-muted-foreground shadow-[0_0_0_1px_rgb(255_255_255/0.06)] transition-[background-color,color,scale] duration-150 ease-out hover:bg-white/[0.05] hover:text-foreground active:scale-[0.97]"
          >
            <e.Icon className="size-4 shrink-0" color={e.color} />
            {e.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ── MCP config ───────────────────────────────────────────────────────────────

const TOKEN = "<token from Stroke's MCP panel>";
const URL = "http://127.0.0.1:4319/mcp";
const MCP_CLIENTS = [
  {
    id: "claude-code",
    label: "Claude Code",
    lang: "Terminal",
    text: `claude mcp add --transport http stroke ${URL} --header "Authorization: Bearer ${TOKEN}"`,
  },
  {
    id: "claude",
    label: "Claude Desktop",
    lang: "claude_desktop_config.json",
    text: JSON.stringify(
      { mcpServers: { stroke: { url: URL, headers: { Authorization: `Bearer ${TOKEN}` } } } },
      null,
      2,
    ),
  },
  {
    id: "vscode",
    label: "VS Code",
    lang: ".vscode/mcp.json",
    text: JSON.stringify(
      {
        servers: {
          stroke: { type: "http", url: URL, headers: { Authorization: `Bearer ${TOKEN}` } },
        },
      },
      null,
      2,
    ),
  },
] as const;

export function McpConfig() {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(id);
  }, [copied]);
  const c = MCP_CLIENTS[active];
  return (
    <div className="my-8 overflow-hidden rounded-xl shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
      <div
        className="flex items-center gap-1 border-b border-white/[0.06] px-2 py-1.5"
        role="tablist"
        aria-label="MCP client"
      >
        {MCP_CLIENTS.map((m, i) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={cn(
              "h-7 rounded-md px-2.5 text-[13px] transition-[background-color,color,scale] duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]",
              i === active
                ? "bg-white/[0.08] text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m.label}
          </button>
        ))}
        <span className="ms-auto hidden font-mono text-[12px] text-faint sm:inline">{c.lang}</span>
        <button
          type="button"
          aria-label={copied ? "Copied" : "Copy"}
          onClick={() => void navigator.clipboard.writeText(c.text).then(() => setCopied(true))}
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-[background-color,color,scale] duration-150 ease-out hover:bg-white/[0.06] hover:text-foreground active:scale-[0.97]"
        >
          {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
        </button>
      </div>
      <pre className="overflow-x-auto bg-black/30 p-4 font-mono text-[12.5px] leading-5 text-soft">
        <code>{c.text}</code>
      </pre>
      <p className="border-t border-white/[0.06] px-4 py-2.5 text-[12px] text-faint">
        Stroke's MCP panel shows these with your token filled in, and has one-click install for
        Cursor and VS Code.
      </p>
    </div>
  );
}
