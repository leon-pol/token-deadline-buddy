import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";
import { Empty, PageHeader, Pill } from "@/components/bedro/ui";
import { useStore } from "@/services/store";
import { findPools } from "@/services/matching";

export const Route = createFileRoute("/workspace/pooling")({ component: Pooling });

function Pooling() {
  const items = useStore((s) => s.items);
  const pools = findPools(Object.values(items));
  return (
    <>
      <PageHeader title="Demand Pooling" description="Compatible line items — same category, part and unit — that could be sourced together. Unrelated items are never combined and original records stay unchanged." />
      {pools.length === 0 ? (
        <Empty icon={<Layers className="size-5" />} title="No pooling opportunities" body="Opportunities appear when two or more valid line items request the same component with the same unit of measure." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pools.map((g) => {
            const total = g.reduce((a, i) => a + (i.quantity ?? 0), 0);
            return (
              <div key={g[0]!.id} className="surface p-5">
                <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{g[0]!.part}</h3><Pill tone="primary">{g.length} items</Pill></div>
                <p className="text-sm text-muted-foreground">{g[0]!.category}</p>
                <div className="mt-4 font-display text-2xl font-semibold">{total.toLocaleString()} <span className="text-sm text-muted-foreground">{g[0]!.unit} combined</span></div>
                <ul className="mt-3 space-y-1 text-sm">{g.map((i) => <li key={i.id} className="flex justify-between"><span className="text-muted-foreground">{i.batchId} · row {i.rowNumber}</span><span>{i.quantity?.toLocaleString()}</span></li>)}</ul>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
