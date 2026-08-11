import { createHash } from "crypto";
import httpStatus from "http-status";
import { CatalogImportStatus, Prisma } from "@prisma/client";
import {
  CATALOG_DEFAULTS,
  CATALOG_LIMITS,
  CATALOG_TEXT,
  CATALOG_WORKBOOK,
} from "@/constants/catalog.constant";
import {
  CatalogAdminDashboard,
  CatalogBatchSummary,
  CatalogImportFile,
  CatalogItemSummary,
  CatalogPricingRuleInput,
  CatalogPricingRuleSummary,
  TechnicianCatalogResult,
} from "@/interfaces/catalog.interface";
import { ParsedCatalogWorkbook } from "@/interfaces/catalogPersistence.interface";
import {
  calculateCatalogSuggestedPrice,
  hasValidCatalogPricingOrder,
} from "@/server/domain/catalogPricing.domain";
import { CatalogWorkbookParser } from "@/server/parsers/catalogWorkbook.parser";
import {
  CatalogBatchWithItems,
  GlobalCatalogRepository,
} from "@/server/repositories/globalCatalog.repository";
import { ApiError } from "@/utils/handlers/apiError.handler";
import { normalizeCatalogSearchValue } from "@/utils/catalog.util";

export class GlobalCatalogService {
  static async getAdminDashboard(): Promise<CatalogAdminDashboard> {
    const [pricingRules, draftBatch, publishedBatch] = await Promise.all([
      this.getPricingRules(),
      GlobalCatalogRepository.findLatestBatchByStatus(CatalogImportStatus.DRAFT),
      GlobalCatalogRepository.findLatestBatchByStatus(CatalogImportStatus.PUBLISHED),
    ]);
    return {
      pricingRules,
      draftBatch: draftBatch ? this.toBatchSummary(draftBatch, pricingRules) : undefined,
      publishedBatch: publishedBatch
        ? this.toBatchSummary(publishedBatch, pricingRules)
        : undefined,
    };
  }

  static async importWorkbook(
    file: CatalogImportFile,
    adminId: string
  ): Promise<CatalogAdminDashboard> {
    this.validateImportFile(file);
    const workbookBytes = new Uint8Array(await file.arrayBuffer());
    let parsedWorkbook: ParsedCatalogWorkbook;
    try {
      parsedWorkbook = CatalogWorkbookParser.parse(workbookBytes);
    } catch {
      throw new ApiError({
        status: httpStatus.BAD_REQUEST,
        message: CATALOG_TEXT.workbookUnreadable,
      });
    }
    if (!parsedWorkbook.availableItems) {
      throw new ApiError({
        status: httpStatus.BAD_REQUEST,
        message: CATALOG_TEXT.workbookEmpty,
      });
    }

    await GlobalCatalogRepository.createBatch({
      ...parsedWorkbook,
      adminId,
      fileName: file.name,
      fileHash: createHash(CATALOG_WORKBOOK.hashAlgorithm)
        .update(workbookBytes)
        .digest(CATALOG_WORKBOOK.hashEncoding),
    });
    return this.getAdminDashboard();
  }

  static async publishBatch(
    batchId: string,
    adminId: string
  ): Promise<CatalogAdminDashboard> {
    const batch = await GlobalCatalogRepository.findBatchById(batchId);
    if (!batch) {
      throw new ApiError({
        status: httpStatus.NOT_FOUND,
        message: CATALOG_TEXT.batchNotFound,
      });
    }
    if (batch.status !== CatalogImportStatus.DRAFT) {
      throw new ApiError({
        status: httpStatus.CONFLICT,
        message: CATALOG_TEXT.batchNotDraft,
      });
    }
    await GlobalCatalogRepository.publishBatch({ batchId, adminId });
    return this.getAdminDashboard();
  }

