import { RepairExpenseKindCode, RepairPaymentKindCode, RepairStatusCode } from "@/types/repairOperations.types";

export interface RepairStatusHistorySummary {
  id: string;
  status: RepairStatusCode;
  note: string | null;
  recordedByName: string;
  changedAt: string;
}

export interface RepairPaymentSummary {
  id: string;
  kind: RepairPaymentKindCode;
  amount: string;
  note: string | null;
  occurredAt: string;
  recordedByName: string;
  adjustsPaymentId: string | null;
  adjustedById: string | null;
}

export interface RepairExpenseSummary {
  id: string;
  kind: RepairExpenseKindCode;
  amount: string;
  description: string;
  supplier: string | null;
  note: string | null;
  occurredAt: string;
  recordedByName: string;
  adjustsExpenseId: string | null;
  adjustedById: string | null;
}

export interface RepairAlertSummary {
  dueAt: string;
  overdueByHours: number;
}

export interface RepairSummary {
  id: string;
  status: RepairStatusCode;
  agreedPrice: string;
  quotedCost: string;
  currency: string;
  physicalReceivedAt: string;
  lastStatusChangedAt: string;
  internalNotes: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  createdByName: string;
  createdAt: string;
  quote: {
    id: string;
    number: number;
    reportedIssue: string;
  };
  customer: {
    id: string;
    fullName: string;
    phone: string;
  };
  device: {
    id: string;
    brand: string;
    model: string;
    imei: string | null;
  };
  acceptedAlternative: {
    id: string;
    description: string;
    supplier: string;
  };
  statusHistory: RepairStatusHistorySummary[];
  payments: RepairPaymentSummary[];
  expenses: RepairExpenseSummary[];
  allowedNextStatuses: RepairStatusCode[];
  alert: RepairAlertSummary | null;
  totals: {
    collected: string;
    balance: string;
    expenses: string;
    actualProfit: string;
  };
}

export interface CreateRepairPayload {
  quoteId: string;
  physicalReceivedAt: string;
  internalNotes: string | null;
}

export interface ChangeRepairStatusPayload {
  status: RepairStatusCode;
  note: string | null;
}

export interface CreateRepairPaymentPayload {
  kind: Exclude<RepairPaymentKindCode, "ADJUSTMENT">;
  amount: string;
  note: string | null;
  occurredAt: string;
}

export interface CreateRepairExpensePayload {
  kind: Exclude<RepairExpenseKindCode, "ADJUSTMENT">;
  amount: string;
  description: string;
  supplier: string | null;
  occurredAt: string;
}

export interface ReverseFinancialEntryPayload {
  note: string | null;
}

export interface RepairAlertRuleSummary {
  id: string;
  status: RepairStatusCode;
  afterHours: number;
  isEnabled: boolean;
}

export interface UpdateRepairAlertRulesPayload {
  rules: Array<{
    status: RepairStatusCode;
    afterHours: number;
    isEnabled: boolean;
  }>;
}
