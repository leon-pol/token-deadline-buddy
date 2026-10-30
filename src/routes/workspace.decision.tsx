import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader, Pill, SimTag, money } from "@/components/bedro/ui";
import { actions, useStore } from "@/services/store";

export const Route = createFileRoute("/workspace/decision")({ component: Decision });

function Decision() {
  const negs = useStore((s) => s.negotiations).filter((n) => n.offer);
  const decisions = useStore((s) => s.decisions);
  const items = useStore((s) => s.items);
  return (
    <>
      <PageHeader title="Sourcing Decision" description="Review negotiated offers and explicitly accept or decline. No commitment is made without your decision." />
      {negs.length === 0 ? (
        <Empty icon={<CheckCircle2 className="size-5" />} title="No offers awaiting decision" body="Completed negotiation offers appear here for buyer approval." />
      ) : (
        <div className="space-y-4">
          {negs.map((n) => {
            const d = decisions[n.id];
            const o = n.offer!;
            return (
              <div key={n.id} className="surface p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="mr-auto text-lg font-semibold">{n.supplierName}</h3><SimTag />
                  <Pill tone={d?.status === "Accepted" ? "success" : d?.status === "Declined" ? "danger" : "primary"}>{d?.status}</Pill>
                </div>
                <p className="text-sm text-muted-foreground">{items[n.itemId]?.part} · {n.id}</p>
                <dl className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[["Unit price", money(o.unitPrice, o.currency)], ["Quantity", o.quantity.toLocaleString()], ["Lead time", `${o.leadTimeDays} days`], ["Total", money(o.total, o.currency)]].map(([k, v]) => (
                    <div key={k}><dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt><dd className="mt-1 font-display text-xl font-semibold">{v}</dd></div>
                  ))}
                </dl>
                {d?.status === "Awaiting Decision" ? (
                  <div className="mt-6 flex gap-3">
                    <Button onClick={() => actions.decide(n.id, "Accepted")}>Accept Offer</Button>
                    <Button variant="outline" onClick={() => actions.decide(n.id, "Declined")}>Decline Offer</Button>
                  </div>
                ) : (
                  <div className="mt-6 text-sm">Supplier notification: <Pill tone="warning">{d?.notification}</Pill></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
