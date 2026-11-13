import "@tanstack/react-start/server-only";
import { lt, sql } from "drizzle-orm";

import { db } from "#/lib/db";
import { rateLimits } from "#/lib/db/schema";

/**
 * Count one request against `key` in a fixed window and say whether it is
 * over `limit`. The increment is an upsert, so concurrent requests can't lose
 * a count. Returns the seconds to wait when over the limit, else null.
 */
export async function overLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<number | null> {
  const nowSec = Math.floor(Date.now() / 1000);
  const window = nowSec - (nowSec % windowSeconds);

  const [row] = await db
    .insert(rateLimits)
    .values({ key, window, count: 1 })
    .onConflictDoUpdate({
      target: [rateLimits.key, rateLimits.window],
      set: { count: sql`${rateLimits.count} + 1` },
    })
    .returning({ count: rateLimits.count });

  // Old windows are dead weight; sweep them now and then.
  if (Math.random() < 0.01) {
    await db.delete(rateLimits).where(lt(rateLimits.window, nowSec - 86_400));
  }

  return (row?.count ?? 0) > limit ? window + windowSeconds - nowSec : null;
}

/** `429` in the desktop API's error shape. */
export function tooManyRequests(retryAfter: number): Response {
  return Response.json(
    { error: "rate_limited", message: "Too many requests. Try again in a moment." },
    { status: 429, headers: { "retry-after": String(Math.max(1, retryAfter)) } },
  );
}
