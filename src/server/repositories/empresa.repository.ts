import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export interface CreateEmpresaData {
  username: string;
  password: string;
}

export interface UpdateEmpresaData {
  username?: string;
  password?: string;
}

export const empresaRepository = {
  async findAll() {
    return prisma.user.findMany({
      where: { role: Role.EMPRESA },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            vendedores: true,
            branches: true,
            companyServiceOrders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.user.findFirst({
      where: { id, role: Role.EMPRESA },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });
  },

  async findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  },

  async create(data: CreateEmpresaData) {
    return prisma.user.create({
      data: { ...data, role: Role.EMPRESA },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });
  },

  async update(id: string, data: UpdateEmpresaData) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        role: true,
      },
    });
  },

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  },
};
