import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

import { env } from "#/env/server";
import { REPO_SLUG } from "#/lib/releases";

/** The newest stable release, trimmed to what the download UI renders. */
const releaseSchema = z.object({
  tag_name: z.string(),
  html_url: z.string(),
  published_at: z.string(),
  assets: z.array(
    z.object({ name: z.string(), browser_download_url: z.string(), size: z.number() }),
  ),
});

export type LatestRelease = z.infer<typeof releaseSchema>;

const CACHE_MS = 5 * 60 * 1000;

// Kept per isolate, so server-rendered download pages don't call GitHub on
// every view. A failed fetch is dropped so the next request retries.
let cached: { at: number; release: Promise<LatestRelease> } | null = null;

async function fetchLatestRelease() {
  const res = await fetch(`https://api.github.com/repos/${REPO_SLUG}/releases/latest`, {
    headers: {
      Accept: "application/vnd.github+json",
      // GitHub rejects requests without a User-Agent
      "User-Agent": "stroke-web (stroke.click)",
      ...(env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
    },
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error(`GitHub responded with ${res.status}`);
  return releaseSchema.parse(await res.json());
}

/** Latest stable release. Server-side, so pages can render it in their HTML. */
export const $getLatestRelease = createServerFn({ method: "GET" }).handler(() => {
  if (!cached || Date.now() - cached.at > CACHE_MS) {
    const release = fetchLatestRelease();
    cached = { at: Date.now(), release };
    release.catch(() => {
      if (cached?.release === release) cached = null;
    });
  }
  return cached.release;
});

export const latestReleaseQueryOptions = () =>
  queryOptions({
    queryKey: ["latest-release"],
    queryFn: () => $getLatestRelease(),
    staleTime: CACHE_MS,
    retry: 1,
  });
