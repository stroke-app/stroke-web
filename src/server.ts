import handler from "@tanstack/react-start/server-entry";

import { ROOM_RE, StudioRelay } from "#/lib/relay/studio-relay";

export { StudioRelay };

/**
 * Custom Worker entry: TanStack Start serves every request.
 * https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/
 */
/**
 * Pages ask Chromium for the CPU architecture, so the next request says
 * whether a Mac is Apple Silicon or Intel and the download button is right in
 * the server's HTML (lib/platform-hint.ts). The platform itself comes on
 * every request already.
 */
function withClientHints(response: Response) {
  if (!response.headers.get("content-type")?.includes("text/html")) return response;
  const out = new Response(response.body, response);
  out.headers.set("Accept-CH", "Sec-CH-UA-Platform, Sec-CH-UA-Arch");
  out.headers.append("Vary", "Sec-CH-UA-Platform, Sec-CH-UA-Arch");
  return out;
}

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
    const response = await (
      handler.fetch as (r: Request, e: unknown, c: ExecutionContext) => Promise<Response>
    )(request, env, ctx);
    return withClientHints(response);
  },
};
