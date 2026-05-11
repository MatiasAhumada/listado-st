import prisma from "@/lib/prisma";
import { ServiceOrderStatus, ProductType } from "@prisma/client";

export interface CreateServiceOrderData {
  clientName: string;
  clientPhone: string;
  deviceModel: string;
  deviceIssue: string;
  estimatedCost: number;
  notes?: string;
  companyId: string;
  branchId?: string;
  products?: {
    productName: string;
    productType: ProductType;
    unitPrice: number;
  }[];
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
  products?: {
    productName: string;
    productType: ProductType;
    unitPrice: number;
  }[];
}

export const serviceOrderRepository = {
  async create(data: CreateServiceOrderData) {
    const { products, ...orderData } = data;

    return prisma.serviceOrder.create({
      data: {
        ...orderData,
        products: products
          ? {
              create: products.map((p) => ({
                productName: p.productName,
                productType: p.productType,
                unitPrice: p.unitPrice,
                totalPrice: p.unitPrice,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        products: true,
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
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
        products: true,
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
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
        products: true,
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

  async findByVendedor(vendedorId: string) {
    const vendedor = await prisma.user.findUnique({
      where: { id: vendedorId },
      select: { companyId: true, branchId: true },
    });

    if (!vendedor?.companyId) {
      return [];
    }

    return prisma.serviceOrder.findMany({
      where: {
        companyId: vendedor.companyId,
        branchId: vendedor.branchId || undefined,
      },
      include: {
        images: true,
        products: true,
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

  async update(id: string, data: UpdateServiceOrderData) {
    const { products, ...updateData } = data;
    const finalUpdateData: Record<string, unknown> = { ...updateData };

    if (data.status === ServiceOrderStatus.RETIRADO_POR_TECNICO) {
      finalUpdateData.pickedUpAt = new Date();
    }
    if (data.status === ServiceOrderStatus.DEVUELTO_POR_TECNICO) {
      finalUpdateData.returnedAt = new Date();
    }
    if (data.status === ServiceOrderStatus.ENTREGADO_A_CLIENTE) {
      finalUpdateData.deliveredAt = new Date();
    }
    if (data.status === ServiceOrderStatus.COBRADO) {
      finalUpdateData.paidAt = new Date();
    }

    if (products) {
      await prisma.serviceOrderProduct.deleteMany({
        where: { serviceOrderId: id },
      });

      finalUpdateData.products = {
        create: products.map((p) => ({
          productName: p.productName,
          productType: p.productType,
          unitPrice: p.unitPrice,
          totalPrice: p.unitPrice,
        })),
      };
    }

    return prisma.serviceOrder.update({
      where: { id },
      data: finalUpdateData,
      include: {
        images: true,
        products: true,
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
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
