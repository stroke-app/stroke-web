import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { SmartDownloadButton } from "#/components/download-button";
import {
  DocsNav,
  NextLinks,
  PageBody,
  PageHeader,
  PageShell,
  SideNav,
  siteButton,
} from "#/components/page";
import { REPO_URL } from "#/components/site-chrome";
import { seo } from "#/lib/seo";

export const Route = createFileRoute("/docs/")({
  head: () =>
    seo({
      title: "Stroke Documentation · Getting started",
      description:
        "Download and install the Stroke database client, connect your first database, activate your license, and let your AI agents query it through the built-in MCP server.",
      path: "/docs",
      breadcrumbs: [{ name: "Docs", path: "/docs" }],
    }),
  component: DocsPage,
});

interface Step {
  title: string;
  body: React.ReactNode;
}

const STEPS: Step[] = [
  {
    title: "Download and install",
    body: (
      <>
        <p>
          Stroke runs natively on macOS, Windows, and Linux. Grab the build for your platform and
          open it. The full app is free to try, with no account required.
        </p>
        <div className="mt-5">
          <SmartDownloadButton size="sm" />
        </div>
      </>
    ),
  },
  {
    title: "Connect your first database",
    body: (
      <p>
        Hit <strong>New connection</strong>, pick an engine, and paste a connection string or fill
        in the host, port, and credentials. Everything connects directly from your machine. Your
        credentials, queries, and results never touch our servers.
      </p>
    ),
  },
  {
    title: "Activate your license",
    body: (
      <>
        <p>
          When you decide to keep Stroke, buy a license and paste the key into{" "}
          <strong>Settings → License</strong>. One purchase covers two devices, with every future
          update included.
        </p>
        <div className="mt-5">
          <Link to="/app/billing" className={siteButton({ variant: "secondary", size: "sm" })}>
            Get your license key
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>
      </>
    ),
  },
  {
    title: "Let your agents in",
    body: (
      <>
        <p>
          Stroke ships an MCP server, so Claude, Cursor, and other agents can read your schema and
          run queries in one click. The same schema-aware AI chat lives inside the app.
        </p>
        <div className="mt-5">
          <Link to="/docs/mcp" className={siteButton({ variant: "secondary", size: "sm" })}>
            Set up MCP for agents
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>
      </>
    ),
  },
];

function DocsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Docs"
        title="Getting started"
        description="Four steps from download to a database your agents can query. It takes about a minute."
      />
      <PageBody
        aside={
          <div className="space-y-10">
            <DocsNav />
            <SideNav
              title="On this page"
              items={STEPS.map((step, i) => ({ label: step.title, hash: `step-${i + 1}` }))}
            />
          </div>
        }
      >
        <ol className="max-w-[42rem]">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              id={`step-${i + 1}`}
              className="relative grid scroll-mt-24 grid-cols-[1.75rem_minmax(0,1fr)] gap-x-5 pb-14 last:pb-0 md:gap-x-7"
            >
              {/* The step rail: a numbered dot, joined to the next by a hairline. */}
              <span className="relative z-10 flex size-7 items-center justify-center rounded-full border border-border bg-background font-mono text-[12px] text-muted-foreground tabular-nums">
                {i + 1}
              </span>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-9 bottom-2 left-[calc(0.875rem-0.5px)] w-px bg-border"
                />
              )}
              <div className="min-w-0 pt-px">
                <h2 className="text-[1.75rem]">{step.title}</h2>
                <div className="mt-3 text-base leading-[1.7] text-pretty text-soft [&_strong]:font-[560] [&_strong]:text-foreground">
                  {step.body}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="max-w-[42rem]">
          <NextLinks>
            <Link to="/docs/mcp">MCP for agents →</Link>
            <Link to="/features">All features →</Link>
            <Link to="/roadmap">Roadmap →</Link>
            <Link to="/changelog">Changelog →</Link>
            <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer">
              Report an issue →
            </a>
          </NextLinks>
        </div>
      </PageBody>
    </PageShell>
  );
}
