import { Children, isValidElement } from "react";

import { PageBody, PageHeader, PageShell, SideNav } from "#/components/page";

interface LegalPageProps {
  title: string;
  updated: string;
  intro: string;
  children: React.ReactNode;
}

function sectionId(number: string) {
  return `section-${number.replaceAll(/[^0-9a-z]+/gi, "")}`;
}

export function LegalPage({ title, updated, intro, children }: LegalPageProps) {
  // The index comes straight from the LegalSection children, so a new section
  // shows up in it without a second list to keep in sync.
  const sections = Children.toArray(children).flatMap((child) =>
    isValidElement<{ number: string; title: string }>(child) && child.type === LegalSection
      ? [{ number: child.props.number, title: child.props.title }]
      : [],
  );

  return (
    <PageShell>
      <PageHeader eyebrow={`Last updated ${updated}`} title={title} description={intro} />
      <PageBody
        aside={
          sections.length > 0 && (
            <SideNav
              title="Sections"
              items={sections.map((s) => ({ label: s.title, hash: sectionId(s.number) }))}
            />
          )
        }
      >
        <div className="space-y-10">{children}</div>
      </PageBody>
    </PageShell>
  );
}

export function LegalSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={sectionId(number)} className="scroll-mt-20">
      <h2 className="flex items-baseline gap-3 text-lg font-semibold tracking-tight">
        <span className="text-sm font-medium text-copper tabular-nums">{number}</span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-foreground [&_strong]:font-medium [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-[9px] size-1 shrink-0 rounded-full bg-copper" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
