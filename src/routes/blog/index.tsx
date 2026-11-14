import { createFileRoute, Link } from "@tanstack/react-router";

import { PageBody, PageHeader, PageShell } from "#/components/page";
import { SponsorRail } from "#/components/sponsor-rail";
import { POSTS } from "#/lib/blog";
import { formatReleaseDate } from "#/lib/releases";
import { seo } from "#/lib/seo";

export const Route = createFileRoute("/blog/")({
  head: () =>
    seo({
      title: "Blog · Stroke database client",
      description:
        "Guides and notes on databases from the developer of Stroke: Oracle on a Mac, local databases in Docker, AI agents and your data.",
      path: "/blog",
      breadcrumbs: [{ name: "Blog", path: "/blog" }],
    }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Blog"
        title="Notes on databases"
        description="Guides from building Stroke: what works, what trips people up, and how to skip the parts that don't matter."
      />
      <PageBody rail={<SponsorRail />} aside={<span />}>
        <ul className="flex flex-col divide-y divide-border">
          {POSTS.map((p) => (
            <li key={p.slug}>
              <Link
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group block py-7 first:pt-0"
              >
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground tabular-nums">
                  <time dateTime={p.date}>{formatReleaseDate(p.date)}</time>
                  <span aria-hidden="true">·</span>
                  {p.minutes} min read
                  {p.tags.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-border px-2 py-px text-[11px]"
                    >
                      {t}
                    </span>
                  ))}
                </p>
                <h2 className="mt-2.5 text-[1.375rem] font-semibold tracking-[-0.015em] text-balance transition-colors group-hover:text-white">
                  {p.title}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-pretty text-muted-foreground">
                  {p.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </PageBody>
    </PageShell>
  );
}
