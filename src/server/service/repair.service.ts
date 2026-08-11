import { Prisma, RepairStatus } from "@prisma/client";
import httpStatus from "http-status";
import { REPAIR_STATUS_ORDER, REPAIR_TEXT } from "@/constants/repairOperations.constant";
import { PlatformAdminIdentity } from "@/interfaces/platformAdmin.interface";
import {
  ChangeRepairStatusPayload,
  CreateRepairExpensePayload,
  CreateRepairPaymentPayload,
  CreateRepairPayload,
  RepairAlertRuleSummary,
  RepairSummary,
  ReverseFinancialEntryPayload,
  UpdateRepairAlertRulesPayload,
} from "@/interfaces/repairOperations.interface";
import { TechnicianIdentity } from "@/interfaces/technician.interface";
import {
  calculateOverdueHours,
  calculateRepairAlertDueAt,
  canChangeRepairStatus,
  getAllowedRepairStatusTransitions,
} from "@/server/domain/repair.domain";
import {
  RepairAlertRuleRepository,
  RepairRepository,
  RepairWithDetails,
} from "@/server/repositories/repair.repository";
import { ApiError } from "@/utils/handlers/apiError.handler";

const futureDateToleranceMilliseconds = 5 * 60 * 1000;
const terminalRepairStatuses = new Set<RepairStatus>([RepairStatus.DELIVERED, RepairStatus.CANCELLED]);

export class RepairService {
  static async listRepairs(identity: TechnicianIdentity): Promise<RepairSummary[]> {
    const [repairs, alertRules] = await Promise.all([
      RepairRepository.findAll(identity.workshopId),
      RepairAlertRuleRepository.findAll(),
    ]);
    const rulesByStatus = new Map(alertRules.map((rule) => [rule.status, rule]));
    const now = new Date();
    return repairs.map((repair) => this.toSummary(repair, rulesByStatus, now));
  }

