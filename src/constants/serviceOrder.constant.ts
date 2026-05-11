import { ServiceOrderStatus } from "@prisma/client";

export const SERVICE_ORDER_STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  [ServiceOrderStatus.RECEPCIONADO]: "Recepcionado",
  [ServiceOrderStatus.RETIRADO_POR_TECNICO]: "Retirado por Técnico",
  [ServiceOrderStatus.DEVUELTO_POR_TECNICO]: "Devuelto por Técnico",
  [ServiceOrderStatus.ENTREGADO_A_CLIENTE]: "Entregado a Cliente",
  [ServiceOrderStatus.COBRADO]: "Cobrado",
};

export const SERVICE_ORDER_STATUS_COLORS: Record<ServiceOrderStatus, string> = {
  [ServiceOrderStatus.RECEPCIONADO]: "bg-blue-100 text-blue-800",
  [ServiceOrderStatus.RETIRADO_POR_TECNICO]: "bg-yellow-100 text-yellow-800",
  [ServiceOrderStatus.DEVUELTO_POR_TECNICO]: "bg-purple-100 text-purple-800",
  [ServiceOrderStatus.ENTREGADO_A_CLIENTE]: "bg-green-100 text-green-800",
  [ServiceOrderStatus.COBRADO]: "bg-gray-100 text-gray-800",
};
