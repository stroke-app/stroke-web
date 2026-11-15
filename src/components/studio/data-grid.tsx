import { ContextMenu } from "@base-ui/react/context-menu";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ClipboardCopyIcon,
  CopyIcon,
  EqualIcon,
  EqualNotIcon,
  FileJsonIcon,
  KeyRoundIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { menuItem, menuPopup, menuSep } from "#/components/share/share-ui";
import { cellText, type Sort } from "#/lib/studio-bridge";
import { cn } from "#/lib/utils";

export interface GridColumn {
  name: string;
  type?: string;
  primaryKey?: boolean;
}

const ROW_H = 28;
const OVERSCAN = 10;
const NUM_W = 52;

/**
 * A starting width that fits the header (name, type, key icon, sort arrow)
 * and the first rows' text. The header's chrome is ~40px on top of its text.
 */
function measure(columns: GridColumn[], rows: unknown[][]) {
  return columns.map((c, i) => {
    const header =
      c.name.length * 7.6 +
      (c.type ? Math.min(c.type.length, 16) * 6.6 + 8 : 0) +
      (c.primaryKey ? 18 : 0) +
      44;
    let chars = 0;
    for (const r of rows.slice(0, 60)) chars = Math.max(chars, Math.min(48, cellText(r[i]).length));
    return Math.round(Math.max(80, Math.min(420, Math.max(header, chars * 7.6 + 24))));
  });
}

const isNumeric = (v: unknown) =>
  typeof v === "number" || (typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v) && v.length < 20);

export interface GridAction {
  kind: "filter" | "filterNot" | "null" | "edit" | "delete";
  row: number;
  col: number;
}

/**
 * The rows of a table or a query: virtualized, resizable columns, a cell
 * cursor moved by mouse or arrows, copy with Mod+C, inline edits (Enter or a
 * double-click; Enter saves, Esc cancels, Tab saves and moves right) and a
 * right-click menu. Row numbers select rows (Shift and Mod for several).
 */
