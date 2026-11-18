import { createFileRoute } from "@tanstack/react-router";

import { badJson, caller, readJson, signInRequired, startRun } from "#/lib/backups/service";

/** POST /api/backups/runs  { job_id, slot }: claim a run (app only, Pro). */
export const Route = createFileRoute("/api/backups/runs")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const c = await caller(request);
        if (!c) return signInRequired();
        const body = await readJson(request);
        return body ? startRun(c, body) : badJson();
      },
    },
  },
});
