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
    const order = await serviceOrderRepository.findById(id);

    if (!order) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: "Orden de servicio no encontrada" });
    }

    const deletedOrder = await serviceOrderRepository.delete(id);

    if (deletedOrder && order.images.length > 0) {
      const { r2StorageService } = await import("./r2Storage.service");
      const folderName = r2StorageService.generateFolderName(order.clientName, order.createdAt);
      try {
        await r2StorageService.deleteServiceOrderFolder(folderName);
      } catch (error) {
        console.error("Error al eliminar carpeta de R2:", error);
      }
    }

    return deletedOrder;
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
