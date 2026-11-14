import { SiApple, SiLinux } from "@icons-pack/react-simple-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon, Loader2Icon, MonitorIcon } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { appButton, Badge, Card, CardHeader, ROW_LIST } from "#/components/app-ui";
import { WindowsLogo } from "#/components/download-targets";
import { Textarea } from "#/components/ui/textarea";
import {
  $removeDevice,
  $requestMoreDevices,
  deviceRequestQueryOptions,
  devicesQueryOptions,
} from "#/lib/billing/functions";
import { type DeviceOs, guessOs, parseOs } from "#/lib/license/platform";
import { cn } from "#/lib/utils";

type DateLike = string | number | Date;

export type PanelLicense = {
  licenseKey: string;
  plan: string;
  maxDevices: number;
  expiresAt: DateLike | null;
};

const ICON_SWAP = "transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]";
const DAY = 86_400_000;
/** A device that hasn't checked in for this long is probably gone. */
const STALE_AFTER = 30 * DAY;

/** Fixed locale and zone, so the server and the browser render the same day. */
export function formatDate(value: DateLike) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// A minute-resolution clock shared by every row. The server snapshot is null,
// so relative times render only after hydration and never mismatch.
let clock = Date.now();
function subscribeClock(onChange: () => void) {
  const tick = () => {
    clock = Date.now();
    onChange();
  };
  tick();
  const id = setInterval(tick, 60_000);
  return () => clearInterval(id);
}

export function useNow() {
  return useSyncExternalStore<number | null>(
    subscribeClock,
    () => clock,
    () => null,
  );
}

export function timeAgo(value: DateLike, now: number) {
  const diff = Math.max(0, now - new Date(value).getTime());
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 2) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}

/**
 * The account's license: status, the key, and the machines using it, each
 * removable so a lost or retired computer never holds a seat forever.
 */
export function LicensePanel({
  license,
  since,
  sinceLabel = "since",
  recurring = false,
}: {
  license: PanelLicense;
  since?: DateLike | null;
  sinceLabel?: string;
  recurring?: boolean;
}) {
  const term = license.expiresAt
    ? `Expires ${formatDate(license.expiresAt)}`
    : recurring
      ? "Subscription"
      : "Lifetime license";

  return (
    <>
      <section aria-labelledby="license-title">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="license-title"
              className="text-[15px] leading-6 font-semibold tracking-[-0.01em]"
            >
              Stroke <span className="capitalize">{license.plan}</span>
            </h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {term}
              {since && ` · ${sinceLabel} ${formatDate(since)}`}
            </p>
          </div>
          <Badge tone="success">Active</Badge>
        </div>

        <p className="mt-5 text-[13px] font-medium">License key</p>
        <LicenseKeyField licenseKey={license.licenseKey} />
        <p className="mt-2 text-[13px] text-pretty text-muted-foreground">
          Paste it into <span className="text-foreground">Stroke → Settings → License</span> to
          activate a device.
        </p>
      </section>

      <DeviceList maxDevices={license.maxDevices} />
    </>
  );
}

