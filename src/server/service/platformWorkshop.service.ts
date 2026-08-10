import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { Prisma, SubscriptionStatus } from "@prisma/client";
import { PlatformWorkshopRepository, WorkshopWithAdminRelations } from "@/server/repositories/platformWorkshop.repository";
import { buildWorkshopLifecycleUpdate } from "@/server/domain/workshopLifecycle.domain";
import {
  CreateWorkshopPayload,
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

export class PlatformWorkshopService {
  static async listWorkshops(): Promise<WorkshopSummary[]> {
    const workshops = await PlatformWorkshopRepository.findAll();
    return workshops.map((workshop) => this.toSummary(workshop));
  }

  static async createWorkshop(payload: CreateWorkshopPayload, adminId: string): Promise<WorkshopSummary> {
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
        ownerEmail: payload.ownerEmail,
        ownerPasswordHash,
        subscriptionStatus,
      });
      return this.toSummary(workshop);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === PLATFORM_ADMIN_ERROR_CODES.uniqueConstraint
      ) {
        throw new ApiError({ status: httpStatus.CONFLICT, message: PLATFORM_ADMIN_TEXT.ownerEmailExists });
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

    const lifecycle = buildWorkshopLifecycleUpdate(payload.status);
    const workshop = await PlatformWorkshopRepository.updateLifecycle({
      workshopId,
      adminId,
      workshopStatus: lifecycle.workshopStatus,
      technicianStatus: lifecycle.technicianStatus,
      subscriptionStatus: lifecycle.subscriptionStatus,
      auditAction: lifecycle.auditAction,
    });
    return this.toSummary(workshop);
  }

  private static toSummary(workshop: WorkshopWithAdminRelations): WorkshopSummary {
    const owner = workshop.technicians[0];
    if (!owner || !workshop.subscription) {
      throw new ApiError({ message: PLATFORM_ADMIN_TEXT.internalError, isOperational: false });
    }

    return {
      id: workshop.id,
      name: workshop.name,
      slug: workshop.slug,
      status: workshop.status,
      planCode: workshop.subscription.planCode,
      subscriptionStatus: workshop.subscription.status,
      createdAt: workshop.createdAt.toISOString(),
      owner: {
        id: owner.id,
        displayName: owner.displayName,
        email: owner.email,
        status: owner.status,
      },
    };
  }
}