  static async createRepair(identity: TechnicianIdentity, payload: CreateRepairPayload): Promise<RepairSummary> {
    this.assertNotFuture(payload.physicalReceivedAt);
    const quote = await RepairRepository.findAcceptedQuote(identity.workshopId, payload.quoteId);
    if (!quote?.acceptedRevisionAlternative) {
      throw this.acceptedQuoteUnavailable();
    }
    if (quote.acceptedAt && new Date(payload.physicalReceivedAt).getTime() < quote.acceptedAt.getTime()) {
      throw new ApiError({
        status: httpStatus.BAD_REQUEST,
        message: REPAIR_TEXT.receivedBeforeAcceptance,
      });
    }
    try {
      const repair = await RepairRepository.create(identity, quote, payload);
      if (!repair) throw this.acceptedQuoteUnavailable();
      return this.mapWithRules(repair);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw this.acceptedQuoteUnavailable();
      }
      throw error;
    }
  }

  static async changeStatus(
    identity: TechnicianIdentity,
    repairId: string,
    payload: ChangeRepairStatusPayload
  ): Promise<RepairSummary> {
    const repair = await this.requireRepair(identity.workshopId, repairId);
    if (!canChangeRepairStatus(repair.status, payload.status)) {
      throw new ApiError({
        status: httpStatus.CONFLICT,
        message: REPAIR_TEXT.invalidStatusTransition,
      });
    }
    const updatedRepair = await RepairRepository.changeStatus(
      identity,
      repairId,
      repair.status,
      payload.status as RepairStatus,
      payload.note,
      new Date()
    );
    if (!updatedRepair) {
      throw new ApiError({
        status: httpStatus.CONFLICT,
        message: REPAIR_TEXT.invalidStatusTransition,
      });
    }
    return this.mapWithRules(updatedRepair);
  }

  static async addPayment(
    identity: TechnicianIdentity,
    repairId: string,
    payload: CreateRepairPaymentPayload
  ): Promise<RepairSummary> {
    this.assertNotFuture(payload.occurredAt);
    const repair = await this.requireRepair(identity.workshopId, repairId);
    this.assertAfterIntake(payload.occurredAt, repair.physicalReceivedAt);
    const amount = new Prisma.Decimal(payload.amount);
    const balance = repair.agreedPrice.sub(this.sumPayments(repair));
    if (amount.greaterThan(balance)) {
      throw new ApiError({
        status: httpStatus.CONFLICT,
        message: REPAIR_TEXT.paymentExceedsBalance,
      });
    }
    if (payload.kind === "FINAL" && !amount.equals(balance)) {
      throw new ApiError({
        status: httpStatus.CONFLICT,
        message: REPAIR_TEXT.finalPaymentMismatch,
      });
    }
    const updatedRepair = await RepairRepository.addPayment(identity, repairId, payload);
    if (!updatedRepair) throw this.repairNotFound();
    return this.mapWithRules(updatedRepair);
  }

  static async addExpense(
    identity: TechnicianIdentity,
    repairId: string,
    payload: CreateRepairExpensePayload
  ): Promise<RepairSummary> {
    this.assertNotFuture(payload.occurredAt);
    const repair = await this.requireRepair(identity.workshopId, repairId);
    this.assertAfterIntake(payload.occurredAt, repair.physicalReceivedAt);
    const updatedRepair = await RepairRepository.addExpense(identity, repairId, payload);
    if (!updatedRepair) throw this.repairNotFound();
    return this.mapWithRules(updatedRepair);
  }

  static async reversePayment(
    identity: TechnicianIdentity,
    repairId: string,
    paymentId: string,
    payload: ReverseFinancialEntryPayload
  ): Promise<RepairSummary> {
    await this.requireRepair(identity.workshopId, repairId);
    try {
      const repair = await RepairRepository.reversePayment(identity, repairId, paymentId, payload.note, new Date());
      if (!repair) {
        throw new ApiError({
          status: httpStatus.NOT_FOUND,
          message: REPAIR_TEXT.paymentNotFound,
        });
      }
      return this.mapWithRules(repair);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ApiError({
          status: httpStatus.CONFLICT,
          message: REPAIR_TEXT.paymentNotFound,
        });
      }
      throw error;
    }
  }

  static async reverseExpense(
    identity: TechnicianIdentity,
    repairId: string,
    expenseId: string,
    payload: ReverseFinancialEntryPayload
  ): Promise<RepairSummary> {
    await this.requireRepair(identity.workshopId, repairId);
    try {
      const repair = await RepairRepository.reverseExpense(identity, repairId, expenseId, payload.note, new Date());
      if (!repair) {
        throw new ApiError({
          status: httpStatus.NOT_FOUND,
          message: REPAIR_TEXT.expenseNotFound,
        });
      }
      return this.mapWithRules(repair);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ApiError({
          status: httpStatus.CONFLICT,
          message: REPAIR_TEXT.expenseNotFound,
        });
      }
      throw error;
    }
  }

  private static async requireRepair(workshopId: string, repairId: string) {
    const repair = await RepairRepository.findById(workshopId, repairId);
    if (!repair) throw this.repairNotFound();
    return repair;
  }

  private static async mapWithRules(repair: RepairWithDetails): Promise<RepairSummary> {
    const rules = await RepairAlertRuleRepository.findAll();
    return this.toSummary(repair, new Map(rules.map((rule) => [rule.status, rule])), new Date());
  }

  private static toSummary(
    repair: RepairWithDetails,
    alertRules: Map<RepairStatus, { afterHours: number; isEnabled: boolean }>,
    now: Date
  ): RepairSummary {
    const collected = this.sumPayments(repair);
    const expenses = this.sumExpenses(repair);
    const balance = repair.agreedPrice.sub(collected);
    const allowedNextStatuses = getAllowedRepairStatusTransitions(repair.status);
    const alertRule = allowedNextStatuses.length ? alertRules.get(repair.status) : undefined;
    const dueAt = alertRule?.isEnabled
      ? calculateRepairAlertDueAt(repair.lastStatusChangedAt, alertRule.afterHours)
      : null;
    const overdueByHours = dueAt ? calculateOverdueHours(dueAt, now) : 0;

    return {
      id: repair.id,
      status: repair.status,
      agreedPrice: repair.agreedPrice.toFixed(2),
      quotedCost: repair.quotedCost.toFixed(2),
      currency: repair.currency,
      physicalReceivedAt: repair.physicalReceivedAt.toISOString(),
      lastStatusChangedAt: repair.lastStatusChangedAt.toISOString(),
      internalNotes: repair.internalNotes,
      deliveredAt: repair.deliveredAt?.toISOString() ?? null,
      cancelledAt: repair.cancelledAt?.toISOString() ?? null,
      createdByName: repair.createdByName,
      createdAt: repair.createdAt.toISOString(),
      quote: {
        id: repair.quote.id,
        number: repair.quote.number,
        reportedIssue: repair.quote.reportedIssue,
      },
      customer: {
        id: repair.customer.id,
        fullName: repair.customer.fullName,
        phone: repair.customer.phone,
      },
      device: {
        id: repair.device.id,
        brand: repair.device.brand,
        model: repair.device.model,
        imei: repair.device.imei,
      },
      acceptedAlternative: {
        id: repair.acceptedRevisionAlternative.id,
        description: repair.acceptedRevisionAlternative.description,
        supplier: repair.acceptedRevisionAlternative.supplier,
      },
      statusHistory: repair.statusHistory.map((entry) => ({
        id: entry.id,
        status: entry.status,
        note: entry.note,
        recordedByName: entry.recordedByName,
        changedAt: entry.changedAt.toISOString(),
      })),
      payments: repair.payments.map((payment) => ({
        id: payment.id,
        kind: payment.kind,
        amount: payment.amount.toFixed(2),
        note: payment.note,
        occurredAt: payment.occurredAt.toISOString(),
        recordedByName: payment.recordedByName,
        adjustsPaymentId: payment.adjustsPaymentId,
        adjustedById: payment.adjustedBy?.id ?? null,
      })),
      expenses: repair.expenses.map((expense) => ({
        id: expense.id,
        kind: expense.kind,
        amount: expense.amount.toFixed(2),
        description: expense.description,
        supplier: expense.supplier,
        note: expense.note,
        occurredAt: expense.occurredAt.toISOString(),
        recordedByName: expense.recordedByName,
        adjustsExpenseId: expense.adjustsExpenseId,
        adjustedById: expense.adjustedBy?.id ?? null,
      })),
      allowedNextStatuses,
      alert: dueAt && overdueByHours > 0 ? { dueAt: dueAt.toISOString(), overdueByHours } : null,
      totals: {
        collected: collected.toFixed(2),
        balance: balance.toFixed(2),
        expenses: expenses.toFixed(2),
        actualProfit: repair.agreedPrice.sub(expenses).toFixed(2),
      },
    };
  }

  private static sumPayments(repair: RepairWithDetails): Prisma.Decimal {
    return repair.payments.reduce((total, payment) => total.add(payment.amount), new Prisma.Decimal(0));
  }

  private static sumExpenses(repair: RepairWithDetails): Prisma.Decimal {
    return repair.expenses.reduce((total, expense) => total.add(expense.amount), new Prisma.Decimal(0));
  }

  private static assertNotFuture(value: string): void {
    if (new Date(value).getTime() > Date.now() + futureDateToleranceMilliseconds) {
      throw new ApiError({
        status: httpStatus.BAD_REQUEST,
        message: REPAIR_TEXT.futureDateInvalid,
      });
    }
  }

  private static assertAfterIntake(value: string, physicalReceivedAt: Date): void {
    if (new Date(value).getTime() < physicalReceivedAt.getTime()) {
      throw new ApiError({
        status: httpStatus.BAD_REQUEST,
        message: REPAIR_TEXT.movementBeforeIntake,
      });
    }
  }

  private static repairNotFound(): ApiError {
    return new ApiError({
      status: httpStatus.NOT_FOUND,
      message: REPAIR_TEXT.repairNotFound,
    });
  }

  private static acceptedQuoteUnavailable(): ApiError {
    return new ApiError({
      status: httpStatus.CONFLICT,
      message: REPAIR_TEXT.acceptedQuoteNotFound,
    });
  }
}

