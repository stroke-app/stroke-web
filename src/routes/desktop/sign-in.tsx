import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { CheckIcon, CopyIcon, Loader2Icon, MonitorIcon } from "lucide-react";
import posthog from "posthog-js";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { SITE, siteButton } from "#/components/page";
import { SignInSocialButton } from "#/components/sign-in-social-button";
import { StrokeIcon } from "#/components/stroke-icon";
import { authClient } from "#/lib/auth/auth-client";
import { authQueryOptions } from "#/lib/auth/queries";
import { $authorizeDesktop } from "#/lib/desktop/functions";
import {
  desktopCallbackUrl,
  desktopSignInParams,
  type DesktopSignInParams,
} from "#/lib/desktop/params";
import { noIndex } from "#/lib/seo";
import { cn } from "#/lib/utils";

/**
 * GET /desktop/sign-in: the browser half of desktop sign-in
 * (docs/accounts-and-sync.md, section 1 and Appendix A). The app opens this
 * page with its loopback port, state, PKCE challenge and device; once the user
 * confirms, the browser goes back to http://127.0.0.1:<port>/callback.
 *
 * The query is read from the raw request URL, not the router's parsed search:
 * that JSON-parses values, so an all-digit state or device id would come back
 * as a (rounded) number.
 */
const rawSearch = createIsomorphicFn()
  .server(() => new URL(getRequest().url).search)
  .client(() => window.location.search);

export const Route = createFileRoute("/desktop/sign-in")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData({
      ...authQueryOptions(),
      revalidateIfStale: true,
    });
    return { user, search: rawSearch() };
  },
  head: () => ({ meta: [{ title: "Sign in to Stroke" }, ...noIndex().meta] }),
  component: DesktopSignInPage,
});

// Better Auth sends a failed OAuth sign-in back here with &error=<code>.
const SIGN_IN_ERRORS: Record<string, string> = {
  account_not_linked:
    "This email already has a Stroke account, and the provider couldn't confirm it's yours. Sign in with the provider you used before.",
};

function DesktopSignInPage() {
  const { user, search } = Route.useRouteContext();
  const raw = Object.fromEntries(new URLSearchParams(search));
  const parsed = desktopSignInParams.safeParse(raw);

  return (
    <div className={cn(SITE, "relative isolate flex min-h-svh flex-col overflow-hidden")}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[56rem] -translate-x-1/2 -translate-y-[58%] bg-[radial-gradient(closest-side,rgb(255_255_255/0.055),transparent)]"
      />
      <main className="flex flex-1 items-center justify-center px-6 pt-16 pb-24">
        <div className="flex w-full max-w-[360px] flex-col items-center text-center">
          <StrokeIcon className="size-10" alt="" />
          {!parsed.success ? (
            <InvalidRequest />
          ) : user ? (
            <Confirm params={parsed.data} user={user} />
          ) : (
            <SignedOut params={parsed.data} error={raw.error} />
          )}
        </div>
      </main>
    </div>
  );
}

function InvalidRequest() {
  return (
    <>
      <h1 className="mt-7 text-[2.25rem]">Link not valid</h1>
      <p className="mt-2.5 text-[15px] leading-normal text-pretty text-muted-foreground">
        This sign-in link is incomplete or has been changed. Start again from the Stroke app: choose{" "}
        <span className="text-foreground">Sign in</span> and your browser opens a fresh link.
      </p>
    </>
  );
}

/** The page's own URL with only the validated query, for coming back after OAuth. */
function selfUrl(params: DesktopSignInParams) {
  const q = new URLSearchParams({
    port: String(params.port),
    state: params.state,
    code_challenge: params.code_challenge,
    device_id: params.device_id,
    device_name: params.device_name,
  });
  return `/desktop/sign-in?${q.toString()}`;
}

function DeviceChip({ name }: { name: string }) {
  return (
    <span className="mt-6 inline-flex max-w-full items-center gap-2 rounded-full bg-white/[0.05] px-3 py-1.5 text-[13px] text-soft shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]">
      <MonitorIcon className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <span className="truncate">{name}</span>
    </span>
  );
}

