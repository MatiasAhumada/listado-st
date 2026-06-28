import prisma from "@/lib/prisma";
import { ServiceOrderStatus, ServiceType } from "@prisma/client";

export interface ServiceOrderItemData {
  serviceName: string;
  serviceType: ServiceType;
  unitPrice: number;
  cashPrice?: number;
  creditPrice?: number;
  unitCostTech?: number;
  unitCostCompany?: number;
  isDry?: boolean;
  hasImpact?: boolean;
  isBrokenScreen?: boolean;
  isTurnedOn?: boolean;
  isCharging?: boolean;
  color?: string;
  description?: string;
}

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
  items?: ServiceOrderItemData[];
}

export interface UpdateServiceOrderData {
  clientName?: string;
  clientPhone?: string;
  status?: ServiceOrderStatus;
  deliveryDate?: Date;
  advancePayment?: number;
  balance?: number;
  branchId?: string;
  items?: ServiceOrderItemData[];
}

const includeAll = {
  images: true,
  items: true,
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
} as const;

export const serviceOrderRepository = {
  async create(data: CreateServiceOrderData) {
    const { items, ...orderData } = data;

    return prisma.serviceOrder.create({
      data: {
        ...orderData,
        items: items
          ? {
              create: items.map((p) => ({
                serviceName: p.serviceName,
                serviceType: p.serviceType,
                unitPrice: p.unitPrice,
                totalPrice: p.unitPrice,
                unitCostTech: p.unitCostTech ?? 0,
                totalCostTech: p.unitCostTech ?? 0,
                unitCostCompany: p.unitCostCompany ?? 0,
                totalCostCompany: p.unitCostCompany ?? 0,
                cashPrice: p.cashPrice ?? p.unitPrice,
                creditPrice: p.creditPrice ?? p.unitPrice,
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
      include: includeAll,
    });
  },

  async findAll() {
    return prisma.serviceOrder.findMany({
      include: includeAll,
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async findById(id: string) {
    return prisma.serviceOrder.findUnique({
      where: { id },
      include: includeAll,
    });
  },

  async findByCompanyId(companyId: string) {
    return prisma.serviceOrder.findMany({
      where: { companyId },
      include: includeAll,
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
      include: includeAll,
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async update(id: string, data: UpdateServiceOrderData) {
    const { items, status, ...updateData } = data;
    const finalUpdateData = { ...updateData, status };

    const timestamps: Partial<Record<ServiceOrderStatus, object>> = {
      [ServiceOrderStatus.RETIRADO_POR_TECNICO]: { pickedUpAt: new Date() },
      [ServiceOrderStatus.DEVUELTO_POR_TECNICO]: { returnedAt: new Date() },
      [ServiceOrderStatus.ENTREGADO_CLIENTE]: { deliveredAt: new Date() },
      [ServiceOrderStatus.COBRADO_CLIENTE]: { paidAt: new Date() },
      [ServiceOrderStatus.COBRADO_TECNICO]: { techPaidAt: new Date() },
    };

    const timestampUpdate = status ? timestamps[status] : undefined;
    if (timestampUpdate) {
      Object.assign(finalUpdateData, timestampUpdate);
    }

    if (items) {
      await prisma.serviceOrderItem.deleteMany({
        where: { serviceOrderId: id },
      });

      Object.assign(finalUpdateData, {
        items: {
          create: items.map((p) => ({
            serviceName: p.serviceName,
            serviceType: p.serviceType,
            unitPrice: p.unitPrice,
            totalPrice: p.unitPrice,
            unitCostTech: p.unitCostTech ?? 0,
            totalCostTech: p.unitCostTech ?? 0,
            unitCostCompany: p.unitCostCompany ?? 0,
            totalCostCompany: p.unitCostCompany ?? 0,
            cashPrice: p.cashPrice ?? p.unitPrice,
            creditPrice: p.creditPrice ?? p.unitPrice,
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
      include: includeAll,
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
