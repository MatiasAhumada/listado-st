import { Prisma, QuoteStatus, RepairExpenseKind, RepairPaymentKind, RepairStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  CreateRepairExpensePayload,
  CreateRepairPaymentPayload,
  CreateRepairPayload,
  UpdateRepairAlertRulesPayload,
} from "@/interfaces/repairOperations.interface";
import { TechnicianIdentity } from "@/interfaces/technician.interface";

const repairRelations = {
  quote: true,
  customer: true,
  device: true,
  acceptedRevisionAlternative: true,
  statusHistory: { orderBy: { changedAt: "desc" as const } },
  payments: {
    orderBy: [{ occurredAt: "desc" as const }, { createdAt: "desc" as const }],
    include: { adjustedBy: { select: { id: true } } },
  },
  expenses: {
    orderBy: [{ occurredAt: "desc" as const }, { createdAt: "desc" as const }],
    include: { adjustedBy: { select: { id: true } } },
  },
};

export type RepairWithDetails = Prisma.RepairGetPayload<{
  include: typeof repairRelations;
}>;

export type AcceptedQuoteForRepair = Prisma.QuoteGetPayload<{
  include: {
    customer: true;
    device: true;
    acceptedRevisionAlternative: true;
  };
}>;

export class RepairRepository {
  static async findAll(workshopId: string): Promise<RepairWithDetails[]> {
    return prisma.repair.findMany({
      where: { workshopId },
      orderBy: { lastStatusChangedAt: "desc" },
      include: repairRelations,
    });
  }

  static async findById(workshopId: string, repairId: string): Promise<RepairWithDetails | null> {
    return prisma.repair.findFirst({
      where: { id: repairId, workshopId },
      include: repairRelations,
    });
  }

  static async findAcceptedQuote(workshopId: string, quoteId: string): Promise<AcceptedQuoteForRepair | null> {
    return prisma.quote.findFirst({
      where: {
        id: quoteId,
        workshopId,
        status: QuoteStatus.ACCEPTED,
        acceptedRevisionAlternativeId: { not: null },
        repair: null,
      },
      include: {
        customer: true,
        device: true,
        acceptedRevisionAlternative: true,
      },
    });
  }

  static async create(
    identity: TechnicianIdentity,
    quote: AcceptedQuoteForRepair,
    payload: CreateRepairPayload
  ): Promise<RepairWithDetails | null> {
    const receivedAt = new Date(payload.physicalReceivedAt);
    return prisma.$transaction(async (transaction) => {
      const claim = await transaction.quote.findFirst({
        where: {
          id: quote.id,
          workshopId: identity.workshopId,
          status: QuoteStatus.ACCEPTED,
          repair: null,
        },
        select: { id: true },
      });
      if (!claim || !quote.acceptedRevisionAlternativeId) {
        return null;
      }
      return transaction.repair.create({
        data: {
          workshopId: identity.workshopId,
          quoteId: quote.id,
          customerId: quote.customerId,
          deviceId: quote.deviceId,
          acceptedRevisionAlternativeId: quote.acceptedRevisionAlternativeId,
          agreedPrice: quote.acceptedRevisionAlternative!.finalPrice,
          quotedCost: quote.acceptedRevisionAlternative!.selectedCost,
          currency: quote.currency,
          physicalReceivedAt: receivedAt,
          lastStatusChangedAt: receivedAt,
          internalNotes: payload.internalNotes,
          createdByUserId: identity.id,
          createdByName: identity.displayName,
          statusHistory: {
            create: {
              workshopId: identity.workshopId,
              status: RepairStatus.RECEIVED,
              changedAt: receivedAt,
              note: payload.internalNotes,
              recordedByUserId: identity.id,
              recordedByName: identity.displayName,
            },
          },
        },
        include: repairRelations,
      });
    });
  }

  static async changeStatus(
    identity: TechnicianIdentity,
    repairId: string,
    currentStatus: RepairStatus,
    nextStatus: RepairStatus,
    note: string | null,
    changedAt: Date
  ): Promise<RepairWithDetails | null> {
    return prisma.$transaction(async (transaction) => {
      const result = await transaction.repair.updateMany({
        where: {
          id: repairId,
          workshopId: identity.workshopId,
          status: currentStatus,
        },
        data: {
          status: nextStatus,
          lastStatusChangedAt: changedAt,
          deliveredAt: nextStatus === RepairStatus.DELIVERED ? changedAt : undefined,
          cancelledAt: nextStatus === RepairStatus.CANCELLED ? changedAt : undefined,
        },
      });
      if (!result.count) return null;
      await transaction.repairStatusHistory.create({
        data: {
          workshopId: identity.workshopId,
          repairId,
          status: nextStatus,
          note,
          changedAt,
          recordedByUserId: identity.id,
          recordedByName: identity.displayName,
        },
      });
      return transaction.repair.findFirst({
        where: { id: repairId, workshopId: identity.workshopId },
        include: repairRelations,
      });
    });
  }

