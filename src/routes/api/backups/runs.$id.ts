import { createFileRoute } from "@tanstack/react-router";

import {
  badJson,
  caller,
  deleteRun,
  finishRun,
  readJson,
  signInRequired,
} from "#/lib/backups/service";

/**
 * PATCH  /api/backups/runs/:id  { status, tables, rows, error?, bytes?, object_key? } (app only)
 * DELETE /api/backups/runs/:id  one backup and its Stroke Cloud file
 */
export const Route = createFileRoute("/api/backups/runs/$id")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        const c = await caller(request);
        if (!c) return signInRequired();
        const body = await readJson(request);
        return body ? finishRun(c, params.id, body) : badJson();
      },
      DELETE: async ({ request, params }) => {
        const c = await caller(request);
        return c ? deleteRun(c, params.id) : signInRequired();
      },
    },
  },
});
