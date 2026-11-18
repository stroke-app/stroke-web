import { xchacha20poly1305 } from "@noble/ciphers/chacha";
import { argon2id } from "hash-wasm";

/**
 * Opens an end-to-end encrypted Stroke backup in the browser. The format is
 * written by the desktop app (src-tauri/src/backup_crypto.rs); keep in step.
 *
 * File: "STRKBAK1" | key_id (8) | wrapped data key (72) | nonce prefix (19),
 * then 64 KiB chunks sealed with XChaCha20-Poly1305 under the data key,
 * nonce = prefix | counter (u32 BE) | last flag, aad = the 107-byte header.
 * The data key is wrapped with the account's sync key, which is wrapped with
 * Argon2id(sync passphrase). Nothing here leaves the browser.
 */

const MAGIC = new TextEncoder().encode("STRKBAK1");
const CHUNK = 64 * 1024;
const TAG = 16;
const WRAPPED_LEN = 24 + 32 + TAG;
export const HEADER_LEN = 8 + 8 + WRAPPED_LEN + 19;
const DEK_AAD = new TextEncoder().encode("stroke-backup-dek-v1");
const SYNC_AAD = new TextEncoder().encode("stroke-sync-key-v1");

export type Kdf = { alg: string; salt: string; m: number; t: number; p: number };

export function unb64(s: string): Uint8Array {
  const b = s.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  const bin = atob(b + "===".slice((b.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export function isEncrypted(bytes: Uint8Array) {
  return bytes.length >= 8 && MAGIC.every((v, i) => bytes[i] === v);
}

/** The sync key, from the passphrase and the wrapped key the server keeps. */
export async function unlockSyncKey(passphrase: string, wrappedKey: string, kdf: Kdf) {
  if (kdf.alg !== "argon2id") throw new Error(`Unsupported key derivation: ${kdf.alg}`);
  const kek = await argon2id({
    password: passphrase,
    salt: unb64(kdf.salt),
    parallelism: kdf.p,
    iterations: kdf.t,
    memorySize: kdf.m,
    hashLength: 32,
    outputType: "binary",
  });
  const wrapped = unb64(wrappedKey);
  try {
    return xchacha20poly1305(kek, wrapped.subarray(0, 24), SYNC_AAD).decrypt(wrapped.subarray(24));
  } catch {
    throw new Error("That isn't your sync passphrase.");
  }
}

function chunkNonce(prefix: Uint8Array, counter: number, last: boolean) {
  const n = new Uint8Array(24);
  n.set(prefix, 0);
  new DataView(n.buffer).setUint32(19, counter, false);
  n[23] = last ? 1 : 0;
  return n;
}

/**
 * Decrypt a whole backup. `wrappedOverride` is the server's copy of the wrapped
 * data key, which is re-wrapped after a sync reset; the file's own copy is the
 * fallback.
 */
export function decryptBackup(syncKey: Uint8Array, file: Uint8Array, wrappedOverride?: Uint8Array) {
  if (file.length < HEADER_LEN || !isEncrypted(file))
    throw new Error("This isn't an encrypted Stroke backup.");
  const header = file.subarray(0, HEADER_LEN);
  const wrapped = wrappedOverride ?? header.subarray(16, 16 + WRAPPED_LEN);
  let dek: Uint8Array;
  try {
    dek = xchacha20poly1305(syncKey, wrapped.subarray(0, 24), DEK_AAD).decrypt(
      wrapped.subarray(24),
    );
  } catch {
    throw new Error("This backup was made under another sync key, before a sync reset.");
  }
  const prefix = header.subarray(16 + WRAPPED_LEN);
  const size = CHUNK + TAG;
  const parts: Uint8Array[] = [];
  let at = HEADER_LEN;
  let counter = 0;
  do {
    const len = Math.min(size, file.length - at);
    const last = at + len === file.length;
    try {
      parts.push(
        xchacha20poly1305(dek, chunkNonce(prefix, counter, last), header).decrypt(
          file.subarray(at, at + len),
        ),
      );
    } catch {
      throw new Error("The backup is damaged or incomplete.");
    }
    at += len;
    counter++;
  } while (at < file.length);
  return parts;
}
