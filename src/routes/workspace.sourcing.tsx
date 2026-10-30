import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader, Pill, SimTag, money } from "@/components/bedro/ui";
import { actions, useStore } from "@/services/store";
import { getCatalog } from "@/services/catalog";
import { rankCandidates } from "@/services/matching";

export const Route = createFileRoute("/workspace/sourcing")({ component: Sourcing });

function Sourcing() {
  const items = Object.values(useStore((s) => s.items)).filter((i) => i.status === "Valid");
  const selections = useStore((s) => s.selections);
  const negs = useStore((s) => s.negotiations);
  const [active, setActive] = useState<string | null>(null);
  const nav = useNavigate();
  const { offerings } = getCatalog();
  const found = items.find((i) => i.id === active) ?? items[0];

  if (!items.length)
    return (<><PageHeader title="Sourcing Options" description="Top-three supplier shortlist for each validated line item." />
      <Empty icon={<Search className="size-5" />} title="No validated line items" body="Upload requirements and resolve validation issues to see matched suppliers." action={<Button asChild><Link to="/workspace/requirements">Upload Requirements</Link></Button>} /></>);

  const item = found!;
  const cands = rankCandidates(item, offerings);
  const alternatives = offerings.filter((o) => o.component_category.toLowerCase() === item.category.toLowerCase() && !cands.some((c) => c.offering.offering_id === o.offering_id)).slice(0, 4);
  const existing = negs.find((n) => n.itemId === item.id);

  function negotiate(offeringId: string) {
    const c = cands.find((x) => x.offering.offering_id === offeringId)!;
    const id = `NEG-${Date.now().toString(36).toUpperCase()}`;
    actions.startNegotiation({ id, itemId: item.id, offeringId, supplierName: c.offering.company_name, status: "In Progress", startedAt: new Date().toISOString(), simulated: true });
    const qty = item.quantity ?? c.offering.minimum_order_quantity;
    setTimeout(() => {
      const unitPrice = +(c.offering.unit_price * 0.96).toFixed(2);
      actions.completeNegotiation(id, { unitPrice, currency: c.offering.currency, leadTimeDays: c.offering.lead_time_days, quantity: qty, total: +(unitPrice * qty).toFixed(2) });
    }, 2500);
    nav({ to: "/workspace/negotiations" });
  }

  return (
    <>
      <PageHeader title="Sourcing Options" description="Matched against the sample supplier catalogue. Catalogue values are not quotes." actions={<Pill>Sample supplier catalogue</Pill>} />
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="surface h-fit p-2">
          {items.map((i) => (
            <button key={i.id} onClick={() => setActive(i.id)} className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${i.id === item.id ? "bg-accent text-accent-foreground" : "hover:bg-secondary"}`}>
              <div className="truncate font-medium">{i.part}</div><div className="text-xs text-muted-foreground">{i.quantity?.toLocaleString()} {i.unit} · {i.batchId}</div>
            </button>
          ))}
        </div>
        <div>
          <h2 className="font-semibold">Shortlist — {item.part}</h2>
          {cands.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No eligible supplier offerings matched this item in the sample catalogue.</p> : (
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              {cands.map((c, idx) => {
                const sel = selections[item.id] === c.offering.offering_id;
                return (
                  <button key={c.offering.offering_id} onClick={() => actions.selectSupplier(item.id, c.offering.offering_id)}
                    className={`surface p-4 text-left transition hover:-translate-y-0.5 ${sel ? "ring-2 ring-primary" : ""}`}>
                    <div className="flex items-center justify-between"><Pill tone="primary">#{idx + 1} · Fit {c.score}</Pill>{sel && <Check className="size-4 text-primary" />}</div>
                    <div className="mt-3 font-semibold">{c.offering.company_name}</div>
                    <div className="text-xs text-muted-foreground">{c.offering.material_name} · {c.offering.country_of_origin}</div>
                    <div className="mt-3 text-sm">{money(c.offering.unit_price, c.offering.currency)} / {c.offering.unit_of_measure} · {c.offering.lead_time_days} d</div>
                    <ul className="mt-3 space-y-1 text-xs">
                      {c.fit.slice(0, 3).map((f) => <li key={f} className="flex gap-1.5 text-success"><Check className="size-3.5 shrink-0" />{f}</li>)}
                      {c.gaps.map((g) => <li key={g} className="flex gap-1.5 text-warning"><AlertCircle className="size-3.5 shrink-0" />{g}</li>)}
                    </ul>
                  </button>
                );
              })}
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {existing ? <Pill tone="primary">Negotiation {existing.status}</Pill> : (
              <Button disabled={!selections[item.id]} onClick={() => negotiate(selections[item.id]!)}>Start Negotiation with Selected Supplier</Button>
            )}
            <SimTag />
          </div>
          {alternatives.length > 0 && (
            <div className="mt-10">
              <h2 className="font-semibold">Component alternatives</h2>
              <p className="text-sm text-muted-foreground">Other offerings in the same category. Qualification by your engineering team is required.</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {alternatives.map((o) => <div key={o.offering_id} className="surface p-4 text-sm"><div className="font-medium">{o.material_name}</div><div className="text-xs text-muted-foreground">{o.company_name} · {o.material_grade}</div><div className="mt-2 text-xs">{o.specification}</div></div>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
