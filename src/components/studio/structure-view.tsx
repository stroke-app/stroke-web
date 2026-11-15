import { KeyRoundIcon, LinkIcon, ListTreeIcon, Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";

import type { BridgeClient, Structure, TableRef } from "#/lib/studio-bridge";

/** Columns, indexes and foreign keys of one table. A referenced table opens in its own tab. */
export function StructureView({
  client,
  table,
  onOpenTable,
}: {
  client: BridgeClient;
  table: TableRef;
  onOpenTable: (schema: string, name: string) => void;
}) {
  const [s, setS] = useState<Structure | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    client
      .structure(table.schema, table.name)
      .then((r) => live && setS(r))
      .catch((e: unknown) => live && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      live = false;
    };
  }, [client, table]);

  if (error) return <p className="m-4 font-mono text-[12.5px] text-destructive">{error}</p>;
  if (!s) {
    return (
      <div className="flex items-center gap-2 p-4 text-[13px] text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" /> Reading the structure…
      </div>
    );
  }

  const th =
    "h-8 border-b border-border px-3 text-left text-[12px] font-medium text-muted-foreground";
  const td = "h-8 border-b border-border/50 px-3 text-[12.5px]";
  return (
    <div className="min-h-0 flex-1 overflow-auto p-4">
      <section>
        <h3 className="mb-2 text-[13px] font-medium">
          Columns <span className="text-muted-foreground">{s.columns.length}</span>
        </h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Type</th>
                <th className={th}>Nullable</th>
                <th className={th}>Default</th>
              </tr>
            </thead>
            <tbody>
              {s.columns.map((c) => (
                <tr key={c.name}>
                  <td className={`${td} font-mono`}>
                    <span className="flex items-center gap-1.5">
                      {c.primaryKey && <KeyRoundIcon className="size-3 shrink-0 text-amber-500" />}
                      {c.name}
                    </span>
                  </td>
                  <td className={`${td} font-mono text-muted-foreground`}>{c.type}</td>
                  <td className={`${td} text-muted-foreground`}>{c.nullable ? "yes" : "no"}</td>
                  <td className={`${td} font-mono text-muted-foreground`}>{c.default ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6">
        <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-medium">
          <ListTreeIcon className="size-3.5 text-muted-foreground" />
          Indexes <span className="text-muted-foreground">{s.indexes.length}</span>
        </h3>
        {s.indexes.length ? (
          <ul className="divide-y divide-border/50 rounded-lg border border-border">
            {s.indexes.map((i) => (
              <li key={i.name} className="flex items-center gap-3 px-3 py-2 text-[12.5px]">
                <span className="min-w-0 flex-1 truncate font-mono">{i.name}</span>
                <span className="font-mono text-muted-foreground">({i.columns.join(", ")})</span>
                {i.primary ? (
                  <span className="rounded bg-amber-500/10 px-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                    primary
                  </span>
                ) : i.unique ? (
                  <span className="rounded bg-muted px-1.5 text-[11px] text-muted-foreground">
                    unique
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12.5px] text-muted-foreground">No indexes.</p>
        )}
      </section>

      <section className="mt-6">
        <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-medium">
          <LinkIcon className="size-3.5 text-muted-foreground" />
          Foreign keys <span className="text-muted-foreground">{s.foreignKeys.length}</span>
        </h3>
        {s.foreignKeys.length ? (
          <ul className="divide-y divide-border/50 rounded-lg border border-border">
            {s.foreignKeys.map((f) => (
              <li key={f.name} className="flex items-center gap-2 px-3 py-2 text-[12.5px]">
                <span className="font-mono">({f.columns.join(", ")})</span>
                <span className="text-muted-foreground">→</span>
                <button
                  type="button"
                  className="font-mono text-primary hover:underline"
                  onClick={() => onOpenTable(f.refSchema, f.refTable)}
                >
                  {f.refTable}
                </button>
                <span className="font-mono text-muted-foreground">({f.refColumns.join(", ")})</span>
                <span className="ms-auto truncate font-mono text-[11px] text-faint">{f.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12.5px] text-muted-foreground">No foreign keys.</p>
        )}
      </section>
    </div>
  );
}
