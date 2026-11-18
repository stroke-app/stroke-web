import { createFileRoute } from "@tanstack/react-router";

import {
  badJson,
  caller,
  listKeys,
  readJson,
  rewrapKeys,
  signInRequired,
} from "#/lib/backups/service";

/**
 * GET  /api/backups/keys  wrapped data keys of the account's encrypted backups
 * POST /api/backups/keys  { keys: [{ id, key_id, wrapped_key }] } after a sync reset (app only)
 */
export const Route = createFileRoute("/api/backups/keys")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const c = await caller(request);
        return c ? listKeys(c) : signInRequired();
      },
      POST: async ({ request }) => {
        const c = await caller(request);
        if (!c) return signInRequired();
        const body = await readJson(request);
        return body ? rewrapKeys(c, body) : badJson();
      },
    },
  },
});
