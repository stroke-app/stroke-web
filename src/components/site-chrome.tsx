import { SiGithub } from "@icons-pack/react-simple-icons";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpenIcon,
  BotIcon,
  ChevronDownIcon,
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
  SparklesIcon,
  SunIcon,
  TerminalSquareIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { FRAME, GUTTER, siteButton } from "#/components/page";
import { StrokeIcon } from "#/components/stroke-icon";
import { useTheme } from "#/components/theme-provider";
import { useAuth } from "#/lib/auth/hooks";
import { ENGINES } from "#/lib/engines";
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
    body: "Everything Stroke does, screen by screen",
    icon: LayersIcon,
    to: "/features",
  },
  {
    label: "AI and MCP",
    body: "Let Claude, Cursor or Codex query your data",
    icon: BotIcon,
    to: "/docs/mcp",
  },
  {
    label: "Web studio",
    body: "Open a database in the browser",
    icon: TerminalSquareIcon,
    to: "/studio",
  },
  { label: "Themes", body: "Every theme the app ships with", icon: PaletteIcon, to: "/themes" },
  {
    label: "Changelog",
    body: "What changed in every release",
    icon: ScrollTextIcon,
    to: "/changelog",
  },
  { label: "Roadmap", body: "What I'm building next", icon: MapIcon, to: "/roadmap" },
];

const RESOURCES: MenuLink[] = [
  {
    label: "Documentation",
    body: "Install, connect, and get going",
    icon: BookOpenIcon,
    to: "/docs",
  },
  { label: "Blog", body: "Releases, guides and how it's built", icon: NewspaperIcon, to: "/blog" },
  {
    label: "Compare",
    body: "Stroke next to TablePlus, DBeaver and more",
    icon: GitCompareArrowsIcon,
    to: "/compare",
  },
  {
    label: "Security",
    body: "Where your credentials and data go",
    icon: ShieldCheckIcon,
    to: "/security",
  },
  {
    label: "Sponsor",
    body: "Help pay for signed macOS and Windows builds",
    icon: HeartIcon,
    to: "/sponsors",
  },
  {
    label: "GitHub",
    body: "The source, issues and discussions",
    icon: SiGithub as IconType,
    href: REPO_URL,
  },
];

const MENU_ENGINES = ENGINES.filter((e) => e.status !== "soon").slice(0, 12);

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
      <item.icon
        className="mt-0.5 size-[18px] shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
        strokeWidth={1.6}
      />
      <span className="min-w-0">
        <span className="block text-[14px] font-medium text-foreground">{item.label}</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
          {item.body}
        </span>
      </span>
    </>
  );
  const cls =
    "group -mx-3 flex gap-3.5 rounded-lg px-3 py-2.5 transition-colors duration-150 hover:bg-ink/[0.05] focus-visible:bg-ink/[0.05] focus-visible:outline-none";
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

