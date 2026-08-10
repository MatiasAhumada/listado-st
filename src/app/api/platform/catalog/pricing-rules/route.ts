import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CATALOG_TEXT } from "@/constants/catalog.constant";
import { requirePlatformAdminIdentity } from "@/server/guards/platformAdmin.guard";
import { GlobalCatalogService } from "@/server/service/globalCatalog.service";
import { replaceCatalogPricingRulesSchema } from "@/server/validation/catalog.validation";
import apiErrorHandler from "@/utils/handlers/apiError.handler";
import { parseRequestPayload } from "@/utils/requestValidation.util";

export async function PUT(request: NextRequest) {
  try {
    const admin = await requirePlatformAdminIdentity(await cookies());
    const payload = parseRequestPayload(
      replaceCatalogPricingRulesSchema,
      await request.json(),
      CATALOG_TEXT.invalidRequest
    );
    return NextResponse.json(
      await GlobalCatalogService.replacePricingRules(payload.rules, admin.id)
    );
  } catch (error) {
    return apiErrorHandler({
      error,
      request,
      fallbackMessage: CATALOG_TEXT.internalError,
    });
  }
}
