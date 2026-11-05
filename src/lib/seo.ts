export const SITE_URL = "https://stroke.click";
export const SITE_NAME = "Stroke";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og.png`;
const DEFAULT_OG_IMAGE_ALT =
  "Stroke, the database client for agents and humans: Postgres, MySQL, SQLite, ClickHouse, DuckDB and more. $9.99, own it forever.";
export const REPO_URL = "https://github.com/stroke-app/stroke";

/** Every engine Stroke connects to today, for copy and structured data. */
export const ENGINES =
  "PostgreSQL, MySQL, MariaDB, SQLite, DuckDB, SQL Server, ClickHouse, CockroachDB, Turso / LibSQL, and Cloudflare D1";

export const ORGANIZATION = {
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
};

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
  ORGANIZATION,
];

/**
 * The app as a SoftwareApplication node. "Stroke" alone is an ambiguous word,
 * so the alternate names pair it with what it is. Pages without the full site
 * identity should add ORGANIZATION too, so `publisher` resolves.
 */
export function softwareApplication({
  path,
  description,
  operatingSystem = "macOS, Windows, Linux",
  downloadUrl,
  softwareVersion,
  screenshots = [],
}: {
  /** The page describing this app (or one OS build of it). */
  path: string;
  description: string;
  operatingSystem?: string;
  /** Direct file links when the release is known; the page otherwise. */
  downloadUrl?: string | string[];
  /** Only from real release data; left out rather than guessed. */
  softwareVersion?: string;
  /** Site paths of extra product screenshots, e.g. "/features/view-table.webp". */
  screenshots?: string[];
}) {
  // One app across the site; each OS page describes its own build.
  const osPage = path.startsWith("/download/");
  const url = osPage ? `${SITE_URL}${path}` : `${SITE_URL}/`;
  return {
    "@type": "SoftwareApplication",
    "@id": `${url}#app`,
    name: SITE_NAME,
    alternateName: ["Stroke database client", "Stroke DB", "Stroke DB client"],
    description,
    url,
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Database client",
    operatingSystem,
    downloadUrl: downloadUrl ?? `${SITE_URL}/download`,
    installUrl: osPage ? url : `${SITE_URL}/download`,
    ...(softwareVersion ? { softwareVersion } : {}),
    releaseNotes: `${SITE_URL}/changelog`,
    image: `${SITE_URL}/icon.png`,
    screenshot: [`${SITE_URL}/app-screenshot.png`, ...screenshots.map((s) => `${SITE_URL}${s}`)],
    publisher: { "@id": `${SITE_URL}/#organization` },
    offers: {
      "@type": "Offer",
      price: "9.99",
      priceCurrency: "USD",
      url: `${SITE_URL}/pricing`,
      description:
        "Free to try with every feature unlocked and no account. $9.99 once for a license key on up to 2 devices and every future update.",
    },
  };
}

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
  /** Describes `image` for people who can't see it. Required with a custom image. */
  imageAlt?: string;
  /** OpenGraph type, "website" (default) or "article" for blog posts */
  type?: "website" | "article";
  /** Target keywords for entity mapping and search queries */
  keywords?: string[] | string;
  /** Metadata specific to articles / blog posts */
  articleMeta?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  /**
   * Trail from the home page down to this page, e.g.
   * [{ name: "Download", path: "/download" }, { name: "Linux", path: "/download/linux" }].
   * Emitted as BreadcrumbList structured data. Home is prepended for you.
   */
  breadcrumbs?: { name: string; path: string }[];
  /** More structured-data nodes, emitted in the same JSON-LD graph as the breadcrumbs. */
  schema?: Record<string, unknown>[];
}

/**
 * Schema.org BlogPosting node for articles and editorial guides.
 * Enables rich snippet previews and AI passage citation.
 */
export function articleSchema({
  path,
  title,
  description,
  publishedAt,
  updatedAt,
  author,
  image = DEFAULT_OG_IMAGE,
  keywords,
  section,
  wordCount,
}: {
  path: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: { name: string; role?: string; url?: string };
  image?: string;
  keywords?: string[];
  section?: string;
  wordCount?: number;
}) {
  const url = `${SITE_URL}${path}`;
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: title,
    description,
    url,
    inLanguage: "en-US",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    datePublished: publishedAt,
    dateModified: updatedAt ?? publishedAt,
    author: {
      "@type": "Person",
      name: author.name,
      ...(author.role ? { jobTitle: author.role } : {}),
      ...(author.url ? { url: author.url } : {}),
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    image: {
      "@type": "ImageObject",
      url: image,
      width: 1200,
      height: 630,
    },
    ...(keywords && keywords.length > 0 ? { keywords: keywords.join(", ") } : {}),
    ...(section ? { articleSection: section } : {}),
    ...(wordCount ? { wordCount } : {}),
  };
}

/**
 * Schema.org FAQPage node for high-intent Q&A sections.
 * Essential for Google AI Overviews and Perplexity search answers.
 */
export function faqPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Standard head tags for a public page: title, description, canonical,
 * robots, and Open Graph / Twitter cards. Spread the result into a route's
 * head():
 *
 *   head: () => seo({ title, description, path: "/download" })
 */
export function seo({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  imageAlt = DEFAULT_OG_IMAGE_ALT,
  type = "website",
  keywords,
  articleMeta,
  breadcrumbs,
  schema = [],
}: SeoOptions) {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const trail = breadcrumbs ? [{ name: SITE_NAME, path: "/" }, ...breadcrumbs] : null;
  const graph = [
    ...schema,
    ...(trail
      ? [
          {
            "@type": "BreadcrumbList",
            itemListElement: trail.map((crumb, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: crumb.name,
              item: `${SITE_URL}${crumb.path === "/" ? "/" : crumb.path}`,
            })),
          },
        ]
      : []),
  ];

  const metaList: Record<string, string>[] = [
    { title },
    { name: "description", content: description },
    // Lets search show large screenshots and full snippets for public pages.
    {
      name: "robots",
      content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: imageAlt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: imageAlt },
  ];

  if (keywords) {
    const kwString = Array.isArray(keywords) ? keywords.join(", ") : keywords;
    metaList.push({ name: "keywords", content: kwString });
  }

  if (type === "article" && articleMeta) {
    if (articleMeta.publishedTime) {
      metaList.push({ property: "article:published_time", content: articleMeta.publishedTime });
    }
    if (articleMeta.modifiedTime) {
      metaList.push({ property: "article:modified_time", content: articleMeta.modifiedTime });
    }
    if (articleMeta.author) {
      metaList.push({ property: "article:author", content: articleMeta.author });
    }
    if (articleMeta.section) {
      metaList.push({ property: "article:section", content: articleMeta.section });
    }
    if (articleMeta.tags) {
      for (const tag of articleMeta.tags) {
        metaList.push({ property: "article:tag", content: tag });
      }
    }
  }

  return {
    meta: metaList,
    links: [{ rel: "canonical", href: url }],
    scripts: graph.length > 0 ? [jsonLd(graph)] : [],
  };
}

/** Head tags for private or auth pages that should stay out of search results. */
export function noIndex() {
  return {
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  };
}
