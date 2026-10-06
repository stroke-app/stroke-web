import { createFileRoute, Link } from "@tanstack/react-router";
import { CodeIcon, LaptopIcon, ReceiptIcon, TimerIcon } from "lucide-react";

import { LegalList, LegalPage, LegalSection, SUPPORT_EMAIL } from "#/components/legal";
import { REPO_URL } from "#/components/site-chrome";
import { seo } from "#/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    seo({
      title: "Terms of Service · Stroke database client",
      description:
        "The terms for the Stroke database client, stroke.click, and Stroke licenses: a 17-day free trial, a one-time $9.99 license for 2 devices, and a source-available app.",
      path: "/terms",
      breadcrumbs: [{ name: "Terms of Service", path: "/terms" }],
    }),
  component: TermsPage,
});

const HIGHLIGHTS = [
  {
    icon: TimerIcon,
    title: "Free for 17 days",
    body: "Every feature, no account or card, on each device.",
  },
  {
    icon: ReceiptIcon,
    title: "$9.99, once",
    body: "A license never renews or expires, and includes every update.",
  },
  {
    icon: LaptopIcon,
    title: "Two devices",
    body: "Each license runs on 2 devices at a time. Move it whenever you like.",
  },
  {
    icon: CodeIcon,
    title: "Source available",
    body: "Read, build, and use the code freely. Just don't sell it.",
  },
];

