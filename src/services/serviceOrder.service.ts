import clientAxios from "@/utils/clientAxios.util";
import { ServiceOrderStatus, ProductType } from "@prisma/client";

export interface CreateServiceOrderDTO {
  clientName: string;
  clientPhone: string;
  deviceModel: string;
  deviceIssue: string;
  notes?: string;
  clientId?: string;
  deliveryDate?: Date;
  advancePayment?: number;
  balance?: number;
  products?: {
    productName: string;
    productType: ProductType;
    unitPrice: number;
  }[];
}

export interface UpdateServiceOrderDTO {
  clientName?: string;
  clientPhone?: string;
  deviceModel?: string;
  deviceIssue?: string;
  finalCost?: number;
  status?: ServiceOrderStatus;
  notes?: string;
  deliveryDate?: Date;
  advancePayment?: number;
  balance?: number;
  products?: {
    productName: string;
    productType: ProductType;
    unitPrice: number;
  }[];
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

export async function deleteServiceOrder(id: string) {
  const response = await clientAxios.delete(`/service-orders/${id}`);
  return response.data;
}

export async function uploadServiceOrderImage(serviceOrderId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("serviceOrderId", serviceOrderId);

  const response = await clientAxios.post("/api/service-orders/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}
