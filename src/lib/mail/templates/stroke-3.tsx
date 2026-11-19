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

import {
  Badge,
  body,
  btnDark,
  btnLight,
  Buttons,
  faint,
  Footer,
  Header,
  ink,
  line,
  mono,
  sans,
  SectionHead,
  SITE,
  soft,
  T,
  text,
  TopBar,
} from "./kit";

/**
 * The Stroke 3 announcement, sent once to every contact as a Plunk campaign.
 * Each feature is one name and one plain sentence on what it does.
 * Screenshots are JPGs in public/email/ (Outlook can't show WebP).
 */

type Feature = [name: string, what: string];

const GROUPS: { tint: string; border: string; title: string; items: Feature[] }[] = [
  {
    tint: "#eef6fb",
    border: "#d3e7f3",
    title: "AI",
    items: [
      [
        "AI chat in a tab",
        "Ask AI about your database in a tab next to your tables. It writes and runs the queries for you.",
      ],
      [
        "Access levels",
        "Choose what the AI may run: read only, read and write, schema changes, or everything.",
      ],
    ],
  },
  {
    tint: "#fdf1f4",
    border: "#f4d7df",
    title: "Charts and dashboards",
    items: [
      [
        "Dashboards",
        "Put your saved charts on one page that refreshes itself. Open it in its own window or full screen.",
      ],
      [
        "Instance insights",
        "Live numbers for your database server: connections, transactions and cache hit ratio.",
      ],
      [
        "Share a chart",
        "Send a chart or some rows as a link. It is encrypted, expires when you choose, and opens in any browser.",
      ],
    ],
  },
  {
    tint: "#effaf1",
    border: "#cdeed3",
    title: "Databases",
    items: [
      [
        "Create a database on your host",
        "Make a new database on Neon, Supabase, Prisma Postgres, Turso, TiDB Cloud, Nile, Upstash or Cloudflare D1 without leaving Stroke.",
      ],
      [
        "Local database servers",
        "Run Postgres, MySQL or Redis on your own computer, in any version, and start them with Stroke.",
      ],
      ["Docker in one click", "Start any of 18 databases in Docker from ⌘K, already connected."],
      [
        "Migrations",
        "See which migrations in your Drizzle, Prisma, Wrangler or SQL folder have run, and which are still pending.",
      ],
      ["5 new databases", "Oracle, Elasticsearch, OpenSearch, Xata and SingleStore. 21 in total."],
    ],
  },
  {
    tint: "#f2f2fb",
    border: "#dcdcf2",
    title: "Backups and sync",
    items: [
      [
        "Scheduled backups",
        "Back up automatically to Stroke Cloud or your own S3, end-to-end encrypted. Preview a backup before you restore it.",
      ],
      [
        "Sync",
        "Your connections, settings, saved queries and dashboards on all your computers, end-to-end encrypted.",
      ],
    ],
  },
  {
    tint: "#fcfae6",
    border: "#efe7b0",
    title: "Make it yours",
    items: [
      ["Custom shortcuts", "Change any keyboard shortcut in Settings, in the editors too."],
      [
        "Themes",
        "Build your own theme from a few colours, or install one other people made at stroke.click/themes.",
      ],
    ],
  },
  {
    tint: "#f4f4f5",
    border: "#e4e4e7",
    title: "In the browser",
    items: [
      [
        "npx strokedb",
        "Run it in a project folder to open that project's database in Stroke, or in your browser if Stroke isn't installed.",
      ],
    ],
  },
];

const LABS: [string, string, boolean][] = [
  [
    "AI chat in a tab",
    "On by default in 3.0. Turn it off in Labs to get the full-window chat back.",
    true,
  ],
  [
    "Explorer tree",
    "Connections, databases, tables and columns in one tree in the sidebar.",
    false,
  ],
  [
    "Several connections at once",
    "Keep more than one database open with its tabs, and switch instantly.",
    false,
  ],
  ["Share as a web studio", "Share a database through a link that opens in any browser.", false],
  ["New web studio", "A bigger studio for the browser. Still being built and polished.", false],
  [
    "Live mode, ⌘K AI, Vim mode",
    "Tables that refresh themselves, AI in the command palette, and Vim keys.",
    false,
  ],
];

