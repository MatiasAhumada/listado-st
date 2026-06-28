export interface ServiceOrderItem {
  serviceName: string;
  serviceType: string;
  unitPrice: number;
  totalPrice?: number;
  cashPrice?: number;
  creditPrice?: number;
  unitCostTech?: number;
  totalCostTech?: number;
  isDry?: boolean;
  hasImpact?: boolean;
  isBrokenScreen?: boolean;
  isTurnedOn?: boolean;
  isCharging?: boolean;
  color?: string;
  description?: string;
}

export interface ServiceOrderClient {
  fullName: string;
  dni: string;
  phone?: string;
  address?: string;
}

export interface ServiceOrderSeller {
  id: string;
  username: string;
}

export interface ServiceOrderReceipt {
  id: string;
  clientName: string;
  clientPhone: string;
  advancePayment?: number;
  balance?: number;
  deliveryDate?: string;
  receivedAt: string;
  seller?: ServiceOrderSeller;
  items?: ServiceOrderItem[];
  client?: ServiceOrderClient;
}

export interface WarrantyOrder {
  client?: {
    fullName: string;
  };
}
