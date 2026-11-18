import { Link } from "@tanstack/react-router";
import { BookOpenIcon, CheckIcon, ChevronsUpDownIcon, CopyIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "#/lib/utils";

/**
 * The hero's command row: the one command to copy (`npx strokedb`), menus of
 * install and agent setup commands, and the docs. Every command copies on
 * click and says so.
 */

const MCP_URL = "http://127.0.0.1:4319/mcp";

export const INSTALL_COMMANDS = [
  { label: "macOS and Linux", command: "curl -fsSL https://stroke.click/install.sh | sh" },
  { label: "Windows (PowerShell)", command: "irm https://stroke.click/install.ps1 | iex" },
  { label: "Open a project's database", command: "npx strokedb" },
];

export const AGENT_COMMANDS = [
  { label: "Claude Code", command: `claude mcp add --transport http stroke ${MCP_URL}` },
  { label: "Codex", command: `codex mcp add stroke --url ${MCP_URL}` },
  { label: "Gemini CLI", command: `gemini mcp add --transport http stroke ${MCP_URL}` },
  {
    label: "Cursor, Claude Desktop and others",
    command: `{ "mcpServers": { "stroke": { "url": "${MCP_URL}" } } }`,
  },
];

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 1600);
    return () => clearTimeout(t);
  }, [copied]);
  const copy = (text: string) => {
    void navigator.clipboard?.writeText(text).then(() => setCopied(text));
  };
  return { copied, copy };
}

const CHIP =
  "inline-flex h-11 items-center gap-2.5 rounded-lg px-4 text-[15px] font-medium transition-[background-color,color,scale] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]";

/** The light chip: the command itself, copied on click. */
export function CommandChip({ command }: { command: string }) {
  const { copied, copy } = useCopy();
  const done = copied === command;
  return (
    <button
      type="button"
      onClick={() => copy(command)}
      aria-label={done ? "Copied" : `Copy ${command}`}
      className={cn(
        CHIP,
        "bg-primary font-mono text-[14px] font-normal text-primary-foreground hover:bg-primary/88",
      )}
    >
      {command}
      {done ? (
        <CheckIcon className="size-4 opacity-70" />
      ) : (
        <CopyIcon className="size-4 opacity-50" />
      )}
    </button>
  );
}

/** A button that opens a list of commands; each row copies its command. */
export function CommandMenu({
  label,
  items,
  tone = "light",
}: {
  label: string;
  items: { label: string; command: string }[];
  tone?: "light" | "dark";
}) {
  const [open, setOpen] = useState(false);
  const { copied, copy } = useCopy();
  const root = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          CHIP,
          tone === "light"
            ? "bg-ink/[0.12] text-foreground hover:bg-ink/[0.16]"
            : "bg-secondary text-foreground shadow-[0_0_0_1px_var(--border)_inset] hover:bg-accent",
        )}
      >
        {label}
        <ChevronsUpDownIcon className="size-4 opacity-60" />
      </button>
      {open && (
        <div
          id={id}
          className="absolute top-[calc(100%+8px)] left-0 z-30 w-[min(30rem,calc(100vw-3rem))] origin-top-left animate-in rounded-xl bg-popover p-1.5 shadow-[0_0_0_1px_var(--border),0_24px_60px_-20px_rgb(0_0_0/0.6)] duration-150 fade-in-0 slide-in-from-top-1"
        >
          <ul>
            {items.map((it) => (
              <li key={it.label}>
                <button
                  type="button"
                  onClick={() => copy(it.command)}
                  className="group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 hover:bg-ink/[0.05]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-foreground">
                      {it.label}
                    </span>
                    <code className="mt-1 block truncate font-mono text-[12.5px] text-muted-foreground">
                      {it.command}
                    </code>
                  </span>
                  <span className="mt-0.5 flex shrink-0 items-center gap-1 text-[12px] text-muted-foreground">
                    {copied === it.command ? (
                      <>
                        <CheckIcon className="size-3.5 text-foreground" /> Copied
                      </>
                    ) : (
                      <CopyIcon className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function DocsButton() {
  return (
    <Link
      to="/docs"
      className={cn(
        CHIP,
        "bg-secondary text-foreground shadow-[0_0_0_1px_var(--border)_inset] hover:bg-accent",
      )}
    >
      <BookOpenIcon className="size-4" />
      Documentation
    </Link>
  );
}
