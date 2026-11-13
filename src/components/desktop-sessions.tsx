import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, MonitorIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { appButton, Card, CardHeader, ROW_LIST } from "#/components/app-ui";
import { formatDate, PLATFORMS, timeAgo, useNow } from "#/components/license-panel";
import { $revokeDesktopSession, desktopSessionsQueryOptions } from "#/lib/desktop/functions";
import { parseOs } from "#/lib/license/platform";
import { cn } from "#/lib/utils";

type Session = {
  id: string;
  deviceName: string | null;
  os: string | null;
  version: string | null;
  createdAt: string | number | Date;
  lastSeenAt: string | number | Date;
};

/** Desktop apps signed in to this account, each one signable-out from here. */
export function DesktopSessions() {
  const { data: sessions, isPending, isError } = useQuery(desktopSessionsQueryOptions());
  const now = useNow();

  return (
    <Card aria-labelledby="signed-in-devices-title">
      <CardHeader
        id="signed-in-devices-title"
        title="Signed-in devices"
        description="Where Stroke is signed in to your account. Sign a device out and it loses access the next time it goes online."
      />

      {isPending ? (
        <div aria-hidden="true" className="mt-4 h-14 animate-pulse rounded-lg bg-muted" />
      ) : isError ? (
        <p className="mt-4 text-[13px] text-muted-foreground">
          Couldn't load your devices. Refresh the page to try again.
        </p>
      ) : sessions.length === 0 ? (
        <p className="mt-4 text-[13px] text-muted-foreground">
          No devices yet. Choose Sign in in the Stroke app to add one.
        </p>
      ) : (
        <ul className={cn("mt-4", ROW_LIST)}>
          {sessions.map((s) => (
            <SessionRow key={s.id} session={s} now={now} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function SessionRow({ session, now }: { session: Session; now: number | null }) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const os = parseOs(session.os);
  const platform = os ? PLATFORMS[os] : null;
  const name = session.deviceName || platform?.fallbackName || "Unnamed device";
  const seen =
    now === null
      ? `signed in ${formatDate(session.createdAt)}`
      : `last seen ${timeAgo(session.lastSeenAt, now)}`;
  const head = [platform?.label, session.version && `v${session.version}`].filter(Boolean);
  const meta = head.length
    ? `${head.join(" · ")} · ${seen}`
    : seen.charAt(0).toUpperCase() + seen.slice(1);

  const revoke = useMutation({
    mutationFn: () => $revokeDesktopSession({ data: { id: session.id } }),
    onSuccess: async ({ revoked }) => {
      await queryClient.invalidateQueries({ queryKey: ["desktop", "sessions"] });
      if (revoked) toast.success(`${name} signed out.`);
      else toast.error("That device was already signed out.");
    },
    onError: () => {
      setConfirming(false);
      toast.error("Couldn't sign the device out. Try again.");
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
        <p className="truncate text-[14px] font-medium">{name}</p>
        <p
          className="mt-0.5 truncate text-[12px] text-muted-foreground"
          title={confirming ? undefined : `Signed in ${formatDate(session.createdAt)}`}
        >
          {confirming ? "Stroke on this device signs out the next time it goes online." : meta}
        </p>
      </div>

      {confirming ? (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={revoke.isPending}
            className={appButton({ variant: "ghost", size: "sm" })}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => revoke.mutate()}
            disabled={revoke.isPending}
            className={appButton({ variant: "danger", size: "sm" })}
          >
            {revoke.isPending && <Loader2Icon className="size-3.5 motion-safe:animate-spin" />}
            Sign out
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label={`Sign out ${name}`}
          className={appButton({ variant: "ghost", size: "sm" })}
        >
          Sign out
        </button>
      )}
    </li>
  );
}
