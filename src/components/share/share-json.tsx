import {
  CheckIcon,
  ChevronRightIcon,
  CopyIcon,
  DownloadIcon,
  FoldVerticalIcon,
  SearchIcon,
  UnfoldVerticalIcon,
  XIcon,
} from "lucide-react";
import { createContext, use, useMemo, useState } from "react";

import { cn } from "#/lib/utils";

/**
 * A shared JSON document as a tree: objects and arrays fold, values keep
 * their JSON colors, and a search keeps the matching branches open. Copy and
 * Download hand over the document as the sharer sent it.
 */

type Ctx = { open: (path: string) => boolean; toggle: (path: string) => void; query: string };
const TreeCtx = createContext<Ctx>({ open: () => true, toggle: () => {}, query: "" });

const isObj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

/** Does a value, or anything under it, contain the query? */
function contains(v: unknown, q: string, key?: string): boolean {
  if (!q) return false;
  if (key && key.toLowerCase().includes(q)) return true;
  if (v === null || typeof v !== "object") return String(v).toLowerCase().includes(q);
  return Array.isArray(v)
    ? v.some((x) => contains(x, q))
    : Object.entries(v).some(([k, x]) => contains(x, q, k));
}

function Scalar({ value }: { value: unknown }) {
  const { query } = use(TreeCtx);
  const text = typeof value === "string" ? JSON.stringify(value) : String(value);
  const hit = query && text.toLowerCase().includes(query);
  return (
    <span
      className={cn(
        typeof value === "string" && "text-[#16803c] dark:text-[#7ee787]",
        typeof value === "number" && "text-[#b45309] dark:text-[#ffa657]",
        typeof value === "boolean" && "text-[#7c3aed] dark:text-[#d2a8ff]",
        value === null && "text-faint italic",
        hit && "rounded-sm bg-[#ffc107]/30",
      )}
    >
      {text}
    </span>
  );
}

function Node({
  name,
  value,
  path,
  last,
}: {
  name?: string;
  value: unknown;
  path: string;
  last: boolean;
}) {
  const { open, toggle, query } = use(TreeCtx);
  const comma = last ? "" : ",";
  const label =
    name !== undefined ? (
      <span
        className={cn(
          "text-[#1d4ed8] dark:text-[#79c0ff]",
          query && name.toLowerCase().includes(query) && "rounded-sm bg-[#ffc107]/30",
        )}
      >
        {/^\d+$/.test(name) ? name : JSON.stringify(name)}
        <span className="text-faint">: </span>
      </span>
    ) : null;
  if (value === null || typeof value !== "object") {
    return (
      <div className="ps-5 break-all whitespace-pre-wrap">
        {label}
        <Scalar value={value} />
        <span className="text-faint">{comma}</span>
      </div>
    );
  }
  const entries = Array.isArray(value)
    ? value.map((x, i) => [String(i), x] as const)
    : Object.entries(value);
  const [l, r] = Array.isArray(value) ? ["[", "]"] : ["{", "}"];
  const isOpen = open(path) || (!!query && contains(value, query));
  return (
    <div>
      <button
        type="button"
        onClick={() => toggle(path)}
        aria-expanded={isOpen}
        className="group flex w-full items-start gap-0.5 rounded-md text-left hover:bg-ink/[0.04]"
      >
        <ChevronRightIcon
          className={cn(
            "mt-[3px] size-3.5 shrink-0 text-faint transition-transform duration-150",
            isOpen && "rotate-90",
          )}
        />
        <span className="min-w-0">
          {label}
          <span className="text-faint">{l}</span>
          {!isOpen && (
            <>
              <span className="mx-1 rounded bg-ink/[0.06] px-1.5 text-[11px] text-muted-foreground">
                {entries.length}{" "}
                {Array.isArray(value)
                  ? entries.length === 1
                    ? "item"
                    : "items"
                  : entries.length === 1
                    ? "key"
                    : "keys"}
              </span>
              <span className="text-faint">
                {r}
                {comma}
              </span>
            </>
          )}
        </span>
      </button>
      {isOpen && (
        <>
          <div className="ms-[7px] border-l border-border ps-2">
            {entries.map(([k, x], i) => (
              <Node
                key={k}
                name={Array.isArray(value) ? undefined : k}
                value={x}
                path={`${path}/${k}`}
                last={i === entries.length - 1}
              />
            ))}
          </div>
          <div className="ps-5 text-faint">
            {r}
            {comma}
          </div>
        </>
      )}
    </div>
  );
}

export function ShareJson({
  value,
  title,
  totalItems,
  toolbar = true,
}: {
  value: unknown;
  title: string;
  totalItems?: number;
  toolbar?: boolean;
}) {
  // Open: the first two levels, then whatever was toggled.
  const [toggled, setToggled] = useState<Map<string, boolean>>(new Map());
  const [allOpen, setAllOpen] = useState<boolean | null>(null);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const text = useMemo(() => JSON.stringify(value, null, 2), [value]);
  const q = query.trim().toLowerCase();
  const ctx = useMemo<Ctx>(
    () => ({
      open: (p) => toggled.get(p) ?? allOpen ?? p.split("/").length <= 2,
      toggle: (p) =>
        setToggled((m) => {
          const n = new Map(m);
          const depth = p.split("/").length;
          n.set(p, !(m.get(p) ?? allOpen ?? depth <= 2));
          return n;
        }),
      query: q,
    }),
    [toggled, allOpen, q],
  );
  const count = Array.isArray(value) ? value.length : isObj(value) ? Object.keys(value).length : 0;
  const shown = Array.isArray(value) && totalItems && totalItems > value.length;

  const download = () => {
    const blob = new Blob([text], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "") || "shared"}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {toolbar && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-3 py-2">
          <div className="relative w-64 max-w-full">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search keys and values"
              aria-label="Search keys and values"
              className="h-8 w-full rounded-lg bg-muted pr-8 pl-8 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-1.5 grid size-5 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <XIcon className="size-3" />
              </button>
            )}
          </div>
          <span className="text-[12px] text-muted-foreground tabular-nums">
            {Array.isArray(value)
              ? shown
                ? `${count.toLocaleString()} of ${totalItems?.toLocaleString()} items`
                : `${count.toLocaleString()} ${count === 1 ? "item" : "items"}`
              : isObj(value)
                ? `${count} ${count === 1 ? "key" : "keys"}`
                : "Value"}
          </span>
          <div className="ms-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setAllOpen(!(allOpen ?? false));
                setToggled(new Map());
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {allOpen ? (
                <FoldVerticalIcon className="size-3.5" />
              ) : (
                <UnfoldVerticalIcon className="size-3.5" />
              )}
              {allOpen ? "Collapse all" : "Expand all"}
            </button>
            <button
              type="button"
              onClick={() =>
                void navigator.clipboard?.writeText(text).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                })
              }
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
              {copied ? "Copied" : "Copy JSON"}
            </button>
            <button
              type="button"
              onClick={download}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <DownloadIcon className="size-3.5" />
              Download
            </button>
          </div>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-auto p-4 font-mono text-[13px] leading-6">
        <TreeCtx value={ctx}>
          <Node value={value} path="$" last />
        </TreeCtx>
      </div>
    </div>
  );
}
