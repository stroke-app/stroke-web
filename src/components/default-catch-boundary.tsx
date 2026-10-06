import {
  type ErrorComponentProps,
  Link,
  rootRouteId,
  useLocation,
  useMatch,
  useRouter,
} from "@tanstack/react-router";
import { RotateCwIcon } from "lucide-react";
import { useEffect } from "react";

import { SITE, siteButton, WRAP } from "#/components/page";
import { StrokeIcon } from "#/components/stroke-icon";
import { REPO_URL } from "#/lib/seo";
import { cn } from "#/lib/utils";

import { Button } from "./ui/button";

/**
 * A code chunk that no longer exists: the tab was opened before a deploy (or a
 * dev-server restart) and is now asking for a file under an old hash. The only
 * fix is a fresh page, so reload once instead of showing an error screen.
 */
const STALE_CHUNK =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;
const RELOAD_KEY = "stroke:stale-chunk-reload";

function reloadOnceForStaleChunk(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  if (!STALE_CHUNK.test(message)) return false;
  try {
    // Guard against a reload loop if the chunk is missing even after a reload.
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < 10_000) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // Storage unavailable (private mode): still worth one reload.
  }
  window.location.reload();
  return true;
}

export function DefaultCatchBoundary({ error }: Readonly<ErrorComponentProps>) {
  const router = useRouter();
  const pathname = useLocation({ select: (location) => location.pathname });

  useEffect(() => {
    reloadOnceForStaleChunk(error);
  }, [error]);
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  console.error(error);

  const message = error instanceof Error ? error.message : String(error);
  const retry = () => {
    void router.invalidate();
  };
  // Leave the page: home from the root, otherwise back to wherever the visitor came from.
  const leave = isRoot
    ? { label: "Home", onClick: undefined }
    : {
        label: "Go back",
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          window.history.back();
        },
      };

  // Inside the signed-in app, which keeps its own theme and layout.
  if (pathname === "/app" || pathname.startsWith("/app/")) {
    return (
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-5 p-6 text-center">
        <div className="max-w-md">
          <h1 className="text-lg font-semibold tracking-tight">Something went wrong</h1>
          <p className="mt-1 text-sm break-words text-muted-foreground">{message}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={retry}>
            Try again
          </Button>
          <Button
            render={<Link to="/" onClick={leave.onClick} />}
            variant="secondary"
            nativeButton={false}
          >
            {leave.label}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(SITE, "relative isolate flex min-h-svh flex-col overflow-hidden")}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(60%_100%_at_50%_0%,rgb(255_255_255/0.06),transparent)]"
      />
      <header className={cn(WRAP, "flex h-16 items-center")}>
        <Link
          to="/"
          aria-label="Stroke home"
          className="flex items-center gap-2.5 rounded-md text-[15px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <StrokeIcon className="size-[22px]" alt="" />
          Stroke
        </Link>
      </header>

      <main className={cn(WRAP, "flex flex-1 flex-col justify-center pt-16 pb-28")}>
        <p className="text-[13px] font-medium text-muted-foreground">Error</p>
        <h1 className="mt-5 max-w-3xl text-[3rem] text-balance sm:text-6xl md:text-[4.5rem]">
          Something went wrong
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-[1.55] text-pretty text-soft md:text-xl md:leading-[1.5]">
          This page hit an error while loading. Trying again usually fixes it. If it keeps
          happening,{" "}
          <a
            href={`${REPO_URL}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline decoration-white/30 underline-offset-[3px] transition-colors hover:decoration-white/70"
          >
            report it on GitHub
          </a>
          .
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <button type="button" onClick={retry} className={siteButton()}>
            <RotateCwIcon className="size-4" />
            Try again
          </button>
          <Link to="/" onClick={leave.onClick} className={siteButton({ variant: "secondary" })}>
            {leave.label}
          </Link>
        </div>

        {message && (
          <details className="group mt-16 max-w-2xl">
            <summary className="w-fit cursor-pointer list-none text-[13px] text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">Show error details</span>
              <span className="hidden group-open:inline">Hide error details</span>
            </summary>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-[#0b0c0d] px-4 py-3.5 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap text-soft">
              {message}
            </pre>
          </details>
        )}
      </main>
    </div>
  );
}
