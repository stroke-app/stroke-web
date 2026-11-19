import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

/**
 * The Stroke 3 announcement, sent once to every contact as a Plunk campaign.
 * Its own frame (wider, a dark hero) rather than the transactional layout.
 * Images are JPGs in public/email/, since Outlook can't show WebP.
 */

const SITE = "https://stroke.click";
const font = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const mono = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

const c = {
  ink: "#09090b",
  body: "#3f3f46",
  muted: "#71717a",
  faint: "#a1a1aa",
  line: "#e4e4e7",
  wash: "#f4f4f5",
  card: "#fafafa",
  accent: "#7c5cff",
};

const st = {
  body: { backgroundColor: c.wash, fontFamily: font, margin: 0, padding: "32px 0" },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: `1px solid ${c.line}`,
    overflow: "hidden",
  },
  hero: { backgroundColor: c.ink, padding: "36px 40px 0" },
  wordmark: { color: "#ffffff", fontSize: "17px", fontWeight: 600, margin: 0 },
  pill: {
    display: "inline-block",
    color: "#d4ccff",
    backgroundColor: "#1f1a33",
    border: "1px solid #3a3160",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    padding: "4px 10px",
    margin: "28px 0 0",
  },
  h1: {
    color: "#ffffff",
    fontSize: "34px",
    lineHeight: "40px",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    margin: "14px 0 12px",
  },
  lead: { color: "#c4c4cc", fontSize: "16px", lineHeight: "26px", margin: "0 0 24px" },
  primary: {
    backgroundColor: "#ffffff",
    color: c.ink,
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 600,
    padding: "13px 22px",
    textDecoration: "none",
  },
  secondary: { color: "#c4c4cc", fontSize: "14px", lineHeight: "20px", margin: "16px 0 0" },
  secondaryLink: { color: "#c4c4cc", textDecoration: "underline" },
  heroShot: {
    display: "block",
    width: "100%",
    height: "auto",
    borderRadius: "12px 12px 0 0",
    marginTop: "32px",
  },
  section: { padding: "36px 40px 0" },
  kicker: {
    color: c.accent,
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    margin: "0 0 6px",
  },
  h2: {
    color: c.ink,
    fontSize: "22px",
    lineHeight: "28px",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    margin: "0 0 8px",
  },
  intro: { color: c.body, fontSize: "15px", lineHeight: "24px", margin: "0 0 18px" },
  featTitle: {
    color: c.ink,
    fontSize: "15px",
    lineHeight: "22px",
    fontWeight: 600,
    margin: "0 0 2px",
  },
  featBody: { color: c.body, fontSize: "14px", lineHeight: "22px", margin: 0 },
  feat: { paddingBottom: "16px" },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    backgroundColor: c.accent,
    marginTop: "7px",
  },
  shot: {
    display: "block",
    width: "100%",
    height: "auto",
    borderRadius: "10px",
    border: `1px solid ${c.line}`,
    margin: "4px 0 20px",
  },
  link: { color: c.accent, textDecoration: "underline" },
  labs: {
    backgroundColor: c.card,
    border: `1px solid ${c.line}`,
    borderRadius: "12px",
    padding: "18px 20px 4px",
  },
  labRow: { color: c.body, fontSize: "14px", lineHeight: "22px", margin: "0 0 12px" },
  strong: { color: c.ink, fontWeight: 600 },
  terminal: {
    backgroundColor: c.ink,
    borderRadius: "10px",
    padding: "14px 18px",
    margin: "0 0 18px",
  },
  termLine: { fontFamily: mono, fontSize: "13px", lineHeight: "22px", color: "#e4e4e7", margin: 0 },
  prompt: { color: "#71717a" },
  notice: {
    borderLeft: `3px solid ${c.accent}`,
    padding: "2px 0 2px 16px",
  },
  hr: { borderColor: c.line, margin: "36px 40px 0", width: "auto" },
  footer: { padding: "20px 40px 32px" },
  footText: { color: c.faint, fontSize: "12px", lineHeight: "18px", margin: "2px 0" },
  footLink: { color: c.muted, textDecoration: "underline" },
};