function Group({ g }: { g: (typeof GROUPS)[number] }) {
  return (
    <T style={{ border: `1px solid ${g.border}`, marginBottom: "14px" }}>
      <tr>
        <td
          colSpan={2}
          style={{
            backgroundColor: g.tint,
            borderBottom: `1px solid ${g.border}`,
            padding: "12px 18px",
            fontFamily: mono,
            fontSize: "11px",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            color: ink,
          }}
        >
          {g.title}
        </td>
      </tr>
      {g.items.map(([name, what], i) => (
        <tr key={name}>
          <td
            style={{
              padding: "14px 18px",
              borderTop: i ? `1px solid ${line}` : "none",
              backgroundColor: "#ffffff",
            }}
          >
            <Text
              style={{
                fontFamily: sans,
                fontSize: "15px",
                lineHeight: "21px",
                fontWeight: 600,
                color: ink,
                margin: 0,
              }}
            >
              {name}
            </Text>
            <Text
              style={{
                fontFamily: sans,
                fontSize: "14px",
                lineHeight: "21px",
                color: body,
                margin: "3px 0 0",
              }}
            >
              {what}
            </Text>
          </td>
        </tr>
      ))}
    </T>
  );
}

export function Stroke3Email() {
  const rule = (i: number) => (i ? `1px solid ${line}` : "none");
  return (
    <Html>
      <Head />
      <Preview>
        AI chat beside your tables, dashboards, encrypted backups, sync, local databases and 5 new
        databases. Here's what's new and how to update.
      </Preview>
      <Body style={{ backgroundColor: "#ffffff", margin: 0, padding: 0, fontFamily: sans }}>
        <TopBar>
          Stroke 3.0 is out.{" "}
          <Link
            href={`${SITE}/changelog`}
            style={{ color: "#ffffff", textDecoration: "underline" }}
          >
            Read the changelog
          </Link>{" "}
          ↗
        </TopBar>

        <Container style={{ maxWidth: "640px", margin: "0 auto" }}>
          <Header action={{ href: `${SITE}/download`, label: "Download" }} />

          <Section style={{ padding: "44px 32px 0" }}>
            <Badge tag="3.0" title="New major version" sub="Stroke · Nov 19, 2026" />
            <Text style={text.h1}>Stroke 3 is here</Text>
            <Text style={text.lead}>
              The biggest update to Stroke so far. Every screen is redesigned and the app is faster.
              Below is everything new, one line each.
            </Text>
            <Buttons>
              {[
                <Link key="u" href={`${SITE}/download`} style={btnDark}>
                  Update to Stroke 3
                </Link>,
                <Link key="c" href={`${SITE}/changelog`} style={btnLight}>
                  Full changelog
                </Link>,
              ]}
            </Buttons>
          </Section>

          <Section style={{ padding: "36px 32px 0" }}>
            <Img
              src={`${SITE}/email/stroke-3-ai.jpg`}
              alt="Stroke 3: the AI chat open in a tab beside the tables"
              width="576"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                border: `1px solid ${ink}`,
              }}
            />
            <Text
              style={{
                ...text.label,
                textTransform: "none",
                letterSpacing: "0.2px",
                margin: "10px 0 0",
              }}
            >
              The AI chat in a tab: it created a movie database and drew its diagram.
            </Text>
          </Section>

          <SectionHead
            kicker="What's new"
            title="Everything new in Stroke 3"
            intro="Faster startup and smoother scrolling in big tables, a new design on every screen, and these new features:"
          />
          <Section style={{ padding: "0 32px" }}>
            {GROUPS.map((g) => (
              <Group key={g.title} g={g} />
            ))}
          </Section>

          <SectionHead
            kicker="Labs"
            title="Try it early in Labs"
            intro="These work today and may still change. Turn them on in Settings → Labs."
          />
          <Section style={{ padding: "0 32px" }}>
            <T style={{ border: `1px solid ${line}` }}>
              {LABS.map(([name, what, on], i) => (
                <tr key={name}>
                  <td style={{ padding: "13px 16px", borderTop: rule(i) }}>
                    <Text
                      style={{
                        fontFamily: sans,
                        fontSize: "14px",
                        lineHeight: "20px",
                        fontWeight: 600,
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
                      padding: "13px 16px",
                      borderTop: rule(i),
                      textAlign: "right",
                      whiteSpace: "nowrap",
                      verticalAlign: "top",
                      fontFamily: sans,
                      fontSize: "12px",
                      lineHeight: "20px",
                      color: body,
                    }}
                  >
                    <span style={{ color: on ? "#22c55e" : "#a1a1aa" }}>●</span>{" "}
                    {on ? "On" : "Opt-in"}
                  </td>
                </tr>
              ))}
            </T>
          </Section>

          <SectionHead
            kicker="Update"
            title="How to update"
            intro="Your connections, settings and saved queries carry over."
          />
          <Section style={{ padding: "0 32px" }}>
            <T style={{ border: `1px solid ${line}` }}>
              {[
                ["01", "Open Stroke. It offers the update."],
                ["02", "Or download it from stroke.click/download."],
                ["03", "Or update with your package manager:"],
              ].map(([n, step], i) => (
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
                    {step}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={2} style={{ padding: "0 16px 16px" }}>
                  <T style={{ backgroundColor: "#000000" }}>
                    {[
                      ["macOS", "brew upgrade --cask stroke-app"],
                      ["Windows", "scoop update stroke"],
                      ["Arch", "yay -Syu stroke-bin"],
                    ].map(([os, cmd], i) => (
                      <tr key={os}>
                        <td
                          style={{
                            fontFamily: sans,
                            fontSize: "11px",
                            color: "#8b8b93",
                            padding: "10px 14px",
                            width: "64px",
                            borderTop: i ? "1px solid #27272a" : "none",
                          }}
                        >
                          {os}
                        </td>
                        <td
                          style={{
                            fontFamily: mono,
                            fontSize: "12px",
                            color: "#e4e4e7",
                            padding: "10px 14px 10px 0",
                            borderTop: i ? "1px solid #27272a" : "none",
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

            <T style={{ border: `1px solid ${line}`, backgroundColor: soft, marginTop: "14px" }}>
              <tr>
                <td style={{ padding: "20px 22px" }}>
                  <Text
                    style={{
                      fontFamily: sans,
                      fontSize: "15px",
                      lineHeight: "21px",
                      fontWeight: 600,
                      color: ink,
                      margin: "0 0 4px",
                    }}
                  >
                    Stroke 3 asks you to sign in
                  </Text>
                  <Text
                    style={{
                      fontFamily: sans,
                      fontSize: "14px",
                      lineHeight: "22px",
                      color: body,
                      margin: 0,
                    }}
                  >
                    Sign in with Google or GitHub. If you bought a license, use the email you bought
                    it with and Pro turns on by itself. New accounts get every feature free for 17
                    days.
                  </Text>
                </td>
              </tr>
            </T>

            <Section style={{ paddingTop: "26px" }}>
              <Buttons>
                {[
                  <Link key="u" href={`${SITE}/download`} style={btnDark}>
                    Update to Stroke 3
                  </Link>,
                ]}
              </Buttons>
            </Section>
            <Text style={{ ...text.p, fontSize: "13px", color: faint, margin: "14px 0 0" }}>
              Something not working after the update? Reply to this email and we'll sort it out.
            </Text>
          </Section>

          <Footer reason="You're getting this because you signed up for Stroke." />
        </Container>
      </Body>
    </Html>
  );
}

export default Stroke3Email;
