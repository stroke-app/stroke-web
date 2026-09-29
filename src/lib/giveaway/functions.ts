import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { _getUser } from "#/lib/auth/functions";
import { freshAuthMiddleware } from "#/lib/auth/middleware";

import { enterGiveaway, getGiveawayState } from "./service";

const person = (u: { id: string; email: string; name: string; emailVerified: boolean }) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  emailVerified: u.emailVerified,
});

/** Public: this week's draw, plus the viewer's own status when signed in. */
export const $getGiveaway = createServerFn({ method: "GET" }).handler(async () => {
  const viewer = await _getUser();
  return getGiveawayState(viewer ? person(viewer) : null);
});

/** Enter the signed-in user into this week's draw. Fresh auth: it is a mutation. */
export const $enterGiveaway = createServerFn({ method: "POST" })
  .middleware([freshAuthMiddleware])
  .handler(async ({ context }) => enterGiveaway(person(context.user)));

export const giveawayQueryOptions = () =>
  queryOptions({
    queryKey: ["giveaway"],
    queryFn: ({ signal }) => $getGiveaway({ signal }),
    staleTime: 1000 * 60,
  });
