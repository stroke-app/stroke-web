import { createFileRoute } from "@tanstack/react-router";

import { LandingPage } from "#/components/landing-page";
import { TAGLINE } from "#/components/site-chrome";
import { latestReleaseQueryOptions } from "#/lib/latest-release";
import { approvedReviewsQueryOptions } from "#/lib/reviews/functions";
import { ENGINES, seo, SITE_IDENTITY, softwareApplication } from "#/lib/seo";

const DESCRIPTION = `Stroke is a native database client for PostgreSQL, MySQL, SQLite, SQL Server, ClickHouse, DuckDB, and more. Query, browse, and edit every database you run in one fast app, with a built-in MCP server for AI agents.`;

const APP = softwareApplication({
  path: "/",
  description: `${TAGLINE} It connects to ${ENGINES}, and ships a built-in MCP server so AI agents can query the same databases.`,
});

export const Route = createFileRoute("/")({
  // Await so approved reviews are in the SSR HTML (SEO + no layout shift),
  // not just the client-hydrated cache.
  loader: async ({ context }) => {
    // Reviews and the latest release render on the server (SEO, and the hero
    // button shows its version without a flash).
    await Promise.all([
      context.queryClient.ensureQueryData(approvedReviewsQueryOptions()),
      context.queryClient.ensureQueryData(latestReleaseQueryOptions()),
    ]);
  },
  head: () =>
    seo({
      title: "Stroke · Native database client for Postgres, MySQL, SQLite & more",
      description: DESCRIPTION,
      path: "/",
      schema: [...SITE_IDENTITY, APP],
    }),
  component: LandingPage,
});
