import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckIcon, GiftIcon } from "lucide-react";
import { useSyncExternalStore } from "react";
import { toast } from "sonner";

import { Eyebrow } from "#/components/page";
import { buttonVariants } from "#/components/ui/button";
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
    <div className="grid grid-cols-3 gap-2" aria-live="off">
      {units.map((u) => (
        <div
          key={u.label}
          className="rounded-2xl border border-border bg-background px-3 py-3 text-center"
        >
          <p className="text-3xl font-medium tracking-[-0.03em] tabular-nums">
            {u.value === undefined ? "--" : String(u.value).padStart(2, "0")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{u.label}</p>
        </div>
      ))}
    </div>
  );
}

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

  const wide = cn(buttonVariants({ variant: "default", size: "lg" }), "w-full");
  const status = (text: string) => (
    <p className="flex h-10 w-full items-center justify-center gap-2 rounded-2xl border border-border text-sm text-muted-foreground">
      {text}
    </p>
  );

  if (!data) return <span className="block h-10 w-full animate-pulse rounded-2xl bg-muted" />;
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
      <p className="flex h-10 w-full items-center justify-center gap-2 rounded-2xl border border-copper/30 bg-copper/10 text-sm font-medium text-copper">
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
export function GiveawayCard({ showRulesLink = true }: { showRulesLink?: boolean }) {
  const { data } = useQuery(giveawayQueryOptions());

  return (
    <div className="spotlight grid grid-cols-1 items-center gap-10 rounded-3xl border border-border bg-card p-7 [--spot-x:30%] sm:p-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
      <div>
        <Eyebrow>Weekly giveaway</Eyebrow>
        <h3 className="mt-3 text-2xl leading-[1.15] font-medium tracking-[-0.03em] text-balance sm:text-3xl">
          Or win it. One free license, every week.
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
          Enter once a week with your Stroke account. Every Monday one entrant is drawn at random
          and gets a lifetime license by email, the same one $9.99 buys.
        </p>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
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
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                How it works
              </Link>
            </li>
          )}
        </ul>
      </div>

      <div>
        <p className="mb-3 text-xs font-medium text-muted-foreground">Next draw in</p>
        <Countdown iso={data?.drawAt} />
        <div className="mt-4">
          <EnterButton />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {data
            ? `Drawn ${DRAW_DATE.format(new Date(data.drawAt))}, 00:00 UTC. One entry per account.`
            : "One entry per account, drawn every Monday."}
        </p>
      </div>
    </div>
  );
}
