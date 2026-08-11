import { Prisma, QuoteStatus } from "@prisma/client";
import httpStatus from "http-status";
import { WORKSHOP_OPERATIONS_DEFAULTS, WORKSHOP_OPERATIONS_TEXT } from "@/constants/workshopOperations.constant";
import { TechnicianIdentity } from "@/interfaces/technician.interface";
import {
  AcceptQuotePayload,
  QuoteAlternativeInput,
  QuoteAlternativeSummary,
  QuoteRevisionAlternativeSummary,
  QuoteSummary,
  SaveQuotePayload,
} from "@/interfaces/workshopOperations.interface";
import {
  PersistedQuoteAlternativeInput,
  SaveQuotePersistence,
} from "@/interfaces/workshopOperationsPersistence.interface";
import {
  calculateQuoteValidUntil,
  canAcceptQuoteRevision,
  canPrepareQuoteRevision,
  getQuoteDisplayStatus,
} from "@/server/domain/quote.domain";
import { QuoteRepository, QuoteWithDetails } from "@/server/repositories/quote.repository";
import { GlobalCatalogService } from "@/server/service/globalCatalog.service";
import { ApiError } from "@/utils/handlers/apiError.handler";

export class QuoteService {
  static async listQuotes(identity: TechnicianIdentity): Promise<QuoteSummary[]> {
    const quotes = await QuoteRepository.findAll(identity.workshopId);
    return quotes.map((quote) => this.toSummary(quote));
  }

