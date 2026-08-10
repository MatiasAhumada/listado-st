import { NextRequest, NextResponse } from "next/server";
import { clientRepository } from "@/server/repositories/client.repository";
import { CLIENT_MESSAGES } from "@/constants/client.constant";
import { ApiError } from "@/utils/handlers/apiError.handler";
import apiErrorHandler from "@/utils/handlers/apiError.handler";
import { cookies } from "next/headers";
import httpStatus from "http-status";
import { extractAuthContext } from "@/server/guards/serviceOrder.guard";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const decoded = extractAuthContext(cookieStore, request.headers);

    let companyId: string;

    if (decoded.role === "EMPRESA") {
      companyId = decoded.id;
    } else if (decoded.role === "VENDEDOR") {
      if (!decoded.companyId) {
        throw new ApiError({ status: httpStatus.FORBIDDEN, message: "Vendedor sin empresa asignada" });
      }
      companyId = decoded.companyId;
    } else {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "No autorizado" });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");

    const clients = search
      ? await clientRepository.search(companyId, search)
      : await clientRepository.findByCompanyId(companyId);

    return NextResponse.json(clients);
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al obtener clientes" }),
      request,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const decoded = extractAuthContext(cookieStore, request.headers);

    let companyId: string;

    if (decoded.role === "EMPRESA") {
      companyId = decoded.id;
    } else if (decoded.role === "VENDEDOR") {
      if (!decoded.companyId) {
        throw new ApiError({ status: httpStatus.FORBIDDEN, message: "Vendedor sin empresa asignada" });
      }
      companyId = decoded.companyId;
    } else {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: "No autorizado" });
    }

    const body = await request.json();
    const { fullName, dni, phone, email, address } = body;

    if (!fullName || !dni) {
      throw new ApiError({ status: httpStatus.BAD_REQUEST, message: "Nombre completo y DNI son obligatorios" });
    }

    const existingClient = await clientRepository.findByDni(companyId, dni);
    if (existingClient) {
      throw new ApiError({ status: httpStatus.BAD_REQUEST, message: CLIENT_MESSAGES.DNI_EXISTS });
    }

    const client = await clientRepository.create({
      fullName,
      dni,
      phone,
      email,
      address,
      companyId,
    });

    return NextResponse.json({ message: CLIENT_MESSAGES.CREATED, client }, { status: 201 });
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al crear cliente" }),
      request,
    });
  }
}
