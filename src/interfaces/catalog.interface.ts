import { CatalogImportStatusCode } from "@/types/catalog.types";

export interface CatalogPricingRuleInput {
  maximumCost: number | null;
  markupPercentage: number;
}

export interface CatalogPricingRuleSummary extends CatalogPricingRuleInput {
  id: string;
  position: number;
}

export interface CatalogItemSummary {
  id: string;
  sourceRow: number;
  name: string;
  brand?: string;
  cost: number;
  suggestedPrice: number;
}

export interface CatalogBatchSummary {
  id: string;
  fileName: string;
  status: CatalogImportStatusCode;
  totalRows: number;
  availableItems: number;
  excludedUnavailable: number;
  excludedIncoming: number;
  skippedRows: number;
  importedAt: string;
  publishedAt?: string;
  items: CatalogItemSummary[];
}

export interface CatalogAdminDashboard {
  pricingRules: CatalogPricingRuleSummary[];
  draftBatch?: CatalogBatchSummary;
  publishedBatch?: CatalogBatchSummary;
}

export interface PublishCatalogBatchPayload {
  status: "PUBLISHED";
}

export interface ReplaceCatalogPricingRulesPayload {
  rules: CatalogPricingRuleInput[];
}

export interface TechnicianCatalogResult {
  items: CatalogItemSummary[];
  total: number;
  publishedAt?: string;
}

export interface CatalogSearchPayload {
  query: string;
}

export interface CatalogImportFile {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
}
