import { ServiceType } from "@prisma/client";

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  [ServiceType.MODULO]: "Módulos",
  [ServiceType.BATERIA]: "Baterías",
  [ServiceType.PIN]: "Pines",
  [ServiceType.CONSOLA]: "Consolas",
  [ServiceType.MANTENIMIENTO]: "Mantenimiento",
  [ServiceType.VIDRIOS_CAMARA]: "Vidrios de Cámara",
  [ServiceType.BOTON_POWER]: "Botón Power",
  [ServiceType.BANDEJA_SIM]: "Bandeja SIM",
  [ServiceType.FLEX]: "Flex",
  [ServiceType.SOFTWARE]: "Software",
  [ServiceType.VARIOS]: "Varios",
};

export const SERVICE_TYPES = Object.values(ServiceType);

export const SERVICIO_COLUMN_LABELS = {
  COSTO_REPUESTO: "Costo Repuesto",
  COSTO_EMPRESA: "Costo Empresa",
  COSTO: "Costo",
  EFECTIVO: "Efectivo",
  TARJETA: "Tarjeta",
} as const;
