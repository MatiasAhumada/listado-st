import {
  PlatformAuditAction,
  Prisma,
  TechnicianStatus,
  WorkshopStatus,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  CreateWorkshopPersistence,
  UpdateWorkshopLifecyclePersistence,
  UpdateWorkshopPlanPersistence,
} from "@/interfaces/platformPersistence.interface";

export type WorkshopWithAdminRelations = Prisma.WorkshopGetPayload<{
  include: {
    subscription: { include: { plan: true } };
    technicians: true;
  };
}>;

const workshopRelations = {
  subscription: { include: { plan: true } },
  technicians: {
    orderBy: { createdAt: "asc" as const },
    take: 1,
  },
};

export class PlatformWorkshopRepository {
  static async findAll(): Promise<WorkshopWithAdminRelations[]> {
    return prisma.workshop.findMany({
      orderBy: { createdAt: "desc" },
      include: workshopRelations,
    });
  }

  static async findById(workshopId: string): Promise<WorkshopWithAdminRelations | null> {
    return prisma.workshop.findUnique({
      where: { id: workshopId },
      include: workshopRelations,
    });
  }

  static async create(payload: CreateWorkshopPersistence): Promise<WorkshopWithAdminRelations> {
    return prisma.$transaction(async (transaction) => {
      return transaction.workshop.create({
        data: {
          name: payload.workshopName,
          slug: payload.workshopSlug,
          status: WorkshopStatus.ACTIVE,
          createdByAdminId: payload.adminId,
          technicians: {
            create: {
              username: payload.ownerUsername,
              passwordHash: payload.ownerPasswordHash,
              displayName: payload.ownerName,
              status: TechnicianStatus.ACTIVE,
            },
          },
          subscription: {
            create: {
              planId: payload.planId,
              agreedPrice: payload.agreedPrice,
              currency: payload.currency,
              billingPeriod: payload.billingPeriod,
              status: payload.subscriptionStatus,
            },
          },
          auditEvents: {
            create: {
              adminId: payload.adminId,
              action: PlatformAuditAction.WORKSHOP_CREATED,
              metadata: { ownerUsername: payload.ownerUsername },
            },
          },
        },
        include: workshopRelations,
      });
    });
  }

  static async updateLifecycle(
    payload: UpdateWorkshopLifecyclePersistence
  ): Promise<WorkshopWithAdminRelations> {
    return prisma.$transaction(async (transaction) => {
      await transaction.workshop.update({
        where: { id: payload.workshopId },
        data: { status: payload.workshopStatus },
      });
      await transaction.technicianUser.updateMany({
        where: { workshopId: payload.workshopId },
        data: { status: payload.technicianStatus },
      });
      if (payload.revokeTechnicianSessions) {
        await transaction.technicianSession.updateMany({
          where: { technician: { workshopId: payload.workshopId } },
          data: { revokedAt: new Date() },
        });
      }
      await transaction.workshopSubscription.update({
        where: { workshopId: payload.workshopId },
        data: {
          status: payload.subscriptionStatus,
          resumeStatus: payload.resumeStatus,
        },
      });
      await transaction.platformAuditEvent.create({
        data: {
          adminId: payload.adminId,
          workshopId: payload.workshopId,
          action: payload.auditAction,
        },
      });

      return transaction.workshop.findUniqueOrThrow({
        where: { id: payload.workshopId },
        include: workshopRelations,
      });
    });
  }

  static async updatePlan(
    payload: UpdateWorkshopPlanPersistence
  ): Promise<WorkshopWithAdminRelations> {
    return prisma.$transaction(async (transaction) => {
      await transaction.workshopSubscription.update({
        where: { workshopId: payload.workshopId },
        data: {
          planId: payload.planId,
          agreedPrice: payload.agreedPrice,
          currency: payload.currency,
          billingPeriod: payload.billingPeriod,
        },
      });
      await transaction.platformAuditEvent.create({
        data: {
          adminId: payload.adminId,
          workshopId: payload.workshopId,
          action: PlatformAuditAction.SUBSCRIPTION_PLAN_CHANGED,
          metadata: {
            previousPlanId: payload.previousPlanId,
            planId: payload.planId,
            agreedPrice: payload.agreedPrice.toFixed(2),
            currency: payload.currency,
            billingPeriod: payload.billingPeriod,
          },
        },
      });
      return transaction.workshop.findUniqueOrThrow({
        where: { id: payload.workshopId },
        include: workshopRelations,
      });
    });
  }
}
