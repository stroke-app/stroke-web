import {
  BookOpenIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  FileCodeIcon,
  FileTextIcon,
  GitBranchIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  Link2Icon,
  ListTreeIcon,
  NetworkIcon,
  PanelLeftIcon,
  SearchIcon,
  SplineIcon,
  WorkflowIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
  type LucideIcon,
} from "lucide-react";
import { useId, useLayoutEffect, useRef, useState } from "react";

import { Panel } from "#/components/page";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { cn } from "#/lib/utils";

/*
 * A working replica of Stroke's Schema Diagram tab. One sample schema is
 * defined below; every view (the ER diagram, the layered hierarchy, the
 * Mermaid source and preview, the reference tree, the data dictionary, and the
 * DDL) is derived from it, and every layout is computed once at module scope.
 */

// ─── The sample schema ──────────────────────────────────────────────────────

type Column = {
  name: string;
  type: string;
  /** Part of the primary key; two such columns make a composite key. */
  pk?: boolean;
  unique?: boolean;
  nullable?: boolean;
  default?: string;
  ref?: { table: string; column: string };
};

type Table = { name: string; note: string; columns: Column[] };

/** A foreign key to another table's `id`. */
const ref = (table: string) => ({ table, column: "id" });

/** An online store in Postgres, listed so referenced tables come first. */
const SCHEMA: Table[] = [
  {
    name: "customers",
    note: "People with an account. They place orders and write reviews.",
    columns: [
      { name: "id", type: "bigint", pk: true },
      { name: "email", type: "text", unique: true },
      { name: "name", type: "text" },
      { name: "created_at", type: "timestamptz", default: "now()" },
    ],
  },
  {
    name: "addresses",
    note: "Shipping addresses saved to a customer's account.",
    columns: [
      { name: "id", type: "bigint", pk: true },
      { name: "customer_id", type: "bigint", ref: ref("customers") },
      { name: "line1", type: "text" },
      { name: "city", type: "text" },
      { name: "country", type: "char(2)" },
    ],
  },
  {
    name: "categories",
    note: "The catalog tree. A category without a parent is a top-level one.",
    columns: [
      { name: "id", type: "int", pk: true },
      { name: "parent_id", type: "int", nullable: true, ref: ref("categories") },
      { name: "name", type: "text" },
    ],
  },
  {
    name: "products",
    note: "Everything for sale, with its price and how many are in stock.",
    columns: [
      { name: "id", type: "bigint", pk: true },
      { name: "category_id", type: "int", ref: ref("categories") },
      { name: "name", type: "text" },
      { name: "price_cents", type: "int" },
      { name: "stock", type: "int", default: "0" },
    ],
  },
  {
    name: "orders",
    note: "One checkout: who placed it, where it ships, and the total.",
    columns: [
      { name: "id", type: "bigint", pk: true },
      { name: "customer_id", type: "bigint", ref: ref("customers") },
      { name: "address_id", type: "bigint", ref: ref("addresses") },
      { name: "status", type: "text", default: "'pending'" },
      { name: "total_cents", type: "int" },
      { name: "placed_at", type: "timestamptz" },
    ],
  },
  {
    name: "order_items",
    note: "The lines of an order: which product, how many, and at what price.",
    columns: [
      { name: "order_id", type: "bigint", pk: true, ref: ref("orders") },
      { name: "product_id", type: "bigint", pk: true, ref: ref("products") },
      { name: "quantity", type: "int" },
      { name: "unit_cents", type: "int" },
    ],
  },
  {
    name: "payments",
    note: "The payment for an order, at most one each. paid_at stays empty until it clears.",
    columns: [
      { name: "id", type: "bigint", pk: true },
      { name: "order_id", type: "bigint", unique: true, ref: ref("orders") },
      { name: "provider", type: "text" },
      { name: "amount_cents", type: "int" },
      { name: "paid_at", type: "timestamptz", nullable: true },
    ],
  },
  {
    name: "reviews",
    note: "A customer's star rating and comments on a product.",
    columns: [
      { name: "id", type: "bigint", pk: true },
      { name: "product_id", type: "bigint", ref: ref("products") },
      { name: "customer_id", type: "bigint", ref: ref("customers") },
      { name: "rating", type: "smallint" },
      { name: "body", type: "text" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
  {
    name: "coupons",
    note: "Discount codes, each with an optional expiry date.",
    columns: [
      { name: "id", type: "int", pk: true },
      { name: "code", type: "text", unique: true },
      { name: "percent_off", type: "smallint" },
      { name: "expires_at", type: "timestamptz", nullable: true },
    ],
  },
  {
    name: "events",
    note: "Raw analytics events, with the details kept as JSON.",
    columns: [
      { name: "id", type: "bigint", pk: true },
      { name: "name", type: "text" },
      { name: "payload", type: "jsonb" },
      { name: "ts", type: "timestamptz" },
    ],
  },
];

/** A foreign key, from the referencing column to the referenced one. */
type Link = {
  from: string;
  column: string;
  to: string;
  toColumn: string;
  /** A unique foreign key: one-to-one rather than one-to-many. */
  unique: boolean;
  nullable: boolean;
};

const LINKS: Link[] = SCHEMA.flatMap((table) =>
  table.columns.flatMap((c) =>
    c.ref
      ? [
          {
            from: table.name,
            column: c.name,
            to: c.ref.table,
            toColumn: c.ref.column,
            unique: Boolean(c.unique),
            nullable: Boolean(c.nullable),
          },
        ]
      : [],
  ),
);

const TABLES = new Map(SCHEMA.map((t) => [t.name, t]));
const NAMES = SCHEMA.map((t) => t.name).sort();

function need<TKey, TValue>(map: Map<TKey, TValue>, key: TKey): TValue {
  const value = map.get(key);
  if (value === undefined) throw new Error(`Missing ${String(key)}`);
  return value;
}

const matches = (name: string, query: string) => name.includes(query);
const linkKey = (l: Link) => `${l.from}.${l.column}`;

// ─── Geometry ───────────────────────────────────────────────────────────────

type Point = { x: number; y: number };
type Box = { x: number; y: number; w: number; h: number };
type Segment = [Point, Point];

/** Geist Mono advances every glyph by 0.6em. */
const mono = (text: string, size: number) => text.length * size * 0.6;
/** Geist Sans averages about 0.56em per glyph across lowercase identifiers. */
const sans = (text: string, size: number) => text.length * size * 0.56;

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);
const mean = (ns: number[]) => sum(ns) / ns.length;
const cx = (b: Box) => b.x + b.w / 2;

/** `count` positions spaced evenly strictly between `from` and `to`. */
const even = (count: number, from: number, to: number) =>
  Array.from({ length: count }, (_, i) => Math.round(from + ((to - from) * (i + 1)) / (count + 1)));

/** Drops repeated points and the middles of straight runs. */
function simplify(points: Point[]): Point[] {
  const out: Point[] = [];
  for (const p of points) {
    const last = out.at(-1);
    const prev = out.at(-2);
    if (last && last.x === p.x && last.y === p.y) continue;
    if (
      prev &&
      last &&
      ((prev.x === last.x && last.x === p.x) || (prev.y === last.y && last.y === p.y))
    )
      out[out.length - 1] = p;
    else out.push(p);
  }
  return out;
}

const segments = (points: Point[]): Segment[] => points.slice(1).map((p, i) => [points[i], p]);
const span = (a: number, b: number) => [Math.min(a, b), Math.max(a, b)];

/**
 * An SVG path through orthogonal `points`, with the corners softened. A sharp
 * first corner keeps a fork where several lines leave one stem a clean T.
 */
function pathD(points: Point[], { radius = 4, sharpFirst = false } = {}) {
  const pts = simplify(points);
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [prev, p, next] = [pts[i - 1], pts[i], pts[i + 1]];
    const r = Math.min(
      sharpFirst && i === 1 ? 0 : radius,
      (Math.abs(p.x - prev.x) + Math.abs(p.y - prev.y)) / 2,
      (Math.abs(next.x - p.x) + Math.abs(next.y - p.y)) / 2,
    );
    const a = { x: p.x + Math.sign(prev.x - p.x) * r, y: p.y + Math.sign(prev.y - p.y) * r };
    const b = { x: p.x + Math.sign(next.x - p.x) * r, y: p.y + Math.sign(next.y - p.y) * r };
    d += `L${a.x} ${a.y}Q${p.x} ${p.y} ${b.x} ${b.y}`;
  }
  const end = pts[pts.length - 1];
  return `${d}L${end.x} ${end.y}`;
}

/** Whether a horizontal and a vertical segment cross inside both. */
function crosses(s: Segment, t: Segment) {
  const flat = ([a, b]: Segment) => a.y === b.y && a.x !== b.x;
  const upright = ([a, b]: Segment) => a.x === b.x && a.y !== b.y;
  const [h, v] = flat(s) ? [s, t] : [t, s];
  if (!flat(h) || !upright(v)) return false;
  const [x1, x2] = span(h[0].x, h[1].x);
  const [y1, y2] = span(v[0].y, v[1].y);
  return x1 < v[0].x && v[0].x < x2 && y1 < h[0].y && h[0].y < y2;
}

function crossings(lines: Point[][]) {
  const segs = lines.map((l) => segments(simplify(l)));
  let n = 0;
  segs.forEach((a, i) =>
    segs.slice(i + 1).forEach((b) => a.forEach((s) => b.forEach((t) => (n += +crosses(s, t))))),
  );
  return n;
}

const length = (lines: Point[][]) =>
  sum(lines.flatMap((l) => segments(l).map(([a, b]) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y))));

