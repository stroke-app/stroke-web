/**
 * Figures for the post "How Stroke shares a database without putting it
 * online" (src/content/blog/how-shared-studios-work.md), drawn with Safis.
 * The post places each one with a {{share-*}} line; this module is loaded
 * only on that page (blog-widgets.tsx), since the Safis runtime is large.
 *
 * One shared model: the other person's browser on the left (blue), the relay
 * at stroke.click in the middle (purple), your machine on the right (green),
 * the key and the room secret in orange, anything refused in red.
 */
import "@safis/core/scoped.css";
import "./shared-studio-figures.css";
import { Figure } from "@safis/react";
import { useEffect } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
type G = any;
type Spec = Record<string, any>;

// ── shared drawing ───────────────────────────────────────────────────────────

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

/** A labelled box: a node in the diagram. */
function node(
  g: G,
  c: [number, number],
  w: number,
  h: number,
  title: string,
  sub: string,
  color: string,
  lit = false,
) {
  g.rect(c[0] - w / 2, c[1] - h / 2, w, h, {
    r: 8,
    fill: g.rgba(color, lit ? 0.22 : 0.1),
    stroke: color,
    width: lit ? 2.5 : 1.5,
  });
  g.text(title, [c[0], c[1] - (sub ? 7 : 0)], {
    size: 13,
    weight: 600,
    align: "center",
    baseline: "middle",
    color: "ink",
  });
  if (sub)
    g.text(sub, [c[0], c[1] + 10], {
      size: 11,
      align: "center",
      baseline: "middle",
      color: "muted",
      font: "mono",
    });
}

/** A point along a polyline, t in 0..1. */
function along(pts: [number, number][], t: number): [number, number] {
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(d);
    total += d;
  }
  let left = clamp(t, 0, 1) * total;
  for (let i = 0; i < seg.length; i++) {
    if (left <= seg[i]) {
      const k = seg[i] ? left / seg[i] : 0;
      return [
        pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k,
        pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k,
      ];
    }
    left -= seg[i];
  }
  return pts[pts.length - 1];
}

const hex = (b: Uint8Array, n = b.length) =>
  Array.from(b.slice(0, n), (x) => x.toString(16).padStart(2, "0")).join(" ");

/** Real AES-256-GCM, the same call the studio makes. */
async function encrypt(key: CryptoKey, text: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(text)),
  );
  return { iv, ct };
}
const newKey = () =>
  crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]) as Promise<CryptoKey>;

// ── 1. A direct link can't reach your laptop ────────────────────────────────

