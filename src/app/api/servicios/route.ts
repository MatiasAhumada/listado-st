import { NextRequest, NextResponse } from "next/server";
import { ServicioService } from "@/server/service/servicio.service";
import apiErrorHandler, { ApiError } from "@/utils/handlers/apiError.handler";
import { extractAuthContext } from "@/server/guards/serviceOrder.guard";
import { cookies } from "next/headers";
import httpStatus from "http-status";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const auth = extractAuthContext(cookieStore, req.headers);

    const { searchParams } = req.nextUrl;
    const filters = {
      type: searchParams.get("type") || undefined,
      search: searchParams.get("search") || undefined,
    };

    const servicios = await ServicioService.getAll(auth.role as never, auth.id, filters);
    return NextResponse.json(servicios);
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al obtener servicios" }),
      request: req,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const auth = extractAuthContext(cookieStore, req.headers);

    const body = await req.json();

    if (body.servicios && Array.isArray(body.servicios)) {
      const resultados = await ServicioService.bulkCreateOrUpdate(body.servicios, auth.role as never);
      return NextResponse.json(resultados);
    }

    if (auth.role !== "TECNICO") {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "Solo técnicos pueden crear servicios" });
    }

    const servicio = await ServicioService.create({ ...body, companyId: auth.id }, auth.role as never);
    return NextResponse.json(servicio);
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al crear servicio" }),
      request: req,
    });
  }
}
