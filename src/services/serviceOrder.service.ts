import clientAxios from "@/utils/clientAxios.util";
import { ServiceOrderStatus, ServiceType } from "@prisma/client";

export interface ServiceOrderItemDTO {
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

export interface CreateServiceOrderDTO {
  clientName: string;
  clientPhone: string;
  notes?: string;
  clientId?: string;
  deliveryDate?: Date;
  advancePayment?: number;
  balance?: number;
  items?: ServiceOrderItemDTO[];
}

export interface UpdateServiceOrderDTO {
  clientName?: string;
  clientPhone?: string;
  status?: ServiceOrderStatus;
  deliveryDate?: Date;
  advancePayment?: number;
  balance?: number;
  branchId?: string;
  items?: ServiceOrderItemDTO[];
}

export interface PatchServiceOrderDTO {
  status: ServiceOrderStatus;
}

export async function createServiceOrder(data: CreateServiceOrderDTO) {
  const response = await clientAxios.post("/service-orders", data);
  return response.data;
}

export async function getServiceOrders() {
  const response = await clientAxios.get("/service-orders");
  return response.data;
}

export async function getServiceOrderById(id: string) {
  const response = await clientAxios.get(`/service-orders/${id}`);
  return response.data;
}

export async function updateServiceOrder(id: string, data: UpdateServiceOrderDTO) {
  const response = await clientAxios.put(`/service-orders/${id}`, data);
  return response.data;
}

export async function patchServiceOrder(id: string, data: PatchServiceOrderDTO) {
  const response = await clientAxios.patch(`/service-orders/${id}`, data);
  return response.data;
}

export async function deleteServiceOrder(id: string) {
  const response = await clientAxios.delete(`/service-orders/${id}`);
  return response.data;
}