const reach: Spec = {
  aspect: (w: number) => (w < 520 ? 1.15 : 1.9),
  state: () => ({ t: 0 }),
  controls: [
    {
      key: "path",
      label: "Route",
      type: "choice",
      options: [
        { value: "direct", label: "Straight to your laptop" },
        { value: "relay", label: "Through the relay" },
      ],
      value: "direct",
    },
  ],
  caption:
    "The other person's browser trying to reach a database on your laptop, behind your router.",
  step(dt: number, s: any) {
    s.t = (s.t + dt * 0.45) % 1;
  },
  draw(g: G, s: any, v: any) {
    const narrow = g.w < 520;
    const B: [number, number] = [g.w * 0.14, g.h * (narrow ? 0.72 : 0.68)];
    const R: [number, number] = [g.w * 0.5, g.h * 0.2];
    const routerX = g.w * 0.66;
    const L: [number, number] = [g.w * 0.86, g.h * (narrow ? 0.72 : 0.68)];
    // your network
    g.rect(routerX - 6, g.h * 0.42, g.w - routerX - 2, g.h * 0.54, {
      r: 10,
      stroke: "green",
      dash: [5, 5],
      width: 1,
    });
    g.label("your network", [routerX + 14, g.h * 0.47], { color: "green", align: "left" });
    g.line([routerX, g.h * 0.44], [routerX, g.h * 0.94], { stroke: "ink", width: 4 });
    g.label("router", [routerX - 4, g.h * 0.97], { align: "right" });
    node(g, B, narrow ? 92 : 120, 46, "Their browser", "phone, anywhere", "blue");
    node(g, L, narrow ? 92 : 120, 46, "Your laptop", "127.0.0.1", "green");
    if (v.path === "direct") {
      const stop: [number, number] = [routerX - 8, B[1]];
      g.arrow([B[0] + 62, B[1]], stop, { stroke: "red", width: 2.5 });
      g.text("✕", [routerX - 18, B[1] - 18], { size: 20, color: "red", align: "center" });
      g.label(
        "no way in: the router has nothing to send it to",
        [(B[0] + routerX) / 2, B[1] + 46],
        { color: "red", align: "center" },
      );
      g.circle(along([[B[0] + 62, B[1]], stop], s.t), 4, { fill: "blue" });
    } else {
      node(g, R, narrow ? 120 : 150, 46, "Relay", "stroke.click", "purple");
      const out: [number, number][] = [
        [L[0], L[1] - 24],
        [L[0], R[1] + 6],
        [R[0] + 76, R[1]],
      ];
      const inn: [number, number][] = [
        [B[0], B[1] - 24],
        [B[0], R[1]],
        [R[0] - 76, R[1]],
      ];
      g.path(out, { stroke: "green", width: 2.5 });
      g.path(inn, { stroke: "blue", width: 2.5 });
      g.circle(along(out, s.t), 4, { fill: "green" });
      g.circle(along(inn, s.t), 4, { fill: "blue" });
      g.label("both connect out to the relay", [R[0], R[1] + 40], {
        color: "purple",
        align: "center",
      });
    }
  },
};

// ── 2. Out is allowed, in is not ────────────────────────────────────────────

const outbound: Spec = {
  aspect: 2,
  state: () => ({ t: 0 }),
  controls: [
    {
      key: "dir",
      label: "Who starts it",
      type: "choice",
      options: [
        { value: "in", label: "Someone outside" },
        { value: "out", label: "Your laptop" },
      ],
      value: "out",
    },
  ],
  caption:
    "A firewall drops connections that start outside. One your laptop starts is let out, and the replies come back along it.",
  step(dt: number, s: any) {
    s.t = (s.t + dt * 0.4) % 2;
  },
  draw(g: G, s: any, v: any) {
    const y = g.h * 0.5;
    const wall = g.w * 0.5;
    const A: [number, number] = [g.w * 0.13, y];
    const Z: [number, number] = [g.w * 0.87, y];
    node(g, A, 110, 44, "Relay", "stroke.click", "purple");
    node(g, Z, 110, 44, "Your laptop", "behind NAT", "green");
    g.rect(wall - 5, y - 60, 10, 120, { fill: "ink", r: 2 });
    g.label("firewall", [wall, y - 72], { align: "center" });
    if (v.dir === "in") {
      const p = along(
        [
          [A[0] + 56, y],
          [wall - 8, y],
        ],
        Math.min(1, s.t),
      );
      g.arrow([A[0] + 56, y], [wall - 10, y], { stroke: "red", width: 2 });
      g.circle(p, 5, { fill: "purple" });
      if (s.t > 0.95)
        g.text("✕ dropped", [wall - 14, y + 26], { color: "red", size: 13, align: "right" });
    } else {
      g.arrow([Z[0] - 56, y - 12], [A[0] + 56, y - 12], { stroke: "green", width: 2 });
      g.arrow([A[0] + 56, y + 12], [Z[0] - 56, y + 12], {
        stroke: "purple",
        width: 2,
        dash: [6, 4],
      });
      if (s.t < 1)
        g.circle(
          along(
            [
              [Z[0] - 56, y - 12],
              [A[0] + 56, y - 12],
            ],
            s.t,
          ),
          5,
          { fill: "green" },
        );
      else
        g.circle(
          along(
            [
              [A[0] + 56, y + 12],
              [Z[0] - 56, y + 12],
            ],
            s.t - 1,
          ),
          5,
          { fill: "purple" },
        );
      g.label("opens the connection", [g.w * 0.5, y - 26], { color: "green", align: "center" });
      g.label("calls come back on it", [g.w * 0.5, y + 34], { color: "purple", align: "center" });
    }
  },
  status: (_s: any, v: any) => (v.dir === "in" ? "blocked" : "connection open"),
};

