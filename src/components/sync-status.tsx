import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { appButton, Badge, Card, CardHeader } from "#/components/app-ui";
import { formatDate, timeAgo, useNow } from "#/components/license-panel";
import { $resetSync, syncStatusQueryOptions } from "#/lib/sync/functions";
import { cn } from "#/lib/utils";

const KINDS = [
  { kind: "workspace", one: "workspace", many: "workspaces" },
  { kind: "connection", one: "connection", many: "connections" },
  { kind: "settings", one: "settings", many: "settings" },
] as const;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Sync at a glance. Everything synced is end-to-end encrypted, so this shows
 * counts and sizes only; "Reset sync" is for a forgotten passphrase.
 */
export function SyncStatus() {
  const { data: status, isPending, isError } = useQuery(syncStatusQueryOptions());
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const now = useNow();

  const reset = useMutation({
    mutationFn: () => $resetSync(),
    onSuccess: async () => {
      setConfirming(false);
      await queryClient.invalidateQueries({ queryKey: ["sync", "status"] });
      toast.success("Sync reset. Set it up again from the Stroke app.");
    },
    onError: () => toast.error("Couldn't reset sync. Try again."),
  });

  const usedPct = status ? Math.min(100, (status.usedBytes / status.quotaBytes) * 100) : 0;
  const counts = status
    ? KINDS.filter((k) => status.counts[k.kind]).map((k) => {
        const n = status.counts[k.kind]!;
        return k.kind === "settings" ? "settings" : `${n} ${n === 1 ? k.one : k.many}`;
      })
    : [];

  return (
    <Card aria-labelledby="sync-title">
      <CardHeader
        id="sync-title"
        title="Sync"
        description="Workspaces, connections and settings, end-to-end encrypted with your sync passphrase. We can't read them."
        action={
          status && (
            <Badge tone={status.setUp ? "success" : "neutral"}>{status.setUp ? "On" : "Off"}</Badge>
          )
        }
      />

      {isPending ? (
        <div aria-hidden="true" className="mt-4 h-14 animate-pulse rounded-lg bg-muted" />
      ) : isError ? (
        <p className="mt-4 text-[13px] text-muted-foreground">
          Couldn't load sync status. Refresh the page to try again.
        </p>
      ) : !status.setUp ? (
        <p className="mt-4 text-[13px] text-pretty text-muted-foreground">
          Not set up. Turn on sync in the Stroke app to keep your workspaces and connections on
          every device.
        </p>
      ) : (
        <>
          <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 text-[13px] sm:grid-cols-3">
            <div className="min-w-0">
              <dt className="text-muted-foreground">Last activity</dt>
              <dd
                className="mt-0.5 truncate font-medium"
                title={status.lastActivity ? formatDate(status.lastActivity) : undefined}
              >
                {!status.lastActivity
                  ? "Nothing synced yet"
                  : now === null
                    ? formatDate(status.lastActivity)
                    : timeAgo(status.lastActivity, now)}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-muted-foreground">Synced</dt>
              <dd className="mt-0.5 font-medium text-pretty">
                {counts.length ? counts.join(" · ") : "Nothing yet"}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-muted-foreground">Storage</dt>
              <dd className="mt-0.5 font-medium tabular-nums">
                {formatBytes(status.usedBytes)}{" "}
                <span className="font-normal text-muted-foreground">
                  of {formatBytes(status.quotaBytes)}
                </span>
              </dd>
              <div aria-hidden="true" className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    usedPct > 90 ? "bg-destructive" : "bg-foreground/60",
                  )}
                  style={{ width: `${Math.max(usedPct, usedPct > 0 ? 1 : 0)}%` }}
                />
              </div>
            </div>
          </dl>

          <div
            className={cn(
              "mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[13px] text-muted-foreground transition-colors",
              confirming && "-mx-3 rounded-lg bg-destructive/[0.05] px-3 py-2.5",
            )}
          >
            <p className="min-w-0 flex-1 text-pretty">
              {confirming
                ? "This deletes everything synced and the sync key. Your devices keep their own data and can set sync up again."
                : "Forgot your sync passphrase? Reset sync and set it up again from the app."}
            </p>
            {confirming ? (
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={reset.isPending}
                  className={appButton({ variant: "ghost", size: "sm" })}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => reset.mutate()}
                  disabled={reset.isPending}
                  className={appButton({ variant: "danger", size: "sm" })}
                >
                  {reset.isPending && <Loader2Icon className="size-3.5 motion-safe:animate-spin" />}
                  Reset sync
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className={appButton({ variant: "secondary", size: "sm" })}
              >
                Reset sync
              </button>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
