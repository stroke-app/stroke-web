import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeftIcon, TriangleAlertIcon } from "lucide-react";

import { CommandCard, OS_ROWS, TargetButton } from "#/components/download-targets";
import { PageBody, PageHeader, PageShell } from "#/components/page";
import {
  DOWNLOAD_TARGETS,
  findAsset,
  type GitHubRelease,
  type OS,
  useLatestRelease,
  usePlatform,
} from "#/lib/releases";
import { seo } from "#/lib/seo";

interface OsPage {
  name: string;
  title: string;
  description: string;
  intro: string;
  steps: React.ReactNode[];
  /** Package-manager installs, shown as copyable commands. */
  commands: (release: GitHubRelease | null | undefined) => { label: string; command: string }[];
  warning?: React.ReactNode;
}

/** The file name of a release asset, or a shell glob while the release loads. */
function assetName(release: GitHubRelease | null | undefined, key: string, fallback: string) {
  const target = DOWNLOAD_TARGETS.find((t) => t.key === key);
  const asset = release && target ? findAsset(release.assets, target) : null;
  return asset?.name ?? fallback;
}

const PAGES: Record<OS, OsPage> = {
  macos: {
    name: "macOS",
    title: "Download Stroke for Mac · Apple Silicon and Intel",
    description:
      "Download Stroke for macOS on Apple Silicon or Intel, or install it with Homebrew. A native database client for PostgreSQL, MySQL, SQLite, ClickHouse, DuckDB, and more. Free to try.",
    intro:
      "One native build for each Mac chip. Pick Apple Silicon for any M-series Mac, and Intel for older machines.",
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
  },
  windows: {
    name: "Windows",
    title: "Download Stroke for Windows",
    description:
      "Download Stroke for Windows as an EXE or MSI installer, or install it with Scoop. A native database client for PostgreSQL, MySQL, SQL Server, SQLite, and more. Free to try.",
    intro:
      "Use the EXE installer for a normal setup, or the MSI if you deploy software through Group Policy or Intune.",
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
  },
  linux: {
    name: "Linux",
    title: "Download Stroke for Linux · AppImage, .deb, .rpm",
    description:
      "Install Stroke on Linux as an AppImage, a .deb for Debian and Ubuntu, or an .rpm for Fedora and RHEL. A native database client for PostgreSQL, MySQL, SQLite, and more. Free to try.",
    intro:
      "The AppImage runs on almost any distribution without installing. The .deb and .rpm packages integrate with your system package manager.",
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
  },
};

function isOs(value: string): value is OS {
  return value in PAGES;
}

export const Route = createFileRoute("/download_/$os")({
  beforeLoad: ({ params }) => {
    if (!isOs(params.os)) throw notFound();
  },
  head: ({ params }) => {
    if (!isOs(params.os)) return {};
    const page = PAGES[params.os];
    return seo({
      title: page.title,
      description: page.description,
      path: `/download/${params.os}`,
      breadcrumbs: [
        { name: "Download", path: "/download" },
        { name: page.name, path: `/download/${params.os}` },
      ],
    });
  },
  component: OsDownloadPage,
});

function OsDownloadPage() {
  const { os } = Route.useParams();
  const { data: release } = useLatestRelease();
  const platform = usePlatform();

  if (!isOs(os)) return null;
  const page = PAGES[os];
  const row = OS_ROWS.find((r) => r.os === os);
  const targets = DOWNLOAD_TARGETS.filter((t) => t.os === os);

  return (
    <PageShell>
      <PageHeader
        eyebrow={
          <Link to="/download" className="inline-flex items-center gap-1.5 hover:underline">
            <ArrowLeftIcon className="size-3.5" />
            All platforms
          </Link>
        }
        title={
          <span className="flex items-center gap-3">
            {row && <row.Icon className="size-8 shrink-0 text-muted-foreground" />}
            Download Stroke for {page.name}
          </span>
        }
        description={page.intro}
      >
        <div className="mt-7 flex flex-wrap items-center gap-2">
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
                  className="h-7 w-28 animate-pulse rounded-2xl bg-muted"
                  aria-hidden="true"
                />
              ))}
          {release && (
            <span className="ml-1 font-mono text-xs text-muted-foreground">{release.tag_name}</span>
          )}
        </div>
      </PageHeader>
      <PageBody>
        <section>
          <h2 className="text-lg font-semibold tracking-tight">{page.name} installation</h2>
          <ol className="mt-5 space-y-3">
            {page.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border/60 text-xs font-medium text-foreground tabular-nums">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {page.commands(release).map((c) => (
              <CommandCard key={c.label} label={c.label} command={c.command} />
            ))}
          </div>
        </section>

        {page.warning && (
          <section className="mt-8 rounded-lg border border-amber-500/30 bg-amber-500/5 p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <TriangleAlertIcon className="size-4 text-amber-500" />
              Unsigned application
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{page.warning}</p>
          </section>
        )}

        <section className="mt-14 border-t border-border/40 pt-8">
          <h2 className="text-sm font-semibold">Next steps</h2>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/docs" className="hover:text-foreground">
                Connect your first database →
              </Link>
            </li>
            <li>
              <Link to="/docs/mcp" className="hover:text-foreground">
                Set up the MCP server →
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:text-foreground">
                Pricing →
              </Link>
            </li>
            <li>
              <Link to="/changelog" className="hover:text-foreground">
                Changelog →
              </Link>
            </li>
          </ul>
        </section>
      </PageBody>
    </PageShell>
  );
}
