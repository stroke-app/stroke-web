import { SiApple, SiLinux } from "@icons-pack/react-simple-icons";
import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, CheckIcon, CopyIcon, DownloadIcon } from "lucide-react";
import { useState } from "react";

import { Panel, siteButton, WRAP } from "#/components/page";
import type { LatestRelease } from "#/lib/latest-release";
import {
  DOWNLOAD_TARGETS,
  findAsset,
  formatBytes,
  getDownloadAsset,
  type OS,
  type Platform,
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
  /** The system's name, e.g. "macOS". */
  name: string;
  /** What people search for, e.g. "Mac" in "Download Stroke for Mac". */
  short: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { os: "macos", name: "macOS", short: "Mac", Icon: SiApple },
  { os: "windows", name: "Windows", short: "Windows", Icon: WindowsLogo },
  { os: "linux", name: "Linux", short: "Linux", Icon: SiLinux },
];

/** What each build is for, from the release's own file names. */
const TARGET_INFO: Record<string, { name: string; detail: string; format: string; arch: string }> =
  {
    "mac-arm": {
      name: "Apple Silicon",
      detail: "Any M-series Mac",
      format: ".dmg",
      arch: "arm64",
    },
    "mac-intel": { name: "Intel", detail: "Older Intel Macs", format: ".dmg", arch: "x64" },
    "win-exe": { name: "Installer", detail: "The usual setup", format: ".exe", arch: "x64" },
    "win-msi": {
      name: "MSI package",
      detail: "For Group Policy or Intune deployment",
      format: ".msi",
      arch: "x64",
    },
    "linux-appimage": {
      name: "AppImage",
      detail: "Runs on almost any distribution, no install",
      format: ".AppImage",
      arch: "x86-64",
    },
    "linux-deb": {
      name: "Debian package",
      detail: "Debian, Ubuntu",
      format: ".deb",
      arch: "x86-64",
    },
    "linux-rpm": { name: "RPM package", detail: "Fedora, RHEL", format: ".rpm", arch: "x86-64" },
  };

/** A release date, fixed to UTC so the server and the browser print the same day. */
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "v2.2.5 · Released Oct 6, 2026 · Release notes". Holds its height while loading. */
export function ReleaseMeta({
  release,
  className,
}: {
  release: LatestRelease | undefined;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex min-h-5 flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-muted-foreground",
        className,
      )}
    >
      {release ? (
        <>
          <span className="font-mono text-[12px] text-soft">{release.tag_name}</span>
          <span aria-hidden="true" className="text-faint">
            ·
          </span>
          <span>
            Released <time dateTime={release.published_at}>{formatDate(release.published_at)}</time>
          </span>
          <span aria-hidden="true" className="text-faint">
            ·
          </span>
          <Link to="/changelog" className="transition-colors hover:text-foreground">
            Release notes
          </Link>
        </>
      ) : (
        <span
          aria-hidden="true"
          className="h-3.5 w-48 rounded bg-white/[0.06] motion-safe:animate-pulse"
        />
      )}
    </p>
  );
}

/**
 * Every build as a hairline list: name and purpose, format and architecture,
 * size, and a direct link. With `os`, only that system's builds; without it,
 * grouped by system with a link to each system's page.
 */
export function BuildList({
  os,
  release,
  platform,
}: {
  os?: OS;
  release: LatestRelease | undefined;
  platform: Platform | null;
}) {
  if (os) return <BuildRows os={os} release={release} platform={platform} />;

  return (
    <div className="space-y-14">
      {OS_ROWS.map((row) => (
        <div key={row.os}>
          <div className="flex items-end justify-between gap-4 pb-4">
            <h3 className="flex items-center gap-3 text-xl font-[560] tracking-[-0.02em]">
              <row.Icon className="size-[18px] text-muted-foreground" />
              {row.name}
            </h3>
            <Link
              to="/download/$os"
              params={{ os: row.os }}
              className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {`${row.short} install guide`}
              <ArrowRightIcon className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <BuildRows os={row.os} release={release} platform={platform} />
        </div>
      ))}
    </div>
  );
}

