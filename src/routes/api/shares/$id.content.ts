import { createFileRoute } from "@tanstack/react-router";

import { ipFrom } from "#/lib/ai/free-tier";
import { overLimit, tooManyRequests } from "#/lib/desktop/rate-limit";
import { shareContent } from "#/lib/shares/service";

/**
 * POST /api/shares/:id/content  the encrypted content, counting one view.
 * A POST, not a GET, so link previews and prefetchers (Slack, iMessage) don't
 * spend a burn-after-reading link before the person it was meant for opens it.
 */
export const Route = createFileRoute("/api/shares/$id/content")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const retry = await overLimit(`share-view:${ipFrom(request)}`, 120, 600);
        if (retry !== null) return tooManyRequests(retry);
        return shareContent(params.id);
      },
    },
  },
});
