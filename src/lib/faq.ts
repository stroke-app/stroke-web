import { SHIPPED_ENGINES } from "#/lib/engines";
import { PRO_PRICE, TRIAL_DAYS } from "#/lib/pricing";

/**
 * The questions on the homepage and /pricing. The same list goes out as
 * FAQPage structured data and in /llms.txt, so search engines and AI
 * assistants quote the answers as written here.
 */
export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "How much does Stroke cost?",
    a: `${PRO_PRICE}, one time. No subscription, no yearly renewal and no paid upgrade later. Every feature is free for ${TRIAL_DAYS} days first.`,
  },
  {
    q: "Do I need an account?",
    a: "Yes. Sign in with Google or GitHub when you first open the app. Your trial and your purchase belong to that account, so they follow you to up to 3 computers you sign in on.",
  },
  {
    q: "I bought a license key for an older version. Does it still work?",
    a: "Yes. Sign in with the email you bought it with and Pro is already on your account. There is no key to enter any more.",
  },
  {
    q: "Which databases does Stroke support?",
    a: `${SHIPPED_ENGINES.length} of them: PostgreSQL, MySQL, MariaDB, SQLite, SQL Server, Oracle, CockroachDB, DuckDB, ClickHouse, Turso, Cloudflare D1, MongoDB, Redis, Valkey, DynamoDB, Elasticsearch, OpenSearch and more. The databases page lists them all.`,
  },
  {
    q: "Does Stroke see my credentials or data?",
    a: "No. Stroke connects to your databases straight from your computer, and passwords are kept in your OS keychain. Query results never pass through our servers. Synced connections are end-to-end encrypted.",
  },
  {
    q: "Can I read the source?",
    a: "Yes. The whole app, Pro features included, is on GitHub. Read it, audit it and build it yourself; reselling it isn't allowed.",
  },
];
