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
  cashMargin?: number;
  creditMargin?: number;
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
    if (userRole !== "TECNICO") {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "Solo técnicos pueden crear productos" });
    }

    if (!data.costTech || data.costTech <= 0) {
      throw new ApiError({ status: httpStatus.BAD_REQUEST, message: "El costo técnico es requerido" });
    }

    const costTechMargin = data.costTechMargin ?? 0;
    const cost = data.costTech * (1 + costTechMargin / 100);

    const masterProduct = await ProductoRepository.create({
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
      creditMargin: 0,
      companyId: null,
      masterProductId: null,
    });

    const empresas = await ProductoRepository.findAllEmpresas();
    
    for (const empresa of empresas) {
      await ProductoRepository.create({
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
        creditMargin: 0,
        companyId: empresa.id,
        masterProductId: masterProduct.id,
      });
    }

    return masterProduct;
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
      if (existing.companyId) {
        throw new ApiError({ status: httpStatus.FORBIDDEN, message: "No podés editar productos de empresas" });
      }

      const costTech = data.costTech ?? existing.costTech;
      const costTechMargin = data.costTechMargin ?? existing.costTechMargin;
      const cost = costTech * (1 + costTechMargin / 100);

      await ProductoRepository.update(id, {
        name: data.name,
        type: data.type,
        quality: data.quality,
        available: data.available,
        costTech,
        costTechMargin,
        cost,
      });

      await ProductoRepository.updateCopiasCost(id, cost);

      return await ProductoRepository.findById(id);
    }

    if (existing.companyId !== companyId) {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "No podés editar productos de otras empresas" });
    }

    const cost = existing.cost;
    const cashMargin = data.cashMargin ?? existing.cashMargin;
    const creditMargin = data.creditMargin ?? existing.creditMargin;
    const cash = cost * (1 + cashMargin / 100);
    const credit = cash * (1 + creditMargin / 100);

    return await ProductoRepository.update(id, {
      name: data.name,
      type: data.type,
      quality: data.quality,
      available: data.available,
      cashMargin,
      cash,
      creditMargin,
      credit,
    });
  }

  static async delete(id: string, userRole: UserRole, companyId: string) {
    if (userRole !== "TECNICO") {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "Solo técnicos pueden eliminar productos" });
    }

    const existing = await ProductoRepository.findById(id);
    if (!existing) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: "Producto no encontrado" });
    }

    if (existing.companyId) {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "No podés eliminar productos de empresas" });
    }

    return await ProductoRepository.delete(id);
  }
}
