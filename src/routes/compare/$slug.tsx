import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { NextLinks, PageBody, PageHeader, PageShell, siteButton } from "#/components/page";
import { competitorBySlug, STROKE_FACTS } from "#/lib/competitors";
import { faqPage, seo } from "#/lib/seo";

import { CompareNav, CompareNote, StrokeExtras } from "./index";

export const Route = createFileRoute("/compare/$slug")({
  loader: ({ params }) => {
    if (!competitorBySlug(params.slug)) throw notFound();
    return { slug: params.slug };
  },
  head: ({ params }) => {
    const c = competitorBySlug(params.slug);
    if (!c) return {};
    return seo({
      title: `Stroke vs ${c.name}: a ${c.searchTitle} · Stroke`,
      description: `Stroke and ${c.name} side by side: what each is built on, where it runs and what it costs, and what Stroke adds, from AI and MCP to Docker and encrypted sync.`,
      path: `/compare/${c.slug}`,
      breadcrumbs: [
        { name: "Compare", path: "/compare" },
        { name: `Stroke vs ${c.name}`, path: `/compare/${c.slug}` },
      ],
      schema: [
        faqPage([
          {
            q: `Is Stroke a good ${c.name} alternative?`,
            a: `Stroke: ${STROKE_FACTS.runtime}, on ${STROKE_FACTS.platforms}, with an AI agent and a built-in MCP server. ${c.name}: ${c.runtime}, on ${c.platforms}. ${c.name} suits ${c.goodFor.charAt(0).toLowerCase()}${c.goodFor.slice(1)}`,
          },
          {
            q: `How much does Stroke cost compared with ${c.name}?`,
            a: `Stroke: ${STROKE_FACTS.pricing}. ${c.name}: ${c.pricing}.`,
          },
          {
            q: `What does ${c.name} need before it opens a database, and what does Stroke need?`,
            a: `${c.name}: ${c.needs}. Stroke: ${STROKE_FACTS.needs}.`,
          },
        ]),
      ],
    });
  },
  component: VsPage,
});

const ROWS = [
  { label: "Built on", key: "runtime" },
  { label: "Runs on", key: "platforms" },
  { label: "Price", key: "pricing" },
  { label: "Needs first", key: "needs" },
] as const;

function VsPage() {
  const { slug } = Route.useLoaderData();
  const c = competitorBySlug(slug)!;
  return (
    <PageShell>
      <PageHeader
        eyebrow={`${c.searchTitle}`}
        title={`Stroke vs ${c.name}`}
        description={`Both open your databases. Here is how they differ, and when ${c.name} may be the better pick.`}
        actions={
          <Link to="/download" className={siteButton({ size: "lg" })}>
            Try Stroke free
            <ArrowRightIcon className="size-4" />
          </Link>
        }
      />
      <PageBody aside={<CompareNav current={c.slug} />}>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full border-collapse text-left text-[14px]">
            <thead>
              <tr className="border-b border-border bg-ink/[0.02]">
                <th scope="col" className="w-36 px-4 py-3"></th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Stroke
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  {c.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.key} className="border-b border-border align-top last:border-0">
                  <th scope="row" className="px-4 py-3 font-medium text-muted-foreground">
                    {r.label}
                  </th>
                  <td className="bg-ink/[0.03] px-4 py-3">{STROKE_FACTS[r.key]}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c[r.key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CompareNote />

        <section aria-labelledby="extras" className="mt-14">
          <h2 id="extras" className="text-xl font-semibold tracking-[-0.01em]">
            What Stroke adds
          </h2>
          <StrokeExtras columns={1} className="mt-5" />
        </section>

        <section aria-labelledby="fit" className="mt-14">
          <h2 id="fit" className="text-xl font-semibold tracking-[-0.01em]">
            When {c.name} may suit you better
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-pretty text-foreground/90">
            {c.goodFor}
          </p>
        </section>

        <NextLinks>
          <Link to="/compare">All comparisons</Link>
          <Link to="/databases">Supported databases</Link>
          <Link to="/pricing">Pricing</Link>
        </NextLinks>
      </PageBody>
    </PageShell>
  );
}