/** Every ordering of 0…n-1, the identity first. */
function permutations(n: number): number[][] {
  if (n <= 1) return [Array.from({ length: n }, (_, i) => i)];
  return permutations(n - 1).flatMap((p) =>
    Array.from({ length: n }, (_, i) => {
      const at = n - 1 - i;
      return [...p.slice(0, at), n - 1, ...p.slice(at)];
    }),
  );
}

/**
 * Gives each item one of `slots` (lanes or levels), trying every order and
 * keeping the one whose lines cross least, then the shortest. `route` draws an
 * item's lines in a slot; `fixed` are lines already drawn in the same space.
 */
function assignSlots<T>(
  items: T[],
  slots: number[],
  route: (item: T, slot: number) => Point[][],
  fixed: Point[][],
): Point[][][] {
  let best: Point[][][] = [];
  let bestScore = Infinity;
  for (const order of permutations(items.length)) {
    const routes = items.map((item, i) => route(item, slots[order[i]]));
    const lines = routes.flat();
    const score = crossings([...lines, ...fixed]) * 1e6 + length(lines);
    if (score < bestScore) {
      bestScore = score;
      best = routes;
    }
  }
  return best;
}

/**
 * Places items along one axis in order, at least `gap` apart, as near their
 * `desired` centers as possible (least squares, by pooling neighbors that
 * would collide into blocks centered on their mean).
 */
function pack(sizes: number[], desired: number[], gap: number) {
  const offset = [0];
  for (let i = 1; i < sizes.length; i++)
    offset.push(offset[i - 1] + (sizes[i - 1] + sizes[i]) / 2 + gap);
  const blocks: { total: number; count: number }[] = [];
  desired.forEach((d, i) => {
    blocks.push({ total: d - offset[i], count: 1 });
    while (blocks.length > 1) {
      const [a, b] = blocks.slice(-2);
      if (a.total / a.count <= b.total / b.count) break;
      blocks.splice(-2, 2, { total: a.total + b.total, count: a.count + b.count });
    }
  });
  return blocks
    .flatMap((b) => Array.from({ length: b.count }, () => b.total / b.count))
    .map((p, i) => Math.round(p + offset[i]));
}

/**
 * Centers every node across its layer: under the mean of its parents, then
 * nudged toward its children, then settled under its parents again.
 */
function placeLayers(graph: Layered, size: (id: string) => number, gap: number) {
  const at = new Map<string, number>();
  const parents = (id: string) => graph.pairs.filter(([, b]) => b === id).map(([a]) => a);
  const children = (id: string) => graph.pairs.filter(([a]) => a === id).map(([, b]) => b);
  const sweep = (layer: string[], near: (id: string) => string[]) => {
    const desired = layer.map((id) => {
      const placed = near(id).filter((n) => at.has(n));
      return placed.length ? mean(placed.map((n) => need(at, n))) : (at.get(id) ?? 0);
    });
    pack(layer.map(size), desired, gap).forEach((p, i) => at.set(layer[i], p));
  };
  graph.layers.forEach((layer) => sweep(layer, parents));
  [...graph.layers]
    .reverse()
    .slice(1)
    .forEach((layer) => sweep(layer, children));
  graph.layers.slice(1).forEach((layer) => sweep(layer, parents));
  return at;
}

const overlaps = (a: Box, b: Box) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const grow = (b: Box, by: number) => ({
  x: b.x - by,
  y: b.y - by,
  w: b.w + by * 2,
  h: b.h + by * 2,
});
const hits = ([a, b]: Segment, box: Box) =>
  overlaps(
    {
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      w: Math.abs(a.x - b.x),
      h: Math.abs(a.y - b.y),
    },
    box,
  );

// ─── Layered graphs (Hierarchy and Tree) ────────────────────────────────────

type Layered = {
  /** Node ids per layer, in drawing order. Ids starting with "~" are bends. */
  layers: string[][];
  /** For each arc, the ids it passes through, one per layer. */
  chains: string[][];
  /** Every [upper, lower] hop between adjacent layers. */
  pairs: [string, string][];
};

/**
 * Ranks nodes by their longest path from a node with no parent, threads
 * longer arcs through bend points in the layers between, and orders each
 * layer to cross as few arcs as possible. `arcs` are [parent, child].
 */
function layered(nodes: string[], arcs: [string, string][]): Layered {
  const rank = new Map<string, number>();
  const rankOf = (id: string): number => {
    const known = rank.get(id);
    if (known !== undefined) return known;
    const r = Math.max(-1, ...arcs.filter(([, c]) => c === id).map(([p]) => rankOf(p))) + 1;
    rank.set(id, r);
    return r;
  };
  const layers: string[][] = [];
  const put = (id: string, r: number) => (layers[r] ??= []).push(id);
  nodes.forEach((n) => put(n, rankOf(n)));
  const chains = arcs.map(([parent, child], i) => {
    const chain = [parent];
    for (let r = rankOf(parent) + 1; r < rankOf(child); r++) {
      put(`~${i}.${r}`, r);
      chain.push(`~${i}.${r}`);
    }
    return [...chain, child];
  });
  const pairs = chains.flatMap((chain) =>
    chain.slice(1).map((id, k): [string, string] => [chain[k], id]),
  );
  return { layers: orderLayers(layers, pairs), chains, pairs };
}

/**
 * Tries every order of the first layer and, below it, every order of each
 * layer against the one above; keeps the fewest crossings, then the orders
 * that sit nodes closest under their parents.
 */
function orderLayers(layers: string[][], pairs: [string, string][]) {
  const arrangements = (ids: string[]) => permutations(ids.length).map((p) => p.map((i) => ids[i]));
  let best = layers;
  let bestScore = Infinity;
  for (const first of arrangements(layers[0])) {
    const result = [first];
    let score = 0;
    for (const layer of layers.slice(1)) {
      const upper = result[result.length - 1];
      const above = new Map(upper.map((id, i) => [id, i - (upper.length - 1) / 2]));
      let pick = layer;
      let pickScore = Infinity;
      for (const order of arrangements(layer)) {
        const here = new Map(order.map((id, i) => [id, i - (order.length - 1) / 2]));
        const ends = pairs
          .filter(([a, b]) => above.has(a) && here.has(b))
          .map(([a, b]) => [need(above, a), need(here, b)]);
        let crossed = 0;
        ends.forEach(([a1, b1], i) =>
          ends.slice(i + 1).forEach(([a2, b2]) => (crossed += +((a1 - a2) * (b1 - b2) < 0))),
        );
        const drift = sum(
          order.map((id) => {
            const parents = ends.filter(([, b]) => b === need(here, id)).map(([a]) => a);
            return parents.length ? Math.abs(need(here, id) - mean(parents)) : 0;
          }),
        );
        const s = crossed * 1000 + drift;
        if (s < pickScore) {
          pickScore = s;
          pick = order;
        }
      }
      result.push(pick);
      score += pickScore;
    }
    if (score < bestScore) {
      bestScore = score;
      best = result;
    }
  }
  return best;
}

type GNode = Box & { id: string; table?: Table };
type GEdge = { link: Link; points: Point[]; hub: boolean };

// ─── Diagram and Mermaid preview: hand-placed cards, routed links ───────────

const ER = { w: 188, head: 28, row: 20, foot: 6, cols: 4, margin: 18, bottom: 26 };

/** [column, top] for each card. Rows line up wherever a link can run straight. */
const ER_PLACES: Record<string, [number, number]> = {
  customers: [0, 68],
  addresses: [0, 214],
  reviews: [1, 28],
  orders: [1, 214],
  products: [2, 48],
  order_items: [2, 214],
  payments: [2, 360],
  categories: [3, 68],
  coupons: [3, 214],
  events: [3, 360],
};

type ErCard = Box & { table: Table; col: number };
type ErLabel = Box & { link: Link };
type ErLayout = {
  width: number;
  height: number;
  cards: ErCard[];
  edges: GEdge[];
  labels: ErLabel[];
};

const rowY = (card: ErCard, column: string) =>
  card.y + ER.head + card.table.columns.findIndex((c) => c.name === column) * ER.row + ER.row / 2;

/**
 * Lays out the ER cards `gap` apart and routes each link orthogonally from its
 * FK row to the PK row. Links between neighboring columns get their own lane
 * in the gap; links within a column loop out `loop` past its outer side.
 */
