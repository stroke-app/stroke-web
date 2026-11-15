// Downloads for a shared schema diagram, built from its data (not a screenshot
// of the page), so an SVG or PNG is sharp at any size.

import type { ErdLink, ErdTable } from "#/lib/shares/crypto";

import { downloadFile, fileStem } from "./share-export";

export const ERD_CARD_W = 256;
export const ERD_HDR_H = 40;
export const ERD_ROW_H = 26;

type Pos = Map<string, { x: number; y: number }>;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const q = (s: string) => `"${s.replace(/"/g, '""')}"`;

function bounds(tables: ErdTable[], pos: Pos) {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (const t of tables) {
    const p = pos.get(t.name) ?? t;
    x0 = Math.min(x0, p.x);
    y0 = Math.min(y0, p.y);
    x1 = Math.max(x1, p.x + ERD_CARD_W);
    y1 = Math.max(y1, p.y + ERD_HDR_H + t.columns.length * ERD_ROW_H);
  }
  return tables.length ? { x0, y0, w: x1 - x0, h: y1 - y0 } : { x0: 0, y0: 0, w: 1, h: 1 };
}

/** The curve between two columns, as the page draws it. */
export function linkPath(
  a: { x: number; y: number },
  b: { x: number; y: number },
  sy: number,
  ty: number,
) {
  const fromRight = a.x + ERD_CARD_W <= b.x;
  const toRight = b.x + ERD_CARD_W <= a.x;
  const sx = fromRight ? a.x + ERD_CARD_W : a.x;
  const tx = toRight ? b.x + ERD_CARD_W : b.x;
  const dx = Math.max(40, Math.abs(tx - sx) / 2);
  const c1 = fromRight ? sx + dx : sx - dx;
  const c2 = toRight ? tx + dx : tx - dx;
  return `M${sx},${sy} C${c1},${sy} ${c2},${ty} ${tx},${ty}`;
}

export function colOffset(t: ErdTable, col: string) {
  const i = t.columns.findIndex((c) => c.name === col);
  return ERD_HDR_H + (i < 0 ? 0 : i) * ERD_ROW_H + ERD_ROW_H / 2;
}

