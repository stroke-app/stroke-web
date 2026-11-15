import "@tanstack/react-start/server-only";
import { db } from "#/lib/db";
import { signIns } from "#/lib/db/schema";
import type { RequestGeo } from "#/lib/geo";

/**
 * Record a sign-in. Best effort: a failed insert is logged, never thrown, so
 * it can't stop anyone signing in.
 */
export async function recordSignIn(entry: {
  userId: string;
  source: "web" | "desktop";
  geo: RequestGeo;
  deviceId?: string | null;
  appVersion?: string | null;
  os?: string | null;
}) {
  try {
    await db.insert(signIns).values({
      id: crypto.randomUUID(),
      userId: entry.userId,
      source: entry.source,
      ...entry.geo,
      deviceId: entry.deviceId ?? null,
      appVersion: entry.appVersion ?? null,
      os: entry.os ?? null,
    });
  } catch (e) {
    console.error("recordSignIn failed", e);
  }
}