function erLayout({ gap, loop, labels }: { gap: number; loop: number; labels: boolean }) {
  const colX = (col: number) => ER.margin + loop + col * (ER.w + gap);
  const cards: ErCard[] = SCHEMA.map((table) => {
    const [col, y] = ER_PLACES[table.name];
    return {
      table,
      col,
      x: colX(col),
      y,
      w: ER.w,
      h: ER.head + table.columns.length * ER.row + ER.foot,
    };
  });
  const byName = new Map(cards.map((c) => [c.table.name, c]));

  const runs = LINKS.map((link) => {
    const a = need(byName, link.from);
    const b = need(byName, link.to);
    const [fy, ty] = [rowY(a, link.column), rowY(b, link.toColumn)];
    if (a.col === b.col) {
      const out = a.col < ER.cols / 2 ? -1 : 1;
      const x = out < 0 ? a.x : a.x + ER.w;
      return { link, from: { x, y: fy }, to: { x, y: ty }, out, gap: out < 0 ? a.col : a.col + 1 };
    }
    const rightward = a.col < b.col;
    return {
      link,
      from: { x: rightward ? a.x + ER.w : a.x, y: fy },
      to: { x: rightward ? b.x : b.x + ER.w, y: ty },
      out: 0,
      gap: Math.max(a.col, b.col),
    };
  });

  const edges: GEdge[] = [];
  for (let g = 0; g <= ER.cols; g++) {
    const here = runs.filter((r) => r.gap === g);
    const straight = here.filter((r) => r.from.y === r.to.y);
    const bent = here.filter((r) => r.from.y !== r.to.y);
    // Loops hug their column; links across a gap spread evenly over it.
    const slots = bent.every((r) => r.out)
      ? bent.map((r, i) => r.from.x + r.out * (loop + i * 12))
      : even(bent.length, colX(g - 1) + ER.w, colX(g));
    const routes = assignSlots(
      bent,
      slots,
      (r, x) => [[r.from, { x, y: r.from.y }, { x, y: r.to.y }, r.to]],
      straight.map((r) => [r.from, r.to]),
    );
    straight.forEach((r) => edges.push({ link: r.link, points: [r.from, r.to], hub: false }));
    bent.forEach((r, i) => edges.push({ link: r.link, points: routes[i][0], hub: false }));
  }

  // Labels may stick out past the outer loops; shift everything to fit them.
  const placed = labels ? placeLabels(edges, cards) : [];
  const xs = [...cards, ...placed].flatMap((b) => [b.x, b.x + b.w]);
  const lineXs = edges.flatMap((e) => e.points.map((p) => p.x));
  const dx = ER.margin - Math.min(...xs, ...lineXs);
  const move = <TBox extends Box>(b: TBox) => ({ ...b, x: b.x + dx });
  return {
    width: Math.max(...xs, ...lineXs) + dx + ER.margin,
    height: Math.max(...cards.map((b) => b.y + b.h), ...placed.map((b) => b.y + b.h)) + ER.bottom,
    cards: cards.map(move),
    edges: edges.map((e) => ({ ...e, points: e.points.map((p) => ({ x: p.x + dx, y: p.y })) })),
    labels: placed.map(move),
  };
}

const LABEL = { font: 10, h: 16 };
const SPOTS = [0.5, 0.3, 0.7, 0.12, 0.88];

/**
 * Puts each link's column name on one of its segments: never on a card or
 * another label, over as few other lines as possible, preferring the middle
 * of a horizontal run, then a vertical one, then beside a short one.
 */
function placeLabels(edges: GEdge[], cards: Box[]): ErLabel[] {
  const lines = edges.map((e) => segments(simplify(e.points)));
  const placed: ErLabel[] = [];
  edges.forEach((edge, i) => {
    const w = Math.round(mono(edge.link.column, LABEL.font)) + 12;
    const h = LABEL.h;
    const options: { box: Box; cost: number; host: number }[] = [];
    lines[i].forEach(([a, b], host) => {
      // Keep clear of the cardinality marks at the ends and the rounded corners.
      const padA = host === 0 ? 22 : 8;
      const padB = host === lines[i].length - 1 ? 22 : 8;
      if (a.y === b.y) {
        const [lo, hi] = a.x < b.x ? [a.x + padA, b.x - padB] : [b.x + padB, a.x - padA];
        if (hi - lo >= w)
          for (const t of SPOTS)
            options.push({
              box: { x: lo + (hi - lo - w) * t, y: a.y - h / 2, w, h },
              cost: Math.abs(t - 0.5),
              host,
            });
      } else {
        const [lo, hi] = a.y < b.y ? [a.y + padA, b.y - padB] : [b.y + padB, a.y - padA];
        if (hi - lo >= h + 8)
          for (const t of SPOTS)
            options.push({
              box: { x: a.x - w / 2, y: lo + (hi - lo - h) * t, w, h },
              cost: 1 + Math.abs(t - 0.5),
              host,
            });
        const mid = (a.y + b.y - h) / 2;
        options.push(
          { box: { x: a.x + 6, y: mid, w, h }, cost: 3, host },
          { box: { x: a.x - 6 - w, y: mid, w, h }, cost: 3, host },
        );
      }
    });
    const score = ({ box, cost, host }: (typeof options)[number]) => {
      const blocked = [...cards, ...placed].filter((c) => overlaps(grow(box, 4), c)).length;
      const crossed = lines.flatMap((segs, j) =>
        segs.filter((s, k) => !(j === i && k === host) && hits(s, grow(box, 2))),
      ).length;
      return blocked * 1000 + crossed * 10 + cost;
    };
    const best = options.reduce((a, b) => (score(b) < score(a) ? b : a));
    placed.push({
      ...best.box,
      x: Math.round(best.box.x),
      y: Math.round(best.box.y),
      link: edge.link,
    });
  });
  return placed;
}

const DIAGRAM = erLayout({ gap: 92, loop: 26, labels: false });
const MERMAID_PREVIEW = erLayout({ gap: 150, loop: 44, labels: true });

// ─── Hierarchy: parents above children, hubs set aside ─────────────────────

const HI = { h: 40, gapX: 20, gapY: 52, margin: 36, spread: 14, name: 12, meta: 10.5 };
/** A table that this many foreign keys point at is a hub. */
const HUB_MIN = 3;

type HierarchyLayout = {
  width: number;
  height: number;
  nodes: GNode[];
  edges: GEdge[];
  caption: Point & { text: string };
  loose: GNode[];
  badges: (Point & { text: string })[];
  shown: number;
  hidden: number;
};

/** Even widths keep node centers, and so the lines into them, on whole pixels. */
const hierarchyWidth = (t: Table) =>
  2 *
    Math.round(Math.max(mono(t.name, HI.name), mono(`${t.columns.length} columns`, HI.meta)) / 2) +
  28;

