import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { SiteFooter, SiteHeader } from "#/components/site-chrome";
import { cn } from "#/lib/utils";

/** Page width shared by the header, footer, and every marketing page. */
export const WRAP = "mx-auto w-full max-w-[1200px] px-6 md:px-8";

/**
 * The marketing site's root: dark only, with its own palette (see `.site` in
 * styles.css), whatever theme the signed-in app is set to.
 */
export const SITE = "site dark min-h-screen bg-background text-foreground";

/**
 * Marketing buttons, from Linear's button spec: pill corners, weight 510,
 * 32 / 40 / 44px tall. Primary is the light "invert" fill; secondary is a
 * translucent fill with an inset hairline ring.
 */
export function siteButton({
  variant = "primary",
  size = "md",
}: {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-full font-[510] whitespace-nowrap transition-[background-color,color,box-shadow,scale] duration-150 ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
    size === "sm" && "h-8 gap-2 px-3 text-[13px]",
    size === "md" && "h-10 gap-2 px-3.5 text-[13px]",
    size === "lg" && "h-11 gap-1.5 px-5 text-[15px]",
    variant === "primary" && "bg-[#e5e5e6] text-[#08090a] hover:bg-white",
    variant === "secondary" &&
      "bg-white/[0.05] text-foreground shadow-[inset_0_0_0_1px_rgb(255_255_255/0.03),inset_0_1px_0_rgb(255_255_255/0.04),0_0_0_1px_rgb(0_0_0/0.6),0_4px_4px_rgb(0_0_0/0.1)] backdrop-blur-sm hover:bg-[#191a1b]",
    variant === "ghost" && "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
  );
}

/** Small label above a heading: an optional section number, then the name. */
export function Eyebrow({
  children,
  index,
  className,
}: {
  children: React.ReactNode;
  /** Section number in Linear's style, e.g. "1.0". */
  index?: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 text-[13px] font-[510] text-muted-foreground",
        className,
      )}
    >
      {index && <span className="text-faint tabular-nums">{index}</span>}
      {children}
    </p>
  );
}

/** Text link with a trailing arrow that nudges on hover. */
export function ArrowLink({ children, className, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={cn(
        "group inline-flex items-center gap-1.5 text-[15px] text-muted-foreground transition-colors hover:text-foreground",
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

/** A full-width page band with the standard rhythm and a hairline on top. */
export function Section({
  id,
  className,
  inner,
  children,
  border = true,
}: {
  id?: string;
  className?: string;
  /** Classes for the inner, width-capped container. */
  inner?: string;
  children: React.ReactNode;
  border?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn("relative scroll-mt-16", border && "border-t border-border", className)}
    >
      <div className={cn(WRAP, "reveal py-24 md:py-36", inner)}>{children}</div>
    </section>
  );
}

/**
 * The Linear section opener: a large headline on the left, and on the right a
 * paragraph in the soft text color with an optional "Learn more" link.
 */
export function SectionIntro({
  eyebrow,
  index,
  title,
  children,
  link,
  as: Heading = "h2",
  className,
}: {
  eyebrow?: React.ReactNode;
  index?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  link?: { to: React.ComponentProps<typeof Link>["to"]; hash?: string; label?: string };
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start md:gap-16 lg:gap-24",
        className,
      )}
    >
      <div>
        {eyebrow && <Eyebrow index={index}>{eyebrow}</Eyebrow>}
        <Heading
          className={cn(
            "text-[2.25rem] text-balance sm:text-[2.5rem] md:text-[3rem]",
            eyebrow && "mt-5",
          )}
        >
          {title}
        </Heading>
      </div>
      {(children || link) && (
        <div className={cn("md:pt-1", eyebrow && "md:pt-10")}>
          {children && (
            <div className="space-y-4 text-[17px] leading-[1.6] text-pretty text-soft md:text-[1.25rem] md:leading-[1.5] [&_strong]:font-[510] [&_strong]:text-foreground">
              {children}
            </div>
          )}
          {link && (
            <ArrowLink to={link.to} hash={link.hash} className="mt-8">
              {link.label ?? "Learn more"}
            </ArrowLink>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * A product-UI panel: the app's dark surface, a hairline border, and a faint
 * top highlight. Mockups are composed from these, often overlapped and faded
 * at the edges with the `fade-*` utilities.
 */
export function Panel({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b0c0d] shadow-[0_1px_0_0_rgb(255_255_255/0.06)_inset,0_24px_60px_-12px_rgb(0_0_0/0.6)]",
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
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

/** The title band at the top of every inner page. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      {/* A soft light from above, the only decoration on the page header. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,rgb(255_255_255/0.06),transparent)]"
      />
      <div className={cn(WRAP, "relative pt-20 pb-14 md:pt-28 md:pb-20")}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1
          className={cn(
            "max-w-4xl text-[2.5rem] text-balance sm:text-[3.25rem] md:text-[4rem]",
            eyebrow && "mt-5",
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-pretty text-muted-foreground md:text-xl md:leading-[1.5]">
            {description}
          </p>
        )}
        {actions && <div className="mt-9 flex flex-wrap items-center gap-3">{actions}</div>}
        {children}
      </div>
    </section>
  );
}

/**
 * Page content, optionally with a sticky index beside it on wide screens. The
 * reading column caps at 48rem so long text keeps a comfortable measure.
 */
export function PageBody({
  aside,
  wide = false,
  children,
}: {
  aside?: React.ReactNode;
  /** Let the content use the full page width (grids, cards). */
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        WRAP,
        "border-t border-border py-14 md:py-20",
        aside && "grid grid-cols-1 gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-20",
      )}
    >
      {aside && (
        <aside className="hidden lg:block">
          <div className="sticky top-24">{aside}</div>
        </aside>
      )}
      <div className={cn("min-w-0", !wide && "max-w-3xl")}>{children}</div>
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
