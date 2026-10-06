import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRightIcon, TriangleAlertIcon } from "lucide-react";

import { SmartDownloadButton } from "#/components/download-button";
import {
  BuildList,
  CommandCard,
  DownloadHero,
  formatDate,
  OS_ROWS,
  type Shot,
  WhatYouGet,
} from "#/components/download-targets";
import { Eyebrow, NextLinks, PageShell, Section, SectionIntro } from "#/components/page";
import { type LatestRelease, latestReleaseQueryOptions } from "#/lib/latest-release";
import { DOWNLOAD_TARGETS, findAsset, type OS, usePlatform } from "#/lib/releases";
import { ORGANIZATION, seo, softwareApplication } from "#/lib/seo";

interface OsPage {
  /** The system's name, e.g. "macOS". */
  name: string;
  /** What people search for, e.g. "Mac". */
  short: string;
  title: string;
  description: string;
  /** Under the h1. */
  lede: string;
  buildsTitle: string;
  intro: string;
  /** Facts from the release's file names, for the details list. */
  arch: string;
  formats: string;
  packageManager: string;
  steps: React.ReactNode[];
  /** Package-manager installs, shown as copyable commands. */
  commands: (release: LatestRelease | null | undefined) => { label: string; command: string }[];
  warning?: React.ReactNode;
  shots: [Shot, Shot];
}

/** The file name of a release asset, or a shell glob while the release loads. */
function assetName(release: LatestRelease | null | undefined, key: string, fallback: string) {
  const target = DOWNLOAD_TARGETS.find((t) => t.key === key);
  const asset = release && target ? findAsset(release.assets, target) : null;
  return asset?.name ?? fallback;
}

const PAGES: Record<OS, OsPage> = {
  macos: {
    name: "macOS",
    short: "Mac",
    title: "Download Stroke for Mac · Database client for macOS",
    description:
      "Download Stroke for Mac on Apple Silicon or Intel, or install it with Homebrew. A native database client for PostgreSQL, MySQL, SQLite, ClickHouse, DuckDB, and more. Free to try.",
    lede: "The native database client for macOS, built for Apple Silicon and Intel. Free to try, no account needed.",
    buildsTitle: "One build for each Mac chip",
    intro:
      "Pick Apple Silicon for any M-series Mac, and Intel for older machines. Both are the same app, compiled for each chip.",
    arch: "Apple Silicon (arm64), Intel (x64)",
    formats: ".dmg",
    packageManager: "Homebrew",
    steps: [
      "Download the .dmg for your chip.",
      "Open it and drag Stroke into Applications.",
      <>
        On first launch, right-click Stroke and choose <strong>Open</strong>, or allow it under
        System Settings → Privacy &amp; Security.
      </>,
    ],
    commands: () => [{ label: "Homebrew", command: "brew install --cask stroke-app/tap/stroke" }],
    warning:
      "Direct downloads are not code-signed yet, so macOS asks for confirmation the first time. The Homebrew install skips this and updates in place.",
    shots: [
      {
        src: "/features/view-erd.webp",
        width: 1472,
        height: 1040,
        alt: "Stroke's schema diagram showing invoice tables joined by foreign keys",
      },
      {
        src: "/features/context-menu.webp",
        width: 864,
        height: 715,
        alt: "Stroke's cell context menu with filter, copy, and edit actions",
      },
    ],
  },
  windows: {
    name: "Windows",
    short: "Windows",
    title: "Download Stroke for Windows · Native database client",
    description:
      "Download Stroke for Windows as an EXE or MSI installer, or install it with Scoop. A native database client for PostgreSQL, MySQL, SQL Server, SQLite, and more. Free to try.",
    lede: "The native database client for Windows, as a regular installer or an MSI package. Free to try, no account needed.",
    buildsTitle: "An installer for every setup",
    intro:
      "Use the EXE installer for a normal setup, or the MSI if you deploy software through Group Policy or Intune.",
    arch: "64-bit (x64)",
    formats: ".exe, .msi",
    packageManager: "Scoop",
    steps: [
      "Download the EXE or MSI installer.",
      "Run it and follow the setup steps.",
      <>
        If SmartScreen appears, click <strong>More info</strong>, then <strong>Run anyway</strong>.
      </>,
    ],
    commands: () => [
      {
        label: "Scoop",
        command:
          "scoop bucket add stroke https://github.com/stroke-app/stroke\nscoop install stroke",
      },
    ],
    warning:
      "Direct downloads are not code-signed yet, so SmartScreen warns on first launch. The Scoop install skips this and updates in place.",
    shots: [
      {
        src: "/features/command-palette.webp",
        width: 1920,
        height: 1080,
        alt: "Stroke on Windows with the command palette open over a chart",
      },
      {
        src: "/features/find-replace.webp",
        width: 960,
        height: 1000,
        alt: "Stroke's find and replace, previewing every cell it will change",
      },
    ],
  },
  linux: {
    name: "Linux",
    short: "Linux",
    title: "Download Stroke for Linux · Database client (AppImage, .deb, .rpm)",
    description:
      "Download Stroke for Linux as an AppImage, a .deb for Debian and Ubuntu, or an .rpm for Fedora and RHEL. A native database client for PostgreSQL, MySQL, SQLite, and more. Free to try.",
    lede: "The native database client for Linux, as an AppImage, a .deb, or an .rpm. Free to try, no account needed.",
    buildsTitle: "A package for every distribution",
    intro:
      "The AppImage runs on almost any distribution without installing. The .deb and .rpm packages integrate with your system package manager.",
    arch: "x86-64",
    formats: ".AppImage, .deb, .rpm",
    packageManager: "apt, dnf",
    steps: [
      "Download the package that matches your distribution.",
      "Install it with one of the commands below.",
      "Launch Stroke from your app menu, or run the AppImage directly.",
    ],
    commands: (release) => [
      {
        label: "AppImage · any distro",
        command: (() => {
          const file = assetName(release, "linux-appimage", "Stroke_*.AppImage");
          return `chmod +x ./${file}\n./${file}`;
        })(),
      },
      {
        label: "Debian · Ubuntu",
        command: `sudo apt install ./${assetName(release, "linux-deb", "stroke_*.deb")}`,
      },
      {
        label: "Fedora · RHEL",
        command: `sudo dnf install ./${assetName(release, "linux-rpm", "stroke-*.rpm")}`,
      },
    ],
    shots: [
      {
        src: "/features/view-chart.webp",
        width: 1472,
        height: 1040,
        alt: "Stroke charting a table's values over time",
      },
      {
        src: "/features/ai-chat.webp",
        width: 1120,
        height: 836,
        alt: "Stroke's AI chat, ready to answer questions about the connected database",
      },
    ],
  },
};