function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="October 6, 2026"
      intro="These terms cover the Stroke desktop app, the stroke.click website, and Stroke licenses. They're written to be read. The short version: try the app free, buy a license once and it's yours, and use both in good faith."
      highlights={HIGHLIGHTS}
    >
      <LegalSection number="01" title="Who we are">
        <p>
          Stroke is a desktop database client distributed from{" "}
          <a href="https://stroke.click">stroke.click</a>. "Stroke", "we", and "us" refer to its
          developer. By creating an account, buying a license, or using the website, you agree to
          these terms. Using the desktop app alone needs no account; the software license in section
          02 covers it.
        </p>
      </LegalSection>

      <LegalSection
        number="02"
        title="The software and its license"
        summary="Free to use and read; not for resale."
      >
        <p>
          Stroke's source is public under the{" "}
          <a href={`${REPO_URL}/blob/master/LICENSE`} target="_blank" rel="noopener noreferrer">
            Stroke Sustainable Use License
          </a>
          . You may use Stroke for free, personally or at work, and read, modify, and build its
          source, Pro features included. You may not sell it, charge for it, rebrand it as your own
          product, or offer it to others as a paid product or hosted service.
        </p>
        <p>
          Pro features in official builds unlock with a license key. Removing or bypassing the
          license checks in builds you distribute is not permitted. Where this section and the
          license file differ, the license file governs the software.
        </p>
      </LegalSection>

      <LegalSection
        number="03"
        title="Free trial"
        summary="17 days of every feature on each device, no account needed."
      >
        <p>
          The first time you open Stroke on a device, a 17-day trial starts with every feature
          unlocked. No account or payment is needed. When the trial ends, the Pro features need a
          license.
        </p>
      </LegalSection>

      <LegalSection
        number="04"
        title="Accounts"
        summary="Sign in with GitHub or Google; one account per person."
      >
        <p>
          An account is only needed to buy and manage a license, or to enter the giveaway. You can
          sign in with GitHub or Google; if both use the same verified email, they share one
          account. You're responsible for activity under your account and agree to give accurate
          information. We may suspend accounts that abuse the service, for example by attempting to
          defraud the licensing system or attack the website.
        </p>
      </LegalSection>

      <LegalSection
        number="05"
        title="Licenses"
        summary="One payment, yours for good, on up to 2 devices."
      >
        <p>
          A personal license is a <strong>one-time purchase of $9.99</strong>. When you buy one:
        </p>
        <LegalList
          items={[
            <>
              You <strong>own it permanently</strong>. It is not a subscription. It never renews,
              never expires, and includes every future update.
            </>,
            <>
              You get a <strong>license key</strong> tied to your account that can be active on up
              to <strong>2 devices</strong> at a time. Deactivate it in the app on a device you no
              longer use to free a slot, or email us if that device is gone.
            </>,
            "The license is personal. Don't publish, resell, or share your key; we may revoke keys that are leaked or abused.",
          ]}
        />
        <p>
          A <strong>Team license</strong> is a one-time purchase of $99 that covers everyone who
          signs in with an email on your company's domain, each with their own key. It needs a
          company domain; public email providers don't qualify. Team licenses are currently arranged
          by email at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </LegalSection>

      <LegalSection
        number="06"
        title="Payments and refunds"
        summary="No recurring charges; problems fixed within 14 days."
      >
        <p>
          Payments are processed by <strong>Dodo Payments</strong>, our payment provider and
          merchant of record. We never see or store your card details. Prices are shown at checkout
          in USD unless stated otherwise.
        </p>
        <p>
          A license is a single payment, so there's nothing to cancel. If something went wrong (a
          duplicate charge, a mistake at checkout, or a license that won't activate), email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> within 14 days and we'll make it
          right.
        </p>
      </LegalSection>

      <LegalSection
        number="07"
        title="AI features"
        summary="Free AI has daily limits, and its answers need checking."
      >
        <p>
          Stroke includes a free AI tier with daily limits per device and per network. It's offered
          as is, and its limits, models, and availability may change or end at any time. If you
          connect your own AI provider instead, that provider's terms apply to your use of it.
        </p>
        <p>
          AI output can be wrong.{" "}
          <strong>Review any SQL an assistant suggests before you run it</strong>, especially
          statements that change or delete data. You're responsible for what runs against your
          databases. Don't use the free tier to generate unlawful content or to resell access to it.
        </p>
      </LegalSection>

      <LegalSection number="08" title="Weekly giveaway">
        <p>
          The weekly free-license giveaway is free to enter, one entry per account per week, and
          open to anyone who doesn't already own a license. The full rules, including how the winner
          is drawn and shown, are on the <Link to="/giveaway">giveaway page</Link> and form part of
          these terms.
        </p>
      </LegalSection>

      <LegalSection number="09" title="Reviews">
        <p>
          When you submit a review, you let us publish it on stroke.click with the name and title
          you provide. We may choose not to publish a review, or remove one later.
        </p>
      </LegalSection>

      <LegalSection number="10" title="Acceptable use">
        <p>When using the website, licensing service, and free AI tier, you agree not to:</p>
        <LegalList
          items={[
            "Probe, disrupt, or overload the service, or access accounts or data that aren't yours.",
            "Circumvent, spoof, or reverse-engineer license verification, or use keys you didn't buy.",
            "Get around usage limits, for example by rotating device identifiers.",
            "Use the service in violation of the laws that apply to you.",
          ]}
        />
      </LegalSection>

      <LegalSection number="11" title="Your data and your databases">
        <p>
          Stroke connects to your databases directly from your device. Your credentials, queries,
          and results stay on your machine and are never sent to our servers. What we do collect is
          described in the <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection number="12" title="Disclaimer of warranty">
        <p>
          The software and the service are provided <strong>"as is"</strong> and{" "}
          <strong>"as available"</strong>, without warranties of any kind, express or implied,
          including merchantability, fitness for a particular purpose, and non-infringement. Stroke
          operates on your databases at your direction; you're responsible for your own backups and
          for the queries you run.
        </p>
      </LegalSection>

      <LegalSection number="13" title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, we aren't liable for any indirect, incidental,
          special, or consequential damages, or for loss of data, profits, or business, arising from
          your use of the software or the service. Our total liability for any claim is limited to
          the amount you paid us in the 12 months before the claim arose.
        </p>
      </LegalSection>

      <LegalSection number="14" title="Changes to these terms">
        <p>
          We may update these terms as Stroke evolves. If a change is material, we'll note it on
          this page and update the date at the top. Continuing to use the service after a change
          takes effect means you accept the new terms.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
