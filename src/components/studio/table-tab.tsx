import { Menu } from "@base-ui/react/menu";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  Loader2Icon,
  PanelRightIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  downloadFile,
  EXPORT_FORMATS,
  exportRows,
  fileStem,
} from "#/components/share/share-export";
import { menuItem, menuPopup, textBtn } from "#/components/share/share-ui";
import {
  cellText,
  type BridgeClient,
  type Column,
  type Engine,
  type Result,
  type Sort,
  type TableRef,
  type Values,
} from "#/lib/studio-bridge";
import { cn } from "#/lib/utils";

import { DataGrid, type GridAction } from "./data-grid";
import { StructureView } from "./structure-view";

const PAGE_SIZES = [50, 100, 250, 500, 1000];

/** Quote a name the way this engine reads it. */
function ident(engine: Engine, name: string) {
  return engine === "mysql" ? `\`${name.replace(/`/g, "``")}\`` : `"${name.replace(/"/g, '""')}"`;
}
/** A value as a SQL literal for a filter. */
function literal(v: unknown) {
  if (typeof v === "number" || typeof v === "bigint") return String(v);
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  return `'${cellText(v).replace(/'/g, "''")}'`;
}

type Page = Result & { total: number | null; estimated: boolean };
type Inspect = { mode: "row"; index: number } | { mode: "new" } | null;

