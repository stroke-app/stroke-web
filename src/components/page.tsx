import { Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "#/components/site-chrome";
import { cn } from "#/lib/utils";

/** Page width shared by the header, footer, and every marketing page. */
export const WRAP = "mx-auto w-full max-w-6xl px-6";

/** Small section label above a heading. Sans, sentence case, accent colored. */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("text-[13px] font-medium text-copper", className)}>{children}</p>;
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
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
    <section className="border-b border-border">
      <div className={cn(WRAP, "py-12 md:py-16")}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-3 max-w-3xl text-4xl leading-[1.05] font-medium tracking-[-0.04em] sm:text-[3.25rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground">
            {description}
          </p>
        )}
        {actions && <div className="mt-7 flex flex-wrap items-center gap-3">{actions}</div>}
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
        "py-12 md:py-16",
        aside && "grid grid-cols-1 gap-10 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16",
      )}
    >
      {aside && (
        <aside className="hidden lg:block">
          <div className="sticky top-20">{aside}</div>
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
  "-ml-px flex items-center justify-between gap-3 border-l py-1.5 pl-3.5 text-sm transition-colors";

/** A vertical index for the page aside: route links or in-page anchors. */
export function SideNav({ title, items }: { title: string; items: SideNavItem[] }) {
  return (
    <nav aria-label={title}>
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <ul className="mt-3 border-l border-border/70">
        {items.map((item, i) => (
          <li key={i}>
            {item.to ? (
              <Link
                to={item.to}
                activeOptions={{ exact: true }}
                className={SIDE_LINK}
                activeProps={{ className: "border-copper font-medium text-foreground" }}
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
    <div className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-border/50 pt-6 text-sm text-muted-foreground [&_a]:transition-colors [&_a:hover]:text-foreground">
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
