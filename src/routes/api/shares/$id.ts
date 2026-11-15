import { createFileRoute } from "@tanstack/react-router";

import { shareOwner, signInRequired } from "#/lib/shares/owner";
import { revokeShare, shareMeta } from "#/lib/shares/service";

/**
 * GET    /api/shares/:id  public metadata (kind, expiry, password salt). No view counted.
 * DELETE /api/shares/:id  revoke (owner only); the stored content is deleted.
 */
export const Route = createFileRoute("/api/shares/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => shareMeta(params.id),
      DELETE: async ({ request, params }) => {
        const owner = await shareOwner(request);
        if (!owner) return signInRequired();
        return revokeShare(owner, params.id);
      },
    },
  },
});
