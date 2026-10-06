import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import * as z from "zod";

import { SITE } from "#/components/page";
import { SignInSocialButton } from "#/components/sign-in-social-button";
import { StrokeIcon } from "#/components/stroke-icon";
import { cn } from "#/lib/utils";

// Better Auth sends a failed OAuth sign-in back here as ?error=<code>.
const SIGN_IN_ERRORS: Record<string, string> = {
  account_not_linked:
    "This email already has a Stroke account, and the provider couldn't confirm it's yours. Sign in with the provider you used before, or verify the email with that provider first.",
};

export const Route = createFileRoute("/_guest/login")({
  validateSearch: z.object({ error: z.string().optional() }),
  head: () => ({ meta: [{ title: "Sign in · Stroke" }] }),
  component: AuthPage,
});

const LEGAL_LINK =
  "whitespace-nowrap text-soft underline decoration-white/20 underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-white/50";

function AuthPage() {
  const { redirectUrl } = Route.useRouteContext();
  const { error } = Route.useSearch();

  return (
    <div className={cn(SITE, "relative isolate flex min-h-svh flex-col overflow-hidden")}>
      {/* A soft light behind the column, the page's only decoration. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[56rem] -translate-x-1/2 -translate-y-[58%] bg-[radial-gradient(closest-side,rgb(255_255_255/0.055),transparent)]"
      />

      <header className="px-6 pt-6 md:px-8">
        <Link
          to="/"
          className="group inline-flex h-8 items-center gap-1.5 rounded-md text-[13px] text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeftIcon className="size-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
          Back to stroke.click
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pt-10 pb-24">
        <div className="flex w-full max-w-[360px] flex-col items-center text-center">
          <Link
            to="/"
            aria-label="Stroke home"
            className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <StrokeIcon className="size-10" alt="" />
          </Link>

          <h1 className="mt-7 text-[2.25rem]">Sign in to Stroke</h1>
          <p className="mt-2.5 text-[15px] leading-normal text-muted-foreground">
            Use the account you'll keep your license on.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-7 w-full rounded-lg border border-destructive/25 bg-destructive/[0.07] px-3.5 py-2.5 text-left text-[13px] leading-relaxed text-pretty text-destructive"
            >
              {SIGN_IN_ERRORS[error] ?? "Sign-in didn't finish. Please try again."}
            </p>
          )}

          <div className={cn("flex w-full flex-col gap-2.5", error ? "mt-4" : "mt-9")}>
            <SignInSocialButton
              provider="github"
              callbackURL={redirectUrl}
              errorCallbackURL="/login"
              icon={<SiGithub className="size-4" />}
            />
            <SignInSocialButton
              provider="google"
              callbackURL={redirectUrl}
              errorCallbackURL="/login"
              icon={<SiGoogle className="size-4" />}
            />
          </div>

          <p className="mt-9 w-full border-t border-border pt-6 text-[12.5px] leading-relaxed text-pretty text-muted-foreground">
            By continuing, you agree to the{" "}
            <Link to="/terms" className={LEGAL_LINK}>
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className={LEGAL_LINK}>
              Privacy Policy
            </Link>
            . New accounts are created automatically.
          </p>
        </div>
      </main>
    </div>
  );
}
