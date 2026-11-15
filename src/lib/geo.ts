/**
 * Where a request came from, as Cloudflare sees it. On Workers every request
 * carries `request.cf` (country, city, region, timezone, coordinates, ASN) at
 * no cost; the `cf-ipcountry` / `cf-connecting-ip` headers cover the rest.
 * Locally (vite dev) all of it is absent and every field is null.
 */
export type RequestGeo = {
  ip: string | null;
  country: string | null;
  continent: string | null;
  region: string | null;
  regionCode: string | null;
  city: string | null;
  postalCode: string | null;
  timezone: string | null;
  latitude: number | null;
  longitude: number | null;
  asn: number | null;
  asOrganization: string | null;
  colo: string | null;
  userAgent: string | null;
};

type Cf = Record<string, unknown> | undefined;

const str = (v: unknown, max = 200) =>
  typeof v === "string" && v.length > 0 ? v.slice(0, max) : null;
const num = (v: unknown) => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
};

export function requestGeo(request: Request | null | undefined): RequestGeo {
  const h = request?.headers;
  const cf = (request as unknown as { cf?: Cf } | undefined)?.cf;
  const header = (name: string) => str(h?.get(name));
  return {
    ip:
      header("cf-connecting-ip") ??
      str(h?.get("x-forwarded-for")?.split(",")[0]?.trim()) ??
      header("x-real-ip"),
    country: str(cf?.country, 8) ?? str(h?.get("cf-ipcountry"), 8),
    continent: str(cf?.continent, 8) ?? header("cf-ipcontinent"),
    region: str(cf?.region) ?? header("cf-region"),
    regionCode: str(cf?.regionCode, 16) ?? header("cf-region-code"),
    city: str(cf?.city) ?? header("cf-ipcity"),
    postalCode: str(cf?.postalCode, 32) ?? header("cf-postal-code"),
    timezone: str(cf?.timezone, 64) ?? header("cf-timezone"),
    latitude: num(cf?.latitude) ?? num(h?.get("cf-iplatitude")),
    longitude: num(cf?.longitude) ?? num(h?.get("cf-iplongitude")),
    asn: num(cf?.asn),
    asOrganization: str(cf?.asOrganization),
    colo: str(cf?.colo, 8),
    userAgent: str(h?.get("user-agent"), 512),
  };
}
