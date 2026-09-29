import { createFileRoute } from "@tanstack/react-router";

import { env } from "#/env/server";
import { REPO_SLUG } from "#/lib/releases";

const TAGS_API = `https://api.github.com/repos/${REPO_SLUG}/tags?per_page=100`;
const CACHE_SECONDS = 600;

interface GitHubTag {
  name: string;
  commit: { sha: string };
}

/**
 * The repo's release tags and the commit each one points at, so the changelog
 * can link every version to its exact commit. Cached at the edge like the
 * changelog proxy, so visitors never hit GitHub's rate limit.
 */
export const Route = createFileRoute("/api/tags")({
  server: {
    handlers: {
      GET: async () => {
        const upstream = await fetch(TAGS_API, {
          headers: {
            Accept: "application/vnd.github+json",
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

        const tags = (await upstream.json()) as GitHubTag[];
        return Response.json(
          tags.map((t) => ({ name: t.name, sha: t.commit.sha })),
          {
            headers: {
              "Cache-Control": `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
            },
          },
        );
      },
    },
  },
});
