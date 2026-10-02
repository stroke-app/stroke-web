import {
  BracesIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  KeyRoundIcon,
  ListTreeIcon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  WrapTextIcon,
  XIcon,
} from "lucide-react";
import { Fragment, useState, type ReactNode } from "react";

import { cn } from "#/lib/utils";

type Row = { id: number; source: string; chunk: number; tokens: number };

const BASE_ROWS: Row[] = [
  { id: 1, source: "runbook.md", chunk: 12, tokens: 262 },
  { id: 2, source: "runbook.md", chunk: 7, tokens: 244 },
  { id: 3, source: "contracts/2024.docx", chunk: 10, tokens: 251 },
  { id: 4, source: "handbook.pdf", chunk: 9, tokens: 239 },
  { id: 5, source: "support-tickets.csv", chunk: 1, tokens: 270 },
  { id: 6, source: "design-system.md", chunk: 12, tokens: 258 },
];

const POINTS = [
  {
    icon: PencilIcon,
    title: "Type-aware editors",
    desc: "Dates get a calendar with time, enums a picker, arrays an add/remove list, JSON a real editor.",
  },
  {
    icon: CheckIcon,
    title: "Staged, never surprise-written",
    desc: "Edits, new rows and deletes queue up in the grid. Review them, reset them, or apply them together.",
  },
  {
    icon: BracesIcon,
    title: "Inline JSON preview",
    desc: "Expand any row into a tree or raw JSON view, with copy on every key and value.",
  },
  {
    icon: WrapTextIcon,
    title: "Room for long values",
    desc: "Open a cell in the editor panel with wrapping and line numbers, then stage it with Ctrl+Enter.",
  },
];

