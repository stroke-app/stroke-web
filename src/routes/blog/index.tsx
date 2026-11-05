import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon, CalendarIcon, ClockIcon, SparklesIcon, TagIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Eyebrow, PageHeader, PageShell, siteButton, WRAP } from "#/components/page";
import { getAllCategories, getAllPosts } from "#/lib/blog";
import { seo } from "#/lib/seo";

export const Route = createFileRoute("/blog/")({
  head: () =>
    seo({
      title: "Blog & Technical Guides · Stroke Database Client",
      description:
        "Deep dives into database client architecture, Model Context Protocol (MCP) for AI agents, performance benchmarks (Stroke vs TablePlus vs DBeaver), and modern DuckDB/SQLite workflows.",
      path: "/blog",
      breadcrumbs: [{ name: "Blog", path: "/blog" }],
    }),
  component: BlogIndexPage,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function BlogIndexPage() {
  const posts = useMemo(() => getAllPosts(), []);
  const categories = useMemo(() => ["All", ...getAllCategories()], []);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "All") return posts;
    return posts.filter((p) => p.category === selectedCategory);
  }, [posts, selectedCategory]);

  const featuredPost = useMemo(() => posts.find((p) => p.featured), [posts]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Blog"
        title="Engineering, Benchmarks & Guides"
        description="Architecture deep-dives, Model Context Protocol (MCP) integrations, honest tool comparisons, and best practices for querying Postgres, DuckDB, SQLite, and ClickHouse."
      />

      <div className={WRAP}>
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-6">
          <span className="mr-2 flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
            <TagIcon className="size-3.5" />
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={siteButton({
                variant: selectedCategory === cat ? "primary" : "ghost",
                size: "sm",
              })}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Post Hero */}
        {selectedCategory === "All" && featuredPost && (
          <div className="mt-8">
            <Link
              to="/blog/$slug"
              params={{ slug: featuredPost.slug }}
              className="group block rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.04] md:p-8"
            >
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                  <SparklesIcon className="size-3" />
                  Featured Comparison
                </span>
                <span className="text-[12px] text-muted-foreground">•</span>
                <span className="text-[12px] text-muted-foreground">{featuredPost.category}</span>
              </div>

              <h2 className="mt-4 text-[22px] font-semibold tracking-[-0.02em] text-foreground transition-colors group-hover:text-white md:text-[26px]">
                {featuredPost.title}
              </h2>

              <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
                {featuredPost.bluf}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-4">
                <div className="flex items-center gap-4 text-[13px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="size-3.5 text-faint" />
                    {formatDate(featuredPost.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ClockIcon className="size-3.5 text-faint" />
                    {featuredPost.readingTime}
                  </span>
                  <span>By {featuredPost.author.name}</span>
                </div>

                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground group-hover:underline">
                  Read complete analysis
                  <ArrowRightIcon className="size-3.5 transition-transform duration-150 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Posts Grid */}
        <div className="mt-10 grid gap-6 pb-24 md:grid-cols-2 lg:grid-cols-2">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.035]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] font-medium text-foreground">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    <ClockIcon className="size-3 text-faint" />
                    {post.readingTime}
                  </div>
                </div>

                <h3 className="mt-4 text-[18px] leading-snug font-semibold tracking-[-0.01em] text-foreground">
                  <Link to="/blog/$slug" params={{ slug: post.slug }} className="hover:underline">
                    {post.title}
                  </Link>
                </h3>

                <p className="mt-2.5 text-[14px] leading-relaxed text-muted-foreground">
                  {post.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
                <div className="text-[12px] text-muted-foreground">
                  <span>{formatDate(post.publishedAt)}</span>
                  <span className="mx-1.5">•</span>
                  <span>{post.author.name}</span>
                </div>

                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-foreground hover:underline"
                >
                  Read guide
                  <ArrowRightIcon className="size-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA Box */}
        <div className="mb-20 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-8 text-center md:p-12">
          <Eyebrow className="justify-center">Ready to test?</Eyebrow>
          <h2 className="mt-3 text-[24px] font-semibold tracking-[-0.02em] md:text-[28px]">
            Try Stroke free today. No account or credit card required.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Connect to Postgres, MySQL, SQLite, DuckDB, or ClickHouse with sub-120ms cold boots and
            built-in MCP agent support. Pay $9.99 once only if you love it.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/download" className={siteButton({ size: "lg" })}>
              Download for Mac, Windows & Linux
            </Link>
            <Link to="/docs/mcp" className={siteButton({ variant: "secondary", size: "lg" })}>
              MCP Setup Docs
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
