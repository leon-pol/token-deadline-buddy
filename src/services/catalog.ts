import Papa from "papaparse";
import raw from "@/data/suppliers.csv?raw";
import type { Supplier, SupplierOffering } from "./types";

const NUM = ["minimum_order_quantity", "unit_price", "lead_time_days", "available_quantity", "quality_rating", "delivery_reliability_pct"];

let cache: { offerings: SupplierOffering[]; suppliers: Supplier[] } | null = null;

/** Sample supplier catalogue adapter. Swap for a supplier API call later. */
export function getCatalog() {
  if (cache) return cache;
  const parsed = Papa.parse<Record<string, string>>(raw, { header: true, skipEmptyLines: true });
  const offerings = parsed.data.map((r) => {
    const o: Record<string, unknown> = { ...r };
    NUM.forEach((k) => (o[k] = Number(r[k]) || 0));
    return o as unknown as SupplierOffering;
  });
  const map = new Map<string, Supplier>();
  for (const o of offerings) {
    let s = map.get(o.supplier_id);
    if (!s) {
      const r = o as unknown as Record<string, string>;
      s = {
        supplier_id: o.supplier_id, company_name: o.company_name, company_type: o.company_type, country: o.country,
        certifications: o.certifications.split(";").map((x) => x.trim()).filter(Boolean),
        capabilities: (r["manufacturing_capability"] || "").split(";").map((x) => x.trim()).filter(Boolean),
        offerings: [],
      };
      map.set(o.supplier_id, s);
    }
    s.offerings.push(o);
  }
  cache = { offerings, suppliers: [...map.values()] };
  return cache;
}
