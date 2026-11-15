import { KeyRound, Link2, Maximize, Minus, Plus, Table2 } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import type { ErdLink, ErdTable } from "#/lib/shares/crypto";

/**
 * Pan and zoom for anything drawn in world coordinates: drag to pan, wheel or
 * pinch to zoom around the pointer, buttons to zoom and fit. The transform is
 * one CSS transform on one layer, so moving a large diagram stays at the
 * display's frame rate.
 */
export function PanZoom({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: React.ReactNode;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [cam, setCam] = useState({ x: 0, y: 0, z: 1 });
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);

  const fit = useCallback(() => {
    const el = host.current;
    if (!el || !width || !height) return;
    const pad = 48;
    const z = Math.min(
      1.25,
      Math.max(
        0.1,
        Math.min((el.clientWidth - pad * 2) / width, (el.clientHeight - pad * 2) / height),
      ),
    );
    setCam({ z, x: (el.clientWidth - width * z) / 2, y: (el.clientHeight - height * z) / 2 });
  }, [width, height]);

  useLayoutEffect(() => fit(), [fit]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      setCam((c) => {
        // Pinch (ctrlKey) and wheel zoom; a trackpad's two-finger scroll pans.
        if (
          !e.ctrlKey &&
          Math.abs(e.deltaX) + Math.abs(e.deltaY) < 50 &&
          e.deltaMode === 0 &&
          !Number.isInteger(e.deltaY)
        ) {
          return { ...c, x: c.x - e.deltaX, y: c.y - e.deltaY };
        }
        const z = Math.min(
          3,
          Math.max(0.08, c.z * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015))),
        );
        return { z, x: px - ((px - c.x) / c.z) * z, y: py - ((py - c.y) / c.z) * z };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const zoomBy = (f: number) => {
    const el = host.current;
    if (!el) return;
    const px = el.clientWidth / 2;
    const py = el.clientHeight / 2;
    setCam((c) => {
      const z = Math.min(3, Math.max(0.08, c.z * f));
      return { z, x: px - ((px - c.x) / c.z) * z, y: py - ((py - c.y) / c.z) * z };
    });
  };

  return (
    <div
      ref={host}
      className="relative min-h-0 flex-1 cursor-grab touch-none overflow-hidden bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] [background-size:20px_20px] active:cursor-grabbing"
      onPointerDown={(e) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        drag.current = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (d) setCam((c) => ({ ...c, x: d.cx + e.clientX - d.x, y: d.cy + e.clientY - d.y }));
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      <div
        className="absolute top-0 left-0 origin-top-left will-change-transform"
        style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.z})` }}
      >
        {children}
      </div>
      <div
        className="absolute bottom-4 left-4 flex flex-col overflow-hidden rounded-lg bg-popover shadow-[0_0_0_1px_var(--border)]"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {[
          { icon: Plus, label: "Zoom in", on: () => zoomBy(1.25) },
          { icon: Minus, label: "Zoom out", on: () => zoomBy(0.8) },
          { icon: Maximize, label: "Fit", on: fit },
        ].map(({ icon: I, label, on }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            onClick={on}
            className="flex size-8 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <I className="size-3.5" />
          </button>
        ))}
      </div>
    </div>
  );
}

const CARD_W = 256;
const HDR_H = 40;
const ROW_H = 26;

/** The schema diagram, laid out where the app laid it out. */
export function ShareErd({ tables, links }: { tables: ErdTable[]; links: ErdLink[] }) {
  const byName = useMemo(() => new Map(tables.map((t) => [t.name, t])), [tables]);
  const bounds = useMemo(() => {
    let x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;
    for (const t of tables) {
      x0 = Math.min(x0, t.x);
      y0 = Math.min(y0, t.y);
      x1 = Math.max(x1, t.x + CARD_W);
      y1 = Math.max(y1, t.y + HDR_H + t.columns.length * ROW_H);
    }
    return tables.length ? { x0, y0, w: x1 - x0, h: y1 - y0 } : { x0: 0, y0: 0, w: 1, h: 1 };
  }, [tables]);

  const colY = (t: ErdTable, col: string) => {
    const i = t.columns.findIndex((c) => c.name === col);
    return t.y - bounds.y0 + HDR_H + (i < 0 ? 0 : i) * ROW_H + ROW_H / 2;
  };

  return (
    <PanZoom width={bounds.w} height={bounds.h}>
      <div className="relative" style={{ width: bounds.w, height: bounds.h }}>
        <svg
          className="pointer-events-none absolute inset-0 overflow-visible"
          width={bounds.w}
          height={bounds.h}
          aria-hidden="true"
        >
          {links.map((l, i) => {
            const a = byName.get(l.from);
            const b = byName.get(l.to);
            if (!a || !b) return null;
            const ax = a.x - bounds.x0,
              bx = b.x - bounds.x0;
            const fromRight = ax + CARD_W <= bx;
            const toRight = bx + CARD_W <= ax;
            const sx = fromRight ? ax + CARD_W : ax;
            const tx = toRight ? bx + CARD_W : bx;
            const sy = colY(a, l.fromCol);
            const ty = colY(b, l.toCol);
            const dx = Math.max(40, Math.abs(tx - sx) / 2);
            const c1 = fromRight ? sx + dx : sx - dx;
            const c2 = toRight ? tx + dx : tx - dx;
            return (
              <path
                key={i}
                d={`M${sx},${sy} C${c1},${sy} ${c2},${ty} ${tx},${ty}`}
                fill="none"
                stroke="var(--muted-foreground)"
                strokeOpacity={0.55}
                strokeWidth={1.4}
              />
            );
          })}
        </svg>
        {tables.map((t) => (
          <div
            key={t.name}
            className="absolute overflow-hidden rounded-[10px] bg-card shadow-[0_0_0_1px_var(--border),0_8px_24px_-12px_rgb(0_0_0/0.35)]"
            style={{ left: t.x - bounds.x0, top: t.y - bounds.y0, width: CARD_W }}
          >
            <div
              className="flex items-center gap-2 border-b border-border bg-muted/60 px-3"
              style={{ height: HDR_H }}
            >
              <Table2 className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-foreground">
                {t.name}
              </span>
              <span className="text-[11px] text-faint tabular-nums">{t.columns.length}</span>
            </div>
            {t.columns.map((c) => (
              <div
                key={c.name}
                className="flex items-center gap-1.5 border-b border-border/60 px-3 last:border-0"
                style={{ height: ROW_H }}
              >
                <span className="flex w-3.5 shrink-0 justify-center">
                  {c.pk ? (
                    <KeyRound className="size-3 text-amber-600 dark:text-amber-400" />
                  ) : c.fk ? (
                    <Link2 className="size-3 text-sky-600 dark:text-sky-400" />
                  ) : null}
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-[12.5px] ${c.pk ? "font-medium text-amber-700 dark:text-amber-300" : c.fk ? "text-sky-700 dark:text-sky-300" : "text-soft"}`}
                >
                  {c.name}
                </span>
                <span className="shrink-0 font-mono text-[11px] text-faint">{c.type}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </PanZoom>
  );
}

