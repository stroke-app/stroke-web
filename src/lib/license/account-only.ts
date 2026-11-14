/**
 * From this date a purchase is tied to the account only: the license row still
 * exists (it is the entitlement the desktop app reads after sign-in), but its
 * key is never shown or emailed. Keys issued before it keep working and stay
 * visible to their owners.
 */
export const ACCOUNT_ONLY_SINCE = new Date("2026-11-15T00:00:00Z");

/** True when this license is account-only (no key shown or sent). */
export function isAccountOnly(issuedAt: Date | string | number | null | undefined): boolean {
  if (issuedAt == null) return true;
  return new Date(issuedAt).getTime() >= ACCOUNT_ONLY_SINCE.getTime();
}
