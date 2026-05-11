import { NextRequest, NextResponse } from "next/server";
import { serviceOrderService } from "@/server/service/serviceOrder.service";
import apiErrorHandler, { ApiError } from "@/utils/handlers/apiError.handler";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await serviceOrderService.getServiceOrderById(id);
    return NextResponse.json(order);
  } catch (error: any) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al obtener orden" }),
      request,
    });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const order = await serviceOrderService.updateServiceOrder(id, body);
    return NextResponse.json(order);
  } catch (error: any) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al actualizar orden" }),
      request,
    });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await serviceOrderService.deleteServiceOrder(id);
    return NextResponse.json({ message: "Orden eliminada correctamente" });
  } catch (error: any) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al eliminar orden" }),
      request,
    });
  }
}
