import "@tanstack/react-start/server-only";
import { createHash, randomBytes } from "node:crypto";

import { and, desc, eq, isNull, lt } from "drizzle-orm";

import { db } from "#/lib/db";
import {
  desktopCodes,
  desktopTokens,
  deviceTrials,
  licenses,
  user,
  userTrials,
} from "#/lib/db/schema";
import type { DesktopSignInParams } from "#/lib/desktop/params";
import { resolveLicense, signWithLicenseKey } from "#/lib/license";
import { parseOs, parseVersion } from "#/lib/license/platform";
import { verifyLicenseKey } from "#/lib/license/verify";

/**
 * Desktop sign-in and account entitlement (docs/accounts-and-sync.md,
 * Appendix A). The app signs in through /desktop/sign-in, trades the one-time
 * code for a bearer token at /api/desktop/token, and reads its entitlement
 * from /api/me.
 */

/** Free-trial length in days. Keep in sync with the desktop app (license.rs). */
export const TRIAL_DAYS = 17;
const DAY_SEC = 86_400;
const CODE_TTL_MS = 5 * 60_000;
/** How long the app may trust a cached, signature-checked entitlement offline. */
const ENTITLEMENT_TTL_SEC = 7 * DAY_SEC;

type UserRow = typeof user.$inferSelect;
export type DesktopTokenRow = typeof desktopTokens.$inferSelect;

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/** PKCE S256: base64url(SHA-256(verifier)), no padding. */
function s256(verifier: string): string {
  return createHash("sha256").update(verifier, "ascii").digest("base64url");
}

function randomSecret(): string {
  return randomBytes(32).toString("base64url");
}

const toSec = (d: Date) => Math.floor(d.getTime() / 1000);

/** An error in the desktop API's shape: `{ error, message }`. */
export function apiError(status: number, error: string, message: string): Response {
  return Response.json({ error, message }, { status });
}

export const unauthorized = () =>
  apiError(401, "unauthorized", "Sign in to Stroke again; this session is no longer valid.");

// ---------------------------------------------------------------------------
// Sign-in page: one-time code
// ---------------------------------------------------------------------------

/** Mint a single-use, 5-minute code bound to the user, PKCE challenge and device. */
export async function mintDesktopCode(userId: string, params: DesktopSignInParams) {
  const code = randomSecret();
  const now = Date.now();
  await db.insert(desktopCodes).values({
    codeHash: sha256Hex(code),
    userId,
    codeChallenge: params.code_challenge,
    deviceId: params.device_id,
    expiresAt: new Date(now + CODE_TTL_MS),
  });
  // Codes are useless a few minutes after they expire; keep the table small.
  await db.delete(desktopCodes).where(lt(desktopCodes.expiresAt, new Date(now - 86_400_000)));
  return code;
}

// ---------------------------------------------------------------------------
// POST /api/desktop/token
// ---------------------------------------------------------------------------

export type TokenRequest = {
  code: string;
  codeVerifier: string;
  deviceId: string;
  deviceName: string | null;
  os: unknown;
  version: unknown;
};