  static async createQuote(identity: TechnicianIdentity, payload: SaveQuotePayload): Promise<QuoteSummary> {
    const persistence = await this.toPersistence(identity, payload);
    try {
      return this.toSummary(await QuoteRepository.create(persistence));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return this.toSummary(await QuoteRepository.create(persistence));
      }
      throw error;
    }
  }

  static async updateDraftQuote(
    identity: TechnicianIdentity,
    quoteId: string,
    payload: SaveQuotePayload
  ): Promise<QuoteSummary> {
    const quote = await this.requireQuote(identity.workshopId, quoteId);
    if (quote.status !== QuoteStatus.DRAFT) {
      throw new ApiError({
        status: httpStatus.CONFLICT,
        message: WORKSHOP_OPERATIONS_TEXT.quoteNotEditable,
      });
    }
    const updatedQuote = await QuoteRepository.updateDraft(quoteId, await this.toPersistence(identity, payload));
    if (!updatedQuote) {
      throw new ApiError({
        status: httpStatus.CONFLICT,
        message: WORKSHOP_OPERATIONS_TEXT.quoteNotEditable,
      });
    }
    return this.toSummary(updatedQuote);
  }

  static async sendRevision(identity: TechnicianIdentity, quoteId: string): Promise<QuoteSummary> {
    const quote = await this.requireQuote(identity.workshopId, quoteId);
    if (quote.status !== QuoteStatus.DRAFT || !quote.alternatives.length) {
      throw new ApiError({
        status: httpStatus.CONFLICT,
        message: WORKSHOP_OPERATIONS_TEXT.quoteNotSendable,
      });
    }
    const sentAt = new Date();
    const sentQuote = await QuoteRepository.sendRevision(
      identity.workshopId,
      quoteId,
      sentAt,
      calculateQuoteValidUntil(sentAt, quote.validityDays)
    );
    if (!sentQuote) {
      throw new ApiError({
        status: httpStatus.CONFLICT,
        message: WORKSHOP_OPERATIONS_TEXT.quoteNotSendable,
      });
    }
    return this.toSummary(sentQuote);
  }

  static async prepareRevision(identity: TechnicianIdentity, quoteId: string): Promise<QuoteSummary> {
    const quote = await this.requireQuote(identity.workshopId, quoteId);
    if (!canPrepareQuoteRevision(quote.status)) {
      throw new ApiError({
        status: httpStatus.CONFLICT,
        message: WORKSHOP_OPERATIONS_TEXT.quoteNotReopenable,
      });
    }
    const preparedQuote = await QuoteRepository.prepareRevision(identity.workshopId, quoteId);
    if (!preparedQuote) {
      throw new ApiError({
        status: httpStatus.CONFLICT,
        message: WORKSHOP_OPERATIONS_TEXT.quoteNotReopenable,
      });
    }
    return this.toSummary(preparedQuote);
  }

  static async acceptAlternative(
    identity: TechnicianIdentity,
    quoteId: string,
    payload: AcceptQuotePayload
  ): Promise<QuoteSummary> {
    const quote = await this.requireQuote(identity.workshopId, quoteId);
    const latestRevision = quote.revisions[0];
    const alternative = latestRevision?.alternatives.find(
      (revisionAlternative) => revisionAlternative.id === payload.revisionAlternativeId
    );
    const acceptedAt = new Date();
    if (
      !latestRevision ||
      !alternative ||
      !canAcceptQuoteRevision(quote.status, latestRevision.validUntil, acceptedAt)
    ) {
      throw new ApiError({
        status: httpStatus.CONFLICT,
        message: WORKSHOP_OPERATIONS_TEXT.quoteNotAcceptable,
      });
    }
    const acceptedQuote = await QuoteRepository.acceptRevisionAlternative(
      identity.workshopId,
      quoteId,
      alternative.id,
      acceptedAt
    );
    if (!acceptedQuote) {
      throw new ApiError({
        status: httpStatus.CONFLICT,
        message: WORKSHOP_OPERATIONS_TEXT.quoteNotAcceptable,
      });
    }
    return this.toSummary(acceptedQuote);
  }

  private static async requireQuote(workshopId: string, quoteId: string) {
    const quote = await QuoteRepository.findById(workshopId, quoteId);
    if (!quote) {
      throw new ApiError({
        status: httpStatus.NOT_FOUND,
        message: WORKSHOP_OPERATIONS_TEXT.quoteNotFound,
      });
    }
    return quote;
  }

  private static async toPersistence(
    identity: TechnicianIdentity,
    payload: SaveQuotePayload
  ): Promise<SaveQuotePersistence> {
    const device = await QuoteRepository.findOwnedCustomerDevice(
      identity.workshopId,
      payload.customerId,
      payload.deviceId
    );
    if (!device) {
      throw new ApiError({
        status: httpStatus.NOT_FOUND,
        message: WORKSHOP_OPERATIONS_TEXT.deviceNotFound,
      });
    }
    return {
      workshopId: identity.workshopId,
      customerId: payload.customerId,
      deviceId: payload.deviceId,
      reportedIssue: payload.reportedIssue,
      validityDays: payload.validityDays,
      currency: WORKSHOP_OPERATIONS_DEFAULTS.currency,
      alternatives: await this.normalizeAlternatives(payload.alternatives),
    };
  }

  private static async normalizeAlternatives(
    alternatives: QuoteAlternativeInput[]
  ): Promise<PersistedQuoteAlternativeInput[]> {
    const catalogItemIds = [
      ...new Set(alternatives.flatMap((alternative) => (alternative.catalogItemId ? [alternative.catalogItemId] : []))),
    ];
    const catalogItems = await GlobalCatalogService.getPublishedItemsByIds(catalogItemIds);
    if (catalogItems.length !== catalogItemIds.length) {
      throw new ApiError({
        status: httpStatus.CONFLICT,
        message: WORKSHOP_OPERATIONS_TEXT.catalogItemUnavailable,
      });
    }
    const catalogById = new Map(catalogItems.map((item) => [item.id, item]));
    return alternatives.map((alternative, position) => {
      const catalogItem = alternative.catalogItemId ? catalogById.get(alternative.catalogItemId) : undefined;
      return {
        position,
        catalogItemId: catalogItem?.id ?? null,
        description: alternative.description,
        supplier: alternative.supplier,
        referenceCost: catalogItem ? new Prisma.Decimal(String(catalogItem.cost)) : null,
        selectedCost: new Prisma.Decimal(alternative.selectedCost),
        suggestedPrice: catalogItem ? new Prisma.Decimal(String(catalogItem.suggestedPrice)) : null,
        finalPrice: new Prisma.Decimal(alternative.finalPrice),
      };
    });
  }

  private static toSummary(quote: QuoteWithDetails): QuoteSummary {
    const latestRevision = quote.revisions[0];
    return {
      id: quote.id,
      number: quote.number,
      status: quote.status,
      displayStatus: getQuoteDisplayStatus(quote.status, latestRevision?.validUntil),
      reportedIssue: quote.reportedIssue,
      validityDays: quote.validityDays,
      currency: quote.currency,
      acceptedAt: quote.acceptedAt?.toISOString() ?? null,
      acceptedRevisionAlternativeId: quote.acceptedRevisionAlternativeId,
      repairId: quote.repair?.id ?? null,
      createdAt: quote.createdAt.toISOString(),
      updatedAt: quote.updatedAt.toISOString(),
      customer: {
        id: quote.customer.id,
        fullName: quote.customer.fullName,
        phone: quote.customer.phone,
      },
      device: {
        id: quote.device.id,
        brand: quote.device.brand,
        model: quote.device.model,
        imei: quote.device.imei,
      },
      alternatives: quote.alternatives.map((alternative) => this.toAlternativeSummary(alternative)),
      revisions: quote.revisions.map((revision) => ({
        id: revision.id,
        number: revision.number,
        validUntil: revision.validUntil.toISOString(),
        sentAt: revision.sentAt.toISOString(),
        currency: revision.currency,
        alternatives: revision.alternatives.map(
          (alternative): QuoteRevisionAlternativeSummary => ({
            ...this.toAlternativeSummary(alternative),
            sourceAlternativeId: alternative.sourceAlternativeId,
          })
        ),
      })),
    };
  }

  private static toAlternativeSummary(alternative: {
    id: string;
    position: number;
    catalogItemId: string | null;
    description: string;
    supplier: string;
    referenceCost: Prisma.Decimal | null;
    selectedCost: Prisma.Decimal;
    suggestedPrice: Prisma.Decimal | null;
    finalPrice: Prisma.Decimal;
  }): QuoteAlternativeSummary {
    return {
      id: alternative.id,
      position: alternative.position,
      catalogItemId: alternative.catalogItemId,
      description: alternative.description,
      supplier: alternative.supplier,
      referenceCost: alternative.referenceCost?.toFixed(2) ?? null,
      selectedCost: alternative.selectedCost.toFixed(2),
      suggestedPrice: alternative.suggestedPrice?.toFixed(2) ?? null,
      finalPrice: alternative.finalPrice.toFixed(2),
      estimatedProfit: alternative.finalPrice.sub(alternative.selectedCost).toFixed(2),
    };
  }
}
