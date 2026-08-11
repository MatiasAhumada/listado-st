import {
  CatalogImportStatus,
  PlatformAuditAction,
  Prisma,
} from "@prisma/client";
import {
  CreateCatalogBatchPersistence,
  PublishCatalogBatchPersistence,
  PublishedCatalogPersistence,
  ReplaceCatalogPricingRulesPersistence,
} from "@/interfaces/catalogPersistence.interface";
import prisma from "@/lib/prisma";

export type CatalogBatchWithItems = Prisma.CatalogImportBatchGetPayload<{
  include: { items: true };
}>;

export class GlobalCatalogRepository {
  static async findPricingRules() {
    return prisma.catalogPricingRule.findMany({ orderBy: { position: "asc" } });
  }

  static async findLatestBatchByStatus(
    status: CatalogImportStatus
  ): Promise<CatalogBatchWithItems | null> {
    return prisma.catalogImportBatch.findFirst({
      where: { status },
      orderBy: { importedAt: "desc" },
      include: { items: { orderBy: { sourceRow: "asc" } } },
    });
  }

  static async findBatchById(batchId: string): Promise<CatalogBatchWithItems | null> {
    return prisma.catalogImportBatch.findUnique({
      where: { id: batchId },
      include: { items: { orderBy: { sourceRow: "asc" } } },
    });
  }

  static async createBatch(
    payload: CreateCatalogBatchPersistence
  ): Promise<CatalogBatchWithItems> {
    return prisma.$transaction(async (transaction) => {
      await transaction.catalogImportBatch.updateMany({
        where: { status: CatalogImportStatus.DRAFT },
        data: { status: CatalogImportStatus.ARCHIVED },
      });
      const batch = await transaction.catalogImportBatch.create({
        data: {
          importedByAdminId: payload.adminId,
          fileName: payload.fileName,
          fileHash: payload.fileHash,
          totalRows: payload.totalRows,
          availableItems: payload.availableItems,
          excludedUnavailable: payload.excludedUnavailable,
          excludedIncoming: payload.excludedIncoming,
          skippedRows: payload.skippedRows,
          items: {
            createMany: {
              data: payload.items,
            },
          },
        },
        include: { items: { orderBy: { sourceRow: "asc" } } },
      });
      await transaction.platformAuditEvent.create({
        data: {
          adminId: payload.adminId,
          action: PlatformAuditAction.CATALOG_IMPORTED,
          metadata: {
            batchId: batch.id,
            fileName: batch.fileName,
            availableItems: batch.availableItems,
          },
        },
      });
      return batch;
    });
  }

  static async publishBatch(
    payload: PublishCatalogBatchPersistence
  ): Promise<CatalogBatchWithItems> {
    return prisma.$transaction(async (transaction) => {
      await transaction.catalogImportBatch.updateMany({
        where: { status: CatalogImportStatus.PUBLISHED },
        data: { status: CatalogImportStatus.ARCHIVED },
      });
      const batch = await transaction.catalogImportBatch.update({
        where: { id: payload.batchId },
        data: {
          status: CatalogImportStatus.PUBLISHED,
          publishedAt: new Date(),
        },
        include: { items: { orderBy: { sourceRow: "asc" } } },
      });
      await transaction.platformAuditEvent.create({
        data: {
          adminId: payload.adminId,
          action: PlatformAuditAction.CATALOG_PUBLISHED,
          metadata: {
            batchId: batch.id,
            availableItems: batch.availableItems,
          },
        },
      });
      return batch;
    });
  }

  static async replacePricingRules(payload: ReplaceCatalogPricingRulesPersistence) {
    return prisma.$transaction(async (transaction) => {
      await transaction.catalogPricingRule.deleteMany();
      await transaction.catalogPricingRule.createMany({ data: payload.rules });
      await transaction.platformAuditEvent.create({
        data: {
          adminId: payload.adminId,
          action: PlatformAuditAction.CATALOG_PRICING_UPDATED,
          metadata: { ruleCount: payload.rules.length },
        },
      });
      return transaction.catalogPricingRule.findMany({ orderBy: { position: "asc" } });
    });
  }

  static async searchPublishedCatalog(
    normalizedQuery: string,
    limit: number
  ): Promise<PublishedCatalogPersistence> {
    const batch = await prisma.catalogImportBatch.findFirst({
      where: { status: CatalogImportStatus.PUBLISHED },
      orderBy: { publishedAt: "desc" },
      select: { id: true, publishedAt: true },
    });
    if (!batch) return { total: 0, items: [] };

    const itemWhere: Prisma.CatalogItemWhereInput = { batchId: batch.id };
    if (normalizedQuery) {
      itemWhere.normalizedName = { contains: normalizedQuery, mode: "insensitive" };
    }
    const [total, items] = await prisma.$transaction([
      prisma.catalogItem.count({ where: itemWhere }),
      prisma.catalogItem.findMany({
        where: itemWhere,
        orderBy: [{ brand: "asc" }, { name: "asc" }],
        take: limit,
      }),
    ]);
    return { publishedAt: batch.publishedAt ?? undefined, total, items };
  }

  static async findPublishedItemsByIds(itemIds: string[]) {
    if (!itemIds.length) return [];
    const batch = await prisma.catalogImportBatch.findFirst({
      where: { status: CatalogImportStatus.PUBLISHED },
      orderBy: { publishedAt: "desc" },
      select: { id: true },
    });
    if (!batch) return [];
    return prisma.catalogItem.findMany({
      where: { id: { in: itemIds }, batchId: batch.id },
    });
  }
}
