import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { HeroDownload } from "#/components/hero-download";
import {
  PageHeader,
  PagePill,
  PageShell,
  Section,
  SectionIntro,
  siteButton,
} from "#/components/page";
import { PRO_PRICE, TRIAL_DAYS } from "#/lib/pricing";
import { seo } from "#/lib/seo";
import { cn } from "#/lib/utils";

/**
 * The Stroke 3 launch page: the same bento as the announcement email. Each
 * tile is a bold lead and one plain sentence over a still of the feature.
 * The stills are drawn with the stageshow kit and live in public/email/v3/.
 */

export const Route = createFileRoute("/stroke-3")({
  head: () =>
    seo({
      title: "Stroke 3 · What's new",
      description:
        "Stroke 3 is out: a redesigned, faster app with AI chat beside your tables, dashboards, sharing for charts, tables and diagrams, local database servers, migrations, encrypted scheduled backups and sync.",
      path: "/stroke-3",
      breadcrumbs: [{ name: "Stroke 3", path: "/stroke-3" }],
    }),
  component: Stroke3Page,
});

const IMG = "/email/v3";

interface PicTile {
  img: string;
  alt: string;
  title: string;
  text: string;
}

/** Rows of two, in reading order. `null` marks a dark type tile. */
const ROWS: [PicTile | "stat" | "npx", PicTile | "stat" | "npx"][] = [
  [
    {
      img: "dashboards",
      alt: "A dashboard chart card refreshed 4 seconds ago",
      title: "Dashboards.",
      text: "Saved charts on one page that refreshes itself. Open it in its own window or full screen.",
    },
    "stat",
  ],
  [
    {
      img: "servers",
      alt: "Postgres 17 and MySQL 8.4 running, Redis 7 stopped",
      title: "Local servers.",
      text: "Postgres, MySQL or Redis on your computer, in any version, started with Stroke.",
    },
    {
      img: "providers",
      alt: "Supabase, Prisma, Turso, Cloudflare and more",
      title: "Create databases on your host.",
      text: "Sign in to Neon, Supabase, Turso or D1, and create from Stroke.",
    },
  ],
  [
    {
      img: "backups",
      alt: "A nightly backup at 02:00, encrypted, switched on",
      title: "Scheduled backups.",
      text: "End-to-end encrypted, to Stroke Cloud or your own S3. Preview a dump before you restore.",
    },
    {
      img: "sync",
      alt: "Three computers synced through an encrypted lock",
      title: "Sync.",
      text: "Connections, settings, saved queries and dashboards on all your computers, encrypted.",
    },
  ],
  [
    "npx",
    {
      img: "shortcuts",
      alt: "Keycaps: command, semicolon, then S",
      title: "Your shortcuts.",
      text: "Change any key, or press ⌘; then a letter to jump anywhere.",
    },
  ],
  [
    {
      img: "share",
      alt: "Share a chart, a table or a schema diagram as a link",
      title: "Share anything.",
      text: "Charts, tables and diagrams, as an encrypted link that opens in any browser.",
    },
    {
      img: "migrations",
      alt: "Two migrations applied, one pending",
      title: "Migrations.",
      text: "Drizzle, Prisma, Wrangler or SQL folders: what has run, and what's still pending.",
    },
  ],
];

const ALSO: [string, string][] = [
  [
    "A new design, and faster",
    "Every screen is redesigned. Stroke starts faster and big tables scroll smoothly.",
  ],
  ["Instance insights", "Live connections, transactions and cache hit ratio for your server."],
  ["Docker in one click", "Start any of 18 databases from ⌘K, already connected."],
  ["Community themes", "Build a theme from a few colours, or install one other people made."],
];

