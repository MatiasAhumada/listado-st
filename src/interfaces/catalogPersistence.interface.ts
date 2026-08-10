import { CatalogImportStatus, Prisma } from "@prisma/client";

export interface CatalogSourceRow {
  description: string;
  cost?: number;
  note: string;
  fillColor?: string;
  fillTheme?: number;
}

export interface CatalogWorkbookCellStyle {
  fgColor?: {
    rgb?: string;
    theme?: number;
  };
}

export interface ParsedCatalogItem {
  sourceRow: number;
  name: string;
  normalizedName: string;
  brand?: string;
  cost: number;
}

export interface ParsedCatalogWorkbook {
  totalRows: number;
  availableItems: number;
  excludedUnavailable: number;
  excludedIncoming: number;
  skippedRows: number;
  items: ParsedCatalogItem[];
}

export interface CreateCatalogBatchPersistence extends ParsedCatalogWorkbook {
  adminId: string;
  fileName: string;
  fileHash: string;
}

export interface PublishCatalogBatchPersistence {
  batchId: string;
  adminId: string;
}

export interface ReplaceCatalogPricingRulesPersistence {
  adminId: string;
  rules: Array<{
    position: number;
    maximumCost: number | null;
    markupPercentage: number;
  }>;
}

export interface CatalogBatchLookup {
  status: CatalogImportStatus;
}

export interface PublishedCatalogPersistence {
  publishedAt?: Date;
  total: number;
  items: Array<{
    id: string;
    sourceRow: number;
    name: string;
    normalizedName: string;
    brand: string | null;
    cost: Prisma.Decimal;
  }>;
}