  static async addPayment(
    identity: TechnicianIdentity,
    repairId: string,
    payload: CreateRepairPaymentPayload
  ): Promise<RepairWithDetails | null> {
    const repair = await prisma.repair.findFirst({
      where: { id: repairId, workshopId: identity.workshopId },
      select: { id: true },
    });
    if (!repair) return null;
    await prisma.repairPayment.create({
      data: {
        workshopId: identity.workshopId,
        repairId,
        kind: payload.kind,
        amount: new Prisma.Decimal(payload.amount),
        note: payload.note,
        occurredAt: new Date(payload.occurredAt),
        recordedByUserId: identity.id,
        recordedByName: identity.displayName,
      },
    });
    return this.findById(identity.workshopId, repairId);
  }

  static async addExpense(
    identity: TechnicianIdentity,
    repairId: string,
    payload: CreateRepairExpensePayload
  ): Promise<RepairWithDetails | null> {
    const repair = await prisma.repair.findFirst({
      where: { id: repairId, workshopId: identity.workshopId },
      select: { id: true },
    });
    if (!repair) return null;
    await prisma.repairExpense.create({
      data: {
        workshopId: identity.workshopId,
        repairId,
        kind: payload.kind,
        amount: new Prisma.Decimal(payload.amount),
        description: payload.description,
        supplier: payload.supplier,
        occurredAt: new Date(payload.occurredAt),
        recordedByUserId: identity.id,
        recordedByName: identity.displayName,
      },
    });
    return this.findById(identity.workshopId, repairId);
  }

  static async reversePayment(
    identity: TechnicianIdentity,
    repairId: string,
    paymentId: string,
    note: string | null,
    occurredAt: Date
  ): Promise<RepairWithDetails | null> {
    return prisma.$transaction(async (transaction) => {
      const payment = await transaction.repairPayment.findFirst({
        where: {
          id: paymentId,
          repairId,
          workshopId: identity.workshopId,
          kind: { not: RepairPaymentKind.ADJUSTMENT },
          adjustedBy: null,
        },
      });
      if (!payment) return null;
      await transaction.repairPayment.create({
        data: {
          workshopId: identity.workshopId,
          repairId,
          kind: RepairPaymentKind.ADJUSTMENT,
          amount: payment.amount.negated(),
          note,
          occurredAt,
          recordedByUserId: identity.id,
          recordedByName: identity.displayName,
          adjustsPaymentId: payment.id,
        },
      });
      return transaction.repair.findFirst({
        where: { id: repairId, workshopId: identity.workshopId },
        include: repairRelations,
      });
    });
  }

  static async reverseExpense(
    identity: TechnicianIdentity,
    repairId: string,
    expenseId: string,
    note: string | null,
    occurredAt: Date
  ): Promise<RepairWithDetails | null> {
    return prisma.$transaction(async (transaction) => {
      const expense = await transaction.repairExpense.findFirst({
        where: {
          id: expenseId,
          repairId,
          workshopId: identity.workshopId,
          kind: { not: RepairExpenseKind.ADJUSTMENT },
          adjustedBy: null,
        },
      });
      if (!expense) return null;
      await transaction.repairExpense.create({
        data: {
          workshopId: identity.workshopId,
          repairId,
          kind: RepairExpenseKind.ADJUSTMENT,
          amount: expense.amount.negated(),
          description: expense.description,
          supplier: expense.supplier,
          occurredAt,
          recordedByUserId: identity.id,
          recordedByName: identity.displayName,
          adjustsExpenseId: expense.id,
          note,
        },
      });
      return transaction.repair.findFirst({
        where: { id: repairId, workshopId: identity.workshopId },
        include: repairRelations,
      });
    });
  }
}

export class RepairAlertRuleRepository {
  static async findAll() {
    return prisma.repairAlertRule.findMany({ orderBy: { status: "asc" } });
  }

  static async saveAll(adminId: string, payload: UpdateRepairAlertRulesPayload) {
    return prisma.$transaction(async (transaction) => {
      await Promise.all(
        payload.rules.map((rule) =>
          transaction.repairAlertRule.upsert({
            where: { status: rule.status },
            create: { ...rule, updatedByAdminId: adminId },
            update: {
              afterHours: rule.afterHours,
              isEnabled: rule.isEnabled,
              updatedByAdminId: adminId,
            },
          })
        )
      );
      return transaction.repairAlertRule.findMany({ orderBy: { status: "asc" } });
    });
  }
}
