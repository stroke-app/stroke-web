import { Button, Section, Text } from "@react-email/components";

import { EmailLayout, sharedStyles as s } from "./layout";

/**
 * The Stroke 3 license and terms change, sent once to every contact as a
 * Plunk campaign. The wording follows /terms (updated November 19, 2026).
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

export function LicenseUpdateEmail() {
  return (
    <EmailLayout
      preview="Licenses now belong to your account: sign in with the email you bought with, and use Stroke on up to 3 computers."
      reason="You're getting this because you have a Stroke account or license. It's a notice about our terms."
    >
      <Text style={s.heading}>Licenses now belong to your account</Text>
      <Text style={s.paragraph}>
        With Stroke 3, licenses work differently. There are no more license keys: your license lives
        on your Stroke account, and you use it by signing in. We've updated our terms to match.
        Here's what changes for you.
      </Text>

      <Text style={sub}>If you bought a license</Text>
      <Text style={item}>
        <span style={name}>Sign in with the email you bought it with.</span> Open Stroke 3 and sign
        in with Google or GitHub using that same email. Pro is already on your account, with nothing
        to paste.
      </Text>
      <Text style={item}>
        <span style={name}>A license stays with its email.</span> It can't be moved to an account
        with a different email, and a new account doesn't get a license that was bought by someone
        else.
      </Text>
      <Text style={item}>
        <span style={name}>Up to 3 computers.</span> Your account runs Stroke on 3 computers at a
        time. To switch computers, sign out on one you no longer use, or remove it on your account
        page.
      </Text>
      <Text style={item}>
        <span style={name}>Still yours for good.</span> It's still one payment: no subscription,
        nothing to renew, and every update included.
      </Text>

      <Text style={sub}>If you're new or on a trial</Text>
      <Text style={item}>
        Stroke asks you to sign in when you first open it. The 17-day free trial, with every
        feature, runs once per account and once per computer: a second account on the same computer
        continues that computer's trial instead of starting a new one.
      </Text>

      <Section style={{ marginTop: "24px" }}>
        <Button href="https://stroke.click/app" style={s.button}>
          Open your account
        </Button>
      </Section>

      <Text style={{ ...s.paragraph, marginTop: "24px" }}>
        The full wording is in our updated <a href="https://stroke.click/terms">Terms of Service</a>
        , in effect from November 19, 2026. By continuing to use Stroke, you accept the updated
        terms.
      </Text>
      <Text style={small}>
        Bought with an email you no longer use, or need more than 3 computers? Reply to this email
        and we'll sort it out.
      </Text>
    </EmailLayout>
  );
}

export default LicenseUpdateEmail;
