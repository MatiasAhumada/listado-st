import { NextRequest, NextResponse } from "next/server";
import apiErrorHandler, { ApiError } from "@/utils/handlers/apiError.handler";
import { vendedorRepository } from "@/server/repositories/vendedor.repository";
import { VENDEDOR_MESSAGES } from "@/constants/vendedor.constant";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";

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

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const decoded = getAuthContext(cookieStore, req.headers);

    const vendedores = await vendedorRepository.findByCompanyId(decoded.id);
    return NextResponse.json(vendedores || []);
  } catch (error: any) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al obtener vendedores" }),
      request: req,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const decoded = getAuthContext(cookieStore, request.headers);

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
  } catch (error: any) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al crear vendedor" }),
      request,
    });
  }
}
