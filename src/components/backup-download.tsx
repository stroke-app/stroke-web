import { DownloadIcon, Loader2Icon, LockKeyholeIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { appButton } from "#/components/app-ui";
import { decryptBackup, type Kdf, unb64, unlockSyncKey } from "#/lib/backups/crypto";

/**
 * Download a scheduled backup. Encrypted ones are fetched as ciphertext and
 * opened here in the browser with the sync passphrase; the passphrase and the
 * unlocked key never leave this tab. The key is kept in memory until the tab
 * closes, so a second download doesn't ask again.
 */

let unlocked: Uint8Array | null = null;

type RunLike = {
  id: string;
  encrypted?: boolean;
  wrapped_key?: string | null;
  started_at: number;
};

function fileName(label: string, startedAt: number) {
  const stamp = new Date(startedAt).toISOString().slice(0, 16).replace(/[:T]/g, "-");
  return `${label.replace(/[^\w.-]+/g, "-")}-${stamp}.sql.gz`;
}

function save(parts: Uint8Array[], name: string) {
  const url = URL.createObjectURL(new Blob(parts as BlobPart[], { type: "application/gzip" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

async function openAndSave(key: Uint8Array, run: RunLike, label: string) {
  const res = await fetch(`/api/backups/runs/${run.id}/download`, { credentials: "include" });
  if (!res.ok) throw new Error("Couldn't fetch the backup. Try again.");
  const file = new Uint8Array(await res.arrayBuffer());
  const parts = decryptBackup(key, file, run.wrapped_key ? unb64(run.wrapped_key) : undefined);
  save(parts, fileName(label, run.started_at));
}

export function BackupDownload({
  run,
  label,
  ariaLabel,
}: {
  run: RunLike;
  label: string;
  ariaLabel: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState("");

  if (!run.encrypted) {
    return (
      <a
        href={`/api/backups/runs/${run.id}/download`}
        className={appButton({ variant: "secondary", size: "sm" })}
        aria-label={ariaLabel}
      >
        <DownloadIcon className="size-3.5" aria-hidden="true" />
        <span className="max-sm:sr-only">Download</span>
      </a>
    );
  }

  async function start() {
    if (!unlocked) {
      setError(null);
      dialog.current?.showModal();
      return;
    }
    setBusy(true);
    try {
      await openAndSave(unlocked, run, label);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't open the backup.");
    } finally {
      setBusy(false);
    }
  }

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !passphrase) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/backups/sync-key", { credentials: "include" });
      if (!res.ok) throw new Error("Sync isn't set up for this account.");
      const k = (await res.json()) as { wrapped_key: string; kdf: Kdf };
      const key = await unlockSyncKey(passphrase, k.wrapped_key, k.kdf);
      await openAndSave(key, run, label);
      unlocked = key;
      setPassphrase("");
      dialog.current?.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't open the backup.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void start()}
        disabled={busy}
        className={appButton({ variant: "secondary", size: "sm" })}
        aria-label={ariaLabel}
      >
        {busy ? (
          <Loader2Icon className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <DownloadIcon className="size-3.5" aria-hidden="true" />
        )}
        <span className="max-sm:sr-only">Download</span>
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={`unlock-${run.id}`}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-xl bg-background p-0 text-foreground shadow-[0_0_0_1px_var(--border),0_30px_80px_-20px_rgb(0_0_0/0.6)] backdrop:bg-black/60"
      >
        <form onSubmit={(e) => void unlock(e)} className="p-6">
          <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <LockKeyholeIcon className="size-4" aria-hidden="true" />
          </span>
          <h2 id={`unlock-${run.id}`} className="mt-4 text-[17px] font-semibold tracking-[-0.01em]">
            Unlock your backups
          </h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-pretty text-muted-foreground">
            They're encrypted with your sync key. Enter your sync passphrase: it's checked here in
            your browser and never sent to Stroke.
          </p>
          <label className="mt-5 block">
            <span className="sr-only">Sync passphrase</span>
            <input
              type="password"
              autoComplete="current-password"
              autoFocus
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Sync passphrase"
              aria-invalid={!!error || undefined}
              aria-describedby={error ? `unlock-err-${run.id}` : undefined}
              className="h-10 w-full rounded-[24px] bg-card px-3 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          {error && (
            <p
              id={`unlock-err-${run.id}`}
              role="alert"
              className="mt-2 text-[13px] text-destructive"
            >
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className={appButton({ variant: "ghost", size: "sm" })}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !passphrase}
              className={appButton({ size: "sm" })}
            >
              {busy && <Loader2Icon className="size-3.5 animate-spin" aria-hidden="true" />}
              {busy ? "Decrypting" : "Unlock and download"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
