import { Button, Section, Text } from "@react-email/components";

import { EmailLayout, sharedStyles as s } from "./layout";

export interface GiveawayWinnerEmailProps {
  /** Recipient's display name. */
  name: string;
  /** The lifetime license key they won. */
  licenseKey: string;
  /** Link to the in-app billing page, where the key also lives. */
  appUrl: string;
  /** Link to the download page, for winners who haven't installed Stroke. */
  downloadUrl: string;
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] || "there";

export function GiveawayWinnerEmail({
  name,
  licenseKey,
  appUrl,
  downloadUrl,
}: GiveawayWinnerEmailProps) {
  return (
    <EmailLayout preview="You won this week's Stroke license">
      <Text style={s.heading}>You won Stroke 🎉</Text>
      <Text style={s.paragraph}>
        Hi {firstName(name)}, your name came up in this week's draw. Stroke is yours: a lifetime
        license for up to 2 devices, with every future update included. Nothing to pay, nothing to
        cancel.
      </Text>

      <Section style={s.detailBox}>
        <Text style={{ ...s.detailRow, wordBreak: "break-all" }}>
          <span style={s.detailLabel}>License key</span>
          <br />
          <span style={{ fontFamily: "monospace", color: "#09090b" }}>{licenseKey}</span>
        </Text>
      </Section>

      <Text style={s.paragraph}>
        Paste the key into Settings → License in the app. It's also saved on your account page.
      </Text>

      <Button href={appUrl} style={s.button}>
        View your license
      </Button>

      <Text style={{ ...s.paragraph, marginTop: "24px", fontSize: "13px", color: "#71717a" }}>
        Don't have Stroke installed yet? <a href={downloadUrl}>Download it here</a>. Questions? Just
        reply to this email.
      </Text>
    </EmailLayout>
  );
}

// Preview props for `email dev` / react-email preview server.
GiveawayWinnerEmail.PreviewProps = {
  name: "Ada Lovelace",
  licenseKey: "STRK-XXXX-XXXX-XXXX-XXXX",
  appUrl: "https://stroke.click/app/billing",
  downloadUrl: "https://stroke.click/download",
} satisfies GiveawayWinnerEmailProps;

export default GiveawayWinnerEmail;
