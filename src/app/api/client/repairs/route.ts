import httpStatus from "http-status";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { REPAIR_TEXT } from "@/constants/repairOperations.constant";
import { requireTechnicianIdentity } from "@/server/guards/technician.guard";
import { RepairService } from "@/server/service/repair.service";
import { createRepairSchema } from "@/server/validation/repairOperations.validation";
import apiErrorHandler from "@/utils/handlers/apiError.handler";
import { parseRequestPayload } from "@/utils/requestValidation.util";

export async function GET(request: NextRequest) {
  try {
    const identity = await requireTechnicianIdentity(await cookies());
    return NextResponse.json(await RepairService.listRepairs(identity));
  } catch (error) {
    return apiErrorHandler({ error, request, fallbackMessage: REPAIR_TEXT.invalidRequest });
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await requireTechnicianIdentity(await cookies());
    const payload = parseRequestPayload(createRepairSchema, await request.json(), REPAIR_TEXT.invalidRequest);
    return NextResponse.json(await RepairService.createRepair(identity, payload), {
      status: httpStatus.CREATED,
    });
  } catch (error) {
    return apiErrorHandler({ error, request, fallbackMessage: REPAIR_TEXT.invalidRequest });
  }
}
