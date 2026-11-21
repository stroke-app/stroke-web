import { SiGithub } from "@icons-pack/react-simple-icons";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  StarIcon,
  BotIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  GitCompareArrowsIcon,
  HeartIcon,
  LayersIcon,
  MapIcon,
  MenuIcon,
  MonitorIcon,
  MoonIcon,
  NewspaperIcon,
  PaletteIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  SunIcon,
  TerminalSquareIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { FRAME, GUTTER, siteButton } from "#/components/page";
import { SponsorsWall } from "#/components/sponsors-wall";
import { StrokeIcon } from "#/components/stroke-icon";
import { useTheme } from "#/components/theme-provider";
import { useAuth } from "#/lib/auth/hooks";
import { ENGINES } from "#/lib/engines";
import { latestReleaseQueryOptions } from "#/lib/latest-release";
import { REPO_URL } from "#/lib/seo";
import { cn } from "#/lib/utils";

export { REPO_URL };

/** The one-line description of Stroke used in the footer and page metadata. */
export const TAGLINE =
  "Stroke is a native database client for engineers and analysts. Query, browse, and edit every database you run, in one fast app.";

type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>;
type MenuLink = {
  label: string;
  body: string;
  icon: IconType;
} & ({ to: React.ComponentProps<typeof Link>["to"]; href?: never } | { href: string; to?: never });

const PRODUCT: MenuLink[] = [
  {
    label: "Features",
    body: "Every screen, with screenshots",
    icon: LayersIcon,
    to: "/features",
  },
  {
    label: "AI and MCP",
    body: "Claude, Cursor and Codex on your data",
    icon: BotIcon,
    to: "/docs/mcp",
  },
  {
    label: "Web studio",
    body: "Open a database in your browser",
    icon: TerminalSquareIcon,
    to: "/studio",
  },
  { label: "Themes", body: "Every theme the app ships", icon: PaletteIcon, to: "/themes" },
  {
    label: "Changelog",
    body: "What changed in each release",
    icon: ScrollTextIcon,
    to: "/changelog",
  },
  { label: "Roadmap", body: "What I'm building next", icon: MapIcon, to: "/roadmap" },
];

const RESOURCES: MenuLink[] = [
  {
    label: "Documentation",
    body: "Install, connect, get going",
    icon: BookOpenIcon,
    to: "/docs",
  },
  { label: "Blog", body: "Releases and guides", icon: NewspaperIcon, to: "/blog" },
  {
    label: "Compare",
    body: "Next to TablePlus and DBeaver",
    icon: GitCompareArrowsIcon,
    to: "/compare",
  },
  {
    label: "Security",
    body: "Where your data goes",
    icon: ShieldCheckIcon,
    to: "/security",
  },
  {
    label: "MCP for agents",
    body: "Claude Code, Codex, Cursor",
    icon: BotIcon,
    to: "/docs/mcp",
  },
  {
    label: "GitHub",
    body: "Source code and issues",
    icon: SiGithub as IconType,
    href: REPO_URL,
  },
];

type MenuId = "product" | "databases" | "resources";

const THEMES = [
  { id: "system", label: "System theme", Icon: MonitorIcon },
  { id: "light", label: "Light theme", Icon: SunIcon },
  { id: "dark", label: "Dark theme", Icon: MoonIcon },
] as const;

/** Three-way theme switch, the selected one raised. */
function ThemeSwitch({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        "flex items-center rounded-full p-0.5 shadow-[0_0_0_1px_var(--border)_inset]",
        className,
      )}
    >
      {THEMES.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={theme === id}
          aria-label={label}
          title={label}
          onClick={() => setTheme(id)}
          className={cn(
            "flex size-7 items-center justify-center rounded-full transition-colors duration-150",
            theme === id
              ? "bg-ink/[0.1] text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-3.5" strokeWidth={1.75} />
        </button>
      ))}
    </div>
  );
}

/**
 * The logo goes home; already home, it goes to the top. A link to the page
 * you are on does nothing by itself, so a click on the logo at the bottom of
 * the home page left you there.
 */
function toTopOnHome(e: React.MouseEvent<HTMLAnchorElement>) {
  if (window.location.pathname !== "/" || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)
    return;
  e.preventDefault();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  if (window.location.hash) history.replaceState(null, "", "/");
}

