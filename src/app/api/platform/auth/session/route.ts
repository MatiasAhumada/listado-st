import httpStatus from "http-status";
import { NextRequest, NextResponse } from "next/server";
import {
  PLATFORM_ADMIN_SECURITY,
  PLATFORM_ADMIN_TEXT,
} from "@/constants/platformAdmin.constant";
import { PlatformAdminAuthService } from "@/server/service/platformAdminAuth.service";
import { platformAdminLoginSchema } from "@/server/validation/platformAdmin.validation";
import apiErrorHandler from "@/utils/handlers/apiError.handler";
import { isProductionEnvironment } from "@/utils/platformSession.util";
import { parseRequestPayload } from "@/utils/requestValidation.util";

export async function POST(request: NextRequest) {
  try {
    const payload = parseRequestPayload(platformAdminLoginSchema, await request.json());
    const session = await PlatformAdminAuthService.login(payload);
    const response = NextResponse.json(
      { message: PLATFORM_ADMIN_TEXT.sessionCreated, admin: session.admin },
      { status: httpStatus.CREATED }
    );
    response.cookies.set({
      name: PLATFORM_ADMIN_SECURITY.cookieName,
      value: session.token,
      httpOnly: true,
      secure: isProductionEnvironment(),
      sameSite: PLATFORM_ADMIN_SECURITY.cookieSameSite,
      maxAge: PLATFORM_ADMIN_SECURITY.sessionDurationSeconds,
      expires: session.expiresAt,
      path: PLATFORM_ADMIN_SECURITY.cookiePath,
    });
    return response;
  } catch (error) {
    return apiErrorHandler({
      error,
      request,
      fallbackMessage: PLATFORM_ADMIN_TEXT.internalError,
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get(PLATFORM_ADMIN_SECURITY.cookieName)?.value;
    await PlatformAdminAuthService.logout(token);
    const response = NextResponse.json({ message: PLATFORM_ADMIN_TEXT.logoutSuccess });
    response.cookies.delete(PLATFORM_ADMIN_SECURITY.cookieName);
    return response;
  } catch (error) {
    return apiErrorHandler({
      error,
      request,
      fallbackMessage: PLATFORM_ADMIN_TEXT.internalError,
    });
  }
}
