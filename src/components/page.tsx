import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { SiteFooter, SiteHeader } from "#/components/site-chrome";
import { cn } from "#/lib/utils";

/**
 * The marketing site's layout. Every page sits in one framed column: hairline
 * rails on the left and right (from lg up), and a hairline between sections
 * that runs rail to rail. Content inside gets the same side padding, so text,
 * grids and screens line up down the whole page.
 */

/** Width of the frame. The header, footer and every section share it. */
export const FRAME = "mx-auto w-full max-w-[1240px]";
/** Inside padding of a frame row. */
export const GUTTER = "px-6 md:px-10 lg:px-14";
/** A content row: frame width plus gutter. */
export const WRAP = cn(FRAME, GUTTER);

/**
 * The marketing site's root, with its own palette (see `.site` in
 * styles.css), whatever theme the signed-in app is set to.
 */
export const SITE = "site min-h-screen bg-background text-foreground";

/**
 * Buttons: 8px corners, weight 500. Primary is the solid light fill (the one
 * action per view); secondary is a raised surface with a hairline; ghost is
 * text that fills on hover.
 */
export function siteButton({
  variant = "primary",
  size = "md",
}: {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-[background-color,color,box-shadow,scale] duration-150 ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
    size === "sm" && "h-8 px-3 text-[13px]",
    size === "md" && "h-9 px-3.5 text-[14px]",
    size === "lg" && "h-11 px-5 text-[15px]",
    variant === "primary" &&
      "bg-primary text-primary-foreground shadow-[0_1px_0_0_rgb(255_255_255/0.2)_inset] hover:bg-primary/88",
    variant === "secondary" &&
      "bg-secondary text-foreground shadow-[0_0_0_1px_var(--border)_inset] hover:bg-accent",
    variant === "ghost" && "text-muted-foreground hover:bg-ink/[0.06] hover:text-foreground",
  );
}

/** Small label above a heading: an optional icon (or section number), then the name. */
export function Eyebrow({
  children,
  index,
  icon: Icon,
  className,
}: {
  children: React.ReactNode;
  /** Section number, e.g. "01". */
  index?: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 text-[13px] font-medium text-muted-foreground",
        className,
      )}
    >
      {Icon && <Icon className="size-[15px] shrink-0" strokeWidth={1.75} />}
      {index && <span className="font-mono text-[12px] text-faint tabular-nums">{index}</span>}
      {children}
    </p>
  );
}

/**
 * The house sentence: a bright lead that says the point, then the rest in
 * the muted color. "Run any SQL. Results stream in as they arrive."
 */
export function Lead({
  lead,
  children,
  className,
}: {
  lead: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-pretty text-muted-foreground", className)}>
      <span className="font-medium text-foreground">{lead}</span>
      {children && <> {children}</>}
    </p>
  );
}

/** Text link with a trailing arrow that nudges on hover. */
export function ArrowLink({ children, className, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={cn(
        "group inline-flex items-center gap-1.5 text-[14px] font-medium text-foreground transition-colors hover:text-soft",
        className,
      )}
    >
      <>
        {children}
        <ArrowRightIcon className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
      </>
    </Link>
  );
}

/** A frame row with a hairline on top: the unit every page is stacked from. */
export function Section({
  id,
  className,
  inner,
  children,
  border = true,
}: {
  id?: string;
  className?: string;
  /** Classes for the inner, padded container. */
  inner?: string;
  children: React.ReactNode;
  border?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn("relative scroll-mt-20", border && "border-t border-border", className)}
    >
      <div className={cn(GUTTER, "py-20 md:py-28", inner)}>{children}</div>
    </section>
  );
}

/** A section opener: eyebrow, headline, and one lead sentence under it. */
export function SectionIntro({
  eyebrow,
  index,
  icon,
  title,
  children,
  link,
  as: Heading = "h2",
  align = "start",
  className,
}: {
  eyebrow?: React.ReactNode;
  index?: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: React.ReactNode;
  children?: React.ReactNode;
  link?: { to: React.ComponentProps<typeof Link>["to"]; hash?: string; label?: string };
  as?: "h1" | "h2";
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <Eyebrow index={index} icon={icon}>
          {eyebrow}
        </Eyebrow>
      )}
      <Heading
        className={cn(
          "text-[2rem] text-balance sm:text-[2.5rem] md:text-[2.875rem]",
          eyebrow && "mt-4",
        )}
      >
        {title}
      </Heading>
      {children && (
        <div className="mt-5 space-y-4 text-[16px] leading-[1.6] text-pretty text-muted-foreground md:text-[17px] [&_strong]:font-medium [&_strong]:text-foreground">
          {children}
        </div>
      )}
      {link && (
        <ArrowLink to={link.to} hash={link.hash} className="mt-6">
          {link.label ?? "Learn more"}
        </ArrowLink>
      )}
    </div>
  );
}

/**
 * A grid whose cells are split by hairlines instead of gaps, the way the
 * frame splits sections. Children should be `Cell`s.
 */
export function CellGrid({
  cols = 3,
  className,
  children,
}: {
  cols?: 2 | 3 | 4;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-px overflow-hidden border-y border-border bg-border",
        cols === 2 && "md:grid-cols-2",
        cols === 3 && "md:grid-cols-2 lg:grid-cols-3",
        cols === 4 && "sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Cell({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div {...props} className={cn("bg-background p-7 md:p-9", className)}>
      {children}
    </div>
  );
}

/**
 * A product screen: the app's dark surface in a hairline frame with a faint
 * inner highlight. Screenshots and coded mockups sit inside one.
 */
