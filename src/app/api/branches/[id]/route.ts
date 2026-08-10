import { NextRequest, NextResponse } from "next/server";
import apiErrorHandler, { ApiError } from "@/utils/handlers/apiError.handler";
import { branchRepository } from "@/server/repositories/branch.repository";
import { BRANCH_MESSAGES } from "@/constants/branch.constant";
import { cookies } from "next/headers";
import { extractAuthContext } from "@/server/guards/serviceOrder.guard";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    extractAuthContext(cookieStore, request.headers);

    const { id } = await params;
    const body = await request.json();
    const { name, address, phone } = body;

    const branch = await branchRepository.update(id, {
      name,
      address,
      phone,
    });

    return NextResponse.json(branch);
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al actualizar sucursal" }),
      request,
    });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    extractAuthContext(cookieStore, request.headers);

    const { id } = await params;
    await branchRepository.delete(id);
    return NextResponse.json({ message: BRANCH_MESSAGES.DELETED });
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al eliminar sucursal" }),
      request,
    });
  }
}
