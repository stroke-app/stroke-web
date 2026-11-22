import { createContext, useCallback, useEffect, useRef, useState } from "react";

import { importKey, openSealed, seal, type Sealed } from "./relay-crypto";

/**
 * Live presence in a shared studio: who else has it open, where each of them
 * is (table, cell, pointer) and what they are typing into a cell. One socket
 * per page to `/api/relay/<room>/presence`; every message is sealed with the
 * link's key, so the relay passes along cursors it cannot read.
 *
 * Positions are by table, row key and column name, not pixels or row
 * numbers: each person may have the table sorted, paged or laid out
 * differently, and a cell is the same cell everywhere.
 */

/** A cell, wherever it is on someone's screen. */
export interface CellRef {
  table: string;
  /** The row's primary key values as JSON, or `#<n>` without one. */
  row: string;
  col: string;
}

export interface Presence {
  /** The table the person is looking at, `schema.table`. */
  tab: string | null;
  cell: CellRef | null;
  /** The pointer over a cell, with where in it (0-1 across, 0-1 down). */
  pointer: (CellRef & { fx: number; fy: number }) | null;
  /** A cell being edited and the value typed so far. */
  editing: (CellRef & { value: string }) | null;
}

export interface Peer extends Presence {
  id: number;
  name: string;
  color: string;
  role: "host" | "viewer";
  seen: number;
}

type Message =
  | ({ t: "state"; name: string; color: string; role: "host" | "viewer" } & Presence)
  | { t: "hello" }
  | { t: "changed"; table: string };

const NAMES = [
  "Otter",
  "Heron",
  "Lynx",
  "Panda",
  "Falcon",
  "Koala",
  "Badger",
  "Orca",
  "Ibis",
  "Marten",
  "Puffin",
  "Quokka",
];
/** Distinct at a glance on light and dark grids. */
export const PEER_COLORS = [
  "#e5484d",
  "#0090ff",
  "#30a46c",
  "#f76b15",
  "#8e4ec6",
  "#d6409f",
  "#12a594",
  "#ffb224",
];

function myIdentity() {
  try {
    const saved = JSON.parse(localStorage.getItem("stroke-studio-me") ?? "null");
    if (saved && typeof saved.name === "string" && typeof saved.color === "string")
      return saved as { name: string; color: string };
  } catch {
    // Storage off: a new name per visit.
  }
  const me = {
    name: NAMES[Math.floor(Math.random() * NAMES.length)],
    color: PEER_COLORS[Math.floor(Math.random() * PEER_COLORS.length)],
  };
  try {
    localStorage.setItem("stroke-studio-me", JSON.stringify(me));
  } catch {
    // Kept for this visit.
  }
  return me;
}

const EMPTY: Presence = { tab: null, cell: null, pointer: null, editing: null };
/** A person who has sent nothing for this long has gone (a closed laptop). */
const STALE_MS = 45_000;

/**
 * Presence for a relay session (`room` + `key` from the share link). Returns
 * the others, this page's identity, `publish` to update where this page is
 * (sent at most every 50 ms) and `onChanged` to hear that someone saved an
 * edit to a table.
 */
