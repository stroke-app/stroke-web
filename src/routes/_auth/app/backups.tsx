import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  CloudIcon,
  DatabaseIcon,
  DownloadIcon,
  Loader2Icon,
  PauseIcon,
  PlayIcon,
  RotateCwIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { appButton, Badge, Card, CardHeader, PageHeader, ROW_LIST } from "#/components/app-ui";
import { timeAgo, useNow } from "#/components/license-panel";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/_auth/app/backups")({
  component: BackupsPage,
});

type Run = {
  id: string;
  status: "running" | "success" | "failed";
  destination: "stroke" | "s3";
  object_key: string | null;
  bytes: number;
  tables: number;
  rows: number;
  error: string | null;
  device_name: string | null;
  started_at: number;
  finished_at: number | null;
};

type Job = {
  id: string;
  label: string;
  driver: string;
  cron: string;
  timezone: string;
  destination: "stroke" | "s3";
  s3_bucket: string | null;
  keep: number;
  enabled: boolean;
  run_requested_at: number | null;
  next_run_at: number | null;
  runs: Run[];
};

type Overview = {
  jobs: Job[];
  max_jobs: number;
  used_bytes: number;
  quota_bytes: number;
  pro: boolean;
};

const QUERY_KEY = ["backups", "jobs"];

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    ...init,
    headers: init?.body ? { "content-type": "application/json" } : undefined,
  });
  const body = (await res.json().catch(() => null)) as (T & { message?: string }) | null;
  if (!res.ok) throw new Error(body?.message ?? `Request failed (${res.status}).`);
  return body as T;
}

const DRIVER_NAMES: Record<string, string> = {
  postgres: "PostgreSQL",
  mysql: "MySQL",
  sqlite: "SQLite",
  d1: "Cloudflare D1",
  libsql: "Turso / libSQL",
  duckdb: "DuckDB",
  mssql: "SQL Server",
};

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
}

