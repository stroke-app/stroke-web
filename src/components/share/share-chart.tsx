import { Menu } from "@base-ui/react/menu";
import { CheckIcon, ChevronDownIcon, DownloadIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { cn } from "#/lib/utils";

import { downloadFile, exportRows, fileStem } from "./share-export";
import { menuItem, menuLabel, menuPopup, textBtn } from "./share-ui";

/** Chart kinds a viewer can switch between: the ones that read the same data. */
const KINDS: { id: string; label: string }[] = [
  { id: "bar", label: "Bar" },
  { id: "bar-horizontal", label: "Horizontal bar" },
  { id: "line", label: "Line" },
  { id: "area", label: "Area" },
  { id: "pie", label: "Pie" },
  { id: "donut", label: "Donut" },
];

/**
 * A shared chart, drawn as SVG: bar (vertical or horizontal), line, area,
 * pie/donut and scatter, with an optional series column. No chart library:
 * the page stays light, the text is the site's own type, and it scales
 * cleanly at any size. Other chart kinds fall back to bars.
 */

const PALETTE = [
  "#6E8BFF",
  "#3CCB9A",
  "#F5A524",
  "#F06A8A",
  "#A78BFA",
  "#38BDF8",
  "#F97316",
  "#84CC16",
];

type Spec = { type: string; x: string; y: string[]; group?: string | null };

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function compact(n: number): string {
  return new Intl.NumberFormat(undefined, {
    notation: Math.abs(n) >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 2,
  }).format(n);
}

/** Round a max up to a readable axis top and pick ~5 ticks. */
function niceTicks(max: number, min = 0): number[] {
  const span = max - min || 1;
  const step = 10 ** Math.floor(Math.log10(span / 5));
  const err = span / 5 / step;
  const s = step * (err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1);
  // From a step at or below the minimum to the first step at or above the
  // maximum, so no bar ever runs past the top line.
  const out: number[] = [];
  let v = Math.floor(min / s) * s;
  out.push(Math.round(v * 1e9) / 1e9);
  while (v < max) {
    v += s;
    out.push(Math.round(v * 1e9) / 1e9);
  }
  return out;
}

export function ShareChart({
  spec,
  columns,
  rows,
  title = "chart",
}: {
  spec: Spec;
  columns: { name: string }[];
  rows: unknown[][];
  title?: string;
}) {
  const [hover, setHover] = useState<{ x: number; y: number; label: string } | null>(null);
  // The viewer can redraw it as another kind, and hide series from the legend.
  const switchable = !["scatter", "bubble"].includes(spec.type);
  const [kind, setKind] = useState(KINDS.some((k) => k.id === spec.type) ? spec.type : "bar");
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const svgRef = useRef<SVGSVGElement>(null);
  const idx = (name: string | null | undefined) =>
    name ? columns.findIndex((c) => c.name === name) : -1;

  const model = useMemo(() => {
    const xi = Math.max(0, idx(spec.x));
    const yi =
      idx(spec.y[0]) >= 0
        ? idx(spec.y[0])
        : columns.findIndex((_, i) => i !== xi && rows.some((r) => typeof r[i] === "number"));
    const gi = idx(spec.group);
    const cats: string[] = [];
    const catPos = new Map<string, number>();
    const series = new Map<string, number[]>();
    for (const r of rows) {
      const c = String(r[xi] ?? "");
      if (!catPos.has(c)) {
        catPos.set(c, cats.length);
        cats.push(c);
      }
      const g = gi >= 0 ? String(r[gi] ?? "") : (spec.y[0] ?? columns[yi]?.name ?? "value");
      if (!series.has(g)) series.set(g, []);
      const arr = series.get(g)!;
      const p = catPos.get(c)!;
      arr[p] = (arr[p] ?? 0) + num(r[yi]);
    }
    for (const arr of series.values()) for (let i = 0; i < cats.length; i++) arr[i] ??= 0;
    const points = rows.map((r) => [num(r[xi]), num(r[yi])] as const);
    return { cats, allSeries: [...series.entries()], xi, yi, points };
  }, [spec, columns, rows]);
  const visibleSeries = model.allSeries.filter(([g]) => !hidden.has(g));
  const series = visibleSeries.length ? visibleSeries : model.allSeries;
  const colorOf = (g: string) =>
    PALETTE[
      Math.max(
        0,
        model.allSeries.findIndex(([x]) => x === g),
      ) % PALETTE.length
    ]!;
  const toggle = (g: string) =>
    setHidden((h) => {
      const n = new Set(h);
      if (n.has(g)) n.delete(g);
      else if (model.allSeries.length - n.size > 1) n.add(g);
      return n;
    });

  const type = switchable ? kind : spec.type;
  const frame = {
    title,
    kind: switchable ? kind : null,
    onKind: setKind,
    svgRef,
    columns: columns.map((c) => c.name),
    rows,
    legend:
      model.allSeries.length > 1 && type !== "pie" && type !== "donut"
        ? model.allSeries.map(([g]) => ({ label: g, color: colorOf(g), off: hidden.has(g) }))
        : undefined,
    onLegend: toggle,
  };
  const W = 960,
    H = 520,
    P = { l: 64, r: 24, t: 24, b: 56 };
  const iw = W - P.l - P.r,
    ih = H - P.t - P.b;

  if (type === "pie" || type === "donut") {
    const vals = model.cats.map((c, i) => ({
      c,
      v: series.reduce((s, [, arr]) => s + (arr[i] ?? 0), 0),
    }));
    const total = vals.reduce((s, x) => s + x.v, 0) || 1;
    // Each slice's start and end angle, worked out before drawing.
    const slices = vals.reduce<{ a0: number; a1: number }[]>((acc, x) => {
      const a0 = acc.length ? acc[acc.length - 1]!.a1 : -Math.PI / 2;
      acc.push({ a0, a1: a0 + (x.v / total) * Math.PI * 2 });
      return acc;
    }, []);
    const R = 190,
      r0 = type === "donut" ? 112 : 0,
      cx = 300,
      cy = H / 2;
    return (
      <Frame {...frame}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="h-full w-full"
          role="img"
          aria-label="Pie chart"
        >
          {vals.map((x, i) => {
            const { a0, a1 } = slices[i]!;
            const large = a1 - a0 > Math.PI ? 1 : 0;
            const p = (a: number, rad: number) =>
              `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
            const d = r0
              ? `M${p(a0, R)} A${R},${R} 0 ${large} 1 ${p(a1, R)} L${p(a1, r0)} A${r0},${r0} 0 ${large} 0 ${p(a0, r0)} Z`
              : `M${cx},${cy} L${p(a0, R)} A${R},${R} 0 ${large} 1 ${p(a1, R)} Z`;
            return (
              <path
                key={i}
                d={d}
                fill={PALETTE[i % PALETTE.length]}
                stroke="var(--background)"
                strokeWidth={2}
                onMouseEnter={(e) =>
                  setHover({
                    x: e.clientX,
                    y: e.clientY,
                    label: `${x.c}: ${compact(x.v)} (${((x.v / total) * 100).toFixed(1)}%)`,
                  })
                }
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
          {vals.slice(0, 12).map((x, i) => (
            <g key={i} transform={`translate(560, ${80 + i * 30})`}>
              <rect width={12} height={12} rx={3} fill={PALETTE[i % PALETTE.length]} y={-10} />
              <text x={22} className="fill-foreground text-[15px]">
                {x.c || "(empty)"}
              </text>
              <text
                x={340}
                textAnchor="end"
                className="fill-muted-foreground text-[15px] tabular-nums"
              >
                {((x.v / total) * 100).toFixed(1)}%
              </text>
            </g>
          ))}
        </svg>
        <Tip hover={hover} />
      </Frame>
    );
  }

  if (type === "scatter" || type === "bubble") {
    const xs = model.points.map((p) => p[0]),
      ys = model.points.map((p) => p[1]);
    const xt = niceTicks(Math.max(...xs, 0), Math.min(...xs, 0)),
      yt = niceTicks(Math.max(...ys, 0), Math.min(...ys, 0));
    const sx = (v: number) => P.l + ((v - xt[0]!) / (xt.at(-1)! - xt[0]! || 1)) * iw;
    const sy = (v: number) => P.t + ih - ((v - yt[0]!) / (yt.at(-1)! - yt[0]! || 1)) * ih;
    return (
      <Frame {...frame}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="h-full w-full"
          role="img"
          aria-label="Scatter chart"
        >
          <Grid ticks={yt} y={sy} x0={P.l} x1={W - P.r} />
          {xt.map((t) => (
            <text
              key={t}
              x={sx(t)}
              y={H - P.b + 22}
              textAnchor="middle"
              className="fill-muted-foreground text-[13px] tabular-nums"
            >
              {compact(t)}
            </text>
          ))}
          {model.points.map(([x, y], i) => (
            <circle key={i} cx={sx(x)} cy={sy(y)} r={4.5} fill={PALETTE[0]} fillOpacity={0.75} />
          ))}
        </svg>
      </Frame>
    );
  }

  const horizontal = type === "bar-horizontal";
  const max = Math.max(0, ...series.flatMap(([, a]) => a));
  const min = Math.min(0, ...series.flatMap(([, a]) => a));
  const ticks = niceTicks(max, min);
  const top = ticks.at(-1)!,
    bottom = ticks[0]!;
  const scale = (v: number) => ((v - bottom) / (top - bottom || 1)) * (horizontal ? iw : ih);
  const n = model.cats.length || 1;
  const band = (horizontal ? ih : iw) / n;
  const line = type === "line" || type === "area";
  const nSeries = series.length;

  return (
    <Frame {...frame}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="h-full w-full"
        role="img"
        aria-label="Chart"
      >
        {horizontal ? (
          ticks.map((t) => (
            <g key={t}>
              <line
                x1={P.l + scale(t)}
                x2={P.l + scale(t)}
                y1={P.t}
                y2={H - P.b}
                className="stroke-border"
              />
              <text
                x={P.l + scale(t)}
                y={H - P.b + 22}
                textAnchor="middle"
                className="fill-muted-foreground text-[13px] tabular-nums"
              >
                {compact(t)}
              </text>
            </g>
          ))
        ) : (
          <Grid ticks={ticks} y={(v) => P.t + ih - scale(v)} x0={P.l} x1={W - P.r} />
        )}
        {series.map(([g, arr], si) => {
          const color = colorOf(g);
          if (line) {
            const pts = arr.map(
              (v, i) => [P.l + band * i + band / 2, P.t + ih - scale(v)] as const,
            );
            const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
            return (
              <g key={g}>
                {type === "area" && (
                  <path
                    d={`${d} L${pts.at(-1)?.[0]},${P.t + ih - scale(Math.max(0, bottom))} L${pts[0]?.[0]},${P.t + ih - scale(Math.max(0, bottom))} Z`}
                    fill={color}
                    fillOpacity={0.14}
                  />
                )}
                <path
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth={2.25}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {n <= 60 &&
                  pts.map(([x, y], i) => (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={3.5}
                      fill={color}
                      onMouseEnter={(e) =>
                        setHover({
                          x: e.clientX,
                          y: e.clientY,
                          label: `${model.cats[i]}${nSeries > 1 ? ` · ${g}` : ""}: ${compact(arr[i] ?? 0)}`,
                        })
                      }
                      onMouseLeave={() => setHover(null)}
                    />
                  ))}
              </g>
            );
          }
          const bw = Math.max(2, (band * 0.72) / nSeries);
          return arr.map((v, i) => {
            const len = Math.abs(scale(v) - scale(0));
            const label = `${model.cats[i]}${nSeries > 1 ? ` · ${g}` : ""}: ${compact(v)}`;
            const onEnter = (e: React.MouseEvent) =>
              setHover({ x: e.clientX, y: e.clientY, label });
            return horizontal ? (
              <rect
                key={`${g}${i}`}
                x={P.l + Math.min(scale(0), scale(v))}
                y={P.t + band * i + band * 0.14 + bw * si}
                width={len}
                height={bw}
                rx={3}
                fill={color}
                onMouseEnter={onEnter}
                onMouseLeave={() => setHover(null)}
              />
            ) : (
              <rect
                key={`${g}${i}`}
                x={P.l + band * i + band * 0.14 + bw * si}
                y={P.t + ih - Math.max(scale(v), scale(0))}
                width={bw}
                height={len}
                rx={3}
                fill={color}
                onMouseEnter={onEnter}
                onMouseLeave={() => setHover(null)}
              />
            );
          });
        })}
        {model.cats.map((c, i) => {
          if (n > 24 && i % Math.ceil(n / 24) !== 0) return null;
          const label = c.length > 14 ? c.slice(0, 13) + "…" : c;
          return horizontal ? (
            <text
              key={i}
              x={P.l - 10}
              y={P.t + band * i + band / 2 + 4}
              textAnchor="end"
              className="fill-muted-foreground text-[13px]"
            >
              {label}
            </text>
          ) : (
            <text
              key={i}
              x={P.l + band * i + band / 2}
              y={H - P.b + 22}
              textAnchor="middle"
              className="fill-muted-foreground text-[13px]"
            >
              {label}
            </text>
          );
        })}
      </svg>
      <Tip hover={hover} />
    </Frame>
  );
}

function Grid({
  ticks,
  y,
  x0,
  x1,
}: {
  ticks: number[];
  y: (v: number) => number;
  x0: number;
  x1: number;
}) {
  return (
    <g>
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={x0}
            x2={x1}
            y1={y(t)}
            y2={y(t)}
            className="stroke-border"
            strokeDasharray={t === 0 ? undefined : "3 4"}
          />
          <text
            x={x0 - 10}
            y={y(t) + 4}
            textAnchor="end"
            className="fill-muted-foreground text-[13px] tabular-nums"
          >
            {compact(t)}
          </text>
        </g>
      ))}
    </g>
  );
}

type FrameProps = {
  children: React.ReactNode;
  title: string;
  kind: string | null;
  onKind: (k: string) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  columns: string[];
  rows: unknown[][];
  legend?: { label: string; color: string; off: boolean }[];
  onLegend: (g: string) => void;
};

/** A card around the chart: its title, the kind switcher, Export, and a legend that toggles series. */
function Frame({
  children,
  title,
  kind,
  onKind,
  svgRef,
  columns,
  rows,
  legend,
  onLegend,
}: FrameProps) {
  const current = KINDS.find((k) => k.id === kind);
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center overflow-auto p-4 md:p-8">
      <div className="flex w-full max-w-3xl flex-col rounded-xl bg-card shadow-[0_0_0_1px_var(--border)]">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <h2 className="min-w-0 flex-1 truncate text-[14px] font-medium">{title}</h2>
          {kind && (
            <Menu.Root>
              <Menu.Trigger className={textBtn}>
                {current?.label ?? "Chart"}
                <ChevronDownIcon />
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Positioner align="end" sideOffset={4} className="z-50">
                  <Menu.Popup className={cn(menuPopup, "min-w-40")}>
                    <Menu.RadioGroup value={kind} onValueChange={(v) => onKind(String(v))}>
                      {KINDS.map((k) => (
                        <Menu.RadioItem key={k.id} value={k.id} className={menuItem}>
                          <span className="flex-1">{k.label}</span>
                          <Menu.RadioItemIndicator>
                            <CheckIcon className="text-foreground!" />
                          </Menu.RadioItemIndicator>
                        </Menu.RadioItem>
                      ))}
                    </Menu.RadioGroup>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          )}
          <Menu.Root>
            <Menu.Trigger className={textBtn}>
              <DownloadIcon />
              Export
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner align="end" sideOffset={4} className="z-50">
                <Menu.Popup className={cn(menuPopup, "w-56")}>
                  <div className={menuLabel}>Download</div>
                  <Menu.Item
                    className={menuItem}
                    onClick={() => void exportChart(svgRef.current, title, "png")}
                  >
                    PNG image
                  </Menu.Item>
                  <Menu.Item
                    className={menuItem}
                    onClick={() => void exportChart(svgRef.current, title, "svg")}
                  >
                    SVG image
                  </Menu.Item>
                  <Menu.Item
                    className={menuItem}
                    onClick={() => {
                      const r = exportRows("csv", columns, rows, title);
                      downloadFile(`${fileStem(title)}.csv`, r.body, r.type);
                    }}
                  >
                    Data as CSV
                  </Menu.Item>
                  <Menu.Item
                    className={menuItem}
                    onClick={() => {
                      const r = exportRows("json", columns, rows, title);
                      downloadFile(`${fileStem(title)}.json`, r.body, r.type);
                    }}
                  >
                    Data as JSON
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
        {legend && (
          <div className="flex flex-wrap gap-x-1 gap-y-1 px-3 pt-3">
            {legend.slice(0, 16).map((l) => (
              <button
                key={l.label}
                type="button"
                onClick={() => onLegend(l.label)}
                aria-pressed={!l.off}
                title={l.off ? "Show" : "Hide"}
                className={cn(
                  "inline-flex h-7 items-center gap-2 rounded-md px-2 text-[12.5px] transition-colors hover:bg-accent",
                  l.off ? "text-faint line-through" : "text-muted-foreground",
                )}
              >
                <span
                  className="size-2.5 rounded-[3px]"
                  style={{ background: l.off ? "var(--border)" : l.color }}
                />
                {l.label || "(empty)"}
              </button>
            ))}
          </div>
        )}
        <div className="relative aspect-[960/520] w-full p-2">{children}</div>
      </div>
    </div>
  );
}

/** The chart as a standalone SVG or PNG: its colours inlined from the page. */
async function exportChart(svg: SVGSVGElement | null, title: string, fmt: "svg" | "png") {
  if (!svg) return;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const src = svg.querySelectorAll<SVGElement>("*");
  const dst = clone.querySelectorAll<SVGElement>("*");
  src.forEach((el, i) => {
    const cs = getComputedStyle(el);
    const d = dst[i]!;
    d.removeAttribute("class");
    if (cs.fill && cs.fill !== "none") d.setAttribute("fill", cs.fill);
    if (cs.stroke && cs.stroke !== "none") d.setAttribute("stroke", cs.stroke);
    if (el.tagName === "text") {
      d.setAttribute("font-size", cs.fontSize);
      d.setAttribute("font-family", cs.fontFamily);
    }
  });
  const vb = svg.viewBox.baseVal;
  const w = vb?.width || 960;
  const h = vb?.height || 520;
  const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(w));
  clone.setAttribute("height", String(h));
  clone.insertAdjacentHTML("afterbegin", `<rect width="100%" height="100%" fill="${bg}"/>`);
  const text = new XMLSerializer().serializeToString(clone);
  if (fmt === "svg") {
    downloadFile(`${fileStem(title)}.svg`, text, "image/svg+xml");
    return;
  }
  const img = new Image();
  const url = URL.createObjectURL(new Blob([text], { type: "image/svg+xml;charset=utf-8" }));
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error("Couldn't draw the chart"));
    img.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = w * 2;
  canvas.height = h * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(2, 2);
  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(url);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${fileStem(title)}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }, "image/png");
}

function Tip({ hover }: { hover: { x: number; y: number; label: string } | null }) {
  if (!hover) return null;
  return (
    <div
      className="pointer-events-none fixed z-50 rounded-md bg-popover px-2.5 py-1.5 text-[13px] text-popover-foreground tabular-nums shadow-[0_0_0_1px_var(--border),0_8px_24px_-8px_rgb(0_0_0/0.3)]"
      style={{ left: hover.x + 12, top: hover.y + 12 }}
    >
      {hover.label}
    </div>
  );
}
