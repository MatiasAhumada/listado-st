import { ProductoRepository, UserRole } from "../repositories/producto.repository";
import { ApiError } from "@/utils/handlers/apiError.handler";
import httpStatus from "http-status";

export interface CreateProductoDTO {
  name: string;
  type: string;
  quality?: string | null;
  available: boolean;
  costTech?: number;
  costTechMargin?: number;
  cost?: number;
  costMargin?: number;
  cash?: number;
  cashMargin?: number;
  credit?: number;
  companyId: string;
}

export class ProductoService {
  static async getAll(
    userRole: UserRole,
    companyId: string,
    filters?: { type?: string; quality?: string; search?: string }
  ) {
    return await ProductoRepository.findAll(userRole, companyId, filters);
  }

  static async create(data: CreateProductoDTO, userRole: UserRole, companyId: string) {
    if (userRole === "VENDEDOR" || userRole === "EMPRESA") {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "No autorizado para crear productos" });
    }

    if (!data.costTech || data.costTech <= 0) {
      throw new ApiError({ status: httpStatus.BAD_REQUEST, message: "El costo técnico es requerido" });
    }

    const costTechMargin = data.costTechMargin ?? 0;
    const cost = data.costTech * (1 + costTechMargin / 100);

    return await ProductoRepository.create({
      name: data.name,
      type: data.type,
      quality: data.quality,
      available: data.available,
      costTech: data.costTech,
      costTechMargin,
      cost,
      costMargin: 0,
      cash: 0,
      cashMargin: 0,
      credit: 0,
      companyId,
    });
  }

  static async update(id: string, data: Partial<CreateProductoDTO>, userRole: UserRole, companyId: string) {
    if (userRole === "VENDEDOR") {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "No autorizado para editar productos" });
    }

    const existing = await ProductoRepository.findById(id);
    if (!existing) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: "Producto no encontrado" });
    }

    if (userRole === "TECNICO") {
      if (existing.companyId !== companyId) {
        throw new ApiError({ status: httpStatus.FORBIDDEN, message: "No podés editar productos de otras empresas" });
      }

      const costTech = data.costTech ?? existing.costTech;
      const costTechMargin = data.costTechMargin ?? existing.costTechMargin;
      const cost = costTech * (1 + costTechMargin / 100);

      return await ProductoRepository.update(id, {
        costTech,
        costTechMargin,
        cost,
      });
    }

    if (existing.companyId !== companyId) {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "No podés editar productos de otras empresas" });
    }

    const cost = existing.cost;
    const cashMargin = data.cashMargin ?? 0;
    const cash = cost * (1 + cashMargin / 100);
    const credit = cash * (1 + cashMargin / 100);

    return await ProductoRepository.update(id, {
      cash: data.cash ?? cash,
      cashMargin,
      credit: data.credit ?? credit,
    });
  }

  static async delete(id: string, userRole: UserRole, companyId: string) {
    if (userRole === "VENDEDOR" || userRole === "EMPRESA") {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "No autorizado para eliminar productos" });
    }

    const existing = await ProductoRepository.findById(id);
    if (!existing || existing.companyId !== companyId) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: "Producto no encontrado" });
    }

    return await ProductoRepository.delete(id);
  }
}
