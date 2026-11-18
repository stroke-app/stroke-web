import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

import { authMiddleware, freshAuthMiddleware } from "#/lib/auth/middleware";
import { desktopCallbackUrl, desktopSignInParams } from "#/lib/desktop/params";
import { overLimit } from "#/lib/desktop/rate-limit";
import {
  accountPlan,
  listAccountDevices,
  mintDesktopCode,
  removeAccountDevice,
} from "#/lib/desktop/service";

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

/** Every computer on the account: signed in (v3) or holding the license key (2.x). */
export const $getAccountDevices = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => listAccountDevices(context.user.id));

/** Sign a computer out and free its license seat. */
export const $removeAccountDevice = createServerFn({ method: "POST" })
  .middleware([freshAuthMiddleware])
  .inputValidator(z.object({ deviceId: z.string().min(1).max(128) }))
  .handler(async ({ context, data }) => ({
    removed: await removeAccountDevice(context.user.id, data.deviceId),
  }));

export const accountDevicesQueryOptions = () =>
  queryOptions({
    queryKey: ["account", "devices"],
    queryFn: ({ signal }) => $getAccountDevices({ signal }),
  });

/** Pro, trial (with its end) or neither, the way the app decides it. */
export const $getAccountPlan = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => accountPlan(context.user.id, context.user.email));

export const accountPlanQueryOptions = () =>
  queryOptions({
    queryKey: ["account", "plan"],
    queryFn: ({ signal }) => $getAccountPlan({ signal }),
  });
