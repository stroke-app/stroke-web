import { createFileRoute } from "@tanstack/react-router";

import { $getLatestRelease } from "#/lib/latest-release";
import { SITE_URL } from "#/lib/seo";

/**
 * Public, indexable pages. Add new marketing pages here. `release: true`
 * marks pages whose content changes with each release, so their lastmod is
 * the latest release date; the rest carry no lastmod rather than a guess.
 */
const PAGES: { path: string; priority: string; changefreq: string; release?: boolean }[] = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/download", priority: "0.9", changefreq: "weekly", release: true },
  { path: "/download/macos", priority: "0.9", changefreq: "weekly", release: true },
  { path: "/download/windows", priority: "0.9", changefreq: "weekly", release: true },
  { path: "/download/linux", priority: "0.9", changefreq: "weekly", release: true },
  { path: "/features", priority: "0.8", changefreq: "monthly" },
  { path: "/pricing", priority: "0.8", changefreq: "monthly" },
  { path: "/docs", priority: "0.7", changefreq: "monthly" },
  { path: "/docs/mcp", priority: "0.7", changefreq: "monthly" },
  { path: "/changelog", priority: "0.6", changefreq: "weekly", release: true },
  { path: "/roadmap", priority: "0.5", changefreq: "monthly" },
  { path: "/giveaway", priority: "0.5", changefreq: "weekly" },
  { path: "/terms", priority: "0.2", changefreq: "yearly" },
  { path: "/privacy", priority: "0.2", changefreq: "yearly" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const release = await $getLatestRelease().catch(() => null);
        const released = release?.published_at.slice(0, 10);

        const urls = PAGES.map((p) => {
          const lastmod = p.release && released ? `\n    <lastmod>${released}</lastmod>` : "";
          return `  <url>
    <loc>${SITE_URL}${p.path === "/" ? "" : p.path}</loc>${lastmod}
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`;
        }).join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
