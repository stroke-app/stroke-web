import { Link } from "@tanstack/react-router";
import {
  DownloadIcon,
  EyeIcon,
  Loader2Icon,
  PanelLeftIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  TableIcon,
  TerminalIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { StrokeIcon } from "#/components/stroke-icon";
import { PresenceContext, usePresence, type Peer } from "#/lib/relay/presence";
import { useSharedConsole } from "#/lib/relay/shared-console";
import {
  BridgeError,
  bridgeClient,
  findTable,
  type BridgeInfo,
  type Session,
  type TableRef,
} from "#/lib/studio-bridge";
import { cn } from "#/lib/utils";

import { SqlTab } from "./sql-tab";
import { StudioThemeMenu, useStudioPalette } from "./studio-theme";
import { TableTab } from "./table-tab";

const ENGINE_LABEL: Record<string, string> = {
  postgres: "PostgreSQL",
  mysql: "MySQL",
  sqlite: "SQLite",
};

type Tab =
  | { id: string; kind: "table"; table: TableRef }
  | { id: string; kind: "sql"; title: string; initial?: string; shared?: boolean };

/** The shared console's tab, and where it says people are (presence `tab`). */
const SHARED_CONSOLE_ID = "sql:shared";
const CONSOLE_TAB = "console";

const keyOf = (t: { schema: string; name: string }) => `${t.schema}.${t.name}`;
const fmtCount = (n: number | null | undefined) =>
  n == null
    ? ""
    : n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1000
        ? `${(n / 1000).toFixed(1)}k`
        : String(n);

/**
 * The web studio, laid out like the desktop app: tables in a sidebar with
 * their row counts, a tab per table and per SQL console, a status bar.
 */
export function Studio({ session, onLeave }: { session: Session; onLeave: () => void }) {
  const client = useMemo(() => bridgeClient(session), [session]);
  const [info, setInfo] = useState<BridgeInfo | null>(null);
  const [tables, setTables] = useState<TableRef[] | null>(null);
  const [error, setError] = useState<BridgeError | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [schemaPick, setSchemaPick] = useState<string>("");
  const [sidebar, setSidebar] = useState(true);
  const [columnsByTable, setColumnsByTable] = useState<Record<string, string[]>>({});
  const presence = usePresence(
    session.kind === "relay" ? session.relay : null,
    session.kind === "relay" ? session.key : null,
  );
  const { publish } = presence;
  const sharedConsole = useSharedConsole(session.kind === "relay" ? presence : null);
  const sqlSeq = useRef(0);
  const [palette, setPalette] = useStudioPalette();
  const tabStrip = useRef<HTMLDivElement>(null);

  const loadTables = useCallback(async () => {
    try {
      setTables(await client.tables());
    } catch {
      // The sidebar keeps what it had; the next action will say what failed.
    }
  }, [client]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [i, t] = await Promise.all([client.info(), client.tables()]);
      setInfo(i);
      setTables(t);
      setTabs((cur) => {
        if (cur.length) return cur;
        // The link can name the table to start on (an agent's "show me users").
        const first =
          (session.open ? findTable(t, session.open) : undefined) ??
          t.find((x) => x.kind === "table") ??
          t[0];
        const tab: Tab = first
          ? { id: `t:${keyOf(first)}`, kind: "table", table: first }
          : { id: "sql:1", kind: "sql", title: "SQL 1" };
        setActiveId(tab.id);
        return [tab];
      });
    } catch (e) {
      setError(e instanceof BridgeError ? e : new BridgeError(String(e)));
    }
  }, [client, session.open]);

  useEffect(() => {
    void load();
  }, [load]);

  // The host showing everyone a table: an AI agent through `strokedb mcp`.
  const { onOpen } = presence;
  const showTable = useEffectEvent((ref: string, by: string) => {
    const t = tables ? findTable(tables, ref) : undefined;
    if (!t) return;
    setSchemaPick(t.schema);
    openTable(t);
    toast(`${by} opened ${t.name}`);
  });
  useEffect(() => onOpen(showTable), [onOpen]);

  // Others see which table this page is on.
  const activeTable = tabs.find((t) => t.id === activeId);
  const activeKey =
    activeTable?.kind === "table"
      ? keyOf(activeTable.table)
      : activeTable?.kind === "sql" && activeTable.shared
        ? CONSOLE_TAB
        : null;
  useEffect(() => {
    publish({ tab: activeKey, cell: null, pointer: null, editing: null });
  }, [activeKey, publish]);

  // The active tab stays in view when the strip overflows.
  useEffect(() => {
    if (!activeId) return;
    const el = tabStrip.current?.querySelector<HTMLElement>(`[data-tab="${CSS.escape(activeId)}"]`);
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeId, tabs.length]);

  const schemas = useMemo(() => [...new Set((tables ?? []).map((t) => t.schema))], [tables]);
  const defaultSchema = schemas.includes("public")
    ? "public"
    : schemas.includes("main")
      ? "main"
      : (schemas[0] ?? "");
  const schema = schemaPick && schemas.includes(schemaPick) ? schemaPick : defaultSchema;
  const multiSchema = schemas.length > 1;

  // Autocomplete: every table now, their columns as they arrive.
  const sqlOpen = tabs.some((t) => t.kind === "sql");
  useEffect(() => {
    if (!sqlOpen || !tables) return;
    let live = true;
    const todo = tables.filter((t) => !(keyOf(t) in columnsByTable)).slice(0, 60);
    void (async () => {
      for (let i = 0; i < todo.length && live; i += 6) {
        const chunk = todo.slice(i, i + 6);
        const got = await Promise.all(
          chunk.map((t) =>
            client
              .columns(t.schema, t.name)
              .then((c) => c.map((x) => x.name))
              .catch(() => [] as string[]),
          ),
        );
        if (!live) return;
        setColumnsByTable((cur) => {
          const next = { ...cur };
          chunk.forEach((t, k) => (next[keyOf(t)] = got[k] ?? []));
          return next;
        });
      }
    })();
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sqlOpen, tables, client]);
  const completion = useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const t of tables ?? []) {
      const cols = columnsByTable[keyOf(t)] ?? [];
      out[t.schema === defaultSchema ? t.name : keyOf(t)] = cols;
    }
    return out;
  }, [tables, columnsByTable, defaultSchema]);

  function openTable(t: TableRef) {
    const id = `t:${keyOf(t)}`;
    setTabs((cur) =>
      cur.some((x) => x.id === id) ? cur : [...cur, { id, kind: "table", table: t }],
    );
    setActiveId(id);
  }
  function openTableByName(s: string, name: string) {
    const t = tables?.find((x) => x.schema === s && x.name === name) ?? {
      schema: s,
      name,
      kind: "table" as const,
      rows: null,
    };
    openTable(t);
  }
  function newSql(initial?: string) {
    sqlSeq.current += 1;
    const id = `sql:${Date.now()}:${sqlSeq.current}`;
    setTabs((cur) => [
      ...cur,
      { id, kind: "sql", title: `SQL ${cur.filter((t) => t.kind === "sql").length + 1}`, initial },
    ]);
    setActiveId(id);
  }
  /** The one console everyone on the link edits together. */
  function openSharedConsole() {
    setTabs((cur) =>
      cur.some((t) => t.id === SHARED_CONSOLE_ID)
        ? cur
        : [...cur, { id: SHARED_CONSOLE_ID, kind: "sql", title: "Shared console", shared: true }],
    );
    setActiveId(SHARED_CONSOLE_ID);
  }
  function closeTab(id: string) {
    setTabs((cur) => {
      const i = cur.findIndex((t) => t.id === id);
      const next = cur.filter((t) => t.id !== id);
      if (id === activeId) setActiveId(next[Math.min(i, next.length - 1)]?.id ?? null);
      return next;
    });
  }

  if (error && !info)
    return (
      <Unreachable
        error={error}
        onRetry={load}
        onLeave={onLeave}
        shared={session.kind === "relay"}
      />
    );
  if (!info || !tables) {
    return (
      <div className="studio flex h-dvh items-center justify-center gap-2 bg-background text-[13px] text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" /> Connecting to the bridge…
      </div>
    );
  }

  const features = info.features ?? [];
  const q = filter.trim().toLowerCase();
  const inSchema = tables.filter(
    (t) => t.schema === schema && (!q || t.name.toLowerCase().includes(q)),
  );
  const plain = inSchema.filter((t) => t.kind === "table");
  const views = inSchema.filter((t) => t.kind === "view");
  const active = tabs.find((t) => t.id === activeId) ?? null;

  const sideItem = (t: TableRef) => {
    const on = active?.kind === "table" && keyOf(active.table) === keyOf(t);
    const Icon = t.kind === "view" ? EyeIcon : TableIcon;
    return (
      <button
        key={keyOf(t)}
        type="button"
        onClick={() => openTable(t)}
        className={cn(
          "flex h-7 w-full min-w-0 items-center gap-2 rounded-md px-2 text-left font-mono text-[12.5px]",
          on
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        )}
        title={keyOf(t)}
      >
        <Icon className="size-3.5 shrink-0 opacity-70" />
        <span className="min-w-0 flex-1 truncate">{t.name}</span>
        {t.rows != null && (
          <span className="shrink-0 text-[11px] text-faint tabular-nums">{fmtCount(t.rows)}</span>
        )}
      </button>
    );
  };

  const engineLabel = info.label ?? ENGINE_LABEL[info.engine] ?? info.engine;
  const sidebarToggle = (
    <button
      type="button"
      onClick={() => setSidebar((v) => !v)}
      className="hidden size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground md:flex"
      aria-label={sidebar ? "Hide the sidebar" : "Show the sidebar"}
      title={sidebar ? "Hide the sidebar" : "Show the sidebar"}
      aria-pressed={sidebar}
    >
      <PanelLeftIcon className="size-4" />
    </button>
  );

  // No top bar: what it said (the database, the engine, Shared) heads the
  // sidebar, and the rest went to the status bar, so the rows start right
  // under the tabs.
  return (
    <PresenceContext value={presence}>
      <div
        className="studio flex h-dvh flex-col bg-background text-foreground"
        data-palette={palette || undefined}
      >
        <div className="flex min-h-0 flex-1">
          {/* Sidebar */}
          {sidebar && (
            <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
              {/* Which database this is, where the top bar used to say it. */}
              <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-2">
                <Link
                  to="/"
                  aria-label="Stroke home"
                  className="flex size-7 shrink-0 items-center justify-center rounded-md hover:bg-accent"
                >
                  <StrokeIcon className="size-4.5" />
                </Link>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate font-mono text-[12.5px] font-medium" title={info.database}>
                    {info.database}
                  </p>
                  <p
                    className="truncate text-[11px] text-muted-foreground"
                    title={`${engineLabel} · ${info.host}`}
                  >
                    {engineLabel} · {info.host}
                  </p>
                </div>
                {sidebarToggle}
              </div>
              {info.shared && (
                <p
                  className="mx-2 mt-2 rounded-md bg-muted px-2 py-1 text-[11.5px] text-muted-foreground"
                  title={
                    info.readonly
                      ? "Opened from a share link. You can browse and run SELECT queries; changes are off."
                      : "Opened from a share link. Changes reach the shared database."
                  }
                >
                  {info.readonly ? "Shared with you · read-only" : "Shared with you"}
                </p>
              )}
              <div className="flex items-center gap-1 p-2 pb-1">
                {multiSchema ? (
                  <select
                    value={schema}
                    onChange={(e) => setSchemaPick(e.target.value)}
                    className="h-7 min-w-0 flex-1 rounded-md border border-border bg-background px-2 font-mono text-[12.5px]"
                    aria-label="Schema"
                  >
                    {schemas.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="flex-1 truncate px-1 font-mono text-[12px] text-muted-foreground">
                    {schema}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => void loadTables()}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Reload tables"
                  title="Reload tables"
                >
                  <RefreshCwIcon className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => newSql()}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="New SQL console"
                  title="New SQL console"
                >
                  <TerminalIcon className="size-3.5" />
                </button>
              </div>
              <label className="mx-2 mb-1 flex h-7 items-center gap-2 rounded-md border border-border bg-background px-2 text-[12.5px]">
                <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter tables"
                  className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-faint"
                  aria-label="Filter tables"
                />
              </label>
              <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-2" aria-label="Tables">
                <p className="flex items-center justify-between px-2 pt-2 pb-1 text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                  Tables <span className="tabular-nums">{plain.length}</span>
                </p>
                {plain.map(sideItem)}
                {!plain.length && (
                  <p className="px-2 py-1 text-[12px] text-faint">
                    {q ? "No match." : "No tables."}
                  </p>
                )}
                {views.length > 0 && (
                  <>
                    <p className="flex items-center justify-between px-2 pt-3 pb-1 text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                      Views <span className="tabular-nums">{views.length}</span>
                    </p>
                    {views.map(sideItem)}
                  </>
                )}
              </nav>
            </aside>
          )}

          <main className="flex min-w-0 flex-1 flex-col">
            {/* Tab bar: the desktop app's pill tabs. With the sidebar hidden its
              toggle leads the strip, which is all the chrome there is. */}
            <div className="flex h-11 shrink-0 items-center gap-1 border-b border-border px-2">
              {!sidebar && sidebarToggle}
              <div
                ref={tabStrip}
                className="studio-tabs flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto"
                role="tablist"
                aria-label="Open tabs"
              >
                {tabs.map((t) => {
                  const on = t.id === activeId;
                  const label = t.kind === "table" ? t.table.name : t.title;
                  const Icon =
                    t.kind === "table"
                      ? t.table.kind === "view"
                        ? EyeIcon
                        : TableIcon
                      : t.shared
                        ? UsersIcon
                        : TerminalIcon;
                  return (
                    <div
                      key={t.id}
                      data-tab={t.id}
                      className={cn(
                        "group/tab flex h-7 max-w-56 min-w-0 shrink-0 items-center rounded-md transition-colors duration-150",
                        on
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                      )}
                      onAuxClick={(e) => e.button === 1 && closeTab(t.id)}
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={on}
                        onClick={() => setActiveId(t.id)}
                        className="flex h-full min-w-0 flex-1 items-center gap-1.5 rounded-md ps-2.5 pe-1 text-[12.5px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        title={t.kind === "table" ? keyOf(t.table) : t.title}
                      >
                        <Icon className="size-3.5 shrink-0 opacity-70" />
                        <span className={cn("truncate", t.kind === "table" && "font-mono")}>
                          {label}
                        </span>
                        {t.kind === "table" ? (
                          <PeerDots
                            peers={presence.peers.filter((p) => p.tab === keyOf(t.table))}
                          />
                        ) : (
                          t.shared && (
                            <PeerDots peers={presence.peers.filter((p) => p.tab === CONSOLE_TAB)} />
                          )
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => closeTab(t.id)}
                        aria-label={`Close ${label}`}
                        title="Close (middle-click)"
                        className={cn(
                          "me-1 flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-background/70 hover:text-foreground",
                          !on && "opacity-0 group-hover/tab:opacity-100 focus-visible:opacity-100",
                        )}
                      >
                        <XIcon className="size-3" />
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => newSql()}
                  aria-label="New SQL console"
                  title="New SQL console"
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <PlusIcon className="size-3.5" />
                </button>
                {sharedConsole && !tabs.some((t) => t.id === SHARED_CONSOLE_ID) && (
                  <button
                    type="button"
                    onClick={openSharedConsole}
                    title="One SQL console everyone on this link edits together"
                    className="flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-[12.5px] text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <UsersIcon className="size-3.5" aria-hidden="true" />
                    Shared console
                    <PeerDots peers={presence.peers.filter((p) => p.tab === CONSOLE_TAB)} />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile: tables as a picker */}
            <div className="border-b border-border p-2 md:hidden">
              <select
                value={active?.kind === "table" ? keyOf(active.table) : ""}
                onChange={(e) => {
                  const t = tables.find((x) => keyOf(x) === e.target.value);
                  if (t) openTable(t);
                }}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-[13px]"
                aria-label="Table"
              >
                <option value="">Pick a table…</option>
                {tables.map((t) => (
                  <option key={keyOf(t)} value={keyOf(t)}>
                    {keyOf(t)}
                  </option>
                ))}
              </select>
            </div>

            {/* Every tab stays mounted, so switching back keeps its page and its query. */}
            {tabs.map((t) => (
              <div
                key={t.id}
                className={cn("min-h-0 flex-1 flex-col", t.id === activeId ? "flex" : "hidden")}
              >
                {t.kind === "table" ? (
                  <TableTab
                    client={client}
                    table={t.table}
                    engine={info.engine}
                    quote={info.quote}
                    features={features}
                    onOpenTable={openTableByName}
                    onChanged={() => void loadTables()}
                  />
                ) : (
                  <SqlTab
                    id={t.id}
                    client={client}
                    engine={info.engine}
                    schema={completion}
                    initial={t.initial}
                    onRanWrite={() => void loadTables()}
                    shared={t.shared ? sharedConsole : null}
                  />
                )}
              </div>
            ))}
            {!tabs.length && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-[13px] text-muted-foreground">
                <p>Pick a table, or open a SQL console.</p>
                <button
                  type="button"
                  onClick={() => newSql()}
                  className="flex h-8 items-center gap-1.5 rounded-md border border-border px-3 hover:bg-accent hover:text-foreground"
                >
                  <TerminalIcon className="size-3.5" />
                  New SQL console
                </button>
              </div>
            )}
          </main>
        </div>

        {/* Status bar: the connection, then the things that used to crowd the
          top bar (the theme, the desktop app). */}
        <footer className="flex h-7 shrink-0 items-center gap-3 border-t border-border px-3 text-[11.5px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-500" />
            {engineLabel}
          </span>
          <span className="truncate font-mono">{info.database}</span>
          <span className="hidden truncate lg:inline">{info.version}</span>
          <span className="ms-auto tabular-nums">{tables.length} tables</span>
          {session.kind === "relay" && <PeerList me={presence.me} peers={presence.peers} />}
          <StudioThemeMenu palette={palette} onPalette={setPalette} />
          <Link
            to="/download"
            className="hidden h-5 items-center gap-1 rounded px-1.5 hover:bg-accent hover:text-foreground sm:flex"
          >
            <DownloadIcon aria-hidden="true" className="size-3" />
            Desktop app
          </Link>
          <span className="hidden xl:inline">strokedb {info.bridge ?? "0.1"}</span>
        </footer>
      </div>
    </PresenceContext>
  );
}

function Unreachable({
  shared,
  error,
  onRetry,
  onLeave,
}: {
  error: BridgeError;
  onRetry: () => void;
  onLeave: () => void;
  shared?: boolean;
}) {
  const safari =
    typeof navigator !== "undefined" &&
    /Safari\//.test(navigator.userAgent) &&
    !/Chrome|Chromium|Edg\//.test(navigator.userAgent);
  return (
    <div className="studio flex min-h-dvh items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-md">
        <StrokeIcon className="size-8" />
        <h1 className="mt-5 text-[22px] font-semibold">
          {error.unreachable
            ? shared
              ? "This shared studio is offline"
              : "Can't reach your database"
            : shared
              ? "The shared studio said no"
              : "The bridge said no"}
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
          {error.unreachable && shared
            ? "Whoever shared it stopped sharing, or their computer is offline. It comes back on this same link when they share again."
            : error.unreachable
              ? safari
                ? "Safari blocks secure pages from talking to programs on your own computer. Open this link in Chrome, Edge or Firefox, or use the desktop app."
                : "The studio talks to your database through npx strokedb running in your terminal. If you stopped it, start it again: it opens a fresh link."
              : error.message}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="flex h-9 items-center gap-1.5 rounded-full bg-muted px-4 text-[13px] font-medium hover:bg-accent"
          >
            <RefreshCwIcon className="size-3.5" /> Try again
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="flex h-9 items-center rounded-full px-4 text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            How it works
          </button>
        </div>
      </div>
    </div>
  );
}

/** Who else is on a table: a dot each, up to three. */
function PeerDots({ peers }: { peers: Peer[] }) {
  if (!peers.length) return null;
  return (
    <span
      className="flex shrink-0 -space-x-1"
      aria-label={peers.map((p) => p.name).join(", ") + " here"}
    >
      {peers.slice(0, 3).map((p) => (
        <span
          key={p.id}
          className="size-2 rounded-full ring-2 ring-background"
          style={{ background: p.color }}
          title={p.name}
        />
      ))}
    </span>
  );
}

/** Everyone in the shared studio, this page first. */
function PeerList({ me, peers }: { me: { name: string; color: string }; peers: Peer[] }) {
  const all = [
    { id: -1, name: `${me.name} (you)`, color: me.color, role: "viewer" as const },
    ...peers,
  ];
  return (
    <span
      className="flex items-center gap-1.5"
      title={all.map((p) => (p.role === "host" ? `${p.name}, host` : p.name)).join("\n")}
    >
      <span className="flex -space-x-1">
        {all.slice(0, 5).map((p) => (
          <span
            key={p.id}
            className="flex size-4 items-center justify-center rounded-full text-[9px] font-semibold text-white ring-2 ring-background"
            style={{ background: p.color }}
          >
            {p.name.slice(0, 1)}
          </span>
        ))}
      </span>
      <span className="tabular-nums">{all.length === 1 ? "Only you" : `${all.length} here`}</span>
    </span>
  );
}
