import { createFileRoute } from "@tanstack/react-router";
import { AppWindowIcon, GlobeIcon, LockIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { SmartDownloadButton } from "#/components/download-button";
import { CommandCard } from "#/components/download-targets";
import { PageHeader, PageShell, WRAP } from "#/components/page";
import { Studio } from "#/components/studio/studio";
import { seo } from "#/lib/seo";
import { forgetSession, takeSession, type Session } from "#/lib/studio-bridge";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/studio")({
  head: () =>
    seo({
      title: "Studio · Open your project's database with npx strokedb",
      description:
        "Run npx strokedb in your project. Your database opens in the Stroke app if you have it, or right here in the browser: tables, rows and a SQL console for PostgreSQL, MySQL and SQLite.",
      path: "/studio",
      breadcrumbs: [{ name: "Studio", path: "/studio" }],
    }),
  component: StudioPage,
});

function StudioPage() {
  // undefined until the browser has read the fragment; the server can't see it.
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => setSession(takeSession()), []);

  if (session) {
    return (
      <Studio
        session={session}
        onLeave={() => {
          forgetSession();
          setSession(null);
        }}
      />
    );
  }
  // Keep the landing page in the server HTML; a session swaps it out on load.
  return <StudioLanding />;
}

const STEPS = [
  {
    icon: AppWindowIcon,
    title: "Stroke installed? It opens there",
    body: "The app opens a New Connection form filled in from your project. Check it and press Connect.",
  },
  {
    icon: GlobeIcon,
    title: "No app? It opens here",
    body: "You get tables, rows, sorting and a SQL console in the browser, for PostgreSQL, MySQL and SQLite. Shared from the Stroke app, it opens any SQL database the app does, from SQL Server and Oracle to Snowflake and BigQuery.",
  },
  {
    icon: LockIcon,
    title: "Your database stays on your machine",
    body: "This page talks to a bridge in your terminal on 127.0.0.1. Only the tab it opens can use it, and Ctrl+C ends it. Queries never go through stroke.click.",
  },
];

function StudioLanding() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Studio"
        title="Your project's database, one command away"
        description={
          <>
            Run <code className="font-mono text-[0.9em] text-foreground">npx strokedb</code> in your
            project. It finds the connection in{" "}
            <code className="font-mono text-[0.9em]">DATABASE_URL</code>, your{" "}
            <code className="font-mono text-[0.9em]">.env</code> files, or a SQLite file in the
            folder.
          </>
        }
      >
        <div className="mt-9 grid max-w-2xl gap-3">
          <CommandCard label="In your project" command="npx strokedb" />
          <CommandCard
            label="Or name the database"
            command="npx strokedb postgres://user:pass@localhost:5432/app"
          />
        </div>
      </PageHeader>

      <section className={cn(WRAP, "grid gap-4 pb-16 md:grid-cols-3")}>
        {STEPS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border border-border bg-card p-5">
            <Icon className="size-4 text-muted-foreground" />
            <h2 className="mt-4 text-[15px] font-[510]">{title}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>

      <section className={cn(WRAP, "pb-24")}>
        <div className="flex flex-col items-start gap-5 rounded-xl border border-border bg-card p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[17px] font-[510]">Want more than browsing?</h2>
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
              The desktop app works with 20+ databases and adds editing, ER diagrams, AI chat and
              the MCP server. With it installed, <code className="font-mono">npx strokedb</code>{" "}
              opens there.
            </p>
          </div>
          <SmartDownloadButton />
        </div>
      </section>
    </PageShell>
  );
}
