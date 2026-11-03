import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";

import { db } from "#/lib/db";
import { activations, licenses } from "#/lib/db/schema";
import { parseOs, parseVersion } from "#/lib/license/platform";
import { verifyLicenseKey } from "#/lib/license/verify";

export const Route = createFileRoute("/api/license/check")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { key?: string; device_id?: string; os?: unknown; version?: unknown };
        try {
          body = await request.json();
        } catch {
          return Response.json({ valid: false, error: "invalid_json" }, { status: 400 });
        }

        const { key, device_id } = body;
        if (!key || !device_id) {
          return Response.json({ valid: false, error: "missing_fields" }, { status: 400 });
        }

        const result = verifyLicenseKey(key);
        if (!result.valid) {
          return Response.json({ valid: false, error: result.error });
        }

        const licenseRows = await db
          .select()
          .from(licenses)
          .where(eq(licenses.licenseKey, key))
          .limit(1);

        if (licenseRows.length === 0) {
          return Response.json({ valid: false, error: "not_found" });
        }

        const license = licenseRows[0]!;

        if (license.revokedAt) {
          return Response.json({ valid: false, error: "revoked" });
        }

        const activation = await db
          .select()
          .from(activations)
          .where(and(eq(activations.licenseId, license.id), eq(activations.deviceId, device_id)))
          .limit(1);

        if (activation.length === 0) {
          return Response.json({ valid: false, error: "device_not_activated" });
        }

        // Older clients don't send these; never overwrite a known value with null.
        const os = parseOs(body.os);
        const appVersion = parseVersion(body.version);
        await db
          .update(activations)
          .set({ lastSeenAt: new Date(), ...(os && { os }), ...(appVersion && { appVersion }) })
          .where(eq(activations.id, activation[0]!.id));

        return Response.json({
          valid: true,
          plan: license.plan,
          expires_at: license.expiresAt ? Math.floor(license.expiresAt.getTime() / 1000) : null,
        });
      },
    },
  },
});
