import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { CSSProperties, ReactNode } from "react";

/**
 * The Stroke 3 announcement, sent once to every contact as a Plunk campaign.
 * Square, hairline-bordered, monospace labels, pastel cards that each hold a
 * black panel drawn like the app. Built from tables so Gmail and Outlook keep
 * the layout. Screenshots are JPGs in public/email/ (Outlook can't show WebP).
 */

const SITE = "https://stroke.click";
const sans =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif';
const mono = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

const ink = "#0a0a0a";
const body = "#52525b";
const faint = "#a1a1aa";
const line = "#e4e4e7";
const panel = "#000000";
const panelLine = "#27272a";
const panelText = "#e4e4e7";
const panelDim = "#8b8b93";
const green = "#4ade80";
const grey = "#71717a";
const amber = "#fbbf24";

const tint = {
  blue: { bg: "#eef6fb", border: "#d3e7f3" },
  pink: { bg: "#fdf1f4", border: "#f4d7df" },
  green: { bg: "#effaf1", border: "#cdeed3" },
  lilac: { bg: "#f2f2fb", border: "#dcdcf2" },
  yellow: { bg: "#fcfae6", border: "#efe7b0" },
};

const t = {
  h1: {
    fontFamily: sans,
    fontSize: "40px",
    lineHeight: "44px",
    fontWeight: 500,
    letterSpacing: "-1px",
    color: ink,
    margin: "0 0 16px",
  },
  lead: { fontFamily: sans, fontSize: "17px", lineHeight: "27px", color: body, margin: "0 0 28px" },
  h2: {
    fontFamily: sans,
    fontSize: "26px",
    lineHeight: "31px",
    fontWeight: 500,
    letterSpacing: "-0.5px",
    color: ink,
    margin: "0 0 10px",
  },
  h3: {
    fontFamily: sans,
    fontSize: "20px",
    lineHeight: "26px",
    fontWeight: 500,
    letterSpacing: "-0.3px",
    color: ink,
    margin: "0 0 8px",
  },
  p: { fontFamily: sans, fontSize: "15px", lineHeight: "23px", color: body, margin: "0 0 14px" },
  label: {
    fontFamily: mono,
    fontSize: "11px",
    lineHeight: "14px",
    letterSpacing: "0.6px",
    color: faint,
    margin: 0,
  },
  link: { fontFamily: sans, fontSize: "14px", color: ink, textDecoration: "underline" },
};

const btnDark: CSSProperties = {
  display: "inline-block",
  backgroundColor: ink,
  color: "#ffffff",
  fontFamily: sans,
  fontSize: "15px",
  fontWeight: 500,
  textDecoration: "none",
  padding: "14px 22px",
};
const btnLight: CSSProperties = {
  ...btnDark,
  backgroundColor: "#ffffff",
  color: ink,
  border: `1px solid ${line}`,
  padding: "13px 21px",
};

/** A full-width table, the only layout every mail client agrees on. */
function T({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <table
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      role="presentation"
      style={{ borderCollapse: "collapse", ...style }}
    >
      <tbody>{children}</tbody>
    </table>
  );
}

type PanelRow = { name: string; value: string; dot?: string; sansValue?: boolean; on?: boolean };

/** The black panel inside a card: a breadcrumb bar, a header row, then rows. */
function Panel(props: {
  crumb: string;
  title: string;
  head: [string, string];
  rows: PanelRow[];
  foot?: string;
}) {
  const cell: CSSProperties = {
    fontFamily: mono,
    fontSize: "12px",
    lineHeight: "16px",
    padding: "9px 14px",
    borderTop: `1px solid ${panelLine}`,
  };
  const small: CSSProperties = { ...cell, color: panelDim, fontSize: "11px", fontFamily: sans };
  return (
    <T style={{ backgroundColor: panel }}>
      <tr>
        <td
          colSpan={2}
          style={{ ...small, borderTop: "none", padding: "12px 14px", fontSize: "12px" }}
        >
          {props.crumb}
          <span style={{ color: "#52525b" }}>&nbsp;&nbsp;›&nbsp;&nbsp;</span>
          <span style={{ color: "#ffffff" }}>{props.title}</span>
        </td>
      </tr>
      <tr>
        <td style={small}>{props.head[0]}</td>
        <td style={{ ...small, textAlign: "right" }}>{props.head[1]}</td>
      </tr>
      {props.rows.map((r) => {
        const bg = r.on ? "#18181b" : panel;
        return (
          <tr key={r.name}>
            <td style={{ ...cell, color: r.on ? "#ffffff" : panelText, backgroundColor: bg }}>
              {r.name}
            </td>
            <td
              style={{
                ...cell,
                textAlign: "right",
                whiteSpace: "nowrap",
                color: r.dot ? panelText : panelDim,
                fontFamily: r.sansValue ? sans : mono,
                backgroundColor: bg,
              }}
            >
              {r.dot && <span style={{ color: r.dot }}>●&nbsp;</span>}
              {r.value}
            </td>
          </tr>
        );
      })}
      {props.foot && (
        <tr>
          <td colSpan={2} style={{ ...small, padding: "12px 14px" }}>
            {props.foot}
          </td>
        </tr>
      )}
    </T>
  );
}

