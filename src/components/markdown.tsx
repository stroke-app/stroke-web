import type { ReactNode } from "react";

import { cn } from "#/lib/utils";

/**
 * Minimal markdown renderer for GitHub release notes. Supports headings,
 * ordered and unordered lists, fenced code blocks, blockquotes, images, bold,
 * inline code, and links. Renders to React elements, so no HTML injection is
 * possible.
 *
 * With `repoUrl`, bare commit ids (7 to 40 hex characters) and `#123`
 * references link to that repository's commits and issues, as on GitHub.
 */
export function Markdown({
  text,
  repoUrl,
  className,
}: {
  text: string;
  repoUrl?: string;
  className?: string;
}) {
  return (
    <div className={cn("text-[15px] leading-[1.7] text-pretty text-soft", className)}>
      {parseBlocks(text, repoUrl)}
    </div>
  );
}

// A commit id must mix digits and letters, so ordinary words like "decade"
// or numbers like "2026091" are left alone.
const INLINE_RE =
  /(`[^`]+`)|(\*\*[^*]+\*\*)|!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^\s)]+)\)|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\b((?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{7,40})\b|(?<![\w/&])#(\d+)\b/g;

// A line that is only an image becomes a full-width figure.
const BLOCK_IMAGE_RE = /^!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^\s)]+)\)\s*$/;

const LINK =
  "text-foreground underline decoration-white/25 underline-offset-[3px] transition-colors hover:decoration-white/70";

const REF_LINK =
  "font-mono text-[0.84em] text-muted-foreground underline decoration-white/15 underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-white/50";

function renderInline(text: string, repoUrl?: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(INLINE_RE)) {
    const index = m.index;
    if (index > last) nodes.push(text.slice(last, index));
    if (m[1]) {
      nodes.push(
        <code
          key={key++}
          className="rounded-[5px] border border-white/[0.07] bg-white/[0.045] px-[0.35em] py-px font-mono text-[0.84em] text-foreground"
        >
          {m[1].slice(1, -1)}
        </code>,
      );
    } else if (m[2]) {
      nodes.push(
        <strong key={key++} className="font-[560] text-foreground">
          {m[2].slice(2, -2)}
        </strong>,
      );
    } else if (m[4]) {
      nodes.push(
        <img
          key={key++}
          src={m[4]}
          alt={m[3] ?? ""}
          loading="lazy"
          decoding="async"
          className="inline-block max-w-full rounded-md border border-border align-middle"
        />,
      );
    } else if (m[5] && m[6]) {
      nodes.push(
        <a key={key++} href={m[6]} target="_blank" rel="noopener noreferrer" className={LINK}>
          {m[5]}
        </a>,
      );
    } else if (m[7] || m[8]) {
      const label = m[7] ? m[7].slice(0, 7) : `#${m[8]}`;
      nodes.push(
        repoUrl ? (
          <a
            key={key++}
            href={m[7] ? `${repoUrl}/commit/${m[7]}` : `${repoUrl}/issues/${m[8]}`}
            target="_blank"
            rel="noopener noreferrer"
            className={REF_LINK}
          >
            {label}
          </a>
        ) : (
          m[0]
        ),
      );
    }
    last = index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** "New Features" → "New features". Acronyms and mixed-case words are kept. */
function sentenceCase(text: string) {
  return text
    .split(" ")
    .map((word, i) => (i > 0 && /^[A-Z][a-z]+$/.test(word) ? word.toLowerCase() : word))
    .join(" ");
}

type BlockKind = "section" | "heading" | "text";

/**
 * Space above a block, from what came before it: a section heading opens a
 * wide gap, a sub-heading a smaller one, and text under a heading sits close.
 */
function gapAbove(prev: BlockKind | null, kind: BlockKind) {
  if (!prev) return "";
  if (kind === "section") return "mt-12";
  if (kind === "heading") return prev === "section" ? "mt-5" : "mt-9";
  if (prev === "section") return "mt-5";
  if (prev === "heading") return "mt-3";
  return "mt-4";
}

const UL_ITEM = /^\s*[-*+]\s+/;
const OL_ITEM = /^\s*\d+[.)]\s+/;