// ── 3. The link, and the part no server sees ────────────────────────────────

const PARTS = [
  { text: "https://stroke.click", color: "ink", sent: true, name: "site" },
  { text: "/studio", color: "ink", sent: true, name: "page" },
  { text: "#relay=mTd4P-Isi7ihABYYp6ouyw", color: "purple", sent: false, name: "room" },
  {
    text: "&key=mBe1CN8uS49CwQl6RuAC42pXyw131jaCq6aNVAxFnwM",
    color: "orange",
    sent: false,
    name: "key",
  },
];

const link: Spec = {
  aspect: (w: number) => (w < 520 ? 1.2 : 2.3),
  controls: [
    {
      key: "view",
      label: "Show",
      type: "choice",
      options: [
        { value: "link", label: "The link you send" },
        { value: "server", label: "What the server gets" },
      ],
      value: "link",
    },
  ],
  caption:
    "A share link. Everything after # is the fragment: the browser keeps it, so the room and the key never reach a server.",
  draw(g: G, _s: any, v: any) {
    const size = g.w < 520 ? 11 : 12.5;
    const lineH = 24;
    let x = 14;
    let y = 34;
    const rows: { name: string; x0: number; x1: number; y: number; color: string }[] = [];
    for (const p of PARTS) {
      const shown = v.view === "server" && !p.sent ? null : p.text;
      if (!shown) continue;
      for (const chunk of shown.match(/.{1,26}/g) ?? []) {
        const w = g.measure(chunk, { size, font: "mono" });
        if (x + w > g.w - 14) {
          x = 14;
          y += lineH;
        }
        g.text(chunk, [x, y], {
          size,
          font: "mono",
          color: p.color === "ink" ? "ink" : p.color,
          weight: 500,
          align: "left",
        });
        rows.push({ name: p.name, x0: x, x1: x + w, y, color: p.color });
        x += w;
      }
    }
    for (const r of rows) {
      if (r.color !== "ink")
        g.line([r.x0, r.y + 8], [r.x1, r.y + 8], { stroke: r.color, width: 2 });
    }
    const ly = y + 46;
    if (v.view === "server") {
      g.text("GET /studio HTTP/1.1", [14, ly], { size, font: "mono", color: "ink", align: "left" });
      g.text("Host: stroke.click", [14, ly + 20], {
        size,
        font: "mono",
        color: "ink",
        align: "left",
      });
      g.label("no room, no key: the fragment stayed in the browser", [14, ly + 46], {
        color: "muted",
        align: "left",
      });
    } else {
      g.chip("room", [34, ly], { color: "purple" });
      g.label("where to meet on the relay", [64, ly], { color: "muted", align: "left" });
      g.chip("key", [34, ly + 26], { color: "orange" });
      g.label("256 random bits that lock every message", [64, ly + 26], {
        color: "muted",
        align: "left",
      });
    }
  },
};

// ── 4. Locking a request ────────────────────────────────────────────────────

