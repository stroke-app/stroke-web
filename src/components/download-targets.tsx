import { SiApple, SiLinux } from "@icons-pack/react-simple-icons";
import {
  AppWindowIcon,
  BoxIcon,
  CheckIcon,
  CopyIcon,
  CpuIcon,
  MicrochipIcon,
  PackageIcon,
} from "lucide-react";
import { useState } from "react";

import { buttonVariants } from "#/components/ui/button";
import {
  type DownloadTarget,
  findAsset,
  formatBytes,
  type GitHubRelease,
  type OS,
} from "#/lib/releases";
import { cn } from "#/lib/utils";

export function WindowsLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M0 3.45 9.75 2.1v9.45H0zm10.95-1.5L24 0v11.55H10.95zM0 12.45h9.75v9.45L0 20.55zm10.95 0H24V24l-13.05-1.95z" />
    </svg>
  );
}

export const OS_ROWS: {
  os: OS;
  name: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { os: "macos", name: "macOS", Icon: SiApple },
  { os: "windows", name: "Windows", Icon: WindowsLogo },
  { os: "linux", name: "Linux", Icon: SiLinux },
];

const TARGET_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "mac-arm": CpuIcon,
  "mac-intel": MicrochipIcon,
  "win-exe": AppWindowIcon,
  "win-msi": PackageIcon,
  "linux-appimage": BoxIcon,
  "linux-deb": PackageIcon,
  "linux-rpm": PackageIcon,
};

export function CommandCard({ label, command }: { label: string; command: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-lg border border-border/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : `Copy ${label} command`}
          className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {copied ? (
            <CheckIcon className="size-3.5 text-copper" />
          ) : (
            <CopyIcon className="size-3.5" />
          )}
        </button>
      </div>
      <pre className="mt-2 overflow-x-auto font-mono text-[12px] leading-relaxed">
        <code>{command}</code>
      </pre>
    </div>
  );
}

export function TargetButton({
  target,
  release,
  detected,
}: {
  target: DownloadTarget;
  release: GitHubRelease;
  detected: boolean;
}) {
  const asset = findAsset(release.assets, target);
  if (!asset) return null;

  const Icon = TARGET_ICONS[target.key];

  return (
    <a
      href={asset.browser_download_url}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        detected && "border-copper/60 text-foreground",
      )}
      title={asset.name}
    >
      {Icon && <Icon className="size-3.5 text-muted-foreground" />}
      {target.label}
      <span className="text-[11px] text-muted-foreground">{formatBytes(asset.size)}</span>
      {detected && (
        <span className="font-mono text-[10px] tracking-wide text-copper uppercase">for you</span>
      )}
    </a>
  );
}
