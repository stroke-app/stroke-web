import { Link } from "@tanstack/react-router";
import { MotionConfig } from "framer-motion";
import { ChevronRightIcon } from "lucide-react";

import { SiteFooter, SiteHeader } from "#/components/site-chrome";
import { cn } from "#/lib/utils";

/**
 * The marketing site's layout, after Apple's product pages: no frame and no
 * rules between sections. Sections are separated by space, and structure
 * comes from warm-gray rounded cards and full-bleed gray bands. Content keeps
 * one column width and side padding, so text, cards and screens line up.
 */

/** Width of the content column. The header, footer and every section share it. */
export const FRAME = "mx-auto w-full max-w-[1120px]";
/** Side padding of a content row. */
export const GUTTER = "px-5 sm:px-8 lg:px-10";
/** A content row: frame width plus gutter. */
export const WRAP = cn(FRAME, GUTTER);

/**
 * The marketing site's root, with its own palette (see `.site` in
 * styles.css), whatever theme the signed-in app is set to.
 */
export const SITE = "site min-h-screen bg-background text-foreground";

/**
 * Buttons are pills, weight 500. Primary is Stroke amber with black text (the
 * one action per view); secondary is the card gray; ghost is text that fills
 * on hover; link is the amber-dark text link with a chevron, Apple style.
 */
export function siteButton({
  variant = "primary",
  size = "md",
}: {
  variant?: "primary" | "secondary" | "ghost" | "dark";
  size?: "sm" | "md" | "lg";
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-[background-color,color,box-shadow,scale] duration-200 ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
    size === "sm" && "h-8 px-3.5 text-[13px]",
    size === "md" && "h-10 px-4.5 text-[14.5px]",
    size === "lg" && "h-12 px-6 text-[16px]",
    variant === "primary" &&
      "bg-[var(--amber)] text-[var(--amber-ink)] shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_1px_2px_rgb(0_0_0/0.08)] hover:bg-[var(--amber-hover)]",
    variant === "dark" && "bg-primary text-primary-foreground hover:bg-primary/85",
    variant === "secondary" && "bg-card text-foreground hover:bg-accent",
    variant === "ghost" && "text-muted-foreground hover:bg-ink/[0.05] hover:text-foreground",
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
        "flex items-center gap-2 text-[14px] font-medium text-[var(--link)]",
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

/** The amber-dark text link with a chevron that nudges on hover. */
export const LINK =
  "group inline-flex items-center gap-1 font-medium text-[var(--link)] transition-colors hover:underline hover:underline-offset-4";

export function ArrowLink({ children, className, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <Link {...props} className={cn(LINK, "text-[15px]", className)}>
      <>
        {children}
        <ChevronRightIcon
          className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
          strokeWidth={2}
        />
      </>
    </Link>
  );
}

/**
 * The house headline: the point in black, then a second line that steps down
 * to gray. "Press Run. / Stroke does the rest."
 */
export function Title({
  children,
  sub,
  as: Heading = "h2",
  id,
  className,
}: {
  children: React.ReactNode;
  sub?: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
}) {
  return (
    <Heading
      id={id}
      className={cn("text-[2.25rem] text-balance sm:text-[2.75rem] md:text-[3.25rem]", className)}
    >
      {children}
      {sub && (
        <>
          {" "}
          <span className="title-sub block">{sub}</span>
        </>
      )}
    </Heading>
  );
}

/**
 * A content row: the unit every page is stacked from. `band` paints it as a
 * full-bleed gray band (Apple's alternating sections); `border` is kept for
 * old call sites and no longer draws a rule.
 */
export function Section({
  id,
  className,
  inner,
  children,
  band = false,
}: {
  id?: string;
  className?: string;
  /** Classes for the inner, padded container. */
  inner?: string;
  children: React.ReactNode;
  border?: boolean;
  band?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-24",
        band && "[margin-inline:calc(50%-50vw)] w-screen max-w-none bg-[var(--band)]",
        className,
      )}
    >
      <div className={cn(band ? WRAP : GUTTER, "py-20 md:py-28", inner)}>{children}</div>
    </section>
  );
}