const sealSpec: Spec = {
  aspect: (w: number) => (w < 520 ? 1.05 : 1.9),
  state: () => ({ key: null, iv: null, ct: null, busy: false, tries: 0 }),
  controls: [
    {
      key: "sql",
      label: "Query",
      type: "text",
      value: "select * from users",
      examples: ["select * from users", "select * from userz", "select count(*) from orders"],
    },
    { label: "Send it again", type: "button", action: (s: any) => (s.tries += 1) },
  ],
  caption:
    "Real AES-256-GCM in your browser. The orange bytes at the end are the tag that proves nothing was changed.",
  draw(g: G, s: any, v: any, fig: any) {
    const want = `${v.sql}|${s.tries}`;
    if (s.done !== want && !s.busy) {
      s.busy = true;
      (async () => {
        s.key ??= await newKey();
        const r = await encrypt(s.key, JSON.stringify({ path: "/query", body: { sql: v.sql } }));
        s.iv = r.iv;
        s.ct = r.ct;
        s.done = want;
        s.busy = false;
        fig?.redraw();
      })();
    }
    const narrow = g.w < 520;
    g.label("the request", [14, 20], { color: "blue", align: "left" });
    g.text(
      JSON.stringify({ path: "/query", body: { sql: v.sql } }).slice(0, narrow ? 44 : 70),
      [14, 40],
      {
        size: 12,
        font: "mono",
        color: "ink",
        align: "left",
      },
    );
    g.label("a fresh IV for this message (12 bytes)", [14, 72], { color: "muted", align: "left" });
    if (s.iv) g.text(hex(s.iv), [14, 92], { size: 12, font: "mono", color: "ink", align: "left" });
    g.label("what leaves your browser", [14, 124], { color: "purple", align: "left" });
    if (s.ct) {
      const cols = narrow ? 12 : 24;
      const cell = Math.min(22, (g.w - 28) / cols);
      const n = Math.min(s.ct.length, cols * Math.floor((g.h - 150) / cell));
      for (let i = 0; i < n; i++) {
        const x = 14 + (i % cols) * cell;
        const y = 140 + Math.floor(i / cols) * cell;
        const tag = i >= s.ct.length - 16;
        g.rect(x + 1, y + 1, cell - 2, cell - 2, {
          fill: g.rgba(tag ? "orange" : "purple", 0.12 + (s.ct[i] / 255) * 0.5),
          r: 3,
        });
      }
    }
  },
  status: (s: any) =>
    s.ct ? `${s.ct.length} bytes, ${s.ct.length - 16} of them the query, 16 the tag` : "encrypting",
};

// ── 5. What the relay sees ──────────────────────────────────────────────────

const relayView: Spec = {
  aspect: (w: number) => (w < 520 ? 1.2 : 2.1),
  state: () => ({ t: 0 }),
  controls: [
    {
      key: "view",
      label: "Look from",
      type: "choice",
      options: [
        { value: "ends", label: "The two ends" },
        { value: "relay", label: "Inside the relay" },
      ],
      value: "relay",
    },
  ],
  caption:
    "One call there and back. Only the two ends hold the key; the relay forwards bytes it can't read.",
  step(dt: number, s: any) {
    s.t = (s.t + dt * 0.25) % 1;
  },
  draw(g: G, s: any, v: any) {
    const y = g.h * 0.55;
    const B: [number, number] = [g.w * 0.13, y];
    const R: [number, number] = [g.w * 0.5, y];
    const M: [number, number] = [g.w * 0.87, y];
    const narrow = g.w < 520;
    node(g, B, narrow ? 80 : 104, 44, "Browser", "has the key", "blue");
    node(g, R, narrow ? 84 : 110, 44, "Relay", "no key", "purple", v.view === "relay");
    node(g, M, narrow ? 80 : 104, 44, "Your machine", "has the key", "green");
    const go = s.t < 0.5;
    const k = go ? s.t / 0.5 : (s.t - 0.5) / 0.5;
    const ly = y - 52;
    const B2: [number, number] = [B[0], ly];
    const M2: [number, number] = [M[0], ly];
    g.line(B2, M2, { stroke: "faint", width: 1, dash: [4, 4] });
    const p = go ? along([B2, M2], k) : along([M2, B2], k);
    const inMiddle = p[0] > B[0] + 60 && p[0] < M[0] - 60;
    const plain = go ? "select * from users" : "[ana] [bo]";
    const label = v.view === "relay" || inMiddle ? "9f 3c e1 07 b2 …" : plain;
    g.circle(p, 6, { fill: inMiddle ? "purple" : go ? "blue" : "green" });
    const tw = g.measure(label, { size: 11.5, font: "mono" });
    g.text(label, [clamp(p[0], tw / 2 + 6, g.w - tw / 2 - 6), p[1] - 16], {
      size: 11.5,
      font: "mono",
      align: "center",
      color: inMiddle ? "purple" : "ink",
      halo: true,
    });
    if (v.view === "relay") {
      g.label("the relay sees: room id, size, timing", [R[0], R[1] + 48], {
        color: "purple",
        align: "center",
      });
    } else {
      g.label("readable only where the key is", [R[0], R[1] + 48], {
        color: "muted",
        align: "center",
      });
    }
  },
};

