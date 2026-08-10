import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { PLATFORM_ADMIN_TEXT } from "@/constants/platformAdmin.constant";
import { requirePlatformAdminIdentity } from "@/server/guards/platformAdmin.guard";
import { PlatformWorkshopService } from "@/server/service/platformWorkshop.service";
import { updateWorkshopStatusSchema } from "@/server/validation/platformAdmin.validation";
import apiErrorHandler from "@/utils/handlers/apiError.handler";
import { parseRequestPayload } from "@/utils/requestValidation.util";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const admin = await requirePlatformAdminIdentity(cookieStore);
    const { id } = await params;
    const payload = parseRequestPayload(updateWorkshopStatusSchema, await request.json());
    const workshop = await PlatformWorkshopService.updateWorkshopStatus(id, payload, admin.id);
    return NextResponse.json(workshop);
  } catch (error) {
    return apiErrorHandler({
      error,
      request,
      fallbackMessage: PLATFORM_ADMIN_TEXT.internalError,
    });
  }
}
