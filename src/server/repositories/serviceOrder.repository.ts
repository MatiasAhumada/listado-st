import prisma from "@/lib/prisma";
import { ServiceOrderStatus, ProductType } from "@prisma/client";

export interface CreateServiceOrderData {
  clientName: string;
  clientPhone: string;
  notes?: string;
  companyId: string;
  sellerId?: string;
  branchId?: string;
  clientId?: string;
  deliveryDate?: Date;
  advancePayment?: number;
  balance?: number;
  products?: {
    productName: string;
    productType: ProductType;
    unitPrice: number;
    isDry?: boolean;
    hasImpact?: boolean;
    isBrokenScreen?: boolean;
    isTurnedOn?: boolean;
    isCharging?: boolean;
    color?: string;
    description?: string;
  }[];
}

export interface UpdateServiceOrderData {
  clientName?: string;
  clientPhone?: string;
  status?: ServiceOrderStatus;
  deliveryDate?: Date;
  advancePayment?: number;
  balance?: number;
  products?: {
    productName: string;
    productType: ProductType;
    unitPrice: number;
    isDry?: boolean;
    hasImpact?: boolean;
    isBrokenScreen?: boolean;
    isTurnedOn?: boolean;
    isCharging?: boolean;
    color?: string;
    description?: string;
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
                isDry: p.isDry ?? false,
                hasImpact: p.hasImpact ?? false,
                isBrokenScreen: p.isBrokenScreen ?? false,
                isTurnedOn: p.isTurnedOn ?? false,
                isCharging: p.isCharging ?? false,
                color: p.color,
                description: p.description,
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
        client: {
          select: {
            id: true,
            fullName: true,
            dni: true,
            phone: true,
            address: true,
          },
        },
        company: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  },

  async findAll() {
    return prisma.serviceOrder.findMany({
      include: {
        images: true,
        products: true,
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        client: {
          select: {
            id: true,
            fullName: true,
            dni: true,
            phone: true,
            address: true,
          },
        },
        company: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
        seller: {
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
        client: {
          select: {
            id: true,
            fullName: true,
            dni: true,
            phone: true,
            address: true,
          },
        },
        company: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
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
        client: {
          select: {
            id: true,
            fullName: true,
            dni: true,
            phone: true,
            address: true,
          },
        },
        seller: {
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
        branchId: vendedor.branchId,
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
        client: {
          select: {
            id: true,
            fullName: true,
            dni: true,
            phone: true,
            address: true,
          },
        },
        seller: {
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

  async update(id: string, data: UpdateServiceOrderData) {
    const { products, status, ...updateData } = data;
    const finalUpdateData = { ...updateData, status };

    const timestamps: Partial<Record<ServiceOrderStatus, object>> = {
      [ServiceOrderStatus.RETIRADO_POR_TECNICO]: { pickedUpAt: new Date() },
      [ServiceOrderStatus.DEVUELTO_POR_TECNICO]: { returnedAt: new Date() },
      [ServiceOrderStatus.ENTREGADO_A_CLIENTE]: { deliveredAt: new Date() },
      [ServiceOrderStatus.COBRADO]: { paidAt: new Date() },
    };

    const timestampUpdate = status ? timestamps[status] : undefined;
    if (timestampUpdate) {
      Object.assign(finalUpdateData, timestampUpdate);
    }

    if (products) {
      await prisma.serviceOrderProduct.deleteMany({
        where: { serviceOrderId: id },
      });

      Object.assign(finalUpdateData, {
        products: {
          create: products.map((p) => ({
            productName: p.productName,
            productType: p.productType,
            unitPrice: p.unitPrice,
            totalPrice: p.unitPrice,
            isDry: p.isDry ?? false,
            hasImpact: p.hasImpact ?? false,
            isBrokenScreen: p.isBrokenScreen ?? false,
            isTurnedOn: p.isTurnedOn ?? false,
            isCharging: p.isCharging ?? false,
            color: p.color,
            description: p.description,
          })),
        },
      });
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
        client: {
          select: {
            id: true,
            fullName: true,
            dni: true,
            phone: true,
          },
        },
        company: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  },

  async delete(id: string) {
    const order = await prisma.serviceOrder.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!order) {
      return null;
    }

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
