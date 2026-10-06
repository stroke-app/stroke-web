import { SiGithub } from "@icons-pack/react-simple-icons";
import { Link } from "@tanstack/react-router";
import { ChevronDownIcon, MailIcon } from "lucide-react";
import { Children, isValidElement, useEffect, useState } from "react";

import { PageShell, siteButton, WRAP } from "#/components/page";
import { REPO_URL } from "#/components/site-chrome";
import { cn } from "#/lib/utils";

export const SUPPORT_EMAIL = "support@stroke.click";

const LEGAL_DOCS = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
] as const;

interface Highlight {
  icon: React.ElementType;
  title: string;
  body: string;
}

interface LegalPageProps {
  title: string;
  updated: string;
  intro: string;
  /** The page at a glance: four short points shown under the title. */
  highlights?: Highlight[];
  children: React.ReactNode;
}

function sectionId(number: string) {
  return `section-${number.replaceAll(/[^0-9a-z]+/gi, "")}`;
}

/**
 * The section currently being read: the last one whose top has passed a line
 * a fifth of the way down the window. Runs only in the browser.
 */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    // Read the ids back from `key`, so the effect depends on a stable string
    // rather than on a new array every render.
    const list = key.split(",").filter(Boolean);
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const current = list.find((id) => visible.has(id));
        if (current) setActive(current);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    for (const id of list) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [key]);

  return active;
}

function IndexLabel({ number, title }: { number: string; title: string }) {
  return (
    <span className="flex gap-3">
      <span className="w-5 shrink-0 pt-px font-mono text-[11px] text-faint tabular-nums">
        {number}
      </span>
      {title}
    </span>
  );
}

export function LegalPage({ title, updated, intro, highlights, children }: LegalPageProps) {
  // The index comes straight from the LegalSection children, so a new section
  // shows up in it without a second list to keep in sync.
  const sections = Children.toArray(children).flatMap((child) =>
    isValidElement<{ number: string; title: string }>(child) && child.type === LegalSection
      ? [
          {
            number: child.props.number,
            title: child.props.title,
            id: sectionId(child.props.number),
          },
        ]
      : [],
  );
  const active = useActiveSection(sections.map((s) => s.id));

  return (
    <PageShell>
      <header className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(55%_100%_at_30%_0%,rgb(255_255_255/0.06),transparent)]"
        />
        <div className={cn(WRAP, "relative pt-16 pb-14 md:pt-24 md:pb-20")}>
          {/* Privacy and Terms are a pair; switch between them in place. */}
          <nav
            aria-label="Legal documents"
            className="inline-flex rounded-lg border border-border bg-white/[0.02] p-1"
          >
            {LEGAL_DOCS.map((doc) => (
              <Link
                key={doc.to}
                to={doc.to}
                className="rounded-md px-3 py-1.5 text-[13px] transition-colors"
                activeProps={{ className: "bg-white/[0.08] text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              >
                {doc.label}
              </Link>
            ))}
          </nav>

          <h1 className="mt-10 max-w-4xl text-[2.5rem] text-balance sm:text-[3.25rem] md:text-[4rem]">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-pretty text-muted-foreground md:text-xl md:leading-[1.5]">
            {intro}
          </p>
          <p className="mt-6 text-[13px] text-muted-foreground">
            Last updated <time className="text-foreground">{updated}</time>
          </p>

          {highlights && (
            <ul className="mt-14 grid grid-cols-1 border-t border-l border-border sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((h) => (
                <li key={h.title} className="border-r border-b border-border p-6">
                  <h.icon className="size-[18px] text-muted-foreground" strokeWidth={1.6} />
                  <p className="mt-4 text-[15px] font-medium">{h.title}</p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-pretty text-muted-foreground">
                    {h.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div
        className={cn(
          WRAP,
          "grid grid-cols-1 gap-10 border-t border-border py-14 md:py-20 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-20",
        )}
      >
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-24">
            <p className="text-xs font-medium text-faint">On this page</p>
            <ol className="mt-3 border-l border-border">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={active === s.id ? "location" : undefined}
                    className={cn(
                      "-ml-px block border-l py-1.5 pl-3.5 text-[13px] transition-colors",
                      active === s.id
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                    )}
                  >
                    <IndexLabel number={s.number} title={s.title} />
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="min-w-0">
          {/* Below lg the aside is hidden, so the index folds into the top of the text. */}
          <details className="group mb-12 max-w-[44rem] rounded-xl border border-border lg:hidden">
            <summary className="flex h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
              On this page
              <ChevronDownIcon className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <ol className="border-t border-border px-4 py-3">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <IndexLabel number={s.number} title={s.title} />
                  </a>
                </li>
              ))}
            </ol>
          </details>

          <div className="max-w-[44rem] space-y-14">{children}</div>

          <ContactCard />
        </div>
      </div>
    </PageShell>
  );
}

function ContactCard() {
  return (
    <div className="mt-20 max-w-[44rem] rounded-2xl border border-border bg-card p-7 sm:p-9">
      <p className="text-xl font-semibold tracking-[-0.02em]">Questions about any of this?</p>
      <p className="mt-2 text-[15px] leading-relaxed text-pretty text-muted-foreground">
        Email us and a person reads it. For privacy requests, say what you need (a copy of your
        data, a correction, or deletion) and we'll take it from there.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <a href={`mailto:${SUPPORT_EMAIL}`} className={siteButton()}>
          <MailIcon className="size-4" strokeWidth={1.75} />
          {SUPPORT_EMAIL}
        </a>
        <a
          href={`${REPO_URL}/issues`}
          target="_blank"
          rel="noopener noreferrer"
          className={siteButton({ variant: "secondary" })}
        >
          <SiGithub className="size-4" />
          Open an issue
        </a>
      </div>
    </div>
  );
}

export function LegalSection({
  number,
  title,
  summary,
  children,
}: {
  number: string;
  title: string;
  /** One plain sentence shown before the full text. */
  summary?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={sectionId(number)} className="scroll-mt-24">
      <p className="font-mono text-[12px] text-faint tabular-nums">{number}</p>
      <h2 className="mt-2 text-[1.5rem] leading-tight">{title}</h2>
      {summary && (
        <p className="mt-4 border-l-2 border-white/20 pl-4 text-[15px] leading-relaxed text-pretty text-foreground">
          <span className="font-[510]">In short:</span> {summary}
        </p>
      )}
      <div className="mt-5 space-y-4 text-[15.5px] leading-[1.75] text-pretty text-soft [&_a]:text-foreground [&_a]:underline [&_a]:decoration-white/25 [&_a]:underline-offset-[3px] [&_a]:transition-colors [&_a:hover]:decoration-white/70 [&_strong]:font-medium [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="relative pl-5">
          <span
            className="absolute top-[0.78em] left-1 size-[5px] rounded-full bg-white/25"
            aria-hidden="true"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}
