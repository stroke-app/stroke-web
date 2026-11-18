import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, MonitorIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { appButton, Card, CardHeader, ROW_LIST } from "#/components/app-ui";
import { PLATFORMS, timeAgo, useNow } from "#/components/license-panel";
import { $removeAccountDevice, accountDevicesQueryOptions } from "#/lib/desktop/functions";
import type { AccountDevice } from "#/lib/desktop/service";
import { guessOs, parseOs } from "#/lib/license/platform";
import { cn } from "#/lib/utils";

const DAY = 24 * 60 * 60 * 1000;
/** Not seen for this long: shown as inactive, a likely candidate to remove. */
const STALE_AFTER = 30 * DAY;

/** "2.18.7-nightly.202611171232" → "2.18.7 Nightly". */
function formatVersion(v: string) {
  const [base, channel] = v.split("-");
  return channel?.startsWith("nightly") ? `${base} Nightly` : base;
}

/**
 * Every computer using Stroke with this account, once each: signed in (v3) or
 * holding the 2.x license key, matched by device id. Removing one signs it
 * out and frees its seat.
 */
export function AccountDevices({
  maxDevices,
  children,
}: {
  /** The license's seat count, when the account has a license. */
  maxDevices?: number;
  /** Extra content under the list, such as "Need more devices?". */
  children?: React.ReactNode;
}) {
  const { data: devices, isPending, isError } = useQuery(accountDevicesQueryOptions());
  const now = useNow();
  const seats = devices?.filter((d) => d.licenseKey).length ?? 0;

  return (
    <Card aria-labelledby="devices-title">
      <CardHeader
        id="devices-title"
        title="Devices"
        description="Every computer using Stroke with your account. Remove one you no longer use and it signs out the next time it goes online."
        action={
          maxDevices && seats > 0 ? (
            <span
              className="text-[13px] text-muted-foreground tabular-nums"
              title="Stroke 2.x uses a license key, and each computer holding it takes a seat. Signing in (Stroke 3) doesn't."
            >
              {seats} of {maxDevices} key seats
            </span>
          ) : undefined
        }
      />

      {isPending ? (
        <div aria-hidden="true" className="mt-4 h-16 animate-pulse rounded-lg bg-muted" />
      ) : isError ? (
        <p className="mt-4 text-[13px] text-muted-foreground">
          Couldn't load your devices. Refresh the page to try again.
        </p>
      ) : devices.length === 0 ? (
        <p className="mt-4 text-[13px] text-muted-foreground">
          No computers yet. Sign in from the Stroke app and it shows up here.
        </p>
      ) : (
        <ul className={cn("mt-4", ROW_LIST)}>
          {devices.map((d) => (
            <DeviceRow key={d.deviceId} device={d} now={now} />
          ))}
        </ul>
      )}
      {children}
    </Card>
  );
}

function DeviceRow({ device, now }: { device: AccountDevice; now: number | null }) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const os = parseOs(device.os) ?? guessOs(device.name);
  const platform = os ? PLATFORMS[os] : null;
  const name = device.name || platform?.fallbackName || "Unnamed computer";
  const stale = now !== null && now - device.lastSeenAt > STALE_AFTER;
  const seen = now === null ? null : `active ${timeAgo(device.lastSeenAt, now)}`;
  const meta = [platform?.label, device.version && formatVersion(device.version), seen]
    .filter(Boolean)
    .join(" · ");
  const how = [device.signedIn && "Signed in", device.licenseKey && "License key"]
    .filter(Boolean)
    .join(" and ");

  const remove = useMutation({
    mutationFn: () => $removeAccountDevice({ data: { deviceId: device.deviceId } }),
    onSuccess: async ({ removed }) => {
      await queryClient.invalidateQueries({ queryKey: ["account", "devices"] });
      if (removed) toast.success(`${name} removed.`);
      else toast.error("That computer was already removed.");
    },
    onError: () => {
      setConfirming(false);
      toast.error("Couldn't remove it. Try again.");
    },
  });

  return (
    <li className="flex min-h-[68px] items-center gap-3.5 py-3">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/75",
          stale && "text-muted-foreground",
        )}
      >
        {platform ? (
          <platform.Icon className="size-4" aria-hidden="true" />
        ) : (
          <MonitorIcon className="size-4" strokeWidth={1.75} aria-hidden="true" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2">
          <span
            className={cn("truncate text-[14px] font-medium", stale && "text-muted-foreground")}
          >
            {name}
          </span>
          {stale && (
            <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              Inactive
            </span>
          )}
        </p>
        {confirming ? (
          <p className="mt-0.5 text-[13px] text-pretty text-muted-foreground">
            Signs it out{device.licenseKey ? " and frees its license seat" : ""}. Your data on it
            stays.
          </p>
        ) : (
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground" title={meta}>
            {meta}
            {how && <span className="max-sm:hidden"> · {how}</span>}
          </p>
        )}
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