export function EditingShowcase() {
  return (
    <section id="editing" className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            Edit like a spreadsheet. Commit like you meant it.
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Every change is staged in the grid first. Try it: click a source to edit it, tick a
            row to delete it, expand one to see it as JSON.
          </p>
        </div>

        <GridDemo />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <DatePickerCard />
          <CellEditorCard />
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map((p) => (
            <div key={p.title} className="flex flex-col gap-2">
              <p.icon className="size-5 text-muted-foreground" />
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Grid demo ──────────────────────────────────────────────────────────────

function Frame({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex h-9 items-center gap-2 border-b border-border px-3">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        </span>
        <span className="ml-2 font-mono text-xs text-muted-foreground">{title}</span>
      </div>
      {children}
    </div>
  );
}

function GridDemo() {
  const [rows, setRows] = useState(BASE_ROWS);
  const [edits, setEdits] = useState<Record<number, string>>({});
  const [deleted, setDeleted] = useState<Set<number>>(new Set());
  const [added, setAdded] = useState<string[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [expanded, setExpanded] = useState<number | null>(6);
  const [applied, setApplied] = useState(0);

  const pending = Object.keys(edits).length + deleted.size + added.length;

  function startEdit(row: Row) {
    setEditing(row.id);
    setDraft(edits[row.id] ?? row.source);
  }

  function commitEdit(row: Row) {
    const value = draft.trim();
    setEditing(null);
    setEdits((prev) => {
      const next = { ...prev };
      if (!value || value === row.source) delete next[row.id];
      else next[row.id] = value;
      return next;
    });
  }

  function toggleDelete(id: number) {
    setDeleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function reset() {
    setEdits({});
    setDeleted(new Set());
    setAdded([]);
    setEditing(null);
  }

  function apply() {
    let nextId = Math.max(...rows.map((r) => r.id)) + 1;
    const kept = rows
      .filter((r) => !deleted.has(r.id))
      .map((r) => (edits[r.id] ? { ...r, source: edits[r.id] } : r));
    const created = added.map((source) => ({ id: nextId++, source, chunk: 1, tokens: 0 }));
    setRows([...kept, ...created]);
    setApplied(pending);
    reset();
    if (expanded !== null && deleted.has(expanded)) setExpanded(null);
    window.setTimeout(() => setApplied(0), 2200);
  }

  return (
    <Frame title="openai_docs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse font-mono text-[13px]">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="w-8" />
              <th className="w-8" />
              <th className="px-3 py-2 font-medium">
                <span className="inline-flex items-center gap-1.5 text-foreground">
                  id <KeyRoundIcon className="size-3 text-amber-500" />
                </span>{" "}
                <span className="text-xs">int4</span>
              </th>
              <th className="px-3 py-2 font-medium">
                <span className="text-foreground">source</span> <span className="text-xs">text</span>
              </th>
              <th className="px-3 py-2 font-medium">
                <span className="text-foreground">chunk</span> <span className="text-xs">int4</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {added.map((source, i) => (
              <tr key={`new-${i}`} className="border-b border-border bg-emerald-500/[0.07]">
                <td className="border-l-2 border-emerald-500" />
                <td className="px-2 text-center text-emerald-600 dark:text-emerald-400">
                  <PlusIcon className="mx-auto size-3.5" />
                </td>
                <td className="px-3 py-2 text-muted-foreground italic">auto-increment</td>
                <td className="px-3 py-2">{source}</td>
                <td className="px-3 py-2">1</td>
              </tr>
            ))}
            {rows.map((row) => {
              const isDeleted = deleted.has(row.id);
              const edited = edits[row.id];
              const isOpen = expanded === row.id;
              return (
                <Fragment key={row.id}>
                  <tr
                    className={cn(
                      "border-b border-border transition-colors",
                      isDeleted ? "bg-destructive/[0.08]" : "hover:bg-muted/40",
                    )}
                  >
                    <td className={cn("border-l-2", isDeleted ? "border-destructive" : "border-transparent")}>
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : row.id)}
                        aria-label={isOpen ? `Collapse row ${row.id}` : `Expand row ${row.id} as JSON`}
                        aria-expanded={isOpen}
                        className="flex h-9 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        <ChevronDownIcon
                          className={cn("size-3.5 transition-transform duration-150", !isOpen && "-rotate-90")}
                        />
                      </button>
                    </td>
                    <td className="px-2 text-center">
                      <input
                        type="checkbox"
                        checked={isDeleted}
                        onChange={() => toggleDelete(row.id)}
                        aria-label={`Stage row ${row.id} for deletion`}
                        className="size-3.5 accent-destructive"
                      />
                    </td>
                    <td className={cn("px-3 py-2", isDeleted && "text-muted-foreground line-through")}>
                      {row.id}
                    </td>
                    <td className="p-0">
                      {editing === row.id ? (
                        <input
                          autoFocus
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onBlur={() => commitEdit(row)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitEdit(row);
                            if (e.key === "Escape") setEditing(null);
                          }}
                          aria-label={`Edit source of row ${row.id}`}
                          className="h-9 w-full bg-background px-3 font-mono text-[13px] outline-none ring-1 ring-emerald-500 ring-inset"
                        />
                      ) : (
                        <button
                          type="button"
                          disabled={isDeleted}
                          onClick={() => startEdit(row)}
                          className={cn(
                            "flex h-9 w-full items-center px-3 text-left",
                            edited && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                            isDeleted && "text-muted-foreground line-through",
                            !isDeleted && "cursor-text",
                          )}
                        >
                          {edited ?? row.source}
                        </button>
                      )}
                    </td>
                    <td className={cn("px-3 py-2", isDeleted && "text-muted-foreground line-through")}>
                      {row.chunk}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="border-b border-border bg-muted/20">
                      <td colSpan={5} className="p-0">
                        <JsonPreview
                          row={{ ...row, source: edited ?? row.source }}
                          onClose={() => setExpanded(null)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border px-3 py-2 text-sm">
        <button
          type="button"
          onClick={() => setAdded((a) => [...a, "new-notes.md"])}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 font-medium transition-colors hover:bg-muted"
        >
          <PlusIcon className="size-3.5" />
          Add row
        </button>
        <span className="ml-auto font-mono text-xs text-muted-foreground" aria-live="polite">
          {applied > 0
            ? `Applied ${applied} change${applied === 1 ? "" : "s"}`
            : pending > 0
              ? `${pending} staged`
              : "No pending changes"}
        </span>
        <button
          type="button"
          onClick={reset}
          disabled={pending === 0}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <RotateCcwIcon className="size-3.5" />
          Reset
        </button>
        <button
          type="button"
          onClick={apply}
          disabled={pending === 0}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-600 px-3 font-medium text-white transition-[background-color,scale] hover:bg-emerald-600/90 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40"
        >
          <CheckIcon className="size-3.5" />
          Apply{pending > 0 ? ` ${pending}` : ""}
        </button>
      </div>
    </Frame>
  );
}

// ── Inline JSON preview ──────────────────────────────────────────────────

function JsonPreview({ row, onClose }: { row: Row; onClose: () => void }) {
  const [view, setView] = useState<"tree" | "raw">("tree");
  const [copied, setCopied] = useState(false);
  const obj = {
    id: row.id,
    source: row.source,
    chunk: row.chunk,
    tokens: row.tokens,
    embedding: "[-0.4345, -0.2924, 0.3002, -0.2084, 0.2906, …]",
  };
  const raw = JSON.stringify(obj, null, 2);

  async function copy() {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked (insecure context); the button just stays as is.
    }
  }

  return (
    <div className="px-4 py-3 pl-10">
      <div className="mb-2 flex items-center gap-3 font-sans text-xs">
        <span className="font-mono text-muted-foreground">row {row.id}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? <CheckIcon className="size-3.5 text-emerald-500" /> : <CopyIcon className="size-3.5" />}
          {copied ? "Copied" : "Copy JSON"}
        </button>
        <div className="ml-auto flex rounded-md bg-muted/60 p-0.5">
          {(["tree", "raw"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={cn(
                "inline-flex h-6 items-center gap-1 rounded px-2 capitalize transition-colors",
                view === v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v === "tree" ? <ListTreeIcon className="size-3" /> : <BracesIcon className="size-3" />}
              {v}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close JSON preview"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <XIcon className="size-3.5" />
        </button>
      </div>
      {view === "raw" ? (
        <pre className="overflow-x-auto text-[12.5px] leading-relaxed text-foreground/85">{raw}</pre>
      ) : (
        <div className="text-[12.5px] leading-relaxed">
          <span className="text-muted-foreground">{"{"}</span>
          {Object.entries(obj).map(([k, v]) => (
            <div key={k} className="pl-5">
              <span className="text-sky-700 dark:text-sky-300">{k}</span>
              <span className="text-muted-foreground">: </span>
              <span
                className={
                  typeof v === "number"
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-emerald-700 dark:text-emerald-300"
                }
              >
                {typeof v === "number" ? v : `"${v}"`}
              </span>
            </div>
          ))}
          <span className="text-muted-foreground">{"}"}</span>
        </div>
      )}
    </div>
  );
}

// ── Date picker ────────────────────────────────────────────────────────────

function DatePickerCard() {
  const [day, setDay] = useState(10);
  // October 2024 starts on a Tuesday: two trailing September days lead the grid.
  const cells = [29, 30, ...Array.from({ length: 31 }, (_, i) => i + 1), 1, 2];
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <Frame title="events.created_at  timestamptz">
      <div className="flex flex-col gap-3 p-4 font-mono text-[13px]">
        <div className="flex h-9 items-center justify-between rounded-md px-3 ring-1 ring-emerald-500">
          <span>2024-10-{pad(day)} 13:33:20 UTC</span>
          <CalendarIcon className="size-3.5 text-muted-foreground" />
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex size-7 items-center justify-center rounded-md bg-muted/60" aria-hidden>
              <ChevronLeftIcon className="size-3.5" />
            </span>
            <span className="font-medium">October 2024</span>
            <span className="flex size-7 items-center justify-center" aria-hidden>
              <ChevronRightIcon className="size-3.5 text-muted-foreground" />
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <span key={d} className="py-1 text-xs text-muted-foreground">
                {d}
              </span>
            ))}
            {cells.map((d, i) => {
              const outside = i < 2 || i > 32;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={outside}
                  onClick={() => setDay(d)}
                  aria-pressed={!outside && d === day}
                  className={cn(
                    "h-8 rounded-md transition-colors",
                    outside && "text-muted-foreground/40",
                    !outside && d === day ? "bg-emerald-600 text-white" : !outside && "hover:bg-muted",
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3">
            {["13", "33", "20"].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-muted-foreground">:</span>}
                <span className="flex h-8 w-10 items-center justify-center rounded-md bg-muted/60">{t}</span>
              </span>
            ))}
            <span className="ml-auto px-2 text-xs text-muted-foreground">Now</span>
            <span className="inline-flex h-8 items-center gap-1 rounded-md bg-emerald-600 px-2.5 font-sans text-xs font-medium text-white">
              <CheckIcon className="size-3.5" />
              Apply
            </span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ── Cell editor panel ────────────────────────────────────────────────────

const LONG_TEXT =
  "Chunk 8 of document 153: the quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog.";

function CellEditorCard() {
  const [text, setText] = useState(LONG_TEXT);
  const [staged, setStaged] = useState(false);
  const edited = text !== LONG_TEXT;

  return (
    <Frame title="openai_docs.content  text" className="flex flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 font-mono text-xs">
        <PencilIcon className="size-3.5 text-muted-foreground" />
        <span className="font-medium">content</span>
        <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">text</span>
        <span className="text-muted-foreground">
          row 15 · {text.length}c
        </span>
        {edited && <span className="text-emerald-600 dark:text-emerald-400">edited</span>}
        <button
          type="button"
          disabled={!edited || staged}
          onClick={() => setStaged(true)}
          className="ml-auto inline-flex h-7 items-center gap-2 rounded-md bg-emerald-500/10 px-2.5 font-sans font-medium text-emerald-700 transition-colors hover:bg-emerald-500/20 disabled:opacity-40 dark:text-emerald-300"
        >
          {staged ? "Staged" : "Stage change"}
          <kbd className="font-mono text-[11px] opacity-70">Ctrl ↵</kbd>
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setStaged(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && edited) {
            e.preventDefault();
            setStaged(true);
          }
        }}
        aria-label="Cell value"
        spellCheck={false}
        className="min-h-44 flex-1 resize-none bg-transparent p-4 font-mono text-[13px] leading-relaxed outline-none"
      />
      {staged && (
        <p className="border-t border-border px-4 py-2 font-mono text-xs text-emerald-600 dark:text-emerald-400">
          Staged. It joins the pending changes until you apply.
        </p>
      )}
    </Frame>
  );
}
