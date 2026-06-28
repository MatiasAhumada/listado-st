import prisma from "@/lib/prisma";
import { ServiceOrderStatus, ServiceType, PaymentMethod } from "@prisma/client";

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
  paymentMethod?: PaymentMethod;
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
  paymentMethod?: PaymentMethod;
  realTechCost?: number;
  items?: ServiceOrderItemData[];
}

const includeAll = {
  images: true,
  items: true,
  statusHistory: {
    orderBy: { occurredAt: "asc" as const },
  },
  branch: {
    select: { id: true, name: true },
  },
  client: {
    select: { id: true, fullName: true, dni: true, phone: true, address: true },
  },
  company: {
    select: { id: true, username: true, role: true },
  },
  seller: {
    select: { id: true, username: true },
  },
} as const;

function buildItemSnapshot(p: ServiceOrderItemData) {
  const unitCostCompany = p.unitCostCompany ?? 0;
  const unitCostTech = p.unitCostTech ?? 0;
  const unitTechMargin = unitCostCompany - unitCostTech;
  return {
    serviceName: p.serviceName,
    serviceType: p.serviceType,
    unitPrice: p.unitPrice,
    totalPrice: p.unitPrice,
    unitCostTech,
    totalCostTech: unitCostTech,
    unitCostCompany,
    totalCostCompany: unitCostCompany,
    unitTechMargin,
    totalTechMargin: unitTechMargin,
    cashPrice: p.cashPrice ?? p.unitPrice,
    creditPrice: p.creditPrice ?? p.unitPrice,
    isDry: p.isDry ?? false,
    hasImpact: p.hasImpact ?? false,
    isBrokenScreen: p.isBrokenScreen ?? false,
    isTurnedOn: p.isTurnedOn ?? false,
    isCharging: p.isCharging ?? false,
    color: p.color,
    description: p.description,
  };
}

type ItemSnapshot = ReturnType<typeof buildItemSnapshot>;

function computeOrderTotals(
  snapshots: ItemSnapshot[],
  paymentMethod: PaymentMethod | null | undefined,
  realTechCost: number,
) {
  const totalClientPrice = snapshots.reduce(
    (sum, item) => sum + (paymentMethod === PaymentMethod.CREDIT ? item.creditPrice : item.cashPrice),
    0,
  );
  const totalCompanyCost = snapshots.reduce((sum, item) => sum + item.totalCostCompany, 0);
  const totalTechMargin = totalCompanyCost - realTechCost;
  return { totalClientPrice, totalCompanyCost, totalTechMargin };
}

const statusTimestamps: Partial<Record<ServiceOrderStatus, object>> = {
  [ServiceOrderStatus.RETIRADO_POR_TECNICO]: { pickedUpAt: new Date() },
  [ServiceOrderStatus.DEVUELTO_POR_TECNICO]: { returnedAt: new Date() },
  [ServiceOrderStatus.ENTREGADO_CLIENTE]: { deliveredAt: new Date() },
  [ServiceOrderStatus.COBRADO_CLIENTE]: { paidAt: new Date() },
  [ServiceOrderStatus.COBRADO_TECNICO]: { techPaidAt: new Date() },
};

export const serviceOrderRepository = {
  async create(data: CreateServiceOrderData) {
    const { items, paymentMethod, ...orderData } = data;
    const snapshots = items ? items.map(buildItemSnapshot) : [];
    const totals = computeOrderTotals(snapshots, paymentMethod, 0);

    return prisma.$transaction(async (tx) => {
      const order = await tx.serviceOrder.create({
        data: {
          ...orderData,
          paymentMethod,
          ...totals,
          items: snapshots.length ? { create: snapshots } : undefined,
          statusHistory: {
            create: { status: ServiceOrderStatus.RECEPCIONADO, occurredAt: new Date() },
          },
        },
        include: includeAll,
      });

      return order;
    });
  },

  async findAll() {
    return prisma.serviceOrder.findMany({
      include: includeAll,
      orderBy: { createdAt: "desc" },
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
      orderBy: { createdAt: "desc" },
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
      where: { companyId: vendedor.companyId, branchId: vendedor.branchId },
      include: includeAll,
      orderBy: { createdAt: "desc" },
    });
  },

  async update(id: string, data: UpdateServiceOrderData) {
    const { items, status, paymentMethod, realTechCost, ...updateData } = data;
    const timestampUpdate = status ? statusTimestamps[status] : undefined;

    return prisma.$transaction(async (tx) => {
      type TotalsUpdate = { totalClientPrice?: number; totalCompanyCost?: number; totalTechMargin?: number };
      let totalsUpdate: TotalsUpdate = {};

      if (items) {
        const existing = await tx.serviceOrder.findUnique({
          where: { id },
          select: { paymentMethod: true, realTechCost: true },
        });
        const effectivePaymentMethod = paymentMethod ?? existing?.paymentMethod;
        const effectiveRealTechCost = realTechCost ?? existing?.realTechCost ?? 0;
        const snapshots = items.map(buildItemSnapshot);

        await tx.serviceOrderItem.deleteMany({ where: { serviceOrderId: id } });
        await tx.serviceOrderItem.createMany({ data: snapshots.map((s) => ({ ...s, serviceOrderId: id })) });

        totalsUpdate = computeOrderTotals(snapshots, effectivePaymentMethod, effectiveRealTechCost);
      } else {
        const needsRecalc = paymentMethod !== undefined || realTechCost !== undefined;

        if (needsRecalc) {
          const existing = await tx.serviceOrder.findUnique({
            where: { id },
            select: { paymentMethod: true, realTechCost: true, totalCompanyCost: true },
          });
          const effectiveRealTechCost = realTechCost ?? existing?.realTechCost ?? 0;
          const effectiveTotalCompanyCost = existing?.totalCompanyCost ?? 0;

          totalsUpdate.totalTechMargin = effectiveTotalCompanyCost - effectiveRealTechCost;

          if (paymentMethod) {
            const effectivePaymentMethod = paymentMethod ?? existing?.paymentMethod;
            const existingItems = await tx.serviceOrderItem.findMany({ where: { serviceOrderId: id } });
            totalsUpdate.totalClientPrice = existingItems.reduce(
              (sum, item) => sum + (effectivePaymentMethod === PaymentMethod.CREDIT ? item.creditPrice : item.cashPrice),
              0,
            );
          }
        }
      }

      const updated = await tx.serviceOrder.update({
        where: { id },
        data: {
          ...updateData,
          status,
          paymentMethod,
          realTechCost,
          ...timestampUpdate,
          ...totalsUpdate,
        },
        include: includeAll,
      });

      if (status) {
        await tx.serviceOrderStatusHistory.create({
          data: { serviceOrderId: id, status, occurredAt: new Date() },
        });
      }

      return updated;
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

    return prisma.serviceOrder.delete({ where: { id } });
  },

  async addImage(serviceOrderId: string, url: string) {
    return prisma.serviceOrderImage.create({ data: { serviceOrderId, url } });
  },

  async deleteImage(imageId: string) {
    return prisma.serviceOrderImage.delete({ where: { id: imageId } });
  },
};
