import handler from "@tanstack/react-start/server-entry";

import { runDueDraw } from "#/lib/giveaway/service";

/**
 * Custom Worker entry: TanStack Start serves every request, and the weekly
 * cron in wrangler.toml draws the giveaway week that just closed.
 * https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/
 */
export default {
  fetch: handler.fetch,

  async scheduled(_event: ScheduledController, _env: unknown, ctx: ExecutionContext) {
    ctx.waitUntil(
      runDueDraw().then(
        (result) => console.log("[giveaway] weekly draw", JSON.stringify(result)),
        (err) => console.error("[giveaway] weekly draw failed", err),
      ),
    );
  },
};
