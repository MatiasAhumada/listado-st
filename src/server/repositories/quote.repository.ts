import { QuoteStatus, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { SaveQuotePersistence } from "@/interfaces/workshopOperationsPersistence.interface";

export type QuoteWithDetails = Prisma.QuoteGetPayload<{
  include: {
    customer: true;
    device: true;
    repair: { select: { id: true } };
    alternatives: true;
    revisions: { include: { alternatives: true } };
  };
}>;

const quoteRelations = {
  customer: true,
  device: true,
  repair: { select: { id: true } },
  alternatives: { orderBy: { position: "asc" as const } },
  revisions: {
    orderBy: { number: "desc" as const },
    include: { alternatives: { orderBy: { position: "asc" as const } } },
  },
};

export class QuoteRepository {
  static async findAll(workshopId: string): Promise<QuoteWithDetails[]> {
    return prisma.quote.findMany({
      where: { workshopId },
      orderBy: { updatedAt: "desc" },
      include: quoteRelations,
    });
  }

  static async findById(workshopId: string, quoteId: string): Promise<QuoteWithDetails | null> {
    return prisma.quote.findFirst({
      where: { id: quoteId, workshopId },
      include: quoteRelations,
    });
  }

  static async findOwnedCustomerDevice(workshopId: string, customerId: string, deviceId: string) {
    return prisma.mobileDevice.findFirst({
      where: {
        id: deviceId,
        customerId,
        workshopId,
        customer: { workshopId },
      },
      select: { id: true },
    });
  }

  static async create(payload: SaveQuotePersistence): Promise<QuoteWithDetails> {
    return prisma.$transaction(async (transaction) => {
      const aggregate = await transaction.quote.aggregate({
        where: { workshopId: payload.workshopId },
        _max: { number: true },
      });
      return transaction.quote.create({
        data: {
          workshopId: payload.workshopId,
          customerId: payload.customerId,
          deviceId: payload.deviceId,
          number: (aggregate._max.number ?? 0) + 1,
          reportedIssue: payload.reportedIssue,
          validityDays: payload.validityDays,
          currency: payload.currency,
          alternatives: {
            create: payload.alternatives.map((alternative) => ({
              workshopId: payload.workshopId,
              ...alternative,
            })),
          },
        },
        include: quoteRelations,
      });
    });
  }

  static async updateDraft(quoteId: string, payload: SaveQuotePersistence): Promise<QuoteWithDetails | null> {
    return prisma.$transaction(async (transaction) => {
      const result = await transaction.quote.updateMany({
        where: { id: quoteId, workshopId: payload.workshopId, status: QuoteStatus.DRAFT },
        data: {
          customerId: payload.customerId,
          deviceId: payload.deviceId,
          reportedIssue: payload.reportedIssue,
          validityDays: payload.validityDays,
        },
      });
      if (!result.count) return null;
      await transaction.quoteAlternative.deleteMany({
        where: { quoteId, workshopId: payload.workshopId },
      });
      await transaction.quoteAlternative.createMany({
        data: payload.alternatives.map((alternative) => ({
          quoteId,
          workshopId: payload.workshopId,
          ...alternative,
        })),
      });
      return transaction.quote.findFirst({
        where: { id: quoteId, workshopId: payload.workshopId },
        include: quoteRelations,
      });
    });
  }

  static async sendRevision(
    workshopId: string,
    quoteId: string,
    sentAt: Date,
    validUntil: Date
  ): Promise<QuoteWithDetails | null> {
    return prisma.$transaction(async (transaction) => {
      const quote = await transaction.quote.findFirst({
        where: { id: quoteId, workshopId, status: QuoteStatus.DRAFT },
        include: {
          alternatives: { orderBy: { position: "asc" } },
          revisions: { select: { number: true }, orderBy: { number: "desc" }, take: 1 },
        },
      });
      if (!quote?.alternatives.length) return null;
      await transaction.quoteRevision.create({
        data: {
          workshopId,
          quoteId,
          number: (quote.revisions[0]?.number ?? 0) + 1,
          currency: quote.currency,
          sentAt,
          validUntil,
          alternatives: {
            create: quote.alternatives.map((alternative) => ({
              workshopId,
              sourceAlternativeId: alternative.id,
              catalogItemId: alternative.catalogItemId,
              position: alternative.position,
              description: alternative.description,
              supplier: alternative.supplier,
              referenceCost: alternative.referenceCost,
              selectedCost: alternative.selectedCost,
              suggestedPrice: alternative.suggestedPrice,
              finalPrice: alternative.finalPrice,
            })),
          },
        },
      });
      await transaction.quote.update({
        where: { id: quoteId },
        data: { status: QuoteStatus.SENT },
      });
      return transaction.quote.findFirst({
        where: { id: quoteId, workshopId },
        include: quoteRelations,
      });
    });
  }

  static async prepareRevision(workshopId: string, quoteId: string): Promise<QuoteWithDetails | null> {
    const result = await prisma.quote.updateMany({
      where: { id: quoteId, workshopId, status: QuoteStatus.SENT },
      data: { status: QuoteStatus.DRAFT },
    });
    if (!result.count) return null;
    return this.findById(workshopId, quoteId);
  }

  static async acceptRevisionAlternative(
    workshopId: string,
    quoteId: string,
    revisionAlternativeId: string,
    acceptedAt: Date
  ): Promise<QuoteWithDetails | null> {
    const result = await prisma.quote.updateMany({
      where: {
        id: quoteId,
        workshopId,
        status: QuoteStatus.SENT,
        acceptedRevisionAlternativeId: null,
      },
      data: {
        status: QuoteStatus.ACCEPTED,
        acceptedRevisionAlternativeId: revisionAlternativeId,
        acceptedAt,
      },
    });
    if (!result.count) return null;
    return this.findById(workshopId, quoteId);
  }
}
