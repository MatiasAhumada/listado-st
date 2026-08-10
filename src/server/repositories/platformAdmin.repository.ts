import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { CreatePlatformSessionPersistence } from "@/interfaces/platformPersistence.interface";

export type PlatformSessionWithAdmin = Prisma.PlatformAdminSessionGetPayload<{
  include: { admin: true };
}>;

export class PlatformAdminRepository {
  static async findByEmail(email: string) {
    return prisma.platformAdmin.findUnique({ where: { email } });
  }

  static async createSession(payload: CreatePlatformSessionPersistence) {
    return prisma.$transaction([
      prisma.platformAdminSession.create({
        data: {
          adminId: payload.adminId,
          tokenHash: payload.tokenHash,
          expiresAt: payload.expiresAt,
        },
      }),
      prisma.platformAdmin.update({
        where: { id: payload.adminId },
        data: { lastLoginAt: new Date() },
      }),
    ]);
  }

  static async findValidSession(tokenHash: string, currentDate: Date): Promise<PlatformSessionWithAdmin | null> {
    return prisma.platformAdminSession.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: currentDate },
        admin: { isActive: true },
      },
      include: { admin: true },
    });
  }

  static async revokeSession(tokenHash: string) {
    return prisma.platformAdminSession.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