export async function exchangeDesktopCode(req: TokenRequest): Promise<Response> {
  const now = new Date();

  // Burn the code first, atomically: a code is single use even when the rest
  // of the checks fail, and two racing requests can't both redeem it.
  const [row] = await db
    .update(desktopCodes)
    .set({ usedAt: now })
    .where(and(eq(desktopCodes.codeHash, sha256Hex(req.code)), isNull(desktopCodes.usedAt)))
    .returning();

  if (!row) return apiError(400, "invalid_code", "This sign-in code is invalid or already used.");
  if (row.expiresAt.getTime() <= now.getTime()) {
    return apiError(400, "expired_code", "This sign-in code has expired. Sign in again.");
  }
  if (row.deviceId !== req.deviceId) {
    return apiError(400, "invalid_code", "This sign-in code was issued to a different device.");
  }
  if (s256(req.codeVerifier) !== row.codeChallenge) {
    return apiError(400, "pkce_mismatch", "The sign-in verifier doesn't match. Sign in again.");
  }

  const [account] = await db.select().from(user).where(eq(user.id, row.userId)).limit(1);
  if (!account) return apiError(400, "invalid_code", "This account no longer exists.");

  // One live session per device: a fresh sign-in replaces the old token.
  await db
    .update(desktopTokens)
    .set({ revokedAt: now })
    .where(
      and(
        eq(desktopTokens.userId, account.id),
        eq(desktopTokens.deviceId, req.deviceId),
        isNull(desktopTokens.revokedAt),
      ),
    );

  const token = randomSecret();
  await db.insert(desktopTokens).values({
    id: crypto.randomUUID(),
    userId: account.id,
    deviceId: req.deviceId,
    deviceName: req.deviceName,
    os: parseOs(req.os) ?? null,
    version: parseVersion(req.version) ?? null,
    tokenHash: sha256Hex(token),
    lastSeenAt: now,
  });

  return Response.json({ token, user: publicUser(account) });
}

// ---------------------------------------------------------------------------
// Bearer auth
// ---------------------------------------------------------------------------

/**
 * Resolve `Authorization: Bearer <token>` to its live token row and user.
 * The token is looked up by its hash, so nothing secret is compared in code.
 */
export async function authenticateDesktop(
  request: Request,
): Promise<{ token: DesktopTokenRow; user: UserRow } | null> {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+([A-Za-z0-9_-]{16,128})\s*$/.exec(header);
  if (!match) return null;

  const rows = await db
    .select({ token: desktopTokens, user })
    .from(desktopTokens)
    .innerJoin(user, eq(user.id, desktopTokens.userId))
    .where(and(eq(desktopTokens.tokenHash, sha256Hex(match[1]!)), isNull(desktopTokens.revokedAt)))
    .limit(1);
  return rows[0] ?? null;
}

export async function revokeDesktopToken(tokenId: string) {
  await db
    .update(desktopTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(desktopTokens.id, tokenId), isNull(desktopTokens.revokedAt)));
}

// ---------------------------------------------------------------------------
// GET /api/me (and /api/license/link)
// ---------------------------------------------------------------------------

function publicUser(u: UserRow) {
  return { id: u.id, email: u.email, name: u.name, image: u.image ?? null };
}

/**
 * Start the account trial on first sight, then return it. A device trial the
 * signing-in device already ran carries over (earliest start wins), so signing
 * in can't hand out a second trial.
 */
async function ensureUserTrial(userId: string, deviceId: string) {
  const [existing] = await db
    .select()
    .from(userTrials)
    .where(eq(userTrials.userId, userId))
    .limit(1);
  if (existing) return existing;

  const [device] = await db
    .select({ startedAt: deviceTrials.startedAt })
    .from(deviceTrials)
    .where(eq(deviceTrials.deviceId, deviceId))
    .limit(1);
  const now = Date.now();
  const startedAt = new Date(Math.min(now, device?.startedAt.getTime() ?? now));

  await db.insert(userTrials).values({ userId, startedAt }).onConflictDoNothing();
  const [row] = await db.select().from(userTrials).where(eq(userTrials.userId, userId)).limit(1);
  return row!;
}

/**
 * The `/api/me` body. `entitlement` is serialized once and embedded verbatim,
 * so the bytes the app sees are exactly the bytes that were signed.
 */
