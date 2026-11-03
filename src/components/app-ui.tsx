/**
 * The signed-in app's building blocks. Everything here is drawn from theme
 * tokens (no hard-coded white or black), so each piece follows the light and
 * dark themes picked in the account menu.
 */
import { cn } from "#/lib/utils";

export function appButton({
  variant = "primary",
  size = "md",
}: {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-[background-color,color,box-shadow,scale] duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/60 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
    size === "sm" && "h-8 px-3 text-[13px]",
    size === "md" && "h-9 px-3.5 text-[13px]",
    size === "lg" && "h-10 px-4 text-[14px]",
    variant === "primary" && "bg-primary text-primary-foreground shadow-xs hover:bg-primary/88",
    variant === "secondary" &&
      "border border-border bg-background text-foreground shadow-xs hover:bg-accent",
    variant === "ghost" && "text-muted-foreground hover:bg-accent hover:text-foreground",
    variant === "danger" && "bg-destructive/10 text-destructive hover:bg-destructive/15",
  );
}

/**
 * A page section: no box, just a hairline above it. Stack sections with a
 * gap and the page reads as one calm column, the way settings pages do.
 */
export function Card({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("border-t border-border pt-6", className)} {...props} />;
}

/** Section title, a muted line under it, and an optional action on the right. */
export function CardHeader({
  title,
  description,
  action,
  id,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  /** Accepted for older call sites; sections no longer show icon tiles. */
  icon?: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 id={id} className="text-[15px] leading-6 font-semibold tracking-[-0.01em]">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-[13px] leading-5 text-pretty text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export function CardBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("pt-4", className)} {...props} />;
}

/** A quiet closing line: notes on the left, actions on the right. */
export function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-4 text-[13px] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** Plain rows split by hairlines; no surrounding box. */
export const ROW_LIST = "divide-y divide-border border-t border-border";

/** Every app page opens the same way: a title, a line of context, maybe an action. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.02em] text-balance">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-pretty text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </header>
  );
}

const BADGE_TONES = {
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  danger: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
};

export function Badge({
  tone = "neutral",
  dot = true,
  className,
  children,
}: {
  tone?: keyof typeof BADGE_TONES;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-full px-2 text-[12px] font-medium",
        BADGE_TONES[tone],
        className,
      )}
    >
      {dot && <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** Underlined inline link that reads on both themes. */
export const TEXT_LINK =
  "text-foreground underline decoration-foreground/25 underline-offset-[3px] transition-colors hover:decoration-foreground/60";