export function DataGrid({
  columns,
  rows,
  rowOffset = 0,
  sort = null,
  onSort,
  editable = false,
  onCommit,
  onAction,
  selectedRows,
  onSelectRows,
  onCursor,
}: {
  columns: GridColumn[];
  rows: unknown[][];
  rowOffset?: number;
  sort?: Sort | null;
  onSort?: (column: string) => void;
  editable?: boolean;
  onCommit?: (row: number, col: number, value: string | null) => Promise<boolean>;
  onAction?: (a: GridAction) => void;
  selectedRows?: Set<number>;
  onSelectRows?: (rows: Set<number>) => void;
  onCursor?: (row: number | null) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(600);
  const [widths, setWidths] = useState<number[]>(() => measure(columns, rows));
  const [cursor, setCursor] = useState<{ r: number; c: number } | null>(null);
  const [editing, setEditing] = useState<{ r: number; c: number; value: string } | null>(null);
  const [menuCell, setMenuCell] = useState<{ r: number; c: number } | null>(null);
  const anchor = useRef<number | null>(null);
  const colKey = columns.map((c) => c.name).join("\u0000");

  // New columns (another table, another query), or the first rows after an
  // empty page (a filter that matched nothing): measure again.
  const hasRows = rows.length > 0;
  useEffect(() => {
    setWidths(measure(columns, rows));
    setCursor(null);
    setEditing(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colKey, hasRows]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.clientHeight));
    ro.observe(el);
    setHeight(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    onCursor?.(cursor ? cursor.r : null);
  }, [cursor, onCursor]);

  const first = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN);
  const last = Math.min(rows.length, Math.ceil((scrollTop + height) / ROW_H) + OVERSCAN);
  const totalW = NUM_W + widths.reduce((a, b) => a + b, 0);
  const numericCol = useMemo(
    () => columns.map((_, i) => rows.slice(0, 30).every((r) => r[i] == null || isNumeric(r[i]))),
    [columns, rows],
  );

  function startResize(e: React.PointerEvent, i: number) {
    e.preventDefault();
    e.stopPropagation();
    const x0 = e.clientX;
    const w0 = widths[i] ?? 120;
    const move = (ev: PointerEvent) =>
      setWidths((ws) => ws.map((w, j) => (j === i ? Math.max(56, w0 + ev.clientX - x0) : w)));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function scrollIntoView(r: number) {
    const el = scroller.current;
    if (!el) return;
    const top = r * ROW_H;
    if (top < el.scrollTop) el.scrollTop = top;
    else if (top + ROW_H * 2 > el.scrollTop + el.clientHeight - 32)
      el.scrollTop = top + ROW_H * 2 - el.clientHeight + 32;
  }

  async function commit(move: "down" | "right" | null) {
    if (!editing || !onCommit) return;
    const { r, c, value } = editing;
    const before = cellText(rows[r]?.[c]);
    if (value !== before) {
      const ok = await onCommit(r, c, value);
      if (!ok) return;
    }
    setEditing(null);
    if (move === "right" && c + 1 < columns.length) setCursor({ r, c: c + 1 });
    if (move === "down" && r + 1 < rows.length) setCursor({ r: r + 1, c });
    scroller.current?.focus();
  }

  function copy(text: string) {
    void navigator.clipboard.writeText(text);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (editing) return;
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "c") {
      if (selectedRows?.size) {
        const picked = [...selectedRows].sort((a, b) => a - b).map((i) => rows[i] ?? []);
        copy(
          [
            columns.map((c) => c.name).join("\t"),
            ...picked.map((r) => r.map((v) => cellText(v).replace(/[\t\n]/g, " ")).join("\t")),
          ].join("\n"),
        );
      } else if (cursor) copy(cellText(rows[cursor.r]?.[cursor.c]));
      e.preventDefault();
      return;
    }
    if (!cursor) {
      if (rows.length && ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key))
        setCursor({ r: 0, c: 0 });
      return;
    }
    const { r, c } = cursor;
    let next: { r: number; c: number } | null = null;
    if (e.key === "ArrowDown") next = { r: Math.min(rows.length - 1, r + 1), c };
    else if (e.key === "ArrowUp") next = { r: Math.max(0, r - 1), c };
    else if (e.key === "ArrowRight" || (e.key === "Tab" && !e.shiftKey))
      next = { r, c: Math.min(columns.length - 1, c + 1) };
    else if (e.key === "ArrowLeft" || (e.key === "Tab" && e.shiftKey))
      next = { r, c: Math.max(0, c - 1) };
    else if (e.key === "PageDown") next = { r: Math.min(rows.length - 1, r + 20), c };
    else if (e.key === "PageUp") next = { r: Math.max(0, r - 20), c };
    else if (e.key === "Enter" && editable) {
      e.preventDefault();
      setEditing({ r, c, value: rows[r]?.[c] == null ? "" : cellText(rows[r][c]) });
      return;
    } else if (e.key === "Escape") {
      setCursor(null);
      onSelectRows?.(new Set());
      return;
    }
    if (next) {
      e.preventDefault();
      setCursor(next);
      scrollIntoView(next.r);
    }
  }

  function clickRowNumber(e: React.MouseEvent, i: number) {
    if (!onSelectRows) return;
    const cur = new Set(selectedRows ?? []);
    if (e.shiftKey && anchor.current !== null) {
      const [a, b] = [Math.min(anchor.current, i), Math.max(anchor.current, i)];
      for (let k = a; k <= b; k++) cur.add(k);
    } else if (e.metaKey || e.ctrlKey) {
      if (cur.has(i)) cur.delete(i);
      else cur.add(i);
      anchor.current = i;
    } else {
      const only = cur.size === 1 && cur.has(i);
      cur.clear();
      if (!only) cur.add(i);
      anchor.current = i;
    }
    onSelectRows(cur);
  }

  const menuValue = menuCell ? rows[menuCell.r]?.[menuCell.c] : undefined;
  const menuCol = menuCell ? columns[menuCell.c] : undefined;

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger
        ref={scroller}
        tabIndex={0}
        role="grid"
        aria-rowcount={rows.length}
        aria-colcount={columns.length}
        className="relative min-h-0 flex-1 overflow-auto outline-none"
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        onKeyDown={onKeyDown}
        onContextMenu={(e) => {
          const td = (e.target as HTMLElement).closest<HTMLElement>("[data-r]");
          const cell = td ? { r: Number(td.dataset.r), c: Number(td.dataset.c) } : null;
          setMenuCell(cell);
          if (cell) setCursor(cell);
        }}
      >
        <div style={{ width: totalW, minWidth: "100%" }}>
          {/* Header */}
          <div
            className="sticky top-0 z-10 flex h-8 border-b border-border bg-background text-[12.5px]"
            style={{ width: totalW }}
          >
            <div
              className="sticky left-0 z-20 shrink-0 border-r border-border bg-background"
              style={{ width: NUM_W }}
            />
            {columns.map((c, i) => {
              const sorted = sort?.column === c.name ? sort.dir : null;
              return (
                <div
                  key={`${c.name}-${i}`}
                  className="group/h relative flex shrink-0 items-center border-r border-border"
                  style={{ width: widths[i] }}
                >
                  <button
                    type="button"
                    disabled={!onSort}
                    onClick={() => onSort?.(c.name)}
                    className="flex h-full min-w-0 flex-1 items-center gap-1.5 px-2.5 text-left font-medium hover:bg-muted/40 disabled:hover:bg-transparent"
                    title={c.type ? `${c.name} · ${c.type}` : c.name}
                  >
                    {c.primaryKey && <KeyRoundIcon className="size-3 shrink-0 text-amber-500" />}
                    <span className="truncate">{c.name}</span>
                    {c.type && (
                      <span className="truncate font-mono text-[11px] font-normal text-faint">
                        {c.type}
                      </span>
                    )}
                    <span className="ms-auto grid size-3.5 shrink-0 place-items-center">
                      {sorted === "asc" && <ArrowUpIcon className="size-3" />}
                      {sorted === "desc" && <ArrowDownIcon className="size-3" />}
                    </span>
                  </button>
                  <span
                    role="separator"
                    aria-orientation="vertical"
                    onPointerDown={(e) => startResize(e, i)}
                    onDoubleClick={() =>
                      setWidths((ws) =>
                        ws.map((w, j) =>
                          j === i
                            ? (measure(
                                [c],
                                rows.map((r) => [r[i]]),
                              )[0] ?? w)
                            : w,
                        ),
                      )
                    }
                    className="absolute top-0 -right-1 z-10 h-full w-2 cursor-col-resize hover:bg-primary/30"
                  />
                </div>
              );
            })}
          </div>

          {/* Rows */}
          <div style={{ height: rows.length * ROW_H, position: "relative" }}>
            {rows.slice(first, last).map((row, k) => {
              const r = first + k;
              const selected = selectedRows?.has(r);
              return (
                <div
                  key={r}
                  role="row"
                  className={cn(
                    "absolute left-0 flex font-mono text-[12.5px]",
                    selected ? "bg-primary/10" : "hover:bg-muted/30",
                  )}
                  style={{ top: r * ROW_H, height: ROW_H, width: totalW }}
                >
                  <button
                    type="button"
                    className={cn(
                      "sticky left-0 z-[5] shrink-0 border-r border-b border-border/60 bg-background px-2 text-right text-[11px] tabular-nums",
                      selected ? "text-foreground" : "text-faint hover:text-foreground",
                    )}
                    style={{ width: NUM_W }}
                    onClick={(e) => clickRowNumber(e, r)}
                    aria-label={`Select row ${rowOffset + r + 1}`}
                  >
                    {rowOffset + r + 1}
                  </button>
                  {columns.map((_, c) => {
                    const v = row[c];
                    const isCursor = cursor?.r === r && cursor?.c === c;
                    const isEditing = editing?.r === r && editing?.c === c;
                    return (
                      <div
                        key={c}
                        role="gridcell"
                        data-r={r}
                        data-c={c}
                        className={cn(
                          "relative flex shrink-0 items-center border-r border-b border-border/50 px-2.5",
                          numericCol[c] && "justify-end",
                          isCursor && "outline-2 -outline-offset-2 outline-primary",
                        )}
                        style={{ width: widths[c] }}
                        onMouseDown={() => setCursor({ r, c })}
                        onDoubleClick={() =>
                          editable && setEditing({ r, c, value: v == null ? "" : cellText(v) })
                        }
                        title={v == null ? "NULL" : cellText(v).slice(0, 2000)}
                      >
                        {isEditing ? (
                          <input
                            // biome-ignore lint: the editor takes focus when it opens
                            autoFocus
                            value={editing.value}
                            onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                void commit("down");
                              } else if (e.key === "Tab") {
                                e.preventDefault();
                                void commit("right");
                              } else if (e.key === "Escape") {
                                e.preventDefault();
                                setEditing(null);
                                scroller.current?.focus();
                              }
                              e.stopPropagation();
                            }}
                            onBlur={() => void commit(null)}
                            className="absolute inset-0 z-[6] w-full bg-background px-2.5 font-mono text-[12.5px] text-foreground outline-2 -outline-offset-2 outline-primary"
                          />
                        ) : v == null ? (
                          <span className="text-faint italic">NULL</span>
                        ) : (
                          <span
                            className={cn(
                              "truncate",
                              typeof v === "object" && "text-muted-foreground",
                            )}
                          >
                            {cellText(v)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        {!rows.length && (
          <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">No rows.</p>
        )}
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Positioner className="z-50">
          <ContextMenu.Popup className={cn(menuPopup, "w-60")}>
            {menuCell && menuCol ? (
              <>
                <ContextMenu.Item
                  className={menuItem}
                  onClick={() => copy(menuValue == null ? "" : cellText(menuValue))}
                >
                  <CopyIcon /> Copy value
                </ContextMenu.Item>
                <ContextMenu.Item
                  className={menuItem}
                  onClick={() =>
                    copy(
                      JSON.stringify(
                        Object.fromEntries(
                          columns.map((c, i) => [c.name, rows[menuCell.r]?.[i] ?? null]),
                        ),
                        null,
                        2,
                      ),
                    )
                  }
                >
                  <FileJsonIcon /> Copy row as JSON
                </ContextMenu.Item>
                <ContextMenu.Item
                  className={menuItem}
                  onClick={() => copy(rows.map((r) => cellText(r[menuCell.c])).join("\n"))}
                >
                  <ClipboardCopyIcon /> Copy column
                </ContextMenu.Item>
                {onAction && (
                  <>
                    <div className={menuSep} />
                    <ContextMenu.Item
                      className={menuItem}
                      onClick={() => onAction({ kind: "filter", row: menuCell.r, col: menuCell.c })}
                    >
                      <EqualIcon />{" "}
                      <span className="truncate">Only rows with this {menuCol.name}</span>
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      className={menuItem}
                      onClick={() =>
                        onAction({ kind: "filterNot", row: menuCell.r, col: menuCell.c })
                      }
                    >
                      <EqualNotIcon />{" "}
                      <span className="truncate">Rows without this {menuCol.name}</span>
                    </ContextMenu.Item>
                  </>
                )}
                {editable && onAction && (
                  <>
                    <div className={menuSep} />
                    <ContextMenu.Item
                      className={menuItem}
                      onClick={() =>
                        setEditing({
                          r: menuCell.r,
                          c: menuCell.c,
                          value: menuValue == null ? "" : cellText(menuValue),
                        })
                      }
                    >
                      <PencilIcon /> Edit
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      className={menuItem}
                      onClick={() => onAction({ kind: "null", row: menuCell.r, col: menuCell.c })}
                    >
                      <XIcon /> Set NULL
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      className={cn(menuItem, "text-destructive")}
                      onClick={() => onAction({ kind: "delete", row: menuCell.r, col: menuCell.c })}
                    >
                      <Trash2Icon /> Delete row
                    </ContextMenu.Item>
                  </>
                )}
              </>
            ) : (
              <p className="px-2 py-1.5 text-[12.5px] text-muted-foreground">Right-click a cell.</p>
            )}
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
