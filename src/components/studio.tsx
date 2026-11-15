import { Link } from "@tanstack/react-router";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  EyeIcon,
  KeyRoundIcon,
  Loader2Icon,
  PlayIcon,
  RefreshCwIcon,
  SearchIcon,
  TableIcon,
  TerminalIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { StrokeIcon } from "#/components/stroke-icon";
import {
  BridgeError,
  bridgeClient,
  cellText,
  type BridgeClient,
  type BridgeInfo,
  type Column,
  type Result,
  type Session,
  type Sort,
  type TableRef,
} from "#/lib/studio-bridge";
import { cn } from "#/lib/utils";

const PAGE = 100;

const ENGINE_LABEL: Record<string, string> = {
  postgres: "PostgreSQL",
  mysql: "MySQL",
  sqlite: "SQLite",
};

type View = { kind: "table"; table: TableRef } | { kind: "sql" };

const tableKey = (t: TableRef) => `${t.schema}.${t.name}`;

export function Studio({ session, onLeave }: { session: Session; onLeave: () => void }) {
  const client = useMemo(() => bridgeClient(session), [session]);
  const [info, setInfo] = useState<BridgeInfo | null>(null);
  const [tables, setTables] = useState<TableRef[] | null>(null);
  const [error, setError] = useState<BridgeError | null>(null);
  const [view, setView] = useState<View>({ kind: "sql" });
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    setError(null);
    try {
      const [i, t] = await Promise.all([client.info(), client.tables()]);
      setInfo(i);
      setTables(t);
      setView((v) => (v.kind === "sql" && t.length ? { kind: "table", table: t[0] } : v));
    } catch (e) {
      setError(e instanceof BridgeError ? e : new BridgeError(String(e)));
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error && !info) return <Unreachable error={error} onRetry={load} onLeave={onLeave} />;
  if (!info || !tables) {
    return (
      <div className="flex h-dvh items-center justify-center gap-2 text-[13px] text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" /> Connecting to the bridge…
      </div>
    );
  }

  const showSchema = new Set(tables.map((t) => t.schema)).size > 1;
  const q = filter.trim().toLowerCase();
  const shown = q ? tables.filter((t) => tableKey(t).toLowerCase().includes(q)) : tables;

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-3">
        <Link to="/" aria-label="Stroke home" className="flex items-center">
          <StrokeIcon className="size-5" />
        </Link>
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="truncate text-[13px] font-[510]">{info.name || info.database}</span>
          <span className="truncate text-[12px] text-muted-foreground">
            {ENGINE_LABEL[info.engine] ?? info.engine} · {info.database} · {info.host}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => void load()}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-ink/[0.06] hover:text-foreground"
            aria-label="Reload tables"
            title="Reload tables"
          >
            <RefreshCwIcon className="size-3.5" />
          </button>
          <Link
            to="/download"
            className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] text-muted-foreground hover:bg-ink/[0.06] hover:text-foreground"
          >
            <DownloadIcon className="size-3.5" />
            <span className="hidden sm:inline">Get the desktop app</span>
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border md:flex">
          <button
            type="button"
            onClick={() => setView({ kind: "sql" })}
            className={cn(
              "mx-2 mt-2 flex h-8 items-center gap-2 rounded-md px-2 text-[13px]",
              view.kind === "sql"
                ? "bg-ink/[0.07] text-foreground"
                : "text-muted-foreground hover:bg-ink/[0.04]",
            )}
          >
            <TerminalIcon className="size-3.5 shrink-0" /> SQL console
          </button>
          <label className="mx-2 mt-2 flex h-8 items-center gap-2 rounded-md border border-border px-2 text-[13px]">
            <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={`Filter ${tables.length} tables`}
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-faint"
              aria-label="Filter tables"
            />
          </label>
          <nav className="mt-1 min-h-0 flex-1 overflow-y-auto px-2 pb-2" aria-label="Tables">
            {shown.map((t) => {
              const active = view.kind === "table" && tableKey(view.table) === tableKey(t);
              const Icon = t.kind === "view" ? EyeIcon : TableIcon;
              return (
                <button
                  key={tableKey(t)}
                  type="button"
                  onClick={() => setView({ kind: "table", table: t })}
                  className={cn(
                    "flex h-7 w-full min-w-0 items-center gap-2 rounded-md px-2 text-left text-[13px]",
                    active
                      ? "bg-ink/[0.07] text-foreground"
                      : "text-muted-foreground hover:bg-ink/[0.04] hover:text-foreground",
                  )}
                  title={tableKey(t)}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="truncate">
                    {showSchema && <span className="text-faint">{t.schema}.</span>}
                    {t.name}
                  </span>
                </button>
              );
            })}
            {!shown.length && (
              <p className="px-2 py-3 text-[12.5px] text-muted-foreground">
                {tables.length ? "No table matches." : "No tables yet."}
              </p>
            )}
          </nav>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <MobileTablePicker tables={tables} view={view} onPick={setView} />
          {view.kind === "table" ? (
            <TableView key={tableKey(view.table)} client={client} table={view.table} />
          ) : (
            <SqlConsole client={client} engine={info.engine} />
          )}
        </main>
      </div>
    </div>
  );
}

