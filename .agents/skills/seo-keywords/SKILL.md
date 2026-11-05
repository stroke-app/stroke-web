---
name: seo-keywords
description: >-
  Keyword research, search intent, and topical clustering specialist. Use this skill when the user
  wants to find high-traffic or low-competition keywords, classify search intent, design topic clusters
  (Pillar and Cluster model), map entities, or perform competitor keyword gap analysis.
---

# Keyword Research, Search Intent & Topical Clustering

Modern SEO has evolved from keyword stuffing into **Topical Authority** and **Entity Salience**. Search engines (and generative AI models) understand the semantic relationship between entities and reward websites that comprehensively cover an entire domain rather than chasing isolated keywords.

---

## 1. The 4-Tier Search Intent Taxonomy

Every search query has a primary intent. Creating content that mismatches this intent will prevent your page from ranking, regardless of backlink volume.

```text
┌─────────────────┬───────────────────────────────┬───────────────────────────────┐
│ Search Intent   │ Query Modifiers / Examples    │ Optimal Content Type          │
├─────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Informational   │ "how to", "what is", "guide", │ Deep-dive blog post, tutorial,│
│                 │ "examples", "benefits", "why" │ definition, FAQ, documentation│
├─────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Commercial      │ "best [x] for [y]", "vs",     │ Comparison table, review,     │
│ Investigation   │ "alternatives", "review 2026" │ buyer's guide, benchmark data │
├─────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Transactional   │ "buy", "pricing", "discount", │ Product page, pricing table,  │
│                 │ "demo", "hire", "quote", "api"│ checkout, free trial signup   │
├─────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Navigational    │ "[Brand] login", "[Brand] app"│ Dedicated portal or homepage  │
└─────────────────┴───────────────────────────────┴───────────────────────────────┘
```

---

## 2. Pillar & Cluster (Hub & Spoke) Architecture

To establish topical authority, group related keywords into a **Pillar & Cluster** model:

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

### Linking Blueprint:

1. **Pillar Page**: Covers the broad topic at a high level (2,500–5,000 words). Links out to each cluster page in relevant sections.
2. **Cluster Pages**: Deep-dive into specific long-tail questions (1,200–2,000 words).
3. **Cluster-to-Pillar Link**: Every cluster page **MUST** link back to the main Pillar page using the primary target keyword as anchor text.
4. **Cluster-to-Cluster Link**: Siblings link to each other when contextually relevant.

---

## 3. Keyword Prioritization Framework

Prioritize keyword opportunities using the **Opportunity Score Formula**:

$$\text{Opportunity Score} = \frac{\text{Search Volume} \times \text{Business Value (1-5)}}{\text{Keyword Difficulty (KD)} + 1}$$

### Keyword Selection Matrix:

1. **Low-Hanging Fruit (Quick Wins)**:
   - Keyword Difficulty (KD): 0 – 25
   - Search Volume: 100 – 1,000 / month
   - Strategy: Publish precise, answer-first cluster articles. These rank quickly (2-6 weeks) and build domain momentum.
2. **Core Growth (Medium-Term)**:
   - KD: 25 – 50
   - Search Volume: 1,000 – 10,000 / month
   - Strategy: Commercial comparison pages, interactive tools, calculators, templates.
3. **Trophy Targets (Long-Term Topical Pillars)**:
   - KD: 50+
   - Search Volume: 10,000+ / month
   - Strategy: Massive pillar guides, definitive industry reports, unique proprietary studies.

---

## 4. Entity Mapping & Semantic Co-Occurrence

Google’s Hummingbird and Gemini NLP algorithms use Knowledge Graph entities. When writing about a topic, incorporate its **Salient Entities**:

- **Subject Entity**: The core concept (e.g., `Next.js SEO`).
- **Parent Entity**: The overarching domain (e.g., `Full-stack Web Development`, `Search Engine Optimization`).
- **Sibling Entities**: Related frameworks and concepts (e.g., `Server-Side Rendering`, `Incremental Static Regeneration`, `Core Web Vitals`).
- **Co-Occurring Semantic Attributes**: `meta tags`, `generateMetadata`, `sitemap.ts`, `robots.txt`, `Open Graph`, `JSON-LD`.

---

## 5. Reverse-Engineering SERP Features

Before drafting content, analyze the live Search Engine Results Page (SERP) for your keyword:

1. **AI Overview Present**:
   - Provide a direct 2-sentence definition in the opening paragraph.
   - Use comparison tables and numbered steps.
2. **Featured Snippet (Paragraph, List, or Table)**:
   - Paragraph: Answer in 40–50 words immediately following an H2 formatted with the query.
   - List: Use an ordered `<ol>` or unordered `<ul>` with bold prefixes.
   - Table: Use a markdown/HTML `<table>` comparing at least 3 items with 3+ attributes.
3. **"People Also Ask" (PAA) Box**:
   - Extract the top 4-6 PAA questions.
   - Add them verbatim as `<h3>` subheadings with direct, concise answers in an FAQ section.
