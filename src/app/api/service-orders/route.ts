import { NextRequest, NextResponse } from "next/server";
import { serviceOrderService } from "@/server/service/serviceOrder.service";
import { emailService } from "@/server/service/email.service";
import apiErrorHandler, { ApiError } from "@/utils/handlers/apiError.handler";
import { cookies } from "next/headers";
import { extractAuthContext } from "@/server/guards/serviceOrder.guard";
import { SERVICE_ORDER_ERRORS } from "@/constants/serviceOrder.constant";
import { Role } from "@prisma/client";
import httpStatus from "http-status";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const auth = extractAuthContext(cookieStore, request.headers);

    const orders = await serviceOrderService.getServiceOrdersByUser(auth);
    return NextResponse.json(orders);
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al obtener órdenes" }),
      request,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const auth = extractAuthContext(cookieStore, request.headers);

    const body = await request.json();

    let companyId: string;
    let branchId: string | undefined;

    if (auth.role === Role.TECNICO) {
      if (!body.companyId) {
        throw new ApiError({ status: httpStatus.BAD_REQUEST, message: SERVICE_ORDER_ERRORS.TECNICO_REQUIRES_COMPANY });
      }
      companyId = body.companyId;
    } else if (auth.role === Role.VENDEDOR) {
      const { UserRepository } = await import("@/server/repositories/user.repository");
      const vendedor = await UserRepository.findById(auth.id);
      if (!vendedor?.companyId) {
        throw new ApiError({ status: httpStatus.FORBIDDEN, message: "Vendedor sin empresa asignada" });
      }
      companyId = vendedor.companyId;
      branchId = vendedor.branchId ?? undefined;
    } else {
      companyId = auth.id;
    }

    const order = await serviceOrderService.createServiceOrder({
      ...body,
      companyId,
      sellerId: auth.id,
      branchId,
      clientId: body.clientId ?? undefined,
      deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : undefined,
      advancePayment: body.advancePayment ?? undefined,
      balance: body.balance ?? undefined,
    });

    try {
      const totalCostTech = order.items?.reduce((sum, p) => sum + p.totalCostTech, 0) ?? 0;
      const totalClientPrice = order.items?.reduce((sum, p) => sum + p.totalPrice, 0) ?? 0;

      await emailService.sendServiceOrderNotification({
        clientName: order.clientName,
        clientPhone: order.clientPhone,
        branchName: order.branch?.name,
        items:
          order.items?.map((p) => ({
            serviceName: p.serviceName,
            unitCostTech: p.unitCostTech,
            unitPrice: p.unitPrice,
          })) ?? [],
        totalCostTech,
        totalClientPrice,
        deliveryDate: order.deliveryDate?.toISOString(),
        orderNumber: order.id.slice(0, 8).toUpperCase(),
      });
    } catch {
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al crear orden" }),
      request,
    });
  }
}
