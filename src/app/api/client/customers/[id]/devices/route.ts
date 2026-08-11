import httpStatus from "http-status";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { TECHNICIAN_TEXT } from "@/constants/technician.constant";
import { requireTechnicianIdentity } from "@/server/guards/technician.guard";
import { WorkshopCustomerService } from "@/server/service/workshopCustomer.service";
import { mobileDeviceSchema } from "@/server/validation/workshopOperations.validation";
import apiErrorHandler from "@/utils/handlers/apiError.handler";
import { parseRequestPayload } from "@/utils/requestValidation.util";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await requireTechnicianIdentity(await cookies());
    const { id } = await params;
    const payload = parseRequestPayload(
      mobileDeviceSchema,
      await request.json(),
      TECHNICIAN_TEXT.invalidRequest
    );
    return NextResponse.json(await WorkshopCustomerService.addDevice(identity, id, payload), {
      status: httpStatus.CREATED,
    });
  } catch (error) {
    return apiErrorHandler({ error, request, fallbackMessage: TECHNICIAN_TEXT.internalError });
  }
}
