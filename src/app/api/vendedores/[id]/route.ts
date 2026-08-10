import { NextRequest, NextResponse } from "next/server";
import apiErrorHandler, { ApiError } from "@/utils/handlers/apiError.handler";
import { vendedorRepository } from "@/server/repositories/vendedor.repository";
import { VENDEDOR_MESSAGES } from "@/constants/vendedor.constant";
import { cookies } from "next/headers";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";
import { extractAuthContext } from "@/server/guards/serviceOrder.guard";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    extractAuthContext(cookieStore, request.headers);

    const { id } = await params;
    const body = await request.json();
    const { username, password, branchId } = body;

    const updateData: { username?: string; password?: string; branchId?: string } = {};

    if (username) {
      const existingUser = await vendedorRepository.findByUsername(username);
      if (existingUser && existingUser.id !== id) {
        throw new ApiError({ status: httpStatus.BAD_REQUEST, message: VENDEDOR_MESSAGES.USERNAME_EXISTS });
      }
      updateData.username = username;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (branchId) {
      updateData.branchId = branchId;
    }

    const vendedor = await vendedorRepository.update(id, updateData);
    return NextResponse.json(vendedor);
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al actualizar vendedor" }),
      request,
    });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    extractAuthContext(cookieStore, request.headers);

    const { id } = await params;
    await vendedorRepository.delete(id);
    return NextResponse.json({ message: VENDEDOR_MESSAGES.DELETED });
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al eliminar vendedor" }),
      request,
    });
  }
}
