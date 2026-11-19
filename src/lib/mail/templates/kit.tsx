import { Img, Link, Section, Text } from "@react-email/components";
import type { CSSProperties, ReactNode } from "react";

/**
 * Shared pieces for the one-off campaign emails (Stroke 3, the license
 * change): square corners, hairlines, SF Pro first, tables for layout so
 * Gmail and Outlook keep it.
 */

export const SITE = "https://stroke.click";
export const sans =
  '"SF Pro Text", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", Helvetica, Arial, sans-serif';
export const display =
  '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", Helvetica, Arial, sans-serif';
export const mono = '"SF Mono", ui-monospace, Menlo, Consolas, "Liberation Mono", monospace';

export const ink = "#0a0a0a";
export const body = "#4b4b55";
export const faint = "#9a9aa3";
export const line = "#e5e5ea";
export const soft = "#f7f7f8";

export const text = {
  h1: {
    fontFamily: display,
    fontSize: "38px",
    lineHeight: "43px",
    fontWeight: 600,
    letterSpacing: "-1px",
    color: ink,
    margin: "0 0 14px",
  },
  lead: { fontFamily: sans, fontSize: "17px", lineHeight: "26px", color: body, margin: "0 0 26px" },
  h2: {
    fontFamily: display,
    fontSize: "24px",
    lineHeight: "30px",
    fontWeight: 600,
    letterSpacing: "-0.5px",
    color: ink,
    margin: "0 0 8px",
  },
  p: { fontFamily: sans, fontSize: "15px", lineHeight: "23px", color: body, margin: "0 0 14px" },
  label: {
    fontFamily: mono,
    fontSize: "11px",
    lineHeight: "14px",
    letterSpacing: "0.8px",
    textTransform: "uppercase" as const,
    color: faint,
    margin: 0,
  },
  link: { fontFamily: sans, color: ink, textDecoration: "underline" },
};

export const btnDark: CSSProperties = {
  display: "inline-block",
  backgroundColor: ink,
  color: "#ffffff",
  fontFamily: sans,
  fontSize: "15px",
  fontWeight: 500,
  textDecoration: "none",
  padding: "14px 22px",
};
export const btnLight: CSSProperties = {
  ...btnDark,
  backgroundColor: "#ffffff",
  color: ink,
  border: `1px solid ${line}`,
  padding: "13px 21px",
};

/** A full-width table, the only layout every mail client agrees on. */
export function T({ children, style }: { children: ReactNode; style?: CSSProperties }) {
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

/** Buttons side by side without stretching. */
export function Buttons({ children }: { children: ReactNode[] }) {
  return (
    <table cellPadding={0} cellSpacing={0} role="presentation">
      <tbody>
        <tr>
          {children.map((b, i) => (
            <td key={i} style={{ paddingLeft: i ? "8px" : 0 }}>
              {b}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

/** The bar across the top: black for news, amber for a notice. */
export function TopBar({
  children,
  tone = "dark",
}: {
  children: ReactNode;
  tone?: "dark" | "notice";
}) {
  const notice = tone === "notice";
  return (
    <T
      style={{
        backgroundColor: notice ? "#fff4d6" : ink,
        borderBottom: notice ? "1px solid #f3dc97" : "none",
      }}
    >
      <tr>
        <td
          style={{
            padding: "11px 16px",
            textAlign: "center",
            fontFamily: sans,
            fontSize: "13px",
            lineHeight: "18px",
            color: notice ? "#6b4e00" : "#ffffff",
          }}
        >
          {children}
        </td>
      </tr>
    </T>
  );
}

/** Logo and name in a hairline box, with one button on the right. */
export function Header({ action }: { action: { href: string; label: string } }) {
  return (
    <Section className="px" style={{ padding: "24px 32px 0" }}>
      <T style={{ border: `1px solid ${line}` }}>
        <tr>
          <td style={{ padding: "0 14px", height: "48px" }}>
            <Img
              src={`${SITE}/icon.png`}
              width="24"
              height="24"
              alt="Stroke"
              style={{ display: "inline-block", verticalAlign: "middle", borderRadius: "6px" }}
            />
            <span
              style={{
                fontFamily: display,
                fontSize: "16px",
                fontWeight: 600,
                color: ink,
                verticalAlign: "middle",
                marginLeft: "9px",
              }}
            >
              Stroke
            </span>
          </td>
          <td style={{ textAlign: "right", width: "1%", whiteSpace: "nowrap" }}>
            <Link href={action.href} style={{ ...btnDark, fontSize: "13px", padding: "16px 18px" }}>
              {action.label}
            </Link>
          </td>
        </tr>
      </T>
    </Section>
  );
}

/** The app icon large, beside a two-line badge. */
export function Badge({ tag, title, sub }: { tag?: string; title: string; sub: string }) {
  return (
    <table cellPadding={0} cellSpacing={0} role="presentation" style={{ marginBottom: "26px" }}>
      <tbody>
        <tr>
          <td style={{ verticalAlign: "middle", paddingRight: "14px" }}>
            <Img
              src={`${SITE}/icon.png`}
              width="52"
              height="52"
              alt="Stroke"
              style={{ display: "block", borderRadius: "12px" }}
            />
          </td>
          <td style={{ verticalAlign: "middle" }}>
            <table
              cellPadding={0}
              cellSpacing={0}
              role="presentation"
              style={{ borderCollapse: "collapse", border: `1px solid ${line}` }}
            >
              <tbody>
                <tr>
                  {tag && (
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
                      {tag}
                    </td>
                  )}
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
                      {title}
                    </Text>
                    <Text style={{ ...text.label, fontSize: "10px" }}>{sub}</Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function SectionHead({
  kicker,
  title,
  intro,
}: {
  kicker?: string;
  title: string;
  intro?: string;
}) {
  return (
    <Section className="px" style={{ padding: "48px 32px 18px" }}>
      {kicker && <Text style={{ ...text.label, margin: "0 0 8px" }}>{kicker}</Text>}
      <Text style={text.h2}>{title}</Text>
      {intro && (
        <Text style={{ ...text.p, fontSize: "16px", lineHeight: "25px", margin: 0 }}>{intro}</Text>
      )}
    </Section>
  );
}

/** Hairline rule, faint reason line, and the big wordmark. */
export function Footer({ reason }: { reason: string }) {
  return (
    <Section className="px" style={{ padding: "52px 32px 0" }}>
      <T style={{ borderTop: `1px solid ${line}` }}>
        <tr>
          <td style={{ padding: "18px 0 0", verticalAlign: "top" }}>
            <Img
              src={`${SITE}/icon.png`}
              width="20"
              height="20"
              alt="Stroke"
              style={{ display: "inline-block", verticalAlign: "middle", borderRadius: "5px" }}
            />
            <span
              style={{
                ...text.label,
                textTransform: "none",
                letterSpacing: "0.2px",
                verticalAlign: "middle",
                marginLeft: "8px",
              }}
            >
              {reason}
            </span>
          </td>
          <td
            style={{
              padding: "20px 0 0",
              textAlign: "right",
              verticalAlign: "top",
              whiteSpace: "nowrap",
            }}
          >
            <Link
              href={SITE}
              style={{ ...text.label, textTransform: "none", color: body, textDecoration: "none" }}
            >
              stroke.click
            </Link>
          </td>
        </tr>
      </T>
      <Text
        style={{
          fontFamily: display,
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
  );
}
