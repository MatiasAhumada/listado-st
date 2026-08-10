import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CATALOG_TEXT } from "@/constants/catalog.constant";
import { requirePlatformAdminIdentity } from "@/server/guards/platformAdmin.guard";
import { GlobalCatalogService } from "@/server/service/globalCatalog.service";
import { publishCatalogBatchSchema } from "@/server/validation/catalog.validation";
import apiErrorHandler from "@/utils/handlers/apiError.handler";
import { parseRequestPayload } from "@/utils/requestValidation.util";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requirePlatformAdminIdentity(await cookies());
    const { id } = await params;
    parseRequestPayload(
      publishCatalogBatchSchema,
      await request.json(),
      CATALOG_TEXT.invalidRequest
    );
    return NextResponse.json(await GlobalCatalogService.publishBatch(id, admin.id));
  } catch (error) {
    return apiErrorHandler({
      error,
      request,
      fallbackMessage: CATALOG_TEXT.internalError,
    });
  }
}
