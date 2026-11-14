import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon, CheckIcon } from "lucide-react";

import { SUPPORT_EMAIL } from "#/components/legal";
import { PageBody, PageHeader, PageShell, siteButton } from "#/components/page";
import { SponsorRail } from "#/components/sponsor-rail";
import { COMPETITORS, STROKE_EXTRAS, STROKE_FACTS } from "#/lib/competitors";
import { seo } from "#/lib/seo";

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

export function StrokeExtras() {
  return (
    <ul className="mt-5 flex flex-col gap-3">
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
          <Link to="/download" className={siteButton({ size: "md" })}>
            Try Stroke free
            <ArrowRightIcon className="size-4" />
          </Link>
        }
      />
      <PageBody rail={<SponsorRail />} aside={<CompareNav />} wide>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[56rem] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-white/[0.02]">
                <th scope="col" className="w-32 px-4 py-3 font-medium text-muted-foreground"></th>
                <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                  Stroke
                </th>
                {COMPETITORS.map((c) => (
                  <th key={c.slug} scope="col" className="px-4 py-3 font-medium">
                    <Link
                      to="/compare/$slug"
                      params={{ slug: c.slug }}
                      className="text-foreground/90 underline-offset-4 hover:underline"
                    >
                      {c.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.key} className="border-b border-border align-top last:border-0">
                  <th scope="row" className="px-4 py-3 font-medium text-muted-foreground">
                    {r.label}
                  </th>
                  <td className="bg-white/[0.03] px-4 py-3 text-foreground">
                    {STROKE_FACTS[r.key]}
                  </td>
                  {COMPETITORS.map((c) => (
                    <td key={c.slug} className="px-4 py-3 text-muted-foreground">
                      {c[r.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CompareNote />

        <section aria-labelledby="extras" className="mt-16 max-w-3xl">
          <h2 id="extras" className="text-xl font-semibold tracking-[-0.01em]">
            In Stroke
          </h2>
          <StrokeExtras />
        </section>
      </PageBody>
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