function SignedOut({ params, error }: { params: DesktopSignInParams; error?: string }) {
  const back = selfUrl(params);
  return (
    <>
      <h1 className="mt-7 text-[2.25rem]">Sign in to Stroke</h1>
      <p className="mt-2.5 text-[15px] leading-normal text-pretty text-muted-foreground">
        Sign in to continue in the Stroke app. Your license comes with your account.
      </p>
      <DeviceChip name={params.device_name} />

      {error && (
        <p
          role="alert"
          className="mt-6 w-full rounded-lg border border-destructive/25 bg-destructive/[0.07] px-3.5 py-2.5 text-left text-[13px] leading-relaxed text-pretty text-destructive"
        >
          {SIGN_IN_ERRORS[error] ?? "Sign-in didn't finish. Please try again."}
        </p>
      )}

      <div className={cn("flex w-full flex-col gap-2.5", error ? "mt-4" : "mt-8")}>
        <SignInSocialButton
          provider="github"
          callbackURL={back}
          errorCallbackURL={back}
          icon={<SiGithub className="size-4" />}
        />
        <SignInSocialButton
          provider="google"
          callbackURL={back}
          errorCallbackURL={back}
          icon={<SiGoogle className="size-4" />}
        />
      </div>

      <p className="mt-9 w-full border-t border-border pt-6 text-[12.5px] leading-relaxed text-pretty text-muted-foreground">
        By continuing, you agree to the{" "}
        <Link to="/terms" className="text-soft underline underline-offset-[3px]">
          Terms
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className="text-soft underline underline-offset-[3px]">
          Privacy Policy
        </Link>
        . New accounts are created automatically.
      </p>
    </>
  );
}

type Done = "continued" | "cancelled" | null;

/** How long a minted code stays redeemable (matches the server's CODE_TTL). */
const CODE_TTL_MS = 5 * 60_000;
type IssuedCode = { code: string; expiresAt: number };

/**
 * The last code minted for this sign-in, kept in sessionStorage so that
 * coming back from a failed 127.0.0.1 redirect (the browser's own error
 * page) still offers it. It is useless without the app's PKCE verifier.
 */
const issuedKey = (state: string) => `stroke-desktop-code:${state}`;

/** The stored code's JSON while it is still valid. A string, so it's a stable snapshot. */
function readIssued(state: string): string | null {
  try {
    const raw = sessionStorage.getItem(issuedKey(state));
    return raw && (JSON.parse(raw) as IssuedCode).expiresAt > Date.now() ? raw : null;
  } catch {
    return null;
  }
}

const noSubscribe = () => () => {};

function saveIssued(state: string, issued: IssuedCode) {
  try {
    sessionStorage.setItem(issuedKey(state), JSON.stringify(issued));
  } catch {
    // Storage blocked: the fallback still shows until the page goes away.
  }
}

