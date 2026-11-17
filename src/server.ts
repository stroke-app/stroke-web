import handler from "@tanstack/react-start/server-entry";

import { runDueDraw } from "#/lib/giveaway/service";
import { ROOM_RE, StudioRelay } from "#/lib/relay/studio-relay";

export { StudioRelay };

/**
 * Custom Worker entry: TanStack Start serves every request, and the weekly
 * cron in wrangler.toml draws the giveaway week that just closed.
 * https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/
 */
export default {
  async fetch(
    request: Request,
    env: { STUDIO_RELAY: DurableObjectNamespace },
    ctx: ExecutionContext,
  ) {
    // Shared studio (Labs): /api/relay/<room>/(host|call|status) goes to that
    // room's relay object, before the app router.
    const url = new URL(request.url);
    const m = url.pathname.match(/^\/api\/relay\/([^/]+)\/(host|call|status)$/);
    if (m) {
      if (!ROOM_RE.test(m[1])) return new Response('{"error":"Bad room"}', { status: 400 });
      const stub = env.STUDIO_RELAY.get(env.STUDIO_RELAY.idFromName(m[1]));
      return stub.fetch(request);
    }
    return (handler.fetch as (r: Request, e: unknown, c: ExecutionContext) => Promise<Response>)(
      request,
      env,
      ctx,
    );
  },

  async scheduled(_event: ScheduledController, _env: unknown, ctx: ExecutionContext) {
    ctx.waitUntil(
      runDueDraw().then(
        (result) => console.log("[giveaway] weekly draw", JSON.stringify(result)),
        (err) => console.error("[giveaway] weekly draw failed", err),
      ),
    );
  },
};
