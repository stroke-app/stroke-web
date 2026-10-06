import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { StarIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { siteButton } from "#/components/page";
import { licenseQueryOptions } from "#/lib/billing/functions";
import { $submitReview, myReviewQueryOptions } from "#/lib/reviews/functions";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/_auth/app/reviews")({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(licenseQueryOptions());
    context.queryClient.prefetchQuery(myReviewQueryOptions());
  },
  component: ReviewsPage,
});

const MAX_BODY = 1000;
const MAX_TITLE = 80;

const STATUS_META = {
  pending: {
    label: "In review",
    dot: "bg-[#f2c94c]",
    note: "Thanks. Your review is waiting for approval before it shows on the site.",
  },
  approved: {
    label: "Published",
    dot: "bg-[#4cb782]",
    note: "Your review is live on stroke.click. Editing it sends it back for review.",
  },
  rejected: {
    label: "Not approved",
    dot: "bg-white/40",
    note: "This review wasn't approved. You can edit it and submit it again.",
  },
} as const;

const FIELD =
  "w-full rounded-lg border border-border bg-white/[0.03] px-3.5 text-[15px] text-foreground transition-colors outline-none placeholder:text-faint hover:border-white/15 focus-visible:border-white/30 focus-visible:bg-white/[0.04]";

function PageHeader({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <header>
      <h1 className="text-[1.75rem] leading-tight md:text-[2rem]">{title}</h1>
      <p className="mt-2 text-[15px] text-pretty text-muted-foreground">{children}</p>
    </header>
  );
}

function ReviewsPage() {
  const queryClient = useQueryClient();
  const { data: license, isPending: licensePending } = useQuery(licenseQueryOptions());
  const { data: myReview } = useQuery(myReviewQueryOptions());

  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  // Seed the form from an existing review the first time it arrives. Done during
  // render (not in an effect) per React's "adjust state when a prop changes"
  // pattern; `seededFor` tracks the review identity so we don't clobber edits.
  const [seededFor, setSeededFor] = useState<string | null | undefined>(undefined);
  if (myReview !== undefined && seededFor !== (myReview?.id ?? null)) {
    setSeededFor(myReview?.id ?? null);
    setBody(myReview?.body ?? "");
    setTitle(myReview?.title ?? "");
  }

  const submit = useMutation({
    mutationFn: (input: { body: string; title?: string }) => $submitReview({ data: input }),
    onSuccess: async () => {
      toast.success("Review submitted. It'll show on the site once approved.");
      await queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Couldn't submit your review.");
    },
  });

  function doSubmit() {
    const trimmed = body.trim();
    if (trimmed.length < 10) {
      toast.error("Please write at least a sentence.");
      return;
    }
    submit.mutate({ body: trimmed, title: title.trim() || undefined });
  }

  // ── Not licensed ──────────────────────────────────────────────────────────
  if (!licensePending && !license) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Reviews">
          The reviews on stroke.click are written by people who own Stroke.
        </PageHeader>

        <section className="mt-10 rounded-xl border border-border bg-card p-6 sm:p-8">
          <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-background">
            <StarIcon className="size-[18px] text-muted-foreground" strokeWidth={1.75} />
          </span>
          <h2 className="mt-5 text-[1.25rem] leading-snug">Write a review once you own Stroke</h2>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-pretty text-muted-foreground">
            Only license holders can leave a review, so what people read on the site comes from real
            customers. After you buy, come back here to share what you think. Approved reviews may
            appear on stroke.click.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link to="/app/billing" className={siteButton()}>
              Get a license · $9.99
            </Link>
            <Link to="/app/downloads" className={siteButton({ variant: "secondary" })}>
              Try Stroke free
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const status = myReview?.status;
  const meta = status ? STATUS_META[status] : null;
  const remaining = MAX_BODY - body.length;

  // ── Licensed: write / edit ──────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={myReview ? "Your review" : "Write a review"}>
        Tell other people how Stroke works for you. Approved reviews appear on stroke.click with
        your name.
      </PageHeader>

      {meta && (
        <div className="mt-8 flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3.5">
          <span
            aria-hidden="true"
            className={cn("mt-[7px] size-2 shrink-0 rounded-full", meta.dot)}
          />
          <div>
            <p className="text-[14px] font-[510]">{meta.label}</p>
            <p className="mt-0.5 text-[14px] text-muted-foreground">{meta.note}</p>
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          doSubmit();
        }}
        className="mt-8 space-y-6 rounded-xl border border-border bg-card p-6 sm:p-7"
      >
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label id="review-body-label" htmlFor="review-body" className="text-[14px] font-[510]">
              Your review
            </label>
            <span
              className={cn(
                "text-[12px] tabular-nums",
                remaining < 100 ? "text-soft" : "text-faint",
              )}
            >
              {remaining} characters left
            </span>
          </div>
          <textarea
            id="review-body"
            aria-labelledby="review-body-label"
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY))}
            placeholder="What do you use Stroke for, and what made it stick?"
            required
            rows={6}
            className={cn(FIELD, "mt-2 min-h-40 resize-y py-3 leading-relaxed")}
          />
        </div>

        <div>
          <label id="review-title-label" htmlFor="review-title" className="text-[14px] font-[510]">
            Byline <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="review-title"
            aria-labelledby="review-title-label"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
            placeholder="Backend engineer at Acme"
            className={cn(FIELD, "mt-2 h-11")}
          />
          <p className="mt-2 text-[13px] text-muted-foreground">
            Shown under your name. Leave it blank to show just your name.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <button type="submit" disabled={submit.isPending} className={siteButton()}>
            {submit.isPending ? "Submitting…" : myReview ? "Update review" : "Submit review"}
          </button>
          <p className="text-[13px] text-muted-foreground">
            We read every review before it goes live.
          </p>
        </div>
      </form>
    </div>
  );
}
