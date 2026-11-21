/**
 * The share-link format, shared with the app (stroke: src/lib/share-crypto.js;
 * keep the two in step). Browser-only: WebCrypto and CompressionStream.
 *
 *   blob   = 0x01 · iv (12 bytes) · AES-256-GCM(gzip(JSON payload))
 *   link   = https://stroke.click/s/<id>#<key, 32 bytes base64url>
 *   key    = the link key, or with a password
 *            SHA-256(link key · PBKDF2-SHA256(password, salt, 310,000, 32 bytes))
 *
 * The fragment never leaves the browser, so the server stores bytes it cannot
 * read; a password means even the full link is not enough on its own.
 */

export const SHARE_FORMAT = 1;
export const PBKDF2_ITERATIONS = 310_000;

export type SharePayload =
  | {
      v: 1;
      kind: "table" | "result";
      title: string;
      createdAt: number;
      source?: string;
      by?: string;
      columns: { name: string; type?: string }[];
      rows: unknown[][];
      totalRows?: number;
      masked?: string[];
      sql?: string;
    }
  | {
      v: 1;
      kind: "query";
      title: string;
      createdAt: number;
      source?: string;
      by?: string;
      sql: string;
      dialect?: string;
    }
  | {
      v: 1;
      kind: "erd";
      title: string;
      createdAt: number;
      source?: string;
      by?: string;
      tables: ErdTable[];
      links: ErdLink[];
    }
  | {
      v: 1;
      kind: "mermaid";
      title: string;
      createdAt: number;
      source?: string;
      by?: string;
      code: string;
    }
  | {
      v: 1;
      kind: "chart";
      title: string;
      createdAt: number;
      source?: string;
      by?: string;
      chart: { type: string; x: string; y: string[]; group?: string | null };
      columns: { name: string; type?: string }[];
      rows: unknown[][];
      totalRows?: number;
      masked?: string[];
    }
  | {
      v: 1;
      kind: "json";
      title: string;
      createdAt: number;
      source?: string;
      by?: string;
      value: unknown;
      /** Items before the plan's cap, when the value is an array. */
      totalItems?: number;
      masked?: string[];
    };

export type ErdTable = {
  name: string;
  x: number;
  y: number;
  columns: { name: string; type: string; pk?: boolean; fk?: string | null }[];
};
export type ErdLink = { from: string; fromCol: string; to: string; toCol: string; one?: boolean };

export function b64urlDecode(s: string): Uint8Array<ArrayBuffer> {
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}

function b64Decode(s: string): Uint8Array<ArrayBuffer> {
  return b64urlDecode(s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""));
}

async function gunzip(data: ArrayBuffer): Promise<string> {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("gzip"));
  return await new Response(stream).text();
}

/** The AES key for a link key and, when the share has one, its password. */
export async function deriveKey(
  linkKey: Uint8Array<ArrayBuffer>,
  password: string | null,
  saltB64: string | null,
): Promise<CryptoKey> {
  let raw: Uint8Array<ArrayBuffer> = linkKey;
  if (password !== null && saltB64) {
    const base = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    const bits = new Uint8Array(
      await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          hash: "SHA-256",
          salt: b64Decode(saltB64),
          iterations: PBKDF2_ITERATIONS,
        },
        base,
        256,
      ),
    );
    const both = new Uint8Array(linkKey.length + bits.length);
    both.set(linkKey);
    both.set(bits, linkKey.length);
    raw = new Uint8Array(await crypto.subtle.digest("SHA-256", both));
  }
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
}

/** Decrypt and parse a share. Throws on a wrong key or password. */
export async function openShare(blob: ArrayBuffer, key: CryptoKey): Promise<SharePayload> {
  const bytes = new Uint8Array(blob);
  if (bytes[0] !== SHARE_FORMAT)
    throw new Error("This link was made by a newer Stroke. Update the page and try again.");
  const iv = bytes.slice(1, 13);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, bytes.slice(13));
  return JSON.parse(await gunzip(plain)) as SharePayload;
}
