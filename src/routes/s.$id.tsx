import { Popover } from "@base-ui/react/popover";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ClockIcon, EyeIcon, InfoIcon, KeyRoundIcon, LockIcon } from "lucide-react";
import { type ReactNode, Suspense, useEffect, useRef, useState } from "react";

import { EmbedDialog } from "#/components/share/embed-dialog";
import { Body, Center } from "#/components/share/share-body";
import { CopyButton } from "#/components/share/share-table";
import { iconBtn, ThemeMenu, Tip, TipProvider } from "#/components/share/share-ui";
import { StrokeIcon } from "#/components/stroke-icon";
import { b64urlDecode, deriveKey, openShare, type SharePayload } from "#/lib/shares/crypto";

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
  const tabular = ready && (ready.payload.kind === "result" || ready.payload.kind === "table");
  const facts = ready ? <ShareFacts meta={ready.meta} /> : null;
  const sql = ready && "sql" in ready.payload && ready.payload.sql ? ready.payload.sql : null;
  return (
    <TipProvider>
      <div className="flex h-dvh flex-col bg-background text-foreground">
        {/* Breadcrumb bar: the mark, "stroke", the share's title; tools on the right. */}
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-accent"
            aria-label="Stroke"
          >
            <StrokeIcon className="size-5" />
            <span className="text-[14px] text-muted-foreground">stroke</span>
          </Link>
          <span className="text-[14px] text-faint" aria-hidden="true">
            /
          </span>
          <h1 className="min-w-0 truncate text-[14px] font-medium">
            {ready?.payload.title ?? "Shared from Stroke"}
          </h1>
          <div className="ms-auto flex items-center gap-1">
            {sql && (
              <CopyButton
                text={sql}
                label={ready?.payload.kind === "query" ? "Copy SQL" : "Copy the query"}
              />
            )}
            {ready && (
              <EmbedDialog id={id} title={ready.payload.title} viewsLeft={ready.meta.viewsLeft} />
            )}
            {ready && <InfoButton meta={ready.meta} payload={ready.payload} />}
            <ThemeMenu />
            <Link
              to="/download"
              className="ms-1 inline-flex h-8 items-center rounded-lg bg-foreground px-3 text-[13px] font-medium text-background transition-[opacity,scale] duration-150 ease-out hover:opacity-90 active:scale-[0.97]"
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
                <LockIcon className="size-4" />
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
            <Body payload={state.payload} status={facts} />
          </Suspense>
        )}

        {/* The table has its own status bar (with the pager); everything else gets this one. */}
        {!tabular && (
          <footer className="flex h-9 shrink-0 items-center gap-3 border-t border-border px-3 text-[12px] text-muted-foreground">
            <Tip label="Decrypted in this browser with the key in the link. The server only ever held ciphertext.">
              <span className="inline-flex cursor-default items-center gap-1.5">
                <LockIcon className="size-3.5" /> End-to-end encrypted
              </span>
            </Tip>
            <span className="ms-auto flex items-center gap-3">{facts}</span>
          </footer>
        )}
      </div>
    </TipProvider>
  );
}

/** Expiry, views left and password, as small items with an explanation on hover. */
function ShareFacts({ meta }: { meta: Meta }) {
  return (
    <>
      {meta.passwordSalt && (
        <Tip label="Opened with a password. The link alone can't decrypt it.">
          <span className="inline-flex cursor-default items-center gap-1.5">
            <KeyRoundIcon className="size-3.5" /> Password
          </span>
        </Tip>
      )}
      {meta.viewsLeft !== null && (
        <Tip label="The link stops working after its last view.">
          <span className="inline-flex cursor-default items-center gap-1.5">
            <EyeIcon className="size-3.5" />
            {meta.viewsLeft <= 1 ? "Last view" : `${meta.viewsLeft - 1} views left`}
          </span>
        </Tip>
      )}
      {meta.expiresAt && (
        <Tip label={`Expires ${new Date(meta.expiresAt).toLocaleString()}`}>
          <span className="inline-flex cursor-default items-center gap-1.5">
            <ClockIcon className="size-3.5" /> Expires {relative(meta.expiresAt)}
          </span>
        </Tip>
      )}
    </>
  );
}

const KIND_LABEL: Record<string, string> = {
  result: "Query results",
  table: "Table rows",
  query: "SQL query",
  erd: "Schema diagram",
  mermaid: "Diagram",
  chart: "Chart",
  json: "JSON",
};

/** The (i): who shared what, from where, when, and how the link is limited. */
function InfoButton({ meta, payload }: { meta: Meta; payload: SharePayload }) {
  const rowsCols =
    "rows" in payload && "columns" in payload
      ? `${payload.rows.length.toLocaleString()} rows · ${payload.columns.length} columns`
      : null;
  const masked = "masked" in payload && payload.masked?.length ? payload.masked.join(", ") : null;
  const items: [string, ReactNode][] = [
    ["Type", KIND_LABEL[payload.kind] ?? payload.kind],
    ...(rowsCols ? ([["Size", rowsCols]] as [string, ReactNode][]) : []),
    ...(payload.source
      ? ([
          [
            "From",
            <span key="from" className="font-mono text-[12px] break-all">
              {payload.source}
            </span>,
          ],
        ] as [string, ReactNode][])
      : []),
    ...(payload.by ? ([["Shared by", payload.by]] as [string, ReactNode][]) : []),
    [
      "Shared",
      `${new Date(payload.createdAt || meta.createdAt).toLocaleString()} (${relative(payload.createdAt || meta.createdAt)})`,
    ],
    [
      "Expires",
      meta.expiresAt
        ? `${new Date(meta.expiresAt).toLocaleString()} (${relative(meta.expiresAt)})`
        : "Never",
    ],
    [
      "Views",
      meta.viewsLeft === null
        ? "Unlimited"
        : meta.viewsLeft <= 1
          ? "This was the last"
          : `${meta.viewsLeft - 1} left`,
    ],
    ...(masked ? ([["Masked", masked]] as [string, ReactNode][]) : []),
    ["Password", meta.passwordSalt ? "Required" : "None"],
  ];
  return (
    <Popover.Root>
      <Tip label="About this share" side="bottom">
        <Popover.Trigger className={iconBtn} aria-label="About this share">
          <InfoIcon />
        </Popover.Trigger>
      </Tip>
      <Popover.Portal>
        <Popover.Positioner align="end" sideOffset={6} className="z-50">
          <Popover.Popup className="w-80 origin-(--transform-origin) rounded-xl bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/8 transition-[opacity,scale] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <div className="px-3 pt-2.5 pb-2">
              <Popover.Title className="truncate text-[14px] font-medium">
                {payload.title}
              </Popover.Title>
              <Popover.Description className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <LockIcon className="size-3" /> End-to-end encrypted, decrypted in this browser
              </Popover.Description>
            </div>
            <dl className="border-t border-border px-3 py-1.5">
              {items.map(([k, v]) => (
                <div key={k} className="flex gap-3 py-1 text-[12.5px]">
                  <dt className="w-20 shrink-0 text-muted-foreground">{k}</dt>
                  <dd className="min-w-0 flex-1 text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
