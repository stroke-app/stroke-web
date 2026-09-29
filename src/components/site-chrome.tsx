import { SiGithub } from "@icons-pack/react-simple-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { StrokeIcon } from "#/components/stroke-icon";
import { ThemeToggle } from "#/components/theme-toggle";
import { Button, buttonVariants } from "#/components/ui/button";
import { useAuth } from "#/lib/auth/hooks";
import { changelogQueryOptions } from "#/lib/changelog";
import { REPO_URL } from "#/lib/seo";
import { cn } from "#/lib/utils";

export { REPO_URL };

/**
 * The signature motif: a hand-drawn brush stroke, used under the hero
 * headline and echoed at smaller sizes across the site.
 */
export function BrushStroke({
  className,
  animate = false,
}: {
  className?: string;
  animate?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 220 12"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
      className={cn("text-copper", className)}
    >
      <path
        d="M4 8.5C42 3.5 96 2.5 133 4.5c30 1.6 55 3 83 2"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
        pathLength="1"
        className={animate ? "stroke-draw" : undefined}
      />
    </svg>
  );
}

const NAV_LINKS = [
  { label: "Features", to: "/features" },
  { label: "Docs", to: "/docs" },
  { label: "Pricing", to: "/pricing" },
  { label: "Changelog", to: "/changelog" },
  { label: "Roadmap", to: "/roadmap" },
  { label: "Download", to: "/download" },
] as const;

export function SiteHeader() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Warm the changelog cache on hover/focus so the page opens instantly.
  const prefetchChangelog = () => {
    void queryClient.prefetchQuery(changelogQueryOptions());
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-8">
          <Link to="/" aria-label="Stroke home" className="flex items-center gap-2">
            <StrokeIcon className="size-5" />
            <span className="text-[15px] font-semibold tracking-tight">Stroke</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV_LINKS.map((link) => {
              const prefetch = link.to === "/changelog" ? prefetchChangelog : undefined;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onMouseEnter={prefetch}
                  onFocus={prefetch}
                  className="rounded-lg px-2.5 py-1.5 text-sm transition-colors"
                  activeProps={{ className: "bg-muted text-foreground" }}
                  inactiveProps={{
                    className: "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Stroke on GitHub"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "hidden sm:inline-flex",
            )}
          >
            <SiGithub className="size-4" />
          </a>
          <ThemeToggle />
          {user ? (
            <Button render={<Link to="/app" />} nativeButton={false} size="sm">
              Dashboard
            </Button>
          ) : (
            <Button render={<Link to="/login" />} nativeButton={false} size="sm">
              Sign in
            </Button>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative md:hidden")}
          >
            <MenuIcon
              className={cn(
                "absolute size-4 transition-[opacity,scale,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
                open ? "scale-25 opacity-0 blur-[4px]" : "blur-0 scale-100 opacity-100",
              )}
            />
            <XIcon
              className={cn(
                "absolute size-4 transition-[opacity,scale,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
                open ? "blur-0 scale-100 opacity-100" : "scale-25 opacity-0 blur-[4px]",
              )}
            />
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="border-t border-border/50 bg-background px-4 pt-2 pb-4 md:hidden"
        >
          <ul className="grid gap-0.5">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="flex h-11 items-center rounded-lg px-3 text-[15px] transition-colors"
                  activeProps={{ className: "bg-muted font-medium text-foreground" }}
                  inactiveProps={{ className: "text-muted-foreground hover:bg-muted/60" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center gap-2 rounded-lg px-3 text-[15px] text-muted-foreground hover:bg-muted/60"
              >
                <SiGithub className="size-4" />
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

const DOWNLOAD_LINKS = [
  { os: "macos", label: "Stroke for Mac" },
  { os: "windows", label: "Stroke for Windows" },
  { os: "linux", label: "Stroke for Linux" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          <div className="max-w-xs">
            <span className="flex items-center gap-2">
              <StrokeIcon className="size-5" />
              <span className="text-sm font-semibold tracking-tight">Stroke</span>
            </span>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              Fast, elegant, and designed for engineers and analysts who care about their tools.
              Rethink how you query, explore, and work with data.
            </p>
            <BrushStroke className="mt-4 h-1.5 w-16" />
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-16">
            <div>
              <p className="text-xs font-medium tracking-wide text-foreground">Product</p>
              <ul className="mt-3 space-y-2 text-[13px] text-muted-foreground">
                <li>
                  <Link to="/features" className="transition-colors hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/docs" className="transition-colors hover:text-foreground">
                    Docs
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="transition-colors hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/giveaway" className="transition-colors hover:text-foreground">
                    Weekly giveaway
                  </Link>
                </li>
                <li>
                  <Link to="/download" className="transition-colors hover:text-foreground">
                    Download
                  </Link>
                </li>
                <li>
                  <Link to="/roadmap" className="transition-colors hover:text-foreground">
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link to="/changelog" className="transition-colors hover:text-foreground">
                    Changelog
                  </Link>
                </li>
                <li>
                  <a
                    href={`${REPO_URL}/issues`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-foreground"
                  >
                    Report an issue
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-foreground">Download</p>
              <ul className="mt-3 space-y-2 text-[13px] text-muted-foreground">
                {DOWNLOAD_LINKS.map((d) => (
                  <li key={d.os}>
                    <Link
                      to="/download/$os"
                      params={{ os: d.os }}
                      className="transition-colors hover:text-foreground"
                    >
                      {d.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/docs/mcp" className="transition-colors hover:text-foreground">
                    MCP setup
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-foreground">Legal</p>
              <ul className="mt-3 space-y-2 text-[13px] text-muted-foreground">
                <li>
                  <Link to="/terms" className="transition-colors hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="transition-colors hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-5 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Stroke</span>
          <span>stroke.click</span>
        </div>
      </div>
    </footer>
  );
}
