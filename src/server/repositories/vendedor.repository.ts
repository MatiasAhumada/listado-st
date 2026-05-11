import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export interface CreateVendedorData {
  username: string;
  password: string;
  companyId: string;
  branchId: string;
}

export interface UpdateVendedorData {
  username?: string;
  password?: string;
  branchId?: string;
}

export const vendedorRepository = {
  async create(data: CreateVendedorData) {
    return prisma.user.create({
      data: {
        ...data,
        role: Role.VENDEDOR,
      },
      include: {
        company: {
          select: {
            id: true,
            username: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            username: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  async findByCompanyId(companyId: string) {
    return prisma.user.findMany({
      where: {
        companyId,
        role: Role.VENDEDOR,
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    });
  },

  async update(id: string, data: UpdateVendedorData) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        company: {
          select: {
            id: true,
            username: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  },
};
