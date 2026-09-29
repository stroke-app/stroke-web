import {
  ErrorComponent,
  type ErrorComponentProps,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { Button } from "./ui/button";

/**
 * A code chunk that no longer exists: the tab was opened before a deploy (or a
 * dev-server restart) and is now asking for a file under an old hash. The only
 * fix is a fresh page, so reload once instead of showing an error screen.
 */
const STALE_CHUNK =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;
const RELOAD_KEY = "stroke:stale-chunk-reload";

function reloadOnceForStaleChunk(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  if (!STALE_CHUNK.test(message)) return false;
  try {
    // Guard against a reload loop if the chunk is missing even after a reload.
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < 10_000) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // Storage unavailable (private mode): still worth one reload.
  }
  window.location.reload();
  return true;
}

export function DefaultCatchBoundary({ error }: Readonly<ErrorComponentProps>) {
  const router = useRouter();

  useEffect(() => {
    reloadOnceForStaleChunk(error);
  }, [error]);
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  console.error(error);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
      <ErrorComponent error={error} />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={() => {
            router.invalidate();
          }}
        >
          Try Again
        </Button>
        {isRoot ? (
          <Button render={<Link to="/" />} variant="secondary" nativeButton={false}>
            Home
          </Button>
        ) : (
          <Button
            render={
              <Link
                to="/"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.back();
                }}
              />
            }
            variant="secondary"
            nativeButton={false}
          >
            Go Back
          </Button>
        )}
      </div>
    </div>
  );
}
