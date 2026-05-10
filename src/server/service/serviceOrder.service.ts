import { serviceOrderRepository, CreateServiceOrderData, UpdateServiceOrderData } from "@/server/repositories/serviceOrder.repository";

export const serviceOrderService = {
  async createServiceOrder(data: CreateServiceOrderData) {
    return serviceOrderRepository.create(data);
  },

  async getServiceOrderById(id: string) {
    const order = await serviceOrderRepository.findById(id);
    
    if (!order) {
      throw new Error("Orden de servicio no encontrada");
    }

    return order;
  },

  async getServiceOrdersByCompany(companyId: string) {
    return serviceOrderRepository.findByCompanyId(companyId);
  },

  async updateServiceOrder(id: string, data: UpdateServiceOrderData) {
    const exists = await serviceOrderRepository.findById(id);
    
    if (!exists) {
      throw new Error("Orden de servicio no encontrada");
    }

    return serviceOrderRepository.update(id, data);
  },

  async deleteServiceOrder(id: string) {
    const exists = await serviceOrderRepository.findById(id);
    
    if (!exists) {
      throw new Error("Orden de servicio no encontrada");
    }

    return serviceOrderRepository.delete(id);
  },

  async addImageToOrder(serviceOrderId: string, url: string) {
    const exists = await serviceOrderRepository.findById(serviceOrderId);
    
    if (!exists) {
      throw new Error("Orden de servicio no encontrada");
    }

    return serviceOrderRepository.addImage(serviceOrderId, url);
  },

  async deleteImageFromOrder(imageId: string) {
    return serviceOrderRepository.deleteImage(imageId);
  },
};
