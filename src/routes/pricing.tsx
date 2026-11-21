import { createFileRoute } from "@tanstack/react-router";

import { Faq, Pricing } from "#/components/landing-page";
import { PageShell } from "#/components/page";
import { FAQ_ITEMS } from "#/lib/faq";
import { faqPage, seo, softwareApplication } from "#/lib/seo";

export const Route = createFileRoute("/pricing")({
  head: () =>
    seo({
      title: "Pricing · Stroke",
      description:
        "Stroke costs $9.99 once, not $100 a year. Try every feature free for 30 days, or contact us to license your whole company's email domain. No subscription.",
      path: "/pricing",
      breadcrumbs: [{ name: "Pricing", path: "/pricing" }],
      schema: [
        softwareApplication({
          path: "/pricing",
          description:
            "Stroke, a native database client for macOS, Windows and Linux: $9.99 once after a 30-day free trial.",
        }),
        faqPage(FAQ_ITEMS),
      ],
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
