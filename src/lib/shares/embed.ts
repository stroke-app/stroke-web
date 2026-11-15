/**
 * Embedding a share in another site: an <iframe> of /e/:id, styled from the
 * query string, with the decryption key still in the #fragment (never sent to
 * a server, not even ours).
 *
 * Styling is a fixed set of validated tokens (theme, colours as hex, radius,
 * font, which chrome shows). Free-form CSS is not accepted: a URL anyone can
 * write must not be able to restyle content served from stroke.click.
 */

export type EmbedTheme = "auto" | "light" | "dark";
export type EmbedFont = "sans" | "serif" | "mono" | "system";

export interface EmbedOptions {
  theme: EmbedTheme;
  /** Background: a hex colour, or "transparent" to sit on the host page. */
  bg: string;
  /** Accent (links, highlights): a hex colour, or "" for Stroke's. */
  accent: string;
  /** Corner radius of the frame, px. */
  radius: number;
  font: EmbedFont;
  /** A hairline around the embed. */
  border: boolean;
  /** The share's title above it. */
  title: boolean;
  /** A table's search / filter / download bar. */
  toolbar: boolean;
  /** The small "Shared with Stroke" line. */
  footer: boolean;
  /** The embed reports its content height to embed.js, which sizes the iframe. */
  autoHeight: boolean;
}

export const DEFAULT_EMBED: EmbedOptions = {
  theme: "auto",
  bg: "",
  accent: "",
  radius: 12,
  font: "sans",
  border: true,
  title: true,
  toolbar: true,
  footer: true,
  autoHeight: false,
};

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const hex = (v: string | null) => (v && HEX.test(v) ? `#${v.replace(/^#/, "").toLowerCase()}` : "");
const flag = (v: string | null, d: boolean) => (v === null ? d : v === "1" || v === "true");

/** Options from an embed URL's query string; anything invalid falls back to the default. */
export function parseEmbedOptions(search: string): EmbedOptions {
  const p = new URLSearchParams(search);
  const theme = p.get("theme");
  const font = p.get("font");
  const bg = p.get("bg");
  const radius = Number(p.get("radius"));
  return {
    theme: theme === "light" || theme === "dark" ? theme : "auto",
    bg: bg === "transparent" ? "transparent" : hex(bg),
    accent: hex(p.get("accent")),
    radius:
      Number.isFinite(radius) && p.has("radius")
        ? Math.max(0, Math.min(24, Math.round(radius)))
        : DEFAULT_EMBED.radius,
    font: font === "serif" || font === "mono" || font === "system" ? font : "sans",
    border: flag(p.get("border"), DEFAULT_EMBED.border),
    title: flag(p.get("title"), DEFAULT_EMBED.title),
    toolbar: flag(p.get("toolbar"), DEFAULT_EMBED.toolbar),
    footer: flag(p.get("footer"), DEFAULT_EMBED.footer),
    autoHeight: flag(p.get("autoheight"), DEFAULT_EMBED.autoHeight),
  };
}

/** The query string for a set of options: only what differs from the default. */
export function embedQuery(o: EmbedOptions): string {
  const p = new URLSearchParams();
  if (o.theme !== DEFAULT_EMBED.theme) p.set("theme", o.theme);
  if (o.bg) p.set("bg", o.bg === "transparent" ? "transparent" : o.bg.replace(/^#/, ""));
  if (o.accent) p.set("accent", o.accent.replace(/^#/, ""));
  if (o.radius !== DEFAULT_EMBED.radius) p.set("radius", String(o.radius));
  if (o.font !== DEFAULT_EMBED.font) p.set("font", o.font);
  for (const k of ["border", "title", "toolbar", "footer"] as const)
    if (o[k] !== DEFAULT_EMBED[k]) p.set(k, o[k] ? "1" : "0");
  if (o.autoHeight) p.set("autoheight", "1");
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const FONT_STACK: Record<EmbedFont, string> = {
  sans: "var(--font-sans, ui-sans-serif, system-ui, sans-serif)",
  serif: "ui-serif, Georgia, 'Times New Roman', serif",
  mono: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
  system: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
};

/** The embed URL: options in the query, the key in the fragment. */
export function embedUrl(origin: string, id: string, key: string, o: EmbedOptions) {
  return `${origin}/e/${encodeURIComponent(id)}${embedQuery(o)}#${key}`;
}

/** Copy-paste HTML for a host page. */
export function embedCode(src: string, o: EmbedOptions, height: number, title: string) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const iframe = `<iframe src="${esc(src)}" title="${esc(title || "Shared from Stroke")}" width="100%" height="${height}" style="border:0;width:100%;max-width:100%;${o.radius ? `border-radius:${o.radius}px;` : ""}${o.bg === "transparent" ? "background:transparent;" : ""}" loading="lazy" referrerpolicy="no-referrer" allow="clipboard-write"${o.autoHeight ? " data-stroke-embed" : ""}></iframe>`;
  return o.autoHeight
    ? `${iframe}\n<script async src="${new URL(src).origin}/embed.js"></script>`
    : iframe;
}
