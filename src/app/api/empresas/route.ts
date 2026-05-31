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

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const decoded = getAuthContext(cookieStore, req.headers);

    if (decoded.role !== "TECNICO") {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: EMPRESA_MESSAGES.FORBIDDEN });
    }

    const empresas = await empresaRepository.findAll();
    return NextResponse.json(empresas);
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al obtener empresas" }),
      request: req,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const decoded = getAuthContext(cookieStore, request.headers);

    if (decoded.role !== "TECNICO") {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: EMPRESA_MESSAGES.FORBIDDEN });
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      throw new ApiError({ status: httpStatus.BAD_REQUEST, message: EMPRESA_MESSAGES.REQUIRED_FIELDS });
    }

    const existing = await empresaRepository.findByUsername(username);
    if (existing) {
      throw new ApiError({ status: httpStatus.BAD_REQUEST, message: EMPRESA_MESSAGES.USERNAME_EXISTS });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const empresa = await empresaRepository.create({ username, password: hashedPassword });

    return NextResponse.json(empresa, { status: httpStatus.CREATED });
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al crear empresa" }),
      request,
    });
  }
}
