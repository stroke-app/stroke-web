import { SiGithub } from "@icons-pack/react-simple-icons";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import * as z from "zod";

import { Markdown } from "#/components/markdown";
import { PageHeader, PageShell, siteButton, WRAP } from "#/components/page";
import {
  CHANGELOG_URL,
  groupByMinor,
  mergeSections,
  type MinorRelease,
  type ReleaseChannel,
  useChangelog,
} from "#/lib/changelog";
import { nightlyReleaseQueryOptions } from "#/lib/nightly-release";
import { formatReleaseDate, RELEASES_URL } from "#/lib/releases";
import { REPO_URL, seo } from "#/lib/seo";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/changelog")({
  validateSearch: z.object({ channel: z.enum(["stable", "nightly"]).optional() }),
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

const QUIET_LINK =
  "underline decoration-white/20 underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-white/50";

function ChangelogPage() {
  const { channel = "stable" } = Route.useSearch();
  const { data: entries, isError } = useChangelog(channel);
  const minors = entries ? groupByMinor(entries) : null;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Changelog"
        title="What's new in Stroke"
        description="Every release, grouped by version. Stable is what most people run; Nightly gets each change first."
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
      >
        <ChannelSwitch channel={channel} />
      </PageHeader>

      <div className={cn(WRAP, "border-t border-border")}>
        {channel === "nightly" && <NightlyBanner />}

        {minors?.map((m, i) => (
          <MinorSection key={m.minor} release={m} latest={i === 0} channel={channel} />
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
      </div>
    </PageShell>
  );
}

/** Stable / Nightly, as a segmented control that changes the URL. */
function ChannelSwitch({ channel }: { channel: ReleaseChannel }) {
  return (
    <div
      role="tablist"
      aria-label="Release channel"
      className="mt-8 inline-flex rounded-lg border border-border bg-white/[0.02] p-1"
    >
      {(["stable", "nightly"] as const).map((c) => (
        <Link
          key={c}
          to="/changelog"
          search={c === "stable" ? {} : { channel: c }}
          role="tab"
          aria-selected={channel === c}
          className={cn(
            "rounded-md px-3.5 py-1.5 text-[13px] font-medium capitalize transition-colors",
            channel === c
              ? "bg-white/[0.08] text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {c}
        </Link>
      ))}
    </div>
  );
}

function NightlyBanner() {
  const { data: n } = useQuery(nightlyReleaseQueryOptions());
  return (
    <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-border bg-white/[0.02] px-5 py-4">
      <span className="flex items-center gap-2 text-[13px] font-medium text-foreground">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-amber-400" />
        Stroke Nightly
        {n ? <span className="font-mono text-muted-foreground"> {n.version}</span> : null}
      </span>
      {n && (
        <span className="text-[13px] text-muted-foreground">
          Built {formatReleaseDate(n.published_at)}
        </span>
      )}
      <span className="text-[13px] text-muted-foreground">
        Installs beside Stroke, with its own settings, and updates itself.
      </span>
      <Link
        to="/download"
        hash="nightly"
        className="ms-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground hover:underline"
      >
        Download Nightly <ArrowRightIcon className="size-3.5" />
      </Link>
    </div>
  );
}

const KIND = [
  { re: /feature|new/i, label: "New", dot: "bg-[#5e6ad2]" },
  { re: /improve|change|perf/i, label: "Improved", dot: "bg-sky-400" },
  { re: /fix|bug/i, label: "Fixed", dot: "bg-[#4cb782]" },
];
const kindOf = (title: string) =>
  KIND.find((k) => k.re.test(title)) ?? { label: title, dot: "bg-white/40" };

function MinorSection({
  release,
  latest,
  channel,
}: {
  release: MinorRelease;
  latest: boolean;
  channel: ReleaseChannel;
}) {
  const sections = mergeSections(release.entries);
  const counts = new Map<string, number>();
  for (const s of sections)
    counts.set(kindOf(s.title).label, (counts.get(kindOf(s.title).label) ?? 0) + s.items.length);
  const versions = release.entries.map((e) => e.version);
  const id = `v${release.minor}`;
  const multi = versions.length > 1;
  const latestDate = formatEntryDate(release.latestDate);

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
          {latestDate && <time dateTime={release.latestDate ?? undefined}>{latestDate}</time>}
          {latest && (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-[510] text-foreground">
              <span
                aria-hidden="true"
                className={cn(
                  "size-1.5 rounded-full",
                  channel === "nightly" ? "bg-amber-400" : "bg-[#4cb782]",
                )}
              />
              {channel === "nightly" ? "Newest nightly" : "Latest"}
            </span>
          )}
        </p>
        {multi && (
          <p className="text-[12.5px] leading-relaxed text-muted-foreground tabular-nums lg:mt-1">
            {versions.length} releases: {versions.at(-1)} to {versions[0]}
          </p>
        )}
      </header>

      <div className="max-w-[44rem] min-w-0">
        <h2 className="text-[2.25rem] tabular-nums md:text-[2.75rem]">
          <a href={`#${id}`} className="transition-colors hover:text-soft">
            {multi ? release.minor : versions[0]}
          </a>
        </h2>
        {counts.size > 0 && (
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[15px] text-muted-foreground tabular-nums">
            {[...counts].map(([label, n]) => (
              <span key={label}>
                <span className="text-foreground">{n}</span> {label.toLowerCase()}
              </span>
            ))}
          </p>
        )}

        <div className="mt-10 flex flex-col gap-10">
          {sections.map((s) => {
            const k = kindOf(s.title);
            return (
              <section key={s.title} aria-label={s.title}>
                <h3 className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
                  <span aria-hidden="true" className={cn("size-1.5 rounded-full", k.dot)} />
                  {k.label}
                  <span className="text-[13px] font-normal text-muted-foreground tabular-nums">
                    {s.items.length}
                  </span>
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {s.items.map((it, j) => (
                    <li key={j} className="flex items-baseline gap-3">
                      <div className="min-w-0 flex-1 text-[15px] leading-relaxed text-pretty text-foreground/90 [&_p]:m-0">
                        <Markdown text={it.text} repoUrl={REPO_URL} />
                      </div>
                      {multi && (
                        <span className="shrink-0 font-mono text-[11.5px] text-faint tabular-nums">
                          {it.version}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          {sections.length === 0 && (
            <p className="text-[15px] text-muted-foreground">No notes for this release.</p>
          )}
        </div>
      </div>
    </article>
  );
}

/** Two columns from `lg`: the release's date and links on the left, its notes on the right. */
const ENTRY_GRID =
  "grid grid-cols-1 gap-x-16 gap-y-6 lg:grid-cols-[12rem_minmax(0,1fr)] xl:gap-x-24";

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
