---
name: seo-programmatic
description: >-
  Programmatic SEO and scaled page architecture specialist. Use this skill when scaling 100 to 10,000+
  landing pages using databases or APIs, avoiding Google thin-content/doorway penalties, designing dynamic
  templates with >60% unique content, managing crawl budget, and structuring scaled sitemaps.
---

# Programmatic SEO (pSEO) & Scaled Architecture

Programmatic SEO (pSEO) is the practice of programmatically generating hundreds or thousands of high-ranking landing pages using database records, API feeds, and structured templates. When executed correctly, pSEO builds massive long-tail search traffic (examples: Zapier integrations, Nomad List city guides, Wise currency converters).

---

## 1. The Golden Rule of pSEO: Avoiding the Thin Content Trap

Google's Spam Policies strictly penalize **Doorway Pages** and **Scalable Thin Content**. If a programmatic page simply swaps a keyword token (`"Best Coffee in [City]"`) into identical boilerplate paragraphs, Google will de-index the entire batch.

### The 60/40 Unique Value Formula

For every programmatically generated page:

- **Maximum 40% Boilerplate / Structural Markup**: Navigation, basic UI wrappers, global headers/footers.
- **Minimum 60% Truly Unique, Dynamic Data**:
  1. Proprietary quantitative metrics (scores, prices, speeds, dimensions).
  2. Dynamic comparison tables specific to the record.
  3. Contextual FAQs generated from entity-specific attributes.
  4. Dynamic user reviews, testimonials, or curated community insights.
  5. Interactive widgets (calculators, simulators, filterable tables).

---

## 2. Scaled Template Architecture

Design templates that dynamically bind structured database records to semantic HTML:

```text
┌────────────────────────────────────────────────────────┐
│               PROGRAMMATIC TEMPLATE ANATOMY            │
├────────────────────────────────────────────────────────┤
│ 1. Dynamic Head / Metadata:                            │
│    Title: [Entity A] vs [Entity B]: 2026 Comparison    │
│    Meta: Compare [Entity A] and [Entity B] on [Metric] │
│    Schema: SoftwareApplication / Product (JSON-LD)     │
├────────────────────────────────────────────────────────┤
│ 2. Hero & Quick-Answer Matrix (BLUF):                  │
│    "At a glance: [Entity A] wins on speed (+24%),      │
│     while [Entity B] is $15/mo cheaper."               │
├────────────────────────────────────────────────────────┤
│ 3. Granular Comparison Table:                          │
│    [Feature] | [Entity A Spec] | [Entity B Spec]       │
├────────────────────────────────────────────────────────┤
│ 4. Entity-Specific Pros & Cons:                        │
│    Dynamic bullet lists pulled from record attributes  │
├────────────────────────────────────────────────────────┤
│ 5. Curated FAQs:                                       │
│    3-5 questions addressing long-tail search queries   │
├────────────────────────────────────────────────────────┤
│ 6. Cross-Linking Grid:                                 │
│    Links to Related Entities in same category / region │
└────────────────────────────────────────────────────────┘
```

---

## 3. Crawl Budget Management & Staged Rollout

Search engines allocate a finite **Crawl Budget** based on your domain authority. Introducing 50,000 new pages overnight on a young domain causes crawl starvation and indexing failures.

### The Tiered Rollout Schedule:

1. **Pilot Phase (Batch 1: 50 – 200 Pages)**:
   - Select the highest-volume or highest-intent records.
   - Deploy and submit dedicated sitemap `sitemap-pilot.xml` to Google Search Console.
   - Monitor indexation rate for 3–4 weeks. Target: >80% indexed.
2. **Expansion Phase (Batch 2: 1,000 – 2,500 Pages)**:
   - Verify server TTFB remains < 500ms under crawler load.
   - Ensure internal linking hubs link logically to new pages.
3. **Scale Phase (Batch 3: 10,000+ Pages)**:
   - Split XML sitemaps into segmented files containing no more than 10,000 URLs each:
     ```txt
     https://example.com/sitemaps/sitemap-comparisons-1.xml
     https://example.com/sitemaps/sitemap-comparisons-2.xml
     ```
   - Group them under a master sitemap index: `sitemap.xml`.

---

## 4. Parameterized URLs & Faceted Navigation Guardrails

If your programmatic system uses query strings (`?category=x&color=y&sort=price`):

- **Canonicalize to Clean Parent**: All sorting, filter variations, and pagination must point their `rel="canonical"` tag to the clean base category URL unless that specific filter combination represents an established keyword with standalone search volume.
- **Noindex Low-Value Combinations**: Add `<meta name="robots" content="noindex, follow" />` to filter combinations with zero search volume to prevent crawling waste.
