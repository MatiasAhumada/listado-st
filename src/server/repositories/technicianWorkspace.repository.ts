import prisma from "@/lib/prisma";
import {
  TechnicianWorkspaceLookup,
  TechnicianWorkspacePersistence,
} from "@/interfaces/technicianPersistence.interface";

export class TechnicianWorkspaceRepository {
  static async findForIdentity(
    lookup: TechnicianWorkspaceLookup
  ): Promise<TechnicianWorkspacePersistence | null> {
    return prisma.workshop.findFirst({
      where: {
        id: lookup.workshopId,
        technicians: {
          some: {
            id: lookup.technicianId,
            workshopId: lookup.workshopId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        subscription: {
          select: {
            planCode: true,
            status: true,
          },
        },
        technicians: {
          where: { id: lookup.technicianId },
          take: 1,
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });
  }
}