/** One button that flips light and dark, for the top strip. */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [dark, setDark] = useState(false);
  useEffect(() => {
    // The resolved theme lives on <html>; read it after the provider applies it.
    const read = () => setDark(document.documentElement.classList.contains("dark"));
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, [theme]);
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
      className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
    >
      {dark ? (
        <SunIcon className="size-3.5" strokeWidth={1.9} />
      ) : (
        <MoonIcon className="size-3.5" strokeWidth={1.9} />
      )}
    </button>
  );
}

/** GitHub stars, cached for an hour; the count hides until it loads. */
function useStars() {
  return useQuery({
    queryKey: ["github", "stars"],
    queryFn: async () => {
      const res = await fetch("https://api.github.com/repos/stroke-app/stroke");
      if (!res.ok) throw new Error(String(res.status));
      return ((await res.json()) as { stargazers_count?: number }).stargazers_count ?? null;
    },
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}

function formatStars(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k` : String(n);
}

function MenuItem({ item, onPick }: { item: MenuLink; onPick: () => void }) {
  const inner = (
    <>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-ink/[0.05] transition-colors duration-150 group-hover:bg-ink/[0.09]">
        <item.icon
          className="size-4 text-soft transition-colors group-hover:text-foreground"
          strokeWidth={1.6}
        />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1 text-[14px] font-medium text-foreground">
          {item.label}
          <ArrowRightIcon className="size-3 -translate-x-1 opacity-0 transition-[opacity,translate] duration-150 group-hover:translate-x-0 group-hover:opacity-60" />
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
          {item.body}
        </span>
      </span>
    </>
  );
  const cls =
    "group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-ink/[0.04] focus-visible:bg-ink/[0.05] focus-visible:outline-none";
  return item.href ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onPick}>
      {inner}
    </a>
  ) : (
    <Link to={item.to} className={cls} onClick={onPick}>
      {inner}
    </Link>
  );
}

/** The card on the left of a menu: one place worth going, said plainly. */
function Spotlight({
  to,
  icon: Icon,
  eyebrow,
  title,
  body,
  onPick,
}: {
  to: React.ComponentProps<typeof Link>["to"];
  icon: IconType;
  eyebrow: string;
  title: string;
  body: string;
  onPick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onPick}
      className="group relative isolate flex h-full flex-col overflow-hidden rounded-2xl bg-card p-4 transition-colors duration-150 hover:bg-accent"
    >
      <span
        aria-hidden="true"
        className="absolute -top-16 -right-16 -z-10 size-48 rounded-full bg-[radial-gradient(closest-side,rgb(245_180_0/0.16),transparent)] transition-opacity duration-300 group-hover:opacity-80"
      />
      <span className="flex size-9 items-center justify-center rounded-lg bg-ink/[0.06] text-foreground">
        <Icon className="size-[18px]" strokeWidth={1.6} />
      </span>
      <span className="mt-auto pt-8 text-[12px] font-medium text-[var(--link)]">{eyebrow}</span>
      <span className="mt-1 text-[15px] leading-snug font-medium text-foreground">{title}</span>
      <span className="mt-1.5 text-[13px] leading-snug text-muted-foreground">{body}</span>
      <span className="mt-3 flex items-center gap-1 text-[13px] font-medium text-foreground">
        Open
        <ArrowRightIcon className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/** The install one-liner in the Resources menu. */
function MenuInstall() {
  const [copied, setCopied] = useState(false);
  const command = "curl -fsSL https://stroke.click/install.sh | sh";
  return (
    <button
      type="button"
      onClick={() =>
        void navigator.clipboard?.writeText(command).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
      }
      className="group flex w-full items-center gap-2.5 rounded-full bg-card px-4 py-2.5 text-left font-mono text-[12.5px] transition-colors hover:bg-accent"
      aria-label={copied ? "Copied" : `Copy ${command}`}
    >
      <span className="text-faint select-none">$</span>
      <span className="min-w-0 flex-1 truncate text-soft">{command}</span>
      {copied ? (
        <CheckIcon className="size-3.5 shrink-0 text-foreground" />
      ) : (
        <CopyIcon className="size-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
      )}
    </button>
  );
}

const MENU_GROUPS: { label: string; cats: string[] }[] = [
  { label: "Relational", cats: ["relational"] },
  { label: "Documents and keys", cats: ["document", "key-value"] },
  { label: "Analytics and search", cats: ["analytics", "search"] },
];

function MenuPanel({ id, onPick }: { id: MenuId; onPick: () => void }) {
  if (id === "databases") {
    return (
      <div>
        <div className="grid grid-cols-3 gap-x-6 p-3">
          {MENU_GROUPS.map((g) => (
            <div key={g.label}>
              <p className="px-2 pt-1 pb-2 text-[11px] font-medium tracking-[0.06em] text-faint uppercase">
                {g.label}
              </p>
              <ul className="grid grid-cols-1">
                {ENGINES.filter((e) => g.cats.includes(e.category) && e.status !== "soon").map(
                  (e) => (
                    <li key={e.slug}>
                      <Link
                        to="/databases/$engine"
                        params={{ engine: e.slug }}
                        onClick={onPick}
                        className="group flex h-9 items-center gap-2.5 rounded-md px-2 text-[13.5px] text-soft transition-colors duration-150 hover:bg-ink/[0.05] hover:text-foreground focus-visible:bg-ink/[0.05] focus-visible:outline-none"
                      >
                        <span
                          className="flex size-6 shrink-0 items-center justify-center rounded-md"
                          style={{ background: `color-mix(in oklch, ${e.color} 14%, transparent)` }}
                        >
                          <e.Icon className="size-3.5" color={e.color} />
                        </span>
                        <span className="truncate">{e.name}</span>
                        {e.status === "beta" && (
                          <span className="ml-auto text-[11px] text-faint">Beta</span>
                        )}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-6 rounded-b-[22px] border-t border-border bg-[var(--band)] px-5 py-3">
          <p className="text-[13px] text-muted-foreground">
            Connect in one click from Neon, Supabase, PlanetScale, Turso and more.
          </p>
          <Link
            to="/databases"
            onClick={onPick}
            className="group flex shrink-0 items-center gap-1 text-[13px] font-medium text-foreground"
          >
            All {ENGINES.filter((e) => e.status !== "soon").length} databases
            <ArrowRightIcon className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    );
  }
  const product = id === "product";
  return (
    <div>
      <div className="grid grid-cols-[13rem_minmax(0,1fr)] gap-5 p-3">
        {product ? (
          <Spotlight
            to="/features"
            icon={LayersIcon}
            eyebrow="Tour"
            title="Every feature, screen by screen"
            body="The grid, the editor, schema, charts, AI and admin."
            onPick={onPick}
          />
        ) : (
          <Spotlight
            to="/docs"
            icon={BookOpenIcon}
            eyebrow="Start here"
            title="From download to your first query"
            body="Four steps, about a minute."
            onPick={onPick}
          />
        )}
        <ul className="grid grid-cols-2 content-start gap-x-4 gap-y-0.5">
          {(product ? PRODUCT : RESOURCES).map((item) => (
            <li key={item.label}>
              <MenuItem item={item} onPick={onPick} />
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-4 rounded-b-[22px] border-t border-border bg-[var(--band)] px-5 py-3">
        {product ? (
          <>
            <p className="shrink-0 text-[13px] text-muted-foreground">
              Or install it from a terminal
            </p>
            <div className="min-w-0 flex-1">
              <MenuInstall />
            </div>
          </>
        ) : (
          <>
            <HeartIcon className="size-4 shrink-0 text-[#e5484d]" strokeWidth={1.8} />
            <p className="min-w-0 flex-1 text-[13px] text-muted-foreground">
              Stroke is built by one developer. Sponsors pay for signed builds on macOS and Windows.
            </p>
            <Link
              to="/sponsors"
              onClick={onPick}
              className="group flex shrink-0 items-center gap-1 text-[13px] font-medium text-foreground"
            >
              Sponsor
              <ArrowRightIcon className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

const MENUS: { id: MenuId; label: string }[] = [
  { id: "product", label: "Product" },
  { id: "resources", label: "Resources" },
];

export function SiteHeader() {
  const { user } = useAuth();
  const { data: stars } = useStars();
  const [menu, setMenu] = useState<MenuId | null>(null);
  const [mobile, setMobile] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();
  const path = useRouterState({ select: (s) => s.location.pathname });
  // Transparent over the page's top, a solid bar once it scrolls.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Any navigation closes the menus.
  useEffect(() => {
    setMenu(null);
    setMobile(false);
  }, [path]);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const open = (id: MenuId) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenu(id);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 120);
  };

  return (
    <>
      {/* The thin strip over the bar, as Apple-style sites carry: news on the
        left, GitHub and the theme on the right. It scrolls away. */}
      <div className="relative z-50 border-b border-border bg-[var(--band)]">
        <div
          className={cn(FRAME, GUTTER, "flex h-9 items-center justify-between gap-4 text-[12.5px]")}
        >
          <Link
            to="/changelog"
            className="group flex min-w-0 items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="size-1.5 shrink-0 rounded-full bg-[var(--amber)]" aria-hidden="true" />
            <span className="truncate">See what's new in Stroke</span>
            <ArrowUpRightIcon className="size-3 shrink-0 opacity-60 transition-transform duration-150 group-hover:translate-x-px group-hover:-translate-y-px" />
          </Link>
          <div className="flex items-center gap-3">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={
                stars && stars >= 1000 ? `Stroke on GitHub, ${stars} stars` : "Stroke on GitHub"
              }
              className="hidden items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              <SiGithub className="size-3.5" />
              GitHub
              {stars && stars >= 1000 ? (
                <span className="flex items-center gap-1 font-medium text-foreground tabular-nums">
                  <StarIcon className="size-3 fill-[var(--amber)] text-[var(--amber)]" />
                  {formatStars(stars)}
                </span>
              ) : null}
            </a>
            <ThemeToggle />
          </div>
        </div>
      </div>
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-[background-color,border-color] duration-200",
          scrolled || menu || mobile
            ? "border-border bg-background/80 backdrop-blur-xl backdrop-saturate-150"
            : "border-transparent bg-background",
        )}
        onMouseLeave={scheduleClose}
      >
        <div className={cn(FRAME, GUTTER, "flex h-[60px] items-center gap-6")}>
          <Link
            to="/"
            aria-label="Stroke home"
            onClick={toTopOnHome}
            className="flex shrink-0 items-center gap-2.5"
          >
            <StrokeIcon className="size-[26px]" />
            <span className="text-[21px] font-semibold tracking-[-0.03em]">Stroke</span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Main">
            {MENUS.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-expanded={menu === m.id}
                aria-controls={panelId}
                onMouseEnter={() => open(m.id)}
                onClick={() => setMenu(menu === m.id ? null : m.id)}
                className={cn(
                  "flex h-9 items-center gap-1 rounded-full px-3 text-[15px] transition-colors duration-150",
                  menu === m.id ? "text-foreground" : "text-soft hover:text-foreground",
                )}
              >
                {m.label}
                <ChevronDownIcon
                  className={cn(
                    "size-3.5 opacity-60 transition-transform duration-200",
                    menu === m.id && "rotate-180",
                  )}
                  strokeWidth={2}
                />
              </button>
            ))}
            <Link
              to="/pricing"
              onMouseEnter={scheduleClose}
              className="flex h-9 items-center rounded-full px-3 text-[15px] transition-colors duration-150"
              activeProps={{ className: "text-foreground" }}
              inactiveProps={{ className: "text-soft hover:text-foreground" }}
            >
              Pricing
            </Link>
            <Link
              to={user ? "/app" : "/login"}
              onMouseEnter={scheduleClose}
              className="flex h-9 items-center rounded-full px-3 text-[15px] text-soft transition-colors duration-150 hover:text-foreground"
            >
              {user ? "Dashboard" : "Sign in"}
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1.5 md:ml-2">
            <Link to="/download" className={cn(siteButton({ size: "md" }), "h-10 px-5")}>
              <DownloadIcon className="size-4" strokeWidth={2.2} />
              Download
            </Link>
            <button
              type="button"
              onClick={() => setMobile((v) => !v)}
              aria-expanded={mobile}
              aria-controls="mobile-nav"
              aria-label={mobile ? "Close menu" : "Open menu"}
              className={cn(
                siteButton({ variant: "ghost", size: "sm" }),
                "size-10 px-0 text-foreground md:hidden",
              )}
            >
              {mobile ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mega menu: one panel under the bar, its content swapped per menu.
          Mounted only while open, so nothing invisible sits over the page,
          one width for every menu so switching never jumps, and no backdrop
          blur: the panel is opaque, and blurring the page under it made each
          switch repaint the whole viewport. */}
        {menu && (
          <div
            id={panelId}
            onMouseEnter={() => closeTimer.current && clearTimeout(closeTimer.current)}
            className="absolute inset-x-0 top-full hidden pt-2 md:block"
          >
            <div className={cn(FRAME, "flex justify-center px-4 lg:px-10")}>
              <div className="w-full max-w-[52rem] animate-in rounded-[22px] bg-popover shadow-[var(--shadow-float)] duration-200 fade-in-0 slide-in-from-top-1">
                <div key={menu} className="animate-in duration-150 fade-in-0">
                  <MenuPanel id={menu} onPick={() => setMenu(null)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {mobile && (
          <nav
            id="mobile-nav"
            aria-label="Main"
            className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-background px-6 pt-4 pb-8 md:hidden"
          >
            {[
              { title: "Product", items: PRODUCT },
              { title: "Resources", items: RESOURCES },
            ].map((group) => (
              <div key={group.title} className="mb-6">
                <p className="mb-2 text-[12px] font-medium text-faint">{group.title}</p>
                {group.items.map((item) => (
                  <MenuItem key={item.label} item={item} onPick={() => setMobile(false)} />
                ))}
              </div>
            ))}
            <div className="flex flex-col gap-2 border-t border-border pt-6">
              <Link to="/databases" className={siteButton({ variant: "secondary" })}>
                Databases
              </Link>
              <Link to="/pricing" className={siteButton({ variant: "secondary" })}>
                Pricing
              </Link>
              <Link to={user ? "/app" : "/login"} className={siteButton({ variant: "secondary" })}>
                {user ? "Dashboard" : "Sign in"}
              </Link>
              <ThemeSwitch className="mt-2 self-start" />
            </div>
          </nav>
        )}
      </header>
    </>
  );
}

const FOOTER_LINK =
  "text-muted-foreground transition-colors duration-150 hover:text-foreground hover:underline hover:underline-offset-4";

type FooterLink = { label: string } & (
  | { to: React.ComponentProps<typeof Link>["to"]; params?: Record<string, string>; href?: never }
  | { href: string; to?: never; params?: never }
);

const FOOTER: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", to: "/features" },
      { label: "Pricing", to: "/pricing" },
      { label: "Databases", to: "/databases" },
      { label: "Changelog", to: "/changelog" },
      { label: "Roadmap", to: "/roadmap" },
      { label: "Themes", to: "/themes" },
    ],
  },
  {
    title: "Download",
    links: [
      { label: "macOS", to: "/download/$os", params: { os: "macos" } },
      { label: "Windows", to: "/download/$os", params: { os: "windows" } },
      { label: "Linux", to: "/download/$os", params: { os: "linux" } },
      { label: "All downloads", to: "/download" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", to: "/docs" },
      { label: "MCP setup", to: "/docs/mcp" },
      { label: "Blog", to: "/blog" },
      { label: "Compare", to: "/compare" },
      { label: "Sponsor", to: "/sponsors" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "GitHub", href: REPO_URL },
      { label: "Report an issue", href: `${REPO_URL}/issues` },
      { label: "Security", to: "/security" },
      { label: "Terms", to: "/terms" },
      { label: "Privacy", to: "/privacy" },
      { label: "Legal", to: "/legal" },
    ],
  },
];

const FACTS = [
  { label: "Payment", value: "One time", note: "No subscription" },
  { label: "Runs on", value: "3 systems", note: "macOS, Windows, Linux" },
  { label: "Trial", value: "17 days", note: "Every feature, no card" },
  { label: "Credentials", value: "Local", note: "In your OS keychain" },
];

/** The version and platforms under the closing button, from the latest release. */
function ClosingVersion() {
  const { data: release } = useQuery(latestReleaseQueryOptions());
  return (
    <p className="mt-6 text-[15px] text-muted-foreground">
      {release ? `Version ${release.tag_name.replace(/^v/, "")} · ` : ""}Apple Silicon and Intel ·
      Windows · Linux
    </p>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <SponsorsWall />

      {/* The last call, Apple style: the icon, a two-line headline, the
          button, the version, then four facts in a row. */}
      <div
        className={cn(FRAME, GUTTER, "flex flex-col items-center pt-28 pb-20 text-center md:pt-36")}
      >
        <span className="relative">
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 scale-150 rounded-full bg-[radial-gradient(closest-side,rgb(255_193_7/0.35),transparent)] blur-2xl"
          />
          <img
            src="/icon.png"
            alt=""
            width={112}
            height={112}
            className="size-24 rounded-[24px] shadow-[0_18px_40px_-14px_rgb(0_0_0/0.45)] md:size-28 md:rounded-[28px]"
          />
        </span>
        <p className="mt-10 text-[2.5rem] leading-[1.04] font-semibold tracking-[-0.045em] text-balance md:text-[4rem]">
          Open your first database.
          <span className="title-sub block">Keep it on your machine.</span>
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
          <Link to="/download" className={cn(siteButton({ size: "lg" }), "h-14 px-8 text-[18px]")}>
            <DownloadIcon className="size-5" strokeWidth={2.2} />
            Download Stroke
          </Link>
          <Link
            to="/features"
            className="group inline-flex items-center gap-1 text-[18px] font-medium text-[var(--link)] hover:underline hover:underline-offset-4"
          >
            Explore every feature
            <ChevronRightIcon
              className="size-[18px] transition-transform duration-150 group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </Link>
        </div>
        <ClosingVersion />
        <div className="mt-6 w-full max-w-[23rem]">
          <MenuInstall />
        </div>

        <dl className="mt-20 grid w-full grid-cols-2 border-y border-border md:grid-cols-4">
          {FACTS.map((f, i) => (
            <div
              key={f.label}
              className={cn(
                "flex flex-col items-center px-4 py-8",
                i % 2 === 1 && "border-l border-border",
                i >= 2 && "max-md:border-t md:border-l",
              )}
            >
              <dt className="text-[12px] font-medium tracking-[0.12em] text-faint uppercase">
                {f.label}
              </dt>
              <dd className="mt-2 text-[1.6rem] leading-tight font-semibold tracking-[-0.03em]">
                {f.value}
              </dd>
              <dd className="mt-1 text-[14px] text-muted-foreground">{f.note}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="border-t border-border bg-[var(--band)]">
        <div
          className={cn(
            FRAME,
            GUTTER,
            "grid grid-cols-2 gap-x-6 gap-y-10 pt-12 pb-10 sm:grid-cols-4 md:grid-cols-[1.6fr_repeat(4,1fr)]",
          )}
        >
          <div className="col-span-2 sm:col-span-4 md:col-span-1">
            <Link
              to="/"
              aria-label="Stroke home"
              onClick={toTopOnHome}
              className="inline-flex items-center gap-2.5"
            >
              <StrokeIcon className="size-[22px]" />
              <span className="text-[17px] font-semibold tracking-[-0.03em]">Stroke</span>
            </Link>
            <p className="mt-3 max-w-[17rem] text-[13px] leading-relaxed text-muted-foreground">
              A native database client for every database you run. Made by one developer, in the
              open.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Stroke on GitHub"
                className="flex size-8 items-center justify-center rounded-full bg-background text-muted-foreground transition-colors hover:text-foreground"
              >
                <SiGithub className="size-3.5" />
              </a>
              <a
                href="mailto:support@stroke.click"
                aria-label="Email support"
                className="flex h-8 items-center rounded-full bg-background px-3 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
              >
                support@stroke.click
              </a>
            </div>
          </div>
          {FOOTER.map((col) => (
            <div key={col.title}>
              <p className="text-[12px] font-semibold text-foreground">{col.title}</p>
              <ul className="mt-3 space-y-2 text-[12.5px]">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={FOOTER_LINK}
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link to={l.to} params={l.params as never} className={FOOTER_LINK}>
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          className={cn(
            FRAME,
            GUTTER,
            "flex flex-wrap items-center justify-between gap-4 border-t border-border py-5 text-[12px] text-faint",
          )}
        >
          <span>© {new Date().getFullYear()} Stroke. Your credentials stay on your computer.</span>
          <ThemeSwitch className="inline-flex bg-background" />
        </div>
      </div>
    </footer>
  );
}
