import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { authMiddleware, freshAuthMiddleware } from "#/lib/auth/middleware";
import { resetSync, syncStatus } from "#/lib/sync/service";

/** Sync at a glance for the account page: set up or not, activity, usage. */
export const $getSyncStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => syncStatus(context.user.id));

/** Delete the sync key and every synced record. Devices set sync up again. */
export const $resetSync = createServerFn({ method: "POST" })
  .middleware([freshAuthMiddleware])
  .handler(async ({ context }) => {
    await resetSync(context.user.id);
    return { ok: true };
  });

export const syncStatusQueryOptions = () =>
  queryOptions({
    queryKey: ["sync", "status"],
    queryFn: ({ signal }) => $getSyncStatus({ signal }),
  });
