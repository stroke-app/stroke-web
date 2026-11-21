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

import { body, display, faint, ink, line, sans, SITE } from "./kit";

/**
 * The license and terms change for Stroke 3, sent once to every contact as a
 * Plunk campaign. A plain notice: a few sentences and the key points
 * highlighted, nothing decorative. The wording follows /terms (updated
 * November 19, 2026).
 */

const p: CSSProperties = {
  fontFamily: sans,
  fontSize: "16px",
  lineHeight: "26px",
  color: body,
  margin: "0 0 18px",
};
const strong: CSSProperties = { color: ink, fontWeight: 600 };

function Point({ title, children, last }: { title: string; children: ReactNode; last?: boolean }) {
  return (
    <tr>
      <td
        style={{
          padding: last ? "14px 0 0" : "14px 0",
          borderBottom: last ? "none" : "1px solid #f3dc97",
        }}
      >
        <Text
          style={{
            fontFamily: sans,
            fontSize: "15px",
            lineHeight: "22px",
            fontWeight: 600,
            color: ink,
            margin: 0,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: sans,
            fontSize: "15px",
            lineHeight: "23px",
            color: "#4a3b10",
            margin: "2px 0 0",
          }}
        >
          {children}
        </Text>
      </td>
    </tr>
  );
}

export function LicenseUpdateEmail() {
  return (
    <Html>
      <Head />
      <Preview>
        From Stroke 3, your license lives on your account. Sign in with the email you bought it
        with. Our terms are updated.
      </Preview>
      <Body style={{ backgroundColor: "#ffffff", margin: 0, padding: 0, fontFamily: sans }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 24px 48px" }}>
          <Img
            src={`${SITE}/icon.png`}
            width="32"
            height="32"
            alt="Stroke"
            style={{ display: "block", borderRadius: "8px", marginBottom: "28px" }}
          />

          <Text
            style={{
              display: "inline-block",
              fontFamily: sans,
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.4px",
              color: "#8a5a00",
              backgroundColor: "#fff4d6",
              border: "1px solid #f3dc97",
              borderRadius: "6px",
              padding: "3px 8px",
              margin: "0 0 14px",
            }}
          >
            Important: license and terms update
          </Text>

          <Text
            style={{
              fontFamily: display,
              fontSize: "28px",
              lineHeight: "34px",
              fontWeight: 600,
              letterSpacing: "-0.5px",
              color: ink,
              margin: "0 0 18px",
            }}
          >
            Your Stroke license now lives on your account
          </Text>

          <Text style={p}>
            Starting with Stroke 3, there are <span style={strong}>no license keys</span>. You turn
            on Pro by <span style={strong}>signing in</span>, and your license belongs to the
            account with the email you bought it with. We've updated our Terms of Service to match.
          </Text>

          <Section
            style={{
              backgroundColor: "#fffaeb",
              border: "1px solid #f3dc97",
              borderRadius: "10px",
              padding: "6px 22px 20px",
              margin: "6px 0 26px",
            }}
          >
            <table
              width="100%"
              cellPadding={0}
              cellSpacing={0}
              role="presentation"
              style={{ borderCollapse: "collapse" }}
            >
              <tbody>
                <Point title="Bought a license? Sign in with the same email.">
                  Update to Stroke 3 and sign in with Google or GitHub using the email you bought it
                  with. Pro turns on by itself.
                </Point>
                <Point title="A license stays with its email.">
                  It can't move to an account with a different email, and a new account doesn't get
                  a license someone else bought.
                </Point>
                <Point title="Up to 3 computers per account.">
                  To switch computers, sign out on one you no longer use, or remove it at
                  stroke.click/app.
                </Point>
                <Point title="One free trial per account and per computer." last>
                  The 30-day trial runs once for each. A second account on the same computer doesn't
                  start a new one.
                </Point>
              </tbody>
            </table>
          </Section>

          <Text style={p}>
            <span style={strong}>Nothing else changes.</span> A license is still one payment of
            $9.99, with no subscription and every update included.
          </Text>

          <Text style={p}>
            Bought with an email you can't sign in with, or need more than 3 computers? Reply to
            this email and we'll sort it out.
          </Text>

          <Text style={{ ...p, margin: "0 0 32px" }}>
            The full wording is in our updated{" "}
            <Link href={`${SITE}/terms`} style={{ color: ink, textDecoration: "underline" }}>
              Terms of Service
            </Link>
            , in effect from November 19, 2026. By continuing to use Stroke, you accept them.
          </Text>

          <Text
            style={{
              fontFamily: sans,
              fontSize: "12px",
              lineHeight: "18px",
              color: faint,
              margin: 0,
              paddingTop: "18px",
              borderTop: `1px solid ${line}`,
            }}
          >
            You're getting this notice because you have a Stroke account or license.{" "}
            <Link href={SITE} style={{ color: faint, textDecoration: "underline" }}>
              stroke.click
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default LicenseUpdateEmail;
