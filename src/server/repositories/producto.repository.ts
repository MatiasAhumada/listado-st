import { prisma } from "@/lib/prisma";
import { Prisma, ProductType, ProductQuality, Role } from "@prisma/client";

export type UserRole = Role | "TECNICO";

export class ProductoRepository {
  static async findAll(
    userRole: UserRole,
    userId: string,
    filters?: { type?: string; quality?: string; search?: string }
  ) {
    const where: Prisma.ProductoWhereInput = {};

    if (filters?.type && filters.type !== "TODOS") {
      where.type = filters.type as ProductType;
    }

    if (filters?.quality && filters.quality !== "TODAS") {
      if (filters.quality === "NINGUNA") {
        where.quality = null;
      } else {
        where.quality = filters.quality as ProductQuality;
      }
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
      return prisma.producto.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          type: true,
          quality: true,
          available: true,
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
      return prisma.producto.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          type: true,
          quality: true,
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
    return prisma.producto.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        type: true,
        quality: true,
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

  static async create(data: any) {
    return prisma.producto.create({
      data,
    });
  }

  static async update(id: string, data: any) {
    return prisma.producto.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.producto.delete({
      where: { id },
    });
  }

  static async findById(id: string) {
    return prisma.producto.findUnique({
      where: { id },
    });
  }

  static async findByName(name: string) {
    return prisma.producto.findFirst({
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

  static async updateCopiasCost(masterProductId: string, newCost: number) {
    return prisma.producto.updateMany({
      where: { masterProductId },
      data: { cost: newCost },
    });
  }
}
