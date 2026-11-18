import { createFileRoute } from "@tanstack/react-router";

import {
  badJson,
  caller,
  listJobs,
  readJson,
  saveJob,
  signInRequired,
} from "#/lib/backups/service";

/**
 * GET  /api/backups/jobs  every scheduled backup with recent runs (app or website)
 * POST /api/backups/jobs  create or update one (app only, Pro)
 */
export const Route = createFileRoute("/api/backups/jobs")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const c = await caller(request);
        return c ? listJobs(c) : signInRequired();
      },
      POST: async ({ request }) => {
        const c = await caller(request);
        if (!c) return signInRequired();
        const body = await readJson(request);
        return body ? saveJob(c, body) : badJson();
      },
    },
  },
});
