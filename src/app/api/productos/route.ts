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

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const decoded = getAuthContext(cookieStore);

    const { searchParams } = req.nextUrl;
    const filters = {
      type: searchParams.get("type") || undefined,
      quality: searchParams.get("quality") || undefined,
      search: searchParams.get("search") || undefined,
    };

    const productos = await ProductoService.getAll(decoded.role, filters);
    return NextResponse.json(productos);
  } catch (error: any) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al obtener productos" }),
      request: req,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const decoded = getAuthContext(cookieStore);

    const body = await req.json();

    const data = {
      ...body,
      quality: body.quality === "NINGUNA" ? null : body.quality,
      companyId: decoded.id,
    };

    const producto = await ProductoService.create(data, decoded.role);
    return NextResponse.json(producto);
  } catch (error: any) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al crear producto" }),
      request: req,
    });
  }
}