function isOs(value: string): value is OS {
  return value in PAGES;
}

export const Route = createFileRoute("/download_/$os")({
  beforeLoad: ({ params }) => {
    if (!isOs(params.os)) throw notFound();
  },
  // On the server too, so the version and file links are in the HTML.
  loader: async ({ context }) => ({
    release: await context.queryClient
      .ensureQueryData(latestReleaseQueryOptions())
      .catch(() => null),
  }),
  head: ({ params, loaderData }) => {
    if (!isOs(params.os)) return {};
    const page = PAGES[params.os];
    const path = `/download/${params.os}`;
    const release = loaderData?.release;
    const files = release
      ? DOWNLOAD_TARGETS.filter((t) => t.os === params.os).flatMap(
          (t) => findAsset(release.assets, t)?.browser_download_url ?? [],
        )
      : [];
    return seo({
      title: page.title,
      description: page.description,
      path,
      breadcrumbs: [
        { name: "Download", path: "/download" },
        { name: page.short, path },
      ],
      schema: [
        softwareApplication({
          path,
          description: `Stroke for ${page.name}: ${page.lede}`,
          operatingSystem: page.name,
          downloadUrl: files.length > 0 ? files : undefined,
          softwareVersion: release?.tag_name.replace(/^v/, ""),
          screenshots: page.shots.map((s) => s.src),
        }),
        ORGANIZATION,
      ],
    });
  },
  component: OsDownloadPage,
});

