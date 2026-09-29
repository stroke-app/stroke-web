import { SiGithub } from "@icons-pack/react-simple-icons";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon, GitCommitHorizontalIcon, GitCompareIcon } from "lucide-react";

import { Markdown } from "#/components/markdown";
import { PageBody, PageHeader, PageShell, SideNav } from "#/components/page";
import { buttonVariants } from "#/components/ui/button";
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
export const Route = createFileRoute("/changelog")({
  head: () =>
    seo({
      title: "Changelog · Stroke",
      description: "Every update to Stroke: new features, fixes, and changes, release by release.",
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
            <Link to="/download" className={buttonVariants({ variant: "default", size: "lg" })}>
              Get the latest version
              <ArrowRightIcon className="size-4" />
            </Link>
            <a
              href={RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <SiGithub className="size-4" />
              Releases on GitHub
            </a>
          </>
        }
      />
      <PageBody
        aside={
          entries &&
          entries.length > 0 && (
            <SideNav
              title="Versions"
              items={entries.slice(0, 16).map((e) => ({
                hash: versionId(e.version),
                label: <span className="font-mono text-[13px]">{e.version}</span>,
              }))}
            />
          )
        }
      >
        <div className="divide-y divide-border/50">
          {entries?.map((entry, i) => (
            <ChangelogSection
              key={entry.version}
              entry={entry}
              tag={findTag(tags, entry.version)}
              previousTag={entries[i + 1] ? findTag(tags, entries[i + 1].version) : null}
            />
          ))}

          {!entries && !isError && <ChangelogSkeleton />}

          {(isError || entries?.length === 0) && (
            <p className="py-10 text-sm text-muted-foreground">
              Couldn't load the changelog right now. Read it on{" "}
              <a
                href={CHANGELOG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                GitHub
              </a>
              .
            </p>
          )}
        </div>

        {entries && entries.length > 0 && (
          <p className="mt-12 text-sm text-muted-foreground">
            Looking for older versions? Read the{" "}
            <a
              href={CHANGELOG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              full changelog on GitHub
            </a>
            .
          </p>
        )}
      </PageBody>
    </PageShell>
  );
}

function ChangelogSection({
  entry,
  tag,
  previousTag,
}: {
  entry: ChangelogEntry;
  tag: ReleaseTag | null;
  previousTag: ReleaseTag | null;
}) {
  const date = formatEntryDate(entry.date);
  const id = versionId(entry.version);

  return (
    <article id={id} className="scroll-mt-20 py-10 first:pt-0">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          <a href={`#${id}`} className="hover:underline">
            {entry.version}
          </a>
        </h2>
        {date && <span className="text-sm text-muted-foreground">{date}</span>}
        {tag && (
          <span className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <a
              href={`${REPO_URL}/commit/${tag.sha}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`Commit ${tag.sha}`}
              className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border/60 px-2.5 font-mono text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              <GitCommitHorizontalIcon className="size-3.5" />
              {tag.sha.slice(0, 7)}
            </a>
            {previousTag && (
              <a
                href={`${REPO_URL}/compare/${previousTag.name}...${tag.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <GitCompareIcon className="size-3.5" />
                Compare with {previousTag.name}
              </a>
            )}
          </span>
        )}
      </header>

      <div className="mt-5">
        {entry.body ? (
          <Markdown text={entry.body} repoUrl={REPO_URL} />
        ) : (
          <p className="text-sm text-muted-foreground italic">No notes for this release.</p>
        )}
      </div>
    </article>
  );
}

function ChangelogSkeleton() {
  return (
    <div className="space-y-5 py-10 first:pt-0">
      <div className="flex gap-3">
        <div className="h-6 w-16 animate-pulse rounded bg-muted" />
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-3">
        <div className="h-5 w-56 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
