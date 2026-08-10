import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  CATALOG_DEFAULTS,
  CATALOG_TEXT,
} from "@/constants/catalog.constant";
import { requireTechnicianIdentity } from "@/server/guards/technician.guard";
import { GlobalCatalogService } from "@/server/service/globalCatalog.service";
import { catalogSearchSchema } from "@/server/validation/catalog.validation";
import apiErrorHandler from "@/utils/handlers/apiError.handler";
import { parseRequestPayload } from "@/utils/requestValidation.util";

export async function GET(request: NextRequest) {
  try {
    await requireTechnicianIdentity(await cookies());
    const payload = parseRequestPayload(
      catalogSearchSchema,
      { query: request.nextUrl.searchParams.get("query") ?? CATALOG_DEFAULTS.emptySearch },
      CATALOG_TEXT.invalidRequest
    );
    return NextResponse.json(
      await GlobalCatalogService.searchPublishedCatalog(payload.query)
    );
  } catch (error) {
    return apiErrorHandler({
      error,
      request,
      fallbackMessage: CATALOG_TEXT.internalError,
    });
  }
}
