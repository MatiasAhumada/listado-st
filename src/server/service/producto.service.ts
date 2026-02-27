import { ProductoRepository } from "../repositories/producto.repository";
import { ApiError } from "@/utils/handlers/apiError.handler";
import httpStatus from "http-status";

export interface CreateProductoDTO {
  name: string;
  type: string;
  quality?: string | null;
  available: boolean;
  cost: number;
  cash: number;
  credit: number;
  companyId: string;
}

export class ProductoService {
  static async getAll(userRole: string, filters?: { type?: string; quality?: string; search?: string }) {
    const isVendedor = userRole === "VENDEDOR";
    return await ProductoRepository.findAll(isVendedor, filters);
  }

  static async create(data: CreateProductoDTO, userRole: string) {
    if (userRole !== "EMPRESA") {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "No autorizado para crear productos" });
    }

    return await ProductoRepository.create(data);
  }

  static async update(id: string, data: Partial<CreateProductoDTO>, userRole: string, companyId: string) {
    if (userRole !== "EMPRESA") {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "No autorizado para editar productos" });
    }
    return await ProductoRepository.update(id, data);
  }

  static async delete(id: string, userRole: string, companyId: string) {
    if (userRole !== "EMPRESA") {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "No autorizado para eliminar productos" });
    }
    return await ProductoRepository.delete(id);
  }
}
