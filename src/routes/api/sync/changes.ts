import { createFileRoute } from "@tanstack/react-router";

import { overLimit, tooManyRequests } from "#/lib/desktop/rate-limit";
import { authenticateDesktop, unauthorized } from "#/lib/desktop/service";
import { syncChanges } from "#/lib/sync/service";

/**
 * GET /api/sync/changes?since=<seq>&limit=<1..500>
 *
 * Records changed after `since`, tombstones included, in seq order.
 * Bearer token. See docs/accounts-and-sync.md, Appendix B.
 */
export const Route = createFileRoute("/api/sync/changes")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await authenticateDesktop(request);
        if (!auth) return unauthorized();
        // Generous: a first pull pages through, and every device polls.
        const retry = await overLimit(`sync-changes:user:${auth.user.id}`, 300, 60);
        if (retry !== null) return tooManyRequests(retry);
        return syncChanges(auth.user.id, new URL(request.url));
      },
    },
  },
});
