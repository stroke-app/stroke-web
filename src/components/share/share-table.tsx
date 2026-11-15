import { ArrowDown, ArrowUp, Check, Copy, Download, Search } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "#/lib/utils";

const ROW_H = 32;
const OVERSCAN = 12;

function cellText(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function csvEscape(s: string): string {
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * A read-only grid for a shared result: sort by any column, filter across all
 * of them, click a cell to copy it, export CSV. Rows are windowed (only the
 * ones on screen exist in the DOM), so a 100,000-row share scrolls like ten.
 */
export function ShareTable({
  columns,
  rows,
  title,
  masked = [],
  totalRows,
}: {
  columns: { name: string; type?: string }[];
  rows: unknown[][];
  title: string;
  masked?: string[];
  totalRows?: number;
}) {
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query.trim().toLowerCase());
  const [sort, setSort] = useState<{ col: number; dir: 1 | -1 } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewH, setViewH] = useState(600);

  // Lower-cased text per cell, once: filtering a large share re-reads it per keystroke.
  const text = useMemo(() => rows.map((r) => r.map((v) => cellText(v))), [rows]);
  const lower = useMemo(() => text.map((r) => r.join("\u0000").toLowerCase()), [text]);

  const order = useMemo(() => {
    let idx = rows.map((_, i) => i);
    if (q) idx = idx.filter((i) => lower[i]!.includes(q));
    if (sort) {
      const { col, dir } = sort;
      const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
      idx.sort((a, b) => {
        const va = rows[a]![col];
        const vb = rows[b]![col];
        if (va === null || va === undefined) return 1;
        if (vb === null || vb === undefined) return -1;
        if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
        return collator.compare(text[a]![col]!, text[b]![col]!) * dir;
      });
    }
    return idx;
  }, [rows, text, lower, q, sort]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setViewH(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 1400);
    return () => clearTimeout(t);
  }, [copied]);

  const first = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN);
  const last = Math.min(order.length, Math.ceil((scrollTop + viewH) / ROW_H) + OVERSCAN);

  const downloadCsv = () => {
    const lines = [columns.map((c) => csvEscape(c.name)).join(",")];
    for (const i of order) lines.push(text[i]!.map(csvEscape).join(","));
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^\w.-]+/g, "_") || "share"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCell = (s: string, key: string) => {
    void navigator.clipboard.writeText(s).then(() => setCopied(key));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
        <div className="relative w-72 max-w-full">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter rows"
            aria-label="Filter rows"
            className="h-8 w-full rounded-lg bg-muted pr-2 pl-8 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <span className="text-[12px] text-muted-foreground tabular-nums">
          {order.length === rows.length
            ? `${rows.length.toLocaleString()} rows`
            : `${order.length.toLocaleString()} of ${rows.length.toLocaleString()} rows`}
          {totalRows && totalRows > rows.length
            ? ` · first ${rows.length.toLocaleString()} of ${totalRows.toLocaleString()}`
            : ""}
        </span>
        {masked.length > 0 && (
          <span className="hidden text-[12px] text-faint sm:inline">
            · {masked.length} column{masked.length === 1 ? "" : "s"} masked by the sharer
          </span>
        )}
        <button
          type="button"
          onClick={downloadCsv}
          className="ms-auto inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-muted-foreground transition-[background-color,color,scale] duration-150 ease-out hover:bg-accent hover:text-foreground active:scale-[0.97]"
        >
          <Download className="size-3.5" /> CSV
        </button>
      </div>

      <div
        ref={scroller}
        className="relative min-h-0 flex-1 overflow-auto"
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <table className="w-max min-w-full border-separate border-spacing-0 font-mono text-[12.5px]">
          <thead className="sticky top-0 z-10 bg-background">
            <tr>
              {columns.map((c, ci) => (
                <th
                  key={ci}
                  scope="col"
                  className="h-9 border-r border-b border-border p-0 text-left font-sans font-medium whitespace-nowrap"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSort((s) =>
                        s?.col === ci
                          ? s.dir === 1
                            ? { col: ci, dir: -1 }
                            : null
                          : { col: ci, dir: 1 },
                      )
                    }
                    className="flex h-9 w-full items-center gap-1.5 px-3 text-[12.5px] text-foreground hover:bg-muted/60"
                    title="Sort"
                  >
                    {c.name}
                    {c.type && (
                      <span className="font-mono text-[11px] font-normal text-faint">{c.type}</span>
                    )}
                    {sort?.col === ci &&
                      (sort.dir === 1 ? (
                        <ArrowUp className="size-3" />
                      ) : (
                        <ArrowDown className="size-3" />
                      ))}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {first > 0 && (
              <tr aria-hidden="true">
                <td colSpan={columns.length} style={{ height: first * ROW_H }} />
              </tr>
            )}
            {order.slice(first, last).map((ri) => (
              <tr key={ri} className="hover:bg-accent/50">
                {text[ri]!.map((s, ci) => {
                  const key = `${ri}:${ci}`;
                  const isNull = rows[ri]![ci] === null || rows[ri]![ci] === undefined;
                  return (
                    <td
                      key={ci}
                      onClick={() => copyCell(s, key)}
                      title={s.length > 60 ? s.slice(0, 2000) : "Click to copy"}
                      style={{ height: ROW_H }}
                      className={cn(
                        "max-w-[360px] cursor-copy truncate border-r border-b border-border/60 px-3 whitespace-nowrap",
                        isNull ? "text-faint italic" : "text-soft",
                      )}
                    >
                      {copied === key ? (
                        <span className="inline-flex items-center gap-1 text-foreground">
                          <Check className="size-3" /> Copied
                        </span>
                      ) : isNull ? (
                        "NULL"
                      ) : (
                        s
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {last < order.length && (
              <tr aria-hidden="true">
                <td colSpan={columns.length} style={{ height: (order.length - last) * ROW_H }} />
              </tr>
            )}
          </tbody>
        </table>
        {order.length === 0 && (
          <p className="p-6 text-center text-[13px] text-muted-foreground">
            No rows match “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1400);
    return () => clearTimeout(t);
  }, [done]);
  return (
    <button
      type="button"
      onClick={() => void navigator.clipboard.writeText(text).then(() => setDone(true))}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-muted-foreground transition-[background-color,color,scale] duration-150 ease-out hover:bg-accent hover:text-foreground active:scale-[0.97]"
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}{" "}
      {done ? "Copied" : label}
    </button>
  );
}
