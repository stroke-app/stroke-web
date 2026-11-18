import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import { useState } from "react";

import { GUTTER, PageHeader, PageShell } from "#/components/page";
import { POSTS, type Post } from "#/lib/blog";
import { formatReleaseDate } from "#/lib/releases";
import { seo } from "#/lib/seo";
import { cn } from "#/lib/utils";

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

function Meta({ post, className }: { post: Post; className?: string }) {
  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground tabular-nums",
        className,
      )}
    >
      <time dateTime={post.date}>{formatReleaseDate(post.date)}</time>
      <span aria-hidden="true" className="text-faint">
        ·
      </span>
      {post.minutes} min read
    </p>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {tags.slice(0, 3).map((t) => (
        <span key={t} className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[12px] text-soft">
          {t}
        </span>
      ))}
    </span>
  );
}

function BlogIndex() {
  const tags = [...new Set(POSTS.flatMap((p) => p.tags))].sort();
  const [tag, setTag] = useState<string | null>(null);
  const shown = tag ? POSTS.filter((p) => p.tags.includes(tag)) : POSTS;
  const [lead, ...rest] = shown;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Blog"
        title="Notes on databases."
        description="Guides from building Stroke: what works, what trips people up, and how to skip the parts that don't matter."
      />

      {tags.length > 1 && (
        <div
          className={cn(GUTTER, "flex flex-wrap gap-2 pb-8")}
          role="group"
          aria-label="Filter by topic"
        >
          {[null, ...tags].map((t) => (
            <button
              key={t ?? "all"}
              type="button"
              aria-pressed={tag === t}
              onClick={() => setTag(t)}
              className={cn(
                "h-8 rounded-full px-3.5 text-[13px] transition-colors duration-150",
                tag === t
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground shadow-[0_0_0_1px_var(--border)_inset] hover:text-foreground",
              )}
            >
              {t ?? "All posts"}
            </button>
          ))}
        </div>
      )}

      {lead && (
        <Link
          to="/blog/$slug"
          params={{ slug: lead.slug }}
          className="group block border-t border-border transition-colors duration-150 hover:bg-ink/[0.02]"
        >
          <article
            className={cn(
              GUTTER,
              "grid grid-cols-1 gap-6 py-12 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-14 md:py-16",
            )}
          >
            <div>
              <p className="text-[13px] font-medium text-copper">Latest</p>
              <h2 className="mt-3 text-[1.875rem] text-balance md:text-[2.5rem]">{lead.title}</h2>
            </div>
            <div className="flex flex-col justify-end gap-5">
              <p className="text-[16px] leading-[1.6] text-pretty text-muted-foreground">
                {lead.description}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Meta post={lead} />
                <Tags tags={lead.tags} />
              </div>
              <span className="inline-flex items-center gap-1.5 text-[14px] font-medium">
                Read the post
                <ArrowRightIcon className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
              </span>
            </div>
          </article>
        </Link>
      )}

      {rest.length > 0 && (
        <ul className="grid grid-cols-1 gap-px border-t border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <li key={p.slug} className="bg-background">
              <Link
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group flex h-full min-h-[240px] flex-col p-7 transition-colors duration-150 hover:bg-ink/[0.03] md:p-8"
              >
                <Meta post={p} />
                <h3 className="mt-4 text-[1.25rem] leading-snug tracking-[-0.02em] text-balance">
                  {p.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-[14px] leading-relaxed text-pretty text-muted-foreground">
                  {p.description}
                </p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                  <Tags tags={p.tags} />
                  <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-[color,translate] duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
              </Link>
            </li>
          ))}
          {/* Fill the last row, so the grid never ends on a gray gap. */}
          {Array.from({ length: (3 - (rest.length % 3)) % 3 }, (_, i) => (
            <li key={`f3-${i}`} aria-hidden="true" className="hidden bg-background lg:block" />
          ))}
          {rest.length % 2 === 1 && (
            <li aria-hidden="true" className="hidden bg-background md:block lg:hidden" />
          )}
        </ul>
      )}
    </PageShell>
  );
}
