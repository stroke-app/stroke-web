/**
 * End-to-end encryption for the shared studio relay (Labs). The same scheme
 * is in strokedb (stroke/cli/src/relay.js) and the desktop app
 * (stroke/src/lib/studio-share.js): AES-256-GCM, a fresh 12-byte IV per
 * message, the key straight from the link's `#fragment`.
 */

const enc = new TextEncoder();
const dec = new TextDecoder();

export function toB64u(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromB64u(text: string): Uint8Array {
  const b = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}

export async function importKey(keyB64u: string): Promise<CryptoKey> {
  const raw = fromB64u(keyB64u);
  if (raw.length !== 32) throw new Error("Bad key");
  return crypto.subtle.importKey("raw", raw as BufferSource, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

export interface Sealed {
  iv: string;
  ct: string;
}

export async function seal(key: CryptoKey, value: unknown): Promise<Sealed> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(value))),
  );
  return { iv: toB64u(iv), ct: toB64u(ct) };
}

export async function openSealed<T>(key: CryptoKey, sealed: Sealed): Promise<T> {
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromB64u(sealed.iv) as BufferSource },
    key,
    fromB64u(sealed.ct) as BufferSource,
  );
  return JSON.parse(dec.decode(pt)) as T;
}
