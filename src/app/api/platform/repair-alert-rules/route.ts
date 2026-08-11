import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { REPAIR_TEXT } from "@/constants/repairOperations.constant";
import { requirePlatformAdminIdentity } from "@/server/guards/platformAdmin.guard";
import { RepairAlertRuleService } from "@/server/service/repair.service";
import { updateRepairAlertRulesSchema } from "@/server/validation/repairOperations.validation";
import apiErrorHandler from "@/utils/handlers/apiError.handler";
import { parseRequestPayload } from "@/utils/requestValidation.util";

export async function GET(request: NextRequest) {
  try {
    await requirePlatformAdminIdentity(await cookies());
    return NextResponse.json(await RepairAlertRuleService.listRules());
  } catch (error) {
    return apiErrorHandler({ error, request, fallbackMessage: REPAIR_TEXT.invalidRequest });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const identity = await requirePlatformAdminIdentity(await cookies());
    const payload = parseRequestPayload(updateRepairAlertRulesSchema, await request.json(), REPAIR_TEXT.invalidRequest);
    return NextResponse.json(await RepairAlertRuleService.saveRules(identity, payload));
  } catch (error) {
    return apiErrorHandler({ error, request, fallbackMessage: REPAIR_TEXT.invalidRequest });
  }
}