function Confirm({
  params,
  user,
}: {
  params: DesktopSignInParams;
  user: { name: string; email: string; image?: string | null };
}) {
  const [done, setDone] = useState<Done>(null);
  const [issued, setIssued] = useState<IssuedCode | null>(null);
  const [showCode, setShowCode] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Back from a failed redirect: pick up where we left off, code in hand.
  const storedRaw = useSyncExternalStore(
    noSubscribe,
    () => readIssued(params.state),
    () => null,
  );
  const stored = useMemo(
    () => (storedRaw ? (JSON.parse(storedRaw) as IssuedCode) : null),
    [storedRaw],
  );

  const authorize = useMutation({
    mutationFn: (_mode: "redirect" | "code") => $authorizeDesktop({ data: params }),
    onSuccess: ({ url, code }, mode) => {
      const next = { code, expiresAt: Date.now() + CODE_TTL_MS };
      saveIssued(params.state, next);
      setIssued(next);
      setShowCode(mode === "code");
      if (mode === "redirect") window.location.assign(url);
    },
    onError: (err) => toast.error(err.message || "Couldn't sign in. Please try again."),
  });

  function cancel() {
    setDone("cancelled");
    window.location.assign(
      desktopCallbackUrl(params.port, { error: "cancelled", state: params.state }),
    );
  }

  async function switchAccount() {
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

  const code = issued ?? stored;
  if (code && done !== "cancelled") {
    return (
      <>
        <h1 className="mt-7 text-[2.25rem]">Back to Stroke</h1>
        <p className="mt-2.5 text-[15px] leading-normal text-pretty text-muted-foreground">
          {showCode || !issued
            ? "Copy this code, then choose Paste code in the Stroke app."
            : "You're signed in. Switch back to the Stroke app; you can close this tab."}
        </p>
        {showCode || !issued ? (
          <PasteCode issued={code} />
        ) : (
          <button
            type="button"
            onClick={() => setShowCode(true)}
            className="mt-7 text-[13px] text-muted-foreground underline-offset-[3px] transition-colors hover:text-foreground hover:underline"
          >
            Stroke didn't open? Copy a code instead
          </button>
        )}
      </>
    );
  }

  if (done === "cancelled") {
    return (
      <>
        <h1 className="mt-7 text-[2.25rem]">Sign-in cancelled</h1>
        <p className="mt-2.5 text-[15px] leading-normal text-pretty text-muted-foreground">
          Nothing was shared with the app. You can close this tab.
        </p>
      </>
    );
  }

  const busy = authorize.isPending;
  return (
    <>
      <h1 className="mt-7 text-[2rem] leading-tight text-balance">
        Sign in to Stroke on {params.device_name}?
      </h1>
      <p className="mt-2.5 text-[15px] leading-normal text-pretty text-muted-foreground">
        The app gets access to your account and license. Only continue if you started this sign-in
        from Stroke.
      </p>

      <div className="mt-7 flex w-full items-center gap-3 rounded-xl bg-white/[0.03] px-3.5 py-3 text-left shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]">
        {user.image ? (
          <img src={user.image} alt="" className="size-8 shrink-0 rounded-full" />
        ) : (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[13px] font-semibold text-muted-foreground">
            {user.name?.[0]?.toUpperCase() ?? "?"}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-[14px] font-medium">{user.name}</span>
          <span className="block truncate text-[13px] text-muted-foreground">{user.email}</span>
        </span>
      </div>

      <div className="mt-6 flex w-full flex-col gap-2.5">
        <button
          type="button"
          disabled={busy}
          aria-busy={busy}
          onClick={() => authorize.mutate("redirect")}
          className={cn(siteButton({ variant: "primary", size: "lg" }), "w-full text-sm")}
        >
          {busy && <Loader2Icon className="size-4 animate-spin" />}
          Continue
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={cancel}
          className={cn(siteButton({ variant: "secondary", size: "lg" }), "w-full text-sm")}
        >
          Cancel
        </button>
      </div>

      <button
        type="button"
        onClick={() => authorize.mutate("code")}
        disabled={busy}
        className="mt-6 text-[13px] text-muted-foreground underline-offset-[3px] transition-colors hover:text-foreground hover:underline"
      >
        Having trouble? Sign in with a code
      </button>
      <button
        type="button"
        onClick={switchAccount}
        disabled={busy}
        className="mt-2 text-[13px] text-muted-foreground underline-offset-[3px] transition-colors hover:text-foreground hover:underline"
      >
        Not you? Use a different account
      </button>
    </>
  );
}

/** The paste-a-code fallback: `stroke-code:<code>`, one use, five minutes. */
function PasteCode({ issued }: { issued: IssuedCode }) {
  const text = `stroke-code:${issued.code}`;
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const left = Math.max(0, issued.expiresAt - now);
  const expired = left === 0;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Code copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Select the code and copy it instead.");
    }
  }

  const minutes = Math.floor(left / 60_000);
  const seconds = String(Math.floor((left % 60_000) / 1000)).padStart(2, "0");

  return (
    <div className="mt-7 w-full text-left">
      <div className="flex items-start gap-1 rounded-xl bg-white/[0.03] p-1 pl-3.5 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]">
        <code
          className={cn(
            "min-w-0 flex-1 py-2 font-mono text-[12.5px] break-all select-all",
            expired ? "text-muted-foreground line-through" : "text-soft",
          )}
        >
          {text}
        </code>
        <button
          type="button"
          onClick={copy}
          disabled={expired}
          className={cn(siteButton({ variant: "secondary", size: "sm" }), "shrink-0 text-[13px]")}
        >
          {copied ? (
            <CheckIcon className="size-3.5" aria-hidden="true" />
          ) : (
            <CopyIcon className="size-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <p
        className="mt-2.5 text-[12.5px] leading-relaxed text-pretty text-muted-foreground"
        aria-live="polite"
      >
        {expired
          ? "This code has expired. Start sign-in again from the Stroke app."
          : `Works once, for ${minutes}:${seconds} more. Only the Stroke app that opened this page can use it.`}
      </p>
    </div>
  );
}
