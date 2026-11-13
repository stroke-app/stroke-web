import { createFileRoute } from "@tanstack/react-router";

import { authenticateDesktop, meResponse, unauthorized } from "#/lib/desktop/service";

/**
 * GET /api/me
 *
 * The signed-in desktop app's account: user, signed entitlement, and devices.
 * Bearer token from /api/desktop/token. See docs/accounts-and-sync.md, Appendix A.
 */
export const Route = createFileRoute("/api/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await authenticateDesktop(request);
        if (!auth) return unauthorized();
        return meResponse(auth.user, auth.token);
      },
    },
  },
});
