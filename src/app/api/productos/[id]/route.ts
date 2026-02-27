import { NextRequest, NextResponse } from "next/server";
import { ProductoService } from "@/server/service/producto.service";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import apiErrorHandler, { ApiError } from "@/utils/handlers/apiError.handler";
import httpStatus from "http-status";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret";

function getAuthContext(cookieStore: any) {
  const token = cookieStore.get("auth-token")?.value;
  if (!token) {
    throw new ApiError({ status: httpStatus.UNAUTHORIZED, message: "No autenticado" });
  }
  return jwt.verify(token, JWT_SECRET) as { id: string; role: string };
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const decoded = getAuthContext(cookieStore);
    const body = await req.json();
    const { id } = await params;
    
    const data = {
      ...body,
      quality: body.quality === "NINGUNA" ? null : body.quality,
    };

    const producto = await ProductoService.update(id, data, decoded.role, decoded.id);
    return NextResponse.json(producto);
  } catch (error: any) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al actualizar producto" }),
      request: req,
    });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const decoded = getAuthContext(cookieStore);
    const { id } = await params;

    await ProductoService.delete(id, decoded.role, decoded.id);
    return NextResponse.json({ message: "Producto eliminado exitosamente" });
  } catch (error: any) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al eliminar producto" }),
      request: req,
    });
  }
}
