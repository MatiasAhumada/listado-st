import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { TECHNICIAN_TEXT } from "@/constants/technician.constant";
import { requireTechnicianIdentity } from "@/server/guards/technician.guard";
import { QuoteService } from "@/server/service/quote.service";
import apiErrorHandler from "@/utils/handlers/apiError.handler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await requireTechnicianIdentity(await cookies());
    const { id } = await params;
    return NextResponse.json(await QuoteService.prepareRevision(identity, id));
  } catch (error) {
    return apiErrorHandler({ error, request, fallbackMessage: TECHNICIAN_TEXT.internalError });
  }
}
