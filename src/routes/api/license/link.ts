import { createFileRoute } from "@tanstack/react-router";

import { overLimit, tooManyRequests } from "#/lib/desktop/rate-limit";
import {
  apiError,
  authenticateDesktop,
  linkLicenseKey,
  meResponse,
  unauthorized,
} from "#/lib/desktop/service";

/**
 * POST /api/license/link
 *
 * Links the license key the app holds to the signed-in account. Body: { key }.
 * Answers like /api/me on success, 409 `key_owned_elsewhere` when the key is
 * another account's. See docs/accounts-and-sync.md, Appendix A.
 */
export const Route = createFileRoute("/api/license/link")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await authenticateDesktop(request);
        if (!auth) return unauthorized();

        const retry = await overLimit(`license-link:user:${auth.user.id}`, 10, 3600);
        if (retry !== null) return tooManyRequests(retry);

        let body: { key?: unknown };
        try {
          body = (await request.json()) as { key?: unknown };
        } catch {
          return apiError(400, "invalid_json", "The request body isn't valid JSON.");
        }
        if (typeof body.key !== "string" || !body.key || body.key.length > 1024) {
          return apiError(400, "invalid_request", "key is required.");
        }

        const failed = await linkLicenseKey(auth.user, body.key.trim());
        if (failed) return failed;
        return meResponse(auth.user, auth.token);
      },
    },
  },
});
