import prisma from "@/lib/prisma";
import { ServiceOrderStatus } from "@prisma/client";

export interface CreateServiceOrderData {
  clientName: string;
  clientPhone: string;
  deviceModel: string;
  deviceIssue: string;
  estimatedCost: number;
  notes?: string;
  companyId: string;
}

export interface UpdateServiceOrderData {
  clientName?: string;
  clientPhone?: string;
  deviceModel?: string;
  deviceIssue?: string;
  estimatedCost?: number;
  finalCost?: number;
  status?: ServiceOrderStatus;
  notes?: string;
}

export const serviceOrderRepository = {
  async create(data: CreateServiceOrderData) {
    return prisma.serviceOrder.create({
      data,
      include: {
        images: true,
        company: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });
  },

  async findById(id: string) {
    return prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        images: true,
        company: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });
  },

  async findByCompanyId(companyId: string) {
    return prisma.serviceOrder.findMany({
      where: { companyId },
      include: {
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async findByVendedor(vendedorId: string) {
    const vendedor = await prisma.user.findUnique({
      where: { id: vendedorId },
      select: { companyId: true },
    });

    if (!vendedor?.companyId) {
      return [];
    }

    return prisma.serviceOrder.findMany({
      where: { companyId: vendedor.companyId },
      include: {
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async update(id: string, data: UpdateServiceOrderData) {
    const updateData: Record<string, unknown> = { ...data };

    if (data.status === ServiceOrderStatus.RETIRADO_POR_TECNICO) {
      updateData.pickedUpAt = new Date();
    }
    if (data.status === ServiceOrderStatus.DEVUELTO_POR_TECNICO) {
      updateData.returnedAt = new Date();
    }
    if (data.status === ServiceOrderStatus.ENTREGADO_A_CLIENTE) {
      updateData.deliveredAt = new Date();
    }
    if (data.status === ServiceOrderStatus.COBRADO) {
      updateData.paidAt = new Date();
    }

    return prisma.serviceOrder.update({
      where: { id },
      data: updateData,
      include: {
        images: true,
        company: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });
  },

  async delete(id: string) {
    return prisma.serviceOrder.delete({
      where: { id },
    });
  },

  async addImage(serviceOrderId: string, url: string) {
    return prisma.serviceOrderImage.create({
      data: {
        serviceOrderId,
        url,
      },
    });
  },

  async deleteImage(imageId: string) {
    return prisma.serviceOrderImage.delete({
      where: { id: imageId },
    });
  },
};
