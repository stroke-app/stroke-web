import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { sponsorCheckoutUrl, sponsorTotals } from "#/lib/sponsors/service";

/** The goal bar and the checkout link, for /sponsors and the home page. */
export const $getSponsorStatus = createServerFn({ method: "GET" }).handler(async () => ({
  ...(await sponsorTotals()),
  checkoutUrl: sponsorCheckoutUrl(),
}));

export const sponsorStatusQueryOptions = () =>
  queryOptions({
    queryKey: ["sponsors", "status"],
    queryFn: ({ signal }) => $getSponsorStatus({ signal }),
    staleTime: 5 * 60 * 1000,
  });
