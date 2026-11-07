---
name: seo-audit
description: >-
  Comprehensive SEO audit, diagnostics, and site health inspection engine. Use this skill to run
  a complete 100-point technical, on-page, and AI search audit, diagnose organic traffic drops,
  identify indexing anomalies, and run automated local or remote page checks.
---

# Comprehensive SEO Audit & Diagnostic Engine

Use this skill to perform rigorous, professional SEO audits on any website or repository. A comprehensive audit examines the technical baseline, content depth, structured data, link graph, and generative AI search readiness.

---

## 1. The 100-Point Master SEO Audit Checklist

### Category 1: Crawlability & Indexability (Weight: 25%)

- [ ] `robots.txt` is valid, accessible at root domain, and does not block critical CSS/JS assets.
- [ ] AI crawler user-agents (`GPTBot`, `PerplexityBot`, `ClaudeBot`) are explicitly permitted.
- [ ] XML Sitemap exists at `/sitemap.xml`, contains only 200 OK canonical URLs, and is registered in Google Search Console.
- [ ] Every indexable page features an explicit self-referential canonical tag.
- [ ] Zero internal 404 links or broken redirects (no `301 -> 301` chains).
- [ ] Parameterized URLs, search results, and admin routes include `noindex, follow` tags.

### Category 2: Performance & Core Web Vitals (Weight: 20%)

- [ ] Largest Contentful Paint (LCP) is ≤ 2.5s on mobile devices.
- [ ] Hero image has high fetch priority: `<link rel="preload" as="image" fetchpriority="high">`.
- [ ] Interaction to Next Paint (INP) is ≤ 200ms with zero long tasks (>50ms) blocking main thread.
- [ ] Cumulative Layout Shift (CLS) is ≤ 0.1; all images and embeds have explicit `width` and `height`.
- [ ] Time to First Byte (TTFB) is ≤ 800ms globally via edge CDN caching.
- [ ] Text assets (HTML, CSS, JS, SVG) are compressed with Brotli or Gzip.

### Category 3: On-Page & Semantic Content (Weight: 20%)

- [ ] Title tags are 50–60 characters, front-loaded with target keyword, and unique per page.
- [ ] Meta descriptions are 140–160 characters, include target entity terms, and feature an actionable CTA.
- [ ] Exactly one `<h1>` per page, accurately reflecting search intent.
- [ ] Strict heading hierarchy (`h1` -> `h2` -> `h3`) with zero skipped levels.
- [ ] All `<img>` tags possess contextually descriptive `alt` attributes.
- [ ] Social Open Graph (`og:title`, `og:description`, `og:image`) and Twitter Card tags are present.

### Category 4: Generative Engine Optimization (GEO) & AI Search (Weight: 15%)

- [ ] `llms.txt` is deployed at domain root and listed in `robots.txt`.
- [ ] Key informational pages employ BLUF: Direct answer defined in opening 1–2 sentences.
- [ ] Passage independence: Subheaders can be extracted by LLMs without missing contextual pronouns.
- [ ] Statistical density: At least 1 verifiable benchmark, metric, or data point per 500 words.
- [ ] Comparative markdown/HTML tables used for commercial evaluation queries.

### Category 5: Structured Data & Schema.org (Weight: 10%)

- [ ] Valid JSON-LD markup implemented for `Organization`, `WebSite`, and `BreadcrumbList`.
- [ ] Content pages include `BlogPosting` or `Article` with named author and date timestamps.
- [ ] FAQ sections include compliant `FAQPage` schema.
- [ ] Zero syntax errors when tested against Google Rich Results validator.

### Category 6: Internal Link Graph & Architecture (Weight: 10%)

- [ ] Zero orphan pages (every indexable page has at least 3 incoming internal links).
- [ ] Maximum click depth is ≤ 3 clicks from homepage for all critical money pages.
- [ ] Descriptive anchor text used exclusively (zero generic "click here" or "learn more" anchors).
- [ ] Topical silo integrity: Cluster pages link upward to their parent Pillar page.

---

## 2. Running Automated Audits via CLI

You can run automated audits locally using the built-in SEOAnything CLI across HTML, Next.js, React, Astro, Vue, Svelte, and Markdown:

```bash
# Audit a local repository or Next.js / React project
npx seoanything audit .

# Audit a specific Next.js page or component
npx seoanything audit ./app/blog/[slug]/page.tsx

# Audit a specific production page or URL
npx seoanything audit https://example.com/blog/guide
```

### Full Modern Framework Support:

- **Next.js (App & Pages Router)**: Detects `metadata`, `generateMetadata()`, `<Image priority>`, `app/robots.ts`, and `app/sitemap.ts`.
- **TanStack Start**: Detects `createFileRoute` / `createRootRoute` with `head()` (parsing `meta`, `links: [{ rel: 'canonical' }]`, and `scripts: [{ type: 'application/ld+json' }]`).
- **Astro**: Inspects `.astro` frontmatter, `<SEO />` component attributes, and `astro:assets` `<Image loading="eager" />` for LCP optimization.
- **Remix & React Router v7**: Inspects `export const meta: MetaFunction = () => [...]` (title, description, canonical link objects).
- **Nuxt 3**: Inspects `useSeoMeta()`, `useHead()`, and `<NuxtImg priority />` composables and components.
- **SvelteKit**: Inspects `<svelte:head>` blocks containing titles, descriptions, and canonical links.

---

## 3. SEO Diagnostic Scorecard & Grade System

When delivering an audit report to a stakeholder, summarize the score:

| Overall Score | Health Status       | Priority Action                                                                                  |
| :------------ | :------------------ | :----------------------------------------------------------------------------------------------- |
| **90 – 100**  | Grade A (Elite)     | Maintain topical fresh updates, expand cluster breadth, execute Digital PR.                      |
| **75 – 89**   | Grade B (Healthy)   | Optimize Core Web Vitals (INP/LCP), expand schema coverage, refine internal anchor text.         |
| **50 – 74**   | Grade C (Deficient) | Fix canonical loops, resolve missing title/meta tags, eliminate orphan pages.                    |
| **< 50**      | Grade F (Critical)  | Emergency intervention: Verify robots.txt, fix broken rendering, remove accidental noindex tags. |