export async function meResponse(account: UserRow, token: DesktopTokenRow): Promise<Response> {
  const now = new Date();
  const nowSec = toSec(now);

  await db.update(desktopTokens).set({ lastSeenAt: now }).where(eq(desktopTokens.id, token.id));

  const [license, trial, sessions] = await Promise.all([
    resolveLicense(account.id, account.email),
    ensureUserTrial(account.id, token.deviceId),
    db
      .select()
      .from(desktopTokens)
      .where(and(eq(desktopTokens.userId, account.id), isNull(desktopTokens.revokedAt)))
      .orderBy(desc(desktopTokens.lastSeenAt)),
  ]);

  const licenseActive =
    !!license &&
    !license.revokedAt &&
    (!license.expiresAt || license.expiresAt.getTime() > now.getTime());

  const trialStart = toSec(trial.startedAt);
  const trialEnd = trialStart + TRIAL_DAYS * DAY_SEC;
  const trialRunning = nowSec < trialEnd;

  const source = licenseActive ? "license" : trialRunning ? "trial" : "none";
  const entitlement = {
    plan: source === "none" ? "free" : "pro",
    source,
    license: licenseActive
      ? {
          plan: license.plan,
          expires_at: license.expiresAt ? toSec(license.expiresAt) : 0,
          key_hint: license.licenseKey.slice(-6),
        }
      : null,
    trial: { started_at: trialStart, ends_at: trialEnd },
    issued_at: nowSec,
    valid_until: nowSec + ENTITLEMENT_TTL_SEC,
    // The device this was issued to, inside the signed text. The desktop app
    // trusts the cached entitlement offline only on that device, so a copied
    // cache grants nothing elsewhere. Older app versions ignore the field.
    device_id: token.deviceId,
  };

  const entitlementJson = JSON.stringify(entitlement);
  const signature = signWithLicenseKey(Buffer.from(entitlementJson, "utf8"));
  const devices = sessions.map((s) => ({
    device_id: s.deviceId,
    name: s.deviceName,
    os: s.os,
    last_seen_at: toSec(s.id === token.id ? now : s.lastSeenAt),
    current: s.id === token.id,
  }));

  const body =
    `{"user":${JSON.stringify(publicUser(account))},` +
    `"entitlement":${entitlementJson},` +
    `"entitlement_sig":${JSON.stringify(signature)},` +
    `"devices":${JSON.stringify(devices)}}`;

  return new Response(body, {
    status: 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

// ---------------------------------------------------------------------------
// POST /api/license/link
// ---------------------------------------------------------------------------

/** Attach a held license key to this account. Null on success, else the error response. */
export async function linkLicenseKey(account: UserRow, key: string): Promise<Response | null> {
  const verified = verifyLicenseKey(key);
  if (!verified.valid) {
    return apiError(400, "invalid_key", `This license key isn't valid (${verified.error}).`);
  }

  const [license] = await db.select().from(licenses).where(eq(licenses.licenseKey, key)).limit(1);
  if (!license) return apiError(404, "not_found", "No license matches this key.");
  if (license.revokedAt) return apiError(403, "revoked", "This license key has been revoked.");

  // Every license row is created for a user (licenses.user_id is NOT NULL and
  // unique), so "unset" never happens: the key is either already this
  // account's, or someone else's.
  if (license.userId !== account.id) {
    return apiError(
      409,
      "key_owned_elsewhere",
      "This license belongs to a different Stroke account. Sign in with that account, or contact support.",
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Account page
// ---------------------------------------------------------------------------

export function listDesktopSessions(userId: string) {
  return db
    .select({
      id: desktopTokens.id,
      deviceName: desktopTokens.deviceName,
      os: desktopTokens.os,
      version: desktopTokens.version,
      createdAt: desktopTokens.createdAt,
      lastSeenAt: desktopTokens.lastSeenAt,
    })
    .from(desktopTokens)
    .where(and(eq(desktopTokens.userId, userId), isNull(desktopTokens.revokedAt)))
    .orderBy(desc(desktopTokens.lastSeenAt));
}

export async function revokeDesktopSession(userId: string, id: string) {
  const rows = await db
    .update(desktopTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(desktopTokens.id, id),
        eq(desktopTokens.userId, userId),
        isNull(desktopTokens.revokedAt),
      ),
    )
    .returning({ id: desktopTokens.id });
  return rows.length > 0;
}
