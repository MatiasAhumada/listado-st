import { ServicioRepository, UserRole } from "../repositories/servicio.repository";
import { ApiError } from "@/utils/handlers/apiError.handler";
import httpStatus from "http-status";

export interface CreateServicioDTO {
  name: string;
  type: string;
  available: boolean;
  costTech?: number;
  costTechMargin?: number;
  cashMargin?: number;
  creditMargin?: number;
  companyId: string;
}

export interface BulkServicioDTO {
  name: string;
  type: string;
  costTech: number;
  costTechMargin: number;
  cost: number;
  costMargin: number;
  cash: number;
  cashMargin: number;
  credit: number;
  creditMargin: number;
}

export class ServicioService {
  static async getAll(userRole: UserRole, companyId: string, filters?: { type?: string; search?: string }) {
    return await ServicioRepository.findAll(userRole, companyId, filters);
  }

  static async create(data: CreateServicioDTO, userRole: UserRole, companyId: string) {
    if (userRole !== "TECNICO") {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "Solo técnicos pueden crear servicios" });
    }

    if (!data.costTech || data.costTech <= 0) {
      throw new ApiError({ status: httpStatus.BAD_REQUEST, message: "El costo técnico es requerido" });
    }

    const costTechMargin = data.costTechMargin ?? 0;
    const cost = data.costTech * (1 + costTechMargin / 100);
    const cash = cost * 2;
    const cashMargin = ((cash - cost) / cost) * 100;
    const credit = cost * 2.2;
    const creditMargin = ((credit - cash) / cash) * 100;

    const masterServicio = await ServicioRepository.create({
      name: data.name,
      type: data.type as never,
      available: data.available,
      costTech: data.costTech,
      costTechMargin,
      cost,
      costMargin: 0,
      cash,
      cashMargin,
      credit,
      creditMargin,
    });

    const empresas = await ServicioRepository.findAllEmpresas();

    for (const empresa of empresas) {
      await ServicioRepository.create({
        name: data.name,
        type: data.type as never,
        available: data.available,
        costTech: data.costTech,
        costTechMargin,
        cost,
        costMargin: 0,
        cash,
        cashMargin,
        credit,
        creditMargin,
        company: { connect: { id: empresa.id } },
        masterServicio: { connect: { id: masterServicio.id } },
      });
    }

    return masterServicio;
  }

  static async update(id: string, data: Partial<CreateServicioDTO>, userRole: UserRole, companyId: string) {
    if (userRole === "VENDEDOR") {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "No autorizado para editar servicios" });
    }

    const existing = await ServicioRepository.findById(id);
    if (!existing) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: "Servicio no encontrado" });
    }

    if (userRole === "TECNICO") {
      if (existing.companyId) {
        throw new ApiError({ status: httpStatus.FORBIDDEN, message: "No podés editar servicios de empresas" });
      }

      const costTech = data.costTech ?? existing.costTech;
      const costTechMargin = data.costTechMargin ?? existing.costTechMargin;
      const cost = costTech * (1 + costTechMargin / 100);
      const cash = cost * 2;
      const cashMargin = ((cash - cost) / cost) * 100;
      const credit = cost * 2.2;
      const creditMargin = ((credit - cash) / cash) * 100;

      await ServicioRepository.update(id, {
        name: data.name,
        type: data.type as never,
        available: data.available,
        costTech,
        costTechMargin,
        cost,
        cash,
        cashMargin,
        credit,
        creditMargin,
      });

      await ServicioRepository.updateCopiasAllFields(id, {
        costTech,
        costTechMargin,
        cost,
        costMargin: 0,
        cash,
        cashMargin,
        credit,
        creditMargin,
      });

      return await ServicioRepository.findById(id);
    }

    if (existing.companyId !== companyId) {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "No podés editar servicios de otras empresas" });
    }

    const cost = existing.cost;
    const cashMargin = data.cashMargin ?? existing.cashMargin;
    const creditMargin = data.creditMargin ?? existing.creditMargin;
    const cash = cost * (1 + cashMargin / 100);
    const credit = cash * (1 + creditMargin / 100);

    return await ServicioRepository.update(id, {
      name: data.name,
      type: data.type as never,
      available: data.available,
      cashMargin,
      cash,
      creditMargin,
      credit,
    });
  }

  static async delete(id: string, userRole: UserRole, companyId: string) {
    if (userRole !== "TECNICO") {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "Solo técnicos pueden eliminar servicios" });
    }

    const existing = await ServicioRepository.findById(id);
    if (!existing) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: "Servicio no encontrado" });
    }

    if (existing.companyId) {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "No podés eliminar servicios de empresas" });
    }

    return await ServicioRepository.delete(id);
  }

  static async bulkCreateOrUpdate(servicios: BulkServicioDTO[], userRole: UserRole) {
    if (userRole !== "TECNICO") {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "Solo técnicos pueden hacer carga masiva" });
    }

    const resultados = {
      creados: 0,
      actualizados: 0,
      errores: 0,
    };

    for (const servicio of servicios) {
      try {
        const existente = await ServicioRepository.findByName(servicio.name);

        if (existente) {
          await ServicioRepository.update(existente.id, {
            costTech: servicio.costTech,
            costTechMargin: servicio.costTechMargin,
            cost: servicio.cost,
            costMargin: servicio.costMargin,
            cash: servicio.cash,
            cashMargin: servicio.cashMargin,
            credit: servicio.credit,
            creditMargin: servicio.creditMargin,
          });

          await ServicioRepository.updateCopiasAllFields(existente.id, {
            costTech: servicio.costTech,
            costTechMargin: servicio.costTechMargin,
            cost: servicio.cost,
            costMargin: servicio.costMargin,
            cash: servicio.cash,
            cashMargin: servicio.cashMargin,
            credit: servicio.credit,
            creditMargin: servicio.creditMargin,
          });
          resultados.actualizados++;
        } else {
          const masterServicio = await ServicioRepository.create({
            name: servicio.name,
            type: servicio.type as never,
            available: true,
            costTech: servicio.costTech,
            costTechMargin: servicio.costTechMargin,
            cost: servicio.cost,
            costMargin: servicio.costMargin,
            cash: servicio.cash,
            cashMargin: servicio.cashMargin,
            credit: servicio.credit,
            creditMargin: servicio.creditMargin,
          });

          const empresas = await ServicioRepository.findAllEmpresas();

          for (const empresa of empresas) {
            await ServicioRepository.create({
              name: servicio.name,
              type: servicio.type as never,
              available: true,
              costTech: servicio.costTech,
              costTechMargin: servicio.costTechMargin,
              cost: servicio.cost,
              costMargin: servicio.costMargin,
              cash: servicio.cash,
              cashMargin: servicio.cashMargin,
              credit: servicio.credit,
              creditMargin: servicio.creditMargin,
              company: { connect: { id: empresa.id } },
              masterServicio: { connect: { id: masterServicio.id } },
            });
          }

          resultados.creados++;
        }
      } catch (error) {
        console.error(`Error procesando ${servicio.name}:`, error);
        resultados.errores++;
      }
    }

    return resultados;
  }
}
