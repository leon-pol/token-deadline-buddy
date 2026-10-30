import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { RequirementBatch, RequirementItem } from "./types";

const ALIASES: Record<string, string[]> = {
  part: ["part", "part_name", "material", "material_name", "component", "component_name", "item", "description", "product"],
  category: ["category", "component_category", "type", "commodity"],
  quantity: ["quantity", "qty", "required_quantity", "volume", "order_quantity"],
  unit: ["unit", "uom", "unit_of_measure", "units"],
  targetPrice: ["target_price", "target_unit_price", "max_price", "budget_price", "unit_price"],
  requiredLeadDays: ["lead_time_days", "required_lead_time", "max_lead_time_days", "lead_time", "required_by_days"],
  specification: ["specification", "spec", "specs", "technical_specification", "notes"],
};

const norm = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const num = (v: unknown) => {
  if (v === undefined || v === null || String(v).trim() === "") return null;
  const n = Number(String(v).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
};

export const ACCEPTED = ".csv,.xlsx,.xls";
export const MAX_BYTES = 5 * 1024 * 1024;

async function readRows(file: File): Promise<Record<string, unknown>[]> {
  if (/\.csv$/i.test(file.name)) {
    const text = await file.text();
    return Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: true }).data;
  }
  if (/\.xlsx?$/i.test(file.name)) {
    const wb = XLSX.read(await file.arrayBuffer());
    return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]!]!, { defval: "" });
  }
  throw new Error("Unsupported file type. Upload a CSV or XLSX file.");
}

/** Parses and validates a buyer requirement file entirely in the browser. */
export async function parseRequirementFile(file: File): Promise<{ batch: RequirementBatch; items: RequirementItem[] }> {
  if (file.size > MAX_BYTES) throw new Error("File exceeds the 5 MB limit.");
  const rows = await readRows(file);
  if (!rows.length) throw new Error("No requirement rows were found in this file.");
  const headers = Object.keys(rows[0]!);
  const mapping: Record<string, string> = {};
  const used = new Set<string>();
  for (const [field, aliases] of Object.entries(ALIASES)) {
    const h = headers.find((h) => !used.has(h) && aliases.includes(norm(h)));
    if (h) { mapping[field] = h; used.add(h); }
  }
  if (!mapping["part"]) throw new Error("No part or material column was detected. Include a column such as “part_name” or “material_name”.");
  const batchId = `B-${Date.now().toString(36).toUpperCase()}`;
  const items: RequirementItem[] = rows.map((r, i) => {
    const get = (f: string) => (mapping[f] ? String(r[mapping[f]] ?? "").trim() : "");
    const item: RequirementItem = {
      id: `${batchId}-${i + 1}`, batchId, rowNumber: i + 2,
      part: get("part"), category: get("category"), quantity: num(get("quantity")), unit: get("unit"),
      targetPrice: num(get("targetPrice")), requiredLeadDays: num(get("requiredLeadDays")),
      specification: get("specification"), issues: [], status: "Valid",
    };
    if (!item.part) item.issues.push("Part or material name is missing");
    if (item.quantity === null) item.issues.push("Quantity is missing");
    else if (item.quantity <= 0) item.issues.push("Quantity must be greater than zero");
    if (!item.category) item.issues.push("Component category not provided");
    item.status = item.issues.length ? "Needs Review" : "Valid";
    return item;
  });
  return {
    batch: { id: batchId, fileName: file.name, uploadedAt: new Date().toISOString(), itemIds: items.map((x) => x.id), unmappedColumns: headers.filter((h) => !used.has(h)) },
    items,
  };
}
