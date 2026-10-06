import { createFileRoute, Link } from "@tanstack/react-router";
import { BanIcon, HardDriveIcon, KeyRoundIcon, ShieldCheckIcon } from "lucide-react";

import { LegalList, LegalPage, LegalSection, SUPPORT_EMAIL } from "#/components/legal";
import { seo } from "#/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seo({
      title: "Privacy Policy · Stroke database client",
      description:
        "What the Stroke database client and stroke.click collect, what they never collect, and your choices. Your database credentials, queries, and data never leave your device.",
      path: "/privacy",
      breadcrumbs: [{ name: "Privacy Policy", path: "/privacy" }],
    }),
  component: PrivacyPage,
});

const HIGHLIGHTS = [
  {
    icon: HardDriveIcon,
    title: "Your databases stay with you",
    body: "Credentials, queries, and results never leave your device.",
  },
  {
    icon: KeyRoundIcon,
    title: "Accounts only for licenses",
    body: "Name, email, and license records, from GitHub or Google sign-in.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Anonymous app analytics",
    body: "Counts of launches and features used. Never your data.",
  },
  {
    icon: BanIcon,
    title: "No ads, no selling",
    body: "We don't sell data or share it for advertising. Ever.",
  },
];

function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="October 6, 2026"
      intro="Stroke is built on a simple boundary: the desktop app works with your databases on your machine, and our servers handle accounts, licenses, and a few anonymous counts. This policy describes what crosses that boundary, what never does, and the choices you have."
      highlights={HIGHLIGHTS}
    >
      <LegalSection
        number="01"
        title="What stays on your device"
        summary="Everything about your databases lives only on your computer."
      >
        <p>
          Connection details (hosts, ports, usernames, passwords, file paths, and tokens), saved
          queries, dashboards, AI provider keys you add, and your preferences are stored locally on
          your device. Stroke connects to your databases directly from your machine. Nothing is
          proxied through our servers, and{" "}
          <strong>we never receive your credentials, schemas, queries, or query results</strong>.
        </p>
        <p>
          If you connect the built-in AI chat to your own AI provider, or connect an MCP client such
          as Claude or Cursor to Stroke, data flows directly between your machine and that provider,
          under its terms, not ours.
        </p>
      </LegalSection>

      <LegalSection
        number="02"
        title="What the desktop app sends us"
        summary="License checks, your trial clock, anonymous usage counts, and free AI requests if you use them."
      >
        <LegalList
          items={[
            <>
              <strong>License activation and checks.</strong> Your license key, a device identifier,
              and the device's hostname, used to enforce the 2-device limit and to free a slot when
              you deactivate a device.
            </>,
            <>
              <strong>Your free trial.</strong> The device identifier and the date the 17-day trial
              started, so the trial runs once per device.
            </>,
            <>
              <strong>Anonymous usage analytics.</strong> A random device identifier, the operating
              system, the app version, how many times the app launched each day, and how often
              features were used, counted from a fixed list of feature names. These counts never
              include database names, schemas, queries, or results.
            </>,
            <>
              <strong>The free AI tier, if you use it.</strong> Your messages are sent through our
              servers to the AI model that answers them (see section 07). We don't store your
              messages or the replies. We count requests per device and per IP address each day to
              keep the free tier fair. Operational logs can briefly hold a short fragment of a reply
              while we diagnose a failure. Anything you put in a message, including schema or data
              you choose to share, goes to the model to get an answer.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection
        number="03"
        title="Your account"
        summary="Accounts exist for licensing, and hold what sign-in and licensing need."
      >
        <p>When you sign in with GitHub or Google, we receive and store:</p>
        <LegalList
          items={[
            "Your name, email address, and avatar from the provider you chose. We never see your password.",
            "If you later sign in with the other provider using the same verified email, both sign-ins are linked to one account.",
            "Session data: a cookie that keeps you signed in, plus your IP address and browser user agent, kept for session security.",
            <>
              <strong>License records</strong>: your license key, plan, and the devices it's active
              on.
            </>,
            <>
              <strong>Payment records</strong>: the status and amount of payments, kept for
              accounting. Checkout happens on Dodo Payments; card details never reach our servers.
            </>,
            <>
              <strong>Team licenses</strong>: the email domain a Team purchase covers. When you sign
              in, we check your email's domain to see whether a Team license covers you.
            </>,
          ]}
        />
        <p>Two optional features add a little more, only if you use them:</p>
        <LegalList
          items={[
            <>
              <strong>The weekly giveaway</strong> records your entry for that week. If you win, we
              email you, and your first name and last initial may be shown on the site as last
              week's winner. See the <Link to="/giveaway">giveaway rules</Link>.
            </>,
            "Reviews you submit are published on the site with the name and title you give, once approved.",
          ]}
        />
      </LegalSection>

      <LegalSection
        number="04"
        title="Email"
        summary="We email you about purchases and the giveaway, and occasionally about Stroke."
      >
        <p>
          When you create an account, your name and email are added to Plunk, the service we use to
          send email. We use it for messages about your purchases (a confirmation, or a notice if a
          payment fails), for giveaway results, and for occasional product updates. You can stop
          product updates at any time by unsubscribing from one, or by emailing{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </LegalSection>

      <LegalSection number="05" title="What we never do">
        <LegalList
          items={[
            "Collect your database credentials, schemas, queries, or query results.",
            "Sell personal data, or share it with anyone for advertising.",
            "Run ads, or load advertising trackers on the site or in the app.",
          ]}
        />
      </LegalSection>

      <LegalSection
        number="06"
        title="Cookies and local storage"
        summary="A sign-in cookie always; analytics only if you accept them."
      >
        <p>
          A session cookie keeps you signed in. It's essential to the site and doesn't need consent.
          Your theme choice in the dashboard and your cookie choice are remembered in your browser's
          local storage, not in cookies.
        </p>
        <p>
          We use privacy-friendly product analytics (PostHog) on the website to learn which pages
          are useful, <strong>only after you accept</strong> through the cookie banner. If you
          decline, no analytics cookies are set and nothing is tracked, and the site works the same
          either way. You can change your choice by clearing this site's storage. We never use
          advertising cookies.
        </p>
      </LegalSection>

      <LegalSection number="07" title="Services we rely on">
        <p>A small number of providers process data on our behalf, each for one job:</p>
        <LegalList
          items={[
            <>
              <strong>Cloudflare</strong> hosts the website, the database, and the licensing API,
              and runs the free AI tier's models (Workers AI). Requests to stroke.click pass through
              Cloudflare's network.
            </>,
            <>
              <strong>Groq, Cerebras, and OpenRouter</strong> answer free AI tier requests when
              Cloudflare's daily allocation runs out.
            </>,
            <>
              <strong>Dodo Payments</strong> processes checkout as merchant of record and handles
              billing details under its own privacy policy.
            </>,
            <>
              <strong>GitHub and Google</strong> provide sign-in. Installers are served from GitHub
              Releases, so downloading Stroke is a request to GitHub.
            </>,
            <>
              <strong>Plunk</strong> sends our email.
            </>,
            <>
              <strong>PostHog</strong> provides website analytics, loaded through a same-origin
              proxy and only after you opt in.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number="08" title="How long we keep data">
        <p>
          Account and license records are kept while your account exists, and payment records as
          long as accounting rules require. Device activations are removed when you deactivate a
          device. Usage counts and free AI request counts are kept as daily totals. If you delete
          your account, we delete your personal data, keeping only what payment regulations oblige
          us to retain.
        </p>
      </LegalSection>

      <LegalSection number="09" title="Security">
        <p>
          Your database credentials never reach us, so they can't leak from us. Everything between
          the app, the website, and our servers travels over HTTPS, payments are handled entirely by
          Dodo Payments, and access to our systems is limited to the people who run Stroke. The
          app's source is public, so anyone can check what it sends.
        </p>
      </LegalSection>

      <LegalSection
        number="10"
        title="Your rights"
        summary="See, correct, export, or delete your data by asking."
      >
        <p>
          You can view and update your account details from your dashboard, and ask for a copy of
          your data, a correction, or deletion at any time by emailing{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Laws like the GDPR and the CCPA
          give some people these rights formally; we honor them for everyone.
        </p>
      </LegalSection>

      <LegalSection number="11" title="Children">
        <p>
          Stroke is a tool for professionals and isn't directed at children under 16. We don't
          knowingly collect data from them; if you believe a child has created an account, email us
          and we'll delete it.
        </p>
      </LegalSection>

      <LegalSection number="12" title="Changes to this policy">
        <p>
          If what we collect changes, we'll update this page and the date at the top, and call out
          the change in the release notes before it ships. The terms that govern the service are in
          the <Link to="/terms">Terms of Service</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
