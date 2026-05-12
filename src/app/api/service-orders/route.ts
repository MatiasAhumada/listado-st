import { NextRequest, NextResponse } from "next/server";
import { serviceOrderService } from "@/server/service/serviceOrder.service";
import { emailService } from "@/server/service/email.service";
import apiErrorHandler from "@/utils/handlers/apiError.handler";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { ApiError } from "@/utils/handlers/apiError.handler";
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

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const decoded = getAuthContext(cookieStore, request.headers);

    const orders = await serviceOrderService.getServiceOrdersByUser(decoded.id, decoded.role);
    return NextResponse.json(orders);
  } catch (error: any) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al obtener órdenes" }),
      request,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const decoded = getAuthContext(cookieStore, request.headers);

    const body = await request.json();

    let companyId = decoded.id;
    let branchId = undefined;

    if (decoded.role === "VENDEDOR") {
      const { UserRepository } = await import("@/server/repositories/user.repository");
      const vendedor = await UserRepository.findById(decoded.id);
      if (!vendedor?.companyId) {
        throw new ApiError({ status: httpStatus.FORBIDDEN, message: "Vendedor sin empresa asignada" });
      }
      companyId = vendedor.companyId;
      branchId = vendedor.branchId || undefined;
    }

    const order = await serviceOrderService.createServiceOrder({
      ...body,
      companyId,
      sellerId: decoded.id,
      branchId,
      clientId: body.clientId || undefined,
      deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : undefined,
      advancePayment: body.advancePayment || undefined,
      balance: body.balance || undefined,
    });

    try {
      const totalTech = order.products?.reduce((sum, p) => sum + p.costTech, 0) || 0;
      
      await emailService.sendServiceOrderNotification({
        clientName: order.clientName,
        clientPhone: order.clientPhone,
        branchName: order.branch?.name,
        products: order.products?.map(p => ({
          productName: p.productName,
          cost: p.costTech,
        })) || [],
        totalTech,
        deliveryDate: order.deliveryDate?.toISOString(),
        orderNumber: order.id.slice(0, 8).toUpperCase(),
      });
    } catch (emailError) {
      console.error("Error al enviar email de notificación:", emailError);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Error creating service order:", error);
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: error.message || "Error al crear orden" }),
      request,
    });
  }
}