function MobileTablePicker({
  tables,
  view,
  onPick,
}: {
  tables: TableRef[];
  view: View;
  onPick: (v: View) => void;
}) {
  const value = view.kind === "table" ? tableKey(view.table) : "";
  return (
    <div className="border-b border-border p-2 md:hidden">
      <select
        value={value}
        onChange={(e) => {
          const t = tables.find((x) => tableKey(x) === e.target.value);
          onPick(t ? { kind: "table", table: t } : { kind: "sql" });
        }}
        className="h-8 w-full rounded-md border border-border bg-background px-2 text-[13px]"
        aria-label="Table"
      >
        <option value="">SQL console</option>
        {tables.map((t) => (
          <option key={tableKey(t)} value={tableKey(t)}>
            {tableKey(t)}
          </option>
        ))}
      </select>
    </div>
  );
}

function TableView({ client, table }: { client: BridgeClient; table: TableRef }) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [page, setPage] = useState<(Result & { total: number | null; estimated: boolean }) | null>(
    null,
  );
  const [offset, setOffset] = useState(0);
  const [sort, setSort] = useState<Sort | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .columns(table.schema, table.name)
      .then(setColumns)
      .catch(() => setColumns([]));
  }, [client, table]);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    client
      .rows({ schema: table.schema, table: table.name, limit: PAGE, offset, sort })
      .then((r) => live && setPage(r))
      .catch((e) => live && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [client, table, offset, sort]);

  const total = page?.total ?? null;
  const end = offset + (page?.rows.length ?? 0);
  const meta = new Map(columns.map((c) => [c.name, c]));

  const toggleSort = (column: string) => {
    setOffset(0);
    setSort((s) =>
      s?.column !== column
        ? { column, dir: "asc" }
        : s.dir === "asc"
          ? { column, dir: "desc" }
          : null,
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3 text-[12.5px]">
        <span className="font-[510]">{table.name}</span>
        <span className="text-muted-foreground">
          {total === null ? "" : `${page?.estimated ? "about " : ""}${total.toLocaleString()} rows`}
        </span>
        {loading && <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />}
        <div className="ml-auto flex items-center gap-1 text-muted-foreground">
          <span className="tabular-nums">
            {page?.rows.length ? `${(offset + 1).toLocaleString()}–${end.toLocaleString()}` : ""}
          </span>
          <PagerButton
            label="Previous page"
            disabled={offset === 0 || loading}
            onClick={() => setOffset(Math.max(0, offset - PAGE))}
          >
            <ChevronLeftIcon className="size-3.5" />
          </PagerButton>
          <PagerButton
            label="Next page"
            disabled={
              loading ||
              (page?.rows.length ?? 0) < PAGE ||
              (total !== null && !page?.estimated && end >= total)
            }
            onClick={() => setOffset(offset + PAGE)}
          >
            <ChevronRightIcon className="size-3.5" />
          </PagerButton>
        </div>
      </div>
      {error ? (
        <ErrorBox message={error} />
      ) : (
        <Grid
          result={page}
          header={(name) => {
            const c = meta.get(name);
            const sorted = sort?.column === name ? sort.dir : null;
            return (
              <button
                type="button"
                onClick={() => toggleSort(name)}
                className="flex w-full items-center gap-1.5 text-left"
                title={c ? `${c.type}${c.nullable ? "" : " not null"}` : name}
              >
                {c?.primaryKey && <KeyRoundIcon className="size-3 shrink-0 text-amber-500" />}
                <span className="truncate">{name}</span>
                {c && <span className="truncate font-normal text-faint">{c.type}</span>}
                {sorted === "asc" && <ArrowUpIcon className="size-3 shrink-0" />}
                {sorted === "desc" && <ArrowDownIcon className="size-3 shrink-0" />}
              </button>
            );
          }}
        />
      )}
    </div>
  );
}

function PagerButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded-md hover:bg-ink/[0.06] hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function SqlConsole({ client, engine }: { client: BridgeClient; engine: string }) {
  const [sql, setSql] = useState(() => {
    try {
      return sessionStorage.getItem("stroke-studio-sql") ?? "";
    } catch {
      return "";
    }
  });
  const [result, setResult] = useState<(Result & { durationMs: number }) | null>(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("stroke-studio-sql", sql);
    } catch {
      // not kept
    }
  }, [sql]);

  const run = async () => {
    const el = ref.current;
    const selected =
      el && el.selectionEnd > el.selectionStart
        ? sql.slice(el.selectionStart, el.selectionEnd)
        : sql;
    if (!selected.trim() || running) return;
    setRunning(true);
    setError("");
    try {
      setResult(await client.query(selected));
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  const summary = result
    ? result.columns.length
      ? `${result.rows.length.toLocaleString()} rows`
      : `${result.command || "Done"}${result.rowCount != null ? ` · ${result.rowCount.toLocaleString()} rows affected` : ""}`
    : "";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative h-[38%] min-h-32 shrink-0 border-b border-border">
        <textarea
          ref={ref}
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void run();
            }
          }}
          spellCheck={false}
          placeholder={`Write ${ENGINE_LABEL[engine] ?? "SQL"} here. Ctrl+Enter or ⌘Enter runs it, or just the selection.`}
          aria-label="SQL"
          className="size-full resize-none bg-transparent p-3 font-mono text-[13px] leading-relaxed outline-none placeholder:text-faint"
        />
        <button
          type="button"
          onClick={() => void run()}
          disabled={running || !sql.trim()}
          className="absolute right-3 bottom-3 flex h-8 items-center gap-1.5 rounded-full bg-primary/90 px-3.5 text-[12.5px] font-[510] text-primary-foreground hover:bg-primary disabled:opacity-50"
        >
          {running ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : (
            <PlayIcon className="size-3.5" />
          )}
          Run
        </button>
      </div>
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3 text-[12.5px] text-muted-foreground">
        {summary}
        {result && <span className="tabular-nums">· {result.durationMs} ms</span>}
      </div>
      {error ? (
        <ErrorBox message={error} />
      ) : result?.columns.length ? (
        <Grid result={result} header={(name) => <span className="truncate">{name}</span>} />
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}

function Grid({
  result,
  header,
}: {
  result: Result | null;
  header: (name: string) => React.ReactNode;
}) {
  if (!result) return <div className="flex-1" />;
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <table className="w-max min-w-full border-separate border-spacing-0 font-mono text-[12.5px]">
        <thead className="sticky top-0 z-10 bg-background">
          <tr>
            <th className="w-12 border-r border-b border-border px-2 py-1.5 text-right font-normal text-faint">
              #
            </th>
            {result.columns.map((c, i) => (
              <th
                key={`${c}-${i}`}
                className="max-w-80 border-r border-b border-border px-2.5 py-1.5 text-left font-sans font-[510]"
              >
                {header(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, r) => (
            <tr key={r} className="hover:bg-ink/[0.03]">
              <td className="border-r border-b border-border px-2 py-1 text-right text-faint tabular-nums">
                {r + 1}
              </td>
              {row.map((v, i) => (
                <td
                  key={i}
                  className="max-w-80 truncate border-r border-b border-border px-2.5 py-1"
                  title={cellText(v)}
                >
                  {v === null ? <span className="text-faint italic">NULL</span> : cellText(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!result.rows.length && (
        <p className="px-3 py-6 text-[13px] text-muted-foreground">No rows.</p>
      )}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="m-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/[0.06] p-3 font-mono text-[12.5px] whitespace-pre-wrap text-red-600 dark:text-red-400">
      <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
      {message}
    </div>
  );
}

function Unreachable({
  error,
  onRetry,
  onLeave,
}: {
  error: BridgeError;
  onRetry: () => void;
  onLeave: () => void;
}) {
  const safari =
    typeof navigator !== "undefined" &&
    /Safari\//.test(navigator.userAgent) &&
    !/Chrome|Chromium|Edg\//.test(navigator.userAgent);
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-md">
        <StrokeIcon className="size-8" />
        <h1 className="mt-5 text-[22px] font-[510]">
          {error.unreachable ? "Can't reach your database" : "The bridge said no"}
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
          {error.unreachable ? (
            safari ? (
              <>
                Safari blocks secure pages from talking to programs on your own computer. Open this
                link in Chrome, Edge or Firefox, or use the desktop app.
              </>
            ) : (
              <>
                The studio talks to your database through <code>npx strokedb</code> running in your
                terminal. If you stopped it, start it again: it opens a fresh link.
              </>
            )
          ) : (
            error.message
          )}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="flex h-9 items-center gap-1.5 rounded-full bg-ink/[0.06] px-4 text-[13px] font-[510] hover:bg-ink/[0.1]"
          >
            <RefreshCwIcon className="size-3.5" /> Try again
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="flex h-9 items-center rounded-full px-4 text-[13px] text-muted-foreground hover:bg-ink/[0.05] hover:text-foreground"
          >
            How it works
          </button>
        </div>
      </div>
    </div>
  );
}
