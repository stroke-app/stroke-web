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

import {
  Badge,
  body,
  btnDark,
  btnLight,
  Buttons,
  display,
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
 * A bento of features: each tile is a bold lead and one plain sentence, as
 * text, over a picture of the feature. The pictures are stills drawn with the
 * stageshow kit (.agents/skills/stageshow/examples/stroke-email), captured at
 * 2x into public/email/v3/.
 */

const IMG = `${SITE}/email/v3`;
const TILE = "#f4f4f5";
const GAP = 12;

const lead: CSSProperties = {
  fontFamily: sans,
  fontSize: "16px",
  lineHeight: "22px",
  color: faint,
  margin: 0,
  padding: "20px 20px 16px",
};
const leadDark: CSSProperties = { ...lead, color: "#8b8b93" };

function Lead({ title, children, dark }: { title: string; children: ReactNode; dark?: boolean }) {
  return (
    <Text style={dark ? leadDark : lead}>
      <span style={{ color: dark ? "#ffffff" : ink, fontWeight: 600 }}>{title}</span> {children}
    </Text>
  );
}

const COPY_H = 108;
const PIC_H = 170;

/** One half-width tile: copy on top in a fixed band, the picture under it, so pictures line up across a row. */
function Tile({
  img,
  alt,
  title,
  children,
}: {
  img: string;
  alt: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <td
      className="col"
      width="270"
      valign="top"
      style={{ width: "270px", backgroundColor: TILE, borderRadius: "16px", verticalAlign: "top" }}
    >
      <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
        <tbody>
          <tr>
            <td
              className="copy"
              height={COPY_H}
              valign="top"
              style={{ height: `${COPY_H}px`, verticalAlign: "top" }}
            >
              <Lead title={title}>{children}</Lead>
            </td>
          </tr>
          <tr>
            <td>
              <Img
                src={`${IMG}/${img}.jpg`}
                alt={alt}
                width="270"
                height={PIC_H}
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  borderRadius: "0 0 16px 16px",
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </td>
  );
}

/** A dark type tile, as tall as a picture tile: the words are the picture. */
function DarkTile({ children }: { children: ReactNode }) {
  return (
    <td
      className="col"
      width="270"
      height={COPY_H + PIC_H}
      valign="top"
      style={{
        width: "270px",
        height: `${COPY_H + PIC_H}px`,
        backgroundColor: ink,
        borderRadius: "16px",
        verticalAlign: "top",
      }}
    >
      {children}
    </td>
  );
}

function Pair({ children }: { children: [ReactNode, ReactNode] }) {
  return (
    <table
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      role="presentation"
      style={{ borderCollapse: "separate", marginBottom: `${GAP}px` }}
    >
      <tbody>
        <tr>
          {children[0]}
          <td className="gap" width={GAP} style={{ width: `${GAP}px`, fontSize: 0, lineHeight: 0 }}>
            &nbsp;
          </td>
          {children[1]}
        </tr>
      </tbody>
    </table>
  );
}

const LABS: [string, string, boolean][] = [
  ["AI chat in a tab", "On by default in 3.0. Turn it off to get the full-window chat back.", true],
  ["Explorer tree", "Connections, databases, tables and columns in one tree.", false],
  [
    "Several connections at once",
    "Keep databases open with their tabs, and switch instantly.",
    false,
  ],
  ["Share as a web studio", "Share a database through a link that opens in any browser.", false],
  ["New web studio", "A bigger studio for the browser, still being built and polished.", false],
  ["Live mode, ⌘K AI, Vim mode", "Self-refreshing tables, AI in the palette, and Vim keys.", false],
];

const ALSO: [string, string][] = [
  [
    "A new design, and faster",
    "Every screen is redesigned. Stroke starts faster and big tables scroll smoothly.",
  ],
  ["Instance insights", "Live connections, transactions and cache hit ratio for your server."],
  ["Docker in one click", "Start any of 18 databases from ⌘K, already connected."],
  ["Community themes", "Build a theme from a few colours, or install one at stroke.click/themes."],
];

/** Stack the bento on phones; clients that ignore this keep two columns. */
const RESPONSIVE = `
@media only screen and (max-width: 620px) {
  .col { display: block !important; width: 100% !important; margin-bottom: 12px !important; }
  .gap { display: none !important; }
  .copy { height: auto !important; }
  .col[height] { height: auto !important; }
}`;

export function Stroke3Email() {
  const rule = (i: number) => (i ? `1px solid ${line}` : "none");
  return (
    <Html>
      <Head>
        <style>{RESPONSIVE}</style>
      </Head>
      <Preview>
        AI chat beside your tables, dashboards, local servers, encrypted backups, sync and 5 new
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

        <Container style={{ maxWidth: "616px", margin: "0 auto" }}>
          <Header action={{ href: `${SITE}/download`, label: "Download" }} />

          <Section style={{ padding: "44px 32px 0" }}>
            <Badge tag="3.0" title="New major version" sub="Stroke · Nov 19, 2026" />
            <Text style={text.h1}>Stroke 3 is here</Text>
            <Text style={text.lead}>
              The biggest update to Stroke so far: a new design, a faster app, and the features
              below. Each one is a sentence, so it takes a minute.
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

          {/* The bento */}
          <Section style={{ padding: "36px 32px 0" }}>
            {/* Hero: the only window */}
            <T
              style={{ backgroundColor: "#0a0a0b", borderRadius: "16px", marginBottom: `${GAP}px` }}
            >
              <tr>
                <td>
                  <Text
                    style={{
                      ...leadDark,
                      fontSize: "18px",
                      lineHeight: "26px",
                      padding: "24px 24px 4px",
                    }}
                  >
                    <span style={{ color: "#ffffff", fontWeight: 600 }}>AI chat, in a tab.</span>{" "}
                    Ask about your database next to your tables. It writes and runs the queries, and
                    stays inside the access level you pick.
                  </Text>
                  <Img
                    src={`${IMG}/hero.jpg`}
                    alt="Stroke's AI chat in a tab: it created two tables and inserted 45 rows"
                    width="552"
                    style={{
                      display: "block",
                      width: "100%",
                      height: "auto",
                      borderRadius: "0 0 16px 16px",
                    }}
                  />
                </td>
              </tr>
            </T>

            <Pair>
              {[
                <Tile
                  key="d"
                  img="dashboards"
                  alt="A dashboard chart card refreshed 4 seconds ago"
                  title="Dashboards."
                >
                  Saved charts on one page that refreshes itself.
                </Tile>,
                <DarkTile key="s">
                  <Text style={{ ...leadDark, padding: "20px 20px 0" }}>Works with</Text>
                  <Text
                    style={{
                      fontFamily: display,
                      fontSize: "96px",
                      lineHeight: "100px",
                      fontWeight: 600,
                      letterSpacing: "-4px",
                      color: "#ffffff",
                      margin: 0,
                      padding: "34px 20px 18px",
                    }}
                  >
                    21
                  </Text>
                  <Text
                    style={{
                      ...leadDark,
                      fontSize: "14px",
                      lineHeight: "21px",
                      padding: "4px 20px 22px",
                    }}
                  >
                    <span style={{ color: "#ffffff" }}>databases.</span> New in 3: Oracle,
                    Elasticsearch, OpenSearch, Xata and SingleStore.
                  </Text>
                </DarkTile>,
              ]}
            </Pair>

            <Pair>
              {[
                <Tile
                  key="sv"
                  img="servers"
                  alt="Postgres 17 and MySQL 8.4 running, Redis 7 stopped"
                  title="Local servers."
                >
                  Postgres, MySQL or Redis on your computer, any version.
                </Tile>,
                <Tile
                  key="p"
                  img="providers"
                  alt="Supabase, Prisma, Turso, Cloudflare and more"
                  title="Create on your host."
                >
                  New databases on Neon, Supabase, Turso or D1.
                </Tile>,
              ]}
            </Pair>

            <Pair>
              {[
                <Tile
                  key="b"
                  img="backups"
                  alt="A nightly backup at 02:00, encrypted, switched on"
                  title="Scheduled backups."
                >
                  Encrypted, to Stroke Cloud or your own S3.
                </Tile>,
                <Tile
                  key="y"
                  img="sync"
                  alt="Three computers synced through an encrypted lock"
                  title="Sync."
                >
                  Connections, settings and queries on all your computers.
                </Tile>,
              ]}
            </Pair>

            <Pair>
              {[
                <DarkTile key="n">
                  <Text style={{ ...leadDark, padding: "20px 20px 0" }}>In any project, run</Text>
                  <Text
                    style={{
                      fontFamily: mono,
                      fontSize: "26px",
                      lineHeight: "34px",
                      color: "#ffffff",
                      margin: 0,
                      padding: "40px 20px 40px",
                    }}
                  >
                    <span style={{ color: "#52525b" }}>$ </span>npx strokedb
                  </Text>
                  <Text
                    style={{
                      ...leadDark,
                      fontSize: "14px",
                      lineHeight: "21px",
                      padding: "0 20px 22px",
                    }}
                  >
                    It opens that project's database in Stroke, or in your browser at{" "}
                    <Link
                      href={`${SITE}/studio`}
                      style={{ color: "#ffffff", textDecoration: "underline" }}
                    >
                      stroke.click/studio
                    </Link>
                    .
                  </Text>
                </DarkTile>,
                <Tile
                  key="k"
                  img="shortcuts"
                  alt="Keycaps: command, semicolon, then S"
                  title="Your shortcuts."
                >
                  Change any key, or press ⌘; then a letter.
                </Tile>,
              ]}
            </Pair>

            <Pair>
              {[
                <Tile
                  key="sh"
                  img="share"
                  alt="A chart shared as a link that expires in 7 days"
                  title="Share a chart."
                >
                  An encrypted link that opens in any browser.
                </Tile>,
                <Tile
                  key="m"
                  img="migrations"
                  alt="Two migrations applied, one pending"
                  title="Migrations."
                >
                  See what has run, and what's still pending.
                </Tile>,
              ]}
            </Pair>
          </Section>

          <SectionHead kicker="Also new" title="And a few more things" />
          <Section style={{ padding: "0 32px" }}>
            <T style={{ border: `1px solid ${line}` }}>
              {ALSO.map(([name, what], i) => (
                <tr key={name}>
                  <td style={{ padding: "14px 16px", borderTop: rule(i) }}>
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
                        fontSize: "14px",
                        lineHeight: "21px",
                        color: body,
                        margin: "2px 0 0",
                      }}
                    >
                      {what}
                    </Text>
                  </td>
                </tr>
              ))}
            </T>
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
                  <T style={{ backgroundColor: "#000000", borderRadius: "10px" }}>
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