const LABS: [string, string, boolean][] = [
  ["AI chat in a tab", "On by default in 3.0. Turn it off to get the full-window chat back.", true],
  ["Explorer tree", "Connections, databases, tables and columns in one tree.", false],
  [
    "Several connections at once",
    "Keep databases open with their tabs, and switch instantly.",
    false,
  ],
  ["Share as a web studio", "Share a database through a link that opens in any browser.", false],
  ["Live mode, ⌘K AI, Vim mode", "Self-refreshing tables, AI in the palette, and Vim keys.", false],
];

const PACKAGES: [string, string][] = [
  ["macOS", "brew upgrade --cask stroke-app"],
  ["Windows", "scoop update stroke"],
  ["Arch", "yay -Syu stroke-bin"],
];

const tile = "overflow-hidden rounded-2xl shadow-[0_0_0_1px_var(--border)_inset]";
const lead = "px-6 pt-6 text-[17px] leading-[1.45] text-pretty md:px-7 md:pt-7";

function Picture({ t }: { t: PicTile }) {
  return (
    <div className={cn(tile, "flex flex-col bg-[#f4f4f5]")}>
      <p className={cn(lead, "min-h-[7.5rem] text-[#8e8e96]")}>
        <span className="font-semibold text-[#0a0a0a]">{t.title}</span> {t.text}
      </p>
      <img
        src={`${IMG}/${t.img}.jpg`}
        alt={t.alt}
        width={540}
        height={340}
        loading="lazy"
        decoding="async"
        className="mt-auto block h-auto w-full"
      />
    </div>
  );
}

function Stat() {
  return (
    <div
      className={cn(
        tile,
        "keep-dark flex flex-col justify-between bg-[#0a0a0b] p-6 text-[#8b8b93] md:p-7",
      )}
    >
      <p className="text-[17px]">Works with</p>
      <p className="my-6 text-[7rem] leading-none font-semibold tracking-[-0.05em] text-white">
        21
      </p>
      <p className="text-[15px] leading-[1.55] text-pretty">
        <span className="text-white">databases.</span> Postgres, MySQL, SQLite, MongoDB, Redis,
        Oracle, ClickHouse and more, in one app.{" "}
        <Link to="/databases" className="text-white underline underline-offset-4">
          See them all
        </Link>
      </p>
    </div>
  );
}

function Npx() {
  return (
    <div
      className={cn(
        tile,
        "keep-dark flex flex-col justify-between bg-[#0a0a0b] p-6 text-[#8b8b93] md:p-7",
      )}
    >
      <p className="text-[17px]">In any project, run</p>
      <p className="my-8 font-mono text-[1.75rem] text-white">
        <span className="text-[#52525b]">$ </span>npx strokedb
      </p>
      <p className="text-[15px] leading-[1.55] text-pretty">
        It opens that project's database in Stroke, or in your browser at{" "}
        <Link to="/studio" className="text-white underline underline-offset-4">
          stroke.click/studio
        </Link>
        .
      </p>
    </div>
  );
}

function Cell({ c }: { c: PicTile | "stat" | "npx" }) {
  if (c === "stat") return <Stat />;
  if (c === "npx") return <Npx />;
  return <Picture t={c} />;
}

