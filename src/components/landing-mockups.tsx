import {
  SiCloudflare,
  SiPlanetscale,
  SiPrisma,
  SiSupabase,
  SiTurso,
} from "@icons-pack/react-simple-icons";
import {
  CheckIcon,
  DatabaseIcon,
  PlayIcon,
  SearchIcon,
  SparklesIcon,
  TableIcon,
} from "lucide-react";

import { Panel } from "#/components/page";
import { cn } from "#/lib/utils";

/*
 * Coded product mockups for the landing page, in the Linear manner: real UI
 * built from realistic data, panels overlapping, fading into the page at the
 * edges. Decorative, so each is aria-hidden; the section copy carries meaning.
 */

/** Window dots for a panel's title bar. */
function Dots() {
  return (
    <span className="flex gap-1.5">
      <span className="size-2.5 rounded-full bg-white/12" />
      <span className="size-2.5 rounded-full bg-white/12" />
      <span className="size-2.5 rounded-full bg-white/12" />
    </span>
  );
}

// ── Query ────────────────────────────────────────────────────────────────────

const TABLES = [
  { name: "coupons", rows: "42" },
  { name: "customers", rows: "12,408" },
  { name: "events", rows: "1,000,000" },
  { name: "order_items", rows: "311,920" },
  { name: "orders", rows: "98,113", active: true },
  { name: "payments", rows: "97,540" },
  { name: "products", rows: "1,204" },
  { name: "reviews", rows: "8,311" },
];

// GitHub "dark dimmed" tones: quiet enough to sit inside a Linear-style page.
const KW = "text-[#f47067]";
const FN = "text-[#dcbdfb]";
const STR = "text-[#96d0ff]";
const NUM = "text-[#6cb6ff]";

const SQL: React.ReactNode[] = [
  <>
    <span className={KW}>select</span> c.name,
  </>,
  <>
    {"       "}
    <span className={FN}>count</span>(o.id) <span className={KW}>as</span> orders,
  </>,
  <>
    {"       "}
    <span className={FN}>sum</span>(o.total_cents) / <span className={NUM}>100.0</span>{" "}
    <span className={KW}>as</span> revenue
  </>,
  <>
    <span className={KW}>from</span> orders o
  </>,
  <>
    <span className={KW}>join</span> customers c <span className={KW}>on</span> c.id = o.customer_id
  </>,
  <>
    <span className={KW}>where</span> o.placed_at {">"} <span className={FN}>now</span>() -{" "}
    <span className={KW}>interval</span> <span className={STR}>'30 days'</span>
  </>,
  <>
    <span className={KW}>group by</span> c.name
  </>,
  <>
    <span className={KW}>order by</span> revenue <span className={KW}>desc</span>
  </>,
  <>
    <span className={KW}>limit</span> <span className={NUM}>5</span>;
    <span className="caret-blink ml-px inline-block h-[1.1em] w-px translate-y-[3px] bg-white/80" />
  </>,
];

const RESULTS = [
  ["Northwind Traders", "184", "21,904.50"],
  ["Acme Analytics", "171", "19,318.00"],
  ["Globex", "152", "17,060.25"],
  ["Initech", "139", "15,412.80"],
  ["Umbrella Labs", "121", "13,775.10"],
];

/**
 * The query workspace: the schema sidebar behind, the SQL editor and its
 * result grid in front, overlapping it.
 */
