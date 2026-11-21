// Plan constants shared between server and client. Keep this module free of
// server-only imports (db, node:crypto, …) so it's safe in client bundles.

/** Slug of the Team product registered with the Dodo checkout plugin. */
export const STROKE_TEAM_SLUG = "stroke-team";
/** Plan identifier stored on team licenses and enterprise_domains rows. */
export const TEAM_PLAN = "team";
/** Price shown in the UI, in whole USD. Keep in sync with the Dodo product. */
export const TEAM_PRICE_USD = 99;

/** Slug of the Stroke Cloud storage add-on (a monthly subscription). */
export const STROKE_STORAGE_SLUG = "stroke-storage";
/** Plan identifier stored on the add-on's subscriptions row. */
export const STORAGE_PLAN = "storage";
/** Add-on price, in whole USD per month. Keep in sync with the Dodo product. */
export const STORAGE_PRICE_USD = 5;
/** Stroke Cloud backup storage included with Pro, and with the add-on, in GB. */
export const STORAGE_INCLUDED_GB = 1;
export const STORAGE_ADDON_GB = 10;
