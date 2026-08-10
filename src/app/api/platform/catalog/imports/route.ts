import httpStatus from "http-status";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CATALOG_FIELDS, CATALOG_TEXT } from "@/constants/catalog.constant";
import { requirePlatformAdminIdentity } from "@/server/guards/platformAdmin.guard";
import { GlobalCatalogService } from "@/server/service/globalCatalog.service";
import apiErrorHandler, { ApiError } from "@/utils/handlers/apiError.handler";

export async function POST(request: NextRequest) {
  try {
    const admin = await requirePlatformAdminIdentity(await cookies());
    const formData = await request.formData();
    const file = formData.get(CATALOG_FIELDS.upload);
    if (!(file instanceof File)) {
      throw new ApiError({
        status: httpStatus.BAD_REQUEST,
        message: CATALOG_TEXT.invalidFile,
      });
    }
    const dashboard = await GlobalCatalogService.importWorkbook(file, admin.id);
    return NextResponse.json(dashboard, { status: httpStatus.CREATED });
  } catch (error) {
    return apiErrorHandler({
      error,
      request,
      fallbackMessage: CATALOG_TEXT.internalError,
    });
  }
}
