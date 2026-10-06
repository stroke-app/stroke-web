import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useMatchRoute, useRouter } from "@tanstack/react-router";
import {
  ArrowUpRightIcon,
  BookOpenIcon,
  DownloadIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SparklesIcon,
  StarIcon,
} from "lucide-react";

import { SITE } from "#/components/page";
import { StrokeIcon } from "#/components/stroke-icon";
import { authClient } from "#/lib/auth/auth-client";
import { useAuth } from "#/lib/auth/hooks";
import { authQueryOptions } from "#/lib/auth/queries";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/_auth/app")({
  component: AppLayout,
});

const NAV_ITEMS = [
  { to: "/app" as const, label: "Dashboard", icon: LayoutDashboardIcon, exact: true },
  { to: "/app/downloads" as const, label: "Downloads", icon: DownloadIcon, exact: false },
  { to: "/app/reviews" as const, label: "Reviews", icon: StarIcon, exact: false },
  { to: "/app/support" as const, label: "Support", icon: HelpCircleIcon, exact: false },
];

const RESOURCES = [
  { to: "/docs" as const, label: "Docs", icon: BookOpenIcon },
  { to: "/changelog" as const, label: "What's new", icon: SparklesIcon },
];

function useIsActive(to: (typeof NAV_ITEMS)[number]["to"], exact: boolean) {
  const matchRoute = useMatchRoute();
  return !!matchRoute({ to, fuzzy: !exact });
}

function NavLink({
  to,
  label,
  icon: Icon,
  exact,
}: {
  to: (typeof NAV_ITEMS)[number]["to"];
  label: string;
  icon: React.ElementType;
  exact: boolean;
}) {
  const active = useIsActive(to, exact);
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors",
        active
          ? "bg-white/[0.07] font-medium text-foreground"
          : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" strokeWidth={1.75} />
      {label}
    </Link>
  );
}

/** The same pages as tabs, for screens too narrow for the sidebar. */
function MobileTab({ to, label, exact }: (typeof NAV_ITEMS)[number]) {
  const active = useIsActive(to, exact);
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-3 text-[13px] transition-colors",
        active ? "bg-white/[0.07] text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function SignOutButton() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Sign out"
      title="Sign out"
      onClick={async () => {
        await authClient.signOut({
          fetchOptions: {
            onResponse: async () => {
              queryClient.setQueryData(authQueryOptions().queryKey, null);
              await router.invalidate();
            },
          },
        });
      }}
      className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
    >
      <LogOutIcon className="size-4" strokeWidth={1.75} />
    </button>
  );
}

function AppLayout() {
  const { user } = useAuth();
  const matchRoute = useMatchRoute();
  const initial = user?.name?.[0]?.toUpperCase() ?? "?";
  const page =
    NAV_ITEMS.find((item) => matchRoute({ to: item.to, fuzzy: !item.exact }))?.label ?? "Billing";

  return (
    <div className={cn(SITE, "flex min-h-svh")}>
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-border bg-[#0b0c0d] md:flex">
        <div className="flex h-14 items-center px-4">
          <Link to="/" className="flex items-center gap-2.5 text-foreground">
            <StrokeIcon className="size-5" />
            <span className="text-[14px] font-semibold tracking-[-0.01em]">Stroke</span>
          </Link>
        </div>

        <nav aria-label="Dashboard" className="flex flex-col gap-px px-2.5 pt-2">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}
        </nav>

        <div className="mt-8 px-2.5">
          <p className="px-2.5 text-[11px] font-medium text-faint">Resources</p>
          <div className="mt-1.5 flex flex-col gap-px">
            {RESOURCES.map((r) => (
              <Link
                key={r.to}
                to={r.to}
                className="group flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
              >
                <r.icon className="size-4 shrink-0" strokeWidth={1.75} />
                {r.label}
                <ArrowUpRightIcon className="ml-auto size-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-auto border-t border-border p-2.5">
          <div className="flex items-center gap-2.5 rounded-md py-1.5 pr-1 pl-2">
            {user?.image ? (
              <img
                src={user.image}
                alt=""
                className="size-7 shrink-0 rounded-full ring-1 ring-border"
              />
            ) : (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[11px] font-semibold text-muted-foreground ring-1 ring-border">
                {initial}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] leading-tight font-medium">{user?.name}</p>
              <p
                className="mt-0.5 truncate text-[12px] leading-tight text-muted-foreground"
                title={user?.email}
              >
                {user?.email}
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-5 md:px-8">
          <Link to="/" className="flex items-center gap-2 md:hidden" aria-label="Stroke home">
            <StrokeIcon className="size-5" />
          </Link>
          <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Link to="/" className="hidden transition-colors hover:text-foreground md:inline">
              stroke.click
            </Link>
            <span className="hidden text-faint md:inline">/</span>
            <span className="text-foreground">{page}</span>
          </div>
          <div className="ml-auto flex items-center gap-1 md:hidden">
            <SignOutButton />
          </div>
        </header>

        <nav
          aria-label="Dashboard"
          className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2 md:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <MobileTab key={item.to} {...item} />
          ))}
        </nav>

        <main className="flex-1 px-5 py-10 md:px-10 md:py-14">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
