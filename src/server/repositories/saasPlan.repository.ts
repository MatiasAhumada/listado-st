import { PlatformAuditAction, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  CreateSaasPlanPersistence,
  SaveSaasPlanPersistence,
} from "@/interfaces/saasPlanPersistence.interface";

export type SaasPlanWithSubscriptionCount = Prisma.SaasPlanGetPayload<{
  include: { _count: { select: { subscriptions: true } } };
}>;

const subscriptionCountRelation = {
  _count: { select: { subscriptions: true } },
};

export class SaasPlanRepository {
  static async findAll(): Promise<SaasPlanWithSubscriptionCount[]> {
    return prisma.saasPlan.findMany({
      orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
      include: subscriptionCountRelation,
    });
  }

  static async findById(planId: string): Promise<SaasPlanWithSubscriptionCount | null> {
    return prisma.saasPlan.findUnique({
      where: { id: planId },
      include: subscriptionCountRelation,
    });
  }

  static async create(
    payload: CreateSaasPlanPersistence
  ): Promise<SaasPlanWithSubscriptionCount> {
    return prisma.$transaction(async (transaction) => {
      const plan = await transaction.saasPlan.create({
        data: {
          code: payload.code,
          name: payload.name,
          description: payload.description,
          billingPrice: payload.billingPrice,
          currency: payload.currency,
          billingPeriod: payload.billingPeriod,
          isActive: payload.isActive,
          createdByAdminId: payload.adminId,
        },
      });
      await transaction.platformAuditEvent.create({
        data: {
          adminId: payload.adminId,
          action: PlatformAuditAction.PLAN_CREATED,
          metadata: { planId: plan.id, planCode: plan.code },
        },
      });
      return transaction.saasPlan.findUniqueOrThrow({
        where: { id: plan.id },
        include: subscriptionCountRelation,
      });
    });
  }

  static async update(
    planId: string,
    payload: SaveSaasPlanPersistence
  ): Promise<SaasPlanWithSubscriptionCount> {
    return prisma.$transaction(async (transaction) => {
      const plan = await transaction.saasPlan.update({
        where: { id: planId },
        data: {
          name: payload.name,
          description: payload.description,
          billingPrice: payload.billingPrice,
          currency: payload.currency,
          billingPeriod: payload.billingPeriod,
          isActive: payload.isActive,
        },
      });
      await transaction.platformAuditEvent.create({
        data: {
          adminId: payload.adminId,
          action: PlatformAuditAction.PLAN_UPDATED,
          metadata: { planId: plan.id, planCode: plan.code },
        },
      });
      return transaction.saasPlan.findUniqueOrThrow({
        where: { id: plan.id },
        include: subscriptionCountRelation,
      });
    });
  }
}
