import { ServiceType } from "@prisma/client";

export interface Servicio {
  id: string;
  name: string;
  type: ServiceType;
  available: boolean;
  costTech: number;
  costTechMargin: number;
  cost: number;
  cash: number;
  cashMargin: number;
  credit: number;
  creditMargin: number;
}

export type ServicioPayload = Partial<Omit<Servicio, "id">>;
