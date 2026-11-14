import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRightIcon } from "lucide-react";

import { LEGAL_DOCS } from "#/components/legal";
import { PageShell, WRAP } from "#/components/page";
import { seo } from "#/lib/seo";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/legal")({
  head: () =>
    seo({
      title: "Legal · Stroke database client",
      description: "Stroke's Privacy Policy, Terms of Service and Security policy, in one place.",
      path: "/legal",
      breadcrumbs: [{ name: "Legal", path: "/legal" }],
    }),
  component: LegalIndex,
});

/** T3's legal page: a heading, one line, and the documents as a numbered list. */
function LegalIndex() {
  return (
    <PageShell>
      <div className={cn(WRAP, "max-w-3xl pt-20 pb-28 md:pt-28")}>
        <p className="text-[13px] text-muted-foreground">Stroke / Legal</p>
        <h1 className="mt-4 text-[2.75rem] font-semibold tracking-[-0.03em] md:text-[3.5rem]">
          Legal
        </h1>
        <p className="mt-4 text-[17px] text-muted-foreground">
          Policies and terms for Stroke, collected in one place.
        </p>
        <ol className="mt-12 flex flex-col divide-y divide-border border-y border-border">
          {LEGAL_DOCS.map((doc, i) => (
            <li key={doc.to}>
              <Link to={doc.to} className="group flex items-start gap-5 py-6 transition-colors">
                <span className="pt-0.5 font-mono text-[13px] text-faint tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-semibold text-foreground">
                    {doc.label}
                  </span>
                  <span className="mt-1 block text-[15px] text-muted-foreground">{doc.blurb}</span>
                </span>
                <ArrowUpRightIcon
                  className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </PageShell>
  );
}
