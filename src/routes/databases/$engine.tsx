import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeftIcon, CheckIcon } from "lucide-react";

import { SmartDownloadButton } from "#/components/download-button";
import { GUTTER, PageShell, Panel, siteButton } from "#/components/page";
import { CATEGORY_LABEL, engineBySlug, ENGINES } from "#/lib/engines";
import { seo } from "#/lib/seo";
import { cn } from "#/lib/utils";

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

/** The real screen closest to each kind of database. */
const SHOT: Record<string, { src: string; alt: string }> = {
  relational: { src: "/shots/table.webp", alt: "A table open in Stroke's grid" },
  document: { src: "/shots/mongo.webp", alt: "A MongoDB collection shown as a grid" },
  "key-value": { src: "/shots/redis-keys.webp", alt: "Redis keys in Stroke" },
  analytics: { src: "/shots/chart-bar.webp", alt: "A query result drawn as a bar chart" },
  search: { src: "/shots/multi-result.webp", alt: "Query results in their own tabs" },
};

function EnginePage() {
  const { slug } = Route.useLoaderData();
  const e = engineBySlug(slug)!;
  const others = ENGINES.filter((x) => x.slug !== e.slug && x.status !== "soon")
    .sort((a, b) => Number(b.category === e.category) - Number(a.category === e.category))
    .slice(0, 6);
  const shot = SHOT[e.category] ?? SHOT.relational!;
  const highlights = [
    ...e.highlights,
    `Ask the built-in AI about your ${e.name} data in plain words; it reads the schema first and asks before anything destructive`,
  ];

  return (
    <PageShell>
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_70%_at_20%_0%,black,transparent)]"
        />
        <div className={cn(GUTTER, "pt-14 pb-12 md:pt-20 md:pb-16")}>
          <Link
            to="/databases"
            className="group inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
            All databases
          </Link>
          <div className="mt-8 flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-[24px] bg-card bg-ink/[0.06]">
              <e.Icon className="size-7" color={e.color} aria-hidden="true" />
            </span>
            <span className="text-[14px] text-muted-foreground">
              {CATEGORY_LABEL[e.category]} database
              {e.status === "beta" ? " · Beta" : e.status === "soon" ? " · Coming soon" : ""}
            </span>
          </div>
          <h1 className="mt-6 max-w-3xl text-[2.375rem] text-balance md:text-[3.25rem]">
            {e.searchTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-[1.6] text-pretty text-muted-foreground">
            {e.summary}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <SmartDownloadButton size="lg" variant="default" alternates={false} />
            <Link to="/pricing" className={siteButton({ variant: "secondary", size: "lg" })}>
              See pricing
            </Link>
          </div>
        </div>
        <div className={GUTTER}>
          <Panel className="aspect-[16/8] rounded-b-none">
            <img
              src={shot.src}
              alt={shot.alt}
              className="block h-full w-full object-cover object-top-left"
            />
          </Panel>
        </div>
      </section>

      <section aria-labelledby="what" className="border-t border-border">
        <div className={cn(GUTTER, "pt-16 pb-8 md:pt-20")}>
          <h2 id="what" className="text-[1.75rem] md:text-[2.25rem]">
            What you can do with {e.name}
          </h2>
        </div>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {highlights.map((h) => (
            <li
              key={h}
              className="flex gap-3.5 rounded-[24px] bg-card p-6 text-[15px] leading-relaxed text-pretty text-soft md:p-8"
            >
              <CheckIcon
                className="mt-1 size-4 shrink-0 text-muted-foreground"
                strokeWidth={2}
                aria-hidden="true"
              />
              {h}
            </li>
          ))}
          {highlights.length % 2 === 1 && (
            <li aria-hidden="true" className="hidden bg-background md:block" />
          )}
        </ul>
      </section>

      <section aria-labelledby="connect" className="border-t border-border">
        <div
          className={cn(
            GUTTER,
            "grid grid-cols-1 gap-10 py-16 md:py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16",
          )}
        >
          <div>
            <h2 id="connect" className="text-[1.75rem] md:text-[2.25rem]">
              Connect to {e.name}
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-muted-foreground">
              Three ways in. Credentials stay in your OS keychain, never on our servers.
            </p>
          </div>
          <ol className="divide-y divide-border border-y border-border">
            {e.connect.map((c, i) => (
              <li
                key={c}
                className="flex gap-4 py-5 text-[15px] leading-relaxed text-pretty text-soft"
              >
                <span className="font-mono text-[13px] text-faint tabular-nums">0{i + 1}</span>
                {c}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {others.length > 0 && (
        <section aria-labelledby="also" className="border-t border-border">
          <h2
            id="also"
            className={cn(
              GUTTER,
              "pt-12 pb-6 text-[15px] font-medium tracking-normal text-muted-foreground",
            )}
          >
            Also in Stroke
          </h2>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
            {others.map((o) => (
              <li key={o.slug} className="rounded-[24px] bg-card">
                <Link
                  to="/databases/$engine"
                  params={{ engine: o.slug }}
                  className="group flex h-24 flex-col items-center justify-center gap-2.5 text-[13px] text-muted-foreground transition-colors duration-150 hover:bg-ink/[0.03] hover:text-foreground"
                >
                  <o.Icon className="size-6" color={o.color} aria-hidden="true" />
                  {o.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageShell>
  );
}
