import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Eye, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";

import { CopyButton, ShareTable } from "#/components/share/share-table";
import { StrokeIcon } from "#/components/stroke-icon";
import { b64urlDecode, deriveKey, openShare, type SharePayload } from "#/lib/shares/crypto";

const ShareErd = lazy(() =>
  import("#/components/share/share-canvas").then((m) => ({ default: m.ShareErd })),
);
const ShareMermaid = lazy(() =>
  import("#/components/share/share-canvas").then((m) => ({ default: m.ShareMermaid })),
);
const ShareChart = lazy(() =>
  import("#/components/share/share-chart").then((m) => ({ default: m.ShareChart })),
);

/**
 * /s/:id - a share link. Everything happens in the browser: the page fetches
 * the encrypted bytes, takes the key from the #fragment (never sent to the
 * server), asks for the password if there is one, decrypts and renders.
 */
export const Route = createFileRoute("/s/$id")({
  head: () => ({
    meta: [
      { title: "Shared from Stroke" },
      {
        name: "description",
        content: "A read-only share from the Stroke database client, end-to-end encrypted.",
      },
      // Shares are private: never index, never cache a copy.
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: SharePage,
});

type Meta = {
  id: string;
  kind: string;
  expiresAt: number | null;
  viewsLeft: number | null;
  passwordSalt: string | null;
  createdAt: number;
};
type State =
  | { s: "loading" }
  | { s: "gone"; message: string }
  | { s: "password"; meta: Meta; wrong?: boolean }
  | { s: "opening"; meta: Meta }
  | { s: "ready"; meta: Meta; payload: SharePayload }
  | { s: "error"; message: string };

function relative(ms: number): string {
  const d = ms - Date.now();
  const abs = Math.abs(d);
  const unit =
    abs < 3_600_000
      ? ["minute", 60_000]
      : abs < 86_400_000
        ? ["hour", 3_600_000]
        : ["day", 86_400_000];
  return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(
    Math.round(d / (unit[1] as number)),
    unit[0] as Intl.RelativeTimeFormatUnit,
  );
}

function SharePage() {
  const { id } = Route.useParams();
  const [state, setState] = useState<State>({ s: "loading" });
  const [password, setPassword] = useState("");
  // The content is fetched once (it counts a view); a wrong password retries the decrypt, not the fetch.
  const blob = useRef<ArrayBuffer | null>(null);

  const linkKey = typeof window === "undefined" ? null : window.location.hash.slice(1) || null;

  useEffect(() => {
    if (!linkKey) {
      setState({
        s: "error",
        message:
          "This link is missing its key: everything after the # was cut off. Ask for the full link.",
      });
      return;
    }
    void (async () => {
      const res = await fetch(`/api/shares/${id}`, { cache: "no-store" });
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      if (!res.ok) {
        setState({ s: "gone", message: body?.error?.message ?? "This link can't be opened." });
        return;
      }
      const meta = body as Meta;
      if (meta.passwordSalt) setState({ s: "password", meta });
      else void open(meta, null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function open(meta: Meta, pw: string | null) {
    setState({ s: "opening", meta });
    let bytes = blob.current;
    if (!bytes) {
      const res = await fetch(`/api/shares/${id}/content`, { method: "POST", cache: "no-store" });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        setState({ s: "gone", message: body?.error?.message ?? "This link can't be opened." });
        return;
      }
      bytes = await res.arrayBuffer();
      blob.current = bytes;
    }
    try {
      const key = await deriveKey(b64urlDecode(linkKey!), pw, meta.passwordSalt);
      setState({ s: "ready", meta, payload: await openShare(bytes, key) });
    } catch {
      if (meta.passwordSalt) setState({ s: "password", meta, wrong: true });
      else
        setState({
          s: "error",
          message:
            "This link's key doesn't match its content. Ask for the link again, copied whole.",
        });
    }
  }

  const ready = state.s === "ready" ? state : null;
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
        <Link to="/" className="flex items-center gap-2" aria-label="Stroke">
          <StrokeIcon className="size-5" />
        </Link>
        <span className="h-4 w-px bg-border" aria-hidden="true" />
        <span className="min-w-0 truncate text-[14px] font-medium">
          {ready?.payload.title ?? "Shared from Stroke"}
        </span>
        {ready?.payload.source && (
          <span className="hidden truncate text-[13px] text-muted-foreground md:inline">
            {ready.payload.source}
          </span>
        )}
        <div className="ms-auto flex items-center gap-1">
          {ready && ready.payload.kind === "query" && (
            <CopyButton text={ready.payload.sql} label="Copy SQL" />
          )}
          {ready &&
            "sql" in ready.payload &&
            ready.payload.kind !== "query" &&
            ready.payload.sql && <CopyButton text={ready.payload.sql} label="Copy query" />}
          <Link
            to="/download"
            className="inline-flex h-8 items-center rounded-lg bg-foreground px-3 text-[13px] font-medium text-background transition-[opacity,scale] duration-150 ease-out hover:opacity-90 active:scale-[0.97]"
          >
            Get Stroke
          </Link>
        </div>
      </header>

      {state.s === "loading" || state.s === "opening" ? (
        <Center>
          <p className="text-[13px] text-muted-foreground">
            {state.s === "loading" ? "Opening the link…" : "Decrypting in your browser…"}
          </p>
        </Center>
      ) : state.s === "gone" || state.s === "error" ? (
        <Center>
          <div className="max-w-sm text-center">
            <p className="text-[15px] font-medium">
              {state.s === "gone" ? "This link is no longer available" : "Can't open this link"}
            </p>
            <p className="mt-2 text-[13px] text-pretty text-muted-foreground">{state.message}</p>
          </div>
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
            <span className="grid size-10 place-items-center rounded-lg bg-muted">
              <Lock className="size-4" />
            </span>
            <p className="text-[15px] font-medium">This share needs a password</p>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
              placeholder="Password"
              className="h-9 w-full rounded-lg bg-muted px-3 text-[14px] outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            {state.wrong && (
              <p className="text-[13px] text-red-600 dark:text-red-400">
                That password doesn't open it.
              </p>
            )}
            <button
              type="submit"
              className="h-9 w-full rounded-lg bg-foreground text-[14px] font-medium text-background transition-[opacity,scale] duration-150 hover:opacity-90 active:scale-[0.98]"
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
          <Body payload={state.payload} />
        </Suspense>
      )}

      <footer className="flex h-9 shrink-0 items-center gap-4 border-t border-border px-4 text-[12px] text-faint">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5" /> End-to-end encrypted. Stroke's servers can't read it.
        </span>
        {ready?.meta.passwordSalt && (
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            <KeyRound className="size-3.5" /> Password protected
          </span>
        )}
        {ready && (
          <span className="ms-auto inline-flex items-center gap-3">
            {ready.meta.viewsLeft !== null && (
              <span className="inline-flex items-center gap-1.5">
                <Eye className="size-3.5" />{" "}
                {ready.meta.viewsLeft <= 1 ? "Last view" : `${ready.meta.viewsLeft - 1} views left`}
              </span>
            )}
            {ready.meta.expiresAt && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" /> Expires {relative(ready.meta.expiresAt)}
              </span>
            )}
          </span>
        )}
      </footer>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-0 flex-1 items-center justify-center p-6">{children}</div>;
}

function Body({ payload }: { payload: SharePayload }) {
  switch (payload.kind) {
    case "table":
    case "result":
      return (
        <ShareTable
          columns={payload.columns}
          rows={payload.rows}
          title={payload.title}
          masked={payload.masked}
          totalRows={payload.totalRows}
        />
      );
    case "query":
      return (
        <div className="min-h-0 flex-1 overflow-auto p-6">
          <pre className="mx-auto max-w-4xl rounded-xl bg-muted/60 p-5 font-mono text-[13px] leading-6 whitespace-pre-wrap text-soft shadow-[0_0_0_1px_var(--border)]">
            {payload.sql}
          </pre>
        </div>
      );
    case "erd":
      return <ShareErd tables={payload.tables} links={payload.links} />;
    case "mermaid":
      return <ShareMermaid code={payload.code} />;
    case "chart":
      return <ShareChart spec={payload.chart} columns={payload.columns} rows={payload.rows} />;
    default:
      return (
        <Center>
          <p className="text-[13px] text-muted-foreground">
            This share was made by a newer Stroke. Reload the page.
          </p>
        </Center>
      );
  }
}