/** "0 3 * * *" → "Every day at 03:00"; anything else shows the cron itself. */
function describeCron(cron: string) {
  const [min, hour, dom, mon, dow] = cron.trim().split(/\s+/);
  const at = (h: string, m: string) => `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  const num = /^\d+$/;
  if (num.test(min ?? "") && hour === "*" && dom === "*" && mon === "*" && dow === "*") {
    return `Every hour at :${min!.padStart(2, "0")}`;
  }
  if (num.test(min ?? "") && num.test(hour ?? "") && mon === "*") {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (dom === "*" && dow === "*") return `Every day at ${at(hour!, min!)}`;
    if (dom === "*" && num.test(dow ?? "") && days[Number(dow) % 7]) {
      return `Every ${days[Number(dow) % 7]} at ${at(hour!, min!)}`;
    }
    if (num.test(dom ?? "") && dow === "*")
      return `Day ${dom} of every month at ${at(hour!, min!)}`;
  }
  return cron;
}

function formatWhen(ms: number) {
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function BackupsPage() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => api<Overview>("/api/backups/jobs"),
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-10">
      <PageHeader
        title="Backups"
        description="Scheduled backups of your databases. The Stroke app runs them on the computer that has the connection, so your database passwords never leave it."
      />

      {isPending ? (
        <div aria-hidden="true" className="h-24 animate-pulse rounded-lg bg-muted" />
      ) : isError ? (
        <p className="text-[13px] text-muted-foreground">
          {error instanceof Error ? error.message : "Couldn't load your backups."} Refresh the page
          to try again.
        </p>
      ) : (
        <>
          <Usage data={data} />
          {data.jobs.length === 0 ? (
            <EmptyState pro={data.pro} />
          ) : (
            data.jobs.map((job) => <JobSection key={job.id} job={job} pro={data.pro} />)
          )}
        </>
      )}
    </div>
  );
}

function Usage({ data }: { data: Overview }) {
  const pct = Math.min(100, (data.used_bytes / data.quota_bytes) * 100);
  return (
    <dl className="grid grid-cols-2 gap-6 sm:max-w-md">
      <div>
        <dt className="text-[13px] text-muted-foreground">Scheduled backups</dt>
        <dd className="mt-1 text-[15px] font-medium tabular-nums">
          {data.jobs.length} of {data.max_jobs}
        </dd>
      </div>
      <div>
        <dt className="text-[13px] text-muted-foreground">Stroke Cloud storage</dt>
        <dd className="mt-1 text-[15px] font-medium tabular-nums">
          {formatBytes(data.used_bytes)} of {formatBytes(data.quota_bytes)}
        </dd>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
          role="meter"
          aria-label="Stroke Cloud storage used"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
        >
          <div
            className={cn("h-full rounded-full", pct > 90 ? "bg-destructive" : "bg-primary")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </dl>
  );
}

function EmptyState({ pro }: { pro: boolean }) {
  return (
    <Card>
      <CardHeader
        title="No scheduled backups yet"
        description={
          pro
            ? "In the Stroke app, open a database, go to Backup, and add a schedule under Scheduled backups. It shows up here once saved."
            : "Scheduled backups are part of Stroke Pro. Get Pro on the Plan & billing tab, then add a schedule from the Stroke app."
        }
      />
    </Card>
  );
}

function JobSection({ job, pro }: { job: Job; pro: boolean }) {
  const queryClient = useQueryClient();
  const now = useNow();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const update = (data: Overview) => queryClient.setQueryData(QUERY_KEY, data);

  const patch = useMutation({
    mutationFn: (body: { enabled?: boolean; run_now?: boolean }) =>
      api<Overview>(`/api/backups/jobs/${job.id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: (data, body) => {
      update(data);
      if (body.run_now)
        toast.success(
          "Asked the Stroke app to run it. It starts within a minute or two while the app is open.",
        );
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "That didn't work. Try again."),
  });
  const remove = useMutation({
    mutationFn: () => api<Overview>(`/api/backups/jobs/${job.id}`, { method: "DELETE" }),
    onSuccess: (data) => {
      update(data);
      toast.success(`Deleted the schedule for ${job.label}.`);
    },
    onError: (e) => {
      setConfirmDelete(false);
      toast.error(e instanceof Error ? e.message : "Couldn't delete it. Try again.");
    },
  });

  const where =
    job.destination === "s3" ? `Your S3 bucket ${job.s3_bucket ?? ""}`.trim() : "Stroke Cloud";
  const meta = [
    DRIVER_NAMES[job.driver] ?? job.driver,
    describeCron(job.cron),
    job.timezone,
    where,
    job.destination === "stroke" ? `keeps ${job.keep}` : null,
  ].filter(Boolean);

  return (
    <Card aria-labelledby={`job-${job.id}`}>
      <CardHeader
        id={`job-${job.id}`}
        title={
          <span className="flex items-center gap-2">
            <DatabaseIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="truncate">{job.label}</span>
            {!job.enabled && (
              <Badge tone="neutral" dot={false}>
                Paused
              </Badge>
            )}
          </span>
        }
        description={
          <>
            {meta.join(" · ")}
            {job.enabled && job.next_run_at && (
              <>
                <br />
                Next run {formatWhen(job.next_run_at)}
                {job.run_requested_at ? ", and one requested now" : ""}
              </>
            )}
          </>
        }
        action={
          <>
            <button
              type="button"
              className={appButton({ variant: "secondary", size: "sm" })}
              disabled={!pro || patch.isPending || !!job.run_requested_at}
              onClick={() => patch.mutate({ run_now: true })}
            >
              <PlayIcon className="size-3.5" aria-hidden="true" />
              {job.run_requested_at ? "Requested" : "Run now"}
            </button>
            <button
              type="button"
              className={appButton({ variant: "ghost", size: "sm" })}
              disabled={patch.isPending}
              onClick={() => patch.mutate({ enabled: !job.enabled })}
            >
              {job.enabled ? (
                <PauseIcon className="size-3.5" aria-hidden="true" />
              ) : (
                <RotateCwIcon className="size-3.5" aria-hidden="true" />
              )}
              {job.enabled ? "Pause" : "Resume"}
            </button>
            {confirmDelete ? (
              <button
                type="button"
                className={appButton({ variant: "danger", size: "sm" })}
                disabled={remove.isPending}
                onClick={() => remove.mutate()}
              >
                {remove.isPending && <Loader2Icon className="size-3.5 animate-spin" />}
                Delete with its backups
              </button>
            ) : (
              <button
                type="button"
                aria-label={`Delete the schedule for ${job.label}`}
                className={appButton({ variant: "ghost", size: "sm" })}
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2Icon className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </>
        }
      />
      {job.runs.length === 0 ? (
        <p className="mt-4 text-[13px] text-muted-foreground">No runs yet.</p>
      ) : (
        <ul className={cn("mt-4", ROW_LIST)}>
          {job.runs.map((run) => (
            <RunRow key={run.id} run={run} now={now} onChange={update} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function RunRow({
  run,
  now,
  onChange,
}: {
  run: Run;
  now: number | null;
  onChange: (data: Overview) => void;
}) {
  const remove = useMutation({
    mutationFn: () => api<Overview>(`/api/backups/runs/${run.id}`, { method: "DELETE" }),
    onSuccess: onChange,
    onError: () => toast.error("Couldn't delete that backup. Try again."),
  });
  const when = now === null ? formatWhen(run.started_at) : timeAgo(run.started_at, now);
  const detail =
    run.status === "success"
      ? [
          formatBytes(run.bytes),
          `${run.tables} ${run.tables === 1 ? "table" : "tables"}`,
          `${run.rows.toLocaleString("en-US")} rows`,
        ]
      : run.status === "failed"
        ? [run.error ?? "Failed"]
        : ["Running"];

  return (
    <li className="flex items-center gap-3 py-3">
      {run.status === "running" ? (
        <Loader2Icon
          className="size-4 shrink-0 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
      ) : run.destination === "stroke" ? (
        <CloudIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      ) : (
        <DatabaseIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[14px]">
          <span title={new Date(run.started_at).toLocaleString()}>{when}</span>
          {run.status === "failed" && <Badge tone="danger">Failed</Badge>}
        </p>
        <p
          className={cn(
            "truncate text-[13px] text-muted-foreground",
            run.status === "failed" && "text-destructive",
          )}
          title={detail.join(" · ")}
        >
          {detail.join(" · ")}
          {run.device_name ? ` · ${run.device_name}` : ""}
          {run.destination === "s3" && run.object_key ? ` · ${run.object_key}` : ""}
        </p>
      </div>
      {run.status === "success" && run.destination === "stroke" && (
        <a
          href={`/api/backups/runs/${run.id}/download`}
          className={appButton({ variant: "secondary", size: "sm" })}
          aria-label={`Download the backup from ${formatWhen(run.started_at)}`}
        >
          <DownloadIcon className="size-3.5" aria-hidden="true" />
          <span className="max-sm:sr-only">Download</span>
        </a>
      )}
      {run.status !== "running" && (
        <button
          type="button"
          className={appButton({ variant: "ghost", size: "sm" })}
          aria-label={`Delete the backup from ${formatWhen(run.started_at)}`}
          disabled={remove.isPending}
          onClick={() => remove.mutate()}
        >
          <Trash2Icon className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </li>
  );
}
