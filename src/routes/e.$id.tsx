import { createFileRoute } from "@tanstack/react-router";
import { LockIcon } from "lucide-react";
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";

import { Body, Center } from "#/components/share/share-body";
import { StrokeIcon } from "#/components/stroke-icon";
import { b64urlDecode, deriveKey, openShare, type SharePayload } from "#/lib/shares/crypto";
import {
  DEFAULT_EMBED,
  FONT_STACK,
  parseEmbedOptions,
  type EmbedOptions,
} from "#/lib/shares/embed";
import { cn } from "#/lib/utils";

/**
 * /e/:id - a share, embedded in another site. The same decryption as /s/:id
 * (the key is in the #fragment and never leaves the browser), without the
 * site chrome, styled from the query string (see lib/shares/embed.ts).
 */
export const Route = createFileRoute("/e/$id")({
  head: () => ({
    meta: [
      { title: "Shared from Stroke" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: EmbedPage,
});

type Meta = { id: string; kind: string; passwordSalt: string | null };
type State =
  | { s: "loading" }
  | { s: "password"; meta: Meta; wrong?: boolean }
  | { s: "ready"; payload: SharePayload }
  | { s: "error"; message: string };

function EmbedPage() {
  const { id } = Route.useParams();
  const [opts, setOpts] = useState<EmbedOptions>(DEFAULT_EMBED);
  const [state, setState] = useState<State>({ s: "loading" });
  const [password, setPassword] = useState("");
  const blob = useRef<ArrayBuffer | null>(null);
  const root = useRef<HTMLDivElement>(null);

  // Options and theme from the URL, before paint: an embed must not flash the
  // wrong theme, and it never touches the visitor's own saved site theme.
  useLayoutEffect(() => {
    const o = parseEmbedOptions(window.location.search);
    setOpts(o);
    const apply = () => {
      const dark =
        o.theme === "dark" ||
        (o.theme === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
      const html = document.documentElement;
      html.classList.remove("light", "dark");
      html.classList.add(dark ? "dark" : "light");
      html.style.colorScheme = dark ? "dark" : "light";
      if (o.bg === "transparent") {
        html.style.background = "transparent";
        document.body.style.background = "transparent";
      }
    };
    apply();
    if (o.theme !== "auto") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const key = window.location.hash.slice(1);
    if (!key) {
      setState({
        s: "error",
        message: "This embed is missing its key: the part of the link after # was cut off.",
      });
      return;
    }
    void (async () => {
      const res = await fetch(`/api/shares/${id}`, { cache: "no-store" });
      const body = (await res.json().catch(() => null)) as
        | (Meta & { error?: { message?: string } })
        | null;
      if (!res.ok || !body) {
        setState({
          s: "error",
          message: body?.error?.message ?? "This share is no longer available.",
        });
        return;
      }
      if (body.passwordSalt) setState({ s: "password", meta: body });
      else void open(body, null, key);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function open(meta: Meta, pw: string | null, key = window.location.hash.slice(1)) {
    let bytes = blob.current;
    if (!bytes) {
      const res = await fetch(`/api/shares/${id}/content`, { method: "POST", cache: "no-store" });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        setState({
          s: "error",
          message: body?.error?.message ?? "This share is no longer available.",
        });
        return;
      }
      bytes = await res.arrayBuffer();
      blob.current = bytes;
    }
    try {
      const k = await deriveKey(b64urlDecode(key), pw, meta.passwordSalt);
      setState({ s: "ready", payload: await openShare(bytes, k) });
    } catch {
      if (meta.passwordSalt) setState({ s: "password", meta, wrong: true });
      else setState({ s: "error", message: "This embed's key doesn't match its content." });
    }
  }

  // Auto height: tell the host page (embed.js) how tall to make the frame.
  // A table, diagram or chart fills its frame and scrolls inside it, so its
  // "content height" is just the frame's; those report the height they want
  // (rows plus the chrome on show, capped), the rest report what they measure.
  useEffect(() => {
    if (!opts.autoHeight || !root.current || window.parent === window) return;
    const el = root.current;
    const p = state.s === "ready" ? state.payload : null;
    const chrome = (opts.title ? 40 : 0) + (opts.footer ? 28 : 0) + (opts.border ? 2 : 0);
    const wanted =
      p && (p.kind === "table" || p.kind === "result")
        ? chrome + (opts.toolbar ? 44 : 0) + 36 + Math.max(3, Math.min(p.rows.length, 20)) * 32 + 40
        : p && (p.kind === "erd" || p.kind === "mermaid" || p.kind === "chart" || p.kind === "json")
          ? chrome + 460
          : null;
    const post = () =>
      window.parent.postMessage(
        {
          type: "stroke:embed:height",
          id,
          height: Math.min(900, wanted ?? Math.ceil(el.scrollHeight)),
        },
        "*",
      );
    if (wanted !== null) {
      post();
      return;
    }
    const ro = new ResizeObserver(post);
    ro.observe(el);
    post();
    return () => ro.disconnect();
  }, [opts.autoHeight, opts.title, opts.footer, opts.border, opts.toolbar, id, state]);

  const style: React.CSSProperties & Record<string, string | number> = {
    fontFamily: FONT_STACK[opts.font],
    borderRadius: opts.radius,
  };
  if (opts.bg && opts.bg !== "transparent") style["--background"] = opts.bg;
  if (opts.bg === "transparent") style["--background"] = "transparent";
  if (opts.accent) {
    style["--primary"] = opts.accent;
    style["--ring"] = opts.accent;
  }
  const ready = state.s === "ready" ? state : null;
  const fixedKinds =
    ready &&
    (ready.payload.kind === "result" ||
      ready.payload.kind === "table" ||
      ready.payload.kind === "erd" ||
      ready.payload.kind === "mermaid" ||
      ready.payload.kind === "chart" ||
      ready.payload.kind === "json");

  return (
    <div
      ref={root}
      style={style}
      className={cn(
        "flex flex-col overflow-hidden bg-background text-foreground",
        opts.autoHeight && !fixedKinds ? "min-h-0" : "h-dvh",
        opts.border && "border border-border",
      )}
    >
      {opts.title && ready && (
        <header className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3">
          <h1 className="min-w-0 truncate text-[13.5px] font-medium">
            {ready.payload.title || "Shared from Stroke"}
          </h1>
        </header>
      )}

      {state.s === "loading" ? (
        <Center>
          <p className="text-[13px] text-muted-foreground">Decrypting…</p>
        </Center>
      ) : state.s === "error" ? (
        <Center>
          <p className="max-w-sm text-center text-[13px] text-muted-foreground">{state.message}</p>
        </Center>
      ) : state.s === "password" ? (
        <Center>
          <form
            className="flex w-full max-w-xs flex-col items-center gap-3 text-center"
            onSubmit={(e) => {
              e.preventDefault();
              if (password) void open(state.meta, password);
            }}
          >
            <LockIcon className="size-4 text-muted-foreground" />
            <p className="text-[14px] font-medium">This share needs a password</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
              placeholder="Password"
              className="h-9 w-full rounded-lg bg-muted px-3 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {state.wrong && (
              <p className="text-[13px] text-red-600 dark:text-red-400">
                That password doesn't open it.
              </p>
            )}
            <button
              type="submit"
              className="h-9 w-full rounded-lg bg-primary text-[14px] font-medium text-primary-foreground hover:opacity-90"
            >
              Open
            </button>
          </form>
        </Center>
      ) : (
        <Suspense
          fallback={
            <Center>
              <p className="text-[13px] text-muted-foreground">Loading…</p>
            </Center>
          }
        >
          <Body payload={state.payload} toolbar={opts.toolbar} />
        </Suspense>
      )}

      {opts.footer && (
        <footer className="flex h-7 shrink-0 items-center gap-1.5 border-t border-border px-3 text-[11px] text-muted-foreground">
          <a
            href="https://stroke.click/?ref=embed"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <StrokeIcon className="size-3" /> Shared with Stroke
          </a>
          <span className="ms-auto">End-to-end encrypted</span>
        </footer>
      )}
    </div>
  );
}
