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

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const decoded = getAuthContext(cookieStore, req.headers);

    const branches = await branchRepository.findByCompanyId(decoded.id);
    return NextResponse.json(branches || []);
  } catch (error: any) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al obtener sucursales" }),
      request: req,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const decoded = getAuthContext(cookieStore, request.headers);

    const body = await request.json();
    const { name, address, phone } = body;

    if (!name) {
      throw new ApiError({ status: httpStatus.BAD_REQUEST, message: BRANCH_MESSAGES.REQUIRED_FIELDS });
    }

    const branch = await branchRepository.create({
      name,
      address,
      phone,
      companyId: decoded.id,
    });

    return NextResponse.json(branch, { status: 201 });
  } catch (error: any) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al crear sucursal" }),
      request,
    });
  }
}