function hierarchyLayout(withHubs: boolean): HierarchyLayout {
  const refs = LINKS.filter((l) => l.from !== l.to);
  const hubs = NAMES.filter((name) => refs.filter((l) => l.to === name).length >= HUB_MIN);
  const isHub = (l: Link) => hubs.includes(l.to);
  const links = withHubs ? refs : refs.filter((l) => !isHub(l));
  const linked = new Set(links.flatMap((l) => [l.from, l.to]));
  const graph = layered(
    NAMES.filter((n) => linked.has(n)),
    links.map((l) => [l.to, l.from]),
  );
  const top = (r: number) => HI.margin + r * (HI.h + HI.gapY);
  const width = (id: string) => {
    const table = TABLES.get(id);
    return table ? hierarchyWidth(table) : 0;
  };

  const center = placeLayers(graph, width, HI.gapX);

  // The tables left out of the graph sit in a row beneath it.
  const loose = NAMES.filter((n) => !linked.has(n));
  const xs = [...center].map(([id, x]) => [x - width(id) / 2, x + width(id) / 2]).flat();
  const middle = (Math.min(...xs) + Math.max(...xs)) / 2;
  const looseAt = pack(
    loose.map(width),
    loose.map(() => middle),
    HI.gapX,
  );
  const left = Math.min(...xs, ...looseAt.map((x, i) => x - width(loose[i]) / 2));
  const right = Math.max(...xs, ...looseAt.map((x, i) => x + width(loose[i]) / 2));
  const shift = Math.round(HI.margin - left);

  const at = new Map<string, GNode>();
  graph.layers.forEach((layer, r) =>
    layer.forEach((id) =>
      at.set(id, {
        id,
        table: TABLES.get(id),
        x: need(center, id) + shift - width(id) / 2,
        y: top(r),
        w: width(id),
        h: HI.h,
      }),
    ),
  );

  // Down: hops between two layers bend at a level of their own per parent,
  // and land spread across the top of the child.
  type Hop = { chain: number; from: GNode; to: GNode };
  const hops: Hop[] = graph.chains.flatMap((chain, c) =>
    chain.slice(1).map((id, k) => ({ chain: c, from: need(at, chain[k]), to: need(at, id) })),
  );
  const land = new Map<Hop, number>();
  for (const node of at.values()) {
    const into = hops.filter((s) => s.to === node).sort((p, q) => cx(p.from) - cx(q.from));
    into.forEach((s, j) => land.set(s, cx(node) + (j - (into.length - 1) / 2) * HI.spread));
  }
  const parts = new Map<Hop, Point[]>();
  graph.layers.slice(1).forEach((_, r) => {
    const [y0, y1] = [top(r) + HI.h, top(r + 1)];
    const here = hops.filter((s) => s.from.y === top(r));
    const groups = [...new Set(here.map((s) => s.from))].map((from) =>
      here.filter((s) => s.from === from),
    );
    const straight = (g: Hop[]) => g.length === 1 && need(land, g[0]) === cx(g[0].from);
    const drop = (s: Hop, y: number) => [
      { x: cx(s.from), y: y0 },
      { x: cx(s.from), y },
      { x: need(land, s), y },
      { x: need(land, s), y: y1 },
    ];
    const bent = groups.filter((g) => !straight(g));
    const routed = assignSlots(
      bent,
      even(bent.length, y0, y1),
      (g, y) => g.map((s) => drop(s, y)),
      groups.filter(straight).map(([s]) => drop(s, y0)),
    );
    groups.filter(straight).forEach(([s]) => parts.set(s, drop(s, y0)));
    bent.forEach((g, i) => g.forEach((s, j) => parts.set(s, routed[i][j])));
  });

  const nodes = [...at.values()].filter((n) => n.table);
  const captionY = Math.max(...nodes.map((n) => n.y + n.h)) + 44;
  const looseNodes = loose.map((id, i) => ({
    id,
    table: TABLES.get(id),
    x: looseAt[i] + shift - width(id) / 2,
    y: captionY + 16,
    w: width(id),
    h: HI.h,
  }));
  const badges = withHubs
    ? []
    : looseNodes
        .filter((n) => hubs.includes(n.id))
        .map((n) => ({
          x: cx(n),
          y: n.y + n.h + 6,
          text: `← ${refs.filter((l) => l.to === n.id).length}`,
        }));
  return {
    width: right - left + HI.margin * 2,
    height: captionY + 16 + HI.h + (badges.length ? 24 : 0) + HI.margin,
    nodes,
    edges: links.map((link, c) => ({
      link,
      hub: isHub(link),
      points: simplify(hops.filter((s) => s.chain === c).flatMap((s) => need(parts, s))),
    })),
    caption: {
      x: middle + shift,
      y: captionY,
      text: `${withHubs ? "Not linked" : "Linked only to a hub, or not at all"} · ${loose.length}`,
    },
    loose: looseNodes,
    badges,
    shown: links.length,
    hidden: refs.length - links.length,
  };
}

const HIERARCHY = { hidden: hierarchyLayout(false), shown: hierarchyLayout(true) };

// ─── Tree: referencing tables on the left, what they reference on the right ─

const TR = {
  h: 34,
  gapY: 18,
  pitch: 26,
  /** Arrows into one node sit at least this far apart, within `reach` of its middle. */
  spread: 7,
  reach: 11,
  margin: 32,
  pad: 14,
  lane: 12,
  font: 13,
  pill: 11,
  pillH: 20,
};

type Pill = Box & { link: Link };
type TreeLayout = {
  width: number;
  height: number;
  nodes: GNode[];
  edges: GEdge[];
  pills: Pill[];
  caption: Point & { text: string };
  loose: GNode[];
};

const treeWidth = (name: string) => Math.round(sans(name, TR.font)) + 34;
const pillWidth = (text: string) => Math.round(sans(text, TR.pill)) + 18;

function treeLayout(): TreeLayout {
  const links = LINKS.filter((l) => l.from !== l.to);
  const linked = new Set(links.flatMap((l) => [l.from, l.to]));
  // Ranked from the referenced roots, so the deepest referencing tables end up leftmost.
  const graph = layered(
    NAMES.filter((n) => linked.has(n)),
    links.map((l) => [l.to, l.from]),
  );
  const cols = graph.layers.length;
  const outs = (id: string) => graph.pairs.filter(([, b]) => b === id).length;
  const size = (id: string) => (TABLES.has(id) ? Math.max(TR.h, outs(id) * TR.pitch) : 4);

  const center = placeLayers(graph, size, TR.gapY);
  const minTop = Math.min(...[...center].map(([id, y]) => y - size(id) / 2));
  const cy = (id: string) => need(center, id) - minTop + TR.margin;

  // Each hop leaves its node spread down the right edge, one pill per foreign key.
  type Hop = { chain: number; k: number; from: string; to: string; y1: number; y2: number };
  const raw = graph.chains.flatMap((chain, c) => {
    const ltr = [...chain].reverse();
    return ltr.slice(1).map((to, k) => ({ chain: c, k, from: ltr[k], to }));
  });
  const start = new Map<(typeof raw)[number], number>();
  const end = new Map<(typeof raw)[number], number>();
  for (const id of center.keys()) {
    const out = raw.filter((s) => s.from === id).sort((p, q) => cy(p.to) - cy(q.to));
    out.forEach((s, j) => start.set(s, cy(id) + (j - (out.length - 1) / 2) * TR.pitch));
  }
  // Arrows land level with where they come from when the node's edge allows;
  // otherwise they step at least 8px, so no bend reads as a glitch.
  for (const id of center.keys()) {
    const into = raw.filter((s) => s.to === id).sort((p, q) => need(start, p) - need(start, q));
    if (!TABLES.has(id)) {
      into.forEach((s) => end.set(s, cy(id)));
      continue;
    }
    const [lo, hi] = [cy(id) - TR.reach, cy(id) + TR.reach];
    const desired = into.map((s) => {
      const from = need(start, s);
      const y = Math.min(hi, Math.max(lo, from));
      return y === from || Math.abs(y - from) >= 8 ? y : from + Math.sign(y - from) * 8;
    });
    const at = pack(
      into.map(() => 0),
      desired,
      TR.spread,
    );
    const shift = Math.max(lo - at[0], Math.min(0, hi - at[at.length - 1]));
    into.forEach((s, j) => end.set(s, at[j] + shift));
  }
  const hops: Hop[] = raw.map((s) => ({ ...s, y1: need(start, s), y2: need(end, s) }));

  // Across: column by column, each gap as wide as its pills and lanes need.
  const nodes = new Map<string, GNode>();
  const pills: Pill[] = [];
  const parts = new Map<Hop, Point[]>();
  let x = TR.margin;
  for (let c = 0; c < cols; c++) {
    const layer = graph.layers[cols - 1 - c];
    layer.forEach((id) => {
      const table = TABLES.get(id);
      const w = table ? treeWidth(id) : 0;
      nodes.set(id, {
        id,
        table,
        x,
        y: table ? cy(id) - TR.h / 2 : cy(id),
        w,
        h: table ? TR.h : 0,
      });
    });
    x += Math.max(...layer.map((id) => need(nodes, id).w));
    if (c === cols - 1) break;

    const here = hops.filter((s) => layer.includes(s.from));
    const first = here.filter((s) => s.k === 0);
    first.forEach((s) =>
      pills.push({
        x: x + TR.pad,
        y: s.y1 - TR.pillH / 2,
        w: pillWidth(links[s.chain].column),
        h: TR.pillH,
        link: links[s.chain],
      }),
    );
    const laneStart =
      x +
      TR.pad +
      (first.length ? Math.max(...first.map((s) => pillWidth(links[s.chain].column))) + 12 : 0);
    const bent = here.filter((s) => s.y1 !== s.y2);
    const next = laneStart + Math.max(bent.length - 1, 0) * TR.lane + TR.pad + 6;
    const colRight = x;
    const run = (s: Hop, lane: number) => [
      { x: colRight, y: s.y1 },
      { x: lane, y: s.y1 },
      { x: lane, y: s.y2 },
      { x: next, y: s.y2 },
    ];
    const straight = here.filter((s) => s.y1 === s.y2);
    const routed = assignSlots(
      bent,
      bent.map((_, i) => laneStart + i * TR.lane),
      (s, lane) => [run(s, lane)],
      straight.map((s) => run(s, colRight)),
    );
    straight.forEach((s) => parts.set(s, run(s, colRight)));
    bent.forEach((s, i) => parts.set(s, routed[i][0]));
    x = next;
  }

  const real = [...nodes.values()].filter((n) => n.table);
  const edges = links.map((link, c) => {
    const own = hops.filter((s) => s.chain === c);
    const source = need(nodes, own[0].from);
    return {
      link,
      hub: false,
      points: simplify([
        { x: source.x + source.w, y: own[0].y1 },
        ...own.flatMap((s) => need(parts, s)),
      ]),
    };
  });
  const loose = NAMES.filter((n) => !linked.has(n));
  const captionY = Math.max(...real.map((n) => n.y + n.h), ...pills.map((p) => p.y + p.h)) + 40;
  const looseNodes = loose.map((id, i) => ({
    id,
    table: TABLES.get(id),
    x: TR.margin + sum(loose.slice(0, i).map((n) => treeWidth(n) + 12)),
    y: captionY + 14,
    w: treeWidth(id),
    h: TR.h,
  }));
  return {
    width: Math.max(x, ...looseNodes.map((n) => n.x + n.w)) + TR.margin,
    height: captionY + 14 + TR.h + TR.margin,
    nodes: real,
    edges,
    pills,
    caption: { x: TR.margin, y: captionY, text: `Not linked · ${loose.length}` },
    loose: looseNodes,
  };
}

