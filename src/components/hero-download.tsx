import { SiApple, SiLinux } from "@icons-pack/react-simple-icons";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckIcon, ChevronDownIcon, CopyIcon, DownloadIcon, TerminalIcon } from "lucide-react";
import posthog from "posthog-js";
import { useEffect, useId, useRef, useState } from "react";

import { WindowsLogo } from "#/components/download-targets";
import { latestReleaseQueryOptions } from "#/lib/latest-release";
import {
  DOWNLOAD_TARGETS,
  findAsset,
  formatBytes,
  getDownloadAsset,
  type OS,
  usePlatform,
} from "#/lib/releases";
import { cn } from "#/lib/utils";

/**
 * The homepage's way in: a split button (the build for this computer, and a
 * menu of every other build with its size), and under it the one-line
 * terminal install, on the tab for this computer's system.
 */

const OS_NAME: Record<OS, string> = { macos: "macOS", windows: "Windows", linux: "Linux" };
const OS_ICON: Record<OS, React.ComponentType<{ className?: string }>> = {
  macos: SiApple,
  windows: WindowsLogo,
  linux: SiLinux,
};
const BUILD_NAME: Record<string, string> = {
  "mac-arm": "Apple Silicon",
  "mac-intel": "Intel",
  "win-exe": "Installer (.exe)",
  "win-msi": "MSI package",
  "linux-appimage": "AppImage",
  "linux-deb": "Debian, Ubuntu (.deb)",
  "linux-rpm": "Fedora, RHEL (.rpm)",
};

const UNIX = "curl -fsSL https://stroke.click/install.sh | sh";
const WINDOWS = "irm https://stroke.click/install.ps1 | iex";

function useOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

export function HeroDownload() {
  const platform = usePlatform();
  const { data: release } = useQuery(latestReleaseQueryOptions());
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const root = useOutside(open, () => setOpen(false));

  const asset =
    platform && release ? getDownloadAsset(release.assets, platform.os, platform.arch) : null;
  const label = platform
    ? `Download for ${OS_NAME[platform.os]}${platform.os === "macos" ? (platform.arch === "arm64" ? " (Apple Silicon)" : " (Intel)") : ""}`
    : "Download Stroke";
  const half =
    "flex h-12 items-center gap-2 bg-primary text-[15px] font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/88 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <div className="flex w-full max-w-[34rem] flex-col items-center gap-4">
      <div ref={root} className="relative flex items-stretch">
        {asset ? (
          <a
            href={asset.browser_download_url}
            onClick={() =>
              posthog.capture("download_clicked", {
                os: platform?.os,
                arch: platform?.arch,
                version: release?.tag_name,
                asset: asset.name,
              })
            }
            className={cn(half, "rounded-l-xl ps-5 pe-4")}
          >
            <DownloadIcon className="size-[18px]" />
            {label}
            {release && (
              <span className="ms-1 font-mono text-[12px] opacity-60">{release.tag_name}</span>
            )}
          </a>
        ) : (
          <Link to="/download" className={cn(half, "rounded-l-xl ps-5 pe-4")}>
            <DownloadIcon className="size-[18px]" />
            {label}
          </Link>
        )}
        <span aria-hidden="true" className="w-px bg-primary-foreground/15" />
        <button
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label="Other downloads"
          onClick={() => setOpen((v) => !v)}
          className={cn(half, "rounded-r-xl px-3")}
        >
          <ChevronDownIcon
            className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
          />
        </button>
        {open && (
          <div
            id={menuId}
            className="absolute top-[calc(100%+8px)] left-1/2 z-30 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 animate-in rounded-xl bg-popover p-1.5 text-left shadow-[0_0_0_1px_var(--border),0_24px_60px_-20px_rgb(0_0_0/0.6)] duration-150 fade-in-0 slide-in-from-top-1"
          >
            {(["macos", "windows", "linux"] as OS[]).map((os) => {
              const Icon = OS_ICON[os];
              return (
                <div key={os} className="py-1">
                  <p className="flex items-center gap-2 px-3 pt-1 pb-1.5 text-[12px] font-medium text-faint">
                    <Icon className="size-3.5" />
                    {OS_NAME[os]}
                  </p>
                  {DOWNLOAD_TARGETS.filter((t) => t.os === os).map((t) => {
                    const a = release ? findAsset(release.assets, t) : null;
                    if (release && !a) return null;
                    const mine = a && asset && a.name === asset.name;
                    return (
                      <a
                        key={t.key}
                        href={a?.browser_download_url ?? "/download"}
                        className="group flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] transition-colors duration-150 hover:bg-ink/[0.05]"
                      >
                        <span className="min-w-0 flex-1 truncate text-foreground">
                          {BUILD_NAME[t.key] ?? t.label}
                        </span>
                        {mine && (
                          <span className="flex items-center gap-1 text-[11.5px] text-muted-foreground">
                            <span className="size-1.5 rounded-full bg-[#4cb782]" />
                            Yours
                          </span>
                        )}
                        <span className="font-mono text-[11.5px] text-faint tabular-nums">
                          {a ? formatBytes(a.size) : ""}
                        </span>
                        <DownloadIcon className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    );
                  })}
                </div>
              );
            })}
            <Link
              to="/download"
              className="mt-0.5 flex items-center justify-center rounded-lg border-t border-border px-3 py-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-ink/[0.04] hover:text-foreground"
            >
              Every download, Homebrew, Scoop and Nightly
            </Link>
          </div>
        )}
      </div>
      <TerminalInstall initial={platform?.os === "windows" ? "windows" : "unix"} />
    </div>
  );
}

/** The one-line install, with a tab per shell. Copies on click. */
export function TerminalInstall({
  initial = "unix",
  className,
}: {
  initial?: "unix" | "windows";
  className?: string;
}) {
  const [tab, setTab] = useState<"unix" | "windows">(initial);
  const [copied, setCopied] = useState(false);
  // Detection lands after hydration: follow it until someone picks a tab.
  const picked = useRef(false);
  useEffect(() => {
    if (!picked.current) setTab(initial);
  }, [initial]);
  const command = tab === "unix" ? UNIX : WINDOWS;
  const copy = () => {
    void navigator.clipboard?.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl bg-ink/[0.03] text-left shadow-[0_0_0_1px_var(--border)_inset]",
        className,
      )}
    >
      <div className="flex items-center gap-1 border-b border-border px-2 pt-1.5">
        <TerminalIcon className="ms-1.5 me-1 size-3.5 text-faint" />
        {(
          [
            ["unix", "macOS and Linux"],
            ["windows", "Windows"],
          ] as const
        ).map(([id, name]) => (
          <button
            key={id}
            type="button"
            aria-pressed={tab === id}
            onClick={() => {
              picked.current = true;
              setTab(id);
            }}
            className={cn(
              "-mb-px border-b px-2.5 pb-1.5 text-[12.5px] transition-colors duration-150",
              tab === id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {name}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : `Copy ${command}`}
        className="group flex w-full items-center gap-3 px-4 py-3 text-left font-mono text-[13px] transition-colors hover:bg-ink/[0.03]"
      >
        <span aria-hidden="true" className="text-faint select-none">
          {tab === "unix" ? "$" : ">"}
        </span>
        <code className="min-w-0 flex-1 truncate text-soft">{command}</code>
        {copied ? (
          <CheckIcon className="size-4 shrink-0 text-foreground" />
        ) : (
          <CopyIcon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
        )}
      </button>
    </div>
  );
}
