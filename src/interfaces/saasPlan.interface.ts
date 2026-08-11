import { BillingPeriodCode } from "@/types/platformAdmin.types";

export interface SaasPlanReference {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface SaasPlanSummary extends SaasPlanReference {
  description: string | null;
  billingPrice: string;
  currency: string;
  billingPeriod: BillingPeriodCode;
  subscriptionCount: number;
  createdAt: string;
}

export interface SaveSaasPlanPayload {
  name: string;
  description: string | null;
  billingPrice: string;
  billingPeriod: BillingPeriodCode;
  isActive: boolean;
}
