import { NextRequest, NextResponse } from "next/server";
import apiErrorHandler, { ApiError } from "@/utils/handlers/apiError.handler";
import { branchRepository } from "@/server/repositories/branch.repository";
import { BRANCH_MESSAGES } from "@/constants/branch.constant";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import httpStatus from "http-status";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret";

function getAuthContext(cookieStore: any, headers?: Headers) {
  let token = cookieStore.get("auth-token")?.value;
  if (!token && headers) {
    const authHeader = headers.get("authorization") || headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }
  if (!token) {
    throw new ApiError({ status: httpStatus.UNAUTHORIZED, message: "No autenticado" });
  }
  return jwt.verify(token, JWT_SECRET) as { id: string; role: string };
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    getAuthContext(cookieStore, request.headers);

    const { id } = await params;
    const body = await request.json();
    const { name, address, phone } = body;

    const branch = await branchRepository.update(id, {
      name,
      address,
      phone,
    });

    return NextResponse.json(branch);
  } catch (error: any) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al actualizar sucursal" }),
      request,
    });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    getAuthContext(cookieStore, request.headers);

    const { id } = await params;
    await branchRepository.delete(id);
    return NextResponse.json({ message: BRANCH_MESSAGES.DELETED });
  } catch (error: any) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al eliminar sucursal" }),
      request,
    });
  }
}
