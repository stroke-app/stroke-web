/**
 * Blog posts: Markdown files in src/content/blog with a small front matter
 * block (title, description, date, tags). Adding a post is adding a file.
 */
export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  body: string;
  /** Minutes to read, at 230 words a minute. */
  minutes: number;
}

const files = import.meta.glob("/src/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parse(path: string, raw: string): Post {
  const slug = path.split("/").pop()!.replace(/\.md$/, "");
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
  const meta: Record<string, string> = {};
  for (const line of (m?.[1] ?? "").split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  const body = (m?.[2] ?? raw).trim();
  return {
    slug,
    title: meta.title ?? slug,
    description: meta.description ?? "",
    date: meta.date ?? "",
    tags: (meta.tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    body,
    minutes: Math.max(1, Math.round(body.split(/\s+/).length / 230)),
  };
}

/** Newest first. */
export const POSTS: Post[] = Object.entries(files)
  .map(([path, raw]) => parse(path, raw))
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));

export function postBySlug(slug: string) {
  return POSTS.find((p) => p.slug === slug) ?? null;
}
