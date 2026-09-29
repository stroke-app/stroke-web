import { createFileRoute } from "@tanstack/react-router";

import { LandingPage } from "#/components/landing-page";
import { approvedReviewsQueryOptions } from "#/lib/reviews/functions";
import { jsonLd, seo, SITE_IDENTITY, SITE_URL } from "#/lib/seo";

const APP = {
  "@type": "SoftwareApplication",
  "@id": `${SITE_URL}/#app`,
  name: "Stroke",
  publisher: { "@id": `${SITE_URL}/#organization` },
  image: `${SITE_URL}/icon.png`,
  screenshot: `${SITE_URL}/app-screenshot.png`,
  operatingSystem: "macOS, Windows, Linux",
  applicationCategory: "DeveloperApplication",
  description:
    "Fast, elegant, and designed for engineers and analysts who care about their tools. Rethink how you query, explore, and work with data. A native database client for PostgreSQL, MySQL, SQLite, SQL Server, ClickHouse, DuckDB, and more, with a built-in MCP server for AI agents.",
  url: SITE_URL,
  downloadUrl: `${SITE_URL}/download`,
  offers: {
    "@type": "Offer",
    price: "9.99",
    priceCurrency: "USD",
  },
};

export const Route = createFileRoute("/")({
  // Await so approved reviews are in the SSR HTML (SEO + no layout shift),
  // not just the client-hydrated cache.
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(approvedReviewsQueryOptions());
  },
  head: () => ({
    ...seo({
      title: "Stroke · The database studio for agents and humans",
      description:
        "Fast, elegant, and designed for engineers and analysts who care about their tools. Rethink how you query, explore, and work with data. A native database client for PostgreSQL, MySQL, SQLite, ClickHouse, DuckDB, and more, with a built-in MCP server for AI agents.",
      path: "/",
    }),
    scripts: [jsonLd([...SITE_IDENTITY, APP])],
  }),
  component: LandingPage,
});
