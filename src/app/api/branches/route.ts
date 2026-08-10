import { NextRequest, NextResponse } from "next/server";
import apiErrorHandler, { ApiError } from "@/utils/handlers/apiError.handler";
import { branchRepository } from "@/server/repositories/branch.repository";
import { BRANCH_MESSAGES } from "@/constants/branch.constant";
import { cookies } from "next/headers";
import httpStatus from "http-status";
import { extractAuthContext } from "@/server/guards/serviceOrder.guard";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const decoded = extractAuthContext(cookieStore, req.headers);

    const branches = await branchRepository.findByCompanyId(decoded.id);
    return NextResponse.json(branches || []);
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al obtener sucursales" }),
      request: req,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const decoded = extractAuthContext(cookieStore, request.headers);

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
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al crear sucursal" }),
      request,
    });
  }
}
