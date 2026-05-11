import { NextRequest, NextResponse } from "next/server";
import { serviceOrderService } from "@/server/service/serviceOrder.service";
import { apiErrorHandler } from "@/utils/handlers/apiError.handler";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await serviceOrderService.getServiceOrderById(id);
    return NextResponse.json(order);
  } catch (error) {
    return apiErrorHandler(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const order = await serviceOrderService.updateServiceOrder(id, body);
    return NextResponse.json(order);
  } catch (error) {
    return apiErrorHandler(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await serviceOrderService.deleteServiceOrder(id);
    return NextResponse.json({ message: "Orden eliminada correctamente" });
  } catch (error) {
    return apiErrorHandler(error);
  }
}