const TREE = treeLayout();

// ─── Source text: Mermaid and DDL, as highlighted tokens ────────────────────

type TokKind = "kw" | "type" | "id" | "str" | "num" | "fn" | "op" | "key" | "plain";
type Tok = { kind: TokKind; text: string };
type Line = Tok[];

const tok = (kind: TokKind, text: string): Tok => ({ kind, text });
const sp = (n = 1) => tok("plain", " ".repeat(n));

const TOK_CLASS: Record<TokKind, string> = {
  kw: "text-[#a9a6ec]",
  type: "text-[#79c4c2]",
  id: "text-foreground",
  str: "text-[#dcaa80]",
  num: "text-[#dcaa80]",
  fn: "text-soft",
  op: "text-muted-foreground",
  key: "text-copper/85",
  plain: "text-soft",
};

const lineText = (line: Line) => line.map((t) => t.text).join("");

function mermaidSource(): Line[] {
  const entities = SCHEMA.flatMap((t): Line[] => [
    [sp(2), tok("id", t.name), tok("op", " {")],
    ...t.columns.map((c): Line => {
      const keys = [c.pk ? "PK" : "", c.ref ? "FK" : "", c.unique ? "UK" : ""].filter(Boolean);
      return [
        sp(4),
        tok("type", c.type),
        sp(),
        tok("plain", c.name),
        ...(keys.length ? [sp(), tok("key", keys.join(", "))] : []),
      ];
    }),
    [sp(2), tok("op", "}")],
  ]);
  // The referenced side is exactly one, or zero or one when the key is
  // nullable; the referencing side is zero or more, or zero or one when unique.
  const relations = LINKS.map(
    (l): Line => [
      sp(2),
      tok("id", l.to),
      sp(),
      tok("op", `${l.nullable ? "|o" : "||"}--${l.unique ? "o|" : "o{"}`),
      sp(),
      tok("id", l.from),
      tok("op", " : "),
      tok("str", `"${l.column}"`),
    ],
  );
  return [[tok("kw", "erDiagram")], ...entities, [], ...relations];
}

const defaultTok = (value: string) =>
  value.startsWith("'")
    ? [tok("str", value)]
    : value.endsWith("()")
      ? [tok("fn", value.slice(0, -2)), tok("op", "()")]
      : [tok("num", value)];

function createTable(table: Table): Line[] {
  const composite = table.columns.filter((c) => c.pk).length > 1;
  const nameW = Math.max(...table.columns.map((c) => c.name.length)) + 2;
  const typeW = Math.max(...table.columns.map((c) => c.type.length)) + 2;
  const rows = table.columns.map((c): Line => {
    const parts: Tok[][] = [];
    if (c.pk && !composite) parts.push([tok("kw", "PRIMARY KEY")]);
    else if (!c.nullable) parts.push([tok("kw", "NOT NULL")]);
    if (c.unique) parts.push([tok("kw", "UNIQUE")]);
    if (c.default) parts.push([tok("kw", "DEFAULT"), sp(), ...defaultTok(c.default)]);
    if (c.ref)
      parts.push([
        tok("kw", "REFERENCES"),
        sp(),
        tok("id", c.ref.table),
        tok("op", " ("),
        tok("id", c.ref.column),
        tok("op", ")"),
      ]);
    return [
      sp(2),
      tok("id", c.name.padEnd(nameW)),
      tok("type", parts.length ? c.type.padEnd(typeW) : c.type),
      ...parts.flatMap((p, i) => (i ? [sp(), ...p] : p)),
    ];
  });
  if (composite) {
    const keys = table.columns.filter((c) => c.pk).map((c) => c.name);
    rows.push([sp(2), tok("kw", "PRIMARY KEY"), tok("op", ` (${keys.join(", ")})`)]);
  }
  return [
    [tok("kw", "CREATE TABLE"), sp(), tok("id", table.name), tok("op", " (")],
    ...rows.map((row, i) => (i < rows.length - 1 ? [...row, tok("op", ",")] : row)),
    [tok("op", ");")],
  ];
}

const MERMAID_SOURCE = mermaidSource();
const DDL = SCHEMA.map((t) => ({ table: t.name, lines: createTable(t) }));

// ─── Views ──────────────────────────────────────────────────────────────────

export type SchemaView = "diagram" | "hierarchy" | "mermaid" | "tree" | "dictionary" | "ddl";

const VIEWS: { key: SchemaView; label: string; icon: LucideIcon; graph: boolean }[] = [
  { key: "diagram", label: "Diagram", icon: LayoutDashboardIcon, graph: true },
  { key: "hierarchy", label: "Hierarchy", icon: WorkflowIcon, graph: true },
  { key: "mermaid", label: "Mermaid", icon: GitBranchIcon, graph: true },
  { key: "tree", label: "Tree", icon: ListTreeIcon, graph: true },
  { key: "dictionary", label: "Dictionary", icon: BookOpenIcon, graph: false },
  { key: "ddl", label: "DDL", icon: FileCodeIcon, graph: false },
];

const ZOOM = { min: 0.6, max: 1.6, step: 0.1 };

/** The app's canvas palette. SVG strokes are opaque so overlapping lines don't brighten. */
const C = {
  canvas: "#08090a",
  card: "#0f1011",
  head: "#141516",
  line: "rgb(255 255 255 / 0.1)",
  lineHot: "rgb(255 255 255 / 0.26)",
  edge: "#4a4d52",
  edgeHot: "#a3a8b0",
  text: "#f7f8f8",
  soft: "#d0d6e0",
  muted: "#8a8f98",
  fk: "#8eaaff",
  fkBg: "rgb(76 110 245 / 0.2)",
  teal: "#5cbfbd",
  tealHot: "#7fd6d3",
  tealInk: "#052827",
};

const TOOL =
  "inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-md text-[12.5px] text-muted-foreground outline-none transition-colors duration-150 hover:bg-white/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3.5";

/**
 * A live replica of the Schema Diagram tab: the same sample schema shown as
 * a diagram, a hierarchy, Mermaid, a tree, a data dictionary, and DDL.
 */
