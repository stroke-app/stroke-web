import { createFileRoute } from "@tanstack/react-router";

import { caller, signInRequired } from "#/lib/backups/service";
import { getSyncKey } from "#/lib/sync/service";

/**
 * GET /api/backups/sync-key: the account's wrapped sync key and its KDF, for
 * the website to open a backup in the browser after the user types their sync
 * passphrase. The key is useless without the passphrase, which never leaves
 * the browser.
 */
export const Route = createFileRoute("/api/backups/sync-key")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const c = await caller(request);
        return c ? getSyncKey(c.userId) : signInRequired();
      },
    },
  },
});
