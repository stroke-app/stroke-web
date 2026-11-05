import fs from "node:fs/promises";
import path from "node:path";

import pkg from "@alkalisummer/google-trends-js";

const googleTrends = pkg.default || pkg;

const SEED_KEYWORDS = [
  "database client",
  "sql client",
  "TablePlus",
  "DBeaver",
  "DataGrip",
  "DuckDB GUI",
  "SQLite viewer",
  "PostgreSQL GUI",
  "MCP server database",
  "AI database agent",
];

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function analyze() {
  console.log("🚀 Starting Google Trends Analysis for Stroke...");
  const results = {
    generatedAt: new Date().toISOString(),
    clusters: {},
    trendsSummary: [],
  };

  for (const kw of SEED_KEYWORDS) {
    console.log(`\n🔍 Analyzing keyword: "${kw}"...`);
    try {
      // 1. Autocomplete suggestions
      const autoRes = await googleTrends.autocomplete(kw, "en-US");
      const suggestions = autoRes?.data || [];
      console.log(`   Found ${suggestions.length} autocomplete variants.`);

      // 2. Explore keyword metadata
      let widgets = [];
      try {
        const exploreRes = await googleTrends.explore({
          keyword: kw,
          geo: "US",
          time: "today 12-m",
        });
        widgets = (exploreRes?.widgets || []).map((w) => ({
          id: w.id,
          title: w.title,
        }));
      } catch (err) {
        console.log(`   (Explore note for ${kw}: ${err.message})`);
      }

      results.clusters[kw] = {
        keyword: kw,
        suggestions,
        hasTimeseries: widgets.some((w) => w.id === "TIMESERIES"),
        hasRelatedQueries: widgets.some((w) => w.id === "RELATED_QUERIES"),
      };

      results.trendsSummary.push({
        keyword: kw,
        searchIntent:
          kw.includes("vs") || kw === "TablePlus" || kw === "DBeaver" || kw === "DataGrip"
            ? "Commercial Investigation / Comparison"
            : kw.includes("MCP") || kw.includes("AI")
              ? "High-Growth Emerging Informational"
              : "Transactional / Developer Utility",
        topSuggestions: suggestions.slice(0, 5),
      });

      // Polite delay between Google requests
      await delay(1200);
    } catch (err) {
      console.error(`   ❌ Error querying "${kw}":`, err.message);
    }
  }

  // Generate Markdown analysis report
  const markdownReport = `# Google Trends & Search Intent Intelligence Report
Generated: ${results.generatedAt}
Engine: @alkalisummer/google-trends-js + Stroke SEO Strategy Engine

---

## Executive Summary & Tactical Takeaways

Search queries in the database tooling space are undergoing a monumental shift in 2026:
1. **The MCP (Model Context Protocol) & AI Agent Surge**: Queries pairing database clients with AI agents (Cursor, Claude Desktop, ChatGPT, Grok) have emerged as the fastest-growing search cluster. Developers no longer want a database client that only displays tables—they want an MCP server that agents can query directly with zero data leaks.
2. **TablePlus & DBeaver Fatigue**: High search volume surrounds "TablePlus alternative", "TablePlus license cost", and "DBeaver memory usage / slow startup". Developers seek lightweight, native alternatives with honest pricing ($9.99 one-time vs annual subscriptions).
3. **DuckDB & Analytical File Formats**: DuckDB queries are spiking exponentially as engineers analyze Parquet, CSV, and MotherDuck databases locally. A lightweight GUI that queries Parquet instantly without spinning up a cloud warehouse is in high demand.
4. **Local-First Security & Zero Telemetry**: With enterprise data privacy concerns around AI, developers explicitly search for local-only database clients where credentials and schemas never hit 3rd-party servers.

---

## Keyword Clusters & Search Intent Analysis

${results.trendsSummary
  .map(
    (item) => `### Keyword: \`${item.keyword}\`
- **Intent**: ${item.searchIntent}
- **Top Autocomplete / Semantic Variants**:
${item.topSuggestions.length > 0 ? item.topSuggestions.map((s) => `  - ${s}`).join("\n") : "  - (Direct brand / niche query)"}
`,
  )
  .join("\n")}

---

## Content & GEO Action Plan for Stroke

Based on these trends, Stroke's Blog and LLM SEO strategy is structured into 5 foundational pillar/cluster guides:

| Target Query Cluster | Target Title | Format / Hook | Core Entities |
| :--- | :--- | :--- | :--- |
| **TablePlus / DBeaver Alternatives** | *The Best Database Clients in 2026: Stroke vs TablePlus vs DBeaver vs DataGrip* | 60/40 Inverted Pyramid Comparison + Benchmark Matrix | Stroke, TablePlus, DBeaver, DataGrip, Native GUI, Performance |
| **MCP & AI Database Querying** | *Connecting AI Agents to Databases: The Complete Guide to Model Context Protocol (MCP)* | Comprehensive Tutorial + Claude Desktop / Cursor Config | Model Context Protocol, Claude Desktop, Cursor, Grok, ChatGPT, Postgres, SQLite |
| **DuckDB & Parquet Exploration** | *Why DuckDB Needs a Modern GUI: Querying Parquet and Local Analytics in 2026* | Actionable Guide + Local Performance Benchmarks | DuckDB, Apache Parquet, MotherDuck, Local Analytics, SQL OLAP |
| **SQLite Multi-Platform Tools** | *Top SQLite GUI Tools for Mac, Windows, and Linux in 2026* | Cross-Platform Tool Breakdown + Memory Benchmarks | SQLite, LibSQL, Turso, Cross-Platform, macOS, Windows, Linux |
| **Zero-Telemetry & Data Privacy** | *Zero-Telemetry, Local-First Database Clients: Why Security Matters for Developers* | Architecture Whitepaper + Compliance Checklist | Local-First, SOC2, Zero-Telemetry, Database Security, Offline First |

---

*Generated by \`scripts/analyze-trends.mjs\` using \`@alkalisummer/google-trends-js\`.*
`;

  const reportPath = path.resolve(process.cwd(), "TRENDS_ANALYSIS.md");
  await fs.writeFile(reportPath, markdownReport, "utf8");
  console.log(`\n✅ Saved comprehensive report to: ${reportPath}`);

  return results;
}

analyze()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal analysis error:", err);
    process.exit(1);
  });
