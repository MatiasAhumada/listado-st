import { NextRequest, NextResponse } from "next/server";
import { serviceOrderService } from "@/server/service/serviceOrder.service";
import apiErrorHandler, { ApiError } from "@/utils/handlers/apiError.handler";
import { cookies } from "next/headers";
import { extractAuthContext, assertDeletePermission, assertPatchPermission } from "@/server/guards/serviceOrder.guard";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const auth = extractAuthContext(cookieStore, request.headers);
    const { id } = await params;

    const order = await serviceOrderService.getServiceOrderById(id, auth);
    return NextResponse.json(order);
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al obtener orden" }),
      request,
    });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const auth = extractAuthContext(cookieStore, request.headers);

    const { id } = await params;
    const body = await request.json();

    const order = await serviceOrderService.updateServiceOrder(id, body, auth);
    return NextResponse.json(order);
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al actualizar orden" }),
      request,
    });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const auth = extractAuthContext(cookieStore, request.headers);

    const { id } = await params;
    const body = await request.json();

    assertPatchPermission(auth, Object.keys(body));

    const order = await serviceOrderService.patchServiceOrder(id, body, auth);
    return NextResponse.json(order);
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al actualizar orden" }),
      request,
    });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const auth = extractAuthContext(cookieStore, request.headers);

    assertDeletePermission(auth);

    const { id } = await params;

    await serviceOrderService.deleteServiceOrder(id, auth);
    return NextResponse.json({ message: "Orden eliminada correctamente" });
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al eliminar orden" }),
      request,
    });
  }
}
