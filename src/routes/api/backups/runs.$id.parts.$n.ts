import { createFileRoute } from "@tanstack/react-router";

import { caller, signInRequired, uploadPart } from "#/lib/backups/service";

/** PUT /api/backups/runs/:id/parts/:n  raw bytes of part n (app only). */
export const Route = createFileRoute("/api/backups/runs/$id/parts/$n")({
  server: {
    handlers: {
      PUT: async ({ request, params }) => {
        const c = await caller(request);
        return c ? uploadPart(c, params.id, Number(params.n), request) : signInRequired();
      },
    },
  },
});
