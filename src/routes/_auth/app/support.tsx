import { SiGithub } from "@icons-pack/react-simple-icons";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  LightbulbIcon,
  MailIcon,
  PlugIcon,
  PlusIcon,
  SparklesIcon,
} from "lucide-react";

import { appButton } from "#/components/app-ui";
import { SUPPORT_EMAIL } from "#/components/legal";
import { REPO_URL } from "#/components/site-chrome";

export const Route = createFileRoute("/_auth/app/support")({
  component: SupportPage,
});

// Every answer here matches the Terms, the pricing page, and the app itself.
const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "How do I activate my license?",
    a: (
      <>
        Copy your key from the <Link to="/app">dashboard</Link>, then open Stroke, go to Settings →
        License, and paste it.
      </>
    ),
  },
  {
    q: "How many devices can I use?",
    a: (
      <>
        A license is active on up to 3 devices at a time. To move it to a new machine, remove the
        old one under Devices on <a href="/app/billing">License &amp; billing</a>, even if you no
        longer have it, or deactivate it in Stroke (Settings → License).
      </>
    ),
  },
  {
    q: "I paid but don't see a license key.",
    a: (
      <>
        Keys usually appear on your dashboard within a minute of payment. If it's still missing
        after a few minutes, email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> from the
        address on your account.
      </>
    ),
  },
  {
    q: "Which databases does Stroke support?",
    a: "PostgreSQL, MySQL, MariaDB, SQLite, DuckDB, SQL Server, ClickHouse, CockroachDB, Turso / LibSQL, and Cloudflare D1. Redis is in beta.",
  },
  {
    q: "How do I connect Claude or Cursor?",
    a: (
      <>
        Stroke runs an MCP server on your machine at <code>http://127.0.0.1:4319/mcp</code>. The{" "}
        <Link to="/docs/mcp">MCP guide</Link> has the config for each client.
      </>
    ),
  },
  {
    q: "Something went wrong with my purchase.",
    a: (
      <>
        A duplicate charge, a mistake at checkout, or a key that won't activate: email us within 14
        days and we'll make it right, as the <Link to="/terms">Terms</Link> say.
      </>
    ),
  },
];

const GUIDES = [
  {
    to: "/docs" as const,
    icon: BookOpenIcon,
    title: "Getting started",
    body: "Install Stroke and connect your first database.",
  },
  {
    to: "/docs/mcp" as const,
    icon: PlugIcon,
    title: "Connect an agent",
    body: "Set up the MCP server for Claude, Cursor, or any MCP client.",
  },
  {
    to: "/changelog" as const,
    icon: SparklesIcon,
    title: "What's new",
    body: "Every release, and what changed in it.",
  },
];

const ROW =
  "group -mx-2 flex items-center gap-4 rounded-md px-2 py-3.5 transition-colors hover:bg-accent/50";

function SupportPage() {
  return (
    <div>
      <header>
        <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.02em]">Support</h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          Questions, bugs, or a problem with your license. Here's how to reach us.
        </p>
      </header>

      <section className="mt-8 border-t border-border pt-6">
        <div className="flex items-start gap-4">
          <span className="flex size-5 shrink-0 items-center justify-center pt-1">
            <MailIcon className="size-[18px] text-muted-foreground" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h2 className="text-[16px] leading-snug font-semibold">Email us</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-pretty text-muted-foreground">
              For your license, billing, or anything private. Write from the address on your account
              so we can find your purchase, and we'll reply by email.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2.5 sm:pl-9">
          <a href={`mailto:${SUPPORT_EMAIL}`} className={appButton()}>
            {SUPPORT_EMAIL}
          </a>
          <a
            href={`${REPO_URL}/issues/new`}
            target="_blank"
            rel="noopener noreferrer"
            className={appButton({ variant: "secondary" })}
          >
            <SiGithub className="size-4" />
            Report a bug
          </a>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-[13px] leading-none font-medium text-muted-foreground">Guides</h2>
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {GUIDES.map((g) => (
            <li key={g.to}>
              <Link to={g.to} className={ROW}>
                <g.icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium">{g.title}</span>
                  <span className="mt-0.5 block text-[13px] text-muted-foreground">{g.body}</span>
                </span>
                <ArrowRightIcon className="size-4 shrink-0 text-faint transition-[color,translate] group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            </li>
          ))}
          <li>
            <a
              href={`${REPO_URL}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className={ROW}
            >
              <LightbulbIcon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium">Suggest a feature</span>
                <span className="mt-0.5 block text-[13px] text-muted-foreground">
                  Ask for what you need on GitHub, or add your voice to an open request.
                </span>
              </span>
              <ArrowUpRightIcon className="size-4 shrink-0 text-faint transition-colors group-hover:text-foreground" />
            </a>
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-[13px] leading-none font-medium text-muted-foreground">
          Common questions
        </h2>
        <div className="mt-3 divide-y divide-border border-y border-border">
          {FAQ.map((item, i) => (
            <details key={item.q} className="group" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-[14px] font-medium [&::-webkit-details-marker]:hidden">
                {item.q}
                <PlusIcon
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                  strokeWidth={1.75}
                />
              </summary>
              <p className="pb-5 text-[14px] leading-relaxed text-pretty text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:decoration-foreground/25 [&_a]:underline-offset-[3px] [&_a:hover]:decoration-foreground/60 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-soft">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
