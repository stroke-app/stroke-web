---
name: seo-content
description: >-
  Content strategy, blog writing, and E-E-A-T optimization specialist. Use this skill when writing
  or optimizing blog articles, product pages, or guides to satisfy Google's Helpful Content System,
  apply the BLUF inverted-pyramid framework, optimize title tags, meta descriptions, headings, and readability.
---

# High-Ranking Content, Blog Playbook & E-E-A-T

Search engines no longer rank generic, rehashed AI content. Google's Helpful Content System strictly demotes content written solely for search engines without genuine value. To rank in modern SERPs and AI answers, content must demonstrate **E-E-A-T** (Experience, Expertise, Authoritativeness, Trustworthiness) and deliver instantaneous value through **BLUF** formatting.

---

## 1. On-Page Anatomy Checklist

Every page must follow this strict on-page architecture:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        ON-PAGE CONTENT ANATOMY                         │
├─────────────────┬───────────────────────────────┬──────────────────────┤
│ Element         │ Optimal Length / Format       │ Formula / Rule       │
├─────────────────┼───────────────────────────────┼──────────────────────┤
│ Title Tag       │ 50 – 60 characters            │ [Primary Keyword] –  │
│                 │ (< 580px desktop, 960 mobile) │ [CTR Hook / Year]    │
├─────────────────┼───────────────────────────────┼──────────────────────┤
│ Meta Description│ 150 – 160 characters          │ [Core Benefit] +     │
│                 │ (< 960px limit)               │ [Entity Terms] + CTA │
├─────────────────┼───────────────────────────────┼──────────────────────┤
│ URL Slug        │ 2 – 5 words, lowercase        │ /blog/[primary-kw]   │
│                 │ Hyphen-separated, no dates    │ (Never include dates)│
├─────────────────┼───────────────────────────────┼──────────────────────┤
│ Heading 1 (H1)  │ 1 per page, 40-70 characters  │ Matches search intent│
│                 │                               │ with natural keyword │
├─────────────────┼───────────────────────────────┼──────────────────────┤
│ Heading 2 (H2)  │ Logical section dividers      │ Uses secondary KWs & │
│                 │                               │ question phrasing    │
├─────────────────┼───────────────────────────────┼──────────────────────┤
│ Heading 3 (H3)  │ Sub-points & PAA questions    │ Specific sub-answers │
├─────────────────┼───────────────────────────────┼──────────────────────┤
│ Images          │ WebP / AVIF format            │ Descriptive filename │
│                 │ Width/height attributes       │ & contextual alt text│
└─────────────────┴───────────────────────────────┴──────────────────────┘
```

---

## 2. The BLUF (Bottom Line Up Front) Writing Framework

LLMs and human searchers both prioritize immediate clarity over narrative build-up. Never hide the answer at the end of an article.

### Bad (Generic AI Fluff):

> "In today's fast-paced digital landscape, search engine optimization is more important than ever before. Many businesses wonder how to improve their technical SEO. In this comprehensive guide, we will explore the wonderful world of Core Web Vitals..."

### Good (BLUF Answer-First):

> **Interaction to Next Paint (INP)** measures page responsiveness and must stay **under 200 milliseconds** to pass Google Core Web Vitals. To fix poor INP, break long JavaScript tasks (>50ms) using `scheduler.yield()`, debounce input listeners, and eliminate CPU-heavy client-side hydration.

### Structure of a High-Ranking Section:

1. **Direct Answer (BLUF)**: First 1-2 sentences define or directly answer the question.
2. **Key Takeaway Box / Bulleted Summary**: 3-5 concise bullets summarizing critical points.
3. **Data / Benchmark Table**: Structured comparison or measurable criteria.
4. **Step-by-Step Implementation**: Clear code snippets, instructions, or workflow.
5. **Nuance & Edge Cases**: Common traps, trade-offs, and troubleshooting.

---

## 3. Demonstrating E-E-A-T (Google Helpful Content System)

Google explicitly rates pages based on Experience, Expertise, Authoritativeness, and Trustworthiness:

### 1. Experience (First-Hand Proof)

- Include original screenshots of software, dashboards, or test results.
- Share specific benchmarks run by your team: _"In our benchmark across 50,000 Next.js pages, switching to edge middleware reduced TTFB by 142ms."_
- Detail real-world failures and lessons learned.

### 2. Expertise (Author Credentials)

- Every article must have a dedicated author byline.
- Author bio must detail relevant industry credentials, background, and years of experience.
- Link author profile to external identity proofs: LinkedIn, GitHub, personal website, or Wikipedia/Wikidata entity.

### 3. Authoritativeness (Industry Recognition)

- Cite primary academic studies, official documentation, or verified industry data (with standard outbound links).
- Avoid circular linking to low-quality content mills.

### 4. Trustworthiness (Transparency & Security)

- Clear editorial guidelines and date transparency (`datePublished` and `dateModified`).
- Valid SSL certificate, clear contact information, terms of service, and privacy policy.

---

## 4. Content Decay Audit & Refresh Protocol

Over time, high-ranking articles decay as competitors publish fresher content. Run this quarterly refresh workflow:

1. **Identify Decaying URLs**: In Google Search Console, filter pages with a >20% decline in clicks over the past 90 days.
2. **Update Stale References**: Update outdated years, deprecated APIs, broken links, and outdated stats.
3. **Analyze New SERP Entrants**: Inspect the top 3 ranking competitors to identify new subtopics or angles they cover.
4. **Expand Passage Optimization**: Add a summary table, FAQ schema, or actionable code snippet.
5. **Update Timestamp**: Update `dateModified` in the JSON-LD schema (do not change original `datePublished` unless completely rewritten).
