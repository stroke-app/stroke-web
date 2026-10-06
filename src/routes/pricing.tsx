import { createFileRoute } from "@tanstack/react-router";

import { Faq, Pricing } from "#/components/landing-page";
import { SITE } from "#/components/page";
import { SiteFooter, SiteHeader } from "#/components/site-chrome";
import { seo } from "#/lib/seo";

export const Route = createFileRoute("/pricing")({
  head: () =>
    seo({
      title: "Pricing · Stroke",
      description:
        "Stroke costs $9.99 once, not $100 a year. Try every feature free, buy a license for 2 devices, or license your whole company's email domain for $99. No subscription.",
      path: "/pricing",
      breadcrumbs: [{ name: "Pricing", path: "/pricing" }],
    }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className={SITE}>
      <SiteHeader />
      <main>
        <Pricing as="h1" />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  );
}
