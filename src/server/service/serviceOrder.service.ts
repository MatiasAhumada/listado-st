import { Role, Prisma, ServiceOrderStatus } from "@prisma/client";
import {
  serviceOrderRepository,
  CreateServiceOrderData,
  UpdateServiceOrderData,
} from "@/server/repositories/serviceOrder.repository";
import { ApiError } from "@/utils/handlers/apiError.handler";
import { AuthContext, assertOwnership, getEffectiveCompanyId } from "@/server/guards/serviceOrder.guard";
import {
  IServiceOrderResponse,
  IServiceOrderForTecnico,
  IServiceOrderForOthers,
  IServiceOrderProductWithMargin,
  IServiceOrderProductBase,
} from "@/interfaces/serviceOrder.interface";
import { SERVICE_ORDER_ERRORS } from "@/constants/serviceOrder.constant";
import httpStatus from "http-status";

type ServiceOrderFull = Prisma.ServiceOrderGetPayload<{
  include: {
    images: true;
    items: true;
    statusHistory: { orderBy: { occurredAt: "asc" } };
    branch: { select: { id: true; name: true } };
    client: { select: { id: true; fullName: true; dni: true; phone: true; address: true } };
    company: { select: { id: true; username: true; role: true } };
    seller: { select: { id: true; username: true } };
  };
}>;

type PrismaItem = ServiceOrderFull["items"][number];

function toItemWithMargin(p: PrismaItem): IServiceOrderProductWithMargin {
  return {
    id: p.id,
    serviceName: p.serviceName,
    serviceType: p.serviceType,
    unitPrice: p.unitPrice,
    totalPrice: p.totalPrice,
    cashPrice: p.cashPrice,
    creditPrice: p.creditPrice,
    unitCostTech: p.unitCostTech,
    totalCostTech: p.totalCostTech,
    unitCostCompany: p.unitCostCompany,
    totalCostCompany: p.totalCostCompany,
    unitTechMargin: p.unitTechMargin,
    totalTechMargin: p.totalTechMargin,
    isDry: p.isDry,
    hasImpact: p.hasImpact,
    isBrokenScreen: p.isBrokenScreen,
    isTurnedOn: p.isTurnedOn,
    isCharging: p.isCharging,
    color: p.color,
    description: p.description,
    createdAt: p.createdAt,
    serviceOrderId: p.serviceOrderId,
    companyMargin: p.totalPrice - p.totalCostCompany,
  };
}

function toItemBase(p: PrismaItem): IServiceOrderProductBase {
  return {
    id: p.id,
    serviceName: p.serviceName,
    serviceType: p.serviceType,
    unitPrice: p.unitPrice,
    totalPrice: p.totalPrice,
    cashPrice: p.cashPrice,
    creditPrice: p.creditPrice,
    unitCostTech: p.unitCostTech,
    totalCostTech: p.totalCostTech,
    isDry: p.isDry,
    hasImpact: p.hasImpact,
    isBrokenScreen: p.isBrokenScreen,
    isTurnedOn: p.isTurnedOn,
    isCharging: p.isCharging,
    color: p.color,
    description: p.description,
    createdAt: p.createdAt,
    serviceOrderId: p.serviceOrderId,
  };
}

function transformForRole(order: ServiceOrderFull, role: Role): IServiceOrderResponse {
  const { items, ...orderBase } = order;

  if (role === Role.TECNICO) {
    const itemsWithMargin = items.map(toItemWithMargin);
    return {
      ...orderBase,
      items: itemsWithMargin,
      totalCompanyCost: order.totalCompanyCost,
      realTechCost: order.realTechCost,
      totalTechMargin: order.totalTechMargin,
      companyMargin: order.totalClientPrice - order.totalCompanyCost,
    } as IServiceOrderForTecnico;
  }

  return {
    ...orderBase,
    items: items.map(toItemBase),
  } as IServiceOrderForOthers;
}

async function triggerCobradoTecnicoIntegration(order: ServiceOrderFull): Promise<void> {
  const { gastosIntegrationService } = await import("@/server/service/gastosIntegration.service");
  gastosIntegrationService.registerTechIncome(order).catch((error: unknown) => {
    console.error("[COBRADO_TECNICO] Integration failed", {
      serviceOrderId: order.id,
      totalTechMargin: order.totalTechMargin,
      error,
    });
  });
}

