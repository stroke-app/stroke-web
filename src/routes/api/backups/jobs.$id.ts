import { createFileRoute } from "@tanstack/react-router";

import {
  badJson,
  caller,
  deleteJob,
  patchJob,
  readJson,
  signInRequired,
} from "#/lib/backups/service";

/**
 * PATCH  /api/backups/jobs/:id  { enabled } or { run_now: true }
 * DELETE /api/backups/jobs/:id  the job, its history and its Stroke Cloud files
 */
export const Route = createFileRoute("/api/backups/jobs/$id")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        const c = await caller(request);
        if (!c) return signInRequired();
        const body = await readJson(request);
        return body ? patchJob(c, params.id, body) : badJson();
      },
      DELETE: async ({ request, params }) => {
        const c = await caller(request);
        return c ? deleteJob(c, params.id) : signInRequired();
      },
    },
  },
});