/** A Mermaid diagram (flowchart, ER, class, sequence), rendered in the browser. */
export function ShareMermaid({ code }: { code: string }) {
  const [svg, setSvg] = useState<{ html: string; w: number; h: number } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        const dark = document.documentElement.classList.contains("dark");
        mermaid.initialize({
          startOnLoad: false,
          theme: dark ? "dark" : "neutral",
          securityLevel: "strict",
          fontFamily: "inherit",
        });
        const { svg: html } = await mermaid.render(`m${Math.random().toString(36).slice(2)}`, code);
        const m = /viewBox="[\d.-]+ [\d.-]+ ([\d.]+) ([\d.]+)"/.exec(html);
        if (!cancelled) setSvg({ html, w: m ? Number(m[1]) : 800, h: m ? Number(m[2]) : 600 });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);
  if (error)
    return (
      <pre className="m-6 overflow-auto rounded-lg bg-muted/60 p-4 font-mono text-[12.5px] text-soft">
        {code}
      </pre>
    );
  if (!svg)
    return (
      <div className="flex flex-1 items-center justify-center text-[13px] text-muted-foreground">
        Drawing the diagram…
      </div>
    );
  return (
    <PanZoom width={svg.w} height={svg.h}>
      {/* Rendered by Mermaid with securityLevel "strict" (no scripts, no HTML labels). */}
      <div
        style={{ width: svg.w, height: svg.h }}
        dangerouslySetInnerHTML={{ __html: svg.html.replace(/max-width:[^;"]+;?/, "") }}
      />
    </PanZoom>
  );
}
