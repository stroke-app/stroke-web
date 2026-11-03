export type DeviceOs = "macos" | "windows" | "linux";

const OS_VALUES = new Set<string>(["macos", "windows", "linux"]);

/** Accepts what the app reports (Rust's `std::env::consts::OS`), drops anything else. */
export function parseOs(value: unknown): DeviceOs | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.toLowerCase();
  if (v === "darwin" || v === "mac") return "macos";
  return OS_VALUES.has(v) ? (v as DeviceOs) : undefined;
}

/** A short app version string, or undefined. */
export function parseVersion(value: unknown): string | undefined {
  return typeof value === "string" && /^[\w.+-]{1,32}$/.test(value) ? value : undefined;
}

/**
 * Best guess for devices activated before the app reported its OS: Windows
 * names new PCs `DESKTOP-XXXXXXX`/`LAPTOP-XXXXXXX`, and macOS hostnames often
 * end in `.local` or name the model. Anything else stays unknown.
 */
export function guessOs(hostname: string | null): DeviceOs | undefined {
  if (!hostname) return undefined;
  if (/^(DESKTOP|LAPTOP)-[A-Z0-9]{5,}$/i.test(hostname)) return "windows";
  if (/\.local$|mac-?book|imac|mac-?mini|mac-?studio|mac-?pro/i.test(hostname)) return "macos";
  return undefined;
}