export function Panel({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "keep-dark dark overflow-hidden rounded-xl bg-[#0a0a0a] shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_1px_0_0_rgb(255_255_255/0.06)_inset,0_30px_80px_-20px_rgb(0_0_0/0.7)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(SITE, "flex flex-col")}>
      <SiteHeader />
      <main className={cn(FRAME, "flex-1 border-border lg:border-x")}>{children}</main>
      <SiteFooter />
    </div>
  );
}

/**
 * The title band at the top of every inner page, the homepage's hero at a
 * smaller size: the section name in a pill, the headline, one paragraph, the
 * actions, all centered over a low warm light. `align="start"` keeps it left
 * for reading pages (docs, legal) whose body starts at the left edge.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  note,
  align = "center",
  children,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** A small line under the actions (version, price). */
  note?: React.ReactNode;
  align?: "center" | "start";
  children?: React.ReactNode;
}) {
  const center = align === "center";
  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-40 -z-10 h-[30rem] w-[56rem] max-w-[160%] bg-[radial-gradient(50%_50%_at_50%_50%,rgb(245_180_0/0.09),transparent_70%)]",
          center ? "left-1/2 -translate-x-1/2" : "-left-40",
        )}
      />
      <div
        className={cn(
          GUTTER,
          "flex flex-col pt-16 pb-14 md:pt-24 md:pb-20",
          center && "items-center text-center",
        )}
      >
        {eyebrow && <PagePill>{eyebrow}</PagePill>}
        <h1
          className={cn(
            "max-w-[20ch] text-[2.5rem] leading-[1.05] tracking-[-0.04em] text-balance sm:text-[3.1rem] md:text-[3.6rem]",
            eyebrow && "mt-6",
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-[40rem] text-[17px] leading-[1.6] text-pretty text-muted-foreground md:text-[18px]">
            {description}
          </p>
        )}
        {actions && (
          <div className={cn("mt-9 flex flex-wrap items-start gap-3", center && "justify-center")}>
            {actions}
          </div>
        )}
        {note && <p className="mt-3 text-[13px] text-faint">{note}</p>}
        {children}
      </div>
    </section>
  );
}

/** The small rounded label over a page title. */
export function PagePill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "inline-flex h-7 w-fit items-center gap-2 rounded-full bg-ink/[0.04] px-3 text-[13px] font-medium text-soft shadow-[0_0_0_1px_var(--border)_inset]",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** A screenshot of the app in the site's window frame, as the homepage shows one. */
export function ProductShot({
  src,
  alt,
  width = 1600,
  height = 1000,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={cn("mx-auto w-full max-w-[72rem]", className)}>
      <div className="rounded-[14px] bg-gradient-to-b from-ink/[0.14] to-ink/[0.04] p-px shadow-[0_40px_120px_-40px_rgb(0_0_0/0.65)]">
        <div className="keep-dark overflow-hidden rounded-[13px] bg-[#0b0b0b]">
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            className="block h-auto w-full"
          />
        </div>
      </div>
    </figure>
  );
}

/**
 * Page content, optionally with a sticky index beside it on wide screens. The
 * reading column caps at 46rem so long text keeps a comfortable measure.
 */
export function PageBody({
  aside,
  rail,
  wide = false,
  children,
}: {
  aside?: React.ReactNode;
  /** A right-hand column on wide screens. */
  rail?: React.ReactNode;
  /** Let the content use the full width (grids, cards). */
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        GUTTER,
        "border-t border-border py-12 md:py-16",
        aside && !rail && "grid grid-cols-1 gap-10 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16",
        aside &&
          rail &&
          "grid grid-cols-1 gap-10 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[12rem_minmax(0,1fr)_14rem]",
      )}
    >
      {aside && (
        <aside className="hidden lg:block">
          <div className="sticky top-24">{aside}</div>
        </aside>
      )}
      <div className={cn("min-w-0", !wide && "max-w-[46rem]")}>{children}</div>
      {rail && (
        <aside className="hidden xl:block" aria-label="Sponsors">
          <div className="sticky top-24">{rail}</div>
        </aside>
      )}
    </div>
  );
}

type SideNavItem =
  | { label: React.ReactNode; to: "/docs" | "/docs/mcp"; hash?: never }
  | { label: React.ReactNode; hash: string; to?: never };

const SIDE_LINK =
  "-ml-px flex items-center justify-between gap-3 border-l py-1.5 pl-3.5 text-[13px] transition-colors";

/** A vertical index for the page aside: route links or in-page anchors. */
export function SideNav({ title, items }: { title: string; items: SideNavItem[] }) {
  return (
    <nav aria-label={title}>
      <p className="text-xs font-medium text-faint">{title}</p>
      <ul className="mt-3 border-l border-border">
        {items.map((item, i) => (
          <li key={i}>
            {item.to ? (
              <Link
                to={item.to}
                activeOptions={{ exact: true }}
                className={SIDE_LINK}
                activeProps={{ className: "border-foreground font-medium text-foreground" }}
                inactiveProps={{
                  className:
                    "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                }}
              >
                {item.label}
              </Link>
            ) : (
              <a
                href={`#${item.hash}`}
                className={cn(
                  SIDE_LINK,
                  "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                )}
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Closing strip of related links at the bottom of an inner page. */
export function NextLinks({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-sm text-muted-foreground [&_a]:transition-colors [&_a:hover]:text-foreground">
      {children}
    </div>
  );
}

/** The docs section index, shared by every docs page's aside. */
export function DocsNav() {
  return (
    <SideNav
      title="Docs"
      items={[
        { label: "Getting started", to: "/docs" },
        { label: "MCP for agents", to: "/docs/mcp" },
      ]}
    />
  );
}
