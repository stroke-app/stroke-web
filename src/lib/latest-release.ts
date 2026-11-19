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
// every view. Only the finished result is kept, never the in-flight promise:
// Workers drop a promise when the request that created it ends, so a cached
// promise from a cancelled (or early-finishing) request failed every request
// after it with "This promise was created by a request that has since ended"
// for the rest of the cache window, which took the home page down with a 500.
let cached: { at: number; release: LatestRelease } | null = null;

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

/**
 * Cloudflare's edge cache, shared by every isolate in a location. The
 * per-isolate copy above dies with the isolate, and new isolates start often,
 * so without this the first page view on each one waited 0.5-1.5 s for GitHub.
 */
const EDGE_KEY = "https://stroke.click/__cache/latest-release";
// Workers' CacheStorage has a `default` cache the DOM types don't know about.
const edgeCache = () => (caches as unknown as { default: Cache }).default;

async function fromEdge(): Promise<LatestRelease | null> {
  try {
    const hit = await edgeCache().match(EDGE_KEY);
    return hit ? releaseSchema.parse(await hit.json()) : null;
  } catch {
    return null;
  }
}

async function toEdge(release: LatestRelease) {
  try {
    await edgeCache().put(
      EDGE_KEY,
      new Response(JSON.stringify(release), {
        headers: {
          "content-type": "application/json",
          "cache-control": `public, max-age=${CACHE_MS / 1000}`,
        },
      }),
    );
  } catch {
    // No edge cache (local dev): the per-isolate copy still works.
  }
}

/** Latest stable release. Server-side, so pages can render it in their HTML. */
export const $getLatestRelease = createServerFn({ method: "GET" }).handler(async () => {
  if (cached && Date.now() - cached.at <= CACHE_MS) return cached.release;
  const edge = await fromEdge();
  if (edge) {
    cached = { at: Date.now(), release: edge };
    return edge;
  }
  try {
    const release = await fetchLatestRelease();
    cached = { at: Date.now(), release };
    await toEdge(release);
    return release;
  } catch (error) {
    // GitHub down or rate-limited: an older copy beats no download button.
    if (cached) return cached.release;
    throw error;
  }
});

export const latestReleaseQueryOptions = () =>
  queryOptions({
    queryKey: ["latest-release"],
    queryFn: () => $getLatestRelease(),
    staleTime: CACHE_MS,
    retry: 1,
  });
