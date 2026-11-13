import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

import { authMiddleware, freshAuthMiddleware } from "#/lib/auth/middleware";
import { desktopCallbackUrl, desktopSignInParams } from "#/lib/desktop/params";
import { overLimit } from "#/lib/desktop/rate-limit";
import { listDesktopSessions, mintDesktopCode, revokeDesktopSession } from "#/lib/desktop/service";

/**
 * "Continue" on /desktop/sign-in: mint a one-time code for the signed-in user
 * and hand back the loopback URL the browser goes to next. The code is also
 * returned for the paste-a-code fallback (`stroke-code:<code>`): it is bound
 * to the app's PKCE challenge, so only the app that started this sign-in can
 * redeem it.
 */
export const $authorizeDesktop = createServerFn({ method: "POST" })
  .middleware([freshAuthMiddleware])
  .inputValidator(desktopSignInParams)
  .handler(async ({ context, data }) => {
    if ((await overLimit(`desktop-code:user:${context.user.id}`, 20, 600)) !== null) {
      throw new Error("Too many sign-in attempts. Wait a few minutes and try again.");
    }
    const code = await mintDesktopCode(context.user.id, data);
    return { code, url: desktopCallbackUrl(data.port, { code, state: data.state }) };
  });

/** Desktop apps signed in to this account, most recently seen first. */
export const $getDesktopSessions = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => listDesktopSessions(context.user.id));

/** Sign one desktop app out; it finds out on its next /api/me (401). */
export const $revokeDesktopSession = createServerFn({ method: "POST" })
  .middleware([freshAuthMiddleware])
  .inputValidator(z.object({ id: z.string().min(1).max(64) }))
  .handler(async ({ context, data }) => ({
    revoked: await revokeDesktopSession(context.user.id, data.id),
  }));

export const desktopSessionsQueryOptions = () =>
  queryOptions({
    queryKey: ["desktop", "sessions"],
    queryFn: ({ signal }) => $getDesktopSessions({ signal }),
  });
