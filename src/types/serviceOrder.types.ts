export interface ServiceOrderProduct {
  productName: string;
  productType: string;
  unitPrice: number;
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
  products?: ServiceOrderProduct[];
  client?: ServiceOrderClient;
}

export interface WarrantyOrder {
  client?: {
    fullName: string;
  };
}
