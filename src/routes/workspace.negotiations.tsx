import { createFileRoute, Link } from "@tanstack/react-router";
import { Handshake, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader, Pill, SimTag, money } from "@/components/bedro/ui";
import { useStore } from "@/services/store";

export const Route = createFileRoute("/workspace/negotiations")({ component: Negotiations });

function Negotiations() {
  const negs = useStore((s) => s.negotiations);
  const items = useStore((s) => s.items);
  return (
    <>
      <PageHeader title="Negotiations" description="One selected supplier per line item. Outcomes shown here are simulated until the agent and email services are connected." actions={<SimTag />} />
      {negs.length === 0 ? (
        <Empty icon={<Handshake className="size-5" />} title="No negotiations" body="Select a shortlisted supplier in Sourcing Options to start a negotiation." action={<Button asChild><Link to="/workspace/sourcing">Open Sourcing Options</Link></Button>} />
      ) : (
        <div className="space-y-3">
          {negs.map((n) => (
            <div key={n.id} className="surface flex flex-wrap items-center gap-4 p-5">
              <div className="mr-auto">
                <div className="font-semibold">{n.supplierName}</div>
                <div className="text-xs text-muted-foreground">{n.id} · {items[n.itemId]?.part}</div>
              </div>
              {n.offer && <div className="text-sm">{money(n.offer.unitPrice, n.offer.currency)} / unit · {n.offer.leadTimeDays} d</div>}
              {n.status === "In Progress" ? <Pill tone="primary"><Loader2 className="size-3 animate-spin" />In Progress</Pill> : <Pill tone="success">Offer Ready</Pill>}
              {n.status === "Offer Ready" && <Button size="sm" variant="outline" asChild><Link to="/workspace/decision">Review Offer</Link></Button>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
