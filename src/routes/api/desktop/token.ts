import { createFileRoute } from "@tanstack/react-router";

import { ipFrom } from "#/lib/ai/free-tier";
import { overLimit, tooManyRequests } from "#/lib/desktop/rate-limit";
import { apiError, exchangeDesktopCode } from "#/lib/desktop/service";

const str = (v: unknown, max: number) =>
  typeof v === "string" && v.length > 0 && v.length <= max ? v : null;

/**
 * POST /api/desktop/token
 *
 * Trades the one-time code from /desktop/sign-in (plus the PKCE verifier) for
 * a desktop session token. Body: { code, code_verifier, device_id,
 * device_name, os, version }. See docs/accounts-and-sync.md, Appendix A.
 */
export const Route = createFileRoute("/api/desktop/token")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Codes are 256-bit, so guessing is hopeless; this only bounds abuse.
        const retry = await overLimit(`desktop-token:ip:${ipFrom(request)}`, 30, 600);
        if (retry !== null) return tooManyRequests(retry);

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return apiError(400, "invalid_json", "The request body isn't valid JSON.");
        }

        const code = str(body.code, 128);
        const codeVerifier = str(body.code_verifier, 128);
        const deviceId = str(body.device_id, 128);
        if (!code || !codeVerifier || !deviceId) {
          return apiError(
            400,
            "invalid_request",
            "code, code_verifier and device_id are required.",
          );
        }

        const deviceName =
          typeof body.device_name === "string"
            ? body.device_name
                .replace(/\p{Cc}/gu, "")
                .trim()
                .slice(0, 80) || null
            : null;

        return exchangeDesktopCode({
          code,
          codeVerifier,
          deviceId,
          deviceName,
          os: body.os,
          version: body.version,
        });
      },
    },
  },
});
