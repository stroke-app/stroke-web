import "@tanstack/react-start/server-only";
import { and, count, desc, eq, isNotNull } from "drizzle-orm";

import { getCoveringDomain } from "#/lib/billing/enterprise";
import { userHasActiveLicense } from "#/lib/billing/service";
import { db } from "#/lib/db";
import { giveawayDraws, giveawayEntries, user } from "#/lib/db/schema";
import { getOrIssueLicense } from "#/lib/license";
import { sendGiveawayWinnerEmail } from "#/lib/mail";

import { drawTime, previousWeekKey, weekKey } from "./week";

export type GiveawayStatus = "eligible" | "owns-license" | "unverified";

interface Person {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

/**
 * Who may enter, and who may win. Owners have nothing to win, so anyone with
 * a license (bought, won, or covered by a Team domain) is out. A verified
 * email keeps throwaway sign-ups from stuffing the draw.
 */
async function statusOf(person: Person): Promise<GiveawayStatus> {
  if (!person.emailVerified) return "unverified";
  if (await userHasActiveLicense(person.id)) return "owns-license";
  if (await getCoveringDomain(person.email)) return "owns-license";
  return "eligible";
}

/** "Ada Lovelace" becomes "Ada L.": enough to be real, not enough to find them. */
export function publicName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A Stroke user";
  const last = parts.length > 1 ? ` ${parts.at(-1)!.charAt(0).toUpperCase()}.` : "";
  return `${parts[0]}${last}`;
}

export interface GiveawayState {
  week: string;
  drawAt: string;
  entries: number;
  signedIn: boolean;
  entered: boolean;
  status: GiveawayStatus | null;
  lastWinner: { week: string; name: string } | null;
}

export async function getGiveawayState(viewer: Person | null, now = new Date()) {
  const week = weekKey(now);

  const [{ entries }] = await db
    .select({ entries: count() })
    .from(giveawayEntries)
    .where(eq(giveawayEntries.week, week));

  const [last] = await db
    .select({ week: giveawayDraws.week, name: user.name })
    .from(giveawayDraws)
    .innerJoin(user, eq(user.id, giveawayDraws.winnerUserId))
    .where(isNotNull(giveawayDraws.winnerUserId))
    .orderBy(desc(giveawayDraws.week))
    .limit(1);

  let entered = false;
  let status: GiveawayStatus | null = null;
  if (viewer) {
    status = await statusOf(viewer);
    const mine = await db
      .select({ id: giveawayEntries.id })
      .from(giveawayEntries)
      .where(and(eq(giveawayEntries.week, week), eq(giveawayEntries.userId, viewer.id)))
      .limit(1);
    entered = mine.length > 0;
  }

  return {
    week,
    drawAt: drawTime(week).toISOString(),
    entries,
    signedIn: viewer !== null,
    entered,
    status,
    lastWinner: last ? { week: last.week, name: publicName(last.name) } : null,
  } satisfies GiveawayState;
}

/** Enter the viewer into this week's draw. Entering twice is a harmless no-op. */
export async function enterGiveaway(viewer: Person) {
  const status = await statusOf(viewer);
  if (status !== "eligible") return { entered: false, status };

  await db
    .insert(giveawayEntries)
    .values({ id: crypto.randomUUID(), week: weekKey(), userId: viewer.id })
    .onConflictDoNothing();
  return { entered: true, status };
}

/**
 * A uniform random index in [0, n). Rejection sampling drops the top slice of
 * the 32-bit range that would otherwise favor low indexes (modulo bias).
 */
function randomIndex(n: number): number {
  const limit = Math.floor(0x1_0000_0000 / n) * n;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return buf[0] % n;
}

type DrawResult =
  | { week: string; outcome: "drawn"; winnerUserId: string; eligible: number; notified: boolean }
  | { week: string; outcome: "no-eligible-entries"; entries: number }
  | { week: string; outcome: "already-drawn"; winnerUserId: string | null };

/** Issue the prize and send the email for a draw that has a winner but no license yet. */
async function award(week: string, winner: Person) {
  const license = await getOrIssueLicense(winner.id, winner.email, { plan: "pro" });
  const notified = await sendGiveawayWinnerEmail({
    to: winner.email,
    name: winner.name,
    licenseKey: license.licenseKey,
  });
  await db
    .update(giveawayDraws)
    .set({ licenseId: license.id, notifiedAt: notified ? new Date() : null })
    .where(eq(giveawayDraws.week, week));
  return notified;
}

/**
 * Draw a week's winner. Safe to run any number of times: the week's row in
 * giveaway_draws is claimed first, so a second run (a retried cron, a manual
 * admin call) returns the existing result. A draw whose winner never got a
 * license (say the email provider was down mid-award) is finished instead.
 */
export async function drawWeek(week: string): Promise<DrawResult> {
  const [existing] = await db
    .select()
    .from(giveawayDraws)
    .where(eq(giveawayDraws.week, week))
    .limit(1);

  if (existing) {
    if (existing.winnerUserId && !existing.licenseId) {
      const [winner] = await db.select().from(user).where(eq(user.id, existing.winnerUserId));
      if (winner) await award(week, winner);
    }
    return { week, outcome: "already-drawn", winnerUserId: existing.winnerUserId };
  }

  const entrants = await db
    .select({ id: user.id, email: user.email, name: user.name, emailVerified: user.emailVerified })
    .from(giveawayEntries)
    .innerJoin(user, eq(user.id, giveawayEntries.userId))
    .where(eq(giveawayEntries.week, week));

  // Re-check at draw time: someone may have bought Stroke during the week.
  const eligible: Person[] = [];
  for (const person of entrants) {
    if ((await statusOf(person)) === "eligible") eligible.push(person);
  }
  const winner = eligible.length > 0 ? eligible[randomIndex(eligible.length)] : null;

  const claimed = await db
    .insert(giveawayDraws)
    .values({
      week,
      winnerUserId: winner?.id ?? null,
      entryCount: entrants.length,
      eligibleCount: eligible.length,
      drawnAt: new Date(),
    })
    .onConflictDoNothing()
    .returning({ week: giveawayDraws.week });

  if (claimed.length === 0) return drawWeek(week);
  if (!winner) return { week, outcome: "no-eligible-entries", entries: entrants.length };

  const notified = await award(week, winner);
  return { week, outcome: "drawn", winnerUserId: winner.id, eligible: eligible.length, notified };
}

/** What the weekly cron runs: draw the week that just closed. */
export function runDueDraw(now = new Date()) {
  return drawWeek(previousWeekKey(now));
}
