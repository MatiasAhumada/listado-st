import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { PLATFORM_ADMIN_TEXT } from "@/constants/platformAdmin.constant";
import { requirePlatformAdminIdentity } from "@/server/guards/platformAdmin.guard";
import { SaasPlanService } from "@/server/service/saasPlan.service";
import { saveSaasPlanSchema } from "@/server/validation/saasPlan.validation";
import apiErrorHandler from "@/utils/handlers/apiError.handler";
import { parseRequestPayload } from "@/utils/requestValidation.util";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requirePlatformAdminIdentity(await cookies());
    const { id } = await params;
    const payload = parseRequestPayload(saveSaasPlanSchema, await request.json());
    return NextResponse.json(await SaasPlanService.updatePlan(id, payload, admin.id));
  } catch (error) {
    return apiErrorHandler({
      error,
      request,
      fallbackMessage: PLATFORM_ADMIN_TEXT.internalError,
    });
  }
}
