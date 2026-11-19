import { SiGithub } from "@icons-pack/react-simple-icons";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  StarIcon,
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
      className="group relative isolate flex h-full flex-col overflow-hidden rounded-lg bg-ink/[0.03] p-4 shadow-[0_0_0_1px_var(--border)_inset] transition-colors duration-150 hover:bg-ink/[0.05]"
    >
      <span
        aria-hidden="true"
        className="absolute -top-16 -right-16 -z-10 size-48 rounded-full bg-[radial-gradient(closest-side,rgb(245_180_0/0.16),transparent)] transition-opacity duration-300 group-hover:opacity-80"
      />
      <span className="flex size-9 items-center justify-center rounded-lg bg-ink/[0.06] text-foreground">
        <Icon className="size-[18px]" strokeWidth={1.6} />
      </span>
      <span className="mt-auto pt-8 text-[12px] font-medium text-[#d99a00] [.dark_&]:text-[#f5b400]">
        {eyebrow}
      </span>
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
      className="group flex w-full items-center gap-2.5 rounded-lg bg-ink/[0.03] px-3 py-2.5 text-left font-mono text-[12.5px] shadow-[0_0_0_1px_var(--border)_inset] transition-colors hover:bg-ink/[0.06]"
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
        <div className="flex items-center justify-between gap-6 rounded-b-xl border-t border-border bg-ink/[0.02] px-5 py-3">
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
      <div className="flex items-center gap-4 rounded-b-xl border-t border-border bg-ink/[0.02] px-5 py-3">
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
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color] duration-200",
        scrolled || menu || mobile
          ? "border-border bg-background/80 backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-transparent",
      )}
      onMouseLeave={scheduleClose}
    >
      <div className={cn(FRAME, GUTTER, "grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-6")}>
        <Link to="/" aria-label="Stroke home" className="flex shrink-0 items-center gap-2.5">
          <StrokeIcon className="size-[22px]" />
          <span className="text-[16px] font-semibold tracking-[-0.02em]">Stroke</span>
        </Link>

        <nav className="hidden items-center gap-0.5 rounded-full p-1 md:flex" aria-label="Main">
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

        {/* Keeps the grid's middle column centered on phones, where the nav is hidden. */}
        <span className="md:hidden" />
        <div className="flex items-center justify-end gap-1.5">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={stars ? `Stroke on GitHub, ${stars} stars` : "Stroke on GitHub"}
            className="hidden h-8 items-center gap-1.5 rounded-full px-3 text-[13px] text-muted-foreground shadow-[0_0_0_1px_var(--border)_inset] transition-colors duration-150 hover:bg-ink/[0.04] hover:text-foreground lg:inline-flex"
          >
            <SiGithub className="size-3.5" />
            {stars ? (
              <>
                <StarIcon className="size-3 fill-current opacity-70" />
                <span className="text-foreground tabular-nums">{formatStars(stars)}</span>
              </>
            ) : (
              "GitHub"
            )}
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
          <Link
            to="/download"
            className={cn(siteButton({ size: "sm" }), "rounded-full ps-3 pe-3.5")}
          >
            <DownloadIcon className="size-3.5" />
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
        className="absolute inset-x-0 top-full hidden pt-2 md:block"
      >
        <div className={cn(FRAME, "flex justify-center px-4 lg:px-10")}>
          <div
            className={cn(
              "w-full animate-in rounded-xl bg-popover shadow-[0_0_0_1px_var(--border),0_24px_64px_-24px_rgb(0_0_0/0.55)] backdrop-blur-xl duration-150 fade-in-0 slide-in-from-top-1",
              menu === "databases" ? "max-w-[52rem]" : "max-w-[48rem]",
            )}
          >
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
        {/* The last call: download, or copy the install line. */}
        <div
          className={cn(
            GUTTER,
            "relative isolate flex flex-col gap-6 overflow-hidden border-b border-border py-12 md:flex-row md:items-center md:justify-between md:py-14",
          )}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 left-1/4 -z-10 h-80 w-[40rem] bg-[radial-gradient(50%_50%_at_50%_50%,rgb(245_180_0/0.07),transparent_70%)]"
          />
          <div>
            <p className="text-[1.6rem] leading-tight font-semibold tracking-[-0.03em] text-balance md:text-[2rem]">
              Every database you run, in one app.
            </p>
            <p className="mt-2 text-[15px] text-muted-foreground">
              Free for 17 days with every feature. $9.99 once to keep it.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2.5 md:w-[23rem]">
            <Link to="/download" className={cn(siteButton({ size: "lg" }), "w-full")}>
              <DownloadIcon className="size-4" />
              Download Stroke
            </Link>
            <MenuInstall />
          </div>
        </div>

        <div
          className={cn(
            GUTTER,
            "grid grid-cols-2 gap-x-6 gap-y-10 pt-14 pb-12 sm:grid-cols-4 md:grid-cols-[1.5fr_repeat(4,1fr)]",
          )}
        >
          <div className="col-span-2 sm:col-span-4 md:col-span-1">
            <Link to="/" aria-label="Stroke home" className="inline-flex items-center gap-2.5">
              <StrokeIcon className="size-[22px]" />
              <span className="text-[16px] font-semibold tracking-[-0.02em]">Stroke</span>
            </Link>
            <p className="mt-4 max-w-[17rem] text-[14px] leading-relaxed text-muted-foreground">
              A native database client for every database you run. Made by one developer, in the
              open.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Stroke on GitHub"
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground shadow-[0_0_0_1px_var(--border)_inset] transition-colors hover:bg-ink/[0.05] hover:text-foreground"
              >
                <SiGithub className="size-3.5" />
              </a>
              <a
                href="mailto:support@stroke.click"
                aria-label="Email support"
                className="flex h-8 items-center rounded-full px-3 text-[13px] text-muted-foreground shadow-[0_0_0_1px_var(--border)_inset] transition-colors hover:bg-ink/[0.05] hover:text-foreground"
              >
                support@stroke.click
              </a>
            </div>
          </div>
          {FOOTER.map((col) => (
            <div key={col.title}>
              <p className="text-[12px] font-medium tracking-[0.04em] text-faint uppercase">
                {col.title}
              </p>
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
            "flex flex-wrap items-center justify-between gap-4 border-t border-border py-5 text-[13px] text-faint",
          )}
        >
          <span>© {new Date().getFullYear()} Stroke. Your credentials stay on your computer.</span>
          <ThemeSwitch className="inline-flex" />
        </div>
      </div>
    </footer>
  );
}
