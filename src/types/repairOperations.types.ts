export type RepairStatusCode =
  | "RECEIVED"
  | "DIAGNOSING"
  | "WAITING_PART"
  | "IN_REPAIR"
  | "READY_FOR_PICKUP"
  | "DELIVERED"
  | "CANCELLED";

export type RepairPaymentKindCode = "DEPOSIT" | "PARTIAL" | "FINAL" | "ADJUSTMENT";

export type RepairExpenseKindCode = "PART" | "SUPPLY" | "OUTSOURCED_SERVICE" | "OTHER" | "ADJUSTMENT";