export const serviceOrderService = {
  async createServiceOrder(data: CreateServiceOrderData, auth: AuthContext): Promise<IServiceOrderResponse> {
    const order = await serviceOrderRepository.create(data);
    return transformForRole(order, auth.role);
  },

  async getServiceOrderById(id: string, auth: AuthContext): Promise<IServiceOrderResponse> {
    const order = await serviceOrderRepository.findById(id);

    if (!order) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: SERVICE_ORDER_ERRORS.NOT_FOUND });
    }

    assertOwnership(order.companyId, auth);

    return transformForRole(order, auth.role);
  },

  async getServiceOrdersByUser(auth: AuthContext): Promise<IServiceOrderResponse[]> {
    let orders: ServiceOrderFull[];

    if (auth.role === Role.TECNICO) {
      orders = await serviceOrderRepository.findAll();
    } else if (auth.role === Role.EMPRESA) {
      orders = await serviceOrderRepository.findByCompanyId(auth.id);
    } else {
      orders = await serviceOrderRepository.findByVendedor(auth.id);
    }

    return orders.map((order) => transformForRole(order, auth.role));
  },

  async updateServiceOrder(id: string, data: UpdateServiceOrderData, auth: AuthContext): Promise<IServiceOrderResponse> {
    const existing = await serviceOrderRepository.findById(id);

    if (!existing) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: SERVICE_ORDER_ERRORS.NOT_FOUND });
    }

    assertOwnership(existing.companyId, auth);

    const updated = await serviceOrderRepository.update(id, data);

    if (
      data.status === ServiceOrderStatus.COBRADO_TECNICO &&
      existing.status !== ServiceOrderStatus.COBRADO_TECNICO
    ) {
      await triggerCobradoTecnicoIntegration(updated);
    }

    return transformForRole(updated, auth.role);
  },

  async patchServiceOrder(id: string, data: UpdateServiceOrderData, auth: AuthContext): Promise<IServiceOrderResponse> {
    const existing = await serviceOrderRepository.findById(id);

    if (!existing) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: SERVICE_ORDER_ERRORS.NOT_FOUND });
    }

    const effectiveCompanyId = getEffectiveCompanyId(auth);
    if (effectiveCompanyId && existing.companyId !== effectiveCompanyId) {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: SERVICE_ORDER_ERRORS.FORBIDDEN_OWNERSHIP });
    }

    const updated = await serviceOrderRepository.update(id, data);

    if (
      data.status === ServiceOrderStatus.COBRADO_TECNICO &&
      existing.status !== ServiceOrderStatus.COBRADO_TECNICO
    ) {
      await triggerCobradoTecnicoIntegration(updated);
    }

    return transformForRole(updated, auth.role);
  },

  async deleteServiceOrder(id: string, auth: AuthContext): Promise<void> {
    const order = await serviceOrderRepository.findById(id);

    if (!order) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: SERVICE_ORDER_ERRORS.NOT_FOUND });
    }

    assertOwnership(order.companyId, auth);

    await serviceOrderRepository.delete(id);

    if (order.images.length > 0) {
      const { r2StorageService } = await import("./r2Storage.service");
      const folderName = r2StorageService.generateFolderName(order.clientName, order.createdAt);
      try {
        await r2StorageService.deleteServiceOrderFolder(folderName);
      } catch {
      }
    }
  },

  async addImageToOrder(
    serviceOrderId: string,
    url: string,
    auth: AuthContext,
  ): Promise<{ id: string; url: string; uploadedAt: Date; serviceOrderId: string }> {
    const order = await serviceOrderRepository.findById(serviceOrderId);

    if (!order) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: SERVICE_ORDER_ERRORS.NOT_FOUND });
    }

    assertOwnership(order.companyId, auth);

    return serviceOrderRepository.addImage(serviceOrderId, url);
  },

  async deleteImageFromOrder(
    imageId: string,
  ): Promise<{ id: string; url: string; uploadedAt: Date; serviceOrderId: string }> {
    return serviceOrderRepository.deleteImage(imageId);
  },
};
