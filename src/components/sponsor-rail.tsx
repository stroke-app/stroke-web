import { Link } from "@tanstack/react-router";
import { HeartIcon } from "lucide-react";

import { SPONSOR_URL, SPONSORS } from "#/lib/sponsors";

/**
 * The sponsor column beside docs, database, comparison and blog pages. Logos
 * from the top tiers first; with none yet, one quiet card that says the slot
 * exists and how to take it.
 */
export function SponsorRail() {
  const featured = SPONSORS.filter((s) => s.tier === "platinum" || s.tier === "gold");
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-faint">Sponsors</p>
      {featured.map((s) => (
        <a
          key={s.name}
          href={s.url}
          target="_blank"
          rel="noopener sponsored"
          className="flex h-16 items-center justify-center rounded-lg border border-border bg-white/[0.02] px-4 transition-colors hover:bg-white/[0.05]"
          title={s.name}
        >
          {s.logo ? (
            <img src={s.logo} alt={s.name} className="max-h-8 max-w-full" />
          ) : (
            <span className="text-sm font-medium">{s.name}</span>
          )}
        </a>
      ))}
      <Link
        to="/sponsors"
        className="group flex flex-col gap-1.5 rounded-lg border border-dashed border-border p-4 transition-colors hover:border-foreground/25 hover:bg-white/[0.02]"
      >
        <span className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          <HeartIcon className="size-3.5 text-pink-400" aria-hidden="true" />
          {featured.length ? "Sponsor Stroke" : "Your logo here"}
        </span>
        <span className="text-xs leading-relaxed text-muted-foreground">
          Stroke is built by one developer. Sponsors keep it independent and show here, to people
          choosing a database client.
        </span>
      </Link>
      <a
        href={SPONSOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        GitHub Sponsors ↗
      </a>
    </div>
  );
}
