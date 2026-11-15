/**
 * Client for the local bridge `npx strokedb` runs (stroke/cli/src/bridge.js).
 * The page gets the bridge address and a session token in the URL fragment,
 * which never reaches our server; the token moves to sessionStorage and the
 * fragment is cleared, so it isn't left in the address bar or in history.
 */

export type Engine = "postgres" | "mysql" | "sqlite";

export interface BridgeInfo {
  engine: Engine;
  database: string;
  host: string;
  version: string;
  name: string;
}

export interface TableRef {
  schema: string;
  name: string;
  kind: "table" | "view";
}

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
}

export interface Result {
  columns: string[];
  rows: unknown[][];
  rowCount?: number | null;
  command?: string;
}

export interface Sort {
  column: string;
  dir: "asc" | "desc";
}

export interface Session {
  bridge: string;
  token: string;
}

const KEY = "stroke-studio-session";

/** Only a loopback http address is accepted: a link can't point the page elsewhere. */
export function isLoopbackBridge(url: string) {
  try {
    const u = new URL(url);
    return (
      u.protocol === "http:" &&
      (u.hostname === "127.0.0.1" || u.hostname === "localhost") &&
      u.pathname === "/" &&
      !u.username &&
      !u.password
    );
  } catch {
    return false;
  }
}

/** The session from the fragment (then cleared) or from this tab's storage. */
export function takeSession(): Session | null {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const bridge = hash.get("bridge");
  const token = hash.get("token");
  if (bridge && token && isLoopbackBridge(bridge)) {
    const s = { bridge: new URL(bridge).origin, token };
    try {
      sessionStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      // private mode: the session lasts until the tab reloads
    }
    history.replaceState(null, "", window.location.pathname + window.location.search);
    return s;
  }
  try {
    const raw = sessionStorage.getItem(KEY);
    const s = raw ? (JSON.parse(raw) as Session) : null;
    return s && isLoopbackBridge(s.bridge) && typeof s.token === "string" ? s : null;
  } catch {
    return null;
  }
}

export function forgetSession() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // nothing stored
  }
}

export class BridgeError extends Error {
  /** True when nothing answered: the command stopped, or the browser blocked it. */
  unreachable: boolean;
  constructor(message: string, unreachable = false) {
    super(message);
    this.unreachable = unreachable;
  }
}

export function bridgeClient(s: Session) {
  async function call<T>(path: string, body: unknown = {}): Promise<T> {
    let res: Response;
    try {
      res = await fetch(s.bridge + path, {
        method: "POST",
        headers: { authorization: `Bearer ${s.token}`, "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      throw new BridgeError("The bridge isn't answering.", true);
    }
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) throw new BridgeError(data.error || `Bridge error ${res.status}`);
    return data as T;
  }
  return {
    info: () => call<BridgeInfo>("/info"),
    tables: () => call<TableRef[]>("/tables"),
    columns: (schema: string, table: string) => call<Column[]>("/columns", { schema, table }),
    rows: (o: {
      schema: string;
      table: string;
      limit: number;
      offset: number;
      sort: Sort | null;
    }) => call<Result & { total: number | null; estimated: boolean }>("/rows", o),
    query: (sql: string) => call<Result & { durationMs: number }>("/query", { sql }),
  };
}

export type BridgeClient = ReturnType<typeof bridgeClient>;

/** A cell as text for the grid. */
export function cellText(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
