import { createFileRoute, Link } from "@tanstack/react-router";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader, Pill, Stat } from "@/components/bedro/ui";
import { integrations, useStore } from "@/services/store";
import { getCatalog } from "@/services/catalog";
import { findPools } from "@/services/matching";

export const Route = createFileRoute("/workspace/")({ component: Overview });

function Overview() {
  const s = useStore((x) => x);
  const items = Object.values(s.items);
  const { suppliers, offerings } = getCatalog();
  const review = items.filter((i) => i.status === "Needs Review").length;
  const decisions = Object.values(s.decisions);
  return (
    <>
      <PageHeader title="Overview" description="Status of your requirement batches, negotiations and sourcing decisions." />
      {items.length === 0 ? (
        <Empty icon={<FileUp className="size-5" />} title="No requirements uploaded" body="Upload a CSV or XLSX requirement file to begin validation, supplier matching and shortlisting."
          action={<Button asChild><Link to="/workspace/requirements">Upload Requirements</Link></Button>} />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Requirement batches" value={s.batches.length} hint={`${items.length} line items`} />
          <Stat label="Needs review" value={review} hint="Missing or invalid values" />
          <Stat label="Negotiations" value={s.negotiations.length} hint={`${s.negotiations.filter((n) => n.status === "In Progress").length} in progress`} />
          <Stat label="Awaiting decision" value={decisions.filter((d) => d.status === "Awaiting Decision").length} hint={`${findPools(items).length} pooling opportunities`} />
        </div>
      )}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="surface p-5 lg:col-span-2">
          <h2 className="font-semibold">Workflow updates</h2>
          {s.activity.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No activity yet.</p> : (
            <ul className="mt-3 divide-y">
              {s.activity.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span>{a.text} {a.simulated && <Pill tone="warning" className="ml-1">Simulated</Pill>}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{new Date(a.at).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-4">
          <div className="surface p-5">
            <h2 className="font-semibold">Integration status</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {integrations.map((i) => <li key={i.name} className="flex justify-between gap-2"><span>{i.name}</span><Pill tone="danger">{i.status}</Pill></li>)}
            </ul>
          </div>
          <div className="surface p-5">
            <div className="flex items-center justify-between"><h2 className="font-semibold">Supplier catalogue</h2><Pill>Sample data</Pill></div>
            <p className="mt-2 text-sm text-muted-foreground">{suppliers.length} suppliers · {offerings.length} offerings</p>
            <ul className="mt-3 space-y-1 text-sm">{suppliers.map((x) => <li key={x.supplier_id} className="flex justify-between"><span className="truncate">{x.company_name}</span><span className="text-muted-foreground">{x.offerings.length}</span></li>)}</ul>
          </div>
        </div>
      </div>
    </>
  );
}
