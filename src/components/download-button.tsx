import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckIcon, CopyIcon, DownloadIcon, MonitorIcon } from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";

import { buttonVariants } from "#/components/ui/button";
import { type LatestRelease, latestReleaseQueryOptions } from "#/lib/latest-release";
import {
  type Arch,
  formatBytes,
  getDownloadAsset,
  type OS,
  type Platform,
  usePlatform,
} from "#/lib/releases";
import { cn } from "#/lib/utils";

interface DownloadButtonProps {
  size?: "lg" | "default" | "sm";
  variant?: "default" | "outline";
  /** Aligns the button and the alternate-download line beneath it. */
  align?: "start" | "center";
  /**
   * Show the line of other formats (.deb/.rpm, the other Mac chip) under the
   * button. Off where the button sits in a busy CTA row.
   */
  alternates?: boolean;
  /**
   * Offer this OS whatever the visitor runs (the per-OS download pages). The
   * detected architecture is kept when it matches; otherwise the common one.
   */
  os?: OS;
  className?: string;
}

const DEFAULT_PLATFORM: Record<OS, Platform> = {
  macos: { os: "macos", arch: "arm64", label: "macOS (Apple Silicon)" },
  windows: { os: "windows", arch: "x64", label: "Windows" },
  linux: { os: "linux", arch: "x64", label: "Linux" },
};

const OS_NAME: Record<OS, string> = { macos: "macOS", windows: "Windows", linux: "Linux" };

/**
 * Inside the marketing site (`.site`) the button takes the site's look: Linear's
 * pill buttons, the same fills and heights as `siteButton`. The signed-in app keeps
 * the shadcn button it sits beside.
 */
const SITE_LOOK = {
  base: "[.site_&]:rounded-full [.site_&]:font-[510] [.site_&]:active:scale-[0.97]",
  default:
    "[.site_&]:border-transparent [.site_&]:bg-none [.site_&]:bg-[#e5e5e6] [.site_&]:text-[#08090a] [.site_&]:shadow-none [.site_&]:hover:bg-white",
  outline:
    "[.site_&]:border-transparent [.site_&]:bg-white/[0.05] [.site_&]:text-foreground [.site_&]:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.03),inset_0_1px_0_rgb(255_255_255/0.04),0_0_0_1px_rgb(0_0_0/0.6),0_4px_4px_rgb(0_0_0/0.1)] [.site_&]:hover:bg-[#191a1b]",
  lg: "[.site_&]:h-11 [.site_&]:px-5 [.site_&]:text-[15px]",
  sm: "[.site_&]:h-8 [.site_&]:text-[13px]",
};

export function SmartDownloadButton({
  size = "lg",
  variant = "outline",
  align = "start",
  alternates = true,
  os,
  className,
}: DownloadButtonProps) {
  const detected = usePlatform();
  const { data: release } = useQuery(latestReleaseQueryOptions());

  const platform = os ? (detected?.os === os ? detected : DEFAULT_PLATFORM[os]) : detected;
  const asset =
    platform && release ? getDownloadAsset(release.assets, platform.os, platform.arch) : null;

  const version = release?.tag_name;
  const classes = cn(
    buttonVariants({ variant, size }),
    "max-w-full",
    SITE_LOOK.base,
    SITE_LOOK[variant],
    size !== "default" && SITE_LOOK[size],
    className,
  );

  return (
    <div
      className={cn(
        "flex max-w-full min-w-0 flex-col gap-2",
        align === "center" ? "items-center" : "items-start",
      )}
    >
      {platform && asset ? (
        <a
          href={asset.browser_download_url}
          onClick={() =>
            posthog.capture("download_clicked", {
              os: platform.os,
              arch: platform.arch,
              version,
              asset: asset.name,
            })
          }
          className={classes}
        >
          <ButtonLabel
            text={`Download for ${OS_NAME[platform.os]}`}
            detail={
              platform.os === "macos"
                ? platform.arch === "arm64"
                  ? "Apple Silicon"
                  : "Intel"
                : null
            }
            version={version}
          />
        </a>
      ) : (
        // No detection yet or no matching asset, so send them to the download page
        <Link to="/download" className={classes}>
          <ButtonLabel text="Download" version={version} />
        </Link>
      )}
      {/* Reserved line so the layout doesn't jump when the alternate link appears */}
      {alternates && (
        <div className="min-h-4">
          {platform && release && <AlternateDownloadLink platform={platform} release={release} />}
        </div>
      )}
    </div>
  );
}

