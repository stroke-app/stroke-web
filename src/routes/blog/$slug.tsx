import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ClockIcon,
  HelpCircleIcon,
  Share2Icon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";
import { useState } from "react";

import { Markdown } from "#/components/markdown";
import { Eyebrow, PageShell, siteButton, WRAP } from "#/components/page";
import type { BlogFaq, BlogPost } from "#/lib/blog";
import { getPostBySlug, getRelatedPosts } from "#/lib/blog";
import { articleSchema, faqPageSchema, seo } from "#/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  beforeLoad: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
  },
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
    const related = getRelatedPosts(params.slug, 2);
    return { post, related };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.post) return {};
    const { post } = loaderData;
    const path = `/blog/${post.slug}`;

    return seo({
      title: `${post.title} · Stroke Blog`,
      description: post.description,
      path,
      type: "article",
      keywords: post.keywords,
      articleMeta: {
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt,
        author: post.author.name,
        section: post.category,
        tags: post.keywords,
      },
      breadcrumbs: [
        { name: "Blog", path: "/blog" },
        { name: post.title, path },
      ],
      schema: [
        articleSchema({
          path,
          title: post.title,
          description: post.description,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
          author: post.author,
          keywords: post.keywords,
          section: post.category,
        }),
        faqPageSchema(post.faqs),
      ],
    });
  },
  component: BlogPostPage,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 transition-colors">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 text-left font-medium text-foreground"
        aria-expanded={open}
      >
        <span className="text-[16px] leading-snug">{question}</span>
        <ChevronDownIcon
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{answer}</p>}
    </div>
  );
}

function BlogPostPage() {
  const { post, related } = Route.useLoaderData();

  return (
    <PageShell>
      <article className={WRAP}>
        {/* Breadcrumb / Back link */}
        <div className="pt-10 pb-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" />
            Back to all guides & articles
          </Link>
        </div>

        {/* Article Header */}
        <header className="border-b border-white/[0.08] pb-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-md border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] font-medium text-foreground">
              {post.category}
            </span>
            <span className="text-[12px] text-muted-foreground">•</span>
            <span className="flex items-center gap-1 text-[13px] text-muted-foreground">
              <CalendarIcon className="size-3.5 text-faint" />
              Published {formatDate(post.publishedAt)}
            </span>
            <span className="text-[12px] text-muted-foreground">•</span>
            <span className="flex items-center gap-1 text-[13px] text-muted-foreground">
              <ClockIcon className="size-3.5 text-faint" />
              {post.readingTime}
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-[32px] font-bold tracking-[-0.02em] text-foreground sm:text-[40px] sm:leading-[1.18]">
            {post.title}
          </h1>

          <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-soft">{post.description}</p>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/[0.06] pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-foreground">
                <UserIcon className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[14px] font-medium text-foreground">{post.author.name}</p>
                <p className="text-[12px] text-muted-foreground">{post.author.role}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  void navigator.clipboard.writeText(window.location.href);
                }
              }}
              className={siteButton({ variant: "ghost", size: "sm" })}
              title="Copy article link"
            >
              <Share2Icon className="size-3.5" />
              Share
            </button>
          </div>
        </header>

        {/* BLUF (Bottom Line Up Front) Summary Box */}
        <section
          aria-label="Key Takeaways"
          className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-950/[0.15] p-6 md:p-8"
        >
          <div className="flex items-center gap-2 text-emerald-400">
            <SparklesIcon className="size-4" />
            <span className="text-[12px] font-semibold tracking-wider uppercase">
              Key Takeaways & Quick Conclusion (BLUF)
            </span>
          </div>

          <p className="mt-3 text-[15px] leading-relaxed font-medium text-emerald-100">
            {post.bluf}
          </p>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {post.keyTakeaways.map((takeaway: string, i: number) => (
              <div
                key={i}
                className="flex items-start gap-2.5 text-[13px] leading-relaxed text-emerald-200/90"
              >
                <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                <span>{takeaway}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Article Body */}
        <div className="mt-10 max-w-none">
          <Markdown text={post.content} />
        </div>

        {/* Interactive FAQ Section */}
        {post.faqs && post.faqs.length > 0 && (
          <section className="mt-16 border-t border-white/[0.08] pt-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HelpCircleIcon className="size-4 text-faint" />
              <Eyebrow>Frequently Asked Questions</Eyebrow>
            </div>
            <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.01em] text-foreground">
              Direct Answers to Common Queries
            </h2>
            <div className="mt-6 space-y-3">
              {post.faqs.map((faq: BlogFaq, i: number) => (
                <FaqItem key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </section>
        )}

        {/* Author Bio Box */}
        <div className="mt-14 rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 sm:flex sm:items-center sm:gap-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05]">
            <UserIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="mt-4 sm:mt-0">
            <p className="text-[15px] font-semibold text-foreground">
              Written by {post.author.name}
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {post.author.role} at Stroke. Passionate about local-first systems architecture,
              database internals, and zero-telemetry developer tooling.
            </p>
          </div>
        </div>

        {/* Related Posts (Topic Silo) */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-white/[0.08] pt-12">
            <Eyebrow>Keep Reading</Eyebrow>
            <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.01em] text-foreground">
              Related Guides & Comparisons
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {related.map((rel: BlogPost) => (
                <Link
                  key={rel.slug}
                  to="/blog/$slug"
                  params={{ slug: rel.slug }}
                  className="group block rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 transition-all hover:border-white/20 hover:bg-white/[0.035]"
                >
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {rel.category}
                  </span>
                  <h3 className="mt-2 text-[16px] leading-snug font-semibold text-foreground group-hover:underline">
                    {rel.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                    {rel.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-foreground">
                    Read article
                    <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA Banner */}
        <div className="mt-16 mb-24 rounded-2xl border border-white/[0.08] bg-gradient-to-r from-white/[0.03] to-white/[0.01] p-8 text-center sm:p-10">
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] sm:text-[26px]">
            Ready to experience Stroke on your machine?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            Free to test with no account. Connect to Postgres, SQLite, MySQL, DuckDB, or ClickHouse
            in seconds.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/download" className={siteButton({ size: "md" })}>
              Download Stroke
            </Link>
            <Link to="/pricing" className={siteButton({ variant: "secondary", size: "md" })}>
              View Pricing ($9.99 Once)
            </Link>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
