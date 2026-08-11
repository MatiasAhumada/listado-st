import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { Prisma, SubscriptionStatus } from "@prisma/client";
import { PlatformWorkshopRepository, WorkshopWithAdminRelations } from "@/server/repositories/platformWorkshop.repository";
import { buildWorkshopLifecycleUpdate } from "@/server/domain/workshopLifecycle.domain";
import {
  CreateWorkshopPayload,
  UpdateWorkshopPlanPayload,
  UpdateWorkshopStatusPayload,
  WorkshopSummary,
} from "@/interfaces/platformAdmin.interface";
import {
  PLATFORM_ADMIN_ERROR_CODES,
  PLATFORM_ADMIN_SECURITY,
  PLATFORM_ADMIN_TEXT,
} from "@/constants/platformAdmin.constant";
import { ApiError } from "@/utils/handlers/apiError.handler";
import { createWorkshopSlug } from "@/utils/workshopSlug.util";
import { SaasPlanRepository } from "@/server/repositories/saasPlan.repository";
import { SAAS_PLAN_TEXT } from "@/constants/saasPlan.constant";
import { AccessIdentityRepository } from "@/server/repositories/accessIdentity.repository";

export class PlatformWorkshopService {
  static async listWorkshops(): Promise<WorkshopSummary[]> {
    const workshops = await PlatformWorkshopRepository.findAll();
    return workshops.map((workshop) => this.toSummary(workshop));
  }

  static async createWorkshop(payload: CreateWorkshopPayload, adminId: string): Promise<WorkshopSummary> {
    const [plan, usernameTaken] = await Promise.all([
      this.requireActivePlan(payload.planId),
      AccessIdentityRepository.isUsernameTaken(payload.ownerUsername),
    ]);
    if (usernameTaken) {
      throw new ApiError({
        status: httpStatus.CONFLICT,
        message: PLATFORM_ADMIN_TEXT.ownerUsernameExists,
      });
    }
    const ownerPasswordHash = await bcrypt.hash(
      payload.ownerPassword,
      PLATFORM_ADMIN_SECURITY.passwordSaltRounds
    );
    const subscriptionStatus =
      payload.subscriptionStatus === "ACTIVE" ? SubscriptionStatus.ACTIVE : SubscriptionStatus.TRIAL;

    try {
      const workshop = await PlatformWorkshopRepository.create({
        adminId,
        workshopName: payload.workshopName,
        workshopSlug: createWorkshopSlug(payload.workshopName),
        ownerName: payload.ownerName,
        ownerUsername: payload.ownerUsername,
        ownerPasswordHash,
        planId: plan.id,
        agreedPrice: new Prisma.Decimal(payload.agreedPrice),
        currency: plan.currency,
        billingPeriod: plan.billingPeriod,
        subscriptionStatus,
      });
      return this.toSummary(workshop);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === PLATFORM_ADMIN_ERROR_CODES.uniqueConstraint
      ) {
        throw new ApiError({ status: httpStatus.CONFLICT, message: PLATFORM_ADMIN_TEXT.ownerUsernameExists });
      }
      throw error;
    }
  }

  static async updateWorkshopStatus(
    workshopId: string,
    payload: UpdateWorkshopStatusPayload,
    adminId: string
  ): Promise<WorkshopSummary> {
    const existingWorkshop = await PlatformWorkshopRepository.findById(workshopId);
    if (!existingWorkshop) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: PLATFORM_ADMIN_TEXT.workshopNotFound });
    }
    if (existingWorkshop.status === payload.status) {
      return this.toSummary(existingWorkshop);
    }

    const subscription = existingWorkshop.subscription;
    if (!subscription) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: PLATFORM_ADMIN_TEXT.workshopNotFound });
    }
    const lifecycle = buildWorkshopLifecycleUpdate(
      payload.status,
      subscription.status,
      subscription.resumeStatus
    );
    const workshop = await PlatformWorkshopRepository.updateLifecycle({
      workshopId,
      adminId,
      workshopStatus: lifecycle.workshopStatus,
      technicianStatus: lifecycle.technicianStatus,
      subscriptionStatus: lifecycle.subscriptionStatus,
      auditAction: lifecycle.auditAction,
      revokeTechnicianSessions: lifecycle.revokeTechnicianSessions,
      resumeStatus: lifecycle.resumeStatus,
    });
    return this.toSummary(workshop);
  }

  static async updateWorkshopPlan(
    workshopId: string,
    payload: UpdateWorkshopPlanPayload,
    adminId: string
  ): Promise<WorkshopSummary> {
    const [workshop, plan] = await Promise.all([
      PlatformWorkshopRepository.findById(workshopId),
      this.requireActivePlan(payload.planId),
    ]);
    if (!workshop?.subscription) {
      throw new ApiError({
        status: httpStatus.NOT_FOUND,
        message: PLATFORM_ADMIN_TEXT.workshopNotFound,
      });
    }

    const updatedWorkshop = await PlatformWorkshopRepository.updatePlan({
      workshopId,
      adminId,
      previousPlanId: workshop.subscription.planId,
      planId: plan.id,
      agreedPrice: new Prisma.Decimal(payload.agreedPrice),
      currency: plan.currency,
      billingPeriod: plan.billingPeriod,
    });
    return this.toSummary(updatedWorkshop);
  }

  private static toSummary(workshop: WorkshopWithAdminRelations): WorkshopSummary {
    const owner = workshop.technicians[0];
    if (!owner || !workshop.subscription?.plan) {
      throw new ApiError({ message: PLATFORM_ADMIN_TEXT.internalError, isOperational: false });
    }

    return {
      id: workshop.id,
      name: workshop.name,
      slug: workshop.slug,
      status: workshop.status,
      plan: {
        id: workshop.subscription.plan.id,
        code: workshop.subscription.plan.code,
        name: workshop.subscription.plan.name,
        isActive: workshop.subscription.plan.isActive,
      },
      subscriptionStatus: workshop.subscription.status,
      agreedPrice: workshop.subscription.agreedPrice.toFixed(2),
      currency: workshop.subscription.currency,
      billingPeriod: workshop.subscription.billingPeriod,
      createdAt: workshop.createdAt.toISOString(),
      owner: {
        id: owner.id,
        displayName: owner.displayName,
        username: owner.username,
        status: owner.status,
      },
    };
  }

  private static async requireActivePlan(planId: string) {
    const plan = await SaasPlanRepository.findById(planId);
    if (!plan) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: SAAS_PLAN_TEXT.planNotFound });
    }
    if (!plan.isActive) {
      throw new ApiError({ status: httpStatus.CONFLICT, message: SAAS_PLAN_TEXT.inactivePlan });
    }
    return plan;
  }
}
