/**
 * Giveaway weeks run Monday 00:00 UTC to the next Monday 00:00 UTC. A week is
 * named by its opening Monday as YYYY-MM-DD. Shared by the server (entries,
 * draws) and the client (countdown), so it has no server-only imports.
 */
const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;

/** Monday 00:00 UTC of the week containing `date`. */
export function weekStart(date: Date = new Date()): Date {
  const midnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const daysSinceMonday = (new Date(midnight).getUTCDay() + 6) % 7;
  return new Date(midnight - daysSinceMonday * DAY_MS);
}

const toKey = (date: Date) => date.toISOString().slice(0, 10);

/** The key of the week containing `date`, e.g. "2026-09-28". */
export function weekKey(date: Date = new Date()): string {
  return toKey(weekStart(date));
}

/** The key of the week before the one containing `date`: the week due for a draw. */
export function previousWeekKey(date: Date = new Date()): string {
  return toKey(new Date(weekStart(date).getTime() - WEEK_MS));
}

/** When a week closes and gets drawn: the following Monday 00:00 UTC. */
export function drawTime(week: string): Date {
  return new Date(Date.parse(`${week}T00:00:00Z`) + WEEK_MS);
}

export function isWeekKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && weekKey(new Date(`${value}T00:00:00Z`)) === value;
}
