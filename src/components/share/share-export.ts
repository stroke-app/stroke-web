// Downloads for a shared result, all made in the browser from the decrypted
// rows: nothing goes back to the server.

export type ExportFormat = "csv" | "tsv" | "json" | "ndjson" | "markdown" | "sql" | "excel";

export const EXPORT_FORMATS: { id: ExportFormat; label: string; ext: string; hint: string }[] = [
  { id: "csv", label: "CSV", ext: "csv", hint: "Spreadsheets, most tools" },
  { id: "excel", label: "Excel", ext: "xls", hint: "Opens in Excel and Numbers" },
  { id: "tsv", label: "TSV", ext: "tsv", hint: "Tab separated" },
  { id: "json", label: "JSON", ext: "json", hint: "An array of objects" },
  { id: "ndjson", label: "JSON Lines", ext: "jsonl", hint: "One object per line" },
  { id: "markdown", label: "Markdown", ext: "md", hint: "A table for docs and issues" },
  { id: "sql", label: "SQL INSERT", ext: "sql", hint: "Statements to load it again" },
];

export function cellText(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

const csvCell = (s: string) => (/[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
const tsvCell = (s: string) => s.replace(/[\t\n\r]/g, " ");
const mdCell = (s: string) => s.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
const htmlCell = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const sqlIdent = (s: string) => `"${s.replace(/"/g, '""')}"`;

function sqlValue(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  return `'${cellText(v).replace(/'/g, "''")}'`;
}

/** The file for `rows` (already filtered, sorted and limited to the visible columns). */
export function exportRows(
  format: ExportFormat,
  columns: string[],
  rows: unknown[][],
  table: string,
): { body: string; type: string } {
  switch (format) {
    case "csv":
      return {
        body: [
          columns.map(csvCell).join(","),
          ...rows.map((r) => r.map((v) => csvCell(cellText(v))).join(",")),
        ].join("\n"),
        type: "text/csv",
      };
    case "tsv":
      return {
        body: [
          columns.map(tsvCell).join("\t"),
          ...rows.map((r) => r.map((v) => tsvCell(cellText(v))).join("\t")),
        ].join("\n"),
        type: "text/tab-separated-values",
      };
    case "json":
      return {
        body: JSON.stringify(
          rows.map((r) => Object.fromEntries(columns.map((c, i) => [c, r[i] ?? null]))),
          null,
          2,
        ),
        type: "application/json",
      };
    case "ndjson":
      return {
        body: rows
          .map((r) => JSON.stringify(Object.fromEntries(columns.map((c, i) => [c, r[i] ?? null]))))
          .join("\n"),
        type: "application/x-ndjson",
      };
    case "markdown": {
      const head = `| ${columns.map(mdCell).join(" | ")} |`;
      const rule = `| ${columns.map(() => "---").join(" | ")} |`;
      return {
        body: [
          head,
          rule,
          ...rows.map((r) => `| ${r.map((v) => mdCell(cellText(v))).join(" | ")} |`),
        ].join("\n"),
        type: "text/markdown",
      };
    }
    case "sql": {
      const name = sqlIdent(table || "shared");
      const cols = columns.map(sqlIdent).join(", ");
      return {
        body: rows
          .map((r) => `INSERT INTO ${name} (${cols}) VALUES (${r.map(sqlValue).join(", ")});`)
          .join("\n"),
        type: "application/sql",
      };
    }
    case "excel": {
      // An HTML table with Excel's namespace: Excel and Numbers open it as a sheet,
      // with no spreadsheet library in the page.
      const th = columns.map((c) => `<th>${htmlCell(c)}</th>`).join("");
      const trs = rows
        .map((r) => `<tr>${r.map((v) => `<td>${htmlCell(cellText(v))}</td>`).join("")}</tr>`)
        .join("");
      return {
        body: `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></body></html>`,
        type: "application/vnd.ms-excel",
      };
    }
  }
}

export function downloadFile(name: string, body: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type: `${type};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function fileStem(title: string) {
  return title.replace(/[^\w.-]+/g, "_").replace(/^_+|_+$/g, "") || "share";
}
