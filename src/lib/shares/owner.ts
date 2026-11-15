import "@tanstack/react-start/server-only";
import { auth } from "#/lib/auth/auth";
import { authenticateDesktop } from "#/lib/desktop/service";

/** The signed-in user behind a request: the app's bearer token, or a web session. */
export async function shareOwner(request: Request): Promise<string | null> {
  const desktop = await authenticateDesktop(request);
  if (desktop) return desktop.user.id;
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null);
  return session?.user.id ?? null;
}

export function signInRequired() {
  return Response.json(
    { error: { code: "unauthorized", message: "Sign in to Stroke to share." } },
    { status: 401 },
  );
}
