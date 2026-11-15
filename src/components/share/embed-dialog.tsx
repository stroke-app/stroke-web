import { Dialog } from "@base-ui/react/dialog";
import { CheckIcon, CodeIcon, CopyIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { iconBtn, textBtn } from "#/components/share/share-ui";
import {
  DEFAULT_EMBED,
  embedCode,
  embedUrl,
  type EmbedFont,
  type EmbedOptions,
  type EmbedTheme,
} from "#/lib/shares/embed";
import { cn } from "#/lib/utils";

/**
 * "Embed": options for how the share looks on another site, a live preview
 * of exactly that, and the code to paste. The preview is the real embed.
 */
export function EmbedDialog({
  id,
  title,
  viewsLeft,
}: {
  id: string;
  title: string;
  /** A view-limited link runs out: every load of an embed counts a view. */
  viewsLeft: number | null;
}) {
  const [o, setO] = useState<EmbedOptions>(DEFAULT_EMBED);
  const [height, setHeight] = useState(480);
  const [copied, setCopied] = useState(false);
  const key = typeof window === "undefined" ? "" : window.location.hash.slice(1);
  const origin = typeof window === "undefined" ? "https://stroke.click" : window.location.origin;
  const src = useMemo(() => embedUrl(origin, id, key, o), [origin, id, key, o]);
  const code = useMemo(() => embedCode(src, o, height, title), [src, o, height, title]);
  const set = <K extends keyof EmbedOptions>(k: K, v: EmbedOptions[K]) =>
    setO((cur) => ({ ...cur, [k]: v }));

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // The code is selectable in the box below.
    }
  }

  const seg = (on: boolean) =>
    cn(
      "h-7 flex-1 rounded-md px-2 text-[12.5px] capitalize",
      on
        ? "bg-background text-foreground shadow-xs"
        : "text-muted-foreground hover:text-foreground",
    );
  const row = "flex items-center justify-between gap-3 text-[13px]";

  return (
    <Dialog.Root>
      <Dialog.Trigger className={textBtn}>
        <CodeIcon /> Embed
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex max-h-[90dvh] w-[min(1100px,94vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-2xl ring-1 ring-foreground/10">
          <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
            <Dialog.Title className="text-[14px] font-medium">Embed this share</Dialog.Title>
            <Dialog.Description className="hidden text-[12.5px] text-muted-foreground sm:block">
              On your site or docs, styled to match. It stays end-to-end encrypted.
            </Dialog.Description>
            <Dialog.Close className={cn(iconBtn, "ms-auto")} aria-label="Close">
              <XIcon />
            </Dialog.Close>
          </div>

          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            {/* Options */}
            <div className="w-full shrink-0 space-y-4 overflow-y-auto border-b border-border p-4 md:w-72 md:border-r md:border-b-0">
              <div>
                <p className="mb-1.5 text-[12px] font-medium text-muted-foreground">Theme</p>
                <div className="flex rounded-lg bg-muted/60 p-0.5">
                  {(["auto", "light", "dark"] as EmbedTheme[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={seg(o.theme === t)}
                      onClick={() => set("theme", t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className={row}>
                <span>Background</span>
                <span className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className={cn(
                      "h-7 rounded-md px-2 text-[12px]",
                      o.bg === ""
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                    onClick={() => set("bg", "")}
                  >
                    Theme
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "h-7 rounded-md px-2 text-[12px]",
                      o.bg === "transparent"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                    onClick={() => set("bg", "transparent")}
                  >
                    None
                  </button>
                  <input
                    type="color"
                    aria-label="Background colour"
                    value={o.bg && o.bg !== "transparent" ? o.bg : "#ffffff"}
                    onChange={(e) => set("bg", e.target.value)}
                    className="size-7 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
                  />
                </span>
              </div>

              <div className={row}>
                <span>Accent</span>
                <span className="flex items-center gap-1.5">
                  {o.accent && (
                    <button
                      type="button"
                      className="h-7 rounded-md px-2 text-[12px] text-muted-foreground hover:bg-muted"
                      onClick={() => set("accent", "")}
                    >
                      Reset
                    </button>
                  )}
                  <input
                    type="color"
                    aria-label="Accent colour"
                    value={o.accent || "#5b8def"}
                    onChange={(e) => set("accent", e.target.value)}
                    className="size-7 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
                  />
                </span>
              </div>

              <label className={row}>
                <span>Corners</span>
                <span className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={24}
                    value={o.radius}
                    onChange={(e) => set("radius", Number(e.target.value))}
                    className="w-28"
                  />
                  <span className="w-8 text-right text-[12px] text-muted-foreground tabular-nums">
                    {o.radius}px
                  </span>
                </span>
              </label>

              <label className={row}>
                <span>Font</span>
                <select
                  value={o.font}
                  onChange={(e) => set("font", e.target.value as EmbedFont)}
                  className="h-7 rounded-md border border-border bg-background px-1.5 text-[12.5px]"
                >
                  <option value="sans">Sans</option>
                  <option value="system">System</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Mono</option>
                </select>
              </label>

              <div className="space-y-2 border-t border-border pt-3">
                {(
                  [
                    ["title", "Title"],
                    ["border", "Border"],
                    ["toolbar", "Table search and download"],
                    ["footer", "“Shared with Stroke”"],
                    ["autoHeight", "Fit height to content"],
                  ] as const
                ).map(([k, label]) => (
                  <label key={k} className={cn(row, "cursor-pointer")}>
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={o[k]}
                      onChange={(e) => set(k, e.target.checked)}
                      className="size-4 accent-[var(--primary)]"
                    />
                  </label>
                ))}
              </div>

              {!o.autoHeight && (
                <label className={row}>
                  <span>Height</span>
                  <span className="flex items-center gap-1">
                    <input
                      type="number"
                      min={160}
                      max={2000}
                      step={20}
                      value={height}
                      onChange={(e) =>
                        setHeight(Math.max(160, Math.min(2000, Number(e.target.value) || 480)))
                      }
                      className="h-7 w-20 rounded-md border border-border bg-background px-2 text-right text-[12.5px] tabular-nums"
                    />
                    <span className="text-[12px] text-muted-foreground">px</span>
                  </span>
                </label>
              )}

              {viewsLeft !== null && (
                <p className="flex gap-1.5 rounded-lg bg-amber-500/10 p-2.5 text-[12px] leading-relaxed text-amber-700 dark:text-amber-300">
                  <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
                  This link stops after its views run out, and every page load of an embed counts
                  one. For a site, share again from Stroke with unlimited views.
                </p>
              )}
            </div>

            {/* Preview and code */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-4">
              <div className="min-h-64 flex-1 overflow-auto rounded-lg bg-[repeating-conic-gradient(var(--muted)_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] p-3">
                {viewsLeft === null ? (
                  <iframe
                    key={src}
                    src={src}
                    title="Embed preview"
                    className="w-full border-0"
                    style={{
                      height: o.autoHeight ? 420 : Math.min(height, 560),
                      background: o.bg === "transparent" ? "transparent" : undefined,
                    }}
                  />
                ) : (
                  // Each load of an embed counts a view: a live preview would use them up.
                  <p className="m-auto max-w-sm p-8 text-center text-[13px] text-muted-foreground">
                    No live preview for a view-limited link: loading it would count a view.
                  </p>
                )}
              </div>
              <div className="relative">
                <textarea
                  readOnly
                  value={code}
                  rows={o.autoHeight ? 4 : 3}
                  onFocus={(e) => e.currentTarget.select()}
                  aria-label="Embed code"
                  className="w-full resize-none rounded-lg border border-border bg-muted/40 p-3 pe-24 font-mono text-[12px] leading-relaxed text-foreground outline-none"
                />
                <button
                  type="button"
                  onClick={() => void copy()}
                  className="absolute top-2 right-2 inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-[12.5px] font-medium text-primary-foreground hover:opacity-90"
                >
                  {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-[12px] text-muted-foreground">
                The key stays after the <span className="font-mono">#</span> in the link, so only
                browsers loading the embed can read it. Anyone who can see your page can see the
                data.
              </p>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