/** The key, masked until revealed, with a copy button that never changes width. */
function LicenseKeyField({ licenseKey }: { licenseKey: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyKey() {
    await navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    toast.success("License key copied");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-1.5 flex items-start gap-1 rounded-lg border border-border bg-muted/50 p-1 pl-3">
      <code
        className={cn(
          "min-w-0 flex-1 py-1.5 font-mono text-[13px] text-foreground/80",
          revealed ? "break-all" : "truncate tracking-wider",
        )}
      >
        {revealed ? licenseKey : `${licenseKey.slice(0, 6)}${"•".repeat(18)}`}
      </code>
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        aria-label={revealed ? "Hide license key" : "Show license key"}
        aria-pressed={revealed}
        title={revealed ? "Hide key" : "Show key"}
        className={cn(appButton({ variant: "ghost", size: "sm" }), "size-8 px-0")}
      >
        <span className="relative">
          <EyeOffIcon
            className={cn(
              "absolute inset-0 size-4",
              ICON_SWAP,
              revealed ? "blur-0 scale-100 opacity-100" : "scale-[0.25] opacity-0 blur-[4px]",
            )}
          />
          <EyeIcon
            className={cn(
              "size-4",
              ICON_SWAP,
              revealed ? "scale-[0.25] opacity-0 blur-[4px]" : "blur-0 scale-100 opacity-100",
            )}
          />
        </span>
      </button>
      <button
        type="button"
        onClick={copyKey}
        className={cn(appButton({ variant: "secondary", size: "sm" }), "gap-1.5 px-2.5")}
      >
        <span className="relative">
          <CheckIcon
            className={cn(
              "absolute inset-0 size-4 text-emerald-600 dark:text-emerald-400",
              ICON_SWAP,
              copied ? "blur-0 scale-100 opacity-100" : "scale-[0.25] opacity-0 blur-[4px]",
            )}
          />
          <CopyIcon
            className={cn(
              "size-4",
              ICON_SWAP,
              copied ? "scale-[0.25] opacity-0 blur-[4px]" : "blur-0 scale-100 opacity-100",
            )}
          />
        </span>
        {/* Both labels share one grid cell, so the button never changes width. */}
        <span className="grid">
          <span className={cn("col-start-1 row-start-1", copied && "invisible")}>Copy</span>
          <span className={cn("col-start-1 row-start-1", !copied && "invisible")}>Copied</span>
        </span>
      </button>
    </div>
  );
}

/** Seats in use, one row per machine, then the free seats left. */
function DeviceList({ maxDevices }: { maxDevices: number }) {
  const { data: devices, isPending, isError } = useQuery(devicesQueryOptions());
  const now = useNow();
  const used = devices?.length ?? 0;
  const free = Math.max(0, maxDevices - used);

  return (
    <Card aria-labelledby="devices-title">
      <CardHeader
        id="devices-title"
        title="Devices"
        description="Lost a computer? Remove it here and its seat frees up right away."
        action={
          <span className="flex items-center gap-2.5 text-[13px] text-muted-foreground tabular-nums">
            {isPending ? "–" : used} of {maxDevices} in use
            <span aria-hidden="true" className="flex gap-1">
              {Array.from({ length: maxDevices }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 w-4 rounded-full transition-colors",
                    i < used ? "bg-foreground/75" : "bg-foreground/10",
                  )}
                />
              ))}
            </span>
          </span>
        }
      />

      {isPending ? (
        <div aria-hidden="true" className="mt-4 h-14 animate-pulse rounded-lg bg-muted" />
      ) : isError ? (
        <p className="mt-4 text-[13px] text-muted-foreground">
          Couldn't load your devices. Refresh the page to try again.
        </p>
      ) : (
        <ul className={cn("mt-4", ROW_LIST)}>
          {devices.map((d) => (
            <DeviceRow key={d.id} device={d} now={now} />
          ))}
          {Array.from({ length: free }, (_, i) => (
            <li
              key={`free-${i}`}
              className="flex h-14 items-center gap-3 text-[13px] text-muted-foreground"
            >
              <span className="flex w-5 justify-center text-faint">–</span>
              Free seat
            </li>
          ))}
        </ul>
      )}
      <MoreDevices maxDevices={maxDevices} />
    </Card>
  );
}

/**
 * "Need more devices?": a number and a reason, sent for review. A request
 * already waiting says so instead of offering the form again.
 */
