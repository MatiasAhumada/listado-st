import prisma from "@/lib/prisma";

export interface CreateBranchData {
  name: string;
  address?: string;
  phone?: string;
  companyId: string;
}

export interface UpdateBranchData {
  name?: string;
  address?: string;
  phone?: string;
}

export const branchRepository = {
  async create(data: CreateBranchData) {
    return prisma.branch.create({
      data,
      include: {
        company: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  },

  async findById(id: string) {
    return prisma.branch.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            username: true,
          },
        },
        vendedores: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  },

  async findByCompanyId(companyId: string) {
    return prisma.branch.findMany({
      where: { companyId },
      include: {
        vendedores: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async update(id: string, data: UpdateBranchData) {
    return prisma.branch.update({
      where: { id },
      data,
      include: {
        company: {
          select: {
            id: true,
            username: true,
          },
        },
        vendedores: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  },

  async delete(id: string) {
    return prisma.branch.delete({
      where: { id },
    });
  },
};
