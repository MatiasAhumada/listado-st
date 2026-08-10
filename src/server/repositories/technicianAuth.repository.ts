import {
  Prisma,
  SubscriptionStatus,
  TechnicianStatus,
  WorkshopStatus,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { CreateTechnicianSessionPersistence } from "@/interfaces/technicianPersistence.interface";

export type TechnicianWithWorkshopAccess = Prisma.TechnicianUserGetPayload<{
  include: { workshop: { include: { subscription: true } } };
}>;

export type TechnicianSessionWithAccess = Prisma.TechnicianSessionGetPayload<{
  include: {
    technician: { include: { workshop: { include: { subscription: true } } } };
  };
}>;

const technicianAccessRelations = {
  workshop: {
    include: { subscription: true },
  },
};

export class TechnicianAuthRepository {
  static async findByEmail(email: string): Promise<TechnicianWithWorkshopAccess | null> {
    return prisma.technicianUser.findUnique({
      where: { email },
      include: technicianAccessRelations,
    });
  }

  static async createSession(payload: CreateTechnicianSessionPersistence) {
    return prisma.$transaction([
      prisma.technicianSession.create({
        data: {
          technicianId: payload.technicianId,
          tokenHash: payload.tokenHash,
          expiresAt: payload.expiresAt,
        },
      }),
      prisma.technicianUser.update({
        where: { id: payload.technicianId },
        data: { lastLoginAt: new Date() },
      }),
    ]);
  }

  static async findValidSession(
    tokenHash: string,
    currentDate: Date
  ): Promise<TechnicianSessionWithAccess | null> {
    return prisma.technicianSession.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: currentDate },
        technician: {
          status: TechnicianStatus.ACTIVE,
          workshop: {
            status: WorkshopStatus.ACTIVE,
            subscription: {
              is: {
                status: { in: [SubscriptionStatus.TRIAL, SubscriptionStatus.ACTIVE] },
              },
            },
          },
        },
      },
      include: {
        technician: {
          include: technicianAccessRelations,
        },
      },
    });
  }

  static async revokeSession(tokenHash: string) {
    return prisma.technicianSession.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
