import { createFileRoute } from "@tanstack/react-router";

import { Faq, Pricing } from "#/components/landing-page";
import { PageShell } from "#/components/page";
import { seo } from "#/lib/seo";

export const Route = createFileRoute("/pricing")({
  head: () =>
    seo({
      title: "Pricing · Stroke",
      description:
        "Stroke costs $9.99 once, not $100 a year. Try every feature free for 17 days, or license your whole company's email domain for $99. No subscription.",
      path: "/pricing",
      breadcrumbs: [{ name: "Pricing", path: "/pricing" }],
    }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <PageShell>
      <Pricing as="h1" />
      <Faq />
    </PageShell>
  );
}
