import { Body, Container, Head, Html, Link, Preview, Section, Text } from "@react-email/components";

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
  T,
  text,
  TopBar,
} from "./kit";

/**
 * The license and terms change for Stroke 3, sent once to every contact as a
 * Plunk campaign. The wording follows /terms (updated November 19, 2026).
 */

const amber = { bg: "#fff8e6", border: "#f3dc97", ink: "#6b4e00" };

const CHANGES: [what: string, before: string, now: string][] = [
  ["Turning on Pro", "Paste a license key", "Sign in with Google or GitHub"],
  ["Who has Pro", "Whoever has the key", "The account with the email you bought it with"],
  ["Computers", "Counted per key", "Up to 3 per account"],
  ["Free trial", "Per computer, no account", "17 days, once per account and once per computer"],
  ["Price", "$9.99 once", "$9.99 once. No change, no subscription"],
];

export function LicenseUpdateEmail() {
  const rule = (i: number) => (i ? `1px solid ${line}` : "none");
  const th = {
    fontFamily: mono,
    fontSize: "10px",
    letterSpacing: "0.8px",
    textTransform: "uppercase" as const,
    color: faint,
    padding: "10px 14px",
    textAlign: "left" as const,
    fontWeight: 400,
    borderBottom: `1px solid ${line}`,
  };
  const td = {
    fontFamily: sans,
    fontSize: "13px",
    lineHeight: "19px",
    padding: "12px 14px",
    verticalAlign: "top" as const,
  };
  return (
    <Html>
      <Head />
      <Preview>
        Important: from Stroke 3, your license lives on your account. Sign in with the email you
        bought it with. Our terms are updated.
      </Preview>
      <Body style={{ backgroundColor: "#ffffff", margin: 0, padding: 0, fontFamily: sans }}>
        <TopBar tone="notice">
          <strong>Important</strong>&nbsp;&nbsp;·&nbsp;&nbsp;Changes to your Stroke license and our
          Terms of Service
        </TopBar>

        <Container style={{ maxWidth: "640px", margin: "0 auto" }}>
          <Header action={{ href: `${SITE}/terms`, label: "Read the terms" }} />

          <Section style={{ padding: "44px 32px 0" }}>
            <Badge tag="!" title="License and terms update" sub="In effect · Nov 19, 2026" />
            <Text style={text.h1}>Your license now lives on your account</Text>
            <Text style={text.lead}>
              Stroke 3 has no license keys. You turn on Pro by signing in, and your license belongs
              to the account with the email you bought it with. We've updated our Terms of Service
              to match.
            </Text>
          </Section>

          {/* What to do, as a notice */}
          <Section style={{ padding: "0 32px" }}>
            <T style={{ backgroundColor: amber.bg, border: `1px solid ${amber.border}` }}>
              <tr>
                <td style={{ padding: "20px 22px 8px" }}>
                  <Text
                    style={{
                      fontFamily: mono,
                      fontSize: "11px",
                      letterSpacing: "0.8px",
                      textTransform: "uppercase",
                      color: amber.ink,
                      margin: "0 0 6px",
                    }}
                  >
                    What you need to do
                  </Text>
                  <Text
                    style={{ ...text.h2, fontSize: "20px", lineHeight: "26px", margin: "0 0 12px" }}
                  >
                    Bought a license? Sign in with the same email.
                  </Text>
                </td>
              </tr>
              {[
                ["01", "Update to Stroke 3."],
                [
                  "02",
                  "Sign in with Google or GitHub, using the email you bought your license with.",
                ],
                ["03", "Pro turns on by itself. There is no key to paste."],
              ].map(([n, step]) => (
                <tr key={n}>
                  <td style={{ padding: "0 22px 12px" }}>
                    <T>
                      <tr>
                        <td
                          style={{
                            fontFamily: mono,
                            fontSize: "12px",
                            color: amber.ink,
                            width: "30px",
                            verticalAlign: "top",
                            paddingTop: "1px",
                          }}
                        >
                          {n}
                        </td>
                        <td
                          style={{
                            fontFamily: sans,
                            fontSize: "14px",
                            lineHeight: "21px",
                            color: ink,
                          }}
                        >
                          {step}
                        </td>
                      </tr>
                    </T>
                  </td>
                </tr>
              ))}
              <tr>
                <td style={{ padding: "4px 22px 22px" }}>
                  <Text
                    style={{
                      fontFamily: sans,
                      fontSize: "13px",
                      lineHeight: "20px",
                      color: amber.ink,
                      margin: 0,
                    }}
                  >
                    Bought it with an email you can't sign in with? Reply to this email and we'll
                    move it for you.
                  </Text>
                </td>
              </tr>
            </T>
          </Section>

          <SectionHead kicker="What changes" title="Before and after Stroke 3" />
          <Section style={{ padding: "0 32px" }}>
            <table
              width="100%"
              cellPadding={0}
              cellSpacing={0}
              role="presentation"
              style={{ borderCollapse: "collapse", border: `1px solid ${line}` }}
            >
              <thead>
                <tr>
                  <th style={{ ...th, width: "28%" }}>&nbsp;</th>
                  <th style={{ ...th, width: "30%" }}>Stroke 2</th>
                  <th style={{ ...th, color: ink }}>Stroke 3</th>
                </tr>
              </thead>
              <tbody>
                {CHANGES.map(([what, before, now], i) => (
                  <tr key={what}>
                    <td style={{ ...td, fontWeight: 600, color: ink, borderTop: rule(i) }}>
                      {what}
                    </td>
                    <td style={{ ...td, color: faint, borderTop: rule(i) }}>{before}</td>
                    <td
                      style={{ ...td, color: ink, borderTop: rule(i), backgroundColor: "#fafafa" }}
                    >
                      {now}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <SectionHead kicker="Good to know" title="The rules, plainly" />
          <Section style={{ padding: "0 32px" }}>
            <T style={{ border: `1px solid ${line}` }}>
              {[
                [
                  "A license stays with its email",
                  "It can't be moved to an account with a different email. A new account doesn't get a license someone else bought.",
                ],
                [
                  "3 computers at a time",
                  "To use Stroke on a new computer, sign out on one you no longer use, or remove it at stroke.click/app. Need more? Reply to this email.",
                ],
                [
                  "One trial per person and computer",
                  "The 17-day trial runs once per account and once per computer. A second account on the same computer continues that computer's trial.",
                ],
                [
                  "Still yours for good",
                  "One payment, no subscription, nothing to renew, and every update included.",
                ],
              ].map(([name, what], i) => (
                <tr key={name}>
                  <td style={{ padding: "14px 18px", borderTop: rule(i) }}>
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

            <Text style={{ ...text.p, margin: "26px 0 18px" }}>
              The full wording is in our updated{" "}
              <Link href={`${SITE}/terms`} style={text.link}>
                Terms of Service
              </Link>
              , in effect from November 19, 2026. By continuing to use Stroke, you accept the
              updated terms.
            </Text>
            <Buttons>
              {[
                <Link key="t" href={`${SITE}/terms`} style={btnDark}>
                  Read the updated terms
                </Link>,
                <Link key="a" href={`${SITE}/app`} style={btnLight}>
                  Your account
                </Link>,
              ]}
            </Buttons>
          </Section>

          <Footer reason="A notice about your Stroke account and our terms." />
        </Container>
      </Body>
    </Html>
  );
}

export default LicenseUpdateEmail;
