import { SiApple, SiLinux } from "@icons-pack/react-simple-icons";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRightIcon, DownloadIcon } from "lucide-react";

import { WindowsLogo } from "#/components/download-targets";
import { siteButton } from "#/components/page";
import {
  type Arch,
  type GitHubAsset,
  type OS,
  RELEASES_URL,
  useLatestRelease,
  usePlatform,
} from "#/lib/releases";

export const Route = createFileRoute("/_auth/app/downloads")({
  component: DownloadsPage,
});

const PLATFORM_GROUPS: {
  icon: React.ComponentType<{ className?: string }>;
  os: OS;
  label: string;
  packages: { arch: Arch; ext: string; label: string; matcher: (a: GitHubAsset) => boolean }[];
}[] = [
  {
    icon: SiApple,
    os: "macos",
    label: "macOS",
    packages: [
      {
        arch: "arm64",
        ext: ".dmg",
        label: "Apple Silicon (arm64)",
        matcher: (a) => a.name.includes("aarch64") && a.name.endsWith(".dmg"),
      },
      {
        arch: "x64",
        ext: ".dmg",
        label: "Intel (x64)",
        matcher: (a) => a.name.includes("x64") && a.name.endsWith(".dmg"),
      },
    ],
  },
  {
    icon: WindowsLogo,
    os: "windows",
    label: "Windows",
    packages: [
      {
        arch: "x64",
        ext: ".exe",
        label: "x64 installer",
        matcher: (a) => a.name.includes("x64-setup") && a.name.endsWith(".exe"),
      },
      {
        arch: "x64",
        ext: ".msi",
        label: "MSI package",
        matcher: (a) => a.name.endsWith(".msi"),
      },
    ],
  },
  {
    icon: SiLinux,
    os: "linux",
    label: "Linux",
    packages: [
      {
        arch: "x64",
        ext: ".AppImage",
        label: "AppImage (x64)",
        matcher: (a) => a.name.endsWith(".AppImage") && !a.name.includes("arm"),
      },
      {
        arch: "x64",
        ext: ".deb",
        label: "Debian / Ubuntu (.deb)",
        matcher: (a) => a.name.endsWith(".deb") && !a.name.includes("arm"),
      },
      {
        arch: "x64",
        ext: ".rpm",
        label: "Fedora / RHEL (.rpm)",
        matcher: (a) => a.name.endsWith(".rpm") && !a.name.includes("arm"),
      },
      {
        arch: "arm64",
        ext: ".AppImage",
        label: "AppImage (arm64)",
        matcher: (a) =>
          a.name.endsWith(".AppImage") && (a.name.includes("arm") || a.name.includes("aarch64")),
      },
    ],
  },
];

function formatBytes(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

/** Fixed locale and zone, so the server and the browser print the same day. */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function DownloadsPage() {
  const { data: release, isLoading } = useLatestRelease();
  const currentPlatform = usePlatform();

  return (
    <div className="mx-auto max-w-3xl">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
        <div className="min-w-0">
          <h1 className="text-[1.75rem] md:text-[2rem]">Downloads</h1>
          <p className="mt-3 text-[15px] text-muted-foreground">
            {isLoading ? (
              "Fetching latest release…"
            ) : release ? (
              <>
                Latest: <span className="text-soft">{release.tag_name}</span>
                <span aria-hidden="true" className="px-2 text-faint">
                  ·
                </span>
                Released{" "}
                <time dateTime={release.published_at}>{formatDate(release.published_at)}</time>
              </>
            ) : (
              "Stroke Desktop for macOS, Windows, and Linux"
            )}
          </p>
        </div>
        {release && (
          <a
            href={release.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className={siteButton({ variant: "secondary", size: "sm" })}
          >
            Release notes
            <ArrowUpRightIcon className="size-3.5" />
          </a>
        )}
      </header>

      <div className="mt-12 space-y-12">
        {PLATFORM_GROUPS.map(({ icon: Icon, os, label, packages }) => {
          const available = release
            ? packages.map((p) => ({ ...p, asset: release.assets.find(p.matcher) ?? null }))
            : packages.map((p) => ({ ...p, asset: null }));

          const hasAny = available.some((p) => p.asset !== null);

          return (
            <section key={os} aria-labelledby={`platform-${os}`}>
              <div className="flex items-center gap-3 pb-4">
                <h2 id={`platform-${os}`} className="flex items-center gap-2.5 text-xl">
                  <Icon className="size-[17px] text-muted-foreground" />
                  {label}
                </h2>
                {currentPlatform?.os === os && (
                  <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[12px] font-[510] text-soft">
                    Your platform
                  </span>
                )}
              </div>

              <ul className="divide-y divide-border border-y border-border">
                {isLoading ? (
                  <li className="py-4 text-[15px] text-muted-foreground">Loading…</li>
                ) : !hasAny ? (
                  <li className="py-4 text-[15px] text-muted-foreground">
                    No packages available yet for this platform in the latest release.
                  </li>
                ) : (
                  available
                    .filter((p) => p.asset !== null)
                    .map(({ asset, label: pkgLabel, arch }) => {
                      const isRecommended =
                        currentPlatform?.os === os && currentPlatform.arch === arch;
                      return (
                        <li key={pkgLabel} className="flex items-center justify-between gap-4 py-4">
                          <div className="min-w-0">
                            <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[15px] font-[510]">
                              {pkgLabel}
                              {isRecommended && (
                                <span className="text-[13px] font-normal text-muted-foreground">
                                  Recommended
                                </span>
                              )}
                            </p>
                            <p className="mt-1 truncate text-[13px] text-muted-foreground">
                              <span className="font-mono text-[12px]">{asset!.name}</span>
                              <span aria-hidden="true" className="px-1.5 text-faint">
                                ·
                              </span>
                              <span className="tabular-nums">{formatBytes(asset!.size)}</span>
                            </p>
                          </div>
                          <a
                            href={asset!.browser_download_url}
                            aria-label={`Download ${label} ${pkgLabel}`}
                            className={siteButton({
                              variant: isRecommended ? "primary" : "secondary",
                              size: "sm",
                            })}
                          >
                            <DownloadIcon className="size-3.5" />
                            <span className="hidden sm:inline">Download</span>
                          </a>
                        </li>
                      );
                    })
                )}
              </ul>
            </section>
          );
        })}
      </div>

      <p className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[15px] text-muted-foreground">
        Older versions and pre-releases
        <a
          href={RELEASES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-soft transition-colors hover:text-foreground"
        >
          All releases on GitHub
          <ArrowUpRightIcon className="size-3.5" />
        </a>
      </p>
    </div>
  );
}
