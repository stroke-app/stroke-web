import { createFileRoute } from "@tanstack/react-router";

import { env } from "#/env/server";

// Contents API with the raw media type returns the file body directly, and
// honours GITHUB_TOKEN for a higher rate limit. Pinned to a branch: the repo's
// default branch is `nightly` now, and an unpinned read listed Nightly-only
// versions as released, to the site and to every app that reads this.
const CHANGELOG_API = "https://api.github.com/repos/stroke-app/stroke/contents/CHANGELOG.md";
/** `stable` (the default, what is released) reads master; `nightly` reads nightly. */
const BRANCH = { stable: "master", nightly: "nightly" } as const;
const CACHE_SECONDS = 300;

/**
 * Proxies the repo's CHANGELOG.md so the changelog page renders the curated,
 * hand-written notes rather than sparse GitHub release bodies. Cached at the
 * edge and immune to GitHub's per-visitor rate limits.
 */
export const Route = createFileRoute("/api/changelog")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const channel =
          new URL(request.url).searchParams.get("channel") === "nightly" ? "nightly" : "stable";
        const upstream = await fetch(`${CHANGELOG_API}?ref=${BRANCH[channel]}`, {
          headers: {
            Accept: "application/vnd.github.raw",
            // GitHub rejects requests without a User-Agent
            "User-Agent": "stroke-web (stroke.click)",
            ...(env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
          },
        });

        if (!upstream.ok) {
          return Response.json(
            { error: `GitHub responded with ${upstream.status}` },
            { status: 502 },
          );
        }

        const markdown = await upstream.text();

        return new Response(markdown, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Cache-Control": `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
          },
        });
      },
    },
  },
});
