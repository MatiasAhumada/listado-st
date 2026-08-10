import { NextRequest, NextResponse } from "next/server";
import apiErrorHandler, { ApiError } from "@/utils/handlers/apiError.handler";
import { vendedorRepository } from "@/server/repositories/vendedor.repository";
import { VENDEDOR_MESSAGES } from "@/constants/vendedor.constant";
import { cookies } from "next/headers";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";
import { extractAuthContext } from "@/server/guards/serviceOrder.guard";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const decoded = extractAuthContext(cookieStore, req.headers);

    const vendedores = await vendedorRepository.findByCompanyId(decoded.id);
    return NextResponse.json(vendedores || []);
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al obtener vendedores" }),
      request: req,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const decoded = extractAuthContext(cookieStore, request.headers);

    const body = await request.json();
    const { username, password, branchId } = body;

    if (!username || !password || !branchId) {
      throw new ApiError({ status: httpStatus.BAD_REQUEST, message: VENDEDOR_MESSAGES.REQUIRED_FIELDS });
    }

    const existingUser = await vendedorRepository.findByUsername(username);
    if (existingUser) {
      throw new ApiError({ status: httpStatus.BAD_REQUEST, message: VENDEDOR_MESSAGES.USERNAME_EXISTS });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const vendedor = await vendedorRepository.create({
      username,
      password: hashedPassword,
      companyId: decoded.id,
      branchId,
    });

    return NextResponse.json(vendedor, { status: 201 });
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al crear vendedor" }),
      request,
    });
  }
}