function parseBlocks(text: string, repoUrl?: string): ReactNode[] {
  const lines = text.replaceAll("\r\n", "\n").split("\n");
  const blocks: ReactNode[] = [];
  let prev: BlockKind | null = null;
  let key = 0;
  let i = 0;

  // Each block takes its top margin from the one before it.
  const push = (kind: BlockKind, render: (gap: string) => ReactNode) => {
    blocks.push(render(gapAbove(prev, kind)));
    prev = kind;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    // fenced code block
    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++; // closing fence
      push("text", (gap) => (
        <pre
          key={key++}
          className={cn(
            "overflow-x-auto rounded-lg border border-border bg-[#0b0c0d] px-4 py-3.5 font-mono text-[13px] leading-[1.7] text-soft shadow-[0_1px_0_0_rgb(255_255_255/0.04)_inset]",
            gap,
          )}
        >
          <code>{code.join("\n")}</code>
        </pre>
      ));
      continue;
    }

    // horizontal rule
    if (/^-{3,}\s*$/.test(line)) {
      i++;
      continue;
    }

    // Heading, level-aware so sections read as a hierarchy. Within a
    // changelog entry, "###" are category labels (New features, Fixes, …),
    // drawn as a quiet label with a hairline, and "####" are the areas inside
    // them (SQL editor, Sidebar, …).
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      if (level <= 3) {
        const content = renderInline(sentenceCase(heading[2]), repoUrl);
        push("section", (gap) => (
          <h3
            key={key++}
            className={cn(
              "flex items-center gap-3 text-[13px] leading-none font-medium text-muted-foreground after:h-px after:flex-1 after:bg-border",
              gap,
            )}
          >
            {content}
          </h3>
        ));
      } else {
        const content = renderInline(heading[2], repoUrl);
        push("heading", (gap) => (
          <h4
            key={key++}
            className={cn("text-[15px] font-[560] tracking-[-0.01em] text-foreground", gap)}
          >
            {content}
          </h4>
        ));
      }
      i++;
      continue;
    }

    // block image
    const image = BLOCK_IMAGE_RE.exec(line);
    if (image) {
      push("text", (gap) => (
        <img
          key={key++}
          src={image[2]}
          alt={image[1]}
          loading="lazy"
          decoding="async"
          className={cn("w-full rounded-xl border border-border bg-card", gap)}
        />
      ));
      i++;
      continue;
    }

    // list, bulleted or numbered
    const ordered = OL_ITEM.test(line);
    if (ordered || UL_ITEM.test(line)) {
      const marker = ordered ? OL_ITEM : UL_ITEM;
      const items: string[] = [];
      while (i < lines.length && marker.test(lines[i])) {
        items.push(lines[i].replace(marker, ""));
        i++;
      }
      const List = ordered ? "ol" : "ul";
      push("text", (gap) => (
        <List key={key++} className={cn("space-y-2.5", gap)}>
          {items.map((item, n) => (
            <li key={n} className="relative pl-5">
              {ordered ? (
                <span
                  className="absolute left-0 font-mono text-[12px] leading-[inherit] text-faint tabular-nums"
                  aria-hidden="true"
                >
                  {n + 1}
                </span>
              ) : (
                <span
                  className="absolute top-[0.72em] left-1 size-[5px] rounded-full bg-white/25"
                  aria-hidden="true"
                />
              )}
              {renderInline(item, repoUrl)}
            </li>
          ))}
        </List>
      ));
      continue;
    }

    // blockquote
    if (line.startsWith(">")) {
      const quoted: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        quoted.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      push("text", (gap) => (
        <blockquote
          key={key++}
          className={cn("border-l-2 border-white/10 pl-4 text-muted-foreground", gap)}
        >
          {renderInline(quoted.join(" "), repoUrl)}
        </blockquote>
      ));
      continue;
    }

    // paragraph: consume until blank line or a line that starts another block
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,6}\s|```|\s*[-*+]\s|\s*\d+[.)]\s|>|-{3,}\s*$)/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    push("text", (gap) => (
      <p key={key++} className={gap}>
        {renderInline(para.join(" "), repoUrl)}
      </p>
    ));
  }

  return blocks;
}