function MoreDevices({ maxDevices }: { maxDevices: number }) {
  const queryClient = useQueryClient();
  const { data: pending } = useQuery(deviceRequestQueryOptions());
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(maxDevices + 1);
  const [reason, setReason] = useState("");
  const send = useMutation({
    mutationFn: () => $requestMoreDevices({ data: { requested, reason } }),
    onSuccess: async () => {
      toast.success("Request sent. We'll reply by email.");
      setOpen(false);
      setReason("");
      await queryClient.invalidateQueries({ queryKey: ["billing", "device-request"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't send the request"),
  });

  if (pending) {
    return (
      <p className="mt-4 text-[13px] text-muted-foreground">
        You asked for {pending.requested} devices. We'll get back to you by email.
      </p>
    );
  }
  if (!open) {
    return (
      <button
        type="button"
        className="mt-4 text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        onClick={() => setOpen(true)}
      >
        Need more devices?
      </button>
    );
  }
  return (
    <form
      className="mt-4 flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        send.mutate();
      }}
    >
      <label className="flex items-center gap-3 text-[13px] text-muted-foreground">
        Devices you need
        <select
          value={requested}
          onChange={(e) => setRequested(Number(e.target.value))}
          className="h-8 rounded-md border border-border bg-background px-2 text-[13px] text-foreground"
        >
          {Array.from({ length: 8 }, (_, i) => maxDevices + 1 + i).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="What are the extra devices for? A work and a home machine, a build server, a test VM…"
        rows={3}
        maxLength={1000}
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className={appButton({ size: "sm" })}
          disabled={send.isPending || reason.trim().length < 10}
        >
          {send.isPending && <Loader2Icon className="size-3.5 animate-spin" />}
          Send request
        </button>
        <button
          type="button"
          className={appButton({ variant: "ghost", size: "sm" })}
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export const PLATFORMS: Record<
  DeviceOs,
  { label: string; fallbackName: string; Icon: (p: { className?: string }) => React.ReactNode }
> = {
  macos: { label: "macOS", fallbackName: "Mac", Icon: SiApple },
  windows: { label: "Windows", fallbackName: "Windows PC", Icon: WindowsLogo },
  linux: { label: "Linux", fallbackName: "Linux machine", Icon: SiLinux },
};

type Device = {
  id: string;
  hostname: string | null;
  os: string | null;
  appVersion: string | null;
  activatedAt: DateLike;
  lastSeenAt: DateLike;
};

function DeviceRow({ device, now }: { device: Device; now: number | null }) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const os = parseOs(device.os) ?? guessOs(device.hostname);
  const platform = os ? PLATFORMS[os] : null;
  const name =
    device.hostname && device.hostname !== "unknown"
      ? device.hostname
      : (platform?.fallbackName ?? "Unnamed device");
  const stale = now !== null && now - new Date(device.lastSeenAt).getTime() > STALE_AFTER;
  const seen =
    now === null
      ? `activated ${formatDate(device.activatedAt)}`
      : `last seen ${timeAgo(device.lastSeenAt, now)}`;
  const head = [platform?.label, device.appVersion && `v${device.appVersion}`].filter(Boolean);
  // Sentence case only when the time leads the line ("macOS" keeps its casing).
  const meta = head.length
    ? `${head.join(" · ")} · ${seen}`
    : seen.charAt(0).toUpperCase() + seen.slice(1);

  const remove = useMutation({
    mutationFn: () => $removeDevice({ data: { id: device.id } }),
    onSuccess: async ({ removed }) => {
      await queryClient.invalidateQueries({ queryKey: ["billing", "devices"] });
      if (removed) toast.success(`${name} removed. Its seat is free now.`);
      else toast.error("That device was already removed.");
    },
    onError: () => {
      setConfirming(false);
      toast.error("Couldn't remove the device. Try again.");
    },
  });

  return (
    <li
      className={cn(
        "flex min-h-14 items-center gap-3 py-2.5 transition-colors",
        confirming && "-mx-3 rounded-lg bg-destructive/[0.05] px-3",
      )}
    >
      <span className="flex w-5 shrink-0 justify-center text-foreground/70">
        {platform ? (
          <platform.Icon className="size-3.5" aria-hidden="true" />
        ) : (
          <MonitorIcon className="size-4" strokeWidth={1.75} aria-hidden="true" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[14px] font-medium">
          <span className="truncate">{name}</span>
          {stale && (
            <Badge dot={false} className="h-[18px] px-1.5 text-[11px]">
              Inactive
            </Badge>
          )}
        </p>
        <p
          className="mt-0.5 truncate text-[12px] text-muted-foreground"
          title={confirming ? undefined : `Activated ${formatDate(device.activatedAt)}`}
        >
          {confirming ? "Stroke on this machine signs out the next time it goes online." : meta}
        </p>
      </div>

      {confirming ? (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={remove.isPending}
            className={appButton({ variant: "ghost", size: "sm" })}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => remove.mutate()}
            disabled={remove.isPending}
            className={appButton({ variant: "danger", size: "sm" })}
          >
            {remove.isPending && <Loader2Icon className="size-3.5 motion-safe:animate-spin" />}
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label={`Remove ${name}`}
          className={appButton({ variant: "ghost", size: "sm" })}
        >
          Remove
        </button>
      )}
    </li>
  );
}
