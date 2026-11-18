import { SUPPORT_EMAIL } from "#/components/legal";

export const SPONSOR_URL = "https://github.com/sponsors/broisnees";
export const SPONSOR_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Sponsoring Stroke")}`;

export type SponsorTierId = "platinum" | "gold" | "silver" | "backers";

export interface Sponsor {
  name: string;
  url: string;
  /** Site path of the logo under `public/`, e.g. "/sponsors/acme.svg". Backers show their name instead. */
  logo?: string;
  tier: SponsorTierId;
}

export interface SponsorTier {
  id: SponsorTierId;
  label: string;
  /** What a sponsor at this tier gets on the page. */
  note: string;
}

export const SPONSOR_TIERS: SponsorTier[] = [
  { id: "platinum", label: "Platinum", note: "The largest logo, first on this page" },
  { id: "gold", label: "Gold", note: "A large logo on this page" },
  { id: "silver", label: "Silver", note: "A logo on this page" },
  { id: "backers", label: "Backers", note: "Your name and a link on this page" },
];

/**
 * Everyone sponsoring Stroke. Adding one is a single line, e.g.
 * `{ name: "Acme", url: "https://acme.com", logo: "/sponsors/acme.svg", tier: "gold" },`
 */
export const SPONSORS: Sponsor[] = [];

export function sponsorsIn(tier: SponsorTierId) {
  return SPONSORS.filter((s) => s.tier === tier);
}

/**
 * What sponsorships pay for: the certificates that stop macOS and Windows from
 * warning about Stroke on install. Yearly, in USD.
 */
export const SIGNING_GOALS = [
  {
    id: "apple",
    title: "Apple Developer Program",
    usd: 99,
    body: "Signs and notarizes the Mac app, so Gatekeeper opens it without the “unidentified developer” warning.",
  },
  {
    id: "windows",
    title: "Windows code signing",
    usd: 120,
    body: "Azure Trusted Signing at $9.99 a month, so SmartScreen stops calling the installer unrecognized.",
  },
] as const;

export const SIGNING_GOAL_USD = SIGNING_GOALS.reduce((sum, g) => sum + g.usd, 0);
