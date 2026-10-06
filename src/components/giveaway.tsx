import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckIcon, GiftIcon } from "lucide-react";
import { useSyncExternalStore } from "react";
import { toast } from "sonner";

import { Eyebrow, siteButton } from "#/components/page";
import { $enterGiveaway, giveawayQueryOptions } from "#/lib/giveaway/functions";
import { cn } from "#/lib/utils";

const DRAW_DATE = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const TICK_MS = 30_000;

function subscribeClock(onTick: () => void) {
  const id = setInterval(onTick, TICK_MS);
  return () => clearInterval(id);
}

/**
 * Minutes left until `iso`, ticking every 30 seconds. The clock reads null on
 * the server, so SSR and the first client render agree and nothing flashes.
 * The snapshot is rounded to the tick so it stays stable between ticks.
 */
function useCountdown(iso: string | undefined) {
  const now = useSyncExternalStore(
    subscribeClock,
    () => Math.floor(Date.now() / TICK_MS) * TICK_MS,
    () => null,
  );
  if (!iso || now === null) return null;
  const minutes = Math.max(0, Math.floor((Date.parse(iso) - now) / 60_000));
  return {
    days: Math.floor(minutes / 1440),
    hours: Math.floor(minutes / 60) % 24,
    minutes: minutes % 60,
  };
}

function Countdown({ iso }: { iso: string | undefined }) {
  const left = useCountdown(iso);
  const units = [
    { label: "days", value: left?.days },
    { label: "hours", value: left?.hours },
    { label: "min", value: left?.minutes },
  ];
  return (
    <div
      className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-background/60"
      aria-live="off"
    >
      {units.map((u) => (
        <div key={u.label} className="px-3 py-4 text-center">
          <p className="text-[2.5rem] leading-none font-semibold tracking-[-0.04em] tabular-nums">
            {u.value === undefined ? "--" : String(u.value).padStart(2, "0")}
          </p>
          <p className="mt-2 text-[12px] text-muted-foreground">{u.label}</p>
        </div>
      ))}
    </div>
  );
}

const STATUS = "flex h-11 w-full items-center justify-center gap-2 rounded-lg border text-sm";

function EnterButton() {
  const queryClient = useQueryClient();
  const { data } = useQuery(giveawayQueryOptions());
  const enter = useMutation({
    mutationFn: () => $enterGiveaway(),
    onSuccess: (result) => {
      if (result.entered) toast.success("You're in. Good luck on Monday.");
      void queryClient.invalidateQueries({ queryKey: ["giveaway"] });
    },
    onError: () => toast.error("Couldn't enter you right now. Try again in a moment."),
  });

  const wide = cn(siteButton({ size: "lg" }), "w-full");
  const status = (text: string) => (
    <p className={cn(STATUS, "border-border text-muted-foreground")}>{text}</p>
  );

  if (!data) {
    return (
      <span className="block h-11 w-full animate-pulse rounded-lg bg-white/[0.05] motion-reduce:animate-none" />
    );
  }
  if (!data.signedIn) {
    return (
      <Link to="/login" className={wide}>
        Sign in to enter
      </Link>
    );
  }
  if (data.status === "owns-license") return status("You already own Stroke");
  if (data.status === "unverified") return status("Verify your email to enter");
  if (data.entered) {
    return (
      <p className={cn(STATUS, "border-copper/25 bg-copper/[0.07] font-medium text-copper")}>
        <CheckIcon className="size-4" strokeWidth={2.5} />
        You're in this week
      </p>
    );
  }
  return (
    <button
      type="button"
      onClick={() => enter.mutate()}
      disabled={enter.isPending}
      className={wide}
    >
      <GiftIcon className="size-4" strokeWidth={1.75} />
      {enter.isPending ? "Entering" : "Enter this week's draw"}
    </button>
  );
}

/** The weekly free-license giveaway: countdown, entry count, last winner, and the enter button. */
export function GiveawayCard({
  showRulesLink = true,
  headingAs: Heading = "h3",
}: {
  showRulesLink?: boolean;
  /** Heading level for the card's title, to fit the page outline it sits in. */
  headingAs?: "h2" | "h3";
}) {
  const { data } = useQuery(giveawayQueryOptions());

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="flex flex-col p-7 sm:p-10">
        <Eyebrow>Weekly giveaway</Eyebrow>
        <Heading className="mt-5 text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.03em] text-balance sm:text-[2rem]">
          Or win it. One free license, every week.
        </Heading>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-pretty text-soft">
          Enter once a week with your Stroke account. Every Monday one entrant is drawn at random
          and gets a lifetime license by email, the same one $9.99 buys.
        </p>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground lg:mt-auto lg:pt-10">
          <li>
            <span className="font-medium text-foreground tabular-nums">
              {data?.entries ?? "--"}
            </span>{" "}
            entered this week
          </li>
          {data?.lastWinner && (
            <li>
              Last winner:{" "}
              <span className="font-medium text-foreground">{data.lastWinner.name}</span>
            </li>
          )}
          {showRulesLink && (
            <li>
              <Link
                to="/giveaway"
                className="underline decoration-white/20 underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-white/50"
              >
                How it works
              </Link>
            </li>
          )}
        </ul>
      </div>

      <div className="border-t border-border bg-white/[0.012] p-7 sm:p-10 lg:border-t-0 lg:border-l">
        <p className="mb-3 text-[13px] text-muted-foreground">Next draw in</p>
        <Countdown iso={data?.drawAt} />
        <div className="mt-4">
          <EnterButton />
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
          {data
            ? `Drawn ${DRAW_DATE.format(new Date(data.drawAt))}, 00:00 UTC. One entry per account.`
            : "One entry per account, drawn every Monday."}
        </p>
      </div>
    </div>
  );
}
