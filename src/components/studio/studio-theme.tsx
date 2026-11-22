import { MonitorIcon, MoonIcon, PaletteIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { useTheme } from "#/components/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";

/**
 * The studio's look: the site's System / Light / Dark, or a studio palette.
 * A palette sets the site theme it is built on (Paper is light, Graphite and
 * Midnight are dark) and a `data-palette` on the studio root that the
 * stylesheet turns into its colours (styles.css, "Web studio palettes").
 */
export const PALETTES = [
  { id: "graphite", label: "Graphite", base: "dark", swatch: "oklch(0.24 0.005 260)" },
  { id: "midnight", label: "Midnight", base: "dark", swatch: "oklch(0.2 0.04 265)" },
  { id: "paper", label: "Paper", base: "light", swatch: "oklch(0.975 0.012 85)" },
] as const;
export type PaletteId = (typeof PALETTES)[number]["id"] | "";

const KEY = "stroke-studio-palette";

/** The palette in use, kept in localStorage; "" is the plain site theme. */
export function useStudioPalette(): [PaletteId, (p: PaletteId) => void] {
  const [palette, setPalette] = useState<PaletteId>("");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) ?? "";
      if (PALETTES.some((p) => p.id === saved)) setPalette(saved as PaletteId);
    } catch {
      // Storage off: the plain theme.
    }
  }, []);
  const set = (p: PaletteId) => {
    setPalette(p);
    try {
      if (p) localStorage.setItem(KEY, p);
      else localStorage.removeItem(KEY);
    } catch {
      // Kept for this visit only.
    }
  };
  return [palette, set];
}

const BASE = [
  { id: "system", label: "System", icon: MonitorIcon },
  { id: "light", label: "Light", icon: SunIcon },
  { id: "dark", label: "Dark", icon: MoonIcon },
] as const;

export function StudioThemeMenu({
  palette,
  onPalette,
}: {
  palette: PaletteId;
  onPalette: (p: PaletteId) => void;
}) {
  const { theme, setTheme } = useTheme();
  const value = palette || theme;
  const current =
    PALETTES.find((p) => p.id === palette)?.label ?? BASE.find((b) => b.id === theme)?.label;

  function pick(v: string) {
    const pal = PALETTES.find((p) => p.id === v);
    if (pal) {
      setTheme(pal.base);
      onPalette(pal.id);
    } else if (v === "system" || v === "light" || v === "dark") {
      setTheme(v);
      onPalette("");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`Theme: ${current}`}
            title="Theme"
            className="flex h-5 items-center gap-1 rounded px-1.5 text-muted-foreground hover:bg-accent hover:text-foreground data-popup-open:bg-accent data-popup-open:text-foreground"
          />
        }
      >
        <PaletteIcon aria-hidden="true" className="size-3" />
        <span>{current}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" sideOffset={6} className="w-44 p-1">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => pick(String(v))}>
          <DropdownMenuGroup>
            {BASE.map((b) => (
              <DropdownMenuRadioItem
                key={b.id}
                value={b.id}
                closeOnClick
                className="gap-2 text-[12.5px]"
              >
                <b.icon aria-hidden="true" className="size-3.5 text-muted-foreground" />
                {b.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[11px] text-muted-foreground">
              Studio palettes
            </DropdownMenuLabel>
            {PALETTES.map((p) => (
              <DropdownMenuRadioItem
                key={p.id}
                value={p.id}
                closeOnClick
                className="gap-2 text-[12.5px]"
              >
                <span
                  aria-hidden="true"
                  className="size-3.5 rounded-full border border-border"
                  style={{ background: p.swatch }}
                />
                {p.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
