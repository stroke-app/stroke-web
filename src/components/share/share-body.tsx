import { lazy, type ReactNode } from "react";

import { ShareTable } from "#/components/share/share-table";
import type { SharePayload } from "#/lib/shares/crypto";

const ShareErd = lazy(() =>
  import("#/components/share/share-canvas").then((m) => ({ default: m.ShareErd })),
);
const ShareMermaid = lazy(() =>
  import("#/components/share/share-canvas").then((m) => ({ default: m.ShareMermaid })),
);
const ShareJson = lazy(() =>
  import("#/components/share/share-json").then((m) => ({ default: m.ShareJson })),
);
const ShareChart = lazy(() =>
  import("#/components/share/share-chart").then((m) => ({ default: m.ShareChart })),
);

/** What a share shows, by kind: the share page and the embed render the same thing. */
export function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-0 flex-1 items-center justify-center p-6">{children}</div>;
}

export function Body({
  payload,
  status,
  toolbar = true,
}: {
  payload: SharePayload;
  status?: ReactNode;
  toolbar?: boolean;
}) {
  switch (payload.kind) {
    case "table":
    case "result":
      return (
        <ShareTable
          columns={payload.columns}
          rows={payload.rows}
          title={payload.title}
          masked={payload.masked}
          totalRows={payload.totalRows}
          status={status}
          toolbar={toolbar}
        />
      );
    case "query":
      return (
        <div className="min-h-0 flex-1 overflow-auto p-6">
          <pre className="mx-auto max-w-4xl rounded-xl bg-muted/60 p-5 font-mono text-[13px] leading-6 whitespace-pre-wrap text-soft shadow-[0_0_0_1px_var(--border)]">
            {payload.sql}
          </pre>
        </div>
      );
    case "erd":
      return <ShareErd tables={payload.tables} links={payload.links} title={payload.title} />;
    case "mermaid":
      return <ShareMermaid code={payload.code} />;
    case "chart":
      return (
        <ShareChart
          spec={payload.chart}
          columns={payload.columns}
          rows={payload.rows}
          title={payload.title}
        />
      );
    case "json":
      return (
        <ShareJson
          value={payload.value}
          title={payload.title}
          totalItems={payload.totalItems}
          toolbar={toolbar}
        />
      );
    default:
      return (
        <Center>
          <p className="text-[13px] text-muted-foreground">
            This share was made by a newer Stroke. Reload the page.
          </p>
        </Center>
      );
  }
}
