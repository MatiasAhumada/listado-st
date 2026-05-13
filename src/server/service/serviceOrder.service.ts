import {
  serviceOrderRepository,
  CreateServiceOrderData,
  UpdateServiceOrderData,
} from "@/server/repositories/serviceOrder.repository";
import { ApiError } from "@/utils/handlers/apiError.handler";
import httpStatus from "http-status";

const ROLE_TECNICO = "TECNICO";
const ROLE_EMPRESA = "EMPRESA";
const ROLE_VENDEDOR = "VENDEDOR";

export const serviceOrderService = {
  async createServiceOrder(data: CreateServiceOrderData) {
    return serviceOrderRepository.create(data);
  },

  async getServiceOrderById(id: string) {
    const order = await serviceOrderRepository.findById(id);

    if (!order) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: "Orden de servicio no encontrada" });
    }

    return order;
  },

  async getServiceOrdersByCompany(companyId: string) {
    return serviceOrderRepository.findByCompanyId(companyId);
  },

  async getServiceOrdersByUser(userId: string, userRole: string) {
    if (userRole === ROLE_TECNICO) {
      return serviceOrderRepository.findAll();
    }

    if (userRole === ROLE_EMPRESA) {
      return serviceOrderRepository.findByCompanyId(userId);
    }

    if (userRole === ROLE_VENDEDOR) {
      return serviceOrderRepository.findByVendedor(userId);
    }

    return [];
  },

  async updateServiceOrder(id: string, data: UpdateServiceOrderData) {
    const exists = await serviceOrderRepository.findById(id);

    if (!exists) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: "Orden de servicio no encontrada" });
    }

    return serviceOrderRepository.update(id, data);
  },

  async deleteServiceOrder(id: string) {
    const exists = await serviceOrderRepository.findById(id);

    if (!exists) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: "Orden de servicio no encontrada" });
    }

    return serviceOrderRepository.delete(id);
  },

  async addImageToOrder(serviceOrderId: string, url: string) {
    const exists = await serviceOrderRepository.findById(serviceOrderId);

    if (!exists) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: "Orden de servicio no encontrada" });
    }

    return serviceOrderRepository.addImage(serviceOrderId, url);
  },

  async deleteImageFromOrder(imageId: string) {
    return serviceOrderRepository.deleteImage(imageId);
  },
};
