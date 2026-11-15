import { ContextMenu } from "@base-ui/react/context-menu";
import { Menu } from "@base-ui/react/menu";
import {
  ArrowDownIcon,
  ArrowDownWideNarrowIcon,
  ArrowUpIcon,
  ArrowUpNarrowWideIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ClipboardCopyIcon,
  Columns3Icon,
  CopyIcon,
  DownloadIcon,
  EqualIcon,
  EqualNotIcon,
  EyeOffIcon,
  FileJsonIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { type ReactNode, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "#/lib/utils";

import { cellText, downloadFile, EXPORT_FORMATS, exportRows, fileStem } from "./share-export";
import { iconBtn, menuItem, menuLabel, menuPopup, menuSep, textBtn, Tip } from "./share-ui";

const ROW_H = 32;
const OVERSCAN = 12;
const PAGE_SIZES = [50, 100, 250, 500, 1000] as const;

type Filter = { col: number; value: string; not: boolean };
type Sort = { col: number; dir: 1 | -1 } | null;

/**
 * A read-only grid for a shared result. Search across every column, filter by
 * a value from the right-click menu, sort, hide columns, page through, and
 * download in several formats. Column widths are measured once from the data
 * so nothing shifts when a sort arrow or a filter appears, and only the rows
 * on screen are in the DOM.
 */
export function ShareTable({
  columns,
  rows,
  title,
  masked = [],
  totalRows,
  status,
  toolbar = true,
}: {
  columns: { name: string; type?: string }[];
  rows: unknown[][];
  title: string;
  masked?: string[];
  totalRows?: number;
  /** Items for the right of the status bar (expiry, views left). */
  status?: ReactNode;
  /** The search / filter / columns / download bar. Embeds can turn it off. */
  toolbar?: boolean;
}) {
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query.trim().toLowerCase());
  const [sort, setSort] = useState<Sort>(null);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [hidden, setHidden] = useState<Set<number>>(() => new Set());
  const [pageSize, setPageSize] = useState<number>(100);
  const [copied, setCopied] = useState<string | null>(null);
  const [menuCell, setMenuCell] = useState<{ row: number; col: number } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewH, setViewH] = useState(600);
  const searchRef = useRef<HTMLInputElement>(null);

  const text = useMemo(() => rows.map((r) => r.map((v) => cellText(v))), [rows]);
  const lower = useMemo(() => text.map((r) => r.join("\u0000").toLowerCase()), [text]);
  const maskedSet = useMemo(() => new Set(masked), [masked]);

  // Widths from the header and a sample of rows, fixed for the life of the
  // table: a sort arrow, a filter or a new page never moves a column.
  const widths = useMemo(() => {
    const sample = text.slice(0, 300);
    return columns.map((c, ci) => {
      let ch = c.name.length + (c.type ? c.type.length + 1 : 0) + (maskedSet.has(c.name) ? 6 : 3);
      for (const r of sample) ch = Math.max(ch, Math.min(48, r[ci]?.length ?? 0));
      return Math.round(Math.min(380, Math.max(72, ch * 7.4 + 28)));
    });
  }, [columns, text, maskedSet]);

  const visible = useMemo(
    () => columns.map((_, i) => i).filter((i) => !hidden.has(i)),
    [columns, hidden],
  );

  const order = useMemo(() => {
    let idx = rows.map((_, i) => i);
    if (q) idx = idx.filter((i) => lower[i]!.includes(q));
    for (const f of filters) idx = idx.filter((i) => (text[i]![f.col] === f.value) !== f.not);
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
  }, [rows, text, lower, q, filters, sort]);

  // The page belongs to one search, filter set, sort and page size: change any
  // of them and it is the first page again.
  const viewKey = JSON.stringify([q, filters, sort, pageSize]);
  const [pageAt, setPageAt] = useState({ key: viewKey, page: 0 });
  const page = pageAt.key === viewKey ? pageAt.page : 0;
  const setPage = (n: number) => setPageAt({ key: viewKey, page: n });

  const pages = Math.max(1, Math.ceil(order.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const pageRows = useMemo(
    () => order.slice(safePage * pageSize, safePage * pageSize + pageSize),
    [order, safePage, pageSize],
  );

  // A new page, search or filter starts at the top. The scroll event that
  // follows updates scrollTop.
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [safePage, viewKey]);

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

  // ⌘F / Ctrl+F and / focus the search, like the app.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA)$/.test(e.target.tagName);
      if (((e.metaKey || e.ctrlKey) && e.key === "f") || (e.key === "/" && !typing)) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const first = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN);
  const last = Math.min(pageRows.length, Math.ceil((scrollTop + viewH) / ROW_H) + OVERSCAN);

  const copy = (s: string, key: string) =>
    void navigator.clipboard.writeText(s).then(() => setCopied(key));

  const download = (fmt: (typeof EXPORT_FORMATS)[number]) => {
    const names = visible.map((i) => columns[i]!.name);
    const data = order.map((ri) => visible.map((ci) => rows[ri]![ci]));
    const { body, type } = exportRows(fmt.id, names, data, title);
    downloadFile(`${fileStem(title)}.${fmt.ext}`, body, type);
  };

  const rowObject = (ri: number) =>
    JSON.stringify(
      Object.fromEntries(visible.map((ci) => [columns[ci]!.name, rows[ri]![ci] ?? null])),
      null,
      2,
    );

  const toggleSort = (ci: number) =>
    setSort((s) =>
      s?.col === ci ? (s.dir === 1 ? { col: ci, dir: -1 } : null) : { col: ci, dir: 1 },
    );

  const addFilter = (col: number, value: string, not: boolean) =>
    setFilters((fs) => [
      ...fs.filter((f) => !(f.col === col && f.value === value)),
      { col, value, not },
    ]);

  const hideCol = (ci: number) =>
    setHidden((h) => {
      if (visible.length <= 1) return h;
      const n = new Set(h);
      n.add(ci);
      return n;
    });

  const totalW = visible.reduce((w, ci) => w + widths[ci]!, 0) + 48;
  const from = order.length ? safePage * pageSize + 1 : 0;
  const to = safePage * pageSize + pageRows.length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Toolbar: search, the active filters, then columns and download. */}
      <div
        className={cn(
          "flex min-h-11 shrink-0 flex-wrap items-center gap-2 border-b border-border px-3 py-1.5",
          !toolbar && "hidden",
        )}
      >
        <div className="relative w-64 max-w-full">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rows"
            aria-label="Search rows"
            className="h-8 w-full rounded-lg bg-muted pr-12 pl-8 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-1.5 grid size-5 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <XIcon className="size-3" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border border-border px-1 font-sans text-[11px] text-faint">
              /
            </kbd>
          )}
        </div>

        {filters.map((f) => (
          <span
            key={`${f.col}:${f.value}:${f.not}`}
            className="inline-flex h-7 max-w-64 items-center gap-1 rounded-lg bg-muted ps-2 pe-1 text-[12px]"
          >
            <span className="text-muted-foreground">{columns[f.col]!.name}</span>
            <span className="text-faint">{f.not ? "≠" : "="}</span>
            <span className="truncate font-mono text-foreground">
              {f.value === "" ? "NULL" : f.value}
            </span>
            <button
              type="button"
              aria-label="Remove filter"
              onClick={() => setFilters((fs) => fs.filter((x) => x !== f))}
              className="grid size-5 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}

        <div className="ms-auto flex items-center gap-0.5">
          <Menu.Root>
            <Tip label="Show or hide columns">
              <Menu.Trigger className={textBtn}>
                <Columns3Icon />
                Columns
                {hidden.size > 0 && (
                  <span className="text-faint tabular-nums">
                    {visible.length}/{columns.length}
                  </span>
                )}
              </Menu.Trigger>
            </Tip>
            <Menu.Portal>
              <Menu.Positioner align="end" sideOffset={4} className="z-50">
                <Menu.Popup className={cn(menuPopup, "max-h-80 w-60")}>
                  <div className={menuLabel}>Columns</div>
                  {columns.map((c, ci) => (
                    <Menu.CheckboxItem
                      key={ci}
                      closeOnClick={false}
                      checked={!hidden.has(ci)}
                      disabled={!hidden.has(ci) && visible.length <= 1}
                      onCheckedChange={(on) =>
                        setHidden((h) => {
                          const n = new Set(h);
                          if (on) n.delete(ci);
                          else n.add(ci);
                          return n;
                        })
                      }
                      className={menuItem}
                    >
                      <span className="grid size-3.5 place-items-center">
                        <Menu.CheckboxItemIndicator>
                          <CheckIcon className="text-foreground!" />
                        </Menu.CheckboxItemIndicator>
                      </span>
                      <span className="min-w-0 flex-1 truncate">{c.name}</span>
                      {c.type && <span className="font-mono text-[11px] text-faint">{c.type}</span>}
                    </Menu.CheckboxItem>
                  ))}
                  {hidden.size > 0 && (
                    <>
                      <div className={menuSep} />
                      <Menu.Item className={menuItem} onClick={() => setHidden(new Set())}>
                        Show all columns
                      </Menu.Item>
                    </>
                  )}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>

          <Menu.Root>
            <Menu.Trigger className={textBtn}>
              <DownloadIcon />
              Download
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner align="end" sideOffset={4} className="z-50">
                <Menu.Popup className={cn(menuPopup, "w-64")}>
                  <div className={menuLabel}>
                    {order.length.toLocaleString()} rows · {visible.length} columns
                  </div>
                  {EXPORT_FORMATS.map((f) => (
                    <Menu.Item
                      key={f.id}
                      className={cn(menuItem, "h-auto py-1.5")}
                      onClick={() => download(f)}
                    >
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span>{f.label}</span>
                        <span className="text-[11px] text-muted-foreground">{f.hint}</span>
                      </span>
                      <span className="font-mono text-[11px] text-faint">.{f.ext}</span>
                    </Menu.Item>
                  ))}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </div>

      {/* The grid, with one right-click menu for every cell. */}
      <ContextMenu.Root>
        <ContextMenu.Trigger
          ref={scroller}
          className="relative min-h-0 flex-1 overflow-auto"
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          onContextMenu={(e) => {
            const td = (e.target as HTMLElement).closest<HTMLElement>("td[data-r]");
            setMenuCell(td ? { row: Number(td.dataset.r), col: Number(td.dataset.c) } : null);
          }}
        >
          <table
            className="table-fixed border-separate border-spacing-0 font-mono text-[12.5px]"
            style={{ width: totalW, minWidth: "100%" }}
          >
            <colgroup>
              <col style={{ width: 48 }} />
              {visible.map((ci) => (
                <col key={ci} style={{ width: widths[ci] }} />
              ))}
            </colgroup>
            <thead className="sticky top-0 z-10 bg-background">
              <tr>
                <th className="h-9 border-r border-b border-border" aria-label="Row" />
                {visible.map((ci) => {
                  const c = columns[ci]!;
                  const on = sort?.col === ci;
                  return (
                    <th
                      key={ci}
                      scope="col"
                      className="h-9 border-r border-b border-border p-0 text-left font-sans font-medium"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(ci)}
                        className="group flex h-9 w-full min-w-0 items-center gap-1.5 px-3 text-[12.5px] text-foreground hover:bg-muted/60"
                      >
                        <span className="truncate">{c.name}</span>
                        {c.type && (
                          <span className="shrink-0 font-mono text-[11px] font-normal text-faint">
                            {c.type}
                          </span>
                        )}
                        {maskedSet.has(c.name) && (
                          <Tip label="Masked by the sharer">
                            <EyeOffIcon className="size-3 shrink-0 text-faint" />
                          </Tip>
                        )}
                        {/* Always takes its room, so sorting never shifts the header. */}
                        <span
                          className={cn(
                            "ms-auto grid size-3.5 shrink-0 place-items-center",
                            on ? "text-foreground" : "text-transparent group-hover:text-faint",
                          )}
                        >
                          {on && sort.dir === -1 ? (
                            <ArrowDownIcon className="size-3" />
                          ) : (
                            <ArrowUpIcon className="size-3" />
                          )}
                        </span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {first > 0 && (
                <tr aria-hidden="true">
                  <td colSpan={visible.length + 1} style={{ height: first * ROW_H }} />
                </tr>
              )}
              {pageRows.slice(first, last).map((ri, k) => (
                <tr key={ri} className="group/row hover:bg-accent/50">
                  <td
                    className="border-r border-b border-border/60 px-2 text-right text-[11px] text-faint tabular-nums"
                    style={{ height: ROW_H }}
                  >
                    {safePage * pageSize + first + k + 1}
                  </td>
                  {visible.map((ci) => {
                    const s = text[ri]![ci]!;
                    const key = `${ri}:${ci}`;
                    const isNull = rows[ri]![ci] === null || rows[ri]![ci] === undefined;
                    return (
                      <td
                        key={ci}
                        data-r={ri}
                        data-c={ci}
                        onClick={() => copy(s, key)}
                        title={s.length > 48 ? s.slice(0, 2000) : undefined}
                        style={{ height: ROW_H }}
                        className={cn(
                          "cursor-copy truncate border-r border-b border-border/60 px-3 whitespace-nowrap",
                          isNull ? "text-faint italic" : "text-soft",
                        )}
                      >
                        {copied === key ? (
                          <span className="inline-flex items-center gap-1 font-sans text-foreground">
                            <CheckIcon className="size-3" /> Copied
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
              {last < pageRows.length && (
                <tr aria-hidden="true">
                  <td
                    colSpan={visible.length + 1}
                    style={{ height: (pageRows.length - last) * ROW_H }}
                  />
                </tr>
              )}
            </tbody>
          </table>
          {order.length === 0 && (
            <div className="p-10 text-center text-[13px] text-muted-foreground">
              No rows match.{" "}
              <button
                type="button"
                className="text-foreground underline-offset-4 hover:underline"
                onClick={() => {
                  setQuery("");
                  setFilters([]);
                }}
              >
                Clear search and filters
              </button>
            </div>
          )}
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Positioner className="z-50">
            <ContextMenu.Popup className={cn(menuPopup, "w-60")}>
              {menuCell ? (
                <CellMenu
                  column={columns[menuCell.col]!.name}
                  value={text[menuCell.row]![menuCell.col]!}
                  isNull={
                    rows[menuCell.row]![menuCell.col] === null ||
                    rows[menuCell.row]![menuCell.col] === undefined
                  }
                  onCopy={() =>
                    void navigator.clipboard.writeText(text[menuCell.row]![menuCell.col]!)
                  }
                  onCopyRow={() => void navigator.clipboard.writeText(rowObject(menuCell.row))}
                  onCopyColumn={() =>
                    void navigator.clipboard.writeText(
                      order.map((ri) => text[ri]![menuCell.col]!).join("\n"),
                    )
                  }
                  onFilter={(not) =>
                    addFilter(menuCell.col, text[menuCell.row]![menuCell.col]!, not)
                  }
                  onSort={(dir) => setSort({ col: menuCell.col, dir })}
                  onHide={() => hideCol(menuCell.col)}
                  canHide={visible.length > 1}
                />
              ) : (
                <ContextMenu.Item className={menuItem} disabled>
                  Right-click a cell
                </ContextMenu.Item>
              )}
            </ContextMenu.Popup>
          </ContextMenu.Positioner>
        </ContextMenu.Portal>
      </ContextMenu.Root>

      {/* Status bar: where you are in the rows, the pager, then the share's own facts. */}
      <div className="flex h-9 shrink-0 items-center gap-3 border-t border-border px-3 text-[12px] text-muted-foreground">
        <span className="tabular-nums">
          {order.length === 0
            ? "No rows"
            : `${from.toLocaleString()}–${to.toLocaleString()} of ${order.length.toLocaleString()}`}
          {order.length !== rows.length && (
            <span className="text-faint"> · filtered from {rows.length.toLocaleString()}</span>
          )}
        </span>
        {totalRows && totalRows > rows.length ? (
          <Tip
            label={`The sharer's result had ${totalRows.toLocaleString()} rows; the link carries the first ${rows.length.toLocaleString()}.`}
          >
            <span className="cursor-default text-faint">
              of {totalRows.toLocaleString()} in the source
            </span>
          </Tip>
        ) : null}
        {masked.length > 0 && (
          <Tip label={`Masked by the sharer: ${masked.join(", ")}`}>
            <span className="inline-flex cursor-default items-center gap-1 text-faint">
              <EyeOffIcon className="size-3.5" />
              {masked.length} masked
            </span>
          </Tip>
        )}

        <div className="ms-auto flex items-center gap-3">
          {status}
          <Menu.Root>
            <Menu.Trigger className="inline-flex h-7 items-center gap-1 rounded-md px-1.5 tabular-nums hover:bg-accent hover:text-foreground data-popup-open:bg-accent">
              {pageSize} / page
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner side="top" align="end" sideOffset={4} className="z-50">
                <Menu.Popup className={cn(menuPopup, "min-w-32")}>
                  <Menu.RadioGroup value={pageSize} onValueChange={(v) => setPageSize(Number(v))}>
                    {PAGE_SIZES.map((n) => (
                      <Menu.RadioItem key={n} value={n} className={menuItem}>
                        <span className="grid size-3.5 place-items-center">
                          <Menu.RadioItemIndicator>
                            <CheckIcon className="text-foreground!" />
                          </Menu.RadioItemIndicator>
                        </span>
                        {n} rows
                      </Menu.RadioItem>
                    ))}
                  </Menu.RadioGroup>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
          <div className="flex items-center">
            <PageBtn label="First page" disabled={safePage === 0} onClick={() => setPage(0)}>
              <ChevronsLeftIcon />
            </PageBtn>
            <PageBtn
              label="Previous page"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
              <ChevronLeftIcon />
            </PageBtn>
            <span className="min-w-16 text-center tabular-nums">
              {safePage + 1} / {pages}
            </span>
            <PageBtn
              label="Next page"
              disabled={safePage >= pages - 1}
              onClick={() => setPage(safePage + 1)}
            >
              <ChevronRightIcon />
            </PageBtn>
            <PageBtn
              label="Last page"
              disabled={safePage >= pages - 1}
              onClick={() => setPage(pages - 1)}
            >
              <ChevronsRightIcon />
            </PageBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageBtn({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-7 place-items-center rounded-md hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-3.5"
    >
      {children}
    </button>
  );
}

function CellMenu({
  column,
  value,
  isNull,
  onCopy,
  onCopyRow,
  onCopyColumn,
  onFilter,
  onSort,
  onHide,
  canHide,
}: {
  column: string;
  value: string;
  isNull: boolean;
  onCopy: () => void;
  onCopyRow: () => void;
  onCopyColumn: () => void;
  onFilter: (not: boolean) => void;
  onSort: (dir: 1 | -1) => void;
  onHide: () => void;
  canHide: boolean;
}) {
  const shown = isNull ? "NULL" : value.length > 24 ? `${value.slice(0, 24)}…` : value;
  return (
    <>
      <ContextMenu.Item className={menuItem} onClick={onCopy}>
        <CopyIcon /> Copy value
      </ContextMenu.Item>
      <ContextMenu.Item className={menuItem} onClick={onCopyRow}>
        <FileJsonIcon /> Copy row as JSON
      </ContextMenu.Item>
      <ContextMenu.Item className={menuItem} onClick={onCopyColumn}>
        <ClipboardCopyIcon /> Copy column
      </ContextMenu.Item>
      <div className={menuSep} />
      <ContextMenu.Item className={menuItem} onClick={() => onFilter(false)}>
        <EqualIcon />{" "}
        <span className="min-w-0 truncate">
          Only {column} = <span className="font-mono">{shown}</span>
        </span>
      </ContextMenu.Item>
      <ContextMenu.Item className={menuItem} onClick={() => onFilter(true)}>
        <EqualNotIcon />{" "}
        <span className="min-w-0 truncate">
          Without {column} = <span className="font-mono">{shown}</span>
        </span>
      </ContextMenu.Item>
      <div className={menuSep} />
      <ContextMenu.Item className={menuItem} onClick={() => onSort(1)}>
        <ArrowUpNarrowWideIcon /> Sort ascending
      </ContextMenu.Item>
      <ContextMenu.Item className={menuItem} onClick={() => onSort(-1)}>
        <ArrowDownWideNarrowIcon /> Sort descending
      </ContextMenu.Item>
      <ContextMenu.Item className={menuItem} onClick={onHide} disabled={!canHide}>
        <EyeOffIcon /> Hide {column}
      </ContextMenu.Item>
    </>
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
    <Tip label={done ? "Copied" : label} side="bottom">
      <button
        type="button"
        aria-label={label}
        onClick={() => void navigator.clipboard.writeText(text).then(() => setDone(true))}
        className={iconBtn}
      >
        {done ? <CheckIcon /> : <CopyIcon />}
      </button>
    </Tip>
  );
}
