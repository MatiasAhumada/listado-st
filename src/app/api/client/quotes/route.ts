import httpStatus from "http-status";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { TECHNICIAN_TEXT } from "@/constants/technician.constant";
import { requireTechnicianIdentity } from "@/server/guards/technician.guard";
import { QuoteService } from "@/server/service/quote.service";
import { saveQuoteSchema } from "@/server/validation/workshopOperations.validation";
import apiErrorHandler from "@/utils/handlers/apiError.handler";
import { parseRequestPayload } from "@/utils/requestValidation.util";

export async function GET(request: NextRequest) {
  try {
    const identity = await requireTechnicianIdentity(await cookies());
    return NextResponse.json(await QuoteService.listQuotes(identity));
  } catch (error) {
    return apiErrorHandler({ error, request, fallbackMessage: TECHNICIAN_TEXT.internalError });
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await requireTechnicianIdentity(await cookies());
    const payload = parseRequestPayload(
      saveQuoteSchema,
      await request.json(),
      TECHNICIAN_TEXT.invalidRequest
    );
    return NextResponse.json(await QuoteService.createQuote(identity, payload), {
      status: httpStatus.CREATED,
    });
  } catch (error) {
    return apiErrorHandler({ error, request, fallbackMessage: TECHNICIAN_TEXT.internalError });
  }
}