export function SchemaShowcase({
  className,
  defaultView = "diagram",
}: {
  className?: string;
  defaultView?: SchemaView;
}) {
  const id = useId();
  const [view, setView] = useState(defaultView);
  const [query, setQuery] = useState("");
  const [hubLines, setHubLines] = useState(false);
  const [zoom, setZoom] = useState(1);
  const active = VIEWS.find((v) => v.key === view) ?? VIEWS[0];
  const q = query.trim().toLowerCase();
  const hierarchy = hubLines ? HIERARCHY.shown : HIERARCHY.hidden;
  const tabId = (key: SchemaView) => `${id}-tab-${key}`;

  function select(key: SchemaView) {
    setView(key);
    setZoom(1);
  }

  function zoomBy(step: number) {
    setZoom((z) => Math.min(ZOOM.max, Math.max(ZOOM.min, Math.round((z + step) * 10) / 10)));
  }

  function onTabKey(e: React.KeyboardEvent, index: number) {
    const last = VIEWS.length - 1;
    const next =
      e.key === "ArrowRight"
        ? (index + 1) % VIEWS.length
        : e.key === "ArrowLeft"
          ? (index + last) % VIEWS.length
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : -1;
    if (next < 0) return;
    e.preventDefault();
    select(VIEWS[next].key);
    document.getElementById(tabId(VIEWS[next].key))?.focus();
  }

  const stats =
    view === "hierarchy"
      ? [
          `${SCHEMA.length} tables`,
          `${hierarchy.shown} links`,
          hierarchy.hidden ? `${hierarchy.hidden} hub links hidden` : "",
        ]
      : [`${SCHEMA.length} tables`, `${LINKS.length} links`];

  return (
    <div className={cn("w-full", className)}>
      <div
        role="tablist"
        aria-label="Schema views"
        className="flex w-fit max-w-full gap-0.5 overflow-x-auto rounded-lg border border-border bg-white/[0.02] p-0.5"
      >
        {VIEWS.map((v, i) => {
          const selected = v.key === view;
          return (
            <button
              key={v.key}
              id={tabId(v.key)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(v.key)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "bg-white/[0.08] text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <v.icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
              <span className={cn(!selected && "sr-only sm:not-sr-only")}>{v.label}</span>
            </button>
          );
        })}
      </div>

      <Panel role="tabpanel" id={`${id}-panel`} aria-labelledby={tabId(view)} className="mt-4">
        {/* Window bar with the open tab */}
        <div className="flex h-10 items-center gap-4 border-b border-white/[0.06] px-4">
          <div aria-hidden="true" className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-white/[0.12]" />
            <span className="size-2.5 rounded-full bg-white/[0.12]" />
            <span className="size-2.5 rounded-full bg-white/[0.12]" />
          </div>
          <div className="flex h-7 items-center gap-2 rounded-md bg-white/[0.04] px-2.5 text-[12.5px] text-soft">
            <FileTextIcon aria-hidden="true" className="size-3.5 text-muted-foreground" />
            Schema Diagram
            <XIcon aria-hidden="true" className="size-3 text-faint" />
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex h-11 items-center gap-1.5 border-b border-white/[0.06] px-2.5 sm:gap-2 sm:px-3">
          <NetworkIcon
            aria-hidden="true"
            className="hidden size-4 shrink-0 text-muted-foreground sm:block"
            strokeWidth={1.75}
          />
          <div className="relative min-w-0 flex-1 sm:w-52 sm:flex-none">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-faint"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setQuery("")}
              placeholder="Find a table"
              aria-label="Find a table"
              spellCheck={false}
              className="h-7 w-full rounded-md border border-white/[0.08] bg-white/[0.03] pr-7 pl-7 text-base text-foreground transition-colors duration-150 outline-none placeholder:text-faint focus:border-white/20 sm:text-[12.5px]"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-1 grid size-5 -translate-y-1/2 place-items-center rounded text-faint outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <XIcon aria-hidden="true" className="size-3" />
              </button>
            )}
          </div>
          <p className="hidden truncate font-mono text-[11.5px] text-muted-foreground lg:block">
            {stats.filter(Boolean).join(" · ")}
          </p>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            {view === "hierarchy" && (
              <button
                type="button"
                aria-pressed={hubLines}
                aria-label="Hub lines"
                onClick={() => setHubLines((on) => !on)}
                className={cn(
                  TOOL,
                  "px-1.5 sm:px-2",
                  hubLines && "bg-white/[0.08] text-foreground",
                )}
              >
                <SplineIcon aria-hidden="true" />
                <span aria-hidden="true" className="hidden sm:inline">
                  Hub lines
                </span>
              </button>
            )}
            {active.graph && (
              <>
                <button
                  type="button"
                  aria-label="Zoom out"
                  disabled={zoom <= ZOOM.min}
                  onClick={() => zoomBy(-ZOOM.step)}
                  className={cn(TOOL, "w-7")}
                >
                  <ZoomOutIcon aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Zoom in"
                  disabled={zoom >= ZOOM.max}
                  onClick={() => zoomBy(ZOOM.step)}
                  className={cn(TOOL, "w-7")}
                >
                  <ZoomInIcon aria-hidden="true" />
                </button>
              </>
            )}
            {active.graph && <span aria-hidden="true" className="mx-1 h-4 w-px bg-white/10" />}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    aria-label={`View: ${active.label}`}
                    className={cn(
                      TOOL,
                      "border border-white/[0.1] bg-white/[0.04] px-2 text-foreground hover:bg-white/[0.08] data-popup-open:bg-white/[0.08]",
                    )}
                  />
                }
              >
                <active.icon aria-hidden="true" />
                <span className="hidden sm:inline">{active.label}</span>
                <ChevronDownIcon aria-hidden="true" className="text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="site dark w-44 rounded-xl border border-white/[0.08] bg-[#141516]! p-1 shadow-[0_16px_40px_-8px_rgb(0_0_0/0.7)] ring-0"
              >
                <DropdownMenuRadioGroup
                  value={view}
                  onValueChange={(value) => {
                    const next = VIEWS.find((v) => v.key === value);
                    if (next) select(next.key);
                  }}
                >
                  {VIEWS.map((v) => (
                    <DropdownMenuRadioItem
                      key={v.key}
                      value={v.key}
                      closeOnClick
                      className="gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] text-soft focus:bg-white/[0.06] focus:text-foreground"
                    >
                      <v.icon
                        aria-hidden="true"
                        className="text-muted-foreground"
                        strokeWidth={1.75}
                      />
                      {v.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stage */}
        <div className="h-[440px] bg-background md:h-[520px]">
          {view === "diagram" && (
            <ErGraph
              layout={DIAGRAM}
              q={q}
              zoom={zoom}
              label={`Entity relationship diagram of ${SCHEMA.length} tables: ${LINKS.map((l) => `${l.from}.${l.column} references ${l.to}.${l.toColumn}`).join("; ")}.`}
            />
          )}
          {view === "hierarchy" && <HierarchyGraph layout={hierarchy} q={q} zoom={zoom} />}
          {view === "mermaid" && <MermaidView q={q} zoom={zoom} />}
          {view === "tree" && <TreeGraph q={q} zoom={zoom} />}
          {view === "dictionary" && <Dictionary q={q} onReset={() => setQuery("")} />}
          {view === "ddl" && <DdlView q={q} />}
        </div>
      </Panel>
    </div>
  );
}

// ─── Canvas ─────────────────────────────────────────────────────────────────

/**
 * Scrollable canvas for a graph: drag with the mouse to pan, scroll natively on
 * touch. Zooming keeps the middle of the view in place.
 */
function GraphStage({
  width,
  height,
  zoom,
  label,
  grid = false,
  centered = false,
  className,
  children,
}: {
  width: number;
  height: number;
  zoom: number;
  label: string;
  grid?: boolean;
  /** Start scrolled to the middle rather than the left edge. */
  centered?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const last = useRef({ zoom, width });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prev = last.current;
    last.current = { zoom, width };
    if (prev.zoom === zoom) {
      if (centered) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
      return;
    }
    const k = zoom / prev.zoom;
    el.scrollLeft = (el.scrollLeft + el.clientWidth / 2) * k - el.clientWidth / 2;
    el.scrollTop = (el.scrollTop + el.clientHeight / 2) * k - el.clientHeight / 2;
  }, [zoom, width, centered]);

  return (
    <div
      ref={ref}
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        const el = e.currentTarget;
        drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop };
        el.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        e.currentTarget.scrollLeft = d.left - (e.clientX - d.x);
        e.currentTarget.scrollTop = d.top - (e.clientY - d.y);
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      className={cn(
        "h-full cursor-grab overflow-auto outline-none focus-visible:ring-1 focus-visible:ring-white/25 focus-visible:ring-inset active:cursor-grabbing",
        grid &&
          "bg-[radial-gradient(rgb(255_255_255/0.07)_1px,transparent_1.2px)] [background-size:20px_20px] [background-attachment:local]",
        className,
      )}
    >
      <div className="flex min-h-full w-max min-w-full">
        <svg
          // Inline SVG needs role="img" for its label to be read as one picture.
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
          role="img"
          aria-label={label}
          viewBox={`0 0 ${width} ${height}`}
          width={Math.round(width * zoom)}
          height={Math.round(height * zoom)}
          className="m-auto block shrink-0 font-mono select-none"
        >
          {/* Half-pixel offset keeps 1px lines on whole integer coordinates crisp. */}
          <g transform="translate(0.5 0.5)">{children}</g>
        </svg>
      </div>
    </div>
  );
}

const fade = (on: boolean) => ({ opacity: on ? 1 : 0.3 });
const FADE = "transition-opacity duration-150 motion-reduce:transition-none";

// ─── Diagram and Mermaid preview ────────────────────────────────────────────

type Cardinality = "many" | "one" | "optional";

/** A crow's-foot mark where a line meets a card; `toward` is the line's next point. */
function Mark({ at, toward, kind }: { at: Point; toward: Point; kind: Cardinality }) {
  const { x, y } = at;
  const o = (d: number) => x + Math.sign(toward.x - x) * d;
  if (kind === "many")
    return (
      <>
        <path d={`M${o(11)} ${y}L${x} ${y - 5}M${o(11)} ${y}L${x} ${y + 5}`} />
        <circle cx={o(15)} cy={y} r={3} fill={C.canvas} />
      </>
    );
  if (kind === "one") return <path d={`M${o(6)} ${y - 5}V${y + 5}M${o(10)} ${y - 5}V${y + 5}`} />;
  return (
    <>
      <path d={`M${o(6)} ${y - 5}V${y + 5}`} />
      <circle cx={o(12)} cy={y} r={3} fill={C.canvas} />
    </>
  );
}

