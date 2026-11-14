import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRightIcon, CheckIcon } from "lucide-react";

import { NextLinks, PageBody, PageHeader, PageShell, siteButton } from "#/components/page";
import { SponsorRail } from "#/components/sponsor-rail";
import { CATEGORY_LABEL, engineBySlug, ENGINES } from "#/lib/engines";
import { seo } from "#/lib/seo";

import { DatabasesNav } from "./index";

export const Route = createFileRoute("/databases/$engine")({
  loader: ({ params }) => {
    const engine = engineBySlug(params.engine);
    if (!engine) throw notFound();
    return { slug: engine.slug };
  },
  head: ({ params }) => {
    const e = engineBySlug(params.engine);
    if (!e) return {};
    return seo({
      title: `${e.searchTitle} · Stroke`,
      description: e.summary,
      path: `/databases/${e.slug}`,
      breadcrumbs: [
        { name: "Databases", path: "/databases" },
        { name: e.name, path: `/databases/${e.slug}` },
      ],
      schema: [
        {
          "@type": "SoftwareApplication",
          name: "Stroke",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "macOS, Windows, Linux",
          description: e.summary,
          offers: { "@type": "Offer", price: "9.99", priceCurrency: "USD" },
        },
      ],
    });
  },
  component: EnginePage,
});

function EnginePage() {
  const { slug } = Route.useLoaderData();
  const e = engineBySlug(slug)!;
  const others = ENGINES.filter(
    (x) => x.category === e.category && x.slug !== e.slug && x.status !== "soon",
  ).slice(0, 4);
  return (
    <PageShell>
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-2">
            <e.Icon className="size-4" color={e.color} aria-hidden="true" />
            {CATEGORY_LABEL[e.category]} database{e.status === "soon" ? " · coming soon" : ""}
          </span>
        }
        title={e.searchTitle}
        description={e.summary}
        actions={
          <>
            <Link to="/download" className={siteButton({ size: "md" })}>
              Download Stroke
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link to="/compare" className={siteButton({ variant: "secondary", size: "md" })}>
              Compare with other clients
            </Link>
          </>
        }
      />
      <PageBody aside={<DatabasesNav current={e.slug} />} rail={<SponsorRail />}>
        <section aria-labelledby="what">
          <h2 id="what" className="text-xl font-semibold tracking-[-0.01em]">
            What you can do with {e.name}
          </h2>
          <ul className="mt-5 flex flex-col gap-3">
            {e.highlights.map((h) => (
              <li
                key={h}
                className="flex gap-3 text-[15px] leading-relaxed text-pretty text-foreground/90"
              >
                <CheckIcon className="mt-1 size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                {h}
              </li>
            ))}
            <li className="flex gap-3 text-[15px] leading-relaxed text-pretty text-foreground/90">
              <CheckIcon className="mt-1 size-4 shrink-0 text-emerald-400" aria-hidden="true" />
              Ask the built-in AI about your {e.name} data in plain words; it reads the schema first
              and asks before anything destructive
            </li>
          </ul>
        </section>

        <section aria-labelledby="connect" className="mt-14">
          <h2 id="connect" className="text-xl font-semibold tracking-[-0.01em]">
            Connect to {e.name}
          </h2>
          <ol className="mt-5 flex flex-col gap-3">
            {e.connect.map((c, i) => (
              <li
                key={c}
                className="flex gap-3 text-[15px] leading-relaxed text-pretty text-foreground/90"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs text-muted-foreground tabular-nums">
                  {i + 1}
                </span>
                {c}
              </li>
            ))}
          </ol>
        </section>

        {others.length > 0 && (
          <section aria-labelledby="also" className="mt-14">
            <h2 id="also" className="text-xl font-semibold tracking-[-0.01em]">
              Also in Stroke
            </h2>
            <ul className="mt-5 grid grid-cols-2 gap-2">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link
                    to="/databases/$engine"
                    params={{ engine: o.slug }}
                    className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
                  >
                    <o.Icon className="size-4" color={o.color} aria-hidden="true" />
                    {o.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <NextLinks>
          <Link to="/databases">All databases</Link>
          <Link to="/compare">Compare clients</Link>
          <Link to="/changelog">Changelog</Link>
        </NextLinks>
      </PageBody>
    </PageShell>
  );
}
