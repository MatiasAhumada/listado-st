import httpStatus from "http-status";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { REPAIR_TEXT } from "@/constants/repairOperations.constant";
import { requireTechnicianIdentity } from "@/server/guards/technician.guard";
import { RepairService } from "@/server/service/repair.service";
import { reverseFinancialEntrySchema } from "@/server/validation/repairOperations.validation";
import apiErrorHandler from "@/utils/handlers/apiError.handler";
import { parseRequestPayload } from "@/utils/requestValidation.util";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; paymentId: string }> }) {
  try {
    const identity = await requireTechnicianIdentity(await cookies());
    const { id, paymentId } = await params;
    const payload = parseRequestPayload(reverseFinancialEntrySchema, await request.json(), REPAIR_TEXT.invalidRequest);
    return NextResponse.json(await RepairService.reversePayment(identity, id, paymentId, payload), {
      status: httpStatus.CREATED,
    });
  } catch (error) {
    return apiErrorHandler({ error, request, fallbackMessage: REPAIR_TEXT.invalidRequest });
  }
}