function BuildRows({
  os,
  release,
  platform,
}: {
  os: OS;
  release: LatestRelease | undefined;
  platform: Platform | null;
}) {
  const short = OS_ROWS.find((r) => r.os === os)?.short ?? os;
  const best =
    release && platform?.os === os ? getDownloadAsset(release.assets, os, platform.arch) : null;

  return (
    <ul className="divide-y divide-border border-y border-border">
      {DOWNLOAD_TARGETS.filter((t) => t.os === os).map((target) => {
        const info = TARGET_INFO[target.key];
        const asset = release ? findAsset(release.assets, target) : null;
        // Once the release has loaded, a build it doesn't ship isn't listed.
        if (release && !asset) return null;
        // The one build the smart download button would pick for this visitor.
        const detected = asset !== null && best !== null && asset.name === best.name;

        return (
          <li
            key={target.key}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 py-4 sm:grid-cols-[minmax(0,1fr)_9rem_5rem_auto]"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2.5 text-[15px] font-medium">
                {info?.name ?? target.label}
                {detected && (
                  <span className="flex items-center gap-1.5 text-[12px] font-normal text-foreground">
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-[#4cb782]" />
                    Your system
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {info?.detail}
                {/* On phones the format and size fold into this line. */}
                <span className="whitespace-nowrap sm:hidden">
                  {" · "}
                  {info?.format}
                  {asset && ` · ${formatBytes(asset.size)}`}
                </span>
              </p>
            </div>
            <p className="hidden font-mono text-[12px] text-muted-foreground sm:block">
              {info?.format} <span className="text-faint">·</span> {info?.arch}
            </p>
            <p className="hidden text-sm text-muted-foreground tabular-nums sm:block">
              {asset ? formatBytes(asset.size) : "—"}
            </p>
            {asset ? (
              <a
                href={asset.browser_download_url}
                title={asset.name}
                aria-label={`Download Stroke for ${short}, ${info?.name ?? target.label} (${info?.format})`}
                className={siteButton({ variant: detected ? "primary" : "secondary", size: "sm" })}
              >
                <DownloadIcon className="size-3.5" />
                Download
              </a>
            ) : (
              <span
                aria-hidden="true"
                className="h-8 w-[6.75rem] rounded-lg bg-white/[0.05] motion-safe:animate-pulse"
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** A terminal command with a copy button. */
export function CommandCard({ label, command }: { label: string; command: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border py-1.5 pr-1.5 pl-4">
        <p className="text-[13px] text-muted-foreground">{label}</p>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : `Copy the ${label} command`}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 outline-none hover:bg-white/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied ? (
            <CheckIcon className="size-3.5 text-muted-foreground" />
          ) : (
            <CopyIcon className="size-3.5" />
          )}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[12.5px] leading-relaxed text-soft">
        <code>{command}</code>
      </pre>
    </div>
  );
}

/** A real screenshot from public/features. */
export interface Shot {
  src: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * The top of a download page: a large left-aligned headline, a short lede,
 * the download button, the release line, and the app itself as the visual (a
 * main window with a second one over its corner on wide screens).
 */
export function DownloadHero({
  eyebrow,
  title,
  lede,
  action,
  release,
  shots: [main, side],
}: {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  lede: React.ReactNode;
  action: React.ReactNode;
  release: LatestRelease | undefined;
  shots: [Shot, Shot];
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(60%_100%_at_25%_0%,rgb(255_255_255/0.05),transparent)]"
      />
      <div className={cn(WRAP, "relative pt-20 md:pt-28")}>
        {eyebrow}
        <h1 className="mt-5 text-[3.25rem] leading-[1.02] text-balance sm:text-7xl md:text-[5.25rem]">
          {title}
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-[1.55] text-pretty text-soft md:text-xl md:leading-[1.5]">
          {lede}
        </p>
        <div className="mt-9">{action}</div>
        <ReleaseMeta release={release} className="mt-4" />
      </div>
      <div className={cn(WRAP, "relative mt-16 md:mt-20")}>
        <Panel className="fade-b max-h-[34rem] lg:mr-[18%]">
          <img
            src={main.src}
            width={main.width}
            height={main.height}
            alt={main.alt}
            decoding="async"
            // Phones show the window's left part larger rather than all of it tiny.
            className="block h-auto w-[180%] max-w-none sm:w-[130%] lg:w-full"
          />
        </Panel>
        <Panel className="absolute top-20 right-6 hidden max-h-[25rem] w-[38%] md:right-8 lg:block">
          <img
            src={side.src}
            width={side.width}
            height={side.height}
            alt={side.alt}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full"
          />
        </Panel>
      </div>
    </section>
  );
}

const WHAT_YOU_GET = [
  {
    title: "Every engine you run",
    body: "PostgreSQL, MySQL, MariaDB, SQLite, DuckDB, SQL Server, ClickHouse, CockroachDB, Turso / LibSQL, and Cloudflare D1. Redis is in beta.",
  },
  {
    title: "AI that knows your schema",
    body: "A schema-aware AI chat inside the app, and a built-in MCP server so Claude, Cursor, or any agent can query the databases you open.",
  },
  {
    title: "Everything while you try",
    body: "Every feature is unlocked while you evaluate. No account and no card needed.",
  },
  {
    title: "Yours for $9.99",
    body: "Pay once and keep it: a license key for up to 2 of your devices and every future update. No subscription.",
  },
];

/** What the download includes, as a hairline grid of four facts. */
export function WhatYouGet() {
  return (
    <ul className="grid grid-cols-1 border-t border-border sm:grid-cols-2 lg:grid-cols-4">
      {WHAT_YOU_GET.map((item, i) => (
        <li
          key={item.title}
          className={cn(
            "border-b border-border py-7 sm:pr-8 lg:border-b-0 lg:py-8",
            i % 2 === 1 && "sm:border-l sm:pl-8",
            i > 0 && "lg:border-l lg:pl-8",
          )}
        >
          <h3 className="text-[15px] font-[560]">{item.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}
