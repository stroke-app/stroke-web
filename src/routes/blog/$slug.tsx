import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { BlogWidget } from "#/components/blog-widgets";
import { Markdown } from "#/components/markdown";
import { GUTTER, PageShell } from "#/components/page";
import { POSTS, postBySlug } from "#/lib/blog";
import { formatReleaseDate } from "#/lib/releases";
import { seo, SITE_URL } from "#/lib/seo";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    if (!postBySlug(params.slug)) throw notFound();
    return { slug: params.slug };
  },
  head: ({ params }) => {
    const p = postBySlug(params.slug);
    if (!p) return {};
    return seo({
      title: `${p.title} · Stroke blog`,
      description: p.description,
      path: `/blog/${p.slug}`,
      breadcrumbs: [
        { name: "Blog", path: "/blog" },
        { name: p.title, path: `/blog/${p.slug}` },
      ],
      schema: [
        {
          "@type": "BlogPosting",
          headline: p.title,
          description: p.description,
          datePublished: p.date,
          url: `${SITE_URL}/blog/${p.slug}`,
          author: { "@type": "Person", name: "broisnees", url: "https://github.com/broisnees" },
        },
      ],
    });
  },
  component: PostPage,
});

/** Reading type for posts: larger body, real section headings. */
const ARTICLE =
  "text-[17px] leading-[1.75] [&_h3]:pt-6 [&_h3]:text-[1.375rem] [&_h3]:leading-tight [&_h3]:font-semibold [&_h3]:tracking-[-0.02em] [&_h3]:text-foreground [&_h3]:after:hidden [&_h4]:text-[17px]";

function PostPage() {
  const { slug } = Route.useLoaderData();
  const p = postBySlug(slug)!;
  const more = POSTS.filter((x) => x.slug !== p.slug).slice(0, 3);
  return (
    <PageShell>
      <article>
        <header className={cn(GUTTER, "pt-14 pb-12 md:pt-20 md:pb-14")}>
          <div className="mx-auto max-w-[44rem]">
            <Link
              to="/blog"
              className="group inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeftIcon className="size-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
              Blog
            </Link>
            <h1 className="mt-6 text-[2.25rem] text-balance md:text-[3rem]">{p.title}</h1>
            <p className="mt-5 text-[18px] leading-[1.55] text-pretty text-muted-foreground">
              {p.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-[13px] text-muted-foreground tabular-nums">
              <img
                src="https://github.com/broisnees.png?size=64"
                alt=""
                width={28}
                height={28}
                className="size-7 rounded-full bg-muted"
              />
              <span className="text-foreground">broisnees</span>
              <span aria-hidden="true" className="text-faint">
                ·
              </span>
              <time dateTime={p.date}>{formatReleaseDate(p.date)}</time>
              <span aria-hidden="true" className="text-faint">
                ·
              </span>
              {p.minutes} min read
            </div>
          </div>
        </header>
        <div className={cn(GUTTER, "border-t border-border py-12 md:py-16")}>
          <div className="mx-auto max-w-[44rem]">
            {/* A line holding only {{name}} places an interactive widget. */}
            {p.body
              .split(/^\{\{([a-z-]+)\}\}$/m)
              .map((part, i) =>
                i % 2 ? (
                  <BlogWidget key={i} name={part} />
                ) : part.trim() ? (
                  <Markdown key={i} text={part} className={ARTICLE} />
                ) : null,
              )}
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section aria-labelledby="more-title" className="border-t border-border">
          <h2
            id="more-title"
            className={cn(
              GUTTER,
              "pt-12 pb-6 text-[15px] font-medium tracking-normal text-muted-foreground",
            )}
          >
            More from the blog
          </h2>
          <ul className="grid grid-cols-1 gap-px border-t border-border bg-border md:grid-cols-3">
            {more.map((m) => (
              <li key={m.slug} className="bg-background">
                <Link
                  to="/blog/$slug"
                  params={{ slug: m.slug }}
                  className="group flex h-full flex-col p-7 transition-colors duration-150 hover:bg-ink/[0.03]"
                >
                  <time
                    dateTime={m.date}
                    className="text-[13px] text-muted-foreground tabular-nums"
                  >
                    {formatReleaseDate(m.date)}
                  </time>
                  <h3 className="mt-3 text-[1.125rem] leading-snug tracking-[-0.02em] text-balance">
                    {m.title}
                  </h3>
                  <ArrowRightIcon className="mt-auto size-4 pt-0 text-muted-foreground transition-[color,translate] duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageShell>
  );
}
