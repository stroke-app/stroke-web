import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Markdown } from "#/components/markdown";
import { NextLinks, PageBody, PageHeader, PageShell } from "#/components/page";
import { SponsorRail } from "#/components/sponsor-rail";
import { POSTS, postBySlug } from "#/lib/blog";
import { formatReleaseDate } from "#/lib/releases";
import { seo, SITE_URL } from "#/lib/seo";

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

function PostPage() {
  const { slug } = Route.useLoaderData();
  const p = postBySlug(slug)!;
  const more = POSTS.filter((x) => x.slug !== p.slug).slice(0, 3);
  return (
    <PageShell>
      <PageHeader
        eyebrow={
          <span className="tabular-nums">
            <time dateTime={p.date}>{formatReleaseDate(p.date)}</time> · {p.minutes} min read
          </span>
        }
        title={p.title}
        description={p.description}
      />
      <PageBody
        rail={<SponsorRail />}
        aside={
          more.length ? (
            <nav aria-label="More posts">
              <p className="text-xs font-medium text-faint">More posts</p>
              <ul className="mt-3 flex flex-col gap-2.5">
                {more.map((m) => (
                  <li key={m.slug}>
                    <Link
                      to="/blog/$slug"
                      params={{ slug: m.slug }}
                      className="text-[13px] leading-snug text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {m.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : undefined
        }
      >
        <article>
          <Markdown text={p.body} />
        </article>
        <NextLinks>
          <Link to="/blog">All posts</Link>
          <Link to="/databases">Supported databases</Link>
          <Link to="/download">Download Stroke</Link>
        </NextLinks>
      </PageBody>
    </PageShell>
  );
}
