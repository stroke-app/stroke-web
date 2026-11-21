import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon, CheckIcon } from "lucide-react";

import { SUPPORT_EMAIL } from "#/components/legal";
import {
  GUTTER,
  PageHeader,
  PageShell,
  Section,
  SectionIntro,
  siteButton,
} from "#/components/page";
import { COMPETITORS, STROKE_EXTRAS, STROKE_FACTS } from "#/lib/competitors";
import { seo } from "#/lib/seo";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/compare/")({
  head: () =>
    seo({
      title: "Compare database clients · Stroke vs TablePlus, DBeaver, DataGrip, Beekeeper Studio",
      description:
        "How Stroke compares with TablePlus, DBeaver, DataGrip, Beekeeper Studio, Prisma Studio and Drizzle Studio: what each is built on, where it runs and what it costs.",
      path: "/compare",
      breadcrumbs: [{ name: "Compare", path: "/compare" }],
    }),
  component: ComparePage,
});

const ROWS: { label: string; key: "runtime" | "platforms" | "pricing" | "needs" }[] = [
  { label: "Built on", key: "runtime" },
  { label: "Runs on", key: "platforms" },
  { label: "Price", key: "pricing" },
  { label: "Needs first", key: "needs" },
];

export function CompareNote() {
  return (
    <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
      From each vendor's own site as of November 2026; products change, so check theirs before
      deciding. Something wrong?{" "}
      <a
        href={`mailto:${SUPPORT_EMAIL}?subject=Comparison%20correction`}
        className="underline underline-offset-2 hover:text-foreground"
      >
        Tell me
      </a>{" "}
      and I'll fix it.
    </p>
  );
}

export function StrokeExtras({ columns = 2, className }: { columns?: 1 | 2; className?: string }) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-x-8 gap-y-4",
        columns === 2 && "md:grid-cols-2",
        className,
      )}
    >
      {STROKE_EXTRAS.map((x) => (
        <li
          key={x}
          className="flex gap-3 text-[15px] leading-relaxed text-pretty text-foreground/90"
        >
          <CheckIcon className="mt-1 size-4 shrink-0 text-emerald-400" aria-hidden="true" />
          {x}
        </li>
      ))}
    </ul>
  );
}

function ComparePage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Compare"
        title="Stroke and the other database clients"
        description="What each one is built on, where it runs and what it costs, side by side. Then what Stroke adds."
        actions={
          <Link to="/download" className={siteButton({ size: "lg" })}>
            Try Stroke free
            <ArrowRightIcon className="size-4" />
          </Link>
        }
      />
      <div className={cn(GUTTER, "pb-20 md:pb-28")}>
        {/* Phones: one card per client. */}
        <ul className="flex flex-col gap-3 md:hidden">
          {[{ slug: "", name: "Stroke", ...STROKE_FACTS }, ...COMPETITORS].map((c) => (
            <li
              key={c.name}
              className={cn("rounded-[24px] bg-card p-4", !c.slug && "bg-ink/[0.04]")}
            >
              <p className="text-[15px] font-semibold">
                {c.slug ? (
                  <Link
                    to="/compare/$slug"
                    params={{ slug: c.slug }}
                    className="underline-offset-4 hover:underline"
                  >
                    {c.name}
                  </Link>
                ) : (
                  c.name
                )}
              </p>
              <dl className="mt-3 grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-2 text-[13.5px]">
                {ROWS.map((r) => (
                  <div key={r.key} className="contents">
                    <dt className="text-muted-foreground">{r.label}</dt>
                    <dd className={c.slug ? "text-soft" : "text-foreground"}>{c[r.key]}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
        {/* Wider screens: one row per client, so nothing scrolls sideways. */}
        <div className="hidden overflow-x-auto rounded-[24px] bg-card md:block">
          <table className="w-full min-w-[46rem] border-collapse text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-border bg-ink/[0.02] text-[12.5px]">
                <th scope="col" className="w-44 px-5 py-3 font-medium text-muted-foreground">
                  Client
                </th>
                {ROWS.map((r) => (
                  <th
                    key={r.key}
                    scope="col"
                    className="px-5 py-3 font-medium text-muted-foreground"
                  >
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border bg-ink/[0.04] align-top">
                <th scope="row" className="px-5 py-4 text-[14.5px] font-semibold text-foreground">
                  <span className="flex items-center gap-2">
                    Stroke
                    <span className="rounded-full bg-ink/[0.08] px-1.5 py-px text-[11px] font-medium text-soft">
                      This one
                    </span>
                  </span>
                </th>
                {ROWS.map((r) => (
                  <td key={r.key} className="px-5 py-4 leading-relaxed text-foreground">
                    {STROKE_FACTS[r.key]}
                  </td>
                ))}
              </tr>
              {COMPETITORS.map((c) => (
                <tr key={c.slug} className="border-b border-border align-top last:border-0">
                  <th scope="row" className="px-5 py-4 font-medium">
                    <Link
                      to="/compare/$slug"
                      params={{ slug: c.slug }}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      {c.name}
                    </Link>
                  </th>
                  {ROWS.map((r) => (
                    <td key={r.key} className="px-5 py-4 leading-relaxed text-muted-foreground">
                      {c[r.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CompareNote />
      </div>

      <Section>
        <SectionIntro eyebrow="Head to head" title="One client at a time">
          <p>Where each one fits best, and how Stroke differs, on a page of its own.</p>
        </SectionIntro>
        <ul className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COMPETITORS.map((c) => (
            <li key={c.slug}>
              <Link
                to="/compare/$slug"
                params={{ slug: c.slug }}
                className="group flex h-full flex-col rounded-[24px] bg-card p-5 transition-[background-color] duration-150 hover:bg-accent"
              >
                <span className="flex items-center justify-between gap-3 text-[16px] font-semibold">
                  Stroke vs {c.name}
                  <ArrowRightIcon className="size-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </span>
                <span className="mt-2 text-[14px] leading-relaxed text-pretty text-muted-foreground">
                  {c.goodFor}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section inner="md:pb-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
          <SectionIntro eyebrow="In Stroke" title="What it adds">
            <p>Stated as what Stroke does, not as what others lack.</p>
          </SectionIntro>
          <StrokeExtras />
        </div>
      </Section>
    </PageShell>
  );
}

export function CompareNav({ current }: { current?: string }) {
  return (
    <nav aria-label="Comparisons">
      <p className="text-xs font-medium text-faint">Compare</p>
      <ul className="mt-3 border-l border-border">
        <li>
          <Link
            to="/compare"
            activeOptions={{ exact: true }}
            className="-ml-px block border-l py-1.5 pl-3.5 text-[13px] transition-colors"
            activeProps={{ className: "border-foreground font-medium text-foreground" }}
            inactiveProps={{
              className:
                "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            }}
          >
            All clients
          </Link>
        </li>
        {COMPETITORS.map((c) => (
          <li key={c.slug}>
            <Link
              to="/compare/$slug"
              params={{ slug: c.slug }}
              className={
                "-ml-px block border-l py-1.5 pl-3.5 text-[13px] transition-colors " +
                (current === c.slug
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground")
              }
            >
              Stroke vs {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
