import prisma from "@/lib/prisma";

export interface CreateClientData {
  fullName: string;
  dni: string;
  phone?: string;
  email?: string;
  address?: string;
  companyId: string;
}

export interface UpdateClientData {
  fullName?: string;
  dni?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export const clientRepository = {
  async create(data: CreateClientData) {
    return prisma.client.create({
      data,
    });
  },

  async findById(id: string) {
    return prisma.client.findUnique({
      where: { id },
    });
  },

  async findByCompanyId(companyId: string) {
    return prisma.client.findMany({
      where: { companyId },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async findByDni(companyId: string, dni: string) {
    return prisma.client.findUnique({
      where: {
        companyId_dni: {
          companyId,
          dni,
        },
      },
    });
  },

  async search(companyId: string, query: string) {
    return prisma.client.findMany({
      where: {
        companyId,
        OR: [
          { fullName: { contains: query, mode: "insensitive" } },
          { dni: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: {
        fullName: "asc",
      },
      take: 10,
    });
  },

  async update(id: string, data: UpdateClientData) {
    return prisma.client.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.client.delete({
      where: { id },
    });
  },
};
