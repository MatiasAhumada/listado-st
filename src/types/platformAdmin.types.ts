export type WorkshopStatusCode = "ACTIVE" | "SUSPENDED";
export type TechnicianStatusCode = "ACTIVE" | "SUSPENDED";
export type SubscriptionStatusCode = "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED";
export type InitialSubscriptionStatusCode = "TRIAL" | "ACTIVE";
export type BillingPeriodCode = "MONTHLY" | "YEARLY";
export type PlatformAuditActionCode =
  | "WORKSHOP_CREATED"
  | "WORKSHOP_ACTIVATED"
  | "WORKSHOP_SUSPENDED"
  | "CATALOG_IMPORTED"
  | "CATALOG_PUBLISHED"
  | "CATALOG_PRICING_UPDATED"
  | "PLAN_CREATED"
  | "PLAN_UPDATED"
  | "SUBSCRIPTION_PLAN_CHANGED";
