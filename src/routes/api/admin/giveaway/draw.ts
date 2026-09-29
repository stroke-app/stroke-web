import { createFileRoute } from "@tanstack/react-router";

import { drawWeek } from "#/lib/giveaway/service";
import { isWeekKey, previousWeekKey } from "#/lib/giveaway/week";
import { requireAdminSecret } from "#/lib/license/admin-auth";

// POST /api/admin/giveaway/draw?week=YYYY-MM-DD  (omit week for the week that just closed)
// Header: Authorization: Bearer <LICENSE_ADMIN_SECRET>
// Runs the draw by hand, e.g. if the cron missed a week. Idempotent: a week
// that was already drawn returns its existing result, and a winner whose
// license or email never went out gets it now.
export const Route = createFileRoute("/api/admin/giveaway/draw")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const deny = requireAdminSecret(request);
        if (deny) return deny;

        const week = new URL(request.url).searchParams.get("week") ?? previousWeekKey();
        if (!isWeekKey(week)) {
          return Response.json({ error: "week must be a Monday as YYYY-MM-DD" }, { status: 400 });
        }

        return Response.json(await drawWeek(week));
      },
    },
  },
});
