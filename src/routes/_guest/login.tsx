import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeftIcon, CheckIcon } from "lucide-react";
import * as z from "zod";

import { SITE } from "#/components/page";
import { SignInSocialButton } from "#/components/sign-in-social-button";
import { StrokeIcon } from "#/components/stroke-icon";
import { PRO_PRICE, TRIAL_DAYS } from "#/lib/pricing";
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
  "text-soft underline decoration-ink/20 underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-ink/50";

const PERKS = [
  `${TRIAL_DAYS} days of every feature, free`,
  `Then ${PRO_PRICE} once, no subscription`,
  "Your plan follows you to every computer",
  "Bought a key before? Sign in with that email",
];

function AuthPage() {
  const { redirectUrl } = Route.useRouteContext();
  const { error } = Route.useSearch();

  return (
    <div className={cn(SITE, "grid min-h-svh grid-cols-1 lg:grid-cols-2")}>
      {/* Left: the form, nothing else competing with it. */}
      <div className="flex min-h-svh flex-col px-6 py-6 md:px-10">
        <header className="flex items-center justify-between">
          <Link
            to="/"
            aria-label="Stroke home"
            className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <StrokeIcon className="size-[22px]" alt="" />
            <span className="text-[16px] font-semibold tracking-[-0.02em]">Stroke</span>
          </Link>
          <Link
            to="/"
            className="group inline-flex h-8 items-center gap-1.5 rounded-md text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
            Back to site
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center py-16">
          <div className="w-full max-w-[380px]">
            <h1 className="text-[1.75rem] tracking-[-0.03em]">Sign in</h1>
            <p className="mt-2 text-[15px] leading-normal text-muted-foreground">
              New here? The same buttons create your account.
            </p>

            {error && (
              <p
                role="alert"
                className="mt-6 rounded-lg bg-destructive/[0.08] px-3.5 py-2.5 text-[13px] leading-relaxed text-pretty text-destructive shadow-[0_0_0_1px_color-mix(in_srgb,var(--destructive)_25%,transparent)_inset]"
              >
                {SIGN_IN_ERRORS[error] ?? "Sign-in didn't finish. Try again."}
              </p>
            )}

            <div className={cn("flex flex-col gap-2.5", error ? "mt-4" : "mt-8")}>
              <SignInSocialButton
                provider="google"
                callbackURL={redirectUrl}
                errorCallbackURL="/login"
                icon={<SiGoogle className="size-4" />}
              />
              <SignInSocialButton
                provider="github"
                callbackURL={redirectUrl}
                errorCallbackURL="/login"
                icon={<SiGithub className="size-4" />}
              />
            </div>

            <p className="mt-8 text-[13px] leading-relaxed text-pretty text-muted-foreground">
              By continuing, you agree to the{" "}
              <Link to="/terms" className={LEGAL_LINK}>
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className={LEGAL_LINK}>
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </main>
      </div>

      {/* Right: what the account is for, beside a real screen. */}
      <aside className="relative hidden overflow-hidden border-l border-border bg-card lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div
          aria-hidden="true"
          className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_70%_30%,black,transparent)]"
        />
        <div className="relative max-w-md">
          <p className="text-[22px] leading-[1.35] font-medium tracking-[-0.02em] text-balance">
            Every database you run, in one fast app.{" "}
            <span className="text-muted-foreground">
              Your account keeps your plan and your synced connections.
            </span>
          </p>
          <ul className="mt-8 space-y-3 text-[14px] text-soft">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <CheckIcon className="size-4 shrink-0 text-muted-foreground" strokeWidth={2} />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="keep-dark dark relative mt-12 -mr-14 -mb-14 overflow-hidden rounded-tl-xl shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_30px_80px_-20px_rgb(0_0_0/0.7)]">
          <img
            src="/shots/table.webp"
            alt=""
            width={1600}
            height={1005}
            className="block h-auto w-[140%] max-w-none"
          />
        </div>
      </aside>
    </div>
  );
}