  static async replacePricingRules(
    rules: CatalogPricingRuleInput[],
    adminId: string
  ): Promise<CatalogAdminDashboard> {
    if (!hasValidCatalogPricingOrder(rules)) {
      throw new ApiError({
        status: httpStatus.BAD_REQUEST,
        message: CATALOG_TEXT.pricingOrderInvalid,
      });
    }
    await GlobalCatalogRepository.replacePricingRules({
      adminId,
      rules: rules.map((rule, position) => ({ ...rule, position })),
    });
    return this.getAdminDashboard();
  }

  static async searchPublishedCatalog(query: string): Promise<TechnicianCatalogResult> {
    const [pricingRules, catalog] = await Promise.all([
      this.getPricingRules(),
      GlobalCatalogRepository.searchPublishedCatalog(
        normalizeCatalogSearchValue(query),
        CATALOG_LIMITS.technicianResultLimit
      ),
    ]);
    return {
      items: catalog.items.map((item) => this.toItemSummary(item, pricingRules)),
      total: catalog.total,
      publishedAt: catalog.publishedAt?.toISOString(),
    };
  }

  static async getPublishedItemsByIds(itemIds: string[]): Promise<CatalogItemSummary[]> {
    const [pricingRules, items] = await Promise.all([
      this.getPricingRules(),
      GlobalCatalogRepository.findPublishedItemsByIds(itemIds),
    ]);
    return items.map((item) => this.toItemSummary(item, pricingRules));
  }

  private static async getPricingRules(): Promise<CatalogPricingRuleSummary[]> {
    const pricingRules = await GlobalCatalogRepository.findPricingRules();
    if (!pricingRules.length) {
      return CATALOG_DEFAULTS.rules.map((rule, position) => ({
        id: String(position),
        position,
        ...rule,
      }));
    }
    return pricingRules.map((rule) => ({
      id: rule.id,
      position: rule.position,
      maximumCost: rule.maximumCost ? Number(rule.maximumCost) : null,
      markupPercentage: Number(rule.markupPercentage),
    }));
  }

  private static validateImportFile(file: CatalogImportFile): void {
    const hasValidExtension = file.name.toLowerCase().endsWith(CATALOG_WORKBOOK.extension);
    const hasValidMime =
      !file.type || CATALOG_WORKBOOK.mimeTypes.some((mimeType) => mimeType === file.type);
    if (!hasValidExtension || !hasValidMime) {
      throw new ApiError({
        status: httpStatus.BAD_REQUEST,
        message: CATALOG_TEXT.invalidFile,
      });
    }
    if (file.size > CATALOG_LIMITS.maximumFileSizeBytes) {
      throw new ApiError({
        status: httpStatus.REQUEST_ENTITY_TOO_LARGE,
        message: CATALOG_TEXT.fileTooLarge,
      });
    }
  }

  private static toBatchSummary(
    batch: CatalogBatchWithItems,
    pricingRules: CatalogPricingRuleInput[]
  ): CatalogBatchSummary {
    return {
      id: batch.id,
      fileName: batch.fileName,
      status: batch.status,
      totalRows: batch.totalRows,
      availableItems: batch.availableItems,
      excludedUnavailable: batch.excludedUnavailable,
      excludedIncoming: batch.excludedIncoming,
      skippedRows: batch.skippedRows,
      importedAt: batch.importedAt.toISOString(),
      publishedAt: batch.publishedAt?.toISOString(),
      items: batch.items.map((item) => this.toItemSummary(item, pricingRules)),
    };
  }

  private static toItemSummary(
    item: {
      id: string;
      sourceRow: number;
      name: string;
      brand: string | null;
      cost: Prisma.Decimal;
    },
    pricingRules: CatalogPricingRuleInput[]
  ): CatalogItemSummary {
    const cost = Number(item.cost);
    return {
      id: item.id,
      sourceRow: item.sourceRow,
      name: item.name,
      brand: item.brand ?? undefined,
      cost,
      suggestedPrice: calculateCatalogSuggestedPrice(cost, pricingRules),
    };
  }
}