/** The diagram as a standalone SVG, in the light or dark palette. */
export function erdSvg(tables: ErdTable[], links: ErdLink[], pos: Pos, dark: boolean) {
  const pal = dark
    ? {
        bg: "#0b0b0c",
        card: "#151517",
        head: "#1d1d20",
        line: "#2c2c30",
        text: "#ededef",
        soft: "#c4c4c8",
        faint: "#7c7c84",
        pk: "#fbbf24",
        fk: "#38bdf8",
        edge: "#6b6b73",
      }
    : {
        bg: "#ffffff",
        card: "#ffffff",
        head: "#f4f4f5",
        line: "#e4e4e7",
        text: "#18181b",
        soft: "#3f3f46",
        faint: "#8a8a93",
        pk: "#b45309",
        fk: "#0369a1",
        edge: "#a1a1aa",
      };
  const b = bounds(tables, pos);
  const pad = 32;
  const W = Math.ceil(b.w + pad * 2);
  const H = Math.ceil(b.h + pad * 2);
  const at = (t: ErdTable) => {
    const p = pos.get(t.name) ?? t;
    return { x: p.x - b.x0 + pad, y: p.y - b.y0 + pad };
  };
  const byName = new Map(tables.map((t) => [t.name, t]));
  const font = `font-family="Inter, -apple-system, Segoe UI, sans-serif"`;
  const mono = `font-family="ui-monospace, SFMono-Regular, Menlo, monospace"`;
  let out = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="${pal.bg}"/>`;
  for (const l of links) {
    const ta = byName.get(l.from);
    const tb = byName.get(l.to);
    if (!ta || !tb) continue;
    const a = at(ta);
    const c = at(tb);
    out += `<path d="${linkPath(a, c, a.y + colOffset(ta, l.fromCol), c.y + colOffset(tb, l.toCol))}" fill="none" stroke="${pal.edge}" stroke-width="1.4"/>`;
  }
  for (const t of tables) {
    const { x, y } = at(t);
    const h = ERD_HDR_H + t.columns.length * ERD_ROW_H;
    out += `<g><rect x="${x}" y="${y}" width="${ERD_CARD_W}" height="${h}" rx="10" fill="${pal.card}" stroke="${pal.line}"/>`;
    out += `<path d="M${x},${y + ERD_HDR_H} V${y + 10} a10,10 0 0 1 10,-10 H${x + ERD_CARD_W - 10} a10,10 0 0 1 10,10 V${y + ERD_HDR_H} Z" fill="${pal.head}"/>`;
    out += `<text x="${x + 12}" y="${y + 25}" ${font} font-size="13.5" font-weight="600" fill="${pal.text}">${esc(t.name)}</text>`;
    out += `<text x="${x + ERD_CARD_W - 12}" y="${y + 25}" ${font} font-size="11" text-anchor="end" fill="${pal.faint}">${t.columns.length}</text>`;
    t.columns.forEach((c, i) => {
      const ry = y + ERD_HDR_H + i * ERD_ROW_H;
      out += `<line x1="${x}" x2="${x + ERD_CARD_W}" y1="${ry}" y2="${ry}" stroke="${pal.line}"/>`;
      const color = c.pk ? pal.pk : c.fk ? pal.fk : pal.soft;
      out += `<text x="${x + 24}" y="${ry + 17}" ${font} font-size="12.5" fill="${color}"${c.pk ? ' font-weight="500"' : ""}>${esc(c.name)}</text>`;
      if (c.pk || c.fk)
        out += `<text x="${x + 10}" y="${ry + 17}" ${font} font-size="10" fill="${color}">${c.pk ? "◆" : "→"}</text>`;
      out += `<text x="${x + ERD_CARD_W - 12}" y="${ry + 17}" ${mono} font-size="11" text-anchor="end" fill="${pal.faint}">${esc(c.type ?? "")}</text>`;
    });
    out += `</g>`;
  }
  return { svg: `${out}</svg>`, width: W, height: H };
}

/** The diagram as Mermaid erDiagram source. */
export function erdMermaid(tables: ErdTable[], links: ErdLink[]) {
  const id = (s: string) => s.replace(/[^\w]/g, "_");
  const lines = ["erDiagram"];
  for (const t of tables) {
    lines.push(`  ${id(t.name)} {`);
    for (const c of t.columns) {
      const type = (c.type || "text").replace(/[^\w]/g, "_") || "text";
      lines.push(`    ${type} ${id(c.name)}${c.pk ? " PK" : c.fk ? " FK" : ""}`);
    }
    lines.push("  }");
  }
  for (const l of links) lines.push(`  ${id(l.to)} ||--o{ ${id(l.from)} : "${l.fromCol}"`);
  return lines.join("\n");
}

/** CREATE TABLE statements for the diagram (types as the source database names them). */
export function erdSql(tables: ErdTable[], links: ErdLink[]) {
  return tables
    .map((t) => {
      const cols = t.columns.map((c) => `  ${q(c.name)} ${c.type || "text"}`);
      const pk = t.columns.filter((c) => c.pk).map((c) => q(c.name));
      if (pk.length) cols.push(`  PRIMARY KEY (${pk.join(", ")})`);
      for (const l of links.filter((x) => x.from === t.name)) {
        cols.push(`  FOREIGN KEY (${q(l.fromCol)}) REFERENCES ${q(l.to)} (${q(l.toCol)})`);
      }
      return `CREATE TABLE ${q(t.name)} (\n${cols.join(",\n")}\n);`;
    })
    .join("\n\n");
}

export type ErdFormat = "png" | "svg" | "json" | "mermaid" | "sql";

export const ERD_FORMATS: { id: ErdFormat; label: string; hint: string; ext: string }[] = [
  { id: "png", label: "PNG image", hint: "For docs, chats and slides", ext: "png" },
  { id: "svg", label: "SVG image", hint: "Sharp at any size", ext: "svg" },
  { id: "sql", label: "SQL", hint: "CREATE TABLE statements", ext: "sql" },
  { id: "mermaid", label: "Mermaid", hint: "erDiagram for Markdown", ext: "mmd" },
  { id: "json", label: "JSON", hint: "Tables, columns and links", ext: "json" },
];

export async function downloadErd(
  fmt: ErdFormat,
  title: string,
  tables: ErdTable[],
  links: ErdLink[],
  pos: Pos,
  dark: boolean,
) {
  const stem = fileStem(title);
  if (fmt === "json") {
    const placed = tables.map((t) => ({ ...t, ...(pos.get(t.name) ?? {}) }));
    downloadFile(
      `${stem}.json`,
      JSON.stringify({ tables: placed, links }, null, 2),
      "application/json",
    );
  } else if (fmt === "mermaid") {
    downloadFile(`${stem}.mmd`, erdMermaid(tables, links), "text/plain");
  } else if (fmt === "sql") {
    downloadFile(`${stem}.sql`, erdSql(tables, links), "application/sql");
  } else {
    const { svg, width, height } = erdSvg(tables, links, pos, dark);
    if (fmt === "svg") {
      downloadFile(`${stem}.svg`, svg, "image/svg+xml");
      return;
    }
    // PNG at twice the size, drawn from the SVG.
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Couldn't draw the image"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(2, 2);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${stem}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }, "image/png");
  }
}
