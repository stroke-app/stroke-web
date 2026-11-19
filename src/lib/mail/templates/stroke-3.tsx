import { Button, Section, Text } from "@react-email/components";

import { EmailLayout, sharedStyles as s } from "./layout";

/**
 * The Stroke 3 announcement, sent once to every contact as a Plunk campaign.
 * Render it with `scripts/render-email.tsx stroke-3` and paste the HTML.
 */

const item = { ...s.paragraph, margin: "0 0 12px" };
const name = { color: "#09090b", fontWeight: 600 };
const small = { ...s.paragraph, fontSize: "13px", lineHeight: "20px", color: "#71717a" };
const sub = {
  fontSize: "13px",
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase" as const,
  color: "#a1a1aa",
  margin: "28px 0 12px",
};

export function Stroke3Email() {
  return (
    <EmailLayout
      preview="AI beside your tables, local databases, migrations, backups and 21 databases. Here's how to update."
      reason="You're getting this because you signed up for Stroke."
    >
      <Text style={s.heading}>Stroke 3 is out</Text>
      <Text style={s.paragraph}>
        Stroke 3 is the biggest update yet, with over 300 changes since 2.3. Here's what's new and
        how to get it.
      </Text>

      <Button href="https://stroke.click/download" style={s.button}>
        Download Stroke 3
      </Button>

      <Text style={sub}>What's new</Text>
      <Text style={item}>
        <span style={name}>AI chat beside your tables.</span> It opens as a tab next to your tables
        and queries, and every chat remembers the database it worked in. You choose how far it can
        go: read only, read and write, or schema changes.
      </Text>
      <Text style={item}>
        <span style={name}>Local database servers.</span> Run Postgres, MySQL or Redis on your own
        computer in any version, start them with Stroke, and see the ones already running.
      </Text>
      <Text style={item}>
        <span style={name}>Migrations.</span> Point Stroke at a Drizzle, Prisma, Wrangler or SQL
        folder and see what has run, what's pending, and the SQL of each one.
      </Text>
      <Text style={item}>
        <span style={name}>Scheduled backups.</span> To Stroke Cloud or your own S3, end-to-end
        encrypted, with a preview before you restore.
      </Text>
      <Text style={item}>
        <span style={name}>21 databases.</span> Oracle, Elasticsearch, OpenSearch, Xata and
        SingleStore join Postgres, MySQL, SQLite, MongoDB, Redis, DynamoDB and the rest.
      </Text>
      <Text style={item}>
        <span style={name}>Sync across your computers.</span> Connections, settings, saved queries
        and dashboards, end-to-end encrypted.
      </Text>
      <Text style={s.paragraph}>
        Plus live dashboards, Docker databases in one click, a leader key, SQL notebooks, and a lot
        of speed and polish.
      </Text>

      <Text style={sub}>How to update</Text>
      <Text style={item}>
        Open Stroke and it offers the update. Or download it from{" "}
        <a href="https://stroke.click/download">stroke.click/download</a>, or update through your
        package manager:
      </Text>
      <Section style={s.detailBox}>
        <Text style={{ ...s.detailRow, fontFamily: "monospace", fontSize: "13px" }}>
          brew upgrade --cask stroke-app
          <br />
          scoop update stroke
          <br />
          yay -Syu stroke-bin
        </Text>
      </Section>

      <Text style={sub}>One change: sign in</Text>
      <Text style={s.paragraph}>
        Stroke 3 asks you to sign in with Google or GitHub. Your plan lives on your account now and
        follows you to up to 3 computers. <span style={name}>Bought a license key?</span> Sign in
        with the email you bought it with, and Pro is already there. No key to paste. New accounts
        get every feature free for 17 days.
      </Text>

      <Text style={small}>
        If you bought with a different email, or anything breaks after the update, reply to this
        email and we'll sort it out.
      </Text>
    </EmailLayout>
  );
}

export default Stroke3Email;
