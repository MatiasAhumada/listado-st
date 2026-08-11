import { BillingPeriod, Prisma } from "@prisma/client";

export interface SaveSaasPlanPersistence {
  adminId: string;
  name: string;
  description: string | null;
  billingPrice: Prisma.Decimal;
  currency: string;
  billingPeriod: BillingPeriod;
  isActive: boolean;
}

export interface CreateSaasPlanPersistence extends SaveSaasPlanPersistence {
  code: string;
}