export function TableTab({
  client,
  table,
  engine,
  features,
  onOpenTable,
  onChanged,
}: {
  client: BridgeClient;
  table: TableRef;
  engine: Engine;
  features: string[];
  onOpenTable: (schema: string, name: string) => void;
  /** Rows were added or removed: the sidebar's counts are stale. */
  onChanged?: () => void;
}) {
  const [view, setView] = useState<"data" | "structure">("data");
  const [meta, setMeta] = useState<Column[]>([]);
  const [page, setPage] = useState<Page | null>(null);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(100);
  const [sort, setSort] = useState<Sort | null>(null);
  const [whereDraft, setWhereDraft] = useState("");
  const [where, setWhere] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [cursorRow, setCursorRow] = useState<number | null>(null);
  const [inspect, setInspect] = useState<Inspect>(null);
  const [tick, setTick] = useState(0);

  const canWhere = features.includes("where");
  const canStructure = features.includes("structure");
  const pk = useMemo(() => meta.filter((c) => c.primaryKey).map((c) => c.name), [meta]);
  const canEdit = features.includes("edit") && table.kind === "table" && pk.length > 0;
  const editHint = !features.includes("edit")
    ? "Update with npx strokedb@latest to edit rows here."
    : table.kind !== "table"
      ? "Views are read-only."
      : pk.length === 0
        ? "No primary key: edit this table with SQL."
        : "";

  useEffect(() => {
    client
      .columns(table.schema, table.name)
      .then(setMeta)
      .catch(() => setMeta([]));
  }, [client, table]);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    client
      .rows({
        schema: table.schema,
        table: table.name,
        limit,
        offset,
        sort,
        ...(canWhere && where ? { where } : {}),
      })
      .then((r) => {
        if (!live) return;
        setPage(r);
        setSelected(new Set());
      })
      .catch((e: unknown) => live && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [client, table, limit, offset, sort, where, canWhere, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const columns = page?.columns ?? [];
  const rows = page?.rows ?? [];
  const metaByName = useMemo(() => new Map(meta.map((c) => [c.name, c])), [meta]);
  const gridColumns = columns.map((name) => ({
    name,
    type: metaByName.get(name)?.type,
    primaryKey: metaByName.get(name)?.primaryKey,
  }));

  const keyOf = (row: unknown[]): Values =>
    Object.fromEntries(pk.map((c) => [c, row[columns.indexOf(c)]]));

  async function save(row: unknown[], set: Values) {
    try {
      await client.update({ schema: table.schema, table: table.name, key: keyOf(row), set });
      reload();
      return true;
    } catch (e) {
      toast.error("Not saved", { description: e instanceof Error ? e.message : String(e) });
      return false;
    }
  }

  async function removeRows(indexes: number[]) {
    if (!indexes.length) return;
    if (
      !window.confirm(
        `Delete ${indexes.length} row${indexes.length === 1 ? "" : "s"} from ${table.name}? This can't be undone.`,
      )
    )
      return;
    try {
      const r = await client.remove({
        schema: table.schema,
        table: table.name,
        keys: indexes.map((i) => keyOf(rows[i] ?? [])),
      });
      toast.success(`Deleted ${r.rowCount} row${r.rowCount === 1 ? "" : "s"}`);
      reload();
      onChanged?.();
    } catch (e) {
      toast.error("Not deleted", { description: e instanceof Error ? e.message : String(e) });
    }
  }

  function onAction(a: GridAction) {
    const col = columns[a.col];
    const row = rows[a.row];
    if (!col || !row) return;
    const v = row[a.col];
    if (a.kind === "filter" || a.kind === "filterNot") {
      const q = ident(engine, col);
      const clause =
        v == null
          ? `${q} IS ${a.kind === "filter" ? "" : "NOT "}NULL`
          : `${q} ${a.kind === "filter" ? "=" : "<>"} ${literal(v)}`;
      const next = where ? `(${where}) AND ${clause}` : clause;
      setWhereDraft(next);
      setWhere(next);
      setOffset(0);
    } else if (a.kind === "null") void save(row, { [col]: null });
    else if (a.kind === "delete") void removeRows([a.row]);
  }

  function toggleSort(column: string) {
    setOffset(0);
    setSort((s) =>
      s?.column !== column
        ? { column, dir: "asc" }
        : s.dir === "asc"
          ? { column, dir: "desc" }
          : null,
    );
  }

  function applyWhere(next: string) {
    setWhere(next.trim());
    setOffset(0);
  }

  function exportAs(id: (typeof EXPORT_FORMATS)[number]["id"]) {
    const f = EXPORT_FORMATS.find((x) => x.id === id);
    if (!f || !page) return;
    const out = exportRows(id, columns, rows, table.name);
    downloadFile(`${fileStem(table.name)}.${f.ext}`, out.body, out.type);
  }

  const total = page?.total ?? null;
  const end = offset + rows.length;
  const hasNext = rows.length === limit && (total === null || page?.estimated || end < total);
  const btn =
    "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[12.5px] text-muted-foreground hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border px-2 py-1.5">
        {canStructure && (
          <div className="flex h-7 rounded-md bg-muted/60 p-0.5" role="tablist">
            {(["data", "structure"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={cn(
                  "rounded px-2.5 text-[12.5px] capitalize",
                  view === v
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v}
              </button>
            ))}
          </div>
        )}
        {view === "data" && (
          <>
            {canWhere && (
              <form
                className="flex h-7 min-w-48 flex-1 items-center gap-1.5 rounded-md border border-border bg-background px-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  applyWhere(whereDraft);
                }}
              >
                <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="font-mono text-[11px] text-faint">WHERE</span>
                <input
                  value={whereDraft}
                  onChange={(e) => setWhereDraft(e.target.value)}
                  placeholder="status = 'paid' AND total > 100"
                  aria-label="Filter rows with a WHERE clause"
                  className="min-w-0 flex-1 bg-transparent font-mono text-[12.5px] outline-none placeholder:text-faint"
                />
                {(where || whereDraft) && (
                  <button
                    type="button"
                    aria-label="Clear the filter"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setWhereDraft("");
                      applyWhere("");
                    }}
                  >
                    <XIcon className="size-3.5" />
                  </button>
                )}
              </form>
            )}
            <div className="ms-auto flex items-center gap-0.5">
              {canEdit && (
                <button type="button" className={btn} onClick={() => setInspect({ mode: "new" })}>
                  <PlusIcon className="size-3.5" />
                  Row
                </button>
              )}
              {canEdit && selected.size > 0 && (
                <button
                  type="button"
                  className={cn(btn, "text-destructive hover:text-destructive")}
                  onClick={() => void removeRows([...selected])}
                >
                  <Trash2Icon className="size-3.5" />
                  Delete {selected.size}
                </button>
              )}
              <Menu.Root>
                <Menu.Trigger className={textBtn} disabled={!rows.length}>
                  <DownloadIcon /> Export
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Positioner align="end" sideOffset={4} className="z-50">
                    <Menu.Popup className={cn(menuPopup, "w-60")}>
                      {EXPORT_FORMATS.map((f) => (
                        <Menu.Item key={f.id} className={menuItem} onClick={() => exportAs(f.id)}>
                          {f.label}
                          <span className="ms-auto text-[11px] text-muted-foreground">
                            {f.hint}
                          </span>
                        </Menu.Item>
                      ))}
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>
              <button
                type="button"
                className={btn}
                onClick={reload}
                aria-label="Refresh"
                title="Refresh"
              >
                <RefreshCwIcon className={cn("size-3.5", loading && "animate-spin")} />
              </button>
              <button
                type="button"
                className={cn(btn, inspect && "bg-accent text-foreground")}
                onClick={() =>
                  setInspect(
                    inspect
                      ? null
                      : cursorRow !== null
                        ? { mode: "row", index: cursorRow }
                        : rows.length
                          ? { mode: "row", index: 0 }
                          : null,
                  )
                }
                aria-label="Row inspector"
                title="Row inspector"
              >
                <PanelRightIcon className="size-3.5" />
              </button>
            </div>
          </>
        )}
      </div>

      {view === "structure" ? (
        <StructureView client={client} table={table} onOpenTable={onOpenTable} />
      ) : (
        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            {error ? (
              <p className="m-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 font-mono text-[12.5px] whitespace-pre-wrap text-destructive">
                {error}
              </p>
            ) : !page ? (
              <div className="flex flex-1 items-center justify-center gap-2 text-[13px] text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" /> Loading rows…
              </div>
            ) : (
              <DataGrid
                columns={gridColumns}
                rows={rows}
                rowOffset={offset}
                sort={sort}
                onSort={toggleSort}
                editable={canEdit}
                onCommit={async (r, c, value) => save(rows[r] ?? [], { [columns[c] ?? ""]: value })}
                onAction={onAction}
                selectedRows={selected}
                onSelectRows={setSelected}
                onCursor={(r) => {
                  setCursorRow(r);
                  if (r !== null && inspect?.mode === "row") setInspect({ mode: "row", index: r });
                }}
              />
            )}
            {/* Footer: count, pager, page size, and why editing is off */}
            <div className="flex h-8 shrink-0 items-center gap-2 border-t border-border px-3 text-[12px] text-muted-foreground">
              <span className="tabular-nums">
                {rows.length ? `${(offset + 1).toLocaleString()}–${end.toLocaleString()}` : "0"}
                {total !== null &&
                  ` of ${page?.estimated ? "about " : ""}${total.toLocaleString()}`}
              </span>
              {where && <span className="truncate font-mono text-faint">filtered</span>}
              {editHint && (
                <span className="hidden truncate text-faint md:inline">· {editHint}</span>
              )}
              <div className="ms-auto flex items-center gap-1">
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setOffset(0);
                  }}
                  className="h-6 rounded-md border border-border bg-background px-1 text-[12px]"
                  aria-label="Rows per page"
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n} / page
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={btn}
                  disabled={offset === 0 || loading}
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon className="size-3.5" />
                </button>
                <button
                  type="button"
                  className={btn}
                  disabled={!hasNext || loading}
                  onClick={() => setOffset(offset + limit)}
                  aria-label="Next page"
                >
                  <ChevronRightIcon className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
          {inspect && (
            <RowInspector
              key={inspect.mode === "row" ? `${offset}-${inspect.index}-${tick}` : "new"}
              mode={inspect.mode}
              columns={columns.length ? columns : meta.map((c) => c.name)}
              meta={metaByName}
              row={inspect.mode === "row" ? (rows[inspect.index] ?? null) : null}
              editable={canEdit}
              onClose={() => setInspect(null)}
              onSave={async (values) => {
                if (inspect.mode === "new") {
                  try {
                    await client.insert({ schema: table.schema, table: table.name, values });
                    toast.success("Row added");
                    setInspect(null);
                    reload();
                    onChanged?.();
                  } catch (e) {
                    toast.error("Not added", {
                      description: e instanceof Error ? e.message : String(e),
                    });
                  }
                } else if (rows[inspect.index] && (await save(rows[inspect.index] ?? [], values))) {
                  toast.success("Saved");
                }
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

/** The selected row, field by field; also the form for a new row. */
function RowInspector({
  mode,
  columns,
  meta,
  row,
  editable,
  onClose,
  onSave,
}: {
  mode: "row" | "new";
  columns: string[];
  meta: Map<string, Column>;
  row: unknown[] | null;
  editable: boolean;
  onClose: () => void;
  onSave: (values: Values) => Promise<void>;
}) {
  const initial = columns.map((_, i) =>
    mode === "new" ? "" : row?.[i] == null ? null : cellText(row[i]),
  );
  const [values, setValues] = useState<(string | null)[]>(initial);
  const [busy, setBusy] = useState(false);
  const changed = values.some((v, i) => v !== initial[i]);

  async function submit() {
    setBusy(true);
    const out: Values = {};
    columns.forEach((c, i) => {
      if (mode === "new") {
        if (values[i] !== "" && values[i] !== null) out[c] = values[i];
      } else if (values[i] !== initial[i]) out[c] = values[i];
    });
    await onSave(out);
    setBusy(false);
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-border">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3">
        <span className="text-[13px] font-medium">{mode === "new" ? "New row" : "Row"}</span>
        <button
          type="button"
          onClick={onClose}
          className="ms-auto text-muted-foreground hover:text-foreground"
          aria-label="Close the inspector"
        >
          <XIcon className="size-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {mode === "row" && !row && (
          <p className="text-[12.5px] text-muted-foreground">Select a row.</p>
        )}
        {(mode === "new" || row) &&
          columns.map((c, i) => {
            const m = meta.get(c);
            const v = values[i];
            const long = (v?.length ?? 0) > 40 || /json|text/i.test(m?.type ?? "");
            return (
              <label key={c} className="block">
                <span className="mb-1 flex items-center gap-1.5 text-[12px]">
                  <span className="font-mono font-medium">{c}</span>
                  <span className="truncate font-mono text-[11px] text-faint">{m?.type}</span>
                  {editable && mode === "row" && v !== null && (
                    <button
                      type="button"
                      className="ms-auto text-[11px] text-muted-foreground hover:text-foreground"
                      onClick={() => setValues(values.map((x, j) => (j === i ? null : x)))}
                    >
                      set NULL
                    </button>
                  )}
                </span>
                {long ? (
                  <textarea
                    value={v ?? ""}
                    readOnly={!editable}
                    placeholder={
                      v === null
                        ? "NULL"
                        : mode === "new"
                          ? m?.default
                            ? `default: ${m.default}`
                            : ""
                          : ""
                    }
                    onChange={(e) =>
                      setValues(values.map((x, j) => (j === i ? e.target.value : x)))
                    }
                    rows={Math.min(8, Math.max(2, (v ?? "").split("\n").length))}
                    className="w-full resize-y rounded-md border border-border bg-background px-2 py-1.5 font-mono text-[12.5px] outline-none focus:border-primary/50"
                  />
                ) : (
                  <input
                    value={v ?? ""}
                    readOnly={!editable}
                    placeholder={
                      v === null
                        ? "NULL"
                        : mode === "new"
                          ? m?.default
                            ? `default: ${m.default}`
                            : ""
                          : ""
                    }
                    onChange={(e) =>
                      setValues(values.map((x, j) => (j === i ? e.target.value : x)))
                    }
                    className="h-8 w-full rounded-md border border-border bg-background px-2 font-mono text-[12.5px] outline-none focus:border-primary/50"
                  />
                )}
              </label>
            );
          })}
      </div>
      {editable && (mode === "new" || row) && (
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border p-3">
          {mode === "row" && changed && (
            <button
              type="button"
              className="h-8 rounded-md px-3 text-[12.5px] text-muted-foreground hover:bg-accent"
              onClick={() => setValues(initial)}
            >
              Discard
            </button>
          )}
          <button
            type="button"
            disabled={busy || (mode === "row" && !changed)}
            onClick={() => void submit()}
            className="h-8 rounded-md bg-primary px-3 text-[12.5px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? "Saving…" : mode === "new" ? "Add row" : "Save"}
          </button>
        </div>
      )}
    </aside>
  );
}
