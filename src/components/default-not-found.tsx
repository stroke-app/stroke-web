import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { PageShell, siteButton, WRAP } from "#/components/page";
import { cn } from "#/lib/utils";

import { Button } from "./ui/button";

const SUGGESTIONS = [
  { to: "/features", label: "Features", note: "What Stroke does, engine by engine" },
  { to: "/download", label: "Download", note: "macOS, Windows, and Linux" },
  { to: "/docs", label: "Docs", note: "Getting started and MCP setup" },
  { to: "/changelog", label: "Changelog", note: "Every release, newest first" },
] as const;

/** Paths rendered inside the signed-in app, which keeps its own theme. */
function isAppPath(pathname: string) {
  return pathname === "/app" || pathname.startsWith("/app/");
}

export function DefaultNotFound() {
  const pathname = useLocation({ select: (location) => location.pathname });

  if (isAppPath(pathname)) {
    return (
      <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-5 p-6 text-center">
        <div>
          <p className="font-mono text-xs text-muted-foreground">404</p>
          <h1 className="mt-2 text-lg font-semibold tracking-tight">Page not found</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The page you are looking for does not exist.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button type="button" variant="secondary" onClick={() => window.history.back()}>
            Go back
          </Button>
          <Button render={<Link to="/app" />} nativeButton={false}>
            Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(60%_100%_at_50%_0%,rgb(255_255_255/0.06),transparent)]"
        />
        <div className={cn(WRAP, "relative pt-24 pb-24 md:pt-36 md:pb-32")}>
          <p className="font-mono text-[13px] text-faint">404</p>
          <h1 className="mt-5 max-w-3xl text-[3rem] text-balance sm:text-6xl md:text-[4.5rem]">
            This page doesn't exist
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.55] text-pretty text-soft md:text-xl md:leading-[1.5]">
            The link may be out of date, or the page may have moved. Everything else is right where
            you left it.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/" className={siteButton()}>
              Back to home
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className={siteButton({ variant: "secondary" })}
            >
              <ArrowLeftIcon className="size-4" />
              Go back
            </button>
          </div>

          <nav aria-label="Popular pages" className="mt-20 max-w-3xl md:mt-28">
            <p className="text-[13px] text-muted-foreground">Or try one of these</p>
            <ul className="mt-4 border-t border-border">
              {SUGGESTIONS.map((item) => (
                <li key={item.to} className="border-b border-border">
                  <Link
                    to={item.to}
                    className="group flex items-center gap-4 py-4 transition-colors outline-none focus-visible:bg-white/[0.03]"
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
                      <span className="text-[15px] font-medium sm:w-36 sm:shrink-0">
                        {item.label}
                      </span>
                      <span className="text-sm text-muted-foreground transition-colors group-hover:text-soft sm:truncate sm:text-[15px]">
                        {item.note}
                      </span>
                    </span>
                    <ArrowRightIcon className="size-4 shrink-0 text-faint transition-[translate,color] duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </PageShell>
  );
}
