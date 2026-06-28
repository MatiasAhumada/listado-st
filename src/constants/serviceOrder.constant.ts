import { ServiceOrderStatus, PaymentMethod } from "@prisma/client";

export const SERVICE_ORDER_ERRORS = {
  NOT_FOUND: "Orden de servicio no encontrada",
  FORBIDDEN: "Sin permisos para esta operación",
  FORBIDDEN_OWNERSHIP: "Sin permisos sobre esta orden",
  VENDEDOR_STATUS_ONLY: "El vendedor solo puede modificar el estado de la orden",
  UNAUTHENTICATED: "No autenticado",
  TECNICO_REQUIRES_COMPANY: "El técnico debe indicar una empresa para crear la orden",
} as const;

export const SERVICE_ORDER_PATCH_ALLOWED_FIELDS = ["status"] as const;

export const EMAIL_HEADER_TITLE = "🔧 Nueva Orden de Servicio";
export const EMAIL_SECTION_DETALLES = "Detalles de la Orden";
export const EMAIL_LABEL_CLIENTE = "Cliente:";
export const EMAIL_LABEL_TELEFONO = "Teléfono:";
export const EMAIL_LABEL_RETIRO_SUCURSAL = "Retirar en sucursal:";
export const EMAIL_LABEL_FECHA_ENTREGA = "Fecha de Entrega:";
export const EMAIL_LABEL_SERVICIOS = "Servicios a Realizar:";
export const EMAIL_LABEL_COSTO_TECNICO_OS = "Costo técnico de la orden:";
export const EMAIL_LABEL_PRESUPUESTO_CLIENTE = "Presupuesto al cliente:";
export const EMAIL_LABEL_GANANCIA = "Ganancia:";
export const EMAIL_FOOTER_AUTOMATICO = "Este es un correo automático. Por favor no responder.";
export const EMAIL_FOOTER_SISTEMA = "Sistema de Gestión de Servicios Técnicos";

export const SERVICE_ORDER_MARGIN_LABELS = {
  TOTAL_CLIENT_PRICE: "Precio cliente",
  TOTAL_COMPANY_COST: "Precio empresa",
  REAL_TECH_COST: "Costo real de la OS",
  REAL_TECH_COST_HELPER: "Lo que realmente te costó esta orden (repuestos, tiempo, traslados)",
  TOTAL_MARGIN: "Ganancia",
  UNIT_COST_COMPANY: "Costo empresa",
  COMPANY_MARGIN: "Ganancia empresa",
} as const;

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "Efectivo",
  [PaymentMethod.CREDIT]: "Crédito",
};

export const PAYMENT_METHOD_BADGE_COLORS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "bg-emerald-100 text-emerald-800",
  [PaymentMethod.CREDIT]: "bg-blue-100 text-blue-800",
};

export const SERVICE_ORDER_STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  [ServiceOrderStatus.RECEPCIONADO]: "Recepcionado",
  [ServiceOrderStatus.RETIRADO_POR_TECNICO]: "Retirado por Técnico",
  [ServiceOrderStatus.DEVUELTO_POR_TECNICO]: "Devuelto por Técnico",
  [ServiceOrderStatus.COBRADO_CLIENTE]: "Cobrado al Cliente",
  [ServiceOrderStatus.ENTREGADO_CLIENTE]: "Entregado al Cliente",
  [ServiceOrderStatus.COBRADO_TECNICO]: "Cobrado Técnico",
};

export const SERVICE_ORDER_STATUS_COLORS: Record<ServiceOrderStatus, string> = {
  [ServiceOrderStatus.RECEPCIONADO]: "bg-blue-100 text-blue-800",
  [ServiceOrderStatus.RETIRADO_POR_TECNICO]: "bg-yellow-100 text-yellow-800",
  [ServiceOrderStatus.DEVUELTO_POR_TECNICO]: "bg-purple-100 text-purple-800",
  [ServiceOrderStatus.COBRADO_CLIENTE]: "bg-green-100 text-green-800",
  [ServiceOrderStatus.ENTREGADO_CLIENTE]: "bg-teal-100 text-teal-800",
  [ServiceOrderStatus.COBRADO_TECNICO]: "bg-gray-100 text-gray-800",
};
