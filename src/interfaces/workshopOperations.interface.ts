import { QuoteDisplayStatusCode, QuoteStatusCode } from "@/types/workshopOperations.types";

export interface MobileDeviceSummary {
  id: string;
  brand: string;
  model: string;
  imei: string | null;
  color: string | null;
  notes: string | null;
  createdAt: string;
}

export interface WorkshopCustomerSummary {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  notes: string | null;
  devices: MobileDeviceSummary[];
  quoteCount: number;
  createdAt: string;
}

export interface MobileDevicePayload {
  brand: string;
  model: string;
  imei: string | null;
  color: string | null;
  notes: string | null;
}

export interface CreateWorkshopCustomerPayload {
  fullName: string;
  phone: string;
  email: string | null;
  notes: string | null;
  device: MobileDevicePayload;
}

export interface UpdateWorkshopCustomerPayload {
  fullName: string;
  phone: string;
  email: string | null;
  notes: string | null;
}

export interface QuoteAlternativeInput {
  id?: string;
  catalogItemId: string | null;
  description: string;
  supplier: string;
  selectedCost: string;
  finalPrice: string;
}

export interface QuoteAlternativeSummary {
  id: string;
  position: number;
  catalogItemId: string | null;
  description: string;
  supplier: string;
  referenceCost: string | null;
  selectedCost: string;
  suggestedPrice: string | null;
  finalPrice: string;
  estimatedProfit: string;
}

export interface QuoteRevisionAlternativeSummary extends QuoteAlternativeSummary {
  sourceAlternativeId: string | null;
}

export interface QuoteRevisionSummary {
  id: string;
  number: number;
  validUntil: string;
  sentAt: string;
  currency: string;
  alternatives: QuoteRevisionAlternativeSummary[];
}

export interface QuoteSummary {
  id: string;
  number: number;
  status: QuoteStatusCode;
  displayStatus: QuoteDisplayStatusCode;
  reportedIssue: string;
  validityDays: number;
  currency: string;
  acceptedAt: string | null;
  acceptedRevisionAlternativeId: string | null;
  repairId: string | null;
  createdAt: string;
  updatedAt: string;
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
  alternatives: QuoteAlternativeSummary[];
  revisions: QuoteRevisionSummary[];
}

export interface SaveQuotePayload {
  customerId: string;
  deviceId: string;
  reportedIssue: string;
  validityDays: number;
  alternatives: QuoteAlternativeInput[];
}

export interface AcceptQuotePayload {
  revisionAlternativeId: string;
}

export interface WorkshopOperationsDashboard {
  customers: WorkshopCustomerSummary[];
  quotes: QuoteSummary[];
}
