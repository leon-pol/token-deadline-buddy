import { useSyncExternalStore } from "react";
import type { ActivityEvent, Decision, Negotiation, RequirementBatch, RequirementItem } from "./types";

type State = {
  batches: RequirementBatch[];
  items: Record<string, RequirementItem>;
  selections: Record<string, string>; // itemId -> offeringId
  negotiations: Negotiation[];
  decisions: Record<string, Decision>;
  activity: ActivityEvent[];
};

let state: State = { batches: [], items: {}, selections: {}, negotiations: [], decisions: {}, activity: [] };
const listeners = new Set<() => void>();
const set = (fn: (s: State) => State) => { state = fn(state); listeners.forEach((l) => l()); };
const log = (s: State, text: string, simulated = false): State => ({
  ...s, activity: [{ id: crypto.randomUUID(), at: new Date().toISOString(), text, simulated }, ...s.activity].slice(0, 30),
});

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => sel(state), () => sel(state));
}

/** Workspace actions. In-memory only; replace with backend calls when connected. */
export const actions = {
  addBatch(batch: RequirementBatch, items: RequirementItem[]) {
    set((s) => log({ ...s, batches: [batch, ...s.batches], items: { ...s.items, ...Object.fromEntries(items.map((i) => [i.id, i])) } },
      `Uploaded ${batch.fileName} — ${items.length} line items`));
  },
  removeBatch(id: string) {
    set((s) => {
      const b = s.batches.find((x) => x.id === id);
      const items = { ...s.items };
      b?.itemIds.forEach((i) => delete items[i]);
      return log({ ...s, batches: s.batches.filter((x) => x.id !== id), items }, `Removed batch ${b?.fileName}`);
    });
  },
  selectSupplier(itemId: string, offeringId: string) {
    set((s) => ({ ...s, selections: { ...s.selections, [itemId]: offeringId } }));
  },
  startNegotiation(n: Negotiation) {
    set((s) => log({ ...s, negotiations: [n, ...s.negotiations] }, `Negotiation started with ${n.supplierName}`, true));
  },
  completeNegotiation(id: string, offer: NonNullable<Negotiation["offer"]>) {
    set((s) => {
      const n = s.negotiations.find((x) => x.id === id);
      return log({
        ...s,
        negotiations: s.negotiations.map((x) => (x.id === id ? { ...x, status: "Offer Ready", offer } : x)),
        decisions: { ...s.decisions, [id]: { negotiationId: id, status: "Awaiting Decision", notification: "Pending" } },
      }, `Offer ready from ${n?.supplierName}`, true);
    });
  },
  decide(id: string, status: "Accepted" | "Declined") {
    set((s) => log({
      ...s,
      decisions: { ...s.decisions, [id]: { negotiationId: id, status, decidedAt: new Date().toISOString(), notification: "Not Sent — Email Service Not Connected" } },
    }, `Offer ${status.toLowerCase()} by buyer`));
  },
};

/** Integration status — no services connected in this frontend build. */
export const integrations = [
  { name: "Backend API", status: "Not Connected" },
  { name: "Supplier database service", status: "Not Connected" },
  { name: "Agent service", status: "Not Connected" },
  { name: "Supplier email service", status: "Not Connected" },
] as const;
