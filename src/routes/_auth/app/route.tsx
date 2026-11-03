import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import {
  ArrowUpRightIcon,
  BookOpenIcon,
  ChevronsUpDownIcon,
  DownloadIcon,
  HelpCircleIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  RocketIcon,
  SparklesIcon,
  StarIcon,
  SunIcon,
} from "lucide-react";
import posthog from "posthog-js";

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
  { to: "/app" as const, label: "Dashboard", icon: LayoutDashboardIcon, exact: true },
  { to: "/app/billing" as const, label: "License & billing", icon: KeyRoundIcon, exact: false },
  { to: "/app/downloads" as const, label: "Downloads", icon: DownloadIcon, exact: false },
  { to: "/app/reviews" as const, label: "Reviews", icon: StarIcon, exact: false },
  { to: "/app/support" as const, label: "Support", icon: HelpCircleIcon, exact: false },
];

const RESOURCES = [
  { to: "/docs" as const, label: "Docs", icon: BookOpenIcon },
  { to: "/changelog" as const, label: "What's new", icon: SparklesIcon },
];

type NavItem = (typeof NAV_ITEMS)[number];

function NavLink({ to, label, icon: Icon, exact }: NavItem) {
  // Link marks itself active (data-status, aria-current); style off that.
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      className="flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground data-[status=active]:bg-accent data-[status=active]:font-medium data-[status=active]:text-foreground data-[status=active]:shadow-[inset_0_0_0_1px_var(--border)]"
    >
      <Icon className="size-4 shrink-0" strokeWidth={1.75} />
      {label}
    </Link>
  );
}

/** The same pages as tabs, for screens too narrow for the sidebar. */
function MobileTab({ to, label, exact }: NavItem) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      className="flex h-8 shrink-0 items-center rounded-lg px-3 text-[13px] text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-accent data-[status=active]:font-medium data-[status=active]:text-foreground"
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
          License &amp; billing
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
  const pathname = useLocation({ select: (l) => l.pathname.replace(/\/$/, "") });
  const page =
    NAV_ITEMS.find((item) => (item.exact ? pathname === item.to : pathname.startsWith(item.to)))
      ?.label ?? "Dashboard";

  return (
    <div className="flex min-h-svh bg-background text-foreground">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-border bg-muted/30 md:flex">
        <div className="flex h-14 items-center px-4">
          <Link to="/" className="flex items-center gap-2.5 text-foreground">
            <StrokeIcon className="size-5" />
            <span className="text-[14px] font-semibold tracking-[-0.01em]">Stroke</span>
          </Link>
        </div>

        <nav aria-label="Dashboard" className="flex flex-col gap-0.5 px-2.5 pt-2">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}
        </nav>

        <div className="mt-7 px-2.5">
          <p className="px-2.5 text-[11px] font-medium tracking-wide text-faint uppercase">
            Resources
          </p>
          <div className="mt-1.5 flex flex-col gap-0.5">
            {RESOURCES.map((r) => (
              <Link
                key={r.to}
                to={r.to}
                className="group flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
              >
                <r.icon className="size-4 shrink-0" strokeWidth={1.75} />
                {r.label}
                <ArrowUpRightIcon className="ml-auto size-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-auto p-2.5">
          <AccountMenu />
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur md:px-8">
          <Link to="/" className="flex items-center md:hidden" aria-label="Stroke home">
            <StrokeIcon className="size-5" />
          </Link>
          <div className="flex min-w-0 items-center gap-1.5 text-[13px] text-muted-foreground">
            <Link to="/" className="hidden transition-colors hover:text-foreground md:inline">
              stroke.click
            </Link>
            <span className="hidden text-faint md:inline">/</span>
            <span className="truncate font-medium text-foreground">{page}</span>
          </div>
          <div className="ml-auto md:hidden">
            <AccountMenu compact />
          </div>
        </header>

        <nav
          aria-label="Dashboard"
          className="flex [scrollbar-width:none] gap-1 overflow-x-auto border-b border-border px-3 py-2 md:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <MobileTab key={item.to} {...item} />
          ))}
        </nav>

        <main className="flex-1 px-4 py-8 sm:px-6 md:px-10 md:py-12">
          <div className="mx-auto w-full max-w-3xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
