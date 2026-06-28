import { ServiceType, ServiceOrderStatus, PaymentMethod } from "@prisma/client";

export interface IServiceOrderStatusHistoryItem {
  id: string;
  serviceOrderId: string;
  status: ServiceOrderStatus;
  occurredAt: Date;
  createdAt: Date;
}

export interface IServiceOrderProductBase {
  id: string;
  serviceName: string;
  serviceType: ServiceType;
  unitPrice: number;
  totalPrice: number;
  cashPrice: number;
  creditPrice: number;
  unitCostTech: number;
  totalCostTech: number;
  isDry: boolean;
  hasImpact: boolean;
  isBrokenScreen: boolean;
  isTurnedOn: boolean;
  isCharging: boolean;
  color: string | null;
  description: string | null;
  createdAt: Date;
  serviceOrderId: string;
}

export interface IServiceOrderProductWithMargin extends IServiceOrderProductBase {
  unitCostCompany: number;
  totalCostCompany: number;
  unitTechMargin: number;
  totalTechMargin: number;
  companyMargin: number;
}

interface IServiceOrderRelations {
  images: { id: string; url: string; uploadedAt: Date; serviceOrderId: string }[];
  branch: { id: string; name: string } | null;
  client: { id: string; fullName: string; dni: string; phone: string | null; address: string | null } | null;
  company: { id: string; username: string; role: string } | null;
  seller: { id: string; username: string } | null;
  statusHistory: IServiceOrderStatusHistoryItem[];
}

interface IServiceOrderCore {
  id: string;
  clientName: string;
  clientPhone: string;
  advancePayment: number;
  balance: number;
  deliveryDate: Date | null;
  status: ServiceOrderStatus;
  paymentMethod: PaymentMethod | null;
  totalClientPrice: number;
  receivedAt: Date;
  pickedUpAt: Date | null;
  returnedAt: Date | null;
  deliveredAt: Date | null;
  paidAt: Date | null;
  techPaidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  sellerId: string | null;
  branchId: string | null;
  clientId: string | null;
}

export interface IServiceOrderForOthers extends IServiceOrderCore, IServiceOrderRelations {
  items: IServiceOrderProductBase[];
}

export interface IServiceOrderForTecnico extends IServiceOrderCore, IServiceOrderRelations {
  items: IServiceOrderProductWithMargin[];
  totalCompanyCost: number;
  realTechCost: number;
  totalTechMargin: number;
  companyMargin: number;
}

export type IServiceOrderResponse = IServiceOrderForOthers | IServiceOrderForTecnico;
