import { SiGithub } from "@icons-pack/react-simple-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { siteButton } from "#/components/page";
import { StrokeIcon } from "#/components/stroke-icon";
import { useAuth } from "#/lib/auth/hooks";
import { changelogQueryOptions } from "#/lib/changelog";
import { REPO_URL } from "#/lib/seo";
import { cn } from "#/lib/utils";

export { REPO_URL };

const DOWNLOAD_LINKS = [
  { os: "macos", label: "Stroke for Mac" },
  { os: "windows", label: "Stroke for Windows" },
  { os: "linux", label: "Stroke for Linux" },
] as const;

/** The one-line description of Stroke used in the footer and page metadata. */
export const TAGLINE =
  "Stroke is a native database client for engineers and analysts. Query, browse, and edit every database you run, in one fast app.";

const NAV_LINKS = [
  { label: "Features", to: "/features" },
  { label: "Docs", to: "/docs" },
  { label: "Pricing", to: "/pricing" },
  { label: "Changelog", to: "/changelog" },
  { label: "Roadmap", to: "/roadmap" },
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
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[rgb(11_11_11/0.8)] backdrop-blur-[20px]">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-6 md:px-8">
        <div className="flex items-center gap-10">
          <Link to="/" aria-label="Stroke home" className="flex items-center gap-2.5">
            <StrokeIcon className="size-[22px]" />
            <span className="text-[15px] font-[560] tracking-[-0.01em]">Stroke</span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
            {NAV_LINKS.map((link) => {
              const prefetch = link.to === "/changelog" ? prefetchChangelog : undefined;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onMouseEnter={prefetch}
                  onFocus={prefetch}
                  className="rounded-md px-3 py-1.5 text-[13px] transition-colors"
                  activeProps={{ className: "text-foreground" }}
                  inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Stroke on GitHub"
            className={cn(
              siteButton({ variant: "ghost", size: "sm" }),
              "hidden w-8 px-0 sm:inline-flex",
            )}
          >
            <SiGithub className="size-4" />
          </a>
          <Link
            to={user ? "/app" : "/login"}
            className={cn(siteButton({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
          >
            {user ? "Dashboard" : "Sign in"}
          </Link>
          <Link to="/download" className={siteButton({ size: "sm" })}>
            Download
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className={cn(
              siteButton({ variant: "ghost", size: "sm" }),
              "relative w-8 px-0 md:hidden",
            )}
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
          className="border-t border-border bg-background px-4 pt-2 pb-4 md:hidden"
        >
          <ul className="grid gap-0.5">
            {[...NAV_LINKS, { label: "Download", to: "/download" } as const].map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="flex h-11 items-center rounded-lg px-3 text-[15px] transition-colors"
                  activeProps={{ className: "bg-white/[0.05] text-foreground" }}
                  inactiveProps={{ className: "text-muted-foreground hover:bg-white/[0.04]" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to={user ? "/app" : "/login"}
                onClick={() => setOpen(false)}
                className="flex h-11 items-center rounded-lg px-3 text-[15px] text-muted-foreground hover:bg-white/[0.04]"
              >
                {user ? "Dashboard" : "Sign in"}
              </Link>
            </li>
            <li>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center gap-2 rounded-lg px-3 text-[15px] text-muted-foreground hover:bg-white/[0.04]"
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

const FOOTER_LINK = "text-muted-foreground transition-colors hover:text-foreground";

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[13px] font-medium text-foreground">{title}</p>
      <ul className="mt-4 space-y-3 text-[13px]">{children}</ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 pt-16 pb-10 md:px-8 md:pt-20">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link to="/" aria-label="Stroke home" className="inline-flex items-center gap-2.5">
              <StrokeIcon className="size-[22px]" />
              <span className="text-[15px] font-[560] tracking-[-0.01em]">Stroke</span>
            </Link>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
              {TAGLINE}
            </p>
          </div>

          <FooterColumn title="Product">
            <li>
              <Link to="/features" className={FOOTER_LINK}>
                Features
              </Link>
            </li>
            <li>
              <Link to="/pricing" className={FOOTER_LINK}>
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/changelog" className={FOOTER_LINK}>
                Changelog
              </Link>
            </li>
            <li>
              <Link to="/roadmap" className={FOOTER_LINK}>
                Roadmap
              </Link>
            </li>
            <li>
              <Link to="/giveaway" className={FOOTER_LINK}>
                Weekly giveaway
              </Link>
            </li>
          </FooterColumn>

          <FooterColumn title="Download">
            <li>
              <Link to="/download" className={FOOTER_LINK}>
                Download Stroke
              </Link>
            </li>
            {DOWNLOAD_LINKS.map((d) => (
              <li key={d.os}>
                <Link to="/download/$os" params={{ os: d.os }} className={FOOTER_LINK}>
                  {d.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Resources">
            <li>
              <Link to="/docs" className={FOOTER_LINK}>
                Docs
              </Link>
            </li>
            <li>
              <Link to="/docs/mcp" className={FOOTER_LINK}>
                MCP setup
              </Link>
            </li>
            <li>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={FOOTER_LINK}>
                GitHub
              </a>
            </li>
            <li>
              <a
                href={`${REPO_URL}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className={FOOTER_LINK}
              >
                Report an issue
              </a>
            </li>
          </FooterColumn>

          <FooterColumn title="Legal">
            <li>
              <Link to="/terms" className={FOOTER_LINK}>
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/privacy" className={FOOTER_LINK}>
                Privacy Policy
              </Link>
            </li>
          </FooterColumn>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-3 text-xs text-faint">
          <span>© {new Date().getFullYear()} Stroke</span>
          <span>stroke.click</span>
        </div>
      </div>
    </footer>
  );
}
