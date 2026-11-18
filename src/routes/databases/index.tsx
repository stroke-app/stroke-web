import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

import { GUTTER, PageHeader, PageShell, Panel, siteButton } from "#/components/page";
import { CATEGORY_LABEL, ENGINES, type EngineCategory, SHIPPED_ENGINES } from "#/lib/engines";
import { seo } from "#/lib/seo";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/databases/")({
  head: () =>
    seo({
      title: "Supported databases · Stroke database client",
      description: `Stroke opens ${SHIPPED_ENGINES.length} databases from one native app: PostgreSQL, MySQL, SQL Server, Oracle, SQLite, MongoDB, Redis, ClickHouse, DynamoDB and more, on Mac, Windows and Linux.`,
      path: "/databases",
      breadcrumbs: [{ name: "Databases", path: "/databases" }],
    }),
  component: DatabasesPage,
});

const ORDER: EngineCategory[] = ["relational", "document", "key-value", "analytics", "search"];

export function DatabasesNav({ current }: { current?: string }) {
  return (
    <nav aria-label="Databases">
      <p className="text-xs font-medium text-faint">Databases</p>
      <ul className="mt-3 border-l border-border">
        {ENGINES.map((e) => (
          <li key={e.slug}>
            <Link
              to="/databases/$engine"
              params={{ engine: e.slug }}
              className={cn(
                "-ml-px flex items-center gap-2 border-l py-1.5 pl-3.5 text-[13px] transition-colors",
                current === e.slug
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              <e.Icon
                className="size-3.5 shrink-0"
                color={current === e.slug ? e.color : "currentColor"}
                aria-hidden="true"
              />
              {e.name}
              {e.status === "soon" && (
                <span className="ms-auto pe-2 text-[11px] text-faint">Soon</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** A screen per category, the closest real screenshot of that kind of database. */
const CATEGORY_SHOT: Partial<Record<EngineCategory, string>> = {
  relational: "/shots/table.webp",
  document: "/shots/mongo.webp",
  "key-value": "/shots/redis-keys.webp",
};

function DatabasesPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<EngineCategory | "all">("all");
  const q = query.trim().toLowerCase();
  const matches = (e: (typeof ENGINES)[number]) =>
    (cat === "all" || e.category === cat) &&
    (!q || e.name.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q));
  const shownCount = ENGINES.filter(matches).length;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Databases"
        title={`${SHIPPED_ENGINES.length} databases. One app.`}
        description="SQL, documents, key-value, analytics and search, each with the editor, grid and AI it deserves. Pick yours to see what Stroke does with it."
      />

      <div
        className={cn(
          GUTTER,
          "flex flex-col gap-4 pb-8 md:flex-row md:items-center md:justify-between",
        )}
      >
        <div role="group" aria-label="Filter by kind" className="flex flex-wrap gap-2">
          {(["all", ...ORDER] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
              className={cn(
                "h-8 rounded-full px-3.5 text-[13px] transition-colors duration-150",
                cat === c
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground shadow-[0_0_0_1px_var(--border)_inset] hover:text-foreground",
              )}
            >
              {c === "all" ? "All" : CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
        <label className="relative block md:w-72">
          <span className="sr-only">Search databases</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search databases"
            className="h-9 w-full rounded-lg bg-secondary pr-3 pl-9 text-[14px] shadow-[0_0_0_1px_var(--border)_inset] outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      </div>

      {shownCount === 0 && (
        <p className={cn(GUTTER, "border-t border-border py-16 text-[15px] text-muted-foreground")}>
          Nothing matches “{query}”. Stroke may not support it yet:{" "}
          <a
            href="https://github.com/stroke-app/stroke/issues"
            className="text-foreground underline underline-offset-4"
          >
            ask for it on GitHub
          </a>
          .
        </p>
      )}

      {ORDER.map((c) => {
        const list = ENGINES.filter((e) => e.category === c && matches(e));
        if (!list.length) return null;
        const shot = CATEGORY_SHOT[c];
        return (
          <section key={c} aria-labelledby={`cat-${c}`} className="border-t border-border">
            <div className={cn(GUTTER, "flex items-baseline justify-between gap-4 pt-10 pb-6")}>
              <h2 id={`cat-${c}`} className="text-[1.375rem]">
                {CATEGORY_LABEL[c]}
              </h2>
              <span className="text-[13px] text-muted-foreground tabular-nums">{list.length}</span>
            </div>
            <ul className="grid grid-cols-1 gap-px border-t border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {list.map((e) => (
                <li key={e.slug} className="bg-background">
                  <Link
                    to="/databases/$engine"
                    params={{ engine: e.slug }}
                    className="group flex h-full min-h-[176px] flex-col p-6 transition-colors duration-150 hover:bg-ink/[0.03] md:p-7"
                  >
                    <span className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-ink/[0.05]">
                        <e.Icon className="size-5" color={e.color} aria-hidden="true" />
                      </span>
                      {e.status !== "stable" && (
                        <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[12px] text-soft">
                          {e.status === "beta" ? "Beta" : "Coming soon"}
                        </span>
                      )}
                    </span>
                    <span className="mt-5 text-[16px] font-medium">{e.name}</span>
                    <span className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-pretty text-muted-foreground">
                      {e.summary}
                    </span>
                    <span className="mt-auto flex items-center gap-1 pt-4 text-[13px] font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                      What Stroke does
                      <ArrowRightIcon className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
              {Array.from({ length: (3 - (list.length % 3)) % 3 }, (_, i) => (
                <li key={`f-${i}`} aria-hidden="true" className="hidden bg-background lg:block" />
              ))}
              {list.length % 2 === 1 && (
                <li aria-hidden="true" className="hidden bg-background sm:block lg:hidden" />
              )}
            </ul>
            {shot && cat === "all" && !q && (
              <div className={cn(GUTTER, "border-t border-border py-10")}>
                <Panel className="aspect-[16/7]">
                  <img
                    src={shot}
                    alt=""
                    loading="lazy"
                    className="block h-full w-full object-cover object-top-left"
                  />
                </Panel>
              </div>
            )}
          </section>
        );
      })}

      <section className="border-t border-border">
        <div
          className={cn(
            GUTTER,
            "flex flex-col items-start justify-between gap-6 py-14 md:flex-row md:items-center",
          )}
        >
          <p className="max-w-xl text-[18px] leading-snug tracking-[-0.01em]">
            One download opens all of them.{" "}
            <span className="text-muted-foreground">
              Same shortcuts, same editor, same AI, whatever you connect to.
            </span>
          </p>
          <Link to="/download" className={siteButton({ size: "lg" })}>
            Download Stroke
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
