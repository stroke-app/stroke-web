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

import { SUPPORT_EMAIL } from "#/components/legal";
import { siteButton } from "#/components/page";
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
        A license is active on up to 2 devices at a time. To move it to a new machine, deactivate it
        in Stroke on the old one (Settings → License). If that machine is gone, email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and we'll free the slot.
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
  "group flex items-center gap-4 py-4 transition-colors hover:bg-white/[0.02] sm:-mx-3 sm:px-3 sm:rounded-lg";

function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <header>
        <h1 className="text-[1.75rem] leading-tight md:text-[2rem]">Support</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Questions, bugs, or a problem with your license. Here's how to reach us.
        </p>
      </header>

      <section className="mt-10 rounded-xl border border-border bg-card p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
            <MailIcon className="size-[18px] text-muted-foreground" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h2 className="text-[17px] leading-snug">Email us</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-pretty text-muted-foreground">
              For your license, billing, or anything private. Write from the address on your account
              so we can find your purchase, and we'll reply by email.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2.5 sm:pl-14">
          <a href={`mailto:${SUPPORT_EMAIL}`} className={siteButton()}>
            {SUPPORT_EMAIL}
          </a>
          <a
            href={`${REPO_URL}/issues/new`}
            target="_blank"
            rel="noopener noreferrer"
            className={siteButton({ variant: "secondary" })}
          >
            <SiGithub className="size-4" />
            Report a bug
          </a>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-[13px] leading-none text-muted-foreground">Guides</h2>
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {GUIDES.map((g) => (
            <li key={g.to}>
              <Link to={g.to} className={ROW}>
                <g.icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-[510]">{g.title}</span>
                  <span className="mt-0.5 block text-[14px] text-muted-foreground">{g.body}</span>
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
                <span className="block text-[15px] font-[510]">Suggest a feature</span>
                <span className="mt-0.5 block text-[14px] text-muted-foreground">
                  Ask for what you need on GitHub, or add your voice to an open request.
                </span>
              </span>
              <ArrowUpRightIcon className="size-4 shrink-0 text-faint transition-colors group-hover:text-foreground" />
            </a>
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-[13px] leading-none text-muted-foreground">Common questions</h2>
        <div className="mt-3 divide-y divide-border border-y border-border">
          {FAQ.map((item, i) => (
            <details key={item.q} className="group" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-[15px] font-[510] [&::-webkit-details-marker]:hidden">
                {item.q}
                <PlusIcon
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                  strokeWidth={1.75}
                />
              </summary>
              <p className="pb-5 text-[15px] leading-relaxed text-pretty text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:decoration-white/25 [&_a]:underline-offset-[3px] [&_a:hover]:decoration-white/60 [&_code]:rounded [&_code]:bg-white/[0.06] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-soft">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
