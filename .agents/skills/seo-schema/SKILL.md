---
name: seo-schema
description: >-
  Structured data and Schema.org specialist. Use this skill to generate, validate, and debug JSON-LD
  structured markup for Article, Organization, WebSite, BreadcrumbList, FAQPage, HowTo, Product,
  Review, LocalBusiness, SoftwareApplication, and Google Rich Results.
---

# Structured Data, JSON-LD & Entity Schema Guide

Structured data (Schema.org) provides machine-readable metadata directly to search engine crawlers and LLMs. Correct schema implementation achieves two critical outcomes:

1. **Rich Results Eligibility**: Unlocks star ratings, review snippets, FAQ dropdowns, breadcrumb navigation, and sitelink search boxes on SERPs.
2. **Entity Disambiguation**: Connects your brand and authors directly to Google’s Knowledge Graph and AI search entity databases.

Always use **JSON-LD** embedded in a `<script type="application/ld+json">` tag within the `<head>` or `<body>`. Never use microdata or RDFa in modern web projects.

---

## 1. Core Schema Archetypes

### 1.1 Organization & Brand Schema (Include on Homepage)

Disambiguates your company entity and links social authority:

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
    "https://github.com/acmesoftware",
    "https://www.wikidata.org/wiki/Q12345678"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "support@example.com",
    "contactType": "customer service"
  }
}
```

---

### 1.2 Article / BlogPosting Schema (Include on Every Post)

Provides complete provenance, authorship, and publication dates for E-E-A-T:

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
  "image": "https://example.com/images/technical-seo-cover.webp",
  "datePublished": "2026-01-15T08:00:00+00:00",
  "dateModified": "2026-03-01T12:00:00+00:00",
  "author": {
    "@type": "Person",
    "name": "Jane Doe",
    "jobTitle": "Principal SEO Architect",
    "url": "https://example.com/authors/jane-doe",
    "sameAs": ["https://linkedin.com/in/janedoe", "https://github.com/janedoe"]
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

---

### 1.3 BreadcrumbList Schema (Include Site-Wide)

Replaces raw URLs in Google SERPs with clean, readable hierarchical breadcrumbs:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://example.com/blog"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Technical SEO",
      "item": "https://example.com/blog/technical-seo-guide"
    }
  ]
}
```

---

### 1.4 FAQPage Schema (For Question-Answer Sections)

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
    },
    {
      "@type": "Question",
      "name": "Does JSON-LD need to be in the head tag?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "While placing JSON-LD in the head tag is recommended for early parsing, Google and search crawlers parse JSON-LD anywhere in the DOM, including the body."
      }
    }
  ]
}
```

---

### 1.5 SoftwareApplication & Product Schema

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

---

## 2. Framework Integration Best Practices

### React / Next.js (App Router)

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

## 3. Schema Validation Checklist

- [ ] All required fields for the schema type are populated (e.g., `headline` and `image` for `Article`).
- [ ] No syntax errors: JSON is strictly valid with no trailing commas.
- [ ] Schema content matches user-visible page content (cloaked or hidden schema violates Google policy).
- [ ] Tested against the [Google Rich Results Test](https://search.google.com/test/rich-results) and Schema.org Validator.
