import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import type { Arch, OS, Platform } from "#/lib/releases";

/**
 * The visitor's system, read on the server so the download button renders
 * right in the HTML instead of changing after load. Chromium sends
 * `Sec-CH-UA-Platform` on every request and `Sec-CH-UA-Arch` once the site
 * asks for it (`Accept-CH`, set in server.ts); every other browser is read
 * from its User-Agent. A Mac without the arch hint is taken as Apple
 * Silicon, as nearly every Mac in use is.
 */
export function platformFromHeaders(headers: Headers): Platform | null {
  const unquote = (v: string | null) => (v ?? "").replace(/"/g, "").trim().toLowerCase();
  const hint = unquote(headers.get("sec-ch-ua-platform"));
  const archHint = unquote(headers.get("sec-ch-ua-arch"));
  const ua = headers.get("user-agent") ?? "";

  let os: OS | null = null;
  if (hint === "macos") os = "macos";
  else if (hint === "windows") os = "windows";
  else if (hint === "linux" || hint === "chrome os") os = "linux";
  else if (/windows/i.test(ua)) os = "windows";
  else if (/macintosh|mac os x/i.test(ua) && !/iphone|ipad/i.test(ua)) os = "macos";
  else if (/linux/i.test(ua) && !/android/i.test(ua)) os = "linux";
  if (!os) return null;

  if (os === "macos") {
    const arch: Arch = archHint === "x86" ? "x64" : "arm64";
    return { os, arch, label: `macOS (${arch === "arm64" ? "Apple Silicon" : "Intel"})` };
  }
  if (os === "windows") return { os, arch: "x64", label: "Windows" };
  const arch: Arch = archHint === "arm" || /aarch64|arm64/i.test(ua) ? "arm64" : "x64";
  return { os, arch, label: "Linux" };
}

export const $getPlatform = createServerFn({ method: "GET" }).handler(async () =>
  platformFromHeaders(getRequest().headers),
);

/** Read once per visit: a computer's system doesn't change between pages. */
export const platformQueryOptions = () =>
  queryOptions({
    queryKey: ["platform"],
    queryFn: () => $getPlatform(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
