/**
 * Client for the local bridge `npx strokedb` runs (stroke/cli/src/bridge.js).
 * The page gets the bridge address and a session token in the URL fragment,
 * which never reaches our server; the token moves to sessionStorage and the
 * fragment is cleared, so it isn't left in the address bar or in history.
 */

import { importKey, openSealed, seal, type Sealed } from "#/lib/relay/relay-crypto";

/** The engine behind the studio. The desktop app shares any SQL engine
 *  (mssql, oracle, duckdb, clickhouse, spanner, bigquery, snowflake, odbc, ...);
 *  strokedb speaks the first three. */
export type Engine = "postgres" | "mysql" | "sqlite" | (string & {});

export interface BridgeInfo {
  engine: Engine;
  database: string;
  host: string;
  version: string;
  name: string;
  /** strokedb's version; absent before 0.2.0. */
  bridge?: string;
  /** What this bridge can do: "structure", "where", "edit", "rowCounts". */
  features?: string[];
  /** Opened through a share link (Labs relay), not on this machine. */
  shared?: boolean;
  /** Edits and writing SQL are off for this session (a shared link's default). */
  readonly?: boolean;
  /** How the engine quotes a name: `"`, `` ` `` or `[`. Absent before the app sent it. */
  quote?: string;
  /** The engine's name to show, e.g. "IBM Db2" for an ODBC connection. */
  label?: string;
}

export interface TableRef {
  schema: string;
  name: string;
  kind: "table" | "view";
  /** Estimated row count, when the bridge reports one. */
  rows?: number | null;
}

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  default?: string | null;
}

export interface Index {
  name: string;
  columns: string[];
  unique: boolean;
  primary: boolean;
}

export interface ForeignKey {
  name: string;
  columns: string[];
  refSchema: string;
  refTable: string;
  refColumns: string[];
}

export interface Structure {
  columns: Column[];
  indexes: Index[];
  foreignKeys: ForeignKey[];
}

export type Values = Record<string, unknown>;

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

/** This machine's bridge (`npx strokedb`), or a shared one through the relay. */
/** `open`: a table to show first, `schema.table` or a bare name (from an agent's link). */
export type LocalSession = { kind?: "local"; bridge: string; token: string; open?: string };
export type RelaySession = { kind: "relay"; relay: string; key: string; open?: string };
export type Session = LocalSession | RelaySession;

/** Room ids, as the relay accepts them. */
const ROOM_RE = /^[A-Za-z0-9_-]{22,64}$/;
const KEY_RE = /^[A-Za-z0-9_-]{43}$/;

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
  const relay = hash.get("relay");
  const key = hash.get("key");
  const fromHash: Session | null =
    relay && key && ROOM_RE.test(relay) && KEY_RE.test(key)
      ? { kind: "relay", relay, key }
      : bridge && token && isLoopbackBridge(bridge)
        ? { kind: "local", bridge: new URL(bridge).origin, token }
        : null;
  if (fromHash) {
    const s = fromHash;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      // private mode: the session lasts until the tab reloads
    }
    history.replaceState(null, "", window.location.pathname + window.location.search);
    // The table to show first is for this load only, not every reload.
    const open = hash.get("open")?.trim();
    // eslint-disable-next-line no-control-regex
    return open && open.length <= 200 && !/[\u0000-\u001f]/.test(open) ? { ...s, open } : s;
  }
  try {
    const raw = sessionStorage.getItem(KEY);
    const s = raw ? (JSON.parse(raw) as Session) : null;
    if (!s) return null;
    if (s.kind === "relay") return ROOM_RE.test(s.relay) && KEY_RE.test(s.key) ? s : null;
    return isLoopbackBridge(s.bridge) && typeof s.token === "string" ? s : null;
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

/** Calls through the relay: sealed with the link's key, opened on the sharing machine. */
function relayCaller(s: RelaySession) {
  const keyP = importKey(s.key);
  return async function call<T>(path: string, body: unknown = {}): Promise<T> {
    const key = await keyP;
    let res: Response;
    try {
      res = await fetch(`/api/relay/${s.relay}/call`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(await seal(key, { path, body })),
      });
    } catch {
      throw new BridgeError("Can't reach stroke.click.", true);
    }
    const data = (await res.json().catch(() => ({}))) as Partial<Sealed> & {
      error?: string;
      offline?: boolean;
    };
    if (!res.ok || !data.iv || !data.ct) {
      throw new BridgeError(
        data.error || `Relay error ${res.status}`,
        res.status === 503 || !!data.offline,
      );
    }
    let reply: { status: number; data?: unknown; error?: string };
    try {
      reply = await openSealed(key, data as Sealed);
    } catch {
      throw new BridgeError("This link's key doesn't match the shared studio.");
    }
    if (reply.status !== 200) throw new BridgeError(reply.error || `Error ${reply.status}`);
    return reply.data as T;
  };
}

export function bridgeClient(s: Session) {
  const call = s.kind === "relay" ? relayCaller(s) : localCaller(s);
  return clientFor(call);
}

function localCaller(s: LocalSession) {
  return async function call<T>(path: string, body: unknown = {}): Promise<T> {
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
  };
}

type Call = <T>(path: string, body?: unknown) => Promise<T>;

function clientFor(call: Call) {
  return {
    info: () => call<BridgeInfo>("/info"),
    tables: () => call<TableRef[]>("/tables"),
    columns: (schema: string, table: string) => call<Column[]>("/columns", { schema, table }),
    structure: (schema: string, table: string) => call<Structure>("/structure", { schema, table }),
    rows: (o: {
      schema: string;
      table: string;
      limit: number;
      offset: number;
      sort: Sort | null;
      where?: string;
    }) => call<Result & { total: number | null; estimated: boolean }>("/rows", o),
    update: (o: { schema: string; table: string; key: Values; set: Values }) =>
      call<{ rowCount: number }>("/update", o),
    insert: (o: { schema: string; table: string; values: Values }) =>
      call<{ rowCount: number }>("/insert", o),
    remove: (o: { schema: string; table: string; keys: Values[] }) =>
      call<{ rowCount: number }>("/delete", o),
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

/**
 * The table a reference names: `schema.table` exactly, else a table of that
 * name in any schema (an agent often says just "users").
 */
export function findTable(tables: TableRef[], ref: string): TableRef | undefined {
  const exact = tables.find((t) => `${t.schema}.${t.name}` === ref);
  if (exact) return exact;
  const lower = ref.toLowerCase();
  return (
    tables.find((t) => t.name === ref) ??
    tables.find(
      (t) => t.name.toLowerCase() === lower || `${t.schema}.${t.name}`.toLowerCase() === lower,
    )
  );
}
