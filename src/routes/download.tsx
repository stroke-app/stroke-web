import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TriangleAlertIcon } from "lucide-react";

import { SmartDownloadButton } from "#/components/download-button";
import { CommandCard, OS_ROWS, PlatformCards, WhatYouGet } from "#/components/download-targets";
import {
  GUTTER,
  NextLinks,
  PageHeader,
  PageShell,
  ProductShot,
  Section,
  SectionIntro,
  siteButton,
} from "#/components/page";
import { latestReleaseQueryOptions } from "#/lib/latest-release";
import { NIGHTLY_ASSETS, nightlyReleaseQueryOptions, nightlyUrl } from "#/lib/nightly-release";
import { formatReleaseDate } from "#/lib/releases";
import { DOWNLOAD_TARGETS, findAsset, RELEASES_URL, usePlatform } from "#/lib/releases";
import { ORGANIZATION, seo, softwareApplication } from "#/lib/seo";
import { cn } from "#/lib/utils";

const MAIN_SHOT = {
  src: "/shots/table.webp",
  width: 1600,
  height: 1005,
  alt: "Stroke's data grid showing a movies table on a Turso database",
};
const SIDE_SHOT = {
  src: "/shots/ai-chat.webp",
  width: 1600,
  height: 1004,
  alt: "Stroke's AI chat after building a movie database, with the ER diagram of the new schema",
};

export const Route = createFileRoute("/download")({
  // On the server too, so the version and file links are in the HTML.
  loader: async ({ context }) => ({
    release: await context.queryClient
      .ensureQueryData(latestReleaseQueryOptions())
      .catch(() => null),
  }),
  head: ({ loaderData }) => {
    const release = loaderData?.release;
    const files = release
      ? DOWNLOAD_TARGETS.flatMap((t) => findAsset(release.assets, t)?.browser_download_url ?? [])
      : [];
    return seo({
      title: "Download Stroke · Fast database client for Mac, Windows & Linux",
      description:
        "Download Stroke, the native database client for macOS (Apple Silicon and Intel), Windows, and Linux, or install it with Homebrew or Scoop. Free to try, $9.99 to keep.",
      path: "/download",
      breadcrumbs: [{ name: "Download", path: "/download" }],
      schema: [
        softwareApplication({
          path: "/download",
          description:
            "Stroke is a native database client for PostgreSQL, MySQL, SQLite, SQL Server, ClickHouse, DuckDB, and more, on macOS, Windows, and Linux.",
          downloadUrl: files.length > 0 ? files : undefined,
          softwareVersion: release?.tag_name.replace(/^v/, ""),
          screenshots: [MAIN_SHOT.src, SIDE_SHOT.src],
        }),
        ORGANIZATION,
      ],
    });
  },
  component: DownloadPage,
});

