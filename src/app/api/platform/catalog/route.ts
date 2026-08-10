import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CATALOG_TEXT } from "@/constants/catalog.constant";
import { requirePlatformAdminIdentity } from "@/server/guards/platformAdmin.guard";
import { GlobalCatalogService } from "@/server/service/globalCatalog.service";
import apiErrorHandler from "@/utils/handlers/apiError.handler";

export async function GET(request: NextRequest) {
  try {
    await requirePlatformAdminIdentity(await cookies());
    return NextResponse.json(await GlobalCatalogService.getAdminDashboard());
  } catch (error) {
    return apiErrorHandler({
      error,
      request,
      fallbackMessage: CATALOG_TEXT.internalError,
    });
  }
}
