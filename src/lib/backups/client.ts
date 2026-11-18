import { queryOptions } from "@tanstack/react-query";

/** What GET /api/backups/jobs returns (see src/lib/backups/service.ts). */
export type BackupRun = {
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

export type BackupJob = {
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
  runs: BackupRun[];
};

export type BackupOverview = {
  jobs: BackupJob[];
  max_jobs: number;
  used_bytes: number;
  quota_bytes: number;
  pro: boolean;
};

export const BACKUPS_KEY = ["backups", "jobs"];

export async function backupsApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    ...init,
    headers: init?.body ? { "content-type": "application/json" } : undefined,
  });
  const body = (await res.json().catch(() => null)) as (T & { message?: string }) | null;
  if (!res.ok) throw new Error(body?.message ?? `Request failed (${res.status}).`);
  return body as T;
}

export const backupsQueryOptions = () =>
  queryOptions({
    queryKey: BACKUPS_KEY,
    queryFn: () => backupsApi<BackupOverview>("/api/backups/jobs"),
    refetchInterval: 30_000,
  });

export function formatBytes(n: number) {
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
