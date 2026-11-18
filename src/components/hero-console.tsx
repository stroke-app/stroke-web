import { SiElasticsearch, SiMongodb, SiPostgresql, SiRedis } from "@icons-pack/react-simple-icons";
import { DatabaseIcon, PlayIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "#/lib/utils";

/**
 * The hero's live console: a small Stroke window, built in code, that types a
 * real query for each kind of database and streams the result into a grid.
 * It cycles on its own; clicking a connection jumps to it. With reduced
 * motion it shows each finished query and result, still clickable.
 */

type Tok = [text: string, kind?: "kw" | "str" | "num" | "fn" | "p" | "c"];

export type Scene = {
  id: string;
  engine: string;
  conn: string;
  Icon: React.ComponentType<{ className?: string; color?: string }>;
  color: string;
  lang: string;
  query: Tok[][];
  cols: string[];
  rows: string[][];
  ms: number;
};

export const SCENES: Scene[] = [
  {
    id: "pg",
    engine: "Postgres",
    conn: "prod",
    Icon: SiPostgresql,
    color: "#699eca",
    lang: "SQL",
    query: [
      [["SELECT", "kw"], [" name, plan, "], ["sum", "fn"], ["(amount) "], ["AS", "kw"], [" mrr"]],
      [
        ["FROM", "kw"],
        [" accounts "],
        ["JOIN", "kw"],
        [" invoices "],
        ["USING", "kw"],
        [" (account_id)"],
      ],
      [["WHERE", "kw"], [" plan = "], ["'pro'", "str"], [" "], ["GROUP BY", "kw"], [" 1, 2"]],
      [
        ["ORDER BY", "kw"],
        [" mrr "],
        ["DESC", "kw"],
        [" "],
        ["LIMIT", "kw"],
        [" "],
        ["5", "num"],
        [";", "p"],
      ],
    ],
    cols: ["name", "plan", "mrr"],
    rows: [
      ["Globex", "pro", "4,820.00"],
      ["Initech", "pro", "3,975.50"],
      ["Hooli", "pro", "3,110.00"],
      ["Umbrella", "pro", "2,640.25"],
      ["Acme", "pro", "2,180.00"],
    ],
    ms: 8,
  },
  {
    id: "mongo",
    engine: "MongoDB",
    conn: "orders",
    Icon: SiMongodb,
    color: "#47a248",
    lang: "mongosh",
    query: [
      [
        ["db", "fn"],
        ["."],
        ["orders", "fn"],
        ["."],
        ["find", "fn"],
        ["({ status: "],
        ['"shipped"', "str"],
        [" })"],
      ],
      [["  ."], ["sort", "fn"], ["({ total: "], ["-1", "num"], [" })"]],
      [["  ."], ["limit", "fn"], ["("], ["4", "num"], [")"]],
    ],
    cols: ["_id", "customer", "total", "status"],
    rows: [
      ["6731…a9f2", "Ada L.", "1,240", "shipped"],
      ["6731…77c1", "Grace H.", "980", "shipped"],
      ["6730…1e0b", "Alan T.", "655", "shipped"],
      ["672f…c348", "Linus T.", "430", "shipped"],
    ],
    ms: 11,
  },
  {
    id: "redis",
    engine: "Redis",
    conn: "cache",
    Icon: SiRedis,
    color: "#ff4438",
    lang: "redis-cli",
    query: [[["HGETALL", "kw"], [" session:8f2a"]]],
    cols: ["field", "value"],
    rows: [
      ["user_id", "42"],
      ["plan", "pro"],
      ["last_seen", "2026-11-18T09:41:07Z"],
      ["ttl", "3540"],
    ],
    ms: 1,
  },
  {
    id: "dynamo",
    engine: "DynamoDB",
    conn: "events",
    Icon: DatabaseIcon,
    color: "#4d72f3",
    lang: "PartiQL",
    query: [
      [["SELECT", "kw"], [" * "], ["FROM", "kw"], [" "], ['"events"', "str"]],
      [
        ["WHERE", "kw"],
        [" pk = "],
        ["'user#42'", "str"],
        [" "],
        ["AND", "kw"],
        [" "],
        ["begins_with", "fn"],
        ["(sk, "],
        ["'2026-11'", "str"],
        [")"],
      ],
    ],
    cols: ["pk", "sk", "type"],
    rows: [
      ["user#42", "2026-11-18#0912", "login"],
      ["user#42", "2026-11-17#2230", "export"],
      ["user#42", "2026-11-17#1104", "query"],
    ],
    ms: 23,
  },
  {
    id: "es",
    engine: "Elasticsearch",
    conn: "logs",
    Icon: SiElasticsearch,
    color: "#00bfb3",
    lang: "Query DSL",
    query: [
      [["GET", "kw"], [" logs-*/_search"]],
      [
        ["{ "],
        ['"query"', "str"],
        [": { "],
        ['"match"', "str"],
        [": { "],
        ['"level"', "str"],
        [": "],
        ['"error"', "str"],
        [" } } }"],
      ],
    ],
    cols: ["@timestamp", "service", "message"],
    rows: [
      ["09:41:02", "api", "upstream timed out"],
      ["09:38:55", "billing", "card declined: 402"],
      ["09:31:17", "api", "pool exhausted (20/20)"],
    ],
    ms: 17,
  },
];

const TONE: Record<string, string> = {
  kw: "text-[#c4a7ff]",
  str: "text-[#9fe0a0]",
  num: "text-[#ffb27a]",
  fn: "text-[#8ab8ff]",
  p: "text-[#8f8f8f]",
  c: "text-[#5c5c5c]",
};

const TYPE_MS = 26;
const HOLD_MS = 3200;

/** Characters in a scene's query, newlines included. */
function queryLength(s: Scene) {
  return s.query.reduce((n, line) => n + line.reduce((m, [t]) => m + t.length, 0) + 1, 0);
}

/** Each token with the character offset it starts at (newlines count one). */
function layout(scene: Scene) {
  const lines: { text: string; kind?: string; at: number }[][] = [];
  let at = 0;
  for (const line of scene.query) {
    const toks = line.map(([text, kind]) => {
      const t = { text, kind, at };
      at += text.length;
      return t;
    });
    lines.push(toks);
    at += 1;
  }
  return lines;
}

function Query({ scene, shown }: { scene: Scene; shown: number }) {
  return (
    <>
      {layout(scene).map((line, li) => (
        <div key={li} className="flex min-h-[1.6em]">
          <span className="w-7 shrink-0 text-right text-[#3d3d3d] tabular-nums select-none">
            {li + 1}
          </span>
          <span className="pl-4 whitespace-pre">
            {line
              .filter((t) => t.at < shown)
              .map((t, i) => (
                <span key={i} className={t.kind ? TONE[t.kind] : undefined}>
                  {t.text.slice(0, shown - t.at)}
                </span>
              ))}
          </span>
        </div>
      ))}
    </>
  );
}

export function HeroConsole({ index, onIndex }: { index: number; onIndex: (i: number) => void }) {
  const scene = SCENES[index]!;
  const total = queryLength(scene);
  const [typed, setTyped] = useState(0);
  const [rowsShown, setRowsShown] = useState(0);
  const [still, setStill] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // A new scene starts from an empty editor (or complete, with reduced motion).
  useEffect(() => {
    setTyped(still ? total : 0);
    setRowsShown(still ? scene.rows.length : 0);
  }, [index, still, total, scene.rows.length]);

  // Type, then stream the rows, then hold and move on.
  useEffect(() => {
    if (still || !visible) return;
    let t: ReturnType<typeof setTimeout>;
    if (typed < total) {
      t = setTimeout(() => setTyped((n) => Math.min(total, n + 2)), TYPE_MS);
    } else if (rowsShown < scene.rows.length) {
      t = setTimeout(() => setRowsShown((n) => n + 1), rowsShown === 0 ? 260 : 90);
    } else if (!paused) {
      t = setTimeout(() => onIndex((index + 1) % SCENES.length), HOLD_MS);
    }
    return () => clearTimeout(t);
  }, [typed, total, rowsShown, scene.rows.length, paused, still, visible, index, onIndex]);

  const running = typed >= total && rowsShown === 0 && !still;
  const done = rowsShown >= scene.rows.length;

  return (
    <div
      ref={root}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="keep-dark dark grid grid-cols-1 overflow-hidden rounded-xl bg-[#0a0a0a] text-[#e8e8e8] shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_1px_0_0_rgb(255_255_255/0.06)_inset,0_40px_100px_-30px_rgb(0_0_0/0.8)] md:grid-cols-[13.5rem_minmax(0,1fr)]"
    >
      {/* Connections */}
      <div className="hidden border-r border-white/[0.07] bg-[#070707] md:block">
        <div className="flex h-10 items-center gap-1.5 border-b border-white/[0.07] px-3.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <p className="px-3.5 pt-4 pb-2 text-[11px] font-medium tracking-[0.06em] text-[#5c5c5c] uppercase">
          Connections
        </p>
        <ul className="px-2 pb-3" role="tablist" aria-label="Example databases">
          {SCENES.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                role="tab"
                aria-selected={i === index}
                onClick={() => onIndex(i)}
                className={cn(
                  "flex h-9 w-full items-center gap-2.5 rounded-md px-2 text-left text-[13px] transition-colors duration-150",
                  i === index
                    ? "bg-white/[0.07] text-white"
                    : "text-[#8f8f8f] hover:bg-white/[0.04] hover:text-[#d0d0d0]",
                )}
              >
                <s.Icon className="size-3.5 shrink-0" color={s.color} />
                <span className="min-w-0 flex-1 truncate">{s.conn}</span>
                <span className="text-[11px] text-[#5c5c5c]">{s.engine}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex min-w-0 flex-col">
        {/* Tab row */}
        <div className="flex h-10 items-center gap-3 border-b border-white/[0.07] px-4 text-[12px]">
          <span className="flex items-center gap-2 text-[#d0d0d0]">
            <scene.Icon className="size-3.5" color={scene.color} />
            {scene.conn}
            <span className="text-[#5c5c5c]">· {scene.lang}</span>
          </span>
          <span
            className={cn(
              "ml-auto flex h-6 items-center gap-1.5 rounded-md px-2 text-[11px] transition-colors duration-200",
              running ? "bg-[#f5b400] text-black" : "bg-white/[0.06] text-[#8f8f8f]",
            )}
          >
            <PlayIcon className="size-3" />
            Run
            <span className="opacity-60">⌘↵</span>
          </span>
        </div>

        {/* Editor */}
        <div
          className="min-h-[8.5rem] px-1 py-4 font-mono text-[12.5px] leading-[1.6] md:text-[13px]"
          aria-label={`${scene.lang} query`}
        >
          <Query scene={scene} shown={typed} />
          {typed < total && (
            <span className="caret-blink ml-11 inline-block h-4 w-[7px] translate-y-0.5 bg-[#f5b400]" />
          )}
        </div>

        {/* Result */}
        <div className="border-t border-white/[0.07]">
          <table className="w-full table-fixed border-collapse text-left font-mono text-[12px]">
            <thead>
              <tr className="border-b border-white/[0.07] text-[#6b6b6b]">
                {scene.cols.map((c) => (
                  <th key={c} className="truncate px-4 py-2 font-normal">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }, (_, r) => {
                const row = r < rowsShown ? scene.rows[r] : undefined;
                return (
                  <tr
                    key={r}
                    className={cn(
                      "h-8 border-b border-white/[0.04]",
                      row && "animate-in duration-200 fade-in-0",
                    )}
                  >
                    {scene.cols.map((c, ci) => (
                      <td
                        key={c}
                        className={cn(
                          "truncate px-4",
                          ci === 0 ? "text-[#e8e8e8]" : "text-[#a8a8a8]",
                        )}
                      >
                        {row?.[ci] ?? ""}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex h-9 items-center justify-between px-4 text-[11px] text-[#6b6b6b]">
            <span className="flex items-center gap-2">
              <span
                className={cn("size-1.5 rounded-full", done ? "bg-[#28c840]" : "bg-[#5c5c5c]")}
              />
              {done ? `${scene.rows.length} rows` : running ? "Running" : "Ready"}
            </span>
            <span className="tabular-nums">{done ? `${scene.ms} ms` : ""}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