function MenuPanel({ id, onPick }: { id: MenuId; onPick: () => void }) {
  if (id === "databases") {
    return (
      <div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-1 md:grid-cols-3 lg:grid-cols-4">
          {MENU_ENGINES.map((e) => (
            <li key={e.slug}>
              <Link
                to="/databases/$engine"
                params={{ engine: e.slug }}
                onClick={onPick}
                className="group -mx-3 flex h-11 items-center gap-3 rounded-lg px-3 text-[14px] font-medium transition-colors duration-150 hover:bg-ink/[0.05]"
              >
                <e.Icon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                {e.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
          <p className="text-[13px] text-muted-foreground">
            {ENGINES.filter((e) => e.status !== "soon").length} databases, one app, the same
            keyboard shortcuts.
          </p>
          <Link
            to="/databases"
            onClick={onPick}
            className="text-[13px] font-medium text-foreground hover:text-soft"
          >
            All databases
          </Link>
        </div>
      </div>
    );
  }
  const items = id === "product" ? PRODUCT : RESOURCES;
  return (
    <ul className="grid grid-cols-1 gap-x-10 gap-y-1 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.label}>
          <MenuItem item={item} onPick={onPick} />
        </li>
      ))}
    </ul>
  );
}

const MENUS: { id: MenuId; label: string }[] = [
  { id: "product", label: "Product" },
  { id: "databases", label: "Databases" },
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
    <header
      className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl"
      onMouseLeave={scheduleClose}
    >
      <div className={cn(FRAME, GUTTER, "flex h-16 items-center gap-8")}>
        <Link to="/" aria-label="Stroke home" className="flex shrink-0 items-center gap-2.5">
          <StrokeIcon className="size-[22px]" />
          <span className="text-[16px] font-semibold tracking-[-0.02em]">Stroke</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="Main">
          {MENUS.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-expanded={menu === m.id}
              aria-controls={panelId}
              onMouseEnter={() => open(m.id)}
              onClick={() => setMenu(menu === m.id ? null : m.id)}
              className={cn(
                "flex h-8 items-center gap-1 rounded-full px-3 text-[14px] transition-colors duration-150",
                menu === m.id
                  ? "bg-ink/[0.08] text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m.label}
              <ChevronDownIcon
                className={cn(
                  "size-3.5 transition-transform duration-200",
                  menu === m.id && "rotate-180",
                )}
                strokeWidth={2}
              />
            </button>
          ))}
          <Link
            to="/pricing"
            onMouseEnter={scheduleClose}
            className="flex h-8 items-center rounded-full px-3 text-[14px] transition-colors duration-150"
            activeProps={{ className: "text-foreground" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
          >
            Pricing
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitch className="hidden lg:flex" />
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={stars ? `Stroke on GitHub, ${stars} stars` : "Stroke on GitHub"}
            className={cn(
              siteButton({ variant: "ghost", size: "sm" }),
              "hidden gap-1.5 text-foreground sm:inline-flex",
            )}
          >
            <SiGithub className="size-4" />
            {stars ? <span className="tabular-nums">{formatStars(stars)}</span> : null}
          </a>
          <Link
            to={user ? "/app" : "/login"}
            className={cn(
              siteButton({ variant: "ghost", size: "sm" }),
              "hidden text-foreground sm:inline-flex",
            )}
          >
            {user ? "Dashboard" : "Sign in"}
          </Link>
          <Link to="/download" className={siteButton({ size: "sm" })}>
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
              "w-8 px-0 text-foreground md:hidden",
            )}
          >
            {mobile ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mega menu: one panel under the bar, its content swapped per menu. */}
      <div
        id={panelId}
        hidden={!menu}
        onMouseEnter={() => closeTimer.current && clearTimeout(closeTimer.current)}
        className="absolute inset-x-0 top-full hidden md:block"
      >
        <div className={cn(FRAME, "px-3")}>
          <div className="animate-in rounded-b-2xl border border-t-0 border-border bg-popover px-8 pt-6 pb-7 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.55)] duration-200 fade-in-0 slide-in-from-top-1">
            {menu && <MenuPanel id={menu} onPick={() => setMenu(null)} />}
          </div>
        </div>
      </div>

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
  );
}

const FOOTER_LINK = "text-muted-foreground transition-colors duration-150 hover:text-foreground";

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
      { label: "Giveaway", to: "/giveaway" },
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

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className={cn(FRAME, "border-border lg:border-x")}>
        <div
          className={cn(
            GUTTER,
            "grid grid-cols-2 gap-10 pt-16 pb-12 md:grid-cols-[1.6fr_repeat(4,1fr)]",
          )}
        >
          <div className="col-span-2 md:col-span-1">
            <Link to="/" aria-label="Stroke home" className="inline-flex items-center gap-2.5">
              <StrokeIcon className="size-[22px]" />
              <span className="text-[16px] font-semibold tracking-[-0.02em]">Stroke</span>
            </Link>
            <p className="mt-4 max-w-[17rem] text-[14px] leading-relaxed text-muted-foreground">
              A native database client for every database you run. Made by one developer, in the
              open.
            </p>
            <ThemeSwitch className="mt-6 inline-flex" />
          </div>
          {FOOTER.map((col) => (
            <div key={col.title}>
              <p className="text-[13px] font-medium text-foreground">{col.title}</p>
              <ul className="mt-4 space-y-2.5 text-[14px]">
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
            GUTTER,
            "flex flex-wrap items-center justify-between gap-3 border-t border-border py-6 text-[13px] text-faint",
          )}
        >
          <span>© {new Date().getFullYear()} Stroke</span>
          <span className="flex items-center gap-2">
            <SparklesIcon className="size-3.5" strokeWidth={1.75} />
            Free to try. $9.99 once to keep.
          </span>
        </div>
      </div>
    </footer>
  );
}
