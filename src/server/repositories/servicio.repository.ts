import { prisma } from "@/lib/prisma";
import { Prisma, ServiceType, Role } from "@prisma/client";

export type UserRole = Role | "TECNICO";

export class ServicioRepository {
  static async findAll(userRole: UserRole, userId: string, filters?: { type?: string; search?: string }) {
    const where: Prisma.ServicioWhereInput = {};

    if (filters?.type && filters.type !== "TODOS") {
      where.type = filters.type as ServiceType;
    }

    if (filters?.search) {
      where.name = { contains: filters.search, mode: "insensitive" };
    }

    if (userRole === "VENDEDOR") {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });

      if (!user?.companyId) {
        return [];
      }

      where.companyId = user.companyId;
      return prisma.servicio.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          type: true,
          available: true,
          cost: true,
          cash: true,
          credit: true,
          createdAt: true,
          updatedAt: true,
          companyId: true,
        },
      });
    }

    if (userRole === "TECNICO") {
      where.companyId = null;
      return prisma.servicio.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          type: true,
          available: true,
          costTech: true,
          costTechMargin: true,
          cost: true,
          costMargin: true,
          cash: true,
          cashMargin: true,
          credit: true,
          creditMargin: true,
          createdAt: true,
          updatedAt: true,
          companyId: true,
        },
      });
    }

    where.companyId = userId;
    return prisma.servicio.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        type: true,
        available: true,
        costTech: true,
        costTechMargin: true,
        cost: true,
        costMargin: true,
        cash: true,
        cashMargin: true,
        credit: true,
        creditMargin: true,
        createdAt: true,
        updatedAt: true,
        companyId: true,
      },
    });
  }

  static async create(data: Prisma.ServicioCreateInput) {
    return prisma.servicio.create({
      data,
    });
  }

  static async update(id: string, data: Prisma.ServicioUpdateInput) {
    return prisma.servicio.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.servicio.delete({
      where: { id },
    });
  }

  static async findById(id: string) {
    return prisma.servicio.findUnique({
      where: { id },
    });
  }

  static async findByName(name: string) {
    return prisma.servicio.findFirst({
      where: {
        name,
        companyId: null,
      },
    });
  }

  static async findAllEmpresas() {
    return prisma.user.findMany({
      where: { role: "EMPRESA" },
      select: { id: true },
    });
  }

  static async updateCopiasCost(masterServicioId: string, newCost: number) {
    return prisma.servicio.updateMany({
      where: { masterServicioId },
      data: { cost: newCost },
    });
  }

  static async updateCopiasAllFields(
    masterServicioId: string,
    data: {
      costTech: number;
      costTechMargin: number;
      cost: number;
      costMargin: number;
      cash: number;
      cashMargin: number;
      credit: number;
      creditMargin: number;
    }
  ) {
    return prisma.servicio.updateMany({
      where: { masterServicioId },
      data,
    });
  }

  static async findCostByNames(names: string[], companyId: string) {
    const servicios = await prisma.servicio.findMany({
      where: {
        name: { in: names },
        companyId,
      },
      select: {
        name: true,
        cost: true,
      },
    });

    const totalCost = servicios.reduce((sum, s) => sum + s.cost, 0);

    return {
      servicios,
      totalCost,
    };
  }
}