function Feature({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Row style={st.feat}>
      <Column style={{ width: "20px", verticalAlign: "top" }}>
        <div style={st.dot} />
      </Column>
      <Column style={{ verticalAlign: "top" }}>
        <Text style={st.featTitle}>{title}</Text>
        <Text style={st.featBody}>{children}</Text>
      </Column>
    </Row>
  );
}

function Group(props: { kicker: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <Section style={st.section}>
      <Text style={st.kicker}>{props.kicker}</Text>
      <Text style={st.h2}>{props.title}</Text>
      {props.intro ? (
        <Text style={st.intro}>{props.intro}</Text>
      ) : (
        <div style={{ height: "10px" }} />
      )}
      {props.children}
    </Section>
  );
}

function Lab({ name, children }: { name: string; children: ReactNode }) {
  return (
    <Text style={st.labRow}>
      <span style={st.strong}>{name}.</span> {children}
    </Text>
  );
}

export function Stroke3Email() {
  return (
    <Html>
      <Head />
      <Preview>
        A redesigned, faster Stroke: AI beside your tables, live dashboards, shared charts, sync,
        encrypted backups and 21 databases.
      </Preview>
      <Body style={st.body}>
        <Container style={st.container}>
          <Section style={st.hero}>
            <Text style={st.wordmark}>Stroke</Text>
            <span style={st.pill}>Version 3.0</span>
            <Text style={st.h1}>Stroke 3 is here</Text>
            <Text style={st.lead}>
              Every screen redesigned, a much faster app, and more than 300 changes since 2.3.
            </Text>
            <Button href={`${SITE}/download`} style={st.primary}>
              Update to Stroke 3
            </Button>
            <Text style={st.secondary}>
              or{" "}
              <Link href={`${SITE}/changelog`} style={st.secondaryLink}>
                read the full changelog
              </Link>
            </Text>
            <Img
              src={`${SITE}/email/stroke-3-ai.jpg`}
              alt="Stroke 3 with the AI chat open beside the explorer tree"
              width="520"
              style={st.heroShot}
            />
          </Section>

          <Group
            kicker="Faster, and new everywhere"
            title="The whole app, redesigned"
            intro="Every page and dialog has a new design, with controls that line up and read calmly. Stroke starts faster, big tables scroll smoothly, and heavy screens load only when you open them."
          >
            <Feature title="21 databases">
              Oracle, Elasticsearch, OpenSearch, Xata and SingleStore join Postgres, MySQL, SQLite,
              MongoDB, Redis, DynamoDB, ClickHouse and the rest.
            </Feature>
            <Feature title="Your keys, your look">
              Remap any shortcut, in the editors too. Build your own theme from a few colours, or
              install one from the community at{" "}
              <Link href={`${SITE}/themes`} style={st.link}>
                stroke.click/themes
              </Link>
              .
            </Feature>
          </Group>

          <Group
            kicker="AI"
            title="AI that works beside you"
            intro="The AI chat opens as a tab next to your tables, and each chat remembers the database it worked in."
          >
            <Feature title="You set the limit">
              Read only, read and write, or schema changes: every model stays inside the level you
              pick.
            </Feature>
            <Feature title="See every step">
              A request shows its plan, each query as one line with its result, and a summary of
              what changed.
            </Feature>
          </Group>

          <Group kicker="Charts and metrics" title="Dashboards, metrics and sharing">
            <Img
              src={`${SITE}/email/stroke-3-insights.jpg`}
              alt="Instance insights: connections, transactions and cache hit ratio"
              width="520"
              style={st.shot}
            />
            <Feature title="A new dashboard">
              Chart cards that refresh themselves, in a window of their own or full screen.
            </Feature>
            <Feature title="Instance insights">
              Live metrics for your server: connections, transactions, cache hits and trends.
            </Feature>
            <Feature title="Share a chart">
              Send a chart or a set of rows as a link. It's end-to-end encrypted, expires when you
              say, and opens in any browser.
            </Feature>
          </Group>

          <Group kicker="Your databases" title="From creating a database to backing it up">
            <Feature title="Create databases from the app">
              Sign in to Neon, Supabase, Prisma Postgres, Turso, TiDB Cloud, Nile, Upstash or
              Cloudflare D1, and create a database without leaving Stroke.
            </Feature>
            <Feature title="Local servers and Docker">
              Run Postgres, MySQL or Redis on your computer in any version, or start any of 18
              databases in Docker with one click.
            </Feature>
            <Feature title="Migrations">
              Point Stroke at a Drizzle, Prisma, Wrangler or SQL folder to see what has run and
              what's pending.
            </Feature>
            <Feature title="Scheduled backups and restore">
              Back up on a schedule to Stroke Cloud or your own S3, end-to-end encrypted, and
              preview a dump before you restore it.
            </Feature>
            <Feature title="Sync">
              Connections, settings, saved queries, charts and dashboards follow you to your other
              computers, end-to-end encrypted.
            </Feature>
          </Group>

          <Group
            kicker="Stroke in the browser"
            title="One command: npx strokedb"
            intro="Run it in a project to open the project's database: in the app if Stroke is installed, or in the web studio if it isn't."
          >
            <Section style={st.terminal}>
              <Text style={st.termLine}>
                <span style={st.prompt}>$</span> npx strokedb
              </Text>
            </Section>
            <Text style={st.featBody}>
              More at{" "}
              <Link href={`${SITE}/studio`} style={st.link}>
                stroke.click/studio
              </Link>
              . A bigger, better web studio is in Labs now, still being built and polished.
            </Text>
          </Group>

          <Group
            kicker="Labs"
            title="Try what's coming next"
            intro="Labs features work today and may still change. Turn them on in Settings → Labs."
          >
            <Section style={st.labs}>
              <Lab name="AI chat in a tab">
                On by default in 3.0. AI opens beside your tables instead of taking over the window.
              </Lab>
              <Lab name="Explorer tree">
                Every connection, database, schema, table and column in one tree.
              </Lab>
              <Lab name="Several connections at once">
                Keep more than one database open with its tabs, and switch instantly.
              </Lab>
              <Lab name="Share as a web studio">
                Share a database through a link that opens in any browser.
              </Lab>
              <Lab name="Live mode, ⌘K AI and Vim mode">
                Tables that refresh themselves, AI from the command palette, and Vim keys across the
                app.
              </Lab>
            </Section>
          </Group>

          <Group kicker="Update" title="How to get Stroke 3">
            <Text style={{ ...st.intro, margin: "0 0 14px" }}>
              Open Stroke and it offers the update, or download it from{" "}
              <Link href={`${SITE}/download`} style={st.link}>
                stroke.click/download
              </Link>
              . With a package manager:
            </Text>
            <Section style={st.terminal}>
              <Text style={st.termLine}>brew upgrade --cask stroke-app</Text>
              <Text style={st.termLine}>scoop update stroke</Text>
              <Text style={st.termLine}>yay -Syu stroke-bin</Text>
            </Section>
            <Section style={st.notice}>
              <Text style={st.featTitle}>One change: sign in</Text>
              <Text style={st.featBody}>
                Stroke 3 asks you to sign in with Google or GitHub, and your plan follows you to up
                to 3 computers. Bought a license key? Sign in with the email you bought it with, and
                Pro is already on your account. New accounts get every feature free for 17 days.
              </Text>
            </Section>
            <Text style={{ ...st.featBody, color: c.muted, margin: "20px 0 0" }}>
              Anything not working after the update? Reply to this email and we'll sort it out.
            </Text>
          </Group>

          <Hr style={st.hr} />
          <Section style={st.footer}>
            <Text style={st.footText}>You're getting this because you signed up for Stroke.</Text>
            <Text style={st.footText}>
              <Link href={SITE} style={st.footLink}>
                stroke.click
              </Link>{" "}
              · © {new Date().getFullYear()} Stroke
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default Stroke3Email;
