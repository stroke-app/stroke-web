import { Menu } from "@base-ui/react/menu";
import { Tooltip } from "@base-ui/react/tooltip";
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

import { useTheme } from "#/components/theme-provider";
import { cn } from "#/lib/utils";

/** The popup look every menu on the share page uses (dropdowns and the right-click menu). */
export const menuPopup =
  "z-50 max-h-(--available-height) min-w-44 origin-(--transform-origin) overflow-y-auto rounded-xl bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/8 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-100";
export const menuItem =
  "flex h-8 cursor-default items-center gap-2 rounded-lg px-2 text-[13px] outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground";
export const menuSep = "my-1 h-px bg-border";
export const menuLabel = "px-2 pt-1.5 pb-1 text-[11px] font-medium text-muted-foreground";

/** An icon button in a bar: square, quiet until hovered. */
export const iconBtn =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-[background-color,color,scale] duration-150 ease-out hover:bg-accent hover:text-foreground active:scale-[0.96] data-popup-open:bg-accent data-popup-open:text-foreground [&_svg]:size-4";
export const textBtn =
  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-muted-foreground transition-[background-color,color,scale] duration-150 ease-out hover:bg-accent hover:text-foreground active:scale-[0.97] data-popup-open:bg-accent data-popup-open:text-foreground [&_svg]:size-3.5";

/** A small label on hover, instead of a browser title. */
export function Tip({
  label,
  children,
  side = "top",
}: {
  label: ReactNode;
  children: ReactElement;
  side?: "top" | "bottom";
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger delay={300} render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner side={side} sideOffset={6} className="z-50">
          <Tooltip.Popup
            className={cn(
              "max-w-72 rounded-lg bg-foreground px-2 py-1 text-[12px] leading-snug text-background shadow-md",
              "origin-(--transform-origin) transition-[opacity,scale] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
            )}
          >
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export const TipProvider = Tooltip.Provider;

/** System, light or dark, for the share page (the whole site follows it). */
export function ThemeMenu() {
  const { theme, setTheme } = useTheme();
  const Icon = theme === "light" ? SunIcon : theme === "dark" ? MoonIcon : MonitorIcon;
  return (
    <Menu.Root>
      <Tip label="Theme" side="bottom">
        <Menu.Trigger className={iconBtn} aria-label="Theme">
          <Icon />
        </Menu.Trigger>
      </Tip>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={4} className="z-50">
          <Menu.Popup className={cn(menuPopup, "min-w-36")}>
            <Menu.RadioGroup
              value={theme}
              onValueChange={(v) => setTheme(v as "system" | "light" | "dark")}
            >
              {(
                [
                  ["system", "System", MonitorIcon],
                  ["light", "Light", SunIcon],
                  ["dark", "Dark", MoonIcon],
                ] as const
              ).map(([v, l, I]) => (
                <Menu.RadioItem key={v} value={v} className={menuItem}>
                  <I />
                  <span className="flex-1">{l}</span>
                  <Menu.RadioItemIndicator>
                    <CheckIcon className="text-foreground!" />
                  </Menu.RadioItemIndicator>
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
