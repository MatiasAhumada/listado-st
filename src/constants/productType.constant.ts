import { ProductType } from "@prisma/client";

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  [ProductType.MODULO]: "Módulos",
  [ProductType.BATERIA]: "Baterías",
  [ProductType.PIN]: "Pines",
  [ProductType.CONSOLA]: "Consolas",
  [ProductType.MANTENIMIENTO]: "Mantenimiento",
  [ProductType.VIDRIOS_CAMARA]: "Vidrios de Cámara",
  [ProductType.BOTON_POWER]: "Botón Power",
  [ProductType.BANDEJA_SIM]: "Bandeja SIM",
  [ProductType.FLEX]: "Flex",
  [ProductType.SOFTWARE]: "Software",
  [ProductType.VARIOS]: "Varios",
};

export const PRODUCT_TYPES = Object.values(ProductType);