function DownloadPage() {
  const { data: release } = useQuery(latestReleaseQueryOptions());
  const platform = usePlatform();

  return (
    <PageShell>
      <PageHeader
        eyebrow={
          release ? (
            <>
              <span className="font-mono text-[12px]">{release.tag_name}</span>
              <span aria-hidden="true" className="text-faint">
                ·
              </span>
              {`Released ${formatReleaseDate(release.published_at)}`}
            </>
          ) : (
            "Download"
          )
        }
        title="Download Stroke"
        description="One native app for every database you run, on macOS, Windows and Linux. Every feature is yours for 17 days, without a card."
        actions={
          <>
            <SmartDownloadButton size="lg" variant="default" align="center" />
            <a href="#platforms" className={siteButton({ variant: "secondary", size: "lg" })}>
              Other platforms
            </a>
          </>
        }
        note="Then $9.99 once to keep it, on up to 3 computers."
      />
      <div className={cn(GUTTER, "pb-20 md:pb-28")}>
        <ProductShot
          src="/shots/insights.webp"
          alt="Stroke's Instance insights page for a PostgreSQL server: connections, transactions, row writes and cache hit ratio, beside the schema tree"
          priority
          className="max-w-[64rem]"
        />
      </div>

      <Section id="platforms">
        <SectionIntro
          eyebrow="Platforms"
          title="Pick your system"
          align="center"
          className="mx-auto"
        >
          <p>Every build ships with every release. The one that fits this computer is marked.</p>
        </SectionIntro>
        <div className="mt-12 md:mt-16">
          <PlatformCards release={release} platform={platform} />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Older versions and checksums are on{" "}
          <a
            href={RELEASES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-soft underline decoration-ink/20 underline-offset-4 transition-colors hover:text-foreground hover:decoration-ink/50"
          >
            GitHub Releases
          </a>
          .
        </p>
      </Section>

      <Section>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
          <SectionIntro eyebrow="Package managers" title="Or install it from the terminal">
            <p>Homebrew, Scoop and the AUR skip the first-launch prompt and update in place.</p>
          </SectionIntro>
          <div className="grid grid-cols-1 gap-3">
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
            <CommandCard label="Arch Linux · AUR" command="yay -S stroke-bin" />
          </div>
        </div>
        <FirstLaunch />
      </Section>

      <Section inner="md:pb-28">
        <SectionIntro
          eyebrow="What you get"
          title="Free to try, $9.99 to keep"
          link={{ to: "/pricing", label: "See pricing" }}
        >
          <p>
            Use all of it while you decide. If it earns a place in your day, buy it once. No
            subscription, no renewals.
          </p>
        </SectionIntro>
        <div className="mt-12 md:mt-16">
          <WhatYouGet />
        </div>
        <NightlyDownloads />
        <NextLinks>
          {OS_ROWS.map((row) => (
            <Link key={row.os} to="/download/$os" params={{ os: row.os }}>
              {`Download Stroke for ${row.short}`}
            </Link>
          ))}
          <Link to="/docs">Getting started</Link>
          <Link to="/changelog">Changelog</Link>
        </NextLinks>
      </Section>
    </PageShell>
  );
}

/** What an unsigned build asks on first launch, and how to get past it. */
function FirstLaunch() {
  return (
    <div className="mt-12 flex flex-col gap-4 rounded-xl border border-border bg-ink/[0.02] p-5 md:flex-row md:gap-10 md:p-6">
      <h3 className="flex shrink-0 items-start gap-2.5 text-[15px] font-[560] md:w-72">
        <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-copper" />
        The direct downloads aren't code-signed yet
      </h3>
      <div className="space-y-2 text-[14.5px] leading-relaxed text-muted-foreground [&_strong]:font-medium [&_strong]:text-soft">
        <p>So your system asks once, the first time you open Stroke.</p>
        <p>
          <strong>macOS:</strong> right-click Stroke and choose Open, or allow it under System
          Settings → Privacy &amp; Security.
        </p>
        <p>
          <strong>Windows:</strong> click More info, then Run anyway in the SmartScreen dialog.
        </p>
      </div>
    </div>
  );
}

/**
 * The Nightly channel: every merged change, built each night, installed as
 * its own app beside Stroke. Linked from the changelog's Nightly tab.
 */
function NightlyDownloads() {
  const { data: n } = useQuery(nightlyReleaseQueryOptions());
  return (
    <section
      id="nightly"
      aria-labelledby="nightly-title"
      className="mt-20 scroll-mt-24 rounded-2xl border border-border bg-ink/[0.02] p-6 md:p-8"
    >
      <p className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-amber-400" />
        Nightly channel
      </p>
      <h2 id="nightly-title" className="mt-3 text-2xl font-semibold tracking-[-0.02em]">
        Stroke Nightly
        {n ? (
          <span className="font-mono text-[0.7em] font-normal text-muted-foreground">
            {" "}
            {n.version}
          </span>
        ) : null}
      </h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-pretty text-muted-foreground">
        Every change, the night it lands, before it reaches Stable. It installs as its own app
        beside Stroke with its own settings, and updates itself.
        {n ? ` Built ${formatReleaseDate(n.published_at)}.` : ""}{" "}
        <Link
          to="/changelog"
          search={{ channel: "nightly" }}
          className="text-foreground underline-offset-4 hover:underline"
        >
          What's in it
        </Link>
      </p>
      <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {NIGHTLY_ASSETS.map((a) => (
          <li key={a.file}>
            <a
              href={nightlyUrl(a.file)}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-[14px] transition-[background-color,scale] duration-150 hover:bg-ink/[0.04] active:scale-[0.99]"
            >
              <span>
                <span className="font-medium text-foreground">{a.os}</span>
                <span className="text-muted-foreground"> · {a.detail}</span>
              </span>
              <span className="font-mono text-[11.5px] text-faint">{a.file.split(".").pop()}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
