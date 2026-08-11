import httpStatus from "http-status";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { PLATFORM_ADMIN_TEXT } from "@/constants/platformAdmin.constant";
import { requirePlatformAdminIdentity } from "@/server/guards/platformAdmin.guard";
import { SaasPlanService } from "@/server/service/saasPlan.service";
import { saveSaasPlanSchema } from "@/server/validation/saasPlan.validation";
import apiErrorHandler from "@/utils/handlers/apiError.handler";
import { parseRequestPayload } from "@/utils/requestValidation.util";

export async function GET(request: NextRequest) {
  try {
    await requirePlatformAdminIdentity(await cookies());
    return NextResponse.json(await SaasPlanService.listPlans());
  } catch (error) {
    return apiErrorHandler({
      error,
      request,
      fallbackMessage: PLATFORM_ADMIN_TEXT.internalError,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requirePlatformAdminIdentity(await cookies());
    const payload = parseRequestPayload(saveSaasPlanSchema, await request.json());
    const plan = await SaasPlanService.createPlan(payload, admin.id);
    return NextResponse.json(plan, { status: httpStatus.CREATED });
  } catch (error) {
    return apiErrorHandler({
      error,
      request,
      fallbackMessage: PLATFORM_ADMIN_TEXT.internalError,
    });
  }
}
