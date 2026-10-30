/** Frontend data contracts. Replace service adapters to connect the real backend. */
export type SupplierOffering = {
  supplier_id: string; company_name: string; company_type: string; country: string;
  certifications: string; manufacturing_capability: string; offering_id: string;
  component_category: string; material_name: string; material_grade: string;
  specification: string; unit_of_measure: string; minimum_order_quantity: number;
  unit_price: number; currency: string; lead_time_days: number; available_quantity: number;
  quality_rating: number; quality_certification: string; delivery_reliability_pct: number;
  country_of_origin: string; compliance_status: string; counterfeit_risk_level: string;
  last_updated: string;
};

export type Supplier = {
  supplier_id: string; company_name: string; company_type: string; country: string;
  certifications: string[]; capabilities: string[]; offerings: SupplierOffering[];
};

export type ItemStatus = "Valid" | "Needs Review";

export type RequirementItem = {
  id: string; batchId: string; rowNumber: number;
  part: string; category: string; quantity: number | null; unit: string;
  targetPrice: number | null; requiredLeadDays: number | null; specification: string;
  issues: string[]; status: ItemStatus;
};

export type RequirementBatch = {
  id: string; fileName: string; uploadedAt: string; itemIds: string[]; unmappedColumns: string[];
};

export type Candidate = {
  offering: SupplierOffering; score: number; fit: string[]; gaps: string[];
};

export type NegotiationStatus = "In Progress" | "Offer Ready";
export type Negotiation = {
  id: string; itemId: string; offeringId: string; supplierName: string;
  status: NegotiationStatus; startedAt: string; simulated: true;
  offer?: { unitPrice: number; currency: string; leadTimeDays: number; quantity: number; total: number };
};

export type DecisionStatus = "Awaiting Decision" | "Accepted" | "Declined";
export type Decision = {
  negotiationId: string; status: DecisionStatus; decidedAt?: string;
  notification: "Not Sent — Email Service Not Connected" | "Pending";
};

export type ActivityEvent = { id: string; at: string; text: string; simulated?: boolean };
