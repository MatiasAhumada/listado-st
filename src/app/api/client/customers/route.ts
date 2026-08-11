import httpStatus from "http-status";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { TECHNICIAN_TEXT } from "@/constants/technician.constant";
import { requireTechnicianIdentity } from "@/server/guards/technician.guard";
import { WorkshopCustomerService } from "@/server/service/workshopCustomer.service";
import { createWorkshopCustomerSchema } from "@/server/validation/workshopOperations.validation";
import apiErrorHandler from "@/utils/handlers/apiError.handler";
import { parseRequestPayload } from "@/utils/requestValidation.util";

export async function GET(request: NextRequest) {
  try {
    const identity = await requireTechnicianIdentity(await cookies());
    return NextResponse.json(await WorkshopCustomerService.listCustomers(identity));
  } catch (error) {
    return apiErrorHandler({ error, request, fallbackMessage: TECHNICIAN_TEXT.internalError });
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await requireTechnicianIdentity(await cookies());
    const payload = parseRequestPayload(
      createWorkshopCustomerSchema,
      await request.json(),
      TECHNICIAN_TEXT.invalidRequest
    );
    return NextResponse.json(await WorkshopCustomerService.createCustomer(identity, payload), {
      status: httpStatus.CREATED,
    });
  } catch (error) {
    return apiErrorHandler({ error, request, fallbackMessage: TECHNICIAN_TEXT.internalError });
  }
}
