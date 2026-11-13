import { createFileRoute } from "@tanstack/react-router";

import { overLimit, tooManyRequests } from "#/lib/desktop/rate-limit";
import { apiError, authenticateDesktop, unauthorized } from "#/lib/desktop/service";
import { getSyncKey, putSyncKey } from "#/lib/sync/service";

/**
 * GET /api/sync/key: the account's wrapped sync key, or 404 no_sync_key.
 * PUT /api/sync/key: store the first key, or replace it (reset sync).
 * Bearer token. See docs/accounts-and-sync.md, Appendix B.
 */
export const Route = createFileRoute("/api/sync/key")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await authenticateDesktop(request);
        if (!auth) return unauthorized();
        const retry = await overLimit(`sync-key-get:user:${auth.user.id}`, 60, 60);
        if (retry !== null) return tooManyRequests(retry);
        return getSyncKey(auth.user.id);
      },
      PUT: async ({ request }) => {
        const auth = await authenticateDesktop(request);
        if (!auth) return unauthorized();
        const retry = await overLimit(`sync-key-put:user:${auth.user.id}`, 10, 600);
        if (retry !== null) return tooManyRequests(retry);

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return apiError(400, "invalid_json", "The request body isn't valid JSON.");
        }
        if (!body || typeof body !== "object" || Array.isArray(body)) {
          return apiError(400, "invalid_request", "The body must be a JSON object.");
        }
        return putSyncKey(auth.user.id, body as Record<string, unknown>);
      },
    },
  },
});
