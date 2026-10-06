import { SiGithub } from "@icons-pack/react-simple-icons";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon, GitCommitHorizontalIcon, GitCompareIcon } from "lucide-react";

import { Markdown } from "#/components/markdown";
import { PageHeader, PageShell, siteButton, WRAP } from "#/components/page";
import {
  type ChangelogEntry,
  CHANGELOG_URL,
  findTag,
  type ReleaseTag,
  useChangelog,
  useReleaseTags,
} from "#/lib/changelog";
import { formatReleaseDate, RELEASES_URL } from "#/lib/releases";
import { REPO_URL, seo } from "#/lib/seo";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/changelog")({
  head: () =>
    seo({
      title: "Changelog · Stroke database client",
      description:
        "Every update to Stroke, the native database client: new features, fixes, and changes, release by release. Download the latest version any time.",
      path: "/changelog",
      breadcrumbs: [{ name: "Changelog", path: "/changelog" }],
    }),
  component: ChangelogPage,
});

function formatEntryDate(date: string | null): string | null {
  if (!date) return null;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : formatReleaseDate(date);
}

function versionId(version: string) {
  return `v${version.replace(/^v/, "")}`;
}

/**
 * The areas a release's new features are grouped under ("#### Terminal",
 * "#### SQL editor"), used as a one-line summary under its version.
 */
function featureAreas(body: string): string[] {
  const areas: string[] = [];
  let inFeatures = false;
  for (const line of body.split("\n")) {
    const category = /^###\s+(.*)$/.exec(line);
    if (category) inFeatures = /new features|improvements/i.test(category[1]);
    const area = /^####\s+(.*)$/.exec(line);
    if (area && inFeatures) areas.push(area[1].trim());
  }
  return areas;
}

const QUIET_LINK =
  "underline decoration-white/20 underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-white/50";

function ChangelogPage() {
  const { data: entries, isError } = useChangelog();
  const { data: tags } = useReleaseTags();

  return (
    <PageShell>
      <PageHeader
        eyebrow="Changelog"
        title="What's new in Stroke"
        description="Every release, straight from the source. Update whenever you like: every version is included with your license."
        actions={
          <>
            <Link to="/download" className={siteButton({ size: "md" })}>
              Get the latest version
              <ArrowRightIcon className="size-4" />
            </Link>
            <a
              href={RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={siteButton({ variant: "secondary", size: "md" })}
            >
              <SiGithub className="size-4" />
              Releases on GitHub
            </a>
          </>
        }
      />

      <div className={cn(WRAP, "border-t border-border")}>
        {entries?.map((entry, i) => (
          <ChangelogSection
            key={entry.version}
            entry={entry}
            latest={i === 0}
            tag={findTag(tags, entry.version)}
            previousTag={entries[i + 1] ? findTag(tags, entries[i + 1].version) : null}
          />
        ))}

        {!entries && !isError && <ChangelogSkeleton />}

        {(isError || entries?.length === 0) && (
          <p className="py-16 text-[15px] text-muted-foreground">
            Couldn't load the changelog right now. Read it on{" "}
            <a
              href={CHANGELOG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={QUIET_LINK}
            >
              GitHub
            </a>
            .
          </p>
        )}

        {entries && entries.length > 0 && (
          <p className="border-t border-border py-12 text-sm text-muted-foreground lg:pl-[calc(12rem+4rem)] xl:pl-[calc(12rem+6rem)]">
            Looking for older versions? Read the{" "}
            <a
              href={CHANGELOG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={QUIET_LINK}
            >
              full changelog on GitHub
            </a>
            .
          </p>
        )}
      </div>
    </PageShell>
  );
}

/** Two columns from `lg`: the release's date and links on the left, its notes on the right. */
const ENTRY_GRID =
  "grid grid-cols-1 gap-x-16 gap-y-6 lg:grid-cols-[12rem_minmax(0,1fr)] xl:gap-x-24";

const META_LINK =
  "inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground";

function ChangelogSection({
  entry,
  latest,
  tag,
  previousTag,
}: {
  entry: ChangelogEntry;
  latest: boolean;
  tag: ReleaseTag | null;
  previousTag: ReleaseTag | null;
}) {
  const date = formatEntryDate(entry.date);
  const id = versionId(entry.version);
  const areas = featureAreas(entry.body);

  return (
    <article
      id={id}
      className={cn(
        ENTRY_GRID,
        "scroll-mt-16 border-t border-border py-14 first:border-t-0 md:py-20",
      )}
    >
      <header className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:sticky lg:top-28 lg:flex-col lg:items-start lg:self-start">
        <p className="flex items-center gap-2.5 text-sm text-soft">
          {date && <time dateTime={entry.date ?? undefined}>{date}</time>}
          {latest && (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-[510] text-foreground">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-[#4cb782]" />
              Latest
            </span>
          )}
        </p>
        {tag && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:mt-2 lg:flex-col lg:items-start">
            <a
              href={`${REPO_URL}/commit/${tag.sha}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`Commit ${tag.sha}`}
              className={cn(META_LINK, "font-mono text-[12.5px]")}
            >
              <GitCommitHorizontalIcon className="size-3.5" />
              {tag.sha.slice(0, 7)}
            </a>
            {previousTag && (
              <a
                href={`${REPO_URL}/compare/${previousTag.name}...${tag.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className={META_LINK}
              >
                <GitCompareIcon className="size-3.5" />
                Compare with {previousTag.name}
              </a>
            )}
          </div>
        )}
      </header>

      <div className="max-w-[44rem] min-w-0">
        <h2 className="text-[2.25rem] tabular-nums md:text-[2.75rem]">
          <a href={`#${id}`} className="transition-colors hover:text-soft">
            {entry.version}
          </a>
        </h2>
        {areas.length > 0 && (
          <p className="mt-3 text-[17px] leading-normal text-pretty text-muted-foreground">
            {areas.join(", ")}
          </p>
        )}

        <div className="mt-10">
          {entry.body ? (
            <Markdown text={entry.body} repoUrl={REPO_URL} />
          ) : (
            <p className="text-[15px] text-muted-foreground">No notes for this release.</p>
          )}
        </div>
      </div>
    </article>
  );
}

function ChangelogSkeleton() {
  const bar = "animate-pulse rounded bg-white/[0.05] motion-reduce:animate-none";
  return (
    <div className={cn(ENTRY_GRID, "py-14 md:py-20")} aria-hidden="true">
      <div className={cn(bar, "h-4 w-24")} />
      <div className="max-w-[44rem] space-y-4">
        <div className={cn(bar, "h-9 w-32")} />
        <div className={cn(bar, "h-4 w-64")} />
        <div className="space-y-3 pt-8">
          <div className={cn(bar, "h-3 w-full")} />
          <div className={cn(bar, "h-3 w-11/12")} />
          <div className={cn(bar, "h-3 w-3/4")} />
        </div>
      </div>
    </div>
  );
}
