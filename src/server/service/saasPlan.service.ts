import { BillingPeriod, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import {
  SAAS_PLAN_DEFAULTS,
  SAAS_PLAN_ERROR_CODES,
  SAAS_PLAN_TEXT,
} from "@/constants/saasPlan.constant";
import { SaasPlanSummary, SaveSaasPlanPayload } from "@/interfaces/saasPlan.interface";
import {
  SaasPlanRepository,
  SaasPlanWithSubscriptionCount,
} from "@/server/repositories/saasPlan.repository";
import { ApiError } from "@/utils/handlers/apiError.handler";
import { createSaasPlanCode } from "@/utils/saasPlan.util";

export class SaasPlanService {
  static async listPlans(): Promise<SaasPlanSummary[]> {
    const plans = await SaasPlanRepository.findAll();
    return plans.map((plan) => this.toSummary(plan));
  }

  static async createPlan(
    payload: SaveSaasPlanPayload,
    adminId: string
  ): Promise<SaasPlanSummary> {
    try {
      const plan = await SaasPlanRepository.create({
        ...this.toPersistence(payload, adminId),
        code: createSaasPlanCode(payload.name),
      });
      return this.toSummary(plan);
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  static async updatePlan(
    planId: string,
    payload: SaveSaasPlanPayload,
    adminId: string
  ): Promise<SaasPlanSummary> {
    const existingPlan = await SaasPlanRepository.findById(planId);
    if (!existingPlan) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: SAAS_PLAN_TEXT.planNotFound });
    }

    try {
      const plan = await SaasPlanRepository.update(
        planId,
        this.toPersistence(payload, adminId)
      );
      return this.toSummary(plan);
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  private static toPersistence(payload: SaveSaasPlanPayload, adminId: string) {
    return {
      adminId,
      name: payload.name,
      description: payload.description,
      billingPrice: new Prisma.Decimal(payload.billingPrice),
      currency: SAAS_PLAN_DEFAULTS.currency,
      billingPeriod: BillingPeriod[payload.billingPeriod],
      isActive: payload.isActive,
    };
  }

  private static toSummary(plan: SaasPlanWithSubscriptionCount): SaasPlanSummary {
    return {
      id: plan.id,
      code: plan.code,
      name: plan.name,
      description: plan.description,
      billingPrice: plan.billingPrice.toFixed(2),
      currency: plan.currency,
      billingPeriod: plan.billingPeriod,
      isActive: plan.isActive,
      subscriptionCount: plan._count.subscriptions,
      createdAt: plan.createdAt.toISOString(),
    };
  }

  private static handlePersistenceError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === SAAS_PLAN_ERROR_CODES.uniqueConstraint
    ) {
      throw new ApiError({
        status: httpStatus.CONFLICT,
        message: SAAS_PLAN_TEXT.planAlreadyExists,
      });
    }
    throw error;
  }
}
