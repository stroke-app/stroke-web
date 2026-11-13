import { createFileRoute } from "@tanstack/react-router";

import { authenticateDesktop, revokeDesktopToken, unauthorized } from "#/lib/desktop/service";

/**
 * POST /api/desktop/sign-out
 *
 * Revokes the presented desktop token. See docs/accounts-and-sync.md, Appendix A.
 */
export const Route = createFileRoute("/api/desktop/sign-out")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await authenticateDesktop(request);
        if (!auth) return unauthorized();
        await revokeDesktopToken(auth.token.id);
        return new Response(null, { status: 204 });
      },
    },
  },
});