// ── 6. Wrong key, changed byte ──────────────────────────────────────────────

const tamper: Spec = {
  aspect: (w: number) => (w < 520 ? 1.3 : 2.4),
  state: () => ({ result: null, busy: false, done: "" }),
  controls: [
    {
      key: "try",
      label: "Open it with",
      type: "choice",
      options: [
        { value: "right", label: "The link's key" },
        { value: "wrong", label: "A guessed key" },
        { value: "flip", label: "One byte changed" },
      ],
      value: "right",
    },
  ],
  caption:
    "Decrypting a sealed call. GCM checks the tag first, so anything but the right key on untouched bytes is refused.",
  draw(g: G, s: any, v: any, fig: any) {
    if (s.done !== v.try && !s.busy) {
      s.busy = true;
      (async () => {
        const key = await newKey();
        const { iv, ct } = await encrypt(key, "select * from users");
        let use = key;
        const bytes = new Uint8Array(ct);
        if (v.try === "wrong") use = await newKey();
        if (v.try === "flip") bytes[3] ^= 0x01;
        try {
          const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, use, bytes);
          s.result = { ok: true, text: new TextDecoder().decode(pt) };
        } catch {
          s.result = { ok: false, text: "rejected: the tag doesn't match" };
        }
        s.done = v.try;
        s.busy = false;
        fig?.redraw();
      })();
    }
    const y = g.h * 0.5;
    node(
      g,
      [g.w * 0.18, y],
      120,
      46,
      "Sealed call",
      v.try === "flip" ? "1 byte changed" : "as sent",
      v.try === "flip" ? "red" : "purple",
    );
    g.arrow([g.w * 0.18 + 64, y], [g.w * 0.49, y], {
      stroke: v.try === "wrong" ? "red" : "orange",
      width: 2,
    });
    g.chip(v.try === "wrong" ? "guessed key" : "link key", [g.w * 0.36, y - 18], {
      color: v.try === "wrong" ? "red" : "orange",
    });
    if (s.result) {
      const ok = s.result.ok;
      g.text(ok ? "✓" : "✕", [g.w * 0.53, y + 1], {
        size: 26,
        color: ok ? "green" : "red",
        align: "center",
        baseline: "middle",
      });
      g.text(s.result.text, [g.w * 0.57, y], {
        size: 12.5,
        font: "mono",
        color: ok ? "ink" : "red",
        baseline: "middle",
        align: "left",
      });
    }
  },
};

// ── 7. Read-only, enforced twice ────────────────────────────────────────────

const STATEMENTS: Record<string, { sql: string; stop: 0 | 1 | 2; why: string }> = {
  select: {
    sql: "SELECT * FROM users",
    stop: 2,
    why: "reads: runs, then the transaction rolls back",
  },
  delete: { sql: "DELETE FROM users", stop: 0, why: "not a reading statement" },
  cte: {
    sql: "WITH x AS (DELETE FROM users …) SELECT …",
    stop: 1,
    why: "looks like a read; the database refuses the write",
  },
  two: { sql: "SELECT 1; DELETE FROM users", stop: 0, why: "two statements: one at a time only" },
};

