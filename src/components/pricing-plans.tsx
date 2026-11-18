import { Link } from "@tanstack/react-router";
import { CheckIcon, MinusIcon } from "lucide-react";

import { SmartDownloadButton } from "#/components/download-button";
import { Cell, CellGrid, Eyebrow, GUTTER, SectionIntro, siteButton } from "#/components/page";
import { useAuth } from "#/lib/auth/hooks";
import { TEAM_PRICE_USD } from "#/lib/billing/plans";
import { SHIPPED_ENGINES } from "#/lib/engines";
import { PRO_PRICE, TRIAL_DAYS } from "#/lib/pricing";
import { cn } from "#/lib/utils";

type Plan = {
  name: string;
  price: string;
  suffix: string;
  pitch: string;
  perks: string[];
  cta: React.ReactNode;
  note: React.ReactNode;
  featured?: boolean;
};

function PlanCell({ plan }: { plan: Plan }) {
  return (
    <Cell className={cn("flex flex-col", plan.featured && "bg-card")}>
      <div className="flex h-6 items-center justify-between">
        <h3 className="text-[15px] font-medium tracking-normal">{plan.name}</h3>
        {plan.featured && (
          <span className="flex items-center gap-1.5 rounded-full bg-ink/[0.07] px-2 py-0.5 text-[12px] font-medium">
            <span className="size-1.5 rounded-full bg-copper" aria-hidden="true" />
            Most people pick this
          </span>
        )}
      </div>
      <p className="mt-7 flex items-baseline gap-2">
        <span className="text-[3rem] leading-none font-semibold tracking-[-0.04em] tabular-nums">
          {plan.price}
        </span>
        <span className="text-[15px] text-muted-foreground">{plan.suffix}</span>
      </p>
      <p className="mt-3 text-[15px] text-muted-foreground">{plan.pitch}</p>
      <div className="mt-8">{plan.cta}</div>
      <p className="mt-3 min-h-10 text-[13px] leading-relaxed text-muted-foreground">{plan.note}</p>
      <ul className="mt-6 space-y-3 border-t border-border pt-6 text-[14px]">
        {plan.perks.map((p) => (
          <li key={p} className="flex items-start gap-3 text-soft">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={2} />
            {p}
          </li>
        ))}
      </ul>
    </Cell>
  );
}

const COMPARE: {
  label: string;
  trial: boolean | string;
  pro: boolean | string;
  team: boolean | string;
}[] = [
  { label: `All ${SHIPPED_ENGINES.length} databases`, trial: true, pro: true, team: true },
  { label: "SQL editor, grid editing and charts", trial: true, pro: true, team: true },
  { label: "AI chat and the MCP server", trial: true, pro: true, team: true },
  { label: "Backup, restore and Postgres admin", trial: true, pro: true, team: true },
  { label: "End-to-end encrypted sync", trial: true, pro: true, team: true },
  { label: "How long", trial: `${TRIAL_DAYS} days`, pro: "Forever", team: "Forever" },
  { label: "Computers", trial: "All yours", pro: "All yours", team: "Everyone at the company" },
  { label: "Future updates", trial: true, pro: true, team: true },
  { label: "Priority support", trial: false, pro: true, team: true },
];

function Mark({ value }: { value: boolean | string }) {
  if (typeof value === "string") return <span className="text-soft">{value}</span>;
  return value ? (
    <CheckIcon className="size-4 text-foreground" strokeWidth={2} aria-label="Included" />
  ) : (
    <MinusIcon className="size-4 text-faint" strokeWidth={2} aria-label="Not included" />
  );
}