/** A pastel card: title, a short paragraph, a link, then a visual flush to its bottom. */
function Card(props: {
  color: keyof typeof tint;
  title: string;
  children: ReactNode;
  link?: { href: string; label: string };
  visual: ReactNode;
}) {
  const c = tint[props.color];
  return (
    <T style={{ backgroundColor: c.bg, border: `1px solid ${c.border}`, marginBottom: "16px" }}>
      <tr>
        <td style={{ padding: "28px 28px 24px" }}>
          <Text style={t.h3}>{props.title}</Text>
          <Text style={{ ...t.p, margin: props.link ? "0 0 14px" : 0 }}>{props.children}</Text>
          {props.link && (
            <Link href={props.link.href} style={t.link}>
              {props.link.label}
            </Link>
          )}
        </td>
      </tr>
      <tr>
        <td style={{ padding: "0 0 0 28px" }}>{props.visual}</td>
      </tr>
    </T>
  );
}

function SectionHead({ title, text }: { title: string; text: string }) {
  return (
    <Section style={{ padding: "56px 32px 24px" }}>
      <Text style={t.h2}>{title}</Text>
      <Text style={{ ...t.p, fontSize: "16px", lineHeight: "25px", margin: 0 }}>{text}</Text>
    </Section>
  );
}

const LABS: [string, string, string, string][] = [
  ["AI chat in a tab", "AI opens beside your tables, not over the window.", "On", green],
  ["Explorer tree", "Connections, schemas, tables and columns in one tree.", "Opt-in", grey],
  ["Several connections", "Keep databases open with their tabs, switch instantly.", "Opt-in", grey],
  ["Share as a web studio", "Share a database through a link for any browser.", "Opt-in", grey],
  ["Live mode, ⌘K AI, Vim", "Self-refreshing tables, AI in the palette, Vim keys.", "Opt-in", grey],
];

const STEPS = [
  ["01", "Open Stroke, and it offers the update."],
  ["02", "Or download it from stroke.click/download."],
  ["03", "Or use your package manager:"],
];

const COMMANDS = [
  ["macOS", "brew upgrade --cask stroke-app"],
  ["Windows", "scoop update stroke"],
  ["Arch", "yay -Syu stroke-bin"],
];

