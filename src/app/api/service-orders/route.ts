import { NextRequest, NextResponse } from "next/server";
import { serviceOrderService } from "@/server/service/serviceOrder.service";
import { apiErrorHandler } from "@/utils/handlers/apiError.handler";

export async function GET(request: NextRequest) {
  try {
    const companyId = request.headers.get("x-user-id");

    if (!companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const orders = await serviceOrderService.getServiceOrdersByCompany(companyId);
    return NextResponse.json(orders);
  } catch (error) {
    return apiErrorHandler(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = request.headers.get("x-user-id");

    if (!companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const order = await serviceOrderService.createServiceOrder({
      ...body,
      companyId,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return apiErrorHandler(error);
  }
}
