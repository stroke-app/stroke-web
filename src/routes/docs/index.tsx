import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon, BotIcon, DatabaseIcon, DownloadIcon, KeyRoundIcon } from "lucide-react";

import { SmartDownloadButton } from "#/components/download-button";
import { DocsNav, NextLinks, PageBody, PageHeader, PageShell, SideNav } from "#/components/page";
import { REPO_URL } from "#/components/site-chrome";
import { buttonVariants } from "#/components/ui/button";
import { seo } from "#/lib/seo";

export const Route = createFileRoute("/docs/")({
  head: () =>
    seo({
      title: "Stroke Documentation · Getting started",
      description:
        "Install Stroke, activate your license, connect your first database, and let your AI agents query it through the built-in MCP server.",
      path: "/docs",
      breadcrumbs: [{ name: "Docs", path: "/docs" }],
    }),
  component: DocsPage,
});

interface Step {
  icon: React.ElementType;
  title: string;
  body: React.ReactNode;
}

const STEPS: Step[] = [
  {
    icon: DownloadIcon,
    title: "Download and install",
    body: (
      <>
        <p>
          Stroke runs natively on macOS, Windows, and Linux. Grab the build for your platform and
          open it. The full app is free to try, with no account required.
        </p>
        <div className="mt-3">
          <SmartDownloadButton size="sm" />
        </div>
      </>
    ),
  },
  {
    icon: DatabaseIcon,
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
    icon: KeyRoundIcon,
    title: "Activate your license",
    body: (
      <>
        <p>
          When you decide to keep Stroke, buy a license and paste the key into{" "}
          <strong>Settings → License</strong>. One purchase covers two devices, with every future
          update included.
        </p>
        <div className="mt-3">
          <Link to="/app/billing" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Get your license key
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>
      </>
    ),
  },
  {
    icon: BotIcon,
    title: "Let your agents in",
    body: (
      <>
        <p>
          Stroke ships an MCP server, so Claude, Cursor, and other agents can read your schema and
          run queries in one click. The same schema-aware AI chat lives inside the app.
        </p>
        <div className="mt-3">
          <Link to="/docs/mcp" className={buttonVariants({ variant: "outline", size: "sm" })}>
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
          <div className="space-y-8">
            <DocsNav />
            <SideNav
              title="On this page"
              items={STEPS.map((step, i) => ({ label: step.title, hash: `step-${i + 1}` }))}
            />
          </div>
        }
      >
        <ol className="space-y-10">
          {STEPS.map((step, i) => (
            <li key={step.title} id={`step-${i + 1}`} className="flex scroll-mt-20 gap-5">
              <div className="flex shrink-0 flex-col items-center">
                <span className="flex size-9 items-center justify-center rounded-full border border-border/60 text-sm font-medium text-copper tabular-nums">
                  {i + 1}
                </span>
                {i < STEPS.length - 1 && <span className="mt-2 w-px flex-1 bg-border/50" />}
              </div>
              <div className="pb-2">
                <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
                  <step.icon className="size-4 text-muted-foreground" strokeWidth={1.5} />
                  {step.title}
                </h2>
                <div className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground [&_strong]:font-medium [&_strong]:text-foreground">
                  {step.body}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <NextLinks>
          <Link to="/docs/mcp">MCP for agents →</Link>
          <Link to="/features">All features →</Link>
          <Link to="/roadmap">Roadmap →</Link>
          <Link to="/changelog">Changelog →</Link>
          <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer">
            Report an issue →
          </a>
        </NextLinks>
      </PageBody>
    </PageShell>
  );
}