const readonly: Spec = {
  aspect: (w: number) => (w < 520 ? 1.1 : 2.1),
  state: () => ({ t: 0 }),
  controls: [
    {
      key: "q",
      label: "Statement",
      type: "choice",
      options: [
        { value: "select", label: "SELECT" },
        { value: "delete", label: "DELETE" },
        { value: "cte", label: "WITH … DELETE" },
        { value: "two", label: "SELECT; DELETE" },
      ],
      value: "cte",
    },
  ],
  caption:
    "A statement from a read-only share. The first gate is a SQL filter; the second is a read-only transaction the database enforces itself.",
  change(_k: string, s: any) {
    s.t = 0;
  },
  step(dt: number, s: any) {
    s.t = Math.min(1.4, s.t + dt * 0.45);
  },
  draw(g: G, s: any, v: any) {
    const st = STATEMENTS[v.q];
    const y = g.h * 0.55;
    const xs = [g.w * 0.36, g.w * 0.62];
    const end = g.w * 0.88;
    g.text(st.sql, [14, 26], { size: 12, font: "mono", color: "blue", align: "left" });
    const gates = ["one reading statement?", "read-only transaction"];
    gates.forEach((name, i) => {
      g.rect(xs[i] - 5, y - 44, 10, 88, {
        r: 2,
        fill: st.stop === i && s.t > 0.2 * (i + 1) ? "red" : "ink",
      });
      g.label(name, [xs[i], y + 62], { align: "center" });
    });
    node(g, [end, y], 86, 44, "Database", "", "green", st.stop === 2 && s.t >= 1);
    const stopX = st.stop === 2 ? end - 44 : xs[st.stop] - 10;
    const x = 30 + (stopX - 30) * clamp(s.t, 0, 1);
    g.circle([x, y], 7, { fill: "blue" });
    if (s.t >= 1) {
      g.label(st.why, [g.w * 0.5, y - 62], {
        color: st.stop === 2 ? "green" : "red",
        align: "center",
      });
    }
  },
  status: (_s: any, v: any) =>
    STATEMENTS[v.q].stop === 2
      ? "ran, nothing changed"
      : `stopped at gate ${STATEMENTS[v.q].stop + 1}`,
};

// ── 8. Only you can serve the room ──────────────────────────────────────────

const claim: Spec = {
  aspect: (w: number) => (w < 520 ? 1.2 : 2.2),
  state: () => ({ t: 0 }),
  controls: [
    {
      key: "who",
      label: "Connecting as the host",
      type: "choice",
      options: [
        { value: "you", label: "Your machine, after Wi-Fi drops" },
        { value: "viewer", label: "Someone with the link" },
      ],
      value: "viewer",
    },
  ],
  caption:
    "The room remembers the secret its first host showed. The link carries the room and the key, but never the secret.",
  change(_k: string, s: any) {
    s.t = 0;
  },
  step(dt: number, s: any) {
    s.t = Math.min(1.3, s.t + dt * 0.5);
  },
  draw(g: G, s: any, v: any) {
    const y = g.h * 0.52;
    const R: [number, number] = [g.w * 0.3, y];
    const C: [number, number] = [g.w * 0.82, y];
    node(g, R, 130, 46, "Room on the relay", "", "purple");
    g.chip("remembers: secret", [R[0], R[1] + 42], { color: "orange" });
    const you = v.who === "you";
    node(
      g,
      C,
      130,
      46,
      you ? "Your machine" : "A viewer",
      you ? "has room + key + secret" : "has room + key",
      you ? "green" : "blue",
    );
    const p = along(
      [
        [C[0] - 66, y],
        [R[0] + 66, y],
      ],
      clamp(s.t, 0, 1),
    );
    g.arrow([C[0] - 66, y], [R[0] + 70, y], {
      stroke: you ? "green" : "blue",
      width: 2,
      dash: [6, 4],
    });
    g.circle(p, 6, { fill: you ? "green" : "blue" });
    if (s.t >= 1) {
      g.label(
        you ? "secret matches: back online, same link" : "403: this room belongs to another host",
        [g.w * 0.56, y - 40],
        {
          color: you ? "green" : "red",
          align: "center",
        },
      );
    }
  },
};

// ── 9. Stopping ─────────────────────────────────────────────────────────────

