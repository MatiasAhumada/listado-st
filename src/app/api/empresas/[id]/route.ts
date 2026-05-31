import { NextRequest, NextResponse } from "next/server";
import apiErrorHandler, { ApiError } from "@/utils/handlers/apiError.handler";
import { empresaRepository } from "@/server/repositories/empresa.repository";
import { EMPRESA_MESSAGES } from "@/constants/empresa.constant";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret";

function getAuthContext(cookieStore: Awaited<ReturnType<typeof cookies>>, headers?: Headers) {
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
    const decoded = getAuthContext(cookieStore, request.headers);

    if (decoded.role !== "TECNICO") {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: EMPRESA_MESSAGES.FORBIDDEN });
    }

    const { id } = await params;
    const existing = await empresaRepository.findById(id);
    if (!existing) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: EMPRESA_MESSAGES.NOT_FOUND });
    }

    const body = await request.json();
    const { username, password } = body;

    if (username && username !== existing.username) {
      const usernameConflict = await empresaRepository.findByUsername(username);
      if (usernameConflict) {
        throw new ApiError({ status: httpStatus.BAD_REQUEST, message: EMPRESA_MESSAGES.USERNAME_EXISTS });
      }
    }

    const updateData: { username?: string; password?: string } = {};
    if (username) updateData.username = username;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const empresa = await empresaRepository.update(id, updateData);
    return NextResponse.json(empresa);
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al actualizar empresa" }),
      request,
    });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const decoded = getAuthContext(cookieStore, request.headers);

    if (decoded.role !== "TECNICO") {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: EMPRESA_MESSAGES.FORBIDDEN });
    }

    const { id } = await params;
    const existing = await empresaRepository.findById(id);
    if (!existing) {
      throw new ApiError({ status: httpStatus.NOT_FOUND, message: EMPRESA_MESSAGES.NOT_FOUND });
    }

    await empresaRepository.delete(id);
    return NextResponse.json({ message: EMPRESA_MESSAGES.DELETED });
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al eliminar empresa" }),
      request,
    });
  }
}
