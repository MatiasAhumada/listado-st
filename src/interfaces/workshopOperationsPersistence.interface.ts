import { Prisma } from "@prisma/client";

export interface PersistedQuoteAlternativeInput {
  catalogItemId: string | null;
  description: string;
  supplier: string;
  referenceCost: Prisma.Decimal | null;
  selectedCost: Prisma.Decimal;
  suggestedPrice: Prisma.Decimal | null;
  finalPrice: Prisma.Decimal;
  position: number;
}

export interface SaveQuotePersistence {
  workshopId: string;
  customerId: string;
  deviceId: string;
  reportedIssue: string;
  validityDays: number;
  currency: string;
  alternatives: PersistedQuoteAlternativeInput[];
}
