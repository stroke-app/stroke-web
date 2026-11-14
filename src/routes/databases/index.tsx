import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { PageBody, PageHeader, PageShell, siteButton } from "#/components/page";
import { SponsorRail } from "#/components/sponsor-rail";
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

function DatabasesPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Databases"
        title={`${SHIPPED_ENGINES.length} databases, one app`}
        description="SQL, documents, key-value and analytics, each with the editor, grid and AI it deserves. Pick one to see what Stroke does with it."
        actions={
          <Link to="/download" className={siteButton({ size: "md" })}>
            Download Stroke
            <ArrowRightIcon className="size-4" />
          </Link>
        }
      />
      <PageBody aside={<DatabasesNav />} rail={<SponsorRail />} wide>
        <div className="flex flex-col gap-14">
          {ORDER.map((cat) => {
            const list = ENGINES.filter((e) => e.category === cat);
            if (!list.length) return null;
            return (
              <section key={cat} aria-labelledby={`cat-${cat}`}>
                <h2 id={`cat-${cat}`} className="text-xl font-semibold tracking-[-0.01em]">
                  {CATEGORY_LABEL[cat]}
                </h2>
                <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {list.map((e) => (
                    <li key={e.slug}>
                      <Link
                        to="/databases/$engine"
                        params={{ engine: e.slug }}
                        className="group flex h-full items-start gap-3.5 rounded-xl border border-border bg-white/[0.02] p-4 transition-[background-color,border-color,scale] duration-150 hover:border-foreground/20 hover:bg-white/[0.04] active:scale-[0.99]"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
                          <e.Icon className="size-5" color={e.color} aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 text-[15px] font-medium text-foreground">
                            {e.name}
                            {e.status === "soon" && (
                              <span className="rounded-full border border-border px-1.5 text-[11px] text-muted-foreground">
                                Coming soon
                              </span>
                            )}
                          </span>
                          <span className="mt-1 block text-[13px] leading-relaxed text-pretty text-muted-foreground">
                            {e.summary}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </PageBody>
    </PageShell>
  );
}