const topRounded = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x} ${y + h}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h}Z`;

function ErGraph({
  layout,
  mermaid = false,
  q,
  zoom,
  label,
  className,
}: {
  layout: ErLayout;
  mermaid?: boolean;
  q: string;
  zoom: number;
  label: string;
  className?: string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const hot = (l: Link) => l.from === hover || l.to === hover;
  const shown = (l: Link) => matches(l.from, q) || matches(l.to, q);
  const edges = [...layout.edges].sort((a, b) => +hot(a.link) - +hot(b.link));

  return (
    <GraphStage
      width={layout.width}
      height={layout.height}
      zoom={zoom}
      label={label}
      grid
      className={className}
    >
      <g fill="none">
        {edges.map(({ link, points }) => (
          <g
            key={linkKey(link)}
            stroke={hot(link) ? C.edgeHot : C.edge}
            style={fade(shown(link))}
            className={FADE}
          >
            <path d={pathD(points)} />
            <Mark at={points[0]} toward={points[1]} kind={link.unique ? "optional" : "many"} />
            <Mark
              at={points[points.length - 1]}
              toward={points[points.length - 2]}
              kind={link.nullable ? "optional" : "one"}
            />
          </g>
        ))}
      </g>
      {layout.labels.map((l) => (
        <g key={linkKey(l.link)} style={fade(shown(l.link))} className={FADE}>
          <rect
            x={l.x}
            y={l.y}
            width={l.w}
            height={l.h}
            rx={3}
            fill={C.canvas}
            stroke={hot(l.link) ? C.lineHot : C.line}
          />
          <text
            x={cx(l)}
            y={l.y + l.h / 2}
            dominantBaseline="central"
            textAnchor="middle"
            fontSize={LABEL.font}
            fill={hot(l.link) ? C.soft : C.muted}
          >
            {l.link.column}
          </text>
        </g>
      ))}
      {layout.cards.map((card) => {
        const { x, y, w, h, table } = card;
        return (
          <g
            key={table.name}
            onPointerEnter={() => setHover(table.name)}
            onPointerLeave={() => setHover(null)}
          >
            {/* The card stays opaque when dimmed, so the grid never shows through. */}
            <rect x={x} y={y} width={w} height={h} rx={6} fill={C.card} />
            <g style={fade(matches(table.name, q))} className={FADE}>
              {!mermaid && <path d={topRounded(x, y, w, ER.head, 6)} fill={C.head} />}
              <path d={`M${x} ${y + ER.head}h${w}`} stroke={C.line} />
              <text
                x={mermaid ? x + w / 2 : x + 10}
                y={y + ER.head / 2}
                dominantBaseline="central"
                textAnchor={mermaid ? "middle" : "start"}
                fontSize={11.5}
                fontWeight={mermaid ? 700 : 600}
                fill={C.text}
              >
                {table.name}
              </text>
              {table.columns.map((c, i) => {
                const ry = y + ER.head + i * ER.row + ER.row / 2;
                return mermaid ? (
                  <g key={c.name} fontSize={11}>
                    {c.ref && (
                      <>
                        <rect x={x + 8} y={ry - 6} width={18} height={12} rx={2} fill={C.fkBg} />
                        <text
                          x={x + 17}
                          y={ry}
                          dominantBaseline="central"
                          textAnchor="middle"
                          fontSize={7.5}
                          fontWeight={700}
                          fill={C.fk}
                        >
                          FK
                        </text>
                      </>
                    )}
                    <text
                      x={x + (c.ref ? 32 : 10)}
                      y={ry}
                      dominantBaseline="central"
                      fill={C.muted}
                    >
                      {c.type}
                    </text>
                    <text
                      x={x + w - 10}
                      y={ry}
                      dominantBaseline="central"
                      textAnchor="end"
                      fill={C.soft}
                    >
                      {c.name}
                    </text>
                  </g>
                ) : (
                  <g key={c.name} fontSize={11}>
                    {c.pk ? (
                      <KeyRoundIcon
                        x={x + 9}
                        y={ry - 5.5}
                        size={11}
                        strokeWidth={2}
                        className="text-copper"
                      />
                    ) : c.ref ? (
                      <Link2Icon
                        x={x + 9}
                        y={ry - 5.5}
                        size={11}
                        strokeWidth={2}
                        className="text-[#8eaaff]"
                      />
                    ) : null}
                    <text x={x + 26} y={ry} dominantBaseline="central" fill={C.soft}>
                      {c.name}
                    </text>
                    <text
                      x={x + w - 10}
                      y={ry}
                      dominantBaseline="central"
                      textAnchor="end"
                      fill={C.muted}
                    >
                      {c.type}
                    </text>
                  </g>
                );
              })}
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={6}
                fill="none"
                stroke={hover === table.name ? C.lineHot : C.line}
              />
            </g>
          </g>
        );
      })}
    </GraphStage>
  );
}

// ─── Hierarchy ──────────────────────────────────────────────────────────────

function TealNode({
  node,
  q,
  hot,
  onHover,
}: {
  node: GNode;
  q: string;
  hot: boolean;
  onHover: (id: string | null) => void;
}) {
  const columns = node.table?.columns.length ?? 0;
  return (
    <g
      onPointerEnter={() => onHover(node.id)}
      onPointerLeave={() => onHover(null)}
      style={fade(matches(node.id, q))}
      className={FADE}
    >
      <rect
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        rx={4}
        fill={hot ? C.tealHot : C.teal}
      />
      <text
        x={cx(node)}
        y={node.y + 14}
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={HI.name}
        fontWeight={500}
        fill={C.tealInk}
      >
        {node.id}
      </text>
      <text
        x={cx(node)}
        y={node.y + 28}
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={HI.meta}
        fill={C.tealInk}
        fillOpacity={0.72}
      >
        {columns} columns
      </text>
    </g>
  );
}

function HierarchyGraph({ layout, q, zoom }: { layout: HierarchyLayout; q: string; zoom: number }) {
  const [hover, setHover] = useState<string | null>(null);
  const hot = (l: Link) => l.from === hover || l.to === hover;
  const edges = [...layout.edges].sort((a, b) => +hot(a.link) - +hot(b.link));
  const label =
    `Hierarchy of ${layout.nodes.length} linked tables, each referenced table above the tables that reference it` +
    (layout.hidden ? `; ${layout.hidden} links to the hub table customers are hidden.` : ".");

  return (
    <GraphStage width={layout.width} height={layout.height} zoom={zoom} label={label} centered>
      {edges.map(({ link, points, hub }) => {
        const tip = points[points.length - 1];
        return (
          <g
            key={linkKey(link)}
            style={{
              color: hot(link) ? C.edgeHot : "#5d6168",
              ...fade(matches(link.from, q) || matches(link.to, q)),
            }}
            className={FADE}
          >
            <path
              d={pathD(points, { sharpFirst: true })}
              fill="none"
              stroke="currentColor"
              strokeDasharray={hub ? "4 3" : undefined}
            />
            <path
              d={`M${tip.x - 3.5} ${tip.y - 6}L${tip.x + 3.5} ${tip.y - 6}L${tip.x} ${tip.y}Z`}
              fill="currentColor"
            />
          </g>
        );
      })}
      {[...layout.nodes, ...layout.loose].map((node) => (
        <TealNode key={node.id} node={node} q={q} hot={hover === node.id} onHover={setHover} />
      ))}
      <text
        x={layout.caption.x}
        y={layout.caption.y}
        textAnchor="middle"
        fontSize={12}
        fill={C.muted}
        className="font-sans"
      >
        {layout.caption.text}
      </text>
      {layout.badges.map((b) => (
        <g key={b.text}>
          <rect
            x={b.x - 17}
            y={b.y}
            width={34}
            height={16}
            rx={8}
            fill={C.canvas}
            stroke={C.line}
          />
          <text
            x={b.x}
            y={b.y + 8}
            dominantBaseline="central"
            textAnchor="middle"
            fontSize={10}
            fill={C.muted}
          >
            {b.text}
          </text>
        </g>
      ))}
    </GraphStage>
  );
}

// ─── Tree ───────────────────────────────────────────────────────────────────

function TreeGraph({ q, zoom }: { q: string; zoom: number }) {
  const [hover, setHover] = useState<string | null>(null);
  const hot = (l: Link) => l.from === hover || l.to === hover;
  const shown = (l: Link) => matches(l.from, q) || matches(l.to, q);
  const edges = [...TREE.edges].sort((a, b) => +hot(a.link) - +hot(b.link));

  return (
    <GraphStage
      width={TREE.width}
      height={TREE.height}
      zoom={zoom}
      label="Tree of references: each table on the left points, through the foreign key column, at the table it references on the right."
    >
      {edges.map(({ link, points }) => {
        const tip = points[points.length - 1];
        return (
          <g
            key={linkKey(link)}
            style={{ color: hot(link) ? C.edgeHot : "#5d6168", ...fade(shown(link)) }}
            className={FADE}
          >
            <path d={pathD(points)} fill="none" stroke="currentColor" />
            <path
              d={`M${tip.x - 6} ${tip.y - 3.5}L${tip.x} ${tip.y}L${tip.x - 6} ${tip.y + 3.5}Z`}
              fill="currentColor"
            />
          </g>
        );
      })}
      <g className="font-sans">
        {TREE.pills.map((p) => (
          <g key={linkKey(p.link)} style={fade(shown(p.link))} className={FADE}>
            <rect
              x={p.x}
              y={p.y}
              width={p.w}
              height={p.h}
              rx={4}
              fill={C.canvas}
              stroke={hot(p.link) ? C.lineHot : C.line}
            />
            <text
              x={cx(p)}
              y={p.y + p.h / 2}
              dominantBaseline="central"
              textAnchor="middle"
              fontSize={TR.pill}
              fill={C.muted}
            >
              {p.link.column}
            </text>
          </g>
        ))}
        {[...TREE.nodes, ...TREE.loose].map((n) => (
          <g
            key={n.id}
            onPointerEnter={() => setHover(n.id)}
            onPointerLeave={() => setHover(null)}
            style={fade(matches(n.id, q))}
            className={FADE}
          >
            <rect
              x={n.x}
              y={n.y}
              width={n.w}
              height={n.h}
              rx={3}
              fill="#111214"
              stroke={hover === n.id ? C.lineHot : C.line}
            />
            <text
              x={cx(n)}
              y={n.y + n.h / 2}
              dominantBaseline="central"
              textAnchor="middle"
              fontSize={TR.font}
              fill={C.text}
            >
              {n.id}
            </text>
          </g>
        ))}
        <text x={TREE.caption.x} y={TREE.caption.y} fontSize={12} fill={C.muted}>
          {TREE.caption.text}
        </text>
      </g>
    </GraphStage>
  );
}

// ─── Mermaid ────────────────────────────────────────────────────────────────

function MermaidView({ q, zoom }: { q: string; zoom: number }) {
  // The source shows beside the preview on wide screens and over it on narrow
  // ones; the toggle flips whichever default applies.
  const [flipped, setFlipped] = useState(false);
  const sourceId = useId();
  const toggle = (
    <button
      type="button"
      aria-label="Show or hide the source"
      aria-controls={sourceId}
      onClick={() => setFlipped((f) => !f)}
      className={cn(TOOL, "w-7")}
    >
      <PanelLeftIcon aria-hidden="true" />
    </button>
  );

  return (
    <div className="relative flex h-full">
      <div
        id={sourceId}
        className={cn(
          "absolute inset-0 z-10 flex-col bg-[#0b0c0d] lg:static lg:w-[360px] lg:shrink-0 lg:border-r lg:border-white/[0.06] xl:w-[400px]",
          flipped ? "flex lg:hidden" : "hidden lg:flex",
        )}
      >
        <PaneHeader title="Source">
          <span className="lg:hidden">{toggle}</span>
        </PaneHeader>
        <CodeBlock lines={MERMAID_SOURCE} copyLabel="Copy Mermaid source" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <PaneHeader title="Preview">{toggle}</PaneHeader>
        <ErGraph
          layout={MERMAID_PREVIEW}
          mermaid
          q={q}
          zoom={zoom}
          label={`Mermaid erDiagram preview of ${SCHEMA.length} tables and ${LINKS.length} relationships, each labeled with its foreign key column.`}
          className="min-h-0 flex-1"
        />
      </div>
    </div>
  );
}

function PaneHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/[0.06] px-2">
      {children}
      <p className="px-1 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
        {title}
      </p>
    </div>
  );
}

// ─── Source code (Mermaid and DDL) ──────────────────────────────────────────

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        });
      }}
      className={cn(TOOL, "border border-white/[0.08] bg-[#141516]/90 px-2 backdrop-blur")}
    >
      {copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

function CodeBlock({
  lines,
  copyLabel,
  empty,
}: {
  lines: Line[];
  copyLabel: string;
  empty?: string;
}) {
  return (
    <div className="relative min-h-0 flex-1">
      {lines.length > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <CopyButton text={lines.map(lineText).join("\n")} label={copyLabel} />
        </div>
      )}
      <pre className="h-full overflow-auto py-4 font-mono text-[12px] leading-5 outline-none focus-visible:ring-1 focus-visible:ring-white/25 focus-visible:ring-inset">
        <code>
          {lines.length === 0 && <span className="block px-5 text-faint">{empty}</span>}
          {lines.map((line, i) => (
            <span key={i} className="flex">
              <span
                aria-hidden="true"
                className="w-11 shrink-0 pr-4 text-right text-white/20 tabular-nums select-none"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="pr-6 whitespace-pre">
                {line.map((t, j) => (
                  <span key={j} className={TOK_CLASS[t.kind]}>
                    {t.text}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

function DdlView({ q }: { q: string }) {
  const statements = DDL.filter((s) => matches(s.table, q));
  const lines = statements.flatMap((s, i) => (i ? [[], ...s.lines] : s.lines));
  return (
    <div className="flex h-full flex-col">
      <CodeBlock lines={lines} copyLabel="Copy DDL" empty="-- No tables match" />
    </div>
  );
}

// ─── Dictionary ─────────────────────────────────────────────────────────────

function Dictionary({ q, onReset }: { q: string; onReset: () => void }) {
  const [selected, setSelected] = useState("orders");
  const list = SCHEMA.filter((t) => matches(t.name, q));
  const table = list.find((t) => t.name === selected) ?? list.at(0);
  const referencedBy = LINKS.filter((l) => l.to === table?.name);

  function open(name: string) {
    onReset();
    setSelected(name);
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
      <nav
        aria-label="Tables"
        className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-white/[0.06] p-2 md:w-56 md:flex-col md:gap-0.5 md:overflow-y-auto md:border-r md:border-b-0"
      >
        {list.map((t) => (
          <button
            key={t.name}
            type="button"
            aria-current={t === table ? "true" : undefined}
            onClick={() => setSelected(t.name)}
            className={cn(
              "flex h-8 shrink-0 items-center justify-between gap-4 rounded-md px-2.5 font-mono text-[12px] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring max-md:rounded-full max-md:border max-md:border-white/[0.08]",
              t === table
                ? "bg-white/[0.07] text-foreground max-md:border-white/20"
                : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
            )}
          >
            {t.name}
            <span className="text-faint tabular-nums">{t.columns.length}</span>
          </button>
        ))}
        {list.length === 0 && (
          <p className="px-2.5 py-1.5 text-[12.5px] text-faint">No tables match</p>
        )}
      </nav>

      {table && (
        <div className="min-w-0 flex-1 overflow-y-auto px-4 py-5 md:px-7 md:py-6">
          <div className="flex items-baseline gap-3">
            <h3 className="font-mono text-[15px] font-medium text-foreground">{table.name}</h3>
            <span className="text-[12px] text-faint">{table.columns.length} columns</span>
          </div>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-pretty text-soft">{table.note}</p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-[12px]">
              <thead className="text-[11.5px] text-faint">
                <tr className="border-b border-white/[0.07]">
                  {["Column", "Type", "Nullable", "Default", "Keys"].map((h) => (
                    <th key={h} scope="col" className="py-2 pr-4 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono">
                {table.columns.map((c) => (
                  <tr key={c.name} className="border-b border-white/[0.04]">
                    <td className="py-2 pr-4 text-foreground">{c.name}</td>
                    <td className="py-2 pr-4 text-[#79c4c2]">{c.type}</td>
                    <td className={cn("py-2 pr-4", c.nullable ? "text-soft" : "text-faint")}>
                      {c.nullable ? "yes" : "no"}
                    </td>
                    <td className={cn("py-2 pr-4", c.default ? "text-soft" : "text-faint")}>
                      {c.default ?? "—"}
                    </td>
                    <td className="py-1.5 pr-2">
                      <span className="flex flex-wrap items-center gap-1.5">
                        {c.pk && <KeyBadge className="bg-copper/10 text-copper">PK</KeyBadge>}
                        {c.unique && (
                          <KeyBadge className="bg-white/[0.06] text-soft">UNIQUE</KeyBadge>
                        )}
                        {c.ref && (
                          <button
                            type="button"
                            onClick={() => c.ref && open(c.ref.table)}
                            className="inline-flex items-center gap-1.5 rounded text-[#8eaaff] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <KeyBadge className="bg-[rgb(76_110_245/0.2)] text-[#8eaaff]">
                              FK
                            </KeyBadge>
                            → {c.ref.table}.{c.ref.column}
                          </button>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 className="mt-7 text-[12px] font-medium text-muted-foreground">Referenced by</h4>
          {referencedBy.length ? (
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {referencedBy.map((l) => (
                <li key={linkKey(l)}>
                  <button
                    type="button"
                    onClick={() => open(l.from)}
                    className="h-7 rounded-md border border-white/[0.08] px-2 font-mono text-[12px] text-soft transition-colors duration-150 outline-none hover:border-white/15 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {l.from}.{l.column}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[12.5px] text-faint">No other table references it.</p>
          )}
        </div>
      )}
    </div>
  );
}

function KeyBadge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "rounded px-1 py-px text-[10px] leading-4 font-semibold tracking-wide",
        className,
      )}
    >
      {children}
    </span>
  );
}