export function usePresence(
  room: string | null,
  keyText: string | null,
  role: "host" | "viewer" = "viewer",
) {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [me] = useState(myIdentity);
  const state = useRef<Presence>({ ...EMPTY });
  const sock = useRef<WebSocket | null>(null);
  const key = useRef<CryptoKey | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const changedHandlers = useRef(new Set<(table: string) => void>());

  const send = useCallback(async (msg: Message) => {
    const ws = sock.current;
    if (!ws || ws.readyState !== 1 || !key.current) return;
    const sealed = await seal(key.current, msg);
    if (ws.readyState === 1) ws.send(JSON.stringify(sealed));
  }, []);

  const sendState = useCallback(() => {
    void send({ t: "state", name: me.name, color: me.color, role, ...state.current });
  }, [send, me, role]);

  useEffect(() => {
    if (!room || !keyText) return;
    let closed = false;
    let delay = 1000;
    let ping: ReturnType<typeof setInterval> | undefined;
    let sweep: ReturnType<typeof setInterval> | undefined;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const connect = async () => {
      if (closed) return;
      key.current ??= await importKey(keyText);
      // Left while the key was being imported: open nothing.
      if (closed) return;
      const proto = location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${proto}//${location.host}/api/relay/${room}/presence`);
      sock.current = ws;
      ws.onopen = () => {
        delay = 1000;
        // Say who this is, and ask everyone already here to say so too.
        sendState();
        void send({ t: "hello" });
        clearInterval(ping);
        // The keepalive doubles as a heartbeat: others drop a cursor that
        // has said nothing for STALE_MS.
        ping = setInterval(() => sendState(), 20_000);
      };
      ws.onmessage = async (ev) => {
        let raw: { from?: number; gone?: number; iv?: string; ct?: string };
        try {
          raw = JSON.parse(String(ev.data));
        } catch {
          return;
        }
        if (typeof raw.gone === "number") {
          setPeers((ps) => ps.filter((p) => p.id !== raw.gone));
          return;
        }
        if (
          typeof raw.from !== "number" ||
          typeof raw.iv !== "string" ||
          typeof raw.ct !== "string" ||
          !key.current
        )
          return;
        let msg: Message;
        try {
          msg = await openSealed<Message>(key.current, { iv: raw.iv, ct: raw.ct } as Sealed);
        } catch {
          return; // Not sealed with this link's key.
        }
        const from = raw.from;
        if (msg.t === "hello") sendState();
        else if (msg.t === "changed") for (const h of changedHandlers.current) h(msg.table);
        else if (msg.t === "state") {
          const peer: Peer = {
            id: from,
            name: String(msg.name).slice(0, 40),
            color: PEER_COLORS.includes(msg.color) ? msg.color : PEER_COLORS[0],
            role: msg.role === "host" ? "host" : "viewer",
            tab: msg.tab ?? null,
            cell: msg.cell ?? null,
            pointer: msg.pointer ?? null,
            editing: msg.editing ?? null,
            seen: Date.now(),
          };
          setPeers((ps) => [...ps.filter((p) => p.id !== from), peer].sort((a, b) => a.id - b.id));
        }
      };
      ws.onclose = () => {
        clearInterval(ping);
        if (closed || sock.current !== ws) return;
        setPeers([]);
        retry = setTimeout(() => void connect(), delay);
        delay = Math.min(delay * 2, 30_000);
      };
    };
    void connect();
    sweep = setInterval(
      () => setPeers((ps) => ps.filter((p) => Date.now() - p.seen < STALE_MS)),
      10_000,
    );
    return () => {
      closed = true;
      clearInterval(ping);
      clearInterval(sweep);
      clearTimeout(retry);
      const ws = sock.current;
      sock.current = null;
      try {
        ws?.close(1000, "Left");
      } catch {
        // already closed
      }
    };
  }, [room, keyText, send, sendState]);

  /** Update where this page is; sent at most every 50 ms. */
  const publish = useCallback(
    (patch: Partial<Presence>) => {
      state.current = { ...state.current, ...patch };
      if (timer.current) return;
      timer.current = setTimeout(() => {
        timer.current = null;
        sendState();
      }, 50);
    },
    [sendState],
  );

  /** Tell the others a table's rows changed, so they reload it. */
  const announceChanged = useCallback(
    (table: string) => void send({ t: "changed", table }),
    [send],
  );

  /** Run `fn` when someone saves a change to a table. */
  const onChanged = useCallback((fn: (table: string) => void) => {
    changedHandlers.current.add(fn);
    return () => void changedHandlers.current.delete(fn);
  }, []);

  return { peers, me, publish, announceChanged, onChanged };
}

/** The studio's presence, for the tabs and grids below it; null when not shared. */
export const PresenceContext = createContext<ReturnType<typeof usePresence> | null>(null);
