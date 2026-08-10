import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { TECHNICIAN_TEXT } from "@/constants/technician.constant";
import { requireTechnicianIdentity } from "@/server/guards/technician.guard";
import { technicianWorkspaceService } from "@/server/service/technicianWorkspace.service";
import apiErrorHandler from "@/utils/handlers/apiError.handler";

export async function GET(request: NextRequest) {
  try {
    const identity = await requireTechnicianIdentity(await cookies());
    const workspace = await technicianWorkspaceService.getWorkspace(identity);
    return NextResponse.json(workspace);
  } catch (error) {
    return apiErrorHandler({
      error,
      request,
      fallbackMessage: TECHNICIAN_TEXT.internalError,
    });
  }
}
