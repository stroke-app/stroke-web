import { createFileRoute } from "@tanstack/react-router";

import { caller, downloadRun, signInRequired } from "#/lib/backups/service";

/** GET /api/backups/runs/:id/download  the backup's .sql.gz from Stroke Cloud. */
export const Route = createFileRoute("/api/backups/runs/$id/download")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const c = await caller(request);
        return c ? downloadRun(c, params.id) : signInRequired();
      },
    },
  },
});
