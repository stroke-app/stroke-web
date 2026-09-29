export const SITE_URL = "https://stroke.click";
export const SITE_NAME = "Stroke";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og.png`;
export const REPO_URL = "https://github.com/stroke-app/stroke";

/**
 * Site identity for search engines. Google reads the WebSite name for the
 * site-name line above a result and the Organization logo for its icon, so
 * both ship on the home page.
 */
export const SITE_IDENTITY = [
  {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: ["Stroke database client", "stroke.click"],
    url: `${SITE_URL}/`,
    publisher: { "@id": `${SITE_URL}/#organization` },
  },
  {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon.png`,
      width: 1024,
      height: 1024,
    },
    sameAs: [REPO_URL],
  },
];

/** One JSON-LD script tag holding every node in `graph`. */
export function jsonLd(graph: Record<string, unknown>[]) {
  return {
    type: "application/ld+json",
    children: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
  };
}

interface SeoOptions {
  title: string;
  description: string;
  /** Route path used for the canonical URL and og:url, e.g. "/download" */
  path: string;
  image?: string;
  /**
   * Trail from the home page down to this page, e.g.
   * [{ name: "Download", path: "/download" }, { name: "Linux", path: "/download/linux" }].
   * Emitted as BreadcrumbList structured data. Home is prepended for you.
   */
  breadcrumbs?: { name: string; path: string }[];
}

/**
 * Standard head tags for a public page: title, description, canonical, and
 * Open Graph / Twitter cards. Spread the result into a route's head():
 *
 *   head: () => seo({ title, description, path: "/download" })
 */
export function seo({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  breadcrumbs,
}: SeoOptions) {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const trail = breadcrumbs ? [{ name: SITE_NAME, path: "/" }, ...breadcrumbs] : null;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: trail
      ? [
          jsonLd([
            {
              "@type": "BreadcrumbList",
              itemListElement: trail.map((crumb, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: crumb.name,
                item: `${SITE_URL}${crumb.path === "/" ? "/" : crumb.path}`,
              })),
            },
          ]),
        ]
      : [],
  };
}

/** Head tags for private or auth pages that should stay out of search results. */
export function noIndex() {
  return {
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  };
}
