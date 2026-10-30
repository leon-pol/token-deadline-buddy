import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { UploadCloud, Trash2, AlertTriangle, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader, Pill } from "@/components/bedro/ui";
import { actions, useStore } from "@/services/store";
import { ACCEPTED, parseRequirementFile } from "@/services/requirements";

export const Route = createFileRoute("/workspace/requirements")({ component: Requirements });

function Requirements() {
  const batches = useStore((s) => s.batches);
  const items = useStore((s) => s.items);
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    setError(null); setBusy(true);
    for (const f of Array.from(files)) {
      try { const { batch, items } = await parseRequirementFile(f); actions.addBatch(batch, items); }
      catch (e) { setError(`${f.name}: ${(e as Error).message}`); }
    }
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  return (
    <>
      <PageHeader title="Requirements" description="Upload buyer requirement files. Each line item is validated independently; files are parsed in your browser." />
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
        className={`surface flex flex-col items-center border-2 border-dashed px-6 py-10 text-center transition ${drag ? "border-primary bg-accent" : ""}`}>
        <UploadCloud className="size-8 text-primary" />
        <p className="mt-3 font-semibold">Drag and drop requirement files</p>
        <p className="mt-1 text-sm text-muted-foreground">CSV or XLSX · up to 5 MB · columns such as part_name, category, quantity, unit, target_price, lead_time_days, specification</p>
        <Button className="mt-5" disabled={busy} onClick={() => input.current?.click()}>{busy ? "Validating…" : "Select Files"}</Button>
        <input ref={input} type="file" accept={ACCEPTED} multiple hidden onChange={(e) => handle(e.target.files)} />
      </div>
      {error && <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive"><AlertTriangle className="mt-0.5 size-4" />{error}</div>}

      <div className="mt-8 space-y-6">
        {batches.length === 0 && <Empty icon={<FileUp className="size-5" />} title="No requirement batches" body="Uploaded batches appear here with validation results for each line item." />}
        {batches.map((b) => {
          const rows = b.itemIds.map((id) => items[id]);
          const review = rows.filter((r) => r.status === "Needs Review").length;
          return (
            <section key={b.id} className="surface overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 border-b p-4">
                <div className="mr-auto">
                  <div className="font-semibold">{b.fileName}</div>
                  <div className="text-xs text-muted-foreground">{b.id} · {rows.length} items · {new Date(b.uploadedAt).toLocaleString()}{b.unmappedColumns.length > 0 && ` · Unmapped columns: ${b.unmappedColumns.join(", ")}`}</div>
                </div>
                <Pill tone="success">{rows.length - review} valid</Pill>
                {review > 0 && <Pill tone="warning">{review} needs review</Pill>}
                <Button variant="ghost" size="sm" onClick={() => actions.removeBatch(b.id)}><Trash2 className="size-4" />Remove</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>{["Row", "Part", "Category", "Qty", "Target price", "Lead time", "Status"].map((h) => <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y">
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-2.5 text-muted-foreground">{r.rowNumber}</td>
                        <td className="px-4 py-2.5 font-medium">{r.part || "—"}</td>
                        <td className="px-4 py-2.5">{r.category || "—"}</td>
                        <td className="px-4 py-2.5">{r.quantity?.toLocaleString() ?? "—"} {r.unit}</td>
                        <td className="px-4 py-2.5">{r.targetPrice ?? "—"}</td>
                        <td className="px-4 py-2.5">{r.requiredLeadDays !== null ? `${r.requiredLeadDays} d` : "—"}</td>
                        <td className="px-4 py-2.5">{r.status === "Valid" ? <Pill tone="success">Valid</Pill> : <Pill tone="warning" className="cursor-help"><span title={r.issues.join("; ")}>Needs Review</span></Pill>}
                          {r.issues.length > 0 && <div className="mt-1 text-xs text-muted-foreground">{r.issues.join("; ")}</div>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