export function Stroke3Email() {
  const rule = (i: number) => (i ? `1px solid ${line}` : "none");
  return (
    <Html>
      <Head />
      <Preview>
        Every screen redesigned and a much faster app: AI beside your tables, live dashboards,
        shared charts, encrypted backups, sync and 21 databases.
      </Preview>
      <Body style={{ backgroundColor: "#ffffff", margin: 0, padding: 0, fontFamily: sans }}>
        <T style={{ backgroundColor: ink }}>
          <tr>
            <td
              style={{
                padding: "11px 16px",
                textAlign: "center",
                fontFamily: sans,
                fontSize: "13px",
                color: "#ffffff",
              }}
            >
              Stroke 3.0 is out.{" "}
              <Link
                href={`${SITE}/changelog`}
                style={{ color: "#ffffff", textDecoration: "underline" }}
              >
                Read the changelog
              </Link>{" "}
              ↗
            </td>
          </tr>
        </T>

        <Container style={{ maxWidth: "640px", margin: "0 auto" }}>
          <Section style={{ padding: "24px 32px 0" }}>
            <T style={{ border: `1px solid ${line}` }}>
              <tr>
                <td style={{ padding: "0 16px", height: "46px" }}>
                  <Img
                    src={`${SITE}/icon.png`}
                    width="22"
                    height="22"
                    alt=""
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                  />
                  <span
                    style={{
                      fontFamily: sans,
                      fontSize: "16px",
                      fontWeight: 600,
                      color: ink,
                      verticalAlign: "middle",
                      marginLeft: "8px",
                    }}
                  >
                    Stroke
                  </span>
                </td>
                <td style={{ textAlign: "right", width: "1%", whiteSpace: "nowrap" }}>
                  <Link
                    href={`${SITE}/download`}
                    style={{ ...btnDark, fontSize: "13px", padding: "15px 18px" }}
                  >
                    Download
                  </Link>
                </td>
              </tr>
            </T>
          </Section>

          <Section style={{ padding: "48px 32px 0" }}>
            <table
              cellPadding={0}
              cellSpacing={0}
              role="presentation"
              style={{
                borderCollapse: "collapse",
                border: `1px solid ${line}`,
                marginBottom: "28px",
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      backgroundColor: ink,
                      color: "#ffffff",
                      fontFamily: sans,
                      fontSize: "13px",
                      fontWeight: 600,
                      padding: "10px",
                    }}
                  >
                    3.0
                  </td>
                  <td style={{ padding: "6px 12px" }}>
                    <Text
                      style={{
                        fontFamily: sans,
                        fontSize: "12px",
                        lineHeight: "16px",
                        color: ink,
                        margin: 0,
                      }}
                    >
                      New major version
                    </Text>
                    <Text style={{ ...t.label, fontSize: "10px" }}>STROKE · NOV 19, 2026</Text>
                  </td>
                </tr>
              </tbody>
            </table>
            <Text style={t.h1}>Stroke 3 is here</Text>
            <Text style={t.lead}>
              Every screen redesigned, a much faster app, and more than 300 changes since 2.3. AI
              beside your tables, live dashboards, shared charts, encrypted backups and sync.
            </Text>
            <table cellPadding={0} cellSpacing={0} role="presentation">
              <tbody>
                <tr>
                  <td>
                    <Link href={`${SITE}/download`} style={btnDark}>
                      Update to Stroke 3
                    </Link>
                  </td>
                  <td style={{ paddingLeft: "8px" }}>
                    <Link href={`${SITE}/changelog`} style={btnLight}>
                      What's new
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
            <Text style={{ ...t.p, fontSize: "12px", color: faint, margin: "16px 0 0" }}>
              Open Stroke and it offers the update. On macOS, Windows and Linux.
            </Text>
          </Section>

          <Section style={{ padding: "36px 32px 0" }}>
            <Img
              src={`${SITE}/email/stroke-3-ai.jpg`}
              alt="Stroke 3 with the AI chat open beside the explorer tree"
              width="576"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                border: `1px solid ${ink}`,
              }}
            />
          </Section>

          <SectionHead
            title="Redesigned, and much faster."
            text="Every page and dialog is new, with calmer controls that line up. Stroke starts faster, big tables scroll smoothly, and heavy screens load only when you open them."
          />

          <Section style={{ padding: "0 32px" }}>
            <Card
              color="blue"
              title="AI that works beside your tables"
              link={{ href: `${SITE}/features`, label: "See the AI chat" }}
              visual={
                <Panel
                  crumb="AI chat"
                  title="Access level"
                  head={["Level", "Can run"]}
                  rows={[
                    { name: "Read only", value: "SELECT, EXPLAIN" },
                    { name: "Read & write", value: "INSERT, UPDATE", on: true },
                    { name: "Modify schema", value: "CREATE, ALTER" },
                    { name: "Dangerous", value: "DROP, TRUNCATE" },
                  ]}
                  foot="Every model stays inside the level you pick."
                />
              }
            >
              The chat opens as a tab next to your tables and remembers the database it worked in.
              Each request shows its plan, every query, and what changed.
            </Card>

            <Card
              color="pink"
              title="Dashboards, metrics and shared charts"
              link={{ href: `${SITE}/features`, label: "See dashboards" }}
              visual={
                <Img
                  src={`${SITE}/email/stroke-3-insights.jpg`}
                  alt="Instance insights: connections, transactions and cache hit ratio"
                  width="546"
                  style={{ display: "block", width: "100%", height: "auto" }}
                />
              }
            >
              A new dashboard of chart cards that refresh themselves, in their own window or full
              screen. Live server metrics in Instance insights. Share a chart or rows as an
              encrypted link that opens in any browser.
            </Card>

            <Card
              color="green"
              title="Create databases from the app"
              visual={
                <Panel
                  crumb="New connection"
                  title="Create a database"
                  head={["Provider", "Engine"]}
                  rows={[
                    { name: "Neon", value: "Postgres" },
                    { name: "Supabase", value: "Postgres", on: true },
                    { name: "Prisma Postgres", value: "Postgres" },
                    { name: "Turso", value: "libSQL" },
                    { name: "TiDB Cloud", value: "MySQL" },
                    { name: "Cloudflare D1", value: "SQLite" },
                  ]}
                  foot="Also Nile and Upstash. Connected as soon as it's ready."
                />
              }
            >
              Sign in to your hosting provider and create a database without leaving Stroke. Or run
              Postgres, MySQL and Redis on your computer in any version, and start 18 databases in
              Docker with one click.
            </Card>

            <Card
              color="lilac"
              title="Backups, sync and migrations"
              visual={
                <Panel
                  crumb="Settings"
                  title="Account & Sync"
                  head={["Feature", "Status"]}
                  rows={[
                    { name: "Sync", value: "End-to-end encrypted", dot: green, sansValue: true },
                    {
                      name: "Scheduled backups",
                      value: "Daily to S3",
                      dot: green,
                      sansValue: true,
                    },
                    { name: "Restore", value: "Preview first", dot: green, sansValue: true },
                    { name: "Migrations", value: "3 pending", dot: amber, sansValue: true },
                  ]}
                />
              }
            >
              Back up on a schedule to Stroke Cloud or your own S3, end-to-end encrypted. Sync
              connections, settings, saved queries and dashboards to your other computers. See which
              Drizzle, Prisma or Wrangler migrations have run.
            </Card>

            <Card
              color="yellow"
              title="Your keys, your theme"
              link={{ href: `${SITE}/themes`, label: "Browse community themes" }}
              visual={
                <Panel
                  crumb="Settings"
                  title="Keybindings"
                  head={["Command", "Keys"]}
                  rows={[
                    { name: "Command palette", value: "⌘ K" },
                    { name: "Run query", value: "⌘ ↵", on: true },
                    { name: "Leader key", value: "⌘ ;" },
                    { name: "Pick a theme", value: "⌘ ⌥ T" },
                  ]}
                  foot="Remap any shortcut, in the editors too."
                />
              }
            >
              Remap any shortcut. Build your own theme from a few colours, or install one the
              community made.
            </Card>
          </Section>

          <SectionHead
            title="Your database in the browser."
            text="Run one command in a project to open its database: in the app if Stroke is installed, or in the web studio if it isn't."
          />
          <Section style={{ padding: "0 32px" }}>
            <T style={{ border: `1px solid ${line}` }}>
              <tr>
                <td
                  style={{
                    fontFamily: sans,
                    fontSize: "12px",
                    color: faint,
                    padding: "9px 14px",
                    borderBottom: `1px solid ${line}`,
                  }}
                >
                  <span style={{ color: ink }}>Terminal</span>&nbsp;&nbsp;·&nbsp;&nbsp;in any
                  project with a database
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "16px 14px",
                    backgroundColor: "#fafafa",
                    fontFamily: mono,
                    fontSize: "14px",
                    color: ink,
                  }}
                >
                  <span style={{ color: faint }}>$ </span>npx strokedb
                </td>
              </tr>
            </T>
            <Text style={{ ...t.p, margin: "16px 0 0" }}>
              More at{" "}
              <Link href={`${SITE}/studio`} style={t.link}>
                stroke.click/studio
              </Link>
              . A bigger, better web studio is in Labs, still being built and polished.
            </Text>
          </Section>

          <SectionHead
            title="New in Labs."
            text="Labs features work today and may still change. Turn them on in Settings → Labs."
          />
          <Section style={{ padding: "0 32px" }}>
            <T style={{ border: `1px solid ${line}` }}>
              {LABS.map(([name, what, state, dot], i) => {
                const bg = i === 0 ? "#fafafa" : "#ffffff";
                return (
                  <tr key={name}>
                    <td style={{ padding: "14px 16px", borderTop: rule(i), backgroundColor: bg }}>
                      <Text
                        style={{
                          fontFamily: sans,
                          fontSize: "14px",
                          lineHeight: "20px",
                          fontWeight: 500,
                          color: ink,
                          margin: 0,
                        }}
                      >
                        {name}
                      </Text>
                      <Text
                        style={{
                          fontFamily: sans,
                          fontSize: "13px",
                          lineHeight: "19px",
                          color: body,
                          margin: "2px 0 0",
                        }}
                      >
                        {what}
                      </Text>
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        borderTop: rule(i),
                        backgroundColor: bg,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                        verticalAlign: "top",
                        fontFamily: sans,
                        fontSize: "12px",
                        lineHeight: "20px",
                        color: body,
                      }}
                    >
                      <span style={{ color: dot }}>●</span> {state}
                    </td>
                  </tr>
                );
              })}
            </T>
          </Section>

          <SectionHead
            title="Update in a minute."
            text="Stroke 3 is out on every platform today. Your connections, settings and saved queries come with you."
          />
          <Section style={{ padding: "0 32px" }}>
            <T style={{ border: `1px solid ${line}` }}>
              {STEPS.map(([n, text], i) => (
                <tr key={n}>
                  <td
                    style={{
                      fontFamily: mono,
                      fontSize: "12px",
                      color: faint,
                      padding: "13px 0 13px 16px",
                      width: "36px",
                      borderTop: rule(i),
                    }}
                  >
                    {n}
                  </td>
                  <td
                    style={{
                      fontFamily: sans,
                      fontSize: "14px",
                      color: ink,
                      padding: "13px 16px 13px 0",
                      borderTop: rule(i),
                    }}
                  >
                    {text}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={2} style={{ padding: "0 16px 16px" }}>
                  <T style={{ backgroundColor: panel }}>
                    {COMMANDS.map(([os, cmd], i) => (
                      <tr key={os}>
                        <td
                          style={{
                            fontFamily: sans,
                            fontSize: "11px",
                            color: panelDim,
                            padding: "10px 14px",
                            width: "64px",
                            borderTop: i ? `1px solid ${panelLine}` : "none",
                          }}
                        >
                          {os}
                        </td>
                        <td
                          style={{
                            fontFamily: mono,
                            fontSize: "12px",
                            color: panelText,
                            padding: "10px 14px 10px 0",
                            borderTop: i ? `1px solid ${panelLine}` : "none",
                          }}
                        >
                          {cmd}
                        </td>
                      </tr>
                    ))}
                  </T>
                </td>
              </tr>
            </T>

            <T style={{ border: `1px solid ${line}`, marginTop: "16px" }}>
              <tr>
                <td style={{ padding: "22px 24px" }}>
                  <Text style={{ ...t.h3, fontSize: "17px", margin: "0 0 6px" }}>
                    One change: you sign in
                  </Text>
                  <Text style={{ ...t.p, fontSize: "14px", lineHeight: "22px", margin: 0 }}>
                    Stroke 3 asks you to sign in with Google or GitHub, and your plan follows you to
                    up to 3 computers. Bought a license key? Sign in with the email you bought it
                    with, and Pro is already on your account. New accounts get every feature free
                    for 17 days.
                  </Text>
                </td>
              </tr>
            </T>

            <table
              cellPadding={0}
              cellSpacing={0}
              role="presentation"
              style={{ marginTop: "28px" }}
            >
              <tbody>
                <tr>
                  <td>
                    <Link href={`${SITE}/download`} style={btnDark}>
                      Update to Stroke 3
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
            <Text style={{ ...t.p, fontSize: "13px", color: faint, margin: "14px 0 0" }}>
              Something not working after the update? Reply to this email and we'll sort it out.
            </Text>
          </Section>

          <Section style={{ padding: "56px 32px 0" }}>
            <T style={{ borderTop: `1px solid ${line}` }}>
              <tr>
                <td style={{ padding: "18px 0 0", ...t.label }}>
                  You're getting this because you signed up for Stroke.
                </td>
                <td style={{ padding: "18px 0 0", textAlign: "right", ...t.label }}>
                  <Link href={SITE} style={{ color: body, textDecoration: "none" }}>
                    © 2026 stroke.click
                  </Link>
                </td>
              </tr>
            </T>
            <Text
              style={{
                fontFamily: sans,
                fontSize: "120px",
                lineHeight: "110px",
                fontWeight: 700,
                letterSpacing: "-6px",
                color: "#f1f1f3",
                margin: "28px 0 0",
                textAlign: "center",
              }}
            >
              stroke
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default Stroke3Email;
