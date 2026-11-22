import { DurableObject } from "cloudflare:workers";

/**
 * The meeting point for a shared studio (Labs). The machine sharing a
 * database (`npx strokedb --share`, or the desktop app's Share) holds one
 * WebSocket open to its room here; a studio page on any device POSTs calls to
 * the room and gets the answer back over the same socket.
 *
 * Everything that passes through is AES-GCM ciphertext. The key lives only in
 * the share link's `#fragment`, which browsers never send to a server, so this
 * object sees the room id, sizes and timing, and nothing else.
 *
 * One object per room (`idFromName(room)`). The first host to connect claims
 * the room with a secret only it knows; anyone holding the link can call, but
 * not take over as the host.
 */

/** A call's ciphertext. */
interface Sealed {
  iv: string;
  ct: string;
}

/** The longest a call waits for the sharing machine (a big query can be slow). */
const CALL_TIMEOUT_MS = 60_000;
/** Calls in flight per room: a stuck page can't pile up work on the host. */
const MAX_PENDING = 32;
/** A call body (the bridge itself takes 1MB). */
const MAX_CALL_BYTES = 1.5 * 1024 * 1024;
/** People in one room's presence channel at once. */
const MAX_PEERS = 32;
/**
 * One presence message: a cursor or a draft value is small, but the shared
 * console sends its whole document to someone joining, so there is room for a
 * long query, sealed and base64 (about 1.4x the text).
 */
const MAX_PRESENCE_BYTES = 256 * 1024;
/** A claimed room stays claimed this long after the host leaves, so a viewer can't take it over. */
const ROOM_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const SEALED = (v: unknown): v is Sealed =>
  !!v &&
  typeof (v as Sealed).iv === "string" &&
  typeof (v as Sealed).ct === "string" &&
  (v as Sealed).iv.length <= 64 &&
  (v as Sealed).ct.length <= MAX_CALL_BYTES * 2;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