function Stroke3Page() {
  return (
    <PageShell>
      <PageHeader
        eyebrow={<PagePill>Released November 19, 2026</PagePill>}
        title="Stroke 3 is here"
        description="The biggest update to Stroke so far: every screen redesigned, a faster app, and the features below. Each one is a sentence, so it takes a minute."
      >
        <div className="mt-9 flex w-full justify-center">
          <HeroDownload />
        </div>
        <p className="mt-4 text-[13px] text-faint">
          Free for {TRIAL_DAYS} days with every feature. Then {PRO_PRICE} once, no subscription.
        </p>
      </PageHeader>

      <Section border={false} inner="pt-4 md:pt-6">
        <div className="mx-auto grid max-w-[69rem] gap-3 md:grid-cols-2">
          {/* Hero: the AI chat, the only window */}
          <div className={cn(tile, "keep-dark bg-[#0a0a0b] md:col-span-2")}>
            <p className={cn(lead, "max-w-[44rem] pb-2 text-[18px] text-[#8b8b93] md:text-[20px]")}>
              <span className="font-semibold text-white">AI chat, in a tab.</span> Ask about your
              database next to your tables. It writes and runs the queries, and stays inside the
              access level you pick: read only, read and write, schema changes, or everything.
            </p>
            <img
              src={`${IMG}/hero.jpg`}
              alt="Stroke's AI chat in a tab: it created two tables and inserted 45 rows"
              width={1104}
              height={660}
              decoding="async"
              className="block h-auto w-full"
            />
          </div>

          {ROWS.map((row, i) => (
            <div key={i} className="contents">
              <Cell c={row[0]} />
              <Cell c={row[1]} />
            </div>
          ))}

          <div className={cn(tile, "keep-dark bg-[#0a0a0b] p-6 md:col-span-2 md:p-8")}>
            <p className="inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold tracking-wide text-[#fbbf24] shadow-[0_0_0_1px_#3f3a2a_inset]">
              Coming soon · in Labs
            </p>
            <p className="mt-4 max-w-[46rem] text-[18px] leading-[1.5] text-pretty text-[#8b8b93] md:text-[20px]">
              <span className="font-semibold text-white">The web studio.</span> The full Stroke in
              your browser, for any database you can reach. It's in Labs now while we build and
              polish it.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto grid max-w-[69rem] gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <SectionIntro eyebrow="Also new" title="And a few more things" />
            <ul className="mt-8 divide-y divide-border border-y border-border">
              {ALSO.map(([name, what]) => (
                <li key={name} className="py-4">
                  <p className="text-[15px] font-medium">{name}</p>
                  <p className="mt-1 text-[14px] leading-[1.55] text-muted-foreground">{what}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionIntro eyebrow="Labs" title="Try it early in Labs">
              These work today and may still change. Turn them on in Settings → Labs.
            </SectionIntro>
            <ul className="mt-8 divide-y divide-border border-y border-border">
              {LABS.map(([name, what, on]) => (
                <li key={name} className="flex items-start gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-medium">{name}</p>
                    <p className="mt-1 text-[14px] leading-[1.55] text-muted-foreground">{what}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 pt-0.5 text-[12px] text-muted-foreground">
                    <span
                      className={cn("size-1.5 rounded-full", on ? "bg-[#22c55e]" : "bg-faint")}
                    />
                    {on ? "On" : "Opt-in"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto grid max-w-[69rem] gap-12 md:grid-cols-2 md:gap-16">
          <SectionIntro eyebrow="Update" title="How to update">
            Open Stroke and it offers the update. Your connections, settings and saved queries carry
            over.
          </SectionIntro>
          <div className="flex flex-col gap-4">
            <div className="keep-dark overflow-hidden rounded-xl bg-[#0a0a0b]">
              {PACKAGES.map(([os, cmd]) => (
                <div
                  key={os}
                  className="flex items-center gap-4 border-t border-white/10 px-4 py-3 first:border-t-0"
                >
                  <span className="w-16 shrink-0 text-[12px] text-[#8b8b93]">{os}</span>
                  <code className="min-w-0 truncate font-mono text-[13px] text-[#e4e4e7]">
                    {cmd}
                  </code>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-ink/[0.03] p-5 shadow-[0_0_0_1px_var(--border)_inset]">
              <p className="text-[15px] font-medium">Stroke 3 asks you to sign in</p>
              <p className="mt-1.5 text-[14px] leading-[1.6] text-muted-foreground">
                Sign in with Google or GitHub. If you bought a license, use the email you bought it
                with and Pro turns on by itself. Your plan covers up to 3 computers.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/download" className={siteButton({ size: "lg" })}>
                Download Stroke 3
              </Link>
              <Link to="/changelog" className={siteButton({ variant: "secondary", size: "lg" })}>
                Full changelog
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
