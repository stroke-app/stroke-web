import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";

import { db } from "#/lib/db";
import { deviceRequests, licenses } from "#/lib/db/schema";
import { requireAdminSecret } from "#/lib/license/admin-auth";

// POST /api/admin/license/devices
// Body: { license_key | user_id, max_devices: number } to set the limit (and
// approve the pending request), or { ..., decline: true } to decline it.
// GET  /api/admin/license/devices: pending requests, oldest first.
// Header: Authorization: Bearer <LICENSE_ADMIN_SECRET>
export const Route = createFileRoute("/api/admin/license/devices")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const deny = requireAdminSecret(request);
        if (deny) return deny;
        const rows = await db
          .select({
            id: deviceRequests.id,
            user_id: deviceRequests.userId,
            license_key: licenses.licenseKey,
            max_devices: licenses.maxDevices,
            requested: deviceRequests.requested,
            reason: deviceRequests.reason,
            created_at: deviceRequests.createdAt,
          })
          .from(deviceRequests)
          .innerJoin(licenses, eq(licenses.id, deviceRequests.licenseId))
          .where(eq(deviceRequests.status, "pending"))
          .orderBy(deviceRequests.createdAt);
        return Response.json({ success: true, requests: rows });
      },
      POST: async ({ request }) => {
        const deny = requireAdminSecret(request);
        if (deny) return deny;

        let body: {
          license_key?: string;
          user_id?: string;
          max_devices?: number;
          decline?: boolean;
        };
        try {
          body = await request.json();
        } catch {
          return Response.json({ success: false, error: "invalid_json" }, { status: 400 });
        }
        const { license_key, user_id, max_devices, decline } = body;
        if (!license_key && !user_id) {
          return Response.json(
            { success: false, error: "provide license_key or user_id" },
            { status: 400 },
          );
        }
        if (
          !decline &&
          (!Number.isInteger(max_devices) || max_devices! < 1 || max_devices! > 100)
        ) {
          return Response.json(
            { success: false, error: "max_devices must be 1-100" },
            { status: 400 },
          );
        }

        const where = license_key
          ? eq(licenses.licenseKey, license_key)
          : eq(licenses.userId, user_id!);
        const [license] = await db.select({ id: licenses.id }).from(licenses).where(where).limit(1);
        if (!license) {
          return Response.json({ success: false, error: "not_found" }, { status: 404 });
        }

        if (!decline) {
          await db
            .update(licenses)
            .set({ maxDevices: max_devices! })
            .where(eq(licenses.id, license.id));
        }
        await db
          .update(deviceRequests)
          .set({ status: decline ? "declined" : "approved", resolvedAt: new Date() })
          .where(
            and(eq(deviceRequests.licenseId, license.id), eq(deviceRequests.status, "pending")),
          );

        return Response.json({ success: true });
      },
    },
  },
});
