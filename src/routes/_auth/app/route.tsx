import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useNavigate, useRouter } from "@tanstack/react-router";
import {
  BookOpenIcon,
  ChevronsUpDownIcon,
  DownloadIcon,
  HelpCircleIcon,
  KeyRoundIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  RocketIcon,
  SunIcon,
} from "lucide-react";
import posthog from "posthog-js";

import { SITE } from "#/components/page";
import { StrokeIcon } from "#/components/stroke-icon";
import { useTheme } from "#/components/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { authClient } from "#/lib/auth/auth-client";
import { useAuth } from "#/lib/auth/hooks";
import { authQueryOptions } from "#/lib/auth/queries";
import { licenseQueryOptions } from "#/lib/billing/functions";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/_auth/app")({
  component: AppLayout,
});

const NAV_ITEMS = [
  { to: "/app" as const, label: "Overview", exact: true },
  { to: "/app/billing" as const, label: "Plan & billing", exact: false },
  { to: "/app/backups" as const, label: "Backups", exact: false },
  { to: "/app/downloads" as const, label: "Downloads", exact: false },
  { to: "/app/reviews" as const, label: "Review", exact: false },
  { to: "/app/support" as const, label: "Support", exact: false },
];

type NavItem = (typeof NAV_ITEMS)[number];

/** A tab in the bar under the header: the active one gets the underline. */
function NavTab({ to, label, exact }: NavItem) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      className="relative flex h-11 shrink-0 items-center px-3 text-[14px] text-muted-foreground transition-colors duration-150 hover:text-foreground data-[status=active]:text-foreground data-[status=active]:after:absolute data-[status=active]:after:inset-x-3 data-[status=active]:after:-bottom-px data-[status=active]:after:h-0.5 data-[status=active]:after:rounded-full data-[status=active]:after:bg-foreground"
    >
      {label}
    </Link>
  );
}

function Avatar({ className }: { className?: string }) {
  const { user } = useAuth();
  const initial = user?.name?.[0]?.toUpperCase() ?? "?";
  return user?.image ? (
    <img
      src={user.image}
      alt=""
      className={cn("size-6 shrink-0 rounded-full ring-1 ring-border", className)}
    />
  ) : (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground ring-1 ring-border",
        className,
      )}
    >
      {initial}
    </span>
  );
}

/** Avatar and name; opens the account menu (pages, theme, help, sign out). */
function AccountMenu({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { data: license } = useQuery(licenseQueryOptions());
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const router = useRouter();

  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onResponse: async () => {
          queryClient.setQueryData(authQueryOptions().queryKey, null);
          posthog.reset();
          await router.invalidate();
        },
      },
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className={cn(
          "flex items-center gap-2 rounded-lg text-left transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/60 data-popup-open:bg-accent",
          compact ? "p-1" : "w-full px-2 py-1.5",
        )}
      >
        <Avatar className={compact ? "size-7" : undefined} />
        {!compact && (
          <>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
              {user?.name ?? "Account"}
            </span>
            <ChevronsUpDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={compact ? "bottom" : "top"}
        align={compact ? "end" : "start"}
        sideOffset={6}
        className="w-60 rounded-xl p-1.5 [&_[data-slot=dropdown-menu-item]]:rounded-lg [&_[data-slot=dropdown-menu-sub-trigger]]:rounded-lg"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2.5 px-2 py-2">
            <Avatar className="size-8" />
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium text-foreground">
                {user?.name}
              </span>
              <span className="block truncate text-[12px]">{user?.email}</span>
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate({ to: "/app/billing" })}>
          <KeyRoundIcon />
          Plan &amp; billing
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate({ to: "/app/downloads" })}>
          <DownloadIcon />
          Downloads
        </DropdownMenuItem>
        {!license && (
          <DropdownMenuItem onClick={() => navigate({ to: "/app/billing" })}>
            <RocketIcon />
            Upgrade to Pro
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <PaletteIcon />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-36 rounded-xl p-1.5">
            <DropdownMenuRadioGroup
              value={theme}
              onValueChange={(v) => setTheme(v as typeof theme)}
            >
              <DropdownMenuRadioItem value="light" className="rounded-lg">
                <SunIcon />
                Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark" className="rounded-lg">
                <MoonIcon />
                Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system" className="rounded-lg">
                <MonitorIcon />
                System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={() => navigate({ to: "/app/support" })}>
          <HelpCircleIcon />
          Help &amp; support
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate({ to: "/docs" })}>
          <BookOpenIcon />
          Docs
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppLayout() {
  const { data: license } = useQuery(licenseQueryOptions());
  return (
    <div className={cn(SITE, "flex min-h-svh flex-col")}>
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-[1120px] items-center gap-3 px-4 md:px-8">
          <Link to="/" aria-label="Stroke home" className="flex items-center gap-2.5">
            <StrokeIcon className="size-5" />
            <span className="text-[15px] font-semibold tracking-[-0.02em]">Stroke</span>
          </Link>
          <span className="text-faint" aria-hidden="true">
            /
          </span>
          <span className="text-[14px] text-muted-foreground">Account</span>
          {!license && (
            <Link
              to="/app/billing"
              className="ml-2 hidden h-6 items-center gap-1.5 rounded-full bg-ink/[0.07] px-2.5 text-[12px] font-medium text-foreground transition-colors hover:bg-ink/[0.1] sm:flex"
            >
              <RocketIcon className="size-3" />
              Get Pro
            </Link>
          )}
          <div className="ml-auto flex items-center gap-1">
            <Link
              to="/docs"
              className="hidden h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              Docs
            </Link>
            <Link
              to="/changelog"
              className="hidden h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              Changelog
            </Link>
            <AccountMenu compact />
          </div>
        </div>
        <nav
          aria-label="Account"
          className="mx-auto flex w-full max-w-[1120px] [scrollbar-width:none] overflow-x-auto px-1 md:px-5"
        >
          {NAV_ITEMS.map((item) => (
            <NavTab key={item.to} {...item} />
          ))}
        </nav>
      </header>

      <main className="flex-1 px-4 py-10 sm:px-6 md:px-8 md:py-14">
        <div className="mx-auto w-full max-w-[1056px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
