---
name: seo-master
description: >-
  The All-in-One Master SEO & GEO intelligence engine. Covers everything across all SEO disciplines
  (technical SEO, Core Web Vitals, keyword research, topical clusters, BLUF content, E-E-A-T,
  Generative Engine Optimization (GEO), JSON-LD schemas, internal link silos, programmatic SEO,
  and 100-point audits). Use this single master skill for any and all SEO tasks without needing
  to invoke individual specific sub-skills.
---

# Master SEO & GEO Intelligence Engine (All-in-One Playbook)

This is the **All-in-One Master SEO Skill** for **SEOAnything**. It contains the complete, actionable execution playbooks across all search disciplines. You can execute any SEO audit, technical fix, content creation, schema generation, internal linking overhaul, or Generative Engine Optimization (GEO) task directly from this single skill **without needing to invoke individual sub-skills**.

---

## Quick Navigation: The 8 Disciplines Covered

1. [The 5 Pillars of Modern Ranking & Triage](#1-the-5-pillars-of-ranking--triage)
2. [Technical SEO & Core Web Vitals (CWV)](#2-technical-seo--core-web-vitals-cwv)
3. [Keyword Research, Intent & Topical Clustering](#3-keyword-research-search-intent--topical-clustering)
4. [Content Architecture, BLUF & E-E-A-T](#4-content-architecture-bluf--e-e-a-t)
5. [Generative Engine Optimization (GEO) & AI Search](#5-generative-engine-optimization-geo--ai-search)
6. [Structured Data, JSON-LD & Entity Schema](#6-structured-data-json-ld--entity-schema)
7. [Internal Linking Silos & Backlink Acquisition](#7-internal-linking-silos--link-acquisition)
8. [Programmatic SEO (pSEO) & Scaled Pages](#8-programmatic-seo-pseo--scaled-architecture)
9. [100-Point Master SEO Audit & Health Scorecard](#9-100-point-master-seo-audit--scorecard)
10. [Emergency Protocol: Diagnosing Traffic Drops](#10-emergency-protocol-diagnosing-traffic-drops)

---

## 1. The 5 Pillars of Ranking & Triage

Modern search demands a dual-pronged strategy: dominating traditional organic search results (Google, Bing) while securing citations and recommendations in generative AI engines (Google AI Overviews, Perplexity, ChatGPT Search, Gemini, Claude).

```text
┌─────────────────────────────────────────────────────────────────┐
│                     THE 5 PILLARS OF RANKING                    │
├─────────────────┬──────────────────┬────────────────────────────┤
│ 1. Technical    │ Crawlability     │ Core Web Vitals, Robots,   │
│    Foundation   │ & Indexability   │ Sitemaps, SSR/SSG, Speed   │
├─────────────────┼──────────────────┼────────────────────────────┤
│ 2. Keyword &    │ Search Intent &  │ Pillar-Cluster Model, KD,  │
│    Topic Hubs   │ Information Arch │ Entities, Long-Tail Intent │
├─────────────────┼──────────────────┼────────────────────────────┤
│ 3. Content &    │ E-E-A-T &        │ BLUF Answering, First-Party│
│    Experience   │ Helpful Content  │ Insights, On-Page Anatomy  │
├─────────────────┼──────────────────┼────────────────────────────┤
│ 4. Authority &  │ Internal Link    │ PageRank Sculpting, Silos, │
│    Link Graph   │ & Backlink Graph │ Digital PR, Unlinked Brand │
├─────────────────┼──────────────────┼────────────────────────────┤
│ 5. AI Search    │ Generative Engine│ Statistical Density, LLMs, │
│    & GEO        │ Optimization     │ Schema, llms.txt, Citations│
└─────────────────┴──────────────────┴────────────────────────────┘
```

### 90-Day Execution Roadmap & Priority Triage

When optimizing or building a site, address issues in order of impact:

- **Stage 1: Critical Blockers (Days 0–7)**:
  1. Verify site is crawlable and indexable (`robots.txt`, no accidental `noindex`, 0 HTTP 5xx errors).
  2. Implement valid, self-referential canonical tags on all indexable pages.
  3. Ensure mobile responsiveness with `<meta name="viewport" content="width=device-width, initial-scale=1">`.
  4. Enforce HTTPS without mixed content or redirect loops.
  5. Deploy standard `sitemap.xml` and `llms.txt` to the root domain.
- **Stage 2: Content & On-Page Architecture (Weeks 2–4)**:
  1. Map 1 primary target keyword and 3–5 semantic entities per page.
  2. Apply **BLUF (Bottom Line Up Front)**: Answer the searcher's core query in the opening 1–2 sentences.
  3. Enforce strict heading hierarchy (exactly one `<h1>`, followed by logical `<h2>` and `<h3>` tags).
  4. Optimize title tags (< 60 chars), meta descriptions (< 160 chars), and descriptive image `alt` attributes.
  5. Inject rich JSON-LD structured data (`Article`, `Organization`, `FAQPage`, `BreadcrumbList`).
- **Stage 3: Topical Authority & Internal Linking Silos (Weeks 4–8)**:
  1. Build **Pillar & Cluster Topic Hubs**: One comprehensive master pillar page linked bi-directionally to 5–10 sub-topic cluster posts.
  2. Eradicate orphan pages; ensure every key page is reachable within 3 clicks of the homepage.
  3. Use descriptive, keyword-rich anchor text internally (prohibit generic "click here" or "read more").
- **Stage 4: Generative Engine Optimization (GEO) & Scale (Ongoing)**:
  1. Increase statistical density: Add verifiable metrics, comparison tables, and benchmark data.
  2. Format independent, self-contained sub-headers to maximize passage extraction by AI models.
  3. If scaling landing pages, enforce the **60/40 Unique Value Formula** to prevent thin-content penalties.

---

## 2. Technical SEO & Core Web Vitals (CWV)

Technical SEO ensures that search crawlers and AI bots can discover, render, understand, and index your website without friction or latency.

### 2.1 Core Web Vitals Benchmarks & Primary Fixes

Target the "Good" threshold for at least 75% of page visits:

| Metric                              | Threshold (Good)  | What It Measures                          | Primary Fixes                                                                                                                                                                                                                        |
| :---------------------------------- | :---------------- | :---------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LCP** (Largest Contentful Paint)  | **≤ 2.5 seconds** | Loading speed of the main content element | • Preload hero image: `<link rel="preload" as="image" href="..." fetchpriority="high">`<br>• Use modern formats (WebP, AVIF)<br>• Optimize TTFB (< 800ms) with edge CDN caching<br>• Inline critical CSS, defer non-critical scripts |
| **INP** (Interaction to Next Paint) | **≤ 200 ms**      | Responsiveness to user clicks/taps        | • Break long tasks (> 50ms) using `scheduler.yield()` or `requestAnimationFrame`<br>• Debounce input and scroll event listeners<br>• Avoid CPU-heavy client hydration on the main thread                                             |
| **CLS** (Cumulative Layout Shift)   | **≤ 0.1**         | Visual stability during page load         | • Always set explicit `width` and `height` (or `aspect-ratio`) on images/videos<br>• Reserve slot containers for dynamic ads or widgets<br>• Use `font-display: swap` with size-adjust fallback fonts                                |

### 2.2 Production `robots.txt` Specification

The `robots.txt` file must reside at the root domain (`https://example.com/robots.txt`):

```txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /checkout/
Disallow: /private/

# Explicitly allow AI search retrieval crawlers
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

# Sitemap Declarations
Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/sitemap-blog.xml
```

**Guardrails**:

- **NEVER** disallow CSS or JavaScript directories (`/assets/`, `/_next/`, `/static/`). Googlebot and Perplexity need CSS/JS to render the DOM.
- **NEVER** use `Disallow: /` on staging environments that share a database or when deploying to production.
- Use `robots.txt` to control crawl budget, NOT to hide sensitive data (use HTTP authentication or `noindex` headers).

### 2.3 Canonicalization Rules

Every indexable URL must have an explicit canonical link element in the `<head>`:

```html
<link rel="canonical" href="https://example.com/blog/technical-seo-guide" />
```

1. **Self-Referential Canonicals**: Every clean, canonical page must point to its exact self.
2. **Handle URL Parameters**: Strip tracking parameters (`?utm_source=...`, `?ref=...`, `?fbclid=...`) in the canonical target.
3. **HTTP vs HTTPS & WWW vs non-WWW**: Enforce 301 redirects to the chosen canonical protocol and subdomain.
4. **Trailing Slashes**: Enforce either trailing slash (`/page/`) or non-trailing slash (`/page`) consistently site-wide.

### 2.4 HTTP Status Codes & Redirects

- **200 OK**: Normal live indexable page.
- **301 Moved Permanently**: Passes ~99% of PageRank; search engines update their index. Use for permanent URL migrations.
- **302 Found (Temporary)**: Does NOT transfer full link equity; index retains original URL.
- **404 Not Found**: Dropped from index after repeated crawls.
- **410 Gone**: Dropped from index faster than 404. Use for intentional permanent deletions.
- **500 / 503 Server Error**: Crawler backs off; temporary 503 avoids ranking penalty during maintenance. Never leave 500s active.
- **Zero Redirect Chains**: Avoid chaining redirects (`A -> B -> C`). Always link directly to `C`.

### 2.5 Modern Framework Implementations

| Framework                | Metadata Pattern                                                               | LCP Hero Image Optimization                        | Sitemaps & Robots                                         |
| :----------------------- | :----------------------------------------------------------------------------- | :------------------------------------------------- | :-------------------------------------------------------- |
| **Next.js** (App Router) | `export const metadata: Metadata = { ... }`<br>or dynamic `generateMetadata()` | `<Image src="..." alt="..." priority />`           | `app/sitemap.ts`<br>`app/robots.ts`                       |
| **TanStack Start**       | `createFileRoute('/...')({ head: () => ({ meta: [...], links: [...] }) })`     | `<img src="..." alt="..." fetchpriority="high" />` | `app/routes/sitemap.xml.ts`<br>`app/routes/robots.txt.ts` |
| **Astro**                | Frontmatter variables or `<SEO title="..." description="..." />`               | `<Image src={...} alt="..." loading="eager" />`    | `@astrojs/sitemap` in `astro.config.mjs`                  |
| **Remix / React Router** | `export const meta: MetaFunction = () => [...]`                                | `<img src="..." alt="..." fetchpriority="high" />` | `app/routes/sitemap[.]xml.ts`                             |
| **Nuxt 3**               | `useSeoMeta({ title: '...', description: '...' })`                             | `<NuxtImg src="..." alt="..." priority />`         | `@nuxtjs/sitemap`<br>`@nuxtjs/robots`                     |
| **SvelteKit**            | `<svelte:head><title>...</title></svelte:head>`                                | `<img src="..." alt="..." loading="eager" />`      | `src/routes/sitemap.xml/+server.ts`                       |

**Framework Guardrails**:

- **Never ship empty initial HTML (CSR SPA Trap)**: Always use SSR or SSG for public pages.
- **Eliminate Hydration CLS**: Server-rendered markup must match client-rendered markup exactly.
- **Declare LCP Priorities**: Always mark the above-the-fold hero image with `priority` or `loading="eager"`.

### 2.6 Internationalization (`hreflang`)

When serving multilingual or regional audiences, implement bi-directional hreflang tags:

```html
<link rel="alternate" hreflang="en-us" href="https://example.com/us/pricing" />
<link rel="alternate" hreflang="en-gb" href="https://example.com/uk/pricing" />
<link rel="alternate" hreflang="es" href="https://example.com/es/precios" />
<link rel="alternate" hreflang="x-default" href="https://example.com/pricing" />
```

---

## 3. Keyword Research, Search Intent & Topical Clustering

Modern SEO has evolved from keyword stuffing into **Topical Authority** and **Entity Salience**. Search engines understand semantic relationships and reward comprehensive domain coverage.

### 3.1 The 4-Tier Search Intent Taxonomy

| Search Intent                | Query Modifiers / Examples                                   | Optimal Content Type                                          |
| :--------------------------- | :----------------------------------------------------------- | :------------------------------------------------------------ |
| **Informational**            | "how to", "what is", "guide", "examples", "benefits", "why"  | Deep-dive blog post, tutorial, definition, FAQ, documentation |
| **Commercial Investigation** | "best [x] for [y]", "vs", "alternatives", "review 2026"      | Comparison table, review, buyer's guide, benchmark data       |
| **Transactional**            | "buy", "pricing", "discount", "demo", "hire", "quote", "api" | Product page, pricing table, checkout, free trial signup      |
| **Navigational**             | "[Brand] login", "[Brand] app", "[Brand] docs"               | Dedicated portal or homepage                                  |

### 3.2 Pillar & Cluster (Hub & Spoke) Architecture

```text
                        ┌────────────────────────┐
                        │   MASTER PILLAR PAGE   │
                        │ "Complete Guide to GEO"│
                        └───────────┬────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
 ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐
 │   Cluster Page 1  │    │   Cluster Page 2  │    │   Cluster Page 3  │
 │ "llms.txt Setup"  │    │ "Perplexity Citations"│ "AI Overviews BLUF"│
 └─────────┬─────────┘    └─────────┬─────────┘    └─────────┬─────────┘
           │                        │                        │
           └────────────────────────┴────────────────────────┘
                    (Interlinked bi-directionally)
```

1. **Pillar Page**: Covers the broad topic at a high level (2,500–5,000 words). Links to each cluster page in relevant sections.
2. **Cluster Pages**: Deep-dive into specific long-tail questions (1,200–2,000 words).
3. **Cluster-to-Pillar Link**: Every cluster page **MUST** link back to the main Pillar page using the primary target keyword as anchor text.
4. **Cluster-to-Cluster Link**: Siblings link to each other when contextually relevant.

### 3.3 Keyword Prioritization Formula

$$\text{Opportunity Score} = \frac{\text{Search Volume} \times \text{Business Value (1-5)}}{\text{Keyword Difficulty (KD)} + 1}$$

- **Low-Hanging Fruit (KD 0–25, Volume 100–1,000)**: Publish precise, answer-first cluster articles. Ranks in 2–6 weeks to build domain momentum.
- **Core Growth (KD 25–50, Volume 1,000–10,000)**: Commercial comparison pages, interactive calculators, templates.
- **Trophy Targets (KD 50+, Volume 10,000+)**: Comprehensive pillar guides, definitive industry reports, proprietary research.

### 3.4 Entity Mapping & Semantic Salience

- **Subject Entity**: The core concept (e.g., `Next.js SEO`).
- **Parent Entity**: Overarching domain (e.g., `Full-stack Web Development`).
- **Sibling Entities**: Related frameworks (e.g., `Server-Side Rendering`, `Core Web Vitals`).
- **Co-Occurring Semantic Attributes**: `meta tags`, `generateMetadata`, `sitemap.ts`, `Open Graph`, `JSON-LD`.

### 3.5 Reverse-Engineering SERP Features

- **AI Overview Present**: Provide a direct 2-sentence definition in the opening paragraph. Use structured comparison tables and numbered steps.
- **Featured Snippet**: Answer in 40–50 words immediately following an H2 formatted with the query, or use `<ol>` / `<ul>` with bold prefixes.
- **People Also Ask (PAA)**: Extract top 4–6 questions and add them verbatim as `<h3>` subheadings with concise answers in an FAQ section.

---

## 4. Content Architecture, BLUF & E-E-A-T

Google's Helpful Content System strictly demotes content written solely for search engines without first-hand value. Content must demonstrate **E-E-A-T** (Experience, Expertise, Authoritativeness, Trustworthiness) and deliver instantaneous value through **BLUF** formatting.

### 4.1 On-Page Content Anatomy Checklist

| Element              | Optimal Length / Format        | Formula / Rule                                 |
| :------------------- | :----------------------------- | :--------------------------------------------- |
| **Title Tag**        | 50 – 60 characters (< 580px)   | `[Primary Keyword] – [CTR Hook / Year]`        |
| **Meta Description** | 150 – 160 characters (< 960px) | `[Core Benefit] + [Entity Terms] + CTA`        |
| **URL Slug**         | 2 – 5 words, lowercase         | `/blog/[primary-kw]` (Never include dates)     |
| **Heading 1 (H1)**   | 1 per page, 40–70 characters   | Matches search intent with natural keyword     |
| **Heading 2 (H2)**   | Logical section dividers       | Uses secondary keywords & question phrasing    |
| **Heading 3 (H3)**   | Sub-points & PAA questions     | Specific sub-answers & definitions             |
| **Images**           | WebP / AVIF format             | Width/height attributes + descriptive alt text |

### 4.2 The BLUF (Bottom Line Up Front) Writing Framework

Never hide the answer at the end of an article. State the core conclusion in the very first 1–2 sentences.

- **Bad (Generic AI Fluff)**:
  > _"In today's fast-paced digital landscape, search engine optimization is more important than ever before. Many businesses wonder how to improve their technical SEO. In this comprehensive guide, we will explore the wonderful world of Core Web Vitals..."_
- **Good (BLUF Answer-First)**:
  > **Interaction to Next Paint (INP)** measures page responsiveness and must stay **under 200 milliseconds** to pass Google Core Web Vitals. To fix poor INP, break long JavaScript tasks (>50ms) using `scheduler.yield()`, debounce input listeners, and eliminate CPU-heavy client-side hydration.

**Structure of a High-Ranking Section**:

1. **Direct Answer (BLUF)**: First 1–2 sentences directly answer or define the question.
2. **Key Takeaway Box / Bulleted Summary**: 3–5 concise bullets summarizing critical points.
3. **Data / Benchmark Table**: Structured comparison or measurable criteria.
4. **Step-by-Step Implementation**: Clear code snippets, instructions, or workflow.
5. **Nuance & Edge Cases**: Common traps, trade-offs, and troubleshooting.

### 4.3 Demonstrating E-E-A-T

- **Experience**: Include original screenshots, test results, benchmarks run by your team, and lessons learned.
- **Expertise**: Include a named author byline, biographical credentials, and `sameAs` links to LinkedIn, GitHub, or Wikipedia.
- **Authoritativeness**: Cite primary academic studies, official documentation, or verified industry data with standard outbound links.
- **Trustworthiness**: Maintain clear editorial guidelines, visible `datePublished` and `dateModified` timestamps, valid SSL, privacy policy, and contact info.

### 4.4 Content Decay Refresh Protocol

1. In Google Search Console, filter pages with a >20% decline in clicks over the past 90 days.
2. Update outdated years, deprecated code APIs, dead links, and stale stats.
3. Inspect top 3 ranking competitors to identify newly emerged subtopics.
4. Add a comparison table, FAQ schema, or actionable code snippet.
5. Update `dateModified` in the JSON-LD schema.

---

## 5. Generative Engine Optimization (GEO) & AI Search

Generative Engine Optimization (GEO) optimizes digital content so Large Language Models and AI search engines (**Google AI Overviews, Perplexity, ChatGPT Search, Gemini, Claude**) discover, synthesize, and cite your brand. Targeted GEO formatting increases citation rates in AI responses by **up to 40%**.

### 5.1 The 6 Core Ranking Factors of GEO

1. **Statistical Density & Quantitative Verification**:
   - Fluff: _"Our caching strategy significantly boosts speed."_
   - GEO-Optimized: _"Implementing stale-while-revalidate edge caching reduced p99 latency by 64.2% across 1.2M daily requests in Q1 2026."_
   - Always include verifiable metrics, percentages, dollar amounts, sample sizes, and explicit dates.
2. **Passage-Level Semantic Independence**:
   - Every H2 and H3 section must function as an independent, standalone answer.
   - Avoid relying on pronouns or context established three paragraphs earlier (replace _"As mentioned above, this method..."_ with _"In static site generation, pre-rendering HTML at build time..."_).
3. **Answer-First Definitional Framing**:
   - Format opening sentences as a definitive noun phrase: `[Entity] is [Category] that [Primary Mechanism] to achieve [Core Outcome].`
4. **Comparison Tables & Structured Markdown**:
   - LLMs frequently pull markdown tables directly into the response UI. Include clear column headers (`Feature`, `Method A`, `Method B`, `Best For`).
5. **Multi-Source Web Consensus**:
   - Perplexity and ChatGPT Search verify entity validity across G2, Capterra, ProductHunt, GitHub, and Reddit (`r/webdev`, `r/SEO`).
6. **The `llms.txt` Standard**:
   - Place an `llms.txt` file at the domain root (`https://example.com/llms.txt`) providing a markdown-first index for LLMs.

### 5.2 Production `llms.txt` Specification

```markdown
# Your Brand / Site Name

> Concise one-sentence summary of what your product, service, or documentation does.

## Core Documentation & Guides

- [Getting Started](https://example.com/docs/getting-started): Step-by-step onboarding guide.
- [Architecture & Standards](https://example.com/docs/architecture): Technical deep-dive and performance specifications.
- [API Reference](https://example.com/docs/api): Complete endpoints, payloads, and authentication.

## Benchmarks & Research

- [2026 Core Web Vitals Benchmark](https://example.com/research/cwv-study): Original study analyzing 50k domains.
- [GEO Performance Guide](https://example.com/blog/geo-playbook): How to optimize content for generative search.

## Company & Entities

- Official Name: Example Inc.
- Founded: 2024
- Primary Entity Type: Web Infrastructure Software
- Contact: team@example.com
```

---

## 6. Structured Data, JSON-LD & Entity Schema

Always embed **JSON-LD** in a `<script type="application/ld+json">` tag within `<head>` or `<body>`.

### 6.1 Organization Schema (Homepage)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://example.com/#organization",
  "name": "Acme Software",
  "url": "https://example.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://example.com/logo.png",
    "width": 512,
    "height": 512
  },
  "sameAs": [
    "https://twitter.com/acmesoftware",
    "https://linkedin.com/company/acmesoftware",
    "https://github.com/acmesoftware"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "support@example.com",
    "contactType": "customer service"
  }
}
```

### 6.2 Article / BlogPosting Schema (Every Post)

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "@id": "https://example.com/blog/technical-seo-guide#article",
  "isPartOf": {
    "@type": "WebSite",
    "@id": "https://example.com/#website"
  },
  "headline": "The Complete Guide to Technical SEO in 2026",
  "description": "Master Core Web Vitals, crawlability, canonicals, and modern search indexing.",
  "image": "https://example.com/images/cover.webp",
  "datePublished": "2026-01-15T08:00:00+00:00",
  "dateModified": "2026-03-01T12:00:00+00:00",
  "author": {
    "@type": "Person",
    "name": "Jane Doe",
    "jobTitle": "Principal SEO Architect",
    "url": "https://example.com/authors/jane-doe",
    "sameAs": ["https://linkedin.com/in/janedoe"]
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://example.com/#organization"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/blog/technical-seo-guide"
  }
}
```

### 6.3 BreadcrumbList Schema (Site-Wide)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://example.com/blog" },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Technical SEO",
      "item": "https://example.com/blog/technical-seo-guide"
    }
  ]
}
```

### 6.4 FAQPage Schema (Q&A Sections)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the optimal Core Web Vitals LCP threshold?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Google recommends a Largest Contentful Paint (LCP) of 2.5 seconds or faster for at least 75% of page visits."
      }
    }
  ]
}
```

### 6.5 SoftwareApplication & Product Schema

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "SEOAnything",
  "operatingSystem": "All",
  "applicationCategory": "DeveloperApplication",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "128"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

### 6.6 Framework Integration (React / Next.js)

```tsx
export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Next.js SEO Best Practices",
  };

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1>Next.js SEO Best Practices</h1>
    </section>
  );
}
```

---

## 7. Internal Linking Silos & Link Acquisition

Internal link architecture routes PageRank equity through your site and signals topical hierarchy to crawlers.

### 7.1 The Topical Silo Architecture

```text
                     [Homepage (Highest PageRank)]
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
      [Pillar: Performance]                     [Pillar: Content Strategy]
              │                                         │
        ┌─────┴─────┐                             ┌─────┴─────┐
        ▼           ▼                             ▼           ▼
   [CWV Guide] [INP Fixes]                   [BLUF Guide] [E-E-A-T Tips]
        │           │                             │           │
        └───◄───►───┘                             └───◄───►───┘
   (Intra-Silo Lateral Links)                (Intra-Silo Lateral Links)
```

1. **Vertical Flow**: Main Pillar pages link down to all child cluster pages; all child cluster pages link back up to the main Pillar page.
2. **Horizontal Lateral Flow**: Child pages within the same topic silo link laterally to one another using descriptive anchor text.
3. **Cross-Silo Restrictions**: Child pages in Silo A should rarely link directly to child pages in Silo B. Cross-silo links connect at the Pillar level.

### 7.2 Anchor Text Rules

- **Descriptive Keyword** (`review our Core Web Vitals checklist`): Excellent. Primary internal link method.
- **Partial Match** (`tips for optimizing INP latency`): Excellent. Adds natural semantic variety.
- **Branded** (`SEOAnything platform`): Good for tool and homepage links.
- **Generic** (`click here`, `read more`, `this link`): **POOR / FORBIDDEN**. Wastes link equity; tells crawlers nothing.

### 7.3 Orphan Page Eradication & Click-Depth ≤ 3

Every important indexable URL must be reachable within **3 clicks** of the homepage:

- Click 1: Homepage -> Category / Pillar Hub
- Click 2: Pillar Hub -> Specific Article / Product
- Click 3: Article -> Related Deep Asset

### 7.4 High-Impact White-Hat Link Playbooks

1. **Digital PR & Proprietary Benchmark Data**: Analyze real-world data across hundreds of domains and publish an ungated industry study. Media outlets and bloggers naturally cite data points with editorial backlinks.
2. **Unlinked Brand Mention Reclamation**: Monitor brand mentions using Google Alerts or Ahrefs. Reach out to editors requesting a hyperlink to your project.
3. **Broken Link Building**: Locate 404 links on authoritative resource lists in your niche and offer your active, superior guide as a replacement.

---

## 8. Programmatic SEO (pSEO) & Scaled Architecture

Programmatic SEO generates hundreds or thousands of high-ranking landing pages using database records, API feeds, and structured templates (e.g., comparison pages, directory entries, calculators).

### 8.1 The 60/40 Unique Value Formula

To avoid Google's **Doorway Pages** and **Scalable Thin Content** penalties:

- **Maximum 40% Boilerplate / Structural Markup**: Global header, footer, navigation wrappers.
- **Minimum 60% Truly Unique, Dynamic Data**:
  1. Record-specific quantitative metrics (scores, speeds, prices, dimensions).
  2. Dynamic comparison tables specific to the records being compared.
  3. Dynamic user reviews, testimonials, or community insights.
  4. Interactive calculators or filterable tables.

### 8.2 Crawl Budget Management & Staged Rollout

- **Pilot Phase (Batch 1: 50–200 Pages)**: Submit dedicated sitemap `sitemap-pilot.xml`. Verify >80% indexation over 3–4 weeks.
- **Expansion Phase (Batch 2: 1,000–2,500 Pages)**: Verify server TTFB remains < 500ms under crawler load.
- **Scale Phase (Batch 3: 10,000+ Pages)**: Segment XML sitemaps into files with no more than 10,000 URLs each (`sitemap-comparisons-1.xml`, `sitemap-comparisons-2.xml`) grouped under a master `sitemap.xml` index.
- **Parameterized URLs**: Canonicalize filter and sorting variants to the clean base category URL. Add `noindex, follow` to zero-search-volume filter combinations.

---

## 9. 100-Point Master SEO Audit & Scorecard

Run complete automated audits using the built-in CLI:

```bash
# Audit current repository or local routes
npx seoanything audit .

# Audit a specific Next.js page or component
npx seoanything audit ./app/blog/[slug]/page.tsx

# Audit a live production page
npx seoanything audit https://example.com/blog/my-guide
```

### The 100-Point Master Audit Checklist

#### 1. Crawlability & Indexability (25%)

- [ ] `robots.txt` is valid, accessible at root domain, and does not block critical CSS/JS assets.
- [ ] AI crawler user-agents (`GPTBot`, `PerplexityBot`, `ClaudeBot`) are explicitly permitted.
- [ ] XML Sitemap exists at `/sitemap.xml`, contains only 200 OK canonical URLs, and is registered in Google Search Console.
- [ ] Every indexable page features an explicit self-referential canonical tag.
- [ ] Zero internal 404 links or broken redirects (no `301 -> 301` chains).
- [ ] Parameterized URLs, search results, and admin routes include `noindex, follow` tags.

#### 2. Performance & Core Web Vitals (20%)

- [ ] Largest Contentful Paint (LCP) is ≤ 2.5s on mobile devices.
- [ ] Hero image has high fetch priority: `<link rel="preload" as="image" fetchpriority="high">`.
- [ ] Interaction to Next Paint (INP) is ≤ 200ms with zero long tasks (>50ms) blocking main thread.
- [ ] Cumulative Layout Shift (CLS) is ≤ 0.1; all images and embeds have explicit `width` and `height`.
- [ ] Time to First Byte (TTFB) is ≤ 800ms globally via edge CDN caching.
- [ ] Text assets (HTML, CSS, JS, SVG) are compressed with Brotli or Gzip.

#### 3. On-Page & Semantic Content (20%)

- [ ] Title tags are 50–60 characters, front-loaded with target keyword, and unique per page.
- [ ] Meta descriptions are 140–160 characters, include target entity terms, and feature an actionable CTA.
- [ ] Exactly one `<h1>` per page, accurately reflecting search intent.
- [ ] Strict heading hierarchy (`h1` -> `h2` -> `h3`) with zero skipped levels.
- [ ] All `<img>` tags possess contextually descriptive `alt` attributes.
- [ ] Social Open Graph (`og:title`, `og:description`, `og:image`) and Twitter Card tags are present.

#### 4. Generative Engine Optimization (GEO) & AI Search (15%)

- [ ] `llms.txt` is deployed at domain root and listed in `robots.txt`.
- [ ] Key informational pages employ BLUF: Direct answer defined in opening 1–2 sentences.
- [ ] Passage independence: Subheaders can be extracted by LLMs without missing contextual pronouns.
- [ ] Statistical density: At least 1 verifiable benchmark, metric, or data point per 500 words.
- [ ] Comparative markdown/HTML tables used for commercial evaluation queries.

#### 5. Structured Data & Schema.org (10%)

- [ ] Valid JSON-LD markup implemented for `Organization`, `WebSite`, and `BreadcrumbList`.
- [ ] Content pages include `BlogPosting` or `Article` with named author and date timestamps.
- [ ] FAQ sections include compliant `FAQPage` schema.
- [ ] Zero syntax errors when tested against Google Rich Results validator.

#### 6. Internal Link Graph & Architecture (10%)

- [ ] Zero orphan pages (every indexable page has at least 3 incoming internal links).
- [ ] Maximum click depth is ≤ 3 clicks from homepage for all critical money pages.
- [ ] Descriptive anchor text used exclusively (zero generic "click here" or "learn more" anchors).
- [ ] Topical silo integrity: Cluster pages link upward to their parent Pillar page.

### Audit Scorecard & Grading Scale

| Overall Score | Health Status           | Priority Action                                                                                  |
| :------------ | :---------------------- | :----------------------------------------------------------------------------------------------- |
| **90 – 100**  | **Grade A (Elite)**     | Maintain topical fresh updates, expand cluster breadth, execute Digital PR.                      |
| **75 – 89**   | **Grade B (Healthy)**   | Optimize Core Web Vitals (INP/LCP), expand schema coverage, refine internal anchor text.         |
| **50 – 74**   | **Grade C (Deficient)** | Fix canonical loops, resolve missing title/meta tags, eliminate orphan pages.                    |
| **< 50**      | **Grade F (Critical)**  | Emergency intervention: Verify robots.txt, fix broken rendering, remove accidental noindex tags. |

---

## 10. Emergency Protocol: Diagnosing Traffic Drops

If a site experiences a sudden ranking or traffic drop, execute this diagnostic protocol:

```text
[Traffic Drop Detected]
         │
         ├──> 1. Technical Check: Did a recent deployment introduce a "noindex" tag, broken robots.txt, or 500 errors?
         │         └── Tool: Verify via `npx seoanything audit .` and Search Console URL Inspection.
         │
         ├──> 2. Tracking Check: Is Google Analytics / GTM tag firing correctly? (Check if bounce rate is 0% or tracking ID changed).
         │
         ├──> 3. Algorithmic Update: Did Google release a Core Update, Helpful Content Update, or Spam Update?
         │         └── Action: Compare drop date with Search Engine Land algorithm trackers.
         │
         ├──> 4. Manual Penalty: Check Google Search Console -> "Security & Manual Actions".
         │
         └──> 5. AI Overview Shift: Did an AI Overview or Zero-Click result displace organic CTR for your primary keywords?
                   └── Action: Optimize passages for GEO inclusion using BLUF definitional framing.
```

---

## 11. Standalone Execution vs. Modular Sub-Skills

This master skill is 100% self-contained. You do **not** need to invoke any other skill to execute any task above.

However, if you ever wish to use smaller, modular sub-skills for hyper-focused, token-efficient tasks, the specialized sub-skills remain available:

- `seo-technical`: Core Web Vitals, robots.txt, sitemaps, canonicals, SSR/SSG.
- `seo-keywords`: Search intent taxonomy, topic clusters, entity mapping.
- `seo-content`: Blog writing, BLUF framing, E-E-A-T proof points.
- `seo-geo`: AI search optimization for Perplexity, ChatGPT Search, and `llms.txt`.
- `seo-schema`: JSON-LD generation and Schema.org rich snippets.
- `seo-links`: Topical silos, PageRank sculpting, and backlink playbooks.
- `seo-programmatic`: Scaled landing page generation and crawl budget control.
- `seo-audit`: 100-point checklist and automated issue scanner.
