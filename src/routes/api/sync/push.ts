import { createFileRoute } from "@tanstack/react-router";

import { SYNC_QUOTA_BYTES } from "#/lib/db/schema";
import { overLimit, tooManyRequests } from "#/lib/desktop/rate-limit";
import { apiError, authenticateDesktop, unauthorized } from "#/lib/desktop/service";
import { syncPush } from "#/lib/sync/service";

/**
 * A push can't store more than the account quota, so a bigger body can only
 * fail; refuse it before buffering it in Worker memory.
 */
const MAX_BODY_BYTES = SYNC_QUOTA_BYTES + 1024 * 1024;

/**
 * POST /api/sync/push
 *
 * Body { records: [{ id, kind, version, deleted, ciphertext | null }] }, at
 * most 200. Accepts each record whose version is the next one; returns the
 * server's copy of the rest as conflicts. Bearer token. See
 * docs/accounts-and-sync.md, Appendix B.
 */
export const Route = createFileRoute("/api/sync/push")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await authenticateDesktop(request);
        if (!auth) return unauthorized();
        // The app pushes 2 s after an edit (debounced), so this is well clear.
        const retry = await overLimit(`sync-push:user:${auth.user.id}`, 120, 60);
        if (retry !== null) return tooManyRequests(retry);

        const length = Number(request.headers.get("content-length") ?? 0);
        if (length > MAX_BODY_BYTES) {
          return apiError(413, "quota_exceeded", "This push is larger than the sync quota.");
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return apiError(400, "invalid_json", "The request body isn't valid JSON.");
        }
        if (!body || typeof body !== "object" || Array.isArray(body)) {
          return apiError(400, "invalid_request", "The body must be a JSON object.");
        }
        return syncPush(auth.user.id, body as Record<string, unknown>);
      },
    },
  },
});