/** A section opener: eyebrow, headline, and one lead sentence under it. */
export function SectionIntro({
  eyebrow,
  index,
  icon,
  title,
  sub,
  children,
  link,
  as = "h2",
  align = "start",
  className,
}: {
  eyebrow?: React.ReactNode;
  index?: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: React.ReactNode;
  /** The gray second line of the headline. */
  sub?: React.ReactNode;
  children?: React.ReactNode;
  link?: { to: React.ComponentProps<typeof Link>["to"]; hash?: string; label?: string };
  as?: "h1" | "h2";
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex max-w-3xl flex-col",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <Eyebrow index={index} icon={icon}>
          {eyebrow}
        </Eyebrow>
      )}
      <Title as={as} sub={sub} className={cn(eyebrow && "mt-3")}>
        {title}
      </Title>
      {children && (
        <div className="mt-6 max-w-2xl space-y-4 text-[17px] leading-[1.55] text-pretty text-muted-foreground md:text-[19px] [&_strong]:font-medium [&_strong]:text-foreground">
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

/** A grid of rounded warm-gray cards with gutters. Children should be `Cell`s. */
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
        "grid grid-cols-1 gap-4 md:gap-5",
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
    <div {...props} className={cn("rounded-[28px] bg-card p-7 md:p-9", className)}>
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
        "keep-dark dark overflow-hidden rounded-2xl bg-[#0a0a0a] shadow-[var(--shadow-float)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    // Motion respects the visitor's reduced-motion setting everywhere.
    <MotionConfig reducedMotion="user">
      <div className={cn(SITE, "flex flex-col overflow-x-clip")}>
        {/* Motion renders entrances hidden until they play; without script
            they would stay hidden, so show everything as it is. */}
        <noscript>
          <style>{`.site [style*="opacity:0"],.site [style*="opacity: 0"]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        <SiteHeader />
        <main className={cn(FRAME, "flex-1 pb-28 md:pb-36")}>{children}</main>
        <SiteFooter />
      </div>
    </MotionConfig>
  );
}

/**
 * The title band at the top of every inner page, the homepage's hero at a
 * smaller size: the section name in amber, the headline (with an optional
 * gray second line), one paragraph, the actions. `align="start"` keeps it
 * left for reading pages (docs, legal) whose body starts at the left edge.
 */
export function PageHeader({
  eyebrow,
  title,
  sub,
  description,
  actions,
  note,
  align = "center",
  children,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  /** The gray second line of the headline. */
  sub?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** A small line under the actions (version, price). */
  note?: React.ReactNode;
  align?: "center" | "start";
  children?: React.ReactNode;
}) {
  const center = align === "center";
  return (
    <section className="relative isolate z-10">
      <div
        className={cn(
          GUTTER,
          "flex flex-col pt-16 pb-14 md:pt-24 md:pb-20",
          center && "items-center text-center",
        )}
      >
        {eyebrow && <PagePill>{eyebrow}</PagePill>}
        <Title
          as="h1"
          sub={sub}
          className={cn(
            "max-w-[22ch] text-[2.6rem] leading-[1.04] tracking-[-0.045em] sm:text-[3.4rem] md:text-[4.25rem]",
            eyebrow && "mt-4",
          )}
        >
          {title}
        </Title>
        {description && (
          <p className="mt-7 max-w-[42rem] text-[18px] leading-[1.5] text-pretty text-muted-foreground md:text-[21px]">
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
        "inline-flex w-fit items-center gap-2 text-[15px] font-medium text-[var(--link)]",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** A screenshot of the app in a Mac-style device, as the homepage shows one. */
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
    <figure className={cn("mx-auto w-full max-w-[68rem]", className)}>
      <div className="device">
        <div className="keep-dark overflow-hidden rounded-[12px] bg-[#0b0b0b]">
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
      <div className="device-base" aria-hidden="true" />
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
        "py-10 md:py-14",
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
    <div className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-[15px] [&_a]:font-medium [&_a]:text-[var(--link)] [&_a:hover]:underline [&_a:hover]:underline-offset-4">
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
