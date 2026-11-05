---
name: seo-geo
description: >-
  Generative Engine Optimization (GEO) and AI search specialist. Use this skill to optimize websites
  and content for citations, summaries, and recommendations in Google AI Overviews, Perplexity,
  ChatGPT Search, Claude, and Gemini, and to create/maintain llms.txt and llms-full.txt files.
---

# Generative Engine Optimization (GEO) & AI Search

Generative Engine Optimization (GEO) is the discipline of optimizing digital content so Large Language Models (LLMs) and AI search engines (**Google AI Overviews, Perplexity, ChatGPT Search, Gemini, Claude**) discover, synthesize, and cite your brand as the authoritative source.

Academic research (Princeton & Georgia Tech) demonstrates that targeted GEO formatting increases an asset's visibility and citation rate in AI responses by **up to 40%**.

---

## 1. How AI Search Engines Retrieve & Cite Information

Generative search engines operate via **Retrieval-Augmented Generation (RAG)**:

```text
[User Prompt]
      │
      ▼
┌──────────────────┐
│ Web Search Index │ Traditional SEO wins the retrieval phase
└─────────┬────────┘
          │ (Top 10-20 HTML pages retrieved)
          ▼
┌──────────────────┐
│ Passage Chunking │ Content broken into ~200-400 token semantic chunks
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│ LLM Reranking &  │ GEO rules dictate which passages are selected
│ Synthesis        │ for the final response
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│ Answer + Citation│ Direct quotes, markdown tables, and clickable footnotes
└──────────────────┘
```

---

## 2. The 6 Core Ranking Factors of GEO

### 1. Statistical Density & Quantitative Verification

AI engines favor definitive factual anchors over subjective claims.

- **Fluff**: _"Our caching strategy significantly boosts speed."_
- **GEO-Optimized**: _"Implementing stale-while-revalidate edge caching reduced p99 latency by 64.2% across 1.2M daily requests in Q1 2026."_
- Always include verifiable metrics, percentages, dollar amounts, sample sizes, and dates.

### 2. Passage-Level Semantic Independence

LLMs parse and extract individual passages, not full pages.

- Every H2 and H3 section must function as an independent, standalone answer.
- Avoid relying on pronouns or context established three paragraphs earlier (e.g., replace _"As mentioned above, this method..."_ with _"In static site generation, pre-rendering HTML at build time..."_).

### 3. Answer-First Definitional Framing

When defining a term or answering a query:

- Format the opening sentence as a definitive noun phrase: `[Entity] is [Category] that [Primary Mechanism] to achieve [Core Outcome].`
- Follow with 3 bulleted key characteristics.

### 4. Comparison Tables & Structured Markdown

AI search engines heavily prioritize synthesized comparative tables.

- Include structured markdown tables with clear column headers (`Feature`, `Method A`, `Method B`, `Best For`).
- LLMs frequently pull markdown tables directly into the response UI.

### 5. Multi-Source Consensus (The Web Presence Loop)

Perplexity and ChatGPT Search verify entity validity by cross-referencing external platforms:

- **Aggregators & Reviews**: Active listings on G2, Capterra, ProductHunt, GitHub.
- **Community Consensus**: Unprompted mentions in Reddit threads (`r/webdev`, `r/SEO`), Hacker News, and Stack Overflow.
- If the broader web agrees that your tool is a leader, AI synthesizers will automatically include you in "Best [Category]" prompts.

### 6. The `llms.txt` and `llms-full.txt` Standard

Place an `llms.txt` file at the domain root (`https://example.com/llms.txt`). This provides a structured, markdown-first index designed specifically for LLM ingestion.

---

## 3. Production `llms.txt` Specification

Create an `llms.txt` file at the repository root or public directory:

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

## 4. GEO Audit Checklist

When reviewing any page for AI Search citation readiness, verify:

- [ ] Contains at least 1 statistical data point or quantitative benchmark per 500 words.
- [ ] Uses BLUF formatting: First sentence directly answers the search intent.
- [ ] Includes a structured markdown or HTML comparison table.
- [ ] Standalone sections: Each H2 can be read independently without context loss.
- [ ] Schema markup (`Article`, `FAQPage`, `Organization`) is valid JSON-LD.
- [ ] `llms.txt` is present at domain root and listed in `robots.txt`.