export class RepairAlertRuleService {
  static async listRules(): Promise<RepairAlertRuleSummary[]> {
    const rules = await RepairAlertRuleRepository.findAll();
    const byStatus = new Map(rules.map((rule) => [rule.status, rule]));
    return REPAIR_STATUS_ORDER.flatMap((status) => {
      const rule = byStatus.get(status);
      return rule
        ? [
            {
              id: rule.id,
              status: rule.status,
              afterHours: rule.afterHours,
              isEnabled: rule.isEnabled,
            },
          ]
        : [];
    });
  }

  static async saveRules(
    identity: PlatformAdminIdentity,
    payload: UpdateRepairAlertRulesPayload
  ): Promise<RepairAlertRuleSummary[]> {
    if (new Set(payload.rules.map((rule) => rule.status)).size !== REPAIR_STATUS_ORDER.length) {
      throw new ApiError({
        status: httpStatus.BAD_REQUEST,
        message: REPAIR_TEXT.invalidRequest,
      });
    }
    await RepairAlertRuleRepository.saveAll(identity.id, {
      rules: payload.rules.map((rule) => ({
        ...rule,
        isEnabled: terminalRepairStatuses.has(rule.status as RepairStatus) ? false : rule.isEnabled,
      })),
    });
    return this.listRules();
  }
}
