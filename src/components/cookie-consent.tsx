import { Link } from "@tanstack/react-router";
import posthog from "posthog-js";

import { siteButton } from "#/components/page";
import { setConsent, useShowConsentBanner } from "#/lib/consent";

/**
 * Opt-in analytics consent banner. PostHog is initialized opted-out by default
 * (see posthog-provider.tsx); nothing is captured and no analytics cookie is
 * set until the visitor accepts here.
 *
 * A quiet toast in the marketing site's dark palette (`site`), on every page.
 */
export function CookieConsent() {
  const show = useShowConsentBanner();
  if (!show) return null;

  function accept() {
    setConsent("accepted");
    posthog.opt_in_capturing();
    // Record the pageview we skipped while awaiting consent.
    posthog.capture("$pageview", { $current_url: window.location.href });
  }

  function decline() {
    setConsent("declined");
    posthog.opt_out_capturing();
  }

  return (
    <section
      aria-label="Cookie consent"
      className="site dark fixed inset-x-4 bottom-4 z-50 mx-auto max-w-[22rem] animate-in overflow-hidden rounded-xl border border-white/10 shadow-[0_1px_0_0_rgb(255_255_255/0.06)_inset,0_20px_48px_-12px_rgb(0_0_0/0.7)] duration-300 fade-in slide-in-from-bottom-2 motion-reduce:animate-none sm:inset-x-auto sm:right-5 sm:bottom-5"
    >
      <div className="bg-raised p-4">
        <p className="text-[13px] font-medium">Analytics cookies</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-pretty text-muted-foreground">
          We'd like to use privacy-friendly analytics to see which pages are useful. No ads, no data
          selling. The site works fully either way. See our{" "}
          <Link
            to="/privacy"
            className="text-soft underline decoration-white/20 underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-white/50"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <div className="mt-4 flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={decline}
            className={siteButton({ variant: "ghost", size: "sm" })}
          >
            Decline
          </button>
          <button type="button" onClick={accept} className={siteButton({ size: "sm" })}>
            Accept
          </button>
        </div>
      </div>
    </section>
  );
}
