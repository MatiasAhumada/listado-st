import httpStatus from "http-status";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { PLATFORM_ADMIN_TEXT } from "@/constants/platformAdmin.constant";
import { requirePlatformAdminIdentity } from "@/server/guards/platformAdmin.guard";
import { PlatformWorkshopService } from "@/server/service/platformWorkshop.service";
import { createWorkshopSchema } from "@/server/validation/platformAdmin.validation";
import apiErrorHandler from "@/utils/handlers/apiError.handler";
import { parseRequestPayload } from "@/utils/requestValidation.util";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    await requirePlatformAdminIdentity(cookieStore);
    const workshops = await PlatformWorkshopService.listWorkshops();
    return NextResponse.json(workshops);
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
    const cookieStore = await cookies();
    const admin = await requirePlatformAdminIdentity(cookieStore);
    const payload = parseRequestPayload(createWorkshopSchema, await request.json());
    const workshop = await PlatformWorkshopService.createWorkshop(payload, admin.id);
    return NextResponse.json(workshop, { status: httpStatus.CREATED });
  } catch (error) {
    return apiErrorHandler({
      error,
      request,
      fallbackMessage: PLATFORM_ADMIN_TEXT.internalError,
    });
  }
}