export class StudioRelay extends DurableObject {
  private host: WebSocket | null = null;
  private seq = 0;
  private pending = new Map<number, (reply: Sealed | { error: string }) => void>();
  /** Presence sockets by their number in this room (live cursors and edits). */
  private peers = new Map<number, WebSocket>();
  private peerSeq = 0;

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const action = url.pathname.split("/").pop();
    if (action === "host") return this.acceptHost(request, url);
    if (action === "call" && request.method === "POST") return this.call(request);
    if (action === "presence") return this.acceptPeer(request);
    if (action === "status") return json(200, { online: !!this.host, here: this.peers.size });
    return json(404, { error: "Not found" });
  }

  private async acceptHost(request: Request, url: URL): Promise<Response> {
    if (request.headers.get("upgrade")?.toLowerCase() !== "websocket") {
      return json(426, { error: "Expected a WebSocket" });
    }
    const secret = url.searchParams.get("secret") ?? "";
    if (secret.length < 32) return json(400, { error: "Missing secret" });
    const claimed = await this.ctx.storage.get<string>("secret");
    if (claimed && claimed !== secret)
      return json(403, { error: "This room belongs to another host" });
    if (!claimed) await this.ctx.storage.put("secret", secret);
    await this.ctx.storage.setAlarm(Date.now() + ROOM_TTL_MS);

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
    server.accept();
    // A reconnect replaces the old socket; calls waiting on it fail fast.
    if (this.host) {
      try {
        this.host.close(4000, "Replaced by a new connection");
      } catch {
        // already closed
      }
      this.failAll("The shared studio reconnected. Try again.");
    }
    this.host = server;
    server.addEventListener("message", (event) => {
      if (typeof event.data !== "string") return;
      let msg: { id?: unknown; iv?: unknown; ct?: unknown; error?: unknown; ping?: unknown };
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }
      if (msg.ping) {
        server.send(JSON.stringify({ pong: true }));
        return;
      }
      const resolve = typeof msg.id === "number" ? this.pending.get(msg.id) : undefined;
      if (!resolve) return;
      this.pending.delete(msg.id as number);
      resolve(
        SEALED(msg)
          ? { iv: msg.iv as string, ct: msg.ct as string }
          : { error: String(msg.error ?? "Bad reply") },
      );
    });
    const gone = () => {
      if (this.host !== server) return;
      this.host = null;
      this.failAll("The shared studio stopped.");
    };
    server.addEventListener("close", gone);
    server.addEventListener("error", gone);
    return new Response(null, { status: 101, webSocket: client });
  }

  /**
   * Live presence: everyone in the room (the sharing app and each studio page)
   * holds one socket, and every message is passed to all the others as it
   * came, with the sender's number. The messages are sealed with the link's
   * key, so this object relays cursors and edits it cannot read. It says only
   * when someone leaves, so the others can drop their cursor.
   */
  private acceptPeer(request: Request): Response {
    if (request.headers.get("upgrade")?.toLowerCase() !== "websocket") {
      return json(426, { error: "Expected a WebSocket" });
    }
    if (this.peers.size >= MAX_PEERS) return json(429, { error: "This shared studio is full." });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
    server.accept();
    const id = ++this.peerSeq;
    this.peers.set(id, server);
    server.addEventListener("message", (event) => {
      if (typeof event.data !== "string" || event.data.length > MAX_PRESENCE_BYTES) return;
      let msg: { iv?: unknown; ct?: unknown; ping?: unknown };
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }
      if (msg.ping) {
        server.send('{"pong":1}');
        return;
      }
      if (typeof msg.iv !== "string" || typeof msg.ct !== "string") return;
      this.broadcast(id, JSON.stringify({ from: id, iv: msg.iv, ct: msg.ct }));
    });
    const gone = () => {
      if (!this.peers.delete(id)) return;
      this.broadcast(id, JSON.stringify({ gone: id }));
    };
    server.addEventListener("close", gone);
    server.addEventListener("error", gone);
    // Its own number, so it can ignore nothing and others can address it.
    server.send(JSON.stringify({ you: id }));
    return new Response(null, { status: 101, webSocket: client });
  }

  private broadcast(from: number, text: string) {
    for (const [id, sock] of this.peers) {
      if (id === from) continue;
      try {
        sock.send(text);
      } catch {
        this.peers.delete(id);
      }
    }
  }

  private async call(request: Request): Promise<Response> {
    const host = this.host;
    if (!host) return json(503, { error: "The shared studio isn't running.", offline: true });
    if (this.pending.size >= MAX_PENDING) return json(429, { error: "Too many calls at once." });
    const size = Number(request.headers.get("content-length") ?? 0);
    if (size > MAX_CALL_BYTES) return json(413, { error: "Request too large" });
    let sealed: unknown;
    try {
      sealed = await request.json();
    } catch {
      return json(400, { error: "Body is not JSON" });
    }
    if (!SEALED(sealed)) return json(400, { error: "Expected an encrypted call" });

    const id = ++this.seq;
    const reply = await new Promise<Sealed | { error: string }>((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        resolve({ error: "The shared studio didn't answer in time." });
      }, CALL_TIMEOUT_MS);
      this.pending.set(id, (r) => {
        clearTimeout(timer);
        resolve(r);
      });
      try {
        host.send(JSON.stringify({ id, iv: sealed.iv, ct: sealed.ct }));
      } catch {
        this.pending.delete(id);
        clearTimeout(timer);
        resolve({ error: "The shared studio stopped." });
      }
    });
    return "error" in reply ? json(502, reply) : json(200, reply);
  }

  private failAll(error: string) {
    for (const resolve of this.pending.values()) resolve({ error });
    this.pending.clear();
  }

  /** The room expires: forget its owner. */
  async alarm(): Promise<void> {
    if (this.host) {
      await this.ctx.storage.setAlarm(Date.now() + ROOM_TTL_MS);
      return;
    }
    await this.ctx.storage.deleteAll();
  }
}

/** Room ids: random, URL-safe, long enough not to guess. */
export const ROOM_RE = /^[A-Za-z0-9_-]{22,64}$/;
