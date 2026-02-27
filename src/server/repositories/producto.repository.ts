import { prisma } from "@/lib/prisma";
import { Prisma, ProductType, ProductQuality } from "@prisma/client";

export class ProductoRepository {
  static async findAll(isVendedor: boolean, filters?: { type?: string; quality?: string; search?: string }) {
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

    if (isVendedor) {
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
          company: {
            select: { username: true },
          },
        },
      });
    }

    return prisma.producto.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        company: {
          select: { username: true },
        },
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
}