/** Plans, the comparison table and the guarantees: the /pricing page body. */
export function Pricing({ as = "h2" }: { as?: "h1" | "h2" }) {
  const { user } = useAuth();
  const buyTo = user ? "/app/billing" : "/signup";

  const plans: Plan[] = [
    {
      name: "Free trial",
      price: "$0",
      suffix: `for ${TRIAL_DAYS} days`,
      pitch: "Everything, while you decide.",
      cta: (
        <SmartDownloadButton size="lg" variant="outline" alternates={false} className="w-full" />
      ),
      note: "Sign in with Google or GitHub in the app. No card.",
      perks: [
        "Every feature and engine",
        "On every computer you sign in on",
        "No card, nothing to cancel",
      ],
    },
    {
      name: "Pro",
      price: PRO_PRICE,
      suffix: "once",
      pitch: "One payment. Yours for good.",
      cta: (
        <Link to={buyTo} className={cn(siteButton({ size: "lg" }), "w-full")}>
          Buy Stroke Pro
        </Link>
      ),
      note: "One-time payment. No renewal, ever.",
      perks: [
        "Everything in the trial, kept",
        "Every future update",
        "Priority answers to support email",
      ],
      featured: true,
    },
    {
      name: "Team",
      price: `$${TEAM_PRICE_USD}`,
      suffix: "once",
      pitch: "One purchase, the whole company.",
      cta: (
        <a
          href="mailto:support@stroke.click?subject=Stroke%20Team"
          className={cn(siteButton({ variant: "secondary", size: "lg" }), "w-full")}
        >
          Email to buy Team
        </a>
      ),
      note: "Covers everyone signing in with your company's email domain.",
      perks: [
        "Pro for every teammate",
        "No seats to count or assign",
        "One invoice for the company",
      ],
    },
  ];

  return (
    <section id="pricing" className={cn(as === "h2" && "border-t border-border")}>
      <div
        className={cn(
          GUTTER,
          as === "h1" ? "pt-16 pb-14 md:pt-24 md:pb-16" : "pt-20 pb-12 md:pt-28",
        )}
      >
        <SectionIntro eyebrow="Pricing" title="Pay once. Keep it forever." as={as} align="center">
          <p>
            Most database clients cost $100 or more every year. Stroke is{" "}
            <strong>{PRO_PRICE}, once</strong>, with every update included. Try all of it for{" "}
            {TRIAL_DAYS} days first.
          </p>
        </SectionIntro>
      </div>

      <CellGrid cols={3}>
        {plans.map((p) => (
          <PlanCell key={p.name} plan={p} />
        ))}
      </CellGrid>

      <div className={cn(GUTTER, "py-16 md:py-20")}>
        <Eyebrow>Compare plans</Eyebrow>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-[14px]">
            <thead>
              <tr className="border-b border-border text-[13px] text-muted-foreground">
                <th scope="col" className="py-3 pr-4 font-medium">
                  <span className="sr-only">Feature</span>
                </th>
                <th scope="col" className="w-[22%] py-3 font-medium">
                  Free trial
                </th>
                <th scope="col" className="w-[22%] py-3 font-medium text-foreground">
                  Pro
                </th>
                <th scope="col" className="w-[22%] py-3 font-medium">
                  Team
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.label} className="border-b border-border">
                  <th scope="row" className="py-3.5 pr-4 font-normal text-soft">
                    {row.label}
                  </th>
                  <td className="py-3.5">
                    <Mark value={row.trial} />
                  </td>
                  <td className="py-3.5">
                    <Mark value={row.pro} />
                  </td>
                  <td className="py-3.5">
                    <Mark value={row.team} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CellGrid cols={4} className="border-b-0">
        {[
          { t: "No renewals.", b: "Pay once and keep it. Nothing comes due next year." },
          { t: "No upsells.", b: "No locked tier, no paid upgrade to version 4." },
          { t: "Already bought a key?", b: "Sign in with that email and Pro is on your account." },
          { t: "Open source.", b: "Read every line of what you're paying for on GitHub." },
        ].map((g) => (
          <Cell key={g.t}>
            <p className="text-[15px] leading-[1.55] text-pretty text-muted-foreground">
              <span className="font-medium text-foreground">{g.t}</span> {g.b}
            </p>
          </Cell>
        ))}
      </CellGrid>
    </section>
  );
}
