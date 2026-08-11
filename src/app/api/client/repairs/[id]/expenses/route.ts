import httpStatus from "http-status";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { REPAIR_TEXT } from "@/constants/repairOperations.constant";
import { requireTechnicianIdentity } from "@/server/guards/technician.guard";
import { RepairService } from "@/server/service/repair.service";
import { createRepairExpenseSchema } from "@/server/validation/repairOperations.validation";
import apiErrorHandler from "@/utils/handlers/apiError.handler";
import { parseRequestPayload } from "@/utils/requestValidation.util";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const identity = await requireTechnicianIdentity(await cookies());
    const { id } = await params;
    const payload = parseRequestPayload(createRepairExpenseSchema, await request.json(), REPAIR_TEXT.invalidRequest);
    return NextResponse.json(await RepairService.addExpense(identity, id, payload), {
      status: httpStatus.CREATED,
    });
  } catch (error) {
    return apiErrorHandler({ error, request, fallbackMessage: REPAIR_TEXT.invalidRequest });
  }
}
