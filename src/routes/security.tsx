import { createFileRoute } from "@tanstack/react-router";
import { KeyRoundIcon, LockIcon, PlugIcon, ShieldCheckIcon } from "lucide-react";

import { LegalList, LegalPage, LegalSection, SUPPORT_EMAIL } from "#/components/legal";
import { seo } from "#/lib/seo";

export const Route = createFileRoute("/security")({
  head: () =>
    seo({
      title: "Security · Stroke database client",
      description:
        "How Stroke protects your databases and credentials: direct connections, the OS keychain, end-to-end encrypted sync, signed updates, a local-only MCP server, and how to report a vulnerability.",
      path: "/security",
      breadcrumbs: [
        { name: "Legal", path: "/legal" },
        { name: "Security", path: "/security" },
      ],
    }),
  component: SecurityPage,
});

const HIGHLIGHTS = [
  {
    icon: LockIcon,
    title: "Direct connections",
    body: "Stroke talks to your database from your machine. Nothing is proxied.",
  },
  {
    icon: KeyRoundIcon,
    title: "Secrets in the keychain",
    body: "Passwords and tokens go to the OS keychain, not a file.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Encrypted sync",
    body: "End-to-end encrypted. Our servers hold ciphertext only.",
  },
  {
    icon: PlugIcon,
    title: "Local-only MCP",
    body: "The agent server listens on 127.0.0.1 and needs a token.",
  },
];

function SecurityPage() {
  return (
    <LegalPage
      title="Security"
      updated="November 14, 2026"
      intro="A database client holds the keys to production. This page describes how Stroke handles that, where its responsibility ends, and how to tell me about a problem."
      highlights={HIGHLIGHTS}
    >
      <LegalSection
        number="01"
        title="Your databases and credentials"
        summary="Direct connections from your device; secrets in the OS keychain."
      >
        <LegalList
          items={[
            "Stroke connects to your databases directly from your computer. Queries and results never pass through our servers.",
            "Passwords, tokens and API keys are stored in the operating system's keychain (Keychain on macOS, Credential Manager on Windows, the Secret Service on Linux).",
            "TLS is available for every engine that supports it, and SSH tunnels for reaching databases on private networks.",
            "Any connection can be opened read-only, which blocks writes in the editor, the grid and the AI.",
          ]}
        />
      </LegalSection>

      <LegalSection
        number="02"
        title="Sync"
        summary="End-to-end encrypted with a passphrase only you know."
      >
        <p>
          When you turn on sync, each record (a connection, a workspace, your settings) is encrypted
          on your device with XChaCha20-Poly1305 before upload. The key is wrapped with a key
          derived from your sync passphrase using Argon2id. Our servers store only ciphertext and
          the wrapped key, so they cannot read your data, and a lost passphrase cannot be recovered
          by us.
        </p>
      </LegalSection>

      <LegalSection
        number="03"
        title="AI and the MCP server"
        summary="Agents get what you allow, and only from your machine."
      >
        <LegalList
          items={[
            "The MCP server binds to 127.0.0.1, requires a token, and refuses requests from other origins, which blocks DNS-rebinding attacks from web pages.",
            "You choose what an agent may run: read only, read and write, schema changes, or full access. Each statement is checked before it runs.",
            "The built-in AI asks before running anything destructive.",
            "When you use your own AI provider, data goes from your machine to that provider under its terms.",
          ]}
        />
      </LegalSection>

      <LegalSection
        number="04"
        title="Licenses and updates"
        summary="Signed licenses, signed updates."
      >
        <LegalList
          items={[
            "License entitlements are signed with Ed25519 and bound to the device they were issued to, so a copied file doesn't grant Pro elsewhere.",
            "Updates are signed, and the app verifies the signature before installing anything.",
          ]}
        />
      </LegalSection>

      <LegalSection
        number="05"
        title="Report a vulnerability"
        summary="Email me privately; please don't open a public issue."
      >
        <p>
          Send details to{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Security%20report`}
            className="underline underline-offset-2"
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          with “Security report” in the subject: what you found, how to reproduce it, and the
          version you tested. I'll confirm I got it, keep you posted while I fix it, and credit you
          in the changelog if you'd like. Please give me a reasonable chance to ship a fix before
          publishing.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
