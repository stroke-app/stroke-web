import { a11yDevtoolsPlugin } from "@tanstack/devtools-a11y/react";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { PostHogProvider } from "#/components/posthog-provider";
import { TAGLINE } from "#/components/site-chrome";
import { ThemeProvider } from "#/components/theme-provider";
import { Toaster } from "#/components/ui/sonner";
import { authQueryOptions, type AuthQueryResult } from "#/lib/auth/queries";
import { latestReleaseQueryOptions } from "#/lib/latest-release";
import { platformQueryOptions } from "#/lib/platform-hint";
import { seo } from "#/lib/seo";

import appCss from "#/styles.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
  user: AuthQueryResult;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  // Whatever the header and the download buttons show is known before the
  // first render, so the server's HTML is already right: "Dashboard" for a
  // signed-in visitor (not "Sign in" that changes after load), and the build
  // for this computer with its version. None of them fail the page: a miss
  // just renders the neutral state.
  beforeLoad: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(authQueryOptions()).catch(() => null),
      context.queryClient.ensureQueryData(platformQueryOptions()).catch(() => null),
      context.queryClient.ensureQueryData(latestReleaseQueryOptions()).catch(() => null),
    ]);
  },
  head: () => {
    // Default social/meta tags; every public route overrides them via seo().
    // Canonical links are per-route only, so they aren't emitted here.
    const base = seo({
      title: "Stroke · Native database client for Mac, Windows & Linux",
      description: `${TAGLINE} Works with PostgreSQL, MySQL, SQLite, SQL Server, ClickHouse, DuckDB, and more.`,
      path: "/",
    });
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        // Browser chrome matches the site in either theme.
        { name: "theme-color", content: "#08090a", media: "(prefers-color-scheme: dark)" },
        { name: "theme-color", content: "#fbfbfa", media: "(prefers-color-scheme: light)" },
        ...base.meta,
      ],
      links: [
        // Google's result favicon needs a square that's a multiple of 48px.
        { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
        { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96.png" },
        { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "stylesheet", href: appCss },
      ],
    };
  },
  shellComponent: RootDocument,
});

function RootDocument({ children }: { readonly children: React.ReactNode }) {
  return (
    // suppress since we're updating the "dark" class in ThemeProvider
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <PostHogProvider>
            {children}
            <Toaster richColors />
          </PostHogProvider>
        </ThemeProvider>

        <TanStackDevtools
          plugins={[
            {
              name: "TanStack Query",
              render: <ReactQueryDevtoolsPanel />,
            },
            {
              name: "TanStack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            a11yDevtoolsPlugin(),
          ]}
        />

        <Scripts />
      </body>
    </html>
  );
}
