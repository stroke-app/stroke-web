import "@tanstack/react-start/server-only";
import { createHash, randomBytes } from "node:crypto";

import { and, asc, eq, inArray, isNull, lt } from "drizzle-orm";

import { db } from "#/lib/db";
import {
  accountTrials,
  activations,
  desktopCodes,
  desktopTokens,
  deviceTrials,
  licenses,
  user,
  userTrials,
} from "#/lib/db/schema";
import type { DesktopSignInParams } from "#/lib/desktop/params";
import { requestGeo } from "#/lib/geo";
import { resolveLicense, signWithLicenseKey } from "#/lib/license";
import { parseOs, parseVersion } from "#/lib/license/platform";
import { verifyLicenseKey } from "#/lib/license/verify";
import { recordSignIn } from "#/lib/signins";

/**
 * Desktop sign-in and account entitlement (docs/accounts-and-sync.md,
 * Appendix A). The app signs in through /desktop/sign-in, trades the one-time
 * code for a bearer token at /api/desktop/token, and reads its entitlement
 * from /api/me.
 */

/** Free-trial length in days. Keep in sync with the desktop app (license.rs). */
export const TRIAL_DAYS = 30;
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

export async function exchangeDesktopCode(req: TokenRequest, request?: Request): Promise<Response> {
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

  // Three computers per account: a new one waits until a seat is freed.
  const room = await deviceRoom(account.id, req.deviceId);
  if (!room.ok) return apiError(409, "device_limit", deviceLimitMessage(room));

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
  const geo = requestGeo(request);
  await db.insert(desktopTokens).values({
    country: geo.country,
    id: crypto.randomUUID(),
    userId: account.id,
    deviceId: req.deviceId,
    deviceName: req.deviceName,
    os: parseOs(req.os) ?? null,
    version: parseVersion(req.version) ?? null,
    tokenHash: sha256Hex(token),
    lastSeenAt: now,
  });
  await recordSignIn({
    userId: account.id,
    source: "desktop",
    geo,
    deviceId: req.deviceId,
    appVersion: parseVersion(req.version) ?? null,
    os: parseOs(req.os) ?? null,
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

/** The header the v3 app sends to get its own account trial. */
export const TRIAL_SCHEME_HEADER = "x-stroke-trial";
/** The app's version, sent with GET /api/me. */
export const VERSION_HEADER = "x-stroke-version";

/**
 * Start the account trial on first sight, then return it. A device trial the
 * signing-in device already ran carries over (earliest start wins), so signing
 * in can't hand out a second trial.
 *
 * The v3 app (`fresh`) uses its own table: an account gets one new trial
 * there, unless the device signing in already ran a v3 trial for another
 * account; then it shares that one, so new accounts don't mean new trials.
 */
async function ensureUserTrial(userId: string, deviceId: string, fresh: boolean) {
  if (fresh) {
    const [mine] = await db
      .select()
      .from(accountTrials)
      .where(eq(accountTrials.userId, userId))
      .limit(1);
    if (mine) return mine;
    // One trial per computer: another account's trial on this device is this
    // account's trial too (earliest start wins), running or over.
    const [onDevice] = await db
      .select({ startedAt: accountTrials.startedAt })
      .from(accountTrials)
      .where(eq(accountTrials.deviceId, deviceId))
      .orderBy(asc(accountTrials.startedAt))
      .limit(1);
    const startedAt = onDevice?.startedAt ?? new Date();
    await db.insert(accountTrials).values({ userId, startedAt, deviceId }).onConflictDoNothing();
    const [row] = await db
      .select()
      .from(accountTrials)
      .where(eq(accountTrials.userId, userId))
      .limit(1);
    return row!;
  }

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
export async function meResponse(
  account: UserRow,
  token: DesktopTokenRow,
  request?: Request,
): Promise<Response> {
  const freshTrial = request?.headers.get(TRIAL_SCHEME_HEADER) === "account-v3";
  const now = new Date();
  const nowSec = toSec(now);

  // The app says which version it is on every check, so the device list shows
  // what each computer runs now, not what it signed in with.
  const version = request?.headers.get(VERSION_HEADER)?.trim().slice(0, 64) || null;
  await db
    .update(desktopTokens)
    .set(version ? { lastSeenAt: now, version } : { lastSeenAt: now })
    .where(eq(desktopTokens.id, token.id));

  const [license, trial] = await Promise.all([
    resolveLicense(account.id, account.email),
    ensureUserTrial(account.id, token.deviceId, freshTrial),
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
  // Every computer on the account, signed in or holding its 2.x license key,
  // so the app's list matches the website's.
  const devices = (await listAccountDevices(account.id)).map((d) => ({
    device_id: d.deviceId,
    name: d.name ?? "",
    os: d.os ?? "",
    last_seen_at: d.deviceId === token.deviceId ? nowSec : Math.floor(d.lastSeenAt / 1000),
    current: d.deviceId === token.deviceId,
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

// ---------------------------------------------------------------------------
// Devices: one list for the website and the app
// ---------------------------------------------------------------------------

/**
 * A computer using Stroke with this account. 2.x apps hold a license key
 * (a row in `activations`); v3 apps sign in (a row in `desktop_tokens`). Both
 * report the same device id (license::device_id in the app), so a computer
 * that did both is one device here, not two.
 */
export type AccountDevice = {
  deviceId: string;
  name: string | null;
  os: string | null;
  version: string | null;
  firstSeenAt: number;
  lastSeenAt: number;
  /** Signed in to this account (v3). */
  signedIn: boolean;
  /** Holds this account's license key (2.x), taking one of its seats. */
  licenseKey: boolean;
};

export async function listAccountDevices(userId: string): Promise<AccountDevice[]> {
  // One round of queries: the 2.x key's computers come through a subquery on
  // the account's license instead of a second trip after the license lookup.
  const [sessions, keyed] = await Promise.all([
    db
      .select()
      .from(desktopTokens)
      .where(and(eq(desktopTokens.userId, userId), isNull(desktopTokens.revokedAt))),
    db
      .select()
      .from(activations)
      .where(
        inArray(
          activations.licenseId,
          db.select({ id: licenses.id }).from(licenses).where(eq(licenses.userId, userId)),
        ),
      ),
  ]);

  const byId = new Map<string, AccountDevice>();
  const merge = (
    deviceId: string,
    seen: {
      name: string | null;
      os: string | null;
      version: string | null;
      first: Date;
      last: Date;
    },
    kind: "signedIn" | "licenseKey",
  ) => {
    const prev = byId.get(deviceId);
    const last = seen.last.getTime();
    const newer = !prev || last >= prev.lastSeenAt;
    byId.set(deviceId, {
      deviceId,
      // The most recently reported name, OS and version win.
      name: (newer ? seen.name : prev.name) ?? prev?.name ?? seen.name,
      os: (newer ? seen.os : prev.os) ?? prev?.os ?? seen.os,
      version: (newer ? seen.version : prev.version) ?? prev?.version ?? seen.version,
      firstSeenAt: Math.min(prev?.firstSeenAt ?? Infinity, seen.first.getTime()),
      lastSeenAt: Math.max(prev?.lastSeenAt ?? 0, last),
      signedIn: (prev?.signedIn ?? false) || kind === "signedIn",
      licenseKey: (prev?.licenseKey ?? false) || kind === "licenseKey",
    });
  };
  for (const s of sessions) {
    merge(
      s.deviceId,
      { name: s.deviceName, os: s.os, version: s.version, first: s.createdAt, last: s.lastSeenAt },
      "signedIn",
    );
  }
  for (const a of keyed) {
    const name = a.hostname && a.hostname !== "unknown" ? a.hostname : null;
    merge(
      a.deviceId,
      { name, os: a.os, version: a.appVersion, first: a.activatedAt, last: a.lastSeenAt },
      "licenseKey",
    );
  }
  return [...byId.values()].sort((a, b) => b.lastSeenAt - a.lastSeenAt);
}

/** Computers one account can use Stroke on at once, unless its license allows more. */
export const ACCOUNT_DEVICE_LIMIT = 3;

/**
 * Whether `deviceId` may sign in to this account: it already holds a seat,
 * or the account is on fewer computers than its limit. The limit is 3, or a
 * license's own seat count when that was raised ("I need more devices").
 * A computer frees its seat by signing out, or by being removed on
 * stroke.click/app; the trial and Pro follow the account, not the computer.
 */
export async function deviceRoom(userId: string, deviceId: string) {
  const [devices, license] = await Promise.all([
    listAccountDevices(userId),
    db
      .select({ maxDevices: licenses.maxDevices })
      .from(licenses)
      .where(eq(licenses.userId, userId)),
  ]);
  const limit = Math.max(ACCOUNT_DEVICE_LIMIT, ...license.map((l) => l.maxDevices));
  const known = devices.some((d) => d.deviceId === deviceId);
  return { ok: known || devices.length < limit, limit, used: devices.length, devices };
}

/** The sentence the app shows when a fourth computer tries to sign in. */
export function deviceLimitMessage(room: Awaited<ReturnType<typeof deviceRoom>>) {
  const names = room.devices
    .map((d) => d.name ?? "an unnamed computer")
    .slice(0, 5)
    .join(", ");
  return `Stroke is signed in on ${room.used} computers with this account (${names}), the most it allows. Remove one at stroke.click/app, or sign out of Stroke on it, then sign in here again.`;
}

/**
 * Remove a computer from the account: sign it out and free its license seat.
 * It finds out the next time it reaches stroke.click.
 */
export async function removeAccountDevice(userId: string, deviceId: string): Promise<boolean> {
  const revoked = await db
    .update(desktopTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(desktopTokens.userId, userId),
        eq(desktopTokens.deviceId, deviceId),
        isNull(desktopTokens.revokedAt),
      ),
    )
    .returning({ id: desktopTokens.id });
  const [license] = await db
    .select({ id: licenses.id })
    .from(licenses)
    .where(eq(licenses.userId, userId))
    .limit(1);
  const freed = license
    ? await db
        .delete(activations)
        .where(and(eq(activations.licenseId, license.id), eq(activations.deviceId, deviceId)))
        .returning({ id: activations.id })
    : [];
  return revoked.length + freed.length > 0;
}

// ---------------------------------------------------------------------------
// Pro check for server features (scheduled backups)
// ---------------------------------------------------------------------------

/**
 * True when the account has Pro the way the v3 app sees it: an active license
 * bought with this account, or its v3 trial still running. Read-only: the
 * trial starts on GET /api/me, not here.
 */
export async function accountHasPro(userId: string, email: string): Promise<boolean> {
  const now = Date.now();
  const license = await resolveLicense(userId, email);
  if (license && !license.revokedAt && (!license.expiresAt || license.expiresAt.getTime() > now)) {
    return true;
  }
  const [trial] = await db
    .select({ startedAt: accountTrials.startedAt })
    .from(accountTrials)
    .where(eq(accountTrials.userId, userId))
    .limit(1);
  return !!trial && trial.startedAt.getTime() + TRIAL_DAYS * DAY_SEC * 1000 > now;
}

/**
 * Pro that was paid for: a license bought with this account's email. The
 * trial doesn't count. Sync and scheduled backups need this.
 */
export async function accountHasPaidPro(userId: string, email: string): Promise<boolean> {
  const license = await resolveLicense(userId, email);
  return (
    !!license &&
    !license.revokedAt &&
    (!license.expiresAt || license.expiresAt.getTime() > Date.now())
  );
}

/** 403 for a paid-only feature on a trial or free account. */
export const paidProRequired = (feature: string) =>
  apiError(
    403,
    "pro_required",
    `${feature} is part of Stroke Pro. The free trial doesn't include it.`,
  );

/**
 * The account's plan as the v3 app sees it, for the dashboard: Pro from a
 * license bought with this account, else its trial (running or over).
 */
export async function accountPlan(userId: string, email: string) {
  const now = Date.now();
  // The license and the trial don't depend on each other: ask D1 for both at once.
  const [license, [trial]] = await Promise.all([
    resolveLicense(userId, email),
    db
      .select({ startedAt: accountTrials.startedAt })
      .from(accountTrials)
      .where(eq(accountTrials.userId, userId))
      .limit(1),
  ]);
  const licensed =
    !!license && !license.revokedAt && (!license.expiresAt || license.expiresAt.getTime() > now);
  const trialEndsAt = trial ? trial.startedAt.getTime() + TRIAL_DAYS * DAY_SEC * 1000 : null;
  const status: "pro" | "trial" | "ended" | "not-started" = licensed
    ? "pro"
    : trialEndsAt === null
      ? "not-started"
      : trialEndsAt > now
        ? "trial"
        : "ended";
  return { status, trialEndsAt, trialDays: TRIAL_DAYS, plan: licensed ? license.plan : null };
}