/**
 * The label fits whatever room it gets: the chip detail and version sit on a
 * one-line row that wraps onto a clipped second line, so in a narrow button
 * the version goes first, then the chip. Phones skip both.
 */
function ButtonLabel({
  text,
  detail,
  version,
}: {
  text: string;
  detail?: string | null;
  version?: string;
}) {
  return (
    <span className="flex h-5 min-w-0 flex-wrap items-baseline justify-center gap-x-[0.3em] overflow-hidden leading-5">
      {/* The icon rides with the first piece so the visible line centers as one. */}
      <span className="flex min-w-0 items-center gap-1.5 self-center">
        <DownloadIcon className="size-4" />
        <span className="truncate">{text}</span>
      </span>
      {detail && <span className="max-sm:hidden">({detail})</span>}
      {version && <span className="ml-1 text-xs opacity-70 max-sm:hidden">{version}</span>}
    </span>
  );
}

function AlternateDownloadLink({
  platform,
  release,
}: {
  platform: Platform;
  release: LatestRelease;
}) {
  if (platform.os === "macos") {
    const altArch: Arch = platform.arch === "arm64" ? "x64" : "arm64";
    const altAsset = getDownloadAsset(release.assets, "macos", altArch);
    if (!altAsset) return null;
    return (
      <a
        href={altAsset.browser_download_url}
        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <MonitorIcon className="size-3" />
        Download for macOS ({altArch === "arm64" ? "Apple Silicon" : "Intel"}) instead
      </a>
    );
  }

  if (platform.os === "linux") {
    const deb = release.assets.find((a) => a.name.endsWith(".deb"));
    const rpm = release.assets.find((a) => a.name.endsWith(".rpm"));
    return (
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {deb && (
          <a href={deb.browser_download_url} className="transition-colors hover:text-foreground">
            .deb ({formatBytes(deb.size)})
          </a>
        )}
        {rpm && (
          <a href={rpm.browser_download_url} className="transition-colors hover:text-foreground">
            .rpm ({formatBytes(rpm.size)})
          </a>
        )}
        <Link to="/download" className="transition-colors hover:text-foreground">
          All downloads
        </Link>
      </div>
    );
  }

  return (
    <Link
      to="/download"
      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      All platforms and formats
    </Link>
  );
}

const BREW_COMMAND = "brew install --cask stroke-app/tap/stroke";

/**
 * The Homebrew install line, shown to Mac visitors only (platform is detected
 * after hydration, so it never renders on the server or for other systems).
 */
export function BrewCommand({ className }: { className?: string }) {
  const platform = usePlatform();
  const [copied, setCopied] = useState(false);

  if (platform?.os !== "macos") return null;

  const copy = async () => {
    await navigator.clipboard.writeText(BREW_COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className={cn(
        "animate-fade-up flex h-10 max-w-full items-center gap-3 rounded-lg border border-border bg-white/[0.03] pr-1 pl-3.5 font-mono text-[13px]",
        className,
      )}
    >
      <span aria-hidden="true" className="text-faint select-none">
        $
      </span>
      <code className="truncate text-soft">{BREW_COMMAND}</code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy the Homebrew install command"}
        className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
      >
        {copied ? (
          <CheckIcon className="size-3.5 text-foreground" strokeWidth={2.5} />
        ) : (
          <CopyIcon className="size-3.5" strokeWidth={1.75} />
        )}
      </button>
    </div>
  );
}