function OsDownloadPage() {
  const { os } = Route.useParams();
  const { data: release } = useQuery(latestReleaseQueryOptions());
  const platform = usePlatform();

  if (!isOs(os)) return null;
  const page = PAGES[os];
  const others = OS_ROWS.filter((r) => r.os !== os);

  return (
    <PageShell>
      <DownloadHero
        eyebrow={
          <nav aria-label="Breadcrumb">
            <Eyebrow>
              <Link to="/download" className="transition-colors hover:text-foreground">
                Download
              </Link>
              <span aria-hidden="true" className="text-faint">
                /
              </span>
              <span aria-current="page" className="text-soft">
                {page.name}
              </span>
            </Eyebrow>
          </nav>
        }
        title={`Download Stroke for ${page.short}`}
        lede={page.lede}
        // The line under the button links the other build; the full list is below.
        action={<SmartDownloadButton os={os} size="lg" variant="default" />}
        release={release}
        shots={page.shots}
      />

      <Section id="builds">
        <SectionIntro index="1.0" eyebrow="Builds" title={page.buildsTitle}>
          <p>{page.intro}</p>
        </SectionIntro>
        <div className="mt-16 grid grid-cols-1 gap-12 md:mt-24 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16">
          <BuildList os={os} release={release} platform={platform} />
          <Details page={page} release={release} />
        </div>
        <p className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px] text-muted-foreground">
          <span>Not on {page.short === "Mac" ? "a Mac" : page.short}?</span>
          {others.map((row) => (
            <Link
              key={row.os}
              to="/download/$os"
              params={{ os: row.os }}
              className="group inline-flex items-center gap-1.5 text-soft transition-colors hover:text-foreground"
            >
              {`Download Stroke for ${row.short}`}
              <ArrowRightIcon className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
          ))}
        </p>
      </Section>

      <Section>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
          <div>
            <Eyebrow index="2.0">Install</Eyebrow>
            <h2 className="mt-5 text-[2.5rem] leading-[1.04] font-[560] tracking-[-0.035em] text-balance sm:text-5xl md:text-[3.5rem]">
              Install Stroke on {page.name}
            </h2>
          </div>
          <div className="md:pt-10">
            <ol className="border-t border-border">
              {page.steps.map((step, i) => (
                <li
                  key={i}
                  className="flex gap-5 border-b border-border py-4 text-[15px] leading-relaxed text-soft [&_strong]:font-medium [&_strong]:text-foreground"
                >
                  <span className="pt-px font-mono text-[12px] text-faint tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8 grid grid-cols-1 gap-4">
              {page.commands(release).map((c) => (
                <CommandCard key={c.label} label={c.label} command={c.command} />
              ))}
            </div>
            {page.warning && (
              <p className="mt-6 flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-copper" />
                {page.warning}
              </p>
            )}
          </div>
        </div>
      </Section>

      <Section inner="md:pb-28">
        <SectionIntro
          index="3.0"
          eyebrow="Pricing"
          title="Free to try, $9.99 to keep"
          link={{ to: "/pricing", label: "See pricing" }}
        >
          <p>
            Download Stroke for {page.short} and use all of it while you decide. If it earns a place
            in your day, buy it once. No subscription, no renewals.
          </p>
        </SectionIntro>
        <div className="mt-16 md:mt-24">
          <WhatYouGet />
        </div>
        <NextLinks>
          <Link to="/download">All downloads</Link>
          {others.map((row) => (
            <Link key={row.os} to="/download/$os" params={{ os: row.os }}>
              {`Download Stroke for ${row.short}`}
            </Link>
          ))}
          <Link to="/docs">Connect your first database</Link>
          <Link to="/docs/mcp">Set up the MCP server</Link>
          <Link to="/changelog">Changelog</Link>
        </NextLinks>
      </Section>
    </PageShell>
  );
}

/** Version, date, and the facts a visitor checks before downloading. */
function Details({ page, release }: { page: OsPage; release: LatestRelease | undefined }) {
  return (
    <dl className="self-start border-t border-border text-sm">
      <DetailRow term="Version">
        {release ? <span className="font-mono text-[13px]">{release.tag_name}</span> : "—"}
      </DetailRow>
      <DetailRow term="Released">
        {release ? (
          <time dateTime={release.published_at}>{formatDate(release.published_at)}</time>
        ) : (
          "—"
        )}
      </DetailRow>
      <DetailRow term="Architecture">{page.arch}</DetailRow>
      <DetailRow term="Formats">{page.formats}</DetailRow>
      <DetailRow term="Also via">{page.packageManager}</DetailRow>
      <DetailRow term="Price">Free to try, $9.99 to keep</DetailRow>
    </dl>
  );
}

function DetailRow({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-6 border-b border-border py-3">
      <dt className="shrink-0 text-muted-foreground">{term}</dt>
      <dd className="text-right text-soft">{children}</dd>
    </div>
  );
}
