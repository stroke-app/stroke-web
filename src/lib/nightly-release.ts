import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

import { env } from "#/env/server";
import { REPO_SLUG } from "#/lib/releases";

/**
 * The rolling Stroke Nightly pre-release (tag `nightly`): its version, when
 * it was built, and its downloads. Same caching rule as latest-release.ts:
 * keep the finished result per isolate, never an in-flight promise.
 */
const schema = z.object({
  name: z.string(),
  html_url: z.string(),
  published_at: z.string(),
  assets: z.array(
    z.object({ name: z.string(), browser_download_url: z.string(), size: z.number() }),
  ),
});

export type NightlyRelease = z.infer<typeof schema> & { version: string };

const CACHE_MS = 5 * 60 * 1000;
let cached: { at: number; release: NightlyRelease } | null = null;

async function fetchNightly(): Promise<NightlyRelease> {
  const res = await fetch(`https://api.github.com/repos/${REPO_SLUG}/releases/tags/nightly`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "stroke-web (stroke.click)",
      ...(env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
    },
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error(`GitHub responded with ${res.status}`);
  const r = schema.parse(await res.json());
  // "Stroke Nightly 2.7.7-nightly.202611141539" → "2.7.7-nightly.202611141539"
  const version = /(\d+\.\d+\.\d+[^\s]*)/.exec(r.name)?.[1] ?? r.name;
  return { ...r, version };
}

export const $getNightlyRelease = createServerFn({ method: "GET" }).handler(async () => {
  if (cached && Date.now() - cached.at <= CACHE_MS) return cached.release;
  try {
    const release = await fetchNightly();
    cached = { at: Date.now(), release };
    return release;
  } catch (error) {
    if (cached) return cached.release;
    throw error;
  }
});

export const nightlyReleaseQueryOptions = () =>
  queryOptions({
    queryKey: ["nightly-release"],
    queryFn: () => $getNightlyRelease(),
    staleTime: CACHE_MS,
    retry: 1,
  });

/** Fixed asset names from nightly.yml, by platform. */
export const NIGHTLY_ASSETS = [
  { os: "macOS", detail: "Apple Silicon", file: "stroke-nightly_aarch64.dmg" },
  { os: "macOS", detail: "Intel", file: "stroke-nightly_x64.dmg" },
  { os: "Windows", detail: "64-bit installer", file: "stroke-nightly_x64-setup.exe" },
  { os: "Linux", detail: "AppImage", file: "stroke-nightly_amd64.AppImage" },
  { os: "Linux", detail: ".deb", file: "stroke-nightly_amd64.deb" },
] as const;

export const nightlyUrl = (file: string) =>
  `https://github.com/${REPO_SLUG}/releases/download/nightly/${file}`;
