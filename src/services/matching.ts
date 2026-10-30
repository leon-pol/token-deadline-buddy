import type { Candidate, RequirementItem, SupplierOffering } from "./types";

const tokens = (s: string) => new Set(s.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1));

/** Preview matching heuristic. The backend matching service replaces this. */
export function rankCandidates(item: RequirementItem, offerings: SupplierOffering[], limit = 3): Candidate[] {
  const want = tokens(`${item.part} ${item.specification}`);
  const cat = item.category.toLowerCase();
  const out: Candidate[] = [];
  for (const o of offerings) {
    const have = tokens(`${o.material_name} ${o.specification} ${o.component_category}`);
    let overlap = 0;
    want.forEach((t) => have.has(t) && overlap++);
    const catMatch = !!cat && (o.component_category.toLowerCase().includes(cat) || cat.includes(o.component_category.toLowerCase()));
    if (!catMatch && overlap < 2) continue;
    const fit: string[] = [], gaps: string[] = [];
    let score = Math.min(overlap, 8) * 6 + (catMatch ? 25 : 0);
    if (catMatch) fit.push(`Category: ${o.component_category}`);
    if (item.quantity !== null) {
      if (o.minimum_order_quantity <= item.quantity) { score += 8; fit.push("Meets minimum order quantity"); }
      else gaps.push(`MOQ ${o.minimum_order_quantity.toLocaleString()} exceeds requested quantity`);
      if (o.available_quantity >= item.quantity) { score += 8; fit.push("Listed availability covers quantity"); }
      else gaps.push(`Listed availability ${o.available_quantity.toLocaleString()} below quantity`);
    }
    if (item.requiredLeadDays !== null) {
      if (o.lead_time_days <= item.requiredLeadDays) { score += 8; fit.push(`Lead time ${o.lead_time_days} days`); }
      else gaps.push(`Lead time ${o.lead_time_days} days exceeds ${item.requiredLeadDays}`);
    }
    if (item.targetPrice !== null) {
      if (o.unit_price <= item.targetPrice) { score += 8; fit.push("Catalogue price within target"); }
      else gaps.push(`Catalogue price ${o.unit_price} above target ${item.targetPrice}`);
    }
    if (o.compliance_status !== "Compliant") gaps.push(`Compliance: ${o.compliance_status}`); else score += 5;
    if (o.counterfeit_risk_level !== "Low") gaps.push(`Counterfeit risk: ${o.counterfeit_risk_level}`);
    score += o.quality_rating * 2 + o.delivery_reliability_pct / 20;
    out.push({ offering: o, score: Math.round(Math.min(score, 100)), fit, gaps });
  }
  out.sort((a, b) => b.score - a.score);
  // one offering per supplier in the shortlist
  const seen = new Set<string>();
  return out.filter((c) => !seen.has(c.offering.supplier_id) && seen.add(c.offering.supplier_id)).slice(0, limit);
}

/** Pools only items with the same category and matching normalised part name. */
export function findPools(items: RequirementItem[]) {
  const groups = new Map<string, RequirementItem[]>();
  for (const i of items) {
    if (i.status !== "Valid") continue;
    const key = `${i.category.toLowerCase()}|${i.part.toLowerCase().replace(/\s+/g, " ").trim()}|${i.unit.toLowerCase()}`;
    groups.set(key, [...(groups.get(key) ?? []), i]);
  }
  return [...groups.values()].filter((g) => g.length > 1);
}
