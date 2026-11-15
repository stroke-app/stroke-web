import { createFileRoute } from "@tanstack/react-router";

import { overLimit, tooManyRequests } from "#/lib/desktop/rate-limit";
import { shareOwner, signInRequired } from "#/lib/shares/owner";
import { createShare, listShares, SHARE_PLANS, sharePlanFor } from "#/lib/shares/service";

/**
 * GET  /api/shares  the signed-in user's shares, plan and limits
 * POST /api/shares  create one. Body: the encrypted bytes. Header
 *      x-share-meta: {"kind","expiresIn","maxViews","passwordSalt"}
 */
export const Route = createFileRoute("/api/shares/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const owner = await shareOwner(request);
        if (!owner) return signInRequired();
        const plan = await sharePlanFor(owner);
        const limits = SHARE_PLANS[plan];
        return Response.json(
          {
            plan,
            limits: {
              ...limits,
              maxActive: Number.isFinite(limits.maxActive) ? limits.maxActive : null,
              maxExpirySeconds: Number.isFinite(limits.maxExpirySeconds)
                ? limits.maxExpirySeconds
                : null,
            },
            shares: await listShares(owner),
          },
          { headers: { "cache-control": "no-store" } },
        );
      },
      POST: async ({ request }) => {
        const owner = await shareOwner(request);
        if (!owner) return signInRequired();
        const retry = await overLimit(`share-create:${owner}`, 60, 3600);
        if (retry !== null) return tooManyRequests(retry);
        let meta: Record<string, unknown>;
        try {
          meta = JSON.parse(request.headers.get("x-share-meta") ?? "{}") as Record<string, unknown>;
        } catch {
          return Response.json(
            { error: { code: "invalid_meta", message: "Invalid share metadata." } },
            { status: 400 },
          );
        }
        const declared = Number(request.headers.get("content-length") ?? 0);
        if (declared > 11 * 1024 * 1024) {
          return Response.json(
            { error: { code: "too_large", message: "A share is at most 10 MB." } },
            { status: 413 },
          );
        }
        return createShare({
          ownerId: owner,
          kind: String(meta.kind ?? ""),
          expiresIn: meta.expiresIn === null ? null : Number(meta.expiresIn),
          maxViews:
            meta.maxViews === null || meta.maxViews === undefined ? null : Number(meta.maxViews),
          passwordSalt: typeof meta.passwordSalt === "string" ? meta.passwordSalt : null,
          body: await request.arrayBuffer(),
        });
      },
    },
  },
});
