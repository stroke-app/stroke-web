import { Menu } from "@base-ui/react/menu";
import { HistoryIcon, Loader2Icon, PlayIcon, TriangleAlertIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { menuItem, menuPopup, textBtn } from "#/components/share/share-ui";
import type { BridgeClient, Engine, Result } from "#/lib/studio-bridge";
import { cn } from "#/lib/utils";

import { DataGrid } from "./data-grid";
import { SqlEditor, type SqlEditorHandle } from "./sql-editor";

const HISTORY_KEY = "stroke-studio-history";
const isWrite = (sql: string) =>
  /^\s*(insert|update|delete|create|alter|drop|truncate|rename|grant|revoke|replace|merge|vacuum|analyze|comment)\b/im.test(
    sql,
  );

function loadHistory(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** One SQL console: an editor with autocomplete, Mod+Enter to run, the result below. */
export function SqlTab({
  id,
  client,
  engine,
  schema,
  initial = "",
  onRanWrite,
}: {
  id: string;
  client: BridgeClient;
  engine: Engine;
  schema: Record<string, string[]>;
  initial?: string;
  /** A statement that changes data or the schema ran: refresh the sidebar. */
  onRanWrite?: () => void;
}) {
  const storeKey = `stroke-studio-sql:${id}`;
  const [sql, setSql] = useState(() => {
    try {
      return sessionStorage.getItem(storeKey) ?? initial;
    } catch {
      return initial;
    }
  });
  const [result, setResult] = useState<(Result & { durationMs: number }) | null>(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<string[]>(loadHistory);
  const editor = useRef<SqlEditorHandle | null>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(storeKey, sql);
    } catch {
      // not kept
    }
  }, [sql, storeKey]);

  async function run() {
    const text = (editor.current?.runnable() ?? sql).trim();
    if (!text || running) return;
    setRunning(true);
    setError("");
    try {
      const r = await client.query(text);
      setResult(r);
      if (isWrite(text)) onRanWrite?.();
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
      const next = [text, ...loadHistory().filter((h) => h !== text)].slice(0, 50);
      setHistory(next);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        // not kept
      }
    }
  }

  const summary = result
    ? result.columns.length
      ? `${result.rows.length.toLocaleString()} row${result.rows.length === 1 ? "" : "s"}`
      : `${result.command || "Done"}${result.rowCount != null ? ` · ${result.rowCount.toLocaleString()} affected` : ""}`
    : "";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-9 shrink-0 items-center gap-1 border-b border-border px-2">
        <button
          type="button"
          onClick={() => void run()}
          disabled={running || !sql.trim()}
          className="inline-flex h-7 items-center gap-1.5 rounded-md bg-primary px-3 text-[12.5px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          title="Run the selection, or everything (Mod+Enter)"
        >
          {running ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : (
            <PlayIcon className="size-3.5" />
          )}
          Run
        </button>
        <Menu.Root>
          <Menu.Trigger className={textBtn} disabled={!history.length}>
            <HistoryIcon /> History
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner align="start" sideOffset={4} className="z-50">
              <Menu.Popup className={cn(menuPopup, "max-h-96 w-[28rem]")}>
                {history.map((h) => (
                  <Menu.Item
                    key={h}
                    className={cn(menuItem, "h-auto py-1.5")}
                    onClick={() => setSql(h)}
                  >
                    <span className="line-clamp-2 font-mono text-[12px] whitespace-pre-wrap">
                      {h}
                    </span>
                  </Menu.Item>
                ))}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
        <span className="ms-auto text-[12px] text-muted-foreground tabular-nums">
          {summary}
          {result && ` · ${result.durationMs} ms`}
        </span>
      </div>
      <div className="h-[40%] min-h-28 shrink-0 border-b border-border">
        <SqlEditor
          value={sql}
          onChange={setSql}
          onRun={() => void run()}
          engine={engine}
          schema={schema}
          handleRef={editor}
          autoFocus
          placeholder="Write SQL. Mod+Enter runs the selection, or everything."
        />
      </div>
      {error ? (
        <div className="m-3 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 font-mono text-[12.5px] whitespace-pre-wrap text-destructive">
          <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </div>
      ) : result?.columns.length ? (
        <DataGrid columns={result.columns.map((name) => ({ name }))} rows={result.rows} />
      ) : (
        <div className="flex flex-1 items-center justify-center text-[12.5px] text-muted-foreground">
          {result ? summary : "Results appear here."}
        </div>
      )}
    </div>
  );
}
