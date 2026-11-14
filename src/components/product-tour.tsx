import { useRef, useState } from "react";

import { cn } from "#/lib/utils";

/**
 * Real screenshots of the app behind a row of tabs: one frame, one view at a
 * time, instead of a long scroll of sections that each show one. Arrow keys
 * move between tabs (the WAI-ARIA tabs pattern); the frame keeps one aspect
 * ratio so switching never moves the page.
 */
const SHOTS = [
  {
    id: "sql",
    label: "SQL",
    src: "/features/sql-console.webp",
    w: 1473,
    h: 689,
    alt: "The SQL console with schema-aware autocomplete and results",
    caption: "A SQL console that knows your schema, with the run time of every query.",
  },
  {
    id: "ai",
    label: "AI",
    src: "/features/ai-chat.webp",
    w: 1120,
    h: 836,
    alt: "The AI agent planning and running queries against a database",
    caption: "An agent that reads your schema, runs queries and asks before anything destructive.",
  },
  {
    id: "charts",
    label: "Charts",
    src: "/features/view-chart.webp",
    w: 1472,
    h: 1040,
    alt: "A query result drawn as a chart",
    caption: "Turn any result into a chart and pin it to a dashboard.",
  },
  {
    id: "diagram",
    label: "Diagram",
    src: "/features/view-erd.webp",
    w: 1472,
    h: 1040,
    alt: "An entity relationship diagram of a schema",
    caption: "See every table and relationship as a diagram.",
  },
  {
    id: "palette",
    label: "Palette",
    src: "/features/command-palette.webp",
    w: 1920,
    h: 1080,
    alt: "The command palette open over the app",
    caption: "⌘K reaches every table, query and action.",
  },
] as const;

export function ProductTour({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (to: number) => {
    const next = (to + SHOTS.length) % SHOTS.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Stroke views"
        className="mx-auto flex w-fit max-w-full [scrollbar-width:none] gap-0.5 overflow-x-auto rounded-full bg-white/[0.04] p-1"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            move(active + 1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            move(active - 1);
          } else if (e.key === "Home") {
            e.preventDefault();
            move(0);
          } else if (e.key === "End") {
            e.preventDefault();
            move(SHOTS.length - 1);
          }
        }}
      >
        {SHOTS.map((s, i) => (
          <button
            key={s.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tour-tab-${s.id}`}
            aria-selected={i === active}
            aria-controls={`tour-panel-${s.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn(
              "h-8 shrink-0 rounded-full px-3.5 text-[13px] font-[510] transition-[background-color,color,scale] duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]",
              i === active
                ? "bg-white/[0.1] text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* One frame for every view: the window's own size, so nothing below
          moves when the tab changes. Inactive shots stay mounted (loaded once,
          crossfaded) rather than swapping the src. */}
      <div className="relative mt-8 overflow-hidden rounded-xl bg-[#0a0a0b] shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_24px_64px_-16px_rgb(0_0_0/0.7)] md:mt-10">
        <div className="relative aspect-[1472/1000] w-full">
          {SHOTS.map((s, i) => (
            <div
              key={s.id}
              role="tabpanel"
              id={`tour-panel-${s.id}`}
              aria-labelledby={`tour-tab-${s.id}`}
              aria-hidden={i !== active}
              className={cn(
                "absolute inset-0 flex items-start justify-center transition-opacity duration-200 ease-out motion-reduce:transition-none",
                i === active ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <img
                src={s.src}
                width={s.w}
                height={s.h}
                alt={s.alt}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-contain object-top"
              />
            </div>
          ))}
        </div>
      </div>
      <p
        className="mx-auto mt-5 max-w-[56ch] text-center text-[15px] text-pretty text-muted-foreground"
        aria-live="polite"
      >
        {SHOTS[active].caption}
      </p>
    </div>
  );
}
