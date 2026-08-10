import { NextRequest, NextResponse } from "next/server";
import { ServicioService } from "@/server/service/servicio.service";
import apiErrorHandler, { ApiError } from "@/utils/handlers/apiError.handler";
import { extractAuthContext } from "@/server/guards/serviceOrder.guard";
import { cookies } from "next/headers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const auth = extractAuthContext(cookieStore, req.headers);
    const body = await req.json();
    const { id } = await params;

    const servicio = await ServicioService.update(id, body, auth.role as never, auth.id);
    return NextResponse.json(servicio);
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al actualizar servicio" }),
      request: req,
    });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const auth = extractAuthContext(cookieStore, req.headers);
    const { id } = await params;

    await ServicioService.delete(id, auth.role as never);
    return NextResponse.json({ message: "Servicio eliminado exitosamente" });
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al eliminar servicio" }),
      request: req,
    });
  }
}