const stop: Spec = {
  aspect: (w: number) => (w < 520 ? 1.4 : 2.6),
  controls: [
    { key: "now", label: "Time", min: 0, max: 60, step: 1, value: 40, unit: "s", color: "blue" },
    {
      key: "at",
      label: "Stop sharing at",
      min: 5,
      max: 55,
      step: 1,
      value: 30,
      unit: "s",
      color: "red",
    },
  ],
  caption:
    "Calls from the browser every 5 seconds. After the share stops, each one comes back at once as offline.",
  draw(g: G, _s: any, v: any) {
    const P = g.fit(0, 60, 0, 10, { uniform: false, pad: 24 });
    g.line(P([0, 4]), P([60, 4]), { stroke: "muted", width: 1 });
    g.rect(
      P([0, 8])[0],
      P([0, 8])[1],
      P([v.at, 0])[0] - P([0, 0])[0],
      P([0, 4])[1] - P([0, 8])[1],
      {
        fill: g.rgba("green", 0.14),
      },
    );
    g.label("sharing", P([2, 9]), { color: "green" });
    g.line(P([v.at, 0]), P([v.at, 10]), { stroke: "red", width: 2 });
    g.label("stop", P([v.at + 0.6, 9]), { color: "red" });
    for (let t = 2.5; t <= 60; t += 5) {
      if (t > v.now) break;
      const ok = t < v.at;
      g.circle(P([t, 4]), 7, { fill: ok ? "green" : "red" });
      g.text(ok ? "✓" : "✕", P([t, 4]), {
        size: 10,
        color: "panel",
        align: "center",
        baseline: "middle",
        weight: 700,
      });
    }
    g.line(P([v.now, 1]), P([v.now, 7]), { stroke: "blue", width: 2 });
    g.label(v.now < v.at ? "answered" : "offline, at once", P([v.now, 0.4]), {
      color: v.now < v.at ? "green" : "red",
      align: "center",
    });
  },
  status: (_s: any, v: any) => {
    const sent = Math.floor((v.now + 2.5) / 5);
    const ok = Math.min(sent, Math.ceil((v.at - 2.5) / 5));
    return `${ok} answered, ${Math.max(0, sent - ok)} offline`;
  },
};

// ── mounting ────────────────────────────────────────────────────────────────

const SPECS: Record<string, { spec: Spec; label: string }> = {
  "share-reach": {
    spec: reach,
    label:
      "A browser outside trying to reach a laptop behind a router, directly or through a relay.",
  },
  "share-outbound": {
    spec: outbound,
    label: "A firewall drops a connection from outside and lets one from the laptop out.",
  },
  "share-link": {
    spec: link,
    label: "A share link split into its parts, and what a server receives of it.",
  },
  "share-seal": { spec: sealSpec, label: "A query encrypted with AES-256-GCM, shown as bytes." },
  "share-relay": {
    spec: relayView,
    label: "A call travelling from browser to relay to your machine and back.",
  },
  "share-tamper": {
    spec: tamper,
    label: "Decrypting a sealed call with the right key, a wrong key, or a changed byte.",
  },
  "share-readonly": {
    spec: readonly,
    label: "A SQL statement passing two read-only gates, or stopping at one.",
  },
  "share-claim": {
    spec: claim,
    label: "Your machine and a viewer each trying to serve the same relay room.",
  },
  "share-stop": { spec: stop, label: "A timeline of calls before and after sharing stops." },
};

export const SHARE_FIGURES = Object.keys(SPECS);

/** The site sets a dark/light class on <html>; Safis reads data-theme. Keep them together. */
function useThemeSync() {
  useEffect(() => {
    const el = document.documentElement;
    const sync = () => {
      el.dataset.theme = el.classList.contains("dark") ? "dark" : "light";
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => {
      mo.disconnect();
      delete el.dataset.theme;
    };
  }, []);
}

export default function ShareFigure({ name }: { name: string }) {
  useThemeSync();
  const f = SPECS[name];
  if (!f) return null;
  return (
    <div className="not-prose my-8">
      <Figure id={name} spec={f.spec as never} label={f.label} />
    </div>
  );
}
