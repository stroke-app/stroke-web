import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckIcon, CopyIcon, DownloadIcon, PaletteIcon } from "lucide-react";
import { useState } from "react";

import { PageHeader, PageShell, siteButton, WRAP } from "#/components/page";
import { seo } from "#/lib/seo";
import { cn } from "#/lib/utils";

/** One entry of /themes/index.json, the list the desktop app reads too. */
type ThemeEntry = {
  id: string;
  name: string;
  author?: string;
  appearance: "light" | "dark";
  file: string;
  description?: string;
  preview: {
    bg: string;
    fg: string;
    accent: string;
    sidebar?: string;
    border?: string;
    muted?: string;
  };
};

export const Route = createFileRoute("/themes")({
  head: () =>
    seo({
      title: "Themes · Stroke database client",
      description:
        "Community colour themes for Stroke. Download one, or add it in the app from Settings, Appearance, Add a theme. VS Code themes import too.",
      path: "/themes",
      breadcrumbs: [{ name: "Themes", path: "/themes" }],
    }),
  component: ThemesPage,
});

function useThemes() {
  return useQuery({
    queryKey: ["community-themes"],
    queryFn: async () => {
      const r = await fetch("/themes/index.json");
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = (await r.json()) as { themes?: ThemeEntry[] };
      return d.themes ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

function ThemesPage() {
  const { data: themes, isError } = useThemes();
  return (
    <PageShell>
      <PageHeader
        eyebrow="Themes"
        title="Make Stroke look like yours"
        description="Community colour themes. In the app, open Settings, Appearance, Add a theme, and pick one; or download the file and import it there. VS Code colour themes import as they are."
      />
      <section className={cn(WRAP, "pb-24")}>
        {isError ? (
          <p className="text-[15px] text-muted-foreground">
            Couldn't load the themes. Try again in a moment.
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(themes ?? []).map((t) => (
              <ThemeCard key={t.id} theme={t} />
            ))}
          </ul>
        )}
        <HowTo />
      </section>
    </PageShell>
  );
}

/** A tiny Stroke window in the theme's own colours: sidebar, tab, rows. */
function ThemePreview({ p }: { p: ThemeEntry["preview"] }) {
  const border = p.border ?? `${p.fg}22`;
  const muted = p.muted ?? `${p.fg}99`;
  return (
    <div
      className="flex h-40 overflow-hidden rounded-t-xl"
      style={{ background: p.bg }}
      aria-hidden
    >
      <div
        className="flex w-[30%] flex-col gap-1.5 p-3"
        style={{ background: p.sidebar ?? p.bg, borderRight: `1px solid ${border}` }}
      >
        <div className="mb-1 h-2 w-10 rounded-sm" style={{ background: muted, opacity: 0.6 }} />
        {[0.9, 0.7, 0.8, 0.6].map((w, i) => (
          <div
            key={i}
            className="flex h-4 items-center gap-1.5 rounded px-1"
            style={{ background: i === 1 ? `${p.accent}26` : "transparent" }}
          >
            <span
              className="size-1.5 rounded-sm"
              style={{ background: i === 1 ? p.accent : muted }}
            />
            <span
              className="h-1.5 rounded-sm"
              style={{
                width: `${w * 60}%`,
                background: i === 1 ? p.fg : muted,
                opacity: i === 1 ? 0.9 : 0.5,
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div
          className="flex h-7 items-end gap-1 px-2"
          style={{ borderBottom: `1px solid ${border}` }}
        >
          <span
            className="h-5 w-16 rounded-t-md"
            style={{
              background: p.sidebar ?? p.bg,
              border: `1px solid ${border}`,
              borderBottom: "none",
            }}
          />
          <span
            className="mb-1.5 h-1.5 w-8 rounded-sm"
            style={{ background: muted, opacity: 0.5 }}
          />
        </div>
        <div className="flex flex-col">
          {[0, 1, 2, 3, 4].map((r) => (
            <div
              key={r}
              className="flex h-5 items-center gap-3 px-3"
              style={{ borderBottom: `1px solid ${border}` }}
            >
              <span className="h-1.5 w-6 rounded-sm" style={{ background: muted, opacity: 0.6 }} />
              <span
                className="h-1.5 rounded-sm"
                style={{ width: `${30 + ((r * 17) % 30)}%`, background: p.fg, opacity: 0.75 }}
              />
              <span
                className="ml-auto h-1.5 w-8 rounded-sm"
                style={{ background: r === 2 ? p.accent : muted, opacity: r === 2 ? 1 : 0.5 }}
              />
            </div>
          ))}
        </div>
        <div className="mt-auto flex justify-end p-2">
          <span className="h-4 w-12 rounded" style={{ background: p.accent }} />
        </div>
      </div>
    </div>
  );
}

function ThemeCard({ theme: t }: { theme: ThemeEntry }) {
  const [copied, setCopied] = useState(false);
  const url = `/themes/${t.file}`;
  async function copy() {
    try {
      const text = await (await fetch(url)).text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked: the download still works */
    }
  }
  return (
    <li className="flex flex-col overflow-hidden rounded-xl bg-ink/[0.03] ring-1 ring-ink/[0.06]">
      <ThemePreview p={t.preview} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[15px] font-[590] text-foreground">{t.name}</h2>
          <span className="text-[12px] text-muted-foreground">
            {t.appearance === "light" ? "Light" : "Dark"}
            {t.author ? ` · ${t.author}` : ""}
          </span>
        </div>
        {t.description && (
          <p className="text-[13px] leading-relaxed text-muted-foreground">{t.description}</p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-1">
          <a
            href={url}
            download={`${t.id}.stroke-theme.json`}
            className={siteButton({ variant: "secondary", size: "sm" })}
          >
            <DownloadIcon className="size-3.5" />
            Download
          </a>
          <button
            type="button"
            onClick={() => void copy()}
            className={siteButton({ variant: "ghost", size: "sm" })}
          >
            {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
            {copied ? "Copied" : "Copy JSON"}
          </button>
        </div>
      </div>
    </li>
  );
}

function HowTo() {
  return (
    <div className="mt-16 grid gap-8 rounded-xl bg-ink/[0.02] p-6 ring-1 ring-ink/[0.05] md:grid-cols-[auto_1fr]">
      <PaletteIcon className="size-5 text-muted-foreground" />
      <div className="flex flex-col gap-4 text-[14px] leading-relaxed text-muted-foreground">
        <p>
          <span className="text-foreground">Add one in Stroke:</span> Settings, Appearance, Add a
          theme. Pick from this list, choose a downloaded file, or paste the JSON. Imported themes
          stay listed there to switch between.
        </p>
        <p>
          <span className="text-foreground">Make your own:</span> a theme is a small JSON file.
          Three colours are required, the rest are worked out from them unless you set them.
        </p>
        <pre className="overflow-x-auto rounded-lg bg-ink/[0.04] p-4 font-mono text-[12px] leading-relaxed text-foreground/85">{`{
  "version": 1,
  "name": "Aurora",
  "appearance": "dark",
  "colors": {
    "background": "#0f1117",
    "foreground": "#e6e6e6",
    "primary": "#7aa2f7",
    "sidebar": "#0c0e13",
    "border": "#1d2230"
  }
}`}</pre>
        <p>
          Optional colours: primaryForeground, card, popover, muted, mutedForeground, accent,
          border, input, ring, sidebar, sidebarForeground, sidebarAccent, sidebarBorder,
          destructive, link, tableGrid, editorSurface, editorLineHighlight.
        </p>
      </div>
    </div>
  );
}
