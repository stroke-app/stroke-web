import { createFileRoute, Link } from "@tanstack/react-router";

import { GiveawayCard } from "#/components/giveaway";
import { NextLinks, PageBody, PageHeader, PageShell } from "#/components/page";
import { giveawayQueryOptions } from "#/lib/giveaway/functions";
import { seo } from "#/lib/seo";

export const Route = createFileRoute("/giveaway")({
  loader: ({ context }) => context.queryClient.ensureQueryData(giveawayQueryOptions()),
  head: () =>
    seo({
      title: "Weekly giveaway · Win a free Stroke license",
      description:
        "Every week one Stroke user wins a free lifetime license. Enter once a week with your Stroke account; a winner is drawn at random every Monday and gets the license by email.",
      path: "/giveaway",
      breadcrumbs: [{ name: "Weekly giveaway", path: "/giveaway" }],
    }),
  component: GiveawayPage,
});

const STEPS = [
  {
    title: "Sign in and enter",
    body: "Use your Stroke account and press Enter. It takes one click, once a week.",
  },
  {
    title: "Wait for Monday",
    body: "Entries close Monday at 00:00 UTC. A few minutes later one entrant is drawn at random.",
  },
  {
    title: "Get your license",
    body: "The winner gets a lifetime license by email, and it shows up on their account page.",
  },
];

const RULES = [
  "Free to enter. No purchase is necessary, and buying Stroke doesn't improve your chances.",
  "One entry per Stroke account per week. The account needs a verified email address.",
  "A week runs from Monday 00:00 UTC to the next Monday 00:00 UTC. Entries don't carry over, so enter again each week.",
  "Anyone who doesn't already own a Stroke license can enter. That leaves out people covered by a Team purchase, since they already have Stroke. Eligibility is checked again at draw time.",
  "One winner is drawn each week, uniformly at random from the eligible entries, by an automated draw shortly after the week closes.",
  "The prize is one lifetime Stroke license for up to 2 devices with every future update, the same license the $9.99 purchase gives. It has no cash value and can't be transferred.",
  "The winner is emailed at the address on their account. Their first name and last initial may be shown on this site as last week's winner.",
  "Entering from multiple accounts, or any other attempt to game the draw, disqualifies every entry involved.",
  "The giveaway may be changed or ended at any time, and is void where prohibited by law.",
];

function GiveawayPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Weekly giveaway"
        title="Win a Stroke license, every week"
        description="One free lifetime license goes to a random entrant every Monday. Entering is free and takes one click."
      />
      <PageBody wide>
        <GiveawayCard showRulesLink={false} />

        <section className="mt-16">
          <h2 className="text-lg font-semibold tracking-tight">How it works</h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-border bg-card p-6">
                <span className="text-sm font-medium text-copper tabular-nums">0{i + 1}</span>
                <p className="mt-3 text-sm font-medium">{step.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section id="rules" className="mt-16 max-w-3xl scroll-mt-20">
          <h2 className="text-lg font-semibold tracking-tight">Rules</h2>
          <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-copper marker:tabular-nums">
            {RULES.map((rule) => (
              <li key={rule} className="pl-1 text-pretty">
                {rule}
              </li>
            ))}
          </ol>
        </section>

        <NextLinks>
          <Link to="/pricing">Pricing →</Link>
          <Link to="/download">Download →</Link>
          <Link to="/terms">Terms of Service →</Link>
        </NextLinks>
      </PageBody>
    </PageShell>
  );
}
