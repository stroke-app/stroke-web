import * as z from "zod";

/**
 * Query of /desktop/sign-in (docs/accounts-and-sync.md, Appendix A). Shared by
 * the page and the server function that mints the code, so both validate the
 * same way. Everything ends up in a redirect URL, so nothing loose gets in.
 */

/** URL-unreserved characters only: safe in a query string without surprises. */
const UNRESERVED = /^[A-Za-z0-9._~-]+$/;

export const desktopSignInParams = z.object({
  port: z.coerce.number().int().min(1024).max(65535),
  state: z.string().min(1).max(128).regex(UNRESERVED),
  /** base64url (no padding) SHA-256 of the PKCE verifier: always 43 chars. */
  code_challenge: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  device_id: z
    .string()
    .min(8)
    .max(128)
    .regex(/^[A-Za-z0-9_-]+$/),
  device_name: z
    .string()
    .trim()
    .min(1)
    .max(80)
    // No control characters: the name is shown to the user and stored.
    .refine((v) => !/\p{Cc}/u.test(v)),
});

export type DesktopSignInParams = z.infer<typeof desktopSignInParams>;

/** The only place the page ever sends the browser: the app's loopback listener. */
export function desktopCallbackUrl(port: number, query: Record<string, string>): string {
  const url = new URL(`http://127.0.0.1:${port}/callback`);
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  return url.toString();
}
