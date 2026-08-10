import httpStatus from "http-status";
import { NextRequest, NextResponse } from "next/server";
import { TECHNICIAN_SECURITY, TECHNICIAN_TEXT } from "@/constants/technician.constant";
import { TechnicianAuthService } from "@/server/service/technicianAuth.service";
import { technicianLoginSchema } from "@/server/validation/technician.validation";
import apiErrorHandler from "@/utils/handlers/apiError.handler";
import { parseRequestPayload } from "@/utils/requestValidation.util";
import { isProductionEnvironment } from "@/utils/session.util";

export async function POST(request: NextRequest) {
  try {
    const payload = parseRequestPayload(technicianLoginSchema, await request.json());
    const session = await TechnicianAuthService.login(payload);
    const response = NextResponse.json(
      { message: TECHNICIAN_TEXT.sessionCreated, client: session.technician },
      { status: httpStatus.CREATED }
    );
    response.cookies.set({
      name: TECHNICIAN_SECURITY.cookieName,
      value: session.token,
      httpOnly: true,
      secure: isProductionEnvironment(),
      sameSite: TECHNICIAN_SECURITY.cookieSameSite,
      maxAge: TECHNICIAN_SECURITY.sessionDurationSeconds,
      expires: session.expiresAt,
      path: TECHNICIAN_SECURITY.cookiePath,
    });
    return response;
  } catch (error) {
    return apiErrorHandler({
      error,
      request,
      fallbackMessage: TECHNICIAN_TEXT.internalError,
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get(TECHNICIAN_SECURITY.cookieName)?.value;
    await TechnicianAuthService.logout(token);
    const response = NextResponse.json({ message: TECHNICIAN_TEXT.logoutSuccess });
    response.cookies.delete(TECHNICIAN_SECURITY.cookieName);
    return response;
  } catch (error) {
    return apiErrorHandler({
      error,
      request,
      fallbackMessage: TECHNICIAN_TEXT.internalError,
    });
  }
}