export function QueryMockup({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "mono-shot relative h-[440px] overflow-hidden select-none md:h-[560px]",
        className,
      )}
    >
      {/* Schema sidebar */}
      <Panel className="fade-b absolute top-10 left-0 hidden h-[520px] w-[300px] md:block">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3 text-[13px] text-white/50">
          <DatabaseIcon className="size-3.5" strokeWidth={1.75} />
          acme-prod
          <span className="text-white/25">/</span>
          public
        </div>
        <div className="mx-3 mt-3 flex h-8 items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.02] px-2.5 text-[12px] text-white/35">
          <SearchIcon className="size-3.5" strokeWidth={1.75} />
          Filter tables
        </div>
        <p className="mt-4 flex justify-between px-4 text-[11px] font-medium text-white/35">
          <span>Tables</span>
          <span className="tabular-nums">8</span>
        </p>
        <ul className="mt-2 space-y-px px-2 font-mono text-[12.5px]">
          {TABLES.map((t) => (
            <li
              key={t.name}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-[7px]",
                t.active ? "bg-white/[0.06] text-white" : "text-white/60",
              )}
            >
              <TableIcon className="size-3.5 shrink-0 text-white/35" strokeWidth={1.75} />
              <span className="flex-1 truncate">{t.name}</span>
              <span className="text-[11px] text-white/30 tabular-nums">{t.rows}</span>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Editor + results */}
      <Panel className="fade-rb-soft absolute top-0 left-0 w-[820px] bg-[#0d0e10] md:left-[240px] md:w-[980px]">
        <div className="flex items-center gap-4 border-b border-white/[0.06] px-4 py-2.5">
          <Dots />
          <span className="rounded-md bg-white/[0.06] px-2.5 py-1 font-mono text-[12px] text-white/80">
            revenue_by_customer.sql
          </span>
          <span className="font-mono text-[12px] text-white/30">orders</span>
          <span className="mr-[180px] ml-auto flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-[12px] font-medium text-black md:mr-[260px]">
            <PlayIcon className="size-3 fill-current" />
            Run
          </span>
        </div>

        <pre className="py-4 font-mono text-[13px] leading-[1.75] text-white/85">
          {SQL.map((line, i) => (
            <div key={i} className={cn("flex pr-4", i === SQL.length - 1 && "bg-white/[0.035]")}>
              <span className="w-12 shrink-0 pr-4 text-right text-white/22 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="whitespace-pre">{line}</span>
            </div>
          ))}
        </pre>

        <div className="border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-4 py-2 text-[12px] text-white/40">
            <span className="flex items-center gap-1.5 text-[#57ab5a]">
              <CheckIcon className="size-3.5" strokeWidth={2.5} />5 rows
            </span>
            <span className="tabular-nums">18 ms</span>
          </div>
          <table className="w-[720px] border-t border-r border-white/[0.06] font-mono text-[12.5px]">
            <thead>
              <tr className="text-left text-white/40">
                <th className="w-12 border-r border-white/[0.06] py-2 text-center font-normal">
                  #
                </th>
                <th className="border-r border-white/[0.06] px-3 py-2 font-normal">
                  name <span className="text-white/20">text</span>
                </th>
                <th className="border-r border-white/[0.06] px-3 py-2 font-normal">
                  orders <span className="text-white/20">int8</span>
                </th>
                <th className="px-3 py-2 font-normal">
                  revenue <span className="text-white/20">numeric</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {RESULTS.map((row, i) => (
                <tr key={row[0]} className="border-t border-white/[0.05] text-white/75">
                  <td className="border-r border-white/[0.06] py-2 text-center text-white/25 tabular-nums">
                    {i + 1}
                  </td>
                  <td className="border-r border-white/[0.06] px-3 py-2">{row[0]}</td>
                  <td className="border-r border-white/[0.06] px-3 py-2 tabular-nums">{row[1]}</td>
                  <td className="px-3 py-2 tabular-nums">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

// ── Connect ──────────────────────────────────────────────────────────────────

export function NeonGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2.5" />
      <path d="M8.5 16V8l7 8V8" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

const PICKER_PROVIDERS = [
  { name: "Neon", Icon: NeonGlyph, color: "#00e599", active: true },
  { name: "Supabase", Icon: SiSupabase, color: "#3ecf8e" },
  { name: "Prisma Postgres", Icon: SiPrisma, color: "#8b8ff8" },
  { name: "PlanetScale", Icon: SiPlanetscale, color: "#e5e5e5" },
  { name: "Turso", Icon: SiTurso, color: "#4ff8d2" },
  { name: "Cloudflare D1", Icon: SiCloudflare, color: "#f38020" },
];

const DATABASES = [
  {
    name: "acme-prod",
    branch: "main",
    region: "aws-us-east-2",
    engine: "Postgres 17",
    active: true,
  },
  { name: "acme-staging", branch: "preview", region: "aws-us-east-2", engine: "Postgres 17" },
  { name: "analytics", branch: "main", region: "aws-eu-central-1", engine: "Postgres 16" },
  { name: "side-project", branch: "main", region: "aws-us-west-2", engine: "Postgres 17" },
];

/** Provider sign-in: the provider list behind, that account's databases in front. */
export function ConnectMockup({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "mono-shot relative h-[400px] overflow-hidden select-none md:h-[380px]",
        className,
      )}
    >
      <Panel className="fade-b absolute top-0 left-0 w-[320px] md:w-[360px]">
        <p className="border-b border-white/[0.06] px-4 py-3 text-[13px] text-white/50">
          Connect with a provider
        </p>
        <ul className="space-y-1 p-2">
          {PICKER_PROVIDERS.map((p) => (
            <li
              key={p.name}
              className={cn(
                "flex h-11 items-center gap-3 rounded-lg px-3 text-[13.5px]",
                p.active ? "bg-white/[0.06] text-white" : "text-white/65",
              )}
            >
              <p.Icon className="size-4 shrink-0" style={{ color: p.color }} />
              {p.name}
              {p.active && <span className="ml-auto text-[12px] text-white/40">Signed in</span>}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="fade-rb-soft absolute top-24 left-10 w-[700px] bg-[#0d0e10] md:top-16 md:left-[280px] md:w-[900px]">
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3.5">
          <NeonGlyph className="size-4 text-[#00e599]" />
          <span className="text-[13.5px] text-white/85">Choose a database</span>
          <span className="text-[13px] text-white/35">4 on your account</span>
        </div>
        <ul className="divide-y divide-white/[0.05]">
          {DATABASES.map((db) => (
            <li
              key={db.name}
              className={cn(
                "grid grid-cols-[170px_90px_150px_110px] items-center gap-4 px-5 py-3.5 text-[13px]",
                db.active && "bg-white/[0.04]",
              )}
            >
              <span className="flex items-center gap-2.5 font-mono text-white/85">
                <DatabaseIcon className="size-3.5 text-white/35" strokeWidth={1.75} />
                {db.name}
              </span>
              <span className="font-mono text-white/45">{db.branch}</span>
              <span className="text-white/40">{db.region}</span>
              {db.active ? (
                <span className="justify-self-start rounded-md bg-white px-2.5 py-1 text-[12px] font-medium text-black">
                  Connect
                </span>
              ) : (
                <span className="text-white/35">{db.engine}</span>
              )}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

// ── Agents ───────────────────────────────────────────────────────────────────

/**
 * An agent using Stroke's MCP server: the client config behind, a chat in
 * front where the agent calls Stroke's tools to answer.
 */
export function AgentsMockup({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "mono-shot relative h-[460px] overflow-hidden select-none md:h-[520px]",
        className,
      )}
    >
      <Panel className="fade-b absolute top-0 left-0 hidden w-[380px] md:block">
        <p className="border-b border-white/[0.06] px-4 py-3 font-mono text-[12px] text-white/45">
          claude_desktop_config.json
        </p>
        <pre className="p-4 font-mono text-[12.5px] leading-[1.8] text-white/75">
          {"{\n  "}
          <span className={STR}>"mcpServers"</span>
          {": {\n    "}
          <span className={STR}>"stroke"</span>
          {": {\n      "}
          <span className={STR}>"url"</span>
          {": "}
          <span className="text-[#f69d50]">"http://127.0.0.1:4319/mcp"</span>
          {"\n    }\n  }\n}"}
        </pre>
      </Panel>

      <Panel className="fade-rb-soft absolute top-0 left-0 w-[680px] bg-[#0d0e10] md:top-12 md:left-[300px] md:w-[900px]">
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3">
          <SparklesIcon className="size-4 text-copper" strokeWidth={1.75} />
          <span className="text-[13.5px] text-white/85">Agent</span>
          <span className="text-[12px] text-white/35">connected to stroke · acme-prod</span>
        </div>
        <div className="max-w-[620px] space-y-5 p-5 text-[13.5px] leading-relaxed">
          <p className="ml-auto w-fit max-w-[70%] rounded-xl bg-white/[0.07] px-3.5 py-2.5 text-white/85">
            Which products got the most one-star reviews this month?
          </p>
          <div className="space-y-2">
            {[
              ["Read the schema", "8 tables in public"],
              ["Read the schema", "reviews · 6 columns"],
              ["Ran a query", "3 rows · 11 ms"],
            ].map(([tool, result], i) => (
              <div
                key={i}
                className="flex w-fit items-center gap-2.5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 text-[12px]"
              >
                <CheckIcon className="size-3.5 text-[#57ab5a]" strokeWidth={2.5} />
                <span className="text-white/45">stroke</span>
                <span className="text-white/80">{tool}</span>
                <span className="text-white/30">{result}</span>
              </div>
            ))}
          </div>
          <div className="max-w-[90%] space-y-2 text-white/75">
            <p>Three products account for most of this month's one-star reviews:</p>
            <ol className="space-y-1 pl-1 font-mono text-[12.5px] text-white/70">
              <li>1. Trail Runner 2 · 14 reviews, mostly sizing</li>
              <li>2. Insulated Bottle · 9 reviews, lid leaks</li>
              <li>3. Daypack 22L · 6 reviews, zipper</li>
            </ol>
          </div>
        </div>
      </Panel>
    </div>
  );
}
