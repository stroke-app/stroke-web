import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon, TriangleAlertIcon } from "lucide-react";

import { SmartDownloadButton } from "#/components/download-button";
import { CommandCard, OS_ROWS, TargetButton } from "#/components/download-targets";
import { PageBody, PageHeader, PageShell } from "#/components/page";
import { buttonVariants } from "#/components/ui/button";
import {
  DOWNLOAD_TARGETS,
  formatReleaseDate,
  type GitHubRelease,
  type Platform,
  RELEASES_URL,
  useLatestRelease,
  usePlatform,
} from "#/lib/releases";
import { seo } from "#/lib/seo";

export const Route = createFileRoute("/download")({
  head: () =>
    seo({
      title: "Download Stroke for macOS, Windows & Linux",
      description:
        "Download Stroke for macOS (Apple Silicon and Intel), Windows, and Linux, or install it with Homebrew or Scoop. Free to try, $9.99 to own it forever.",
      path: "/download",
      breadcrumbs: [{ name: "Download", path: "/download" }],
    }),
  component: DownloadPage,
});

function DownloadPage() {
  const { data: release } = useLatestRelease();
  const platform = usePlatform();

  return (
    <PageShell>
      <PageHeader
        eyebrow="Download"
        title="Download Stroke"
        description="Native builds for macOS, Windows, and Linux. Free to try, no account needed."
        actions={
          <>
            <SmartDownloadButton size="lg" variant="default" alternates={false} />
            <Link to="/changelog" className={buttonVariants({ variant: "outline", size: "lg" })}>
              View changelog
              <ArrowRightIcon className="size-4" />
            </Link>
          </>
        }
      >
        <p className="mt-6 text-sm text-muted-foreground">
          Version{" "}
          {release ? (
            <span className="font-mono text-foreground">{release.tag_name}</span>
          ) : (
            <span className="inline-block h-4 w-14 animate-pulse rounded bg-muted align-middle" />
          )}
          {release?.published_at && (
            <span className="ml-2">released {formatReleaseDate(release.published_at)}</span>
          )}
        </p>
      </PageHeader>
      <PageBody>
        {/* Platform rows */}
        <h2 className="text-lg font-semibold tracking-tight">All platforms</h2>
        <div className="mt-4 divide-y divide-border/50 overflow-hidden rounded-lg border border-border/50">
          {OS_ROWS.map((row) => (
            <PlatformRow key={row.os} row={row} release={release} platform={platform} />
          ))}
        </div>

        {/* Package managers */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold tracking-tight">Prefer a package manager?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These installs skip the security warnings below and update in place.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CommandCard
              label="macOS · Homebrew"
              command="brew install --cask stroke-app/tap/stroke"
            />
            <CommandCard
              label="Windows · Scoop"
              command={
                "scoop bucket add stroke https://github.com/stroke-app/stroke\nscoop install stroke"
              }
            />
          </div>
        </section>

        {/* Unsigned notice */}
        <section className="mt-8 rounded-lg border border-amber-500/30 bg-amber-500/5 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <TriangleAlertIcon className="size-4 text-amber-500" />
            Unsigned application
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Direct downloads are not code-signed yet, so your OS will warn you on first launch:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">macOS:</strong> right-click the app
              and choose "Open", or allow it under System Settings → Privacy &amp; Security.
            </li>
            <li>
              <strong className="font-medium text-foreground">Windows:</strong> click "More info",
              then "Run anyway" in the SmartScreen dialog.
            </li>
          </ul>
        </section>

        <p className="mt-8 text-xs text-muted-foreground">
          Older versions and checksums live on{" "}
          <a
            href={RELEASES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            the releases page
          </a>
          .
        </p>
      </PageBody>
    </PageShell>
  );
}

function PlatformRow({
  row,
  release,
  platform,
}: {
  row: (typeof OS_ROWS)[number];
  release: GitHubRelease | null | undefined;
  platform: Platform | null;
}) {
  const targets = DOWNLOAD_TARGETS.filter((t) => t.os === row.os);

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4">
      <Link to="/download/$os" params={{ os: row.os }} className="group flex items-center gap-3">
        <row.Icon className="size-4.5 text-muted-foreground/70" />
        <span className="text-sm font-medium">{row.name}</span>
        <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
          Install guide →
        </span>
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        {release
          ? targets.map((target) => (
              <TargetButton
                key={target.key}
                target={target}
                release={release}
                detected={
                  platform !== null &&
                  platform.os === target.os &&
                  (target.arch === null || platform.arch === target.arch)
                }
              />
            ))
          : targets.map((target) => (
              <span
                key={target.key}
                className="h-7 w-24 animate-pulse rounded-2xl bg-muted"
                aria-hidden="true"
              />
            ))}
      </div>
    </div>
  );
}
