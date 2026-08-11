import httpStatus from "http-status";
import { NextRequest, NextResponse } from "next/server";
import { ACCESS_ROLES, ACCESS_TEXT } from "@/constants/access.constant";
import { PLATFORM_ADMIN_SECURITY } from "@/constants/platformAdmin.constant";
import { TECHNICIAN_SECURITY } from "@/constants/technician.constant";
import { AccessAuthService } from "@/server/service/accessAuth.service";
import { PlatformAdminAuthService } from "@/server/service/platformAdminAuth.service";
import { TechnicianAuthService } from "@/server/service/technicianAuth.service";
import { accessLoginSchema } from "@/server/validation/access.validation";
import apiErrorHandler from "@/utils/handlers/apiError.handler";
import { parseRequestPayload } from "@/utils/requestValidation.util";
import { isProductionEnvironment } from "@/utils/session.util";

export async function POST(request: NextRequest) {
  try {
    const payload = parseRequestPayload(accessLoginSchema, await request.json());
    const result = await AccessAuthService.login(payload);
    const security = result.role === ACCESS_ROLES.admin ? PLATFORM_ADMIN_SECURITY : TECHNICIAN_SECURITY;
    const response = NextResponse.json(
      { role: result.role, destination: result.destination },
      { status: httpStatus.CREATED }
    );
    response.cookies.delete(
      result.role === ACCESS_ROLES.admin
        ? TECHNICIAN_SECURITY.cookieName
        : PLATFORM_ADMIN_SECURITY.cookieName
    );
    response.cookies.set({
      name: security.cookieName,
      value: result.session.token,
      httpOnly: true,
      secure: isProductionEnvironment(),
      sameSite: security.cookieSameSite,
      maxAge: security.sessionDurationSeconds,
      expires: result.session.expiresAt,
      path: security.cookiePath,
    });
    return response;
  } catch (error) {
    return apiErrorHandler({ error, request, fallbackMessage: ACCESS_TEXT.internalError });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminToken = request.cookies.get(PLATFORM_ADMIN_SECURITY.cookieName)?.value;
    const technicianToken = request.cookies.get(TECHNICIAN_SECURITY.cookieName)?.value;
    await Promise.all([
      PlatformAdminAuthService.logout(adminToken),
      TechnicianAuthService.logout(technicianToken),
    ]);
    const response = NextResponse.json({ message: ACCESS_TEXT.logoutSuccess });
    response.cookies.delete(PLATFORM_ADMIN_SECURITY.cookieName);
    response.cookies.delete(TECHNICIAN_SECURITY.cookieName);
    return response;
  } catch (error) {
    return apiErrorHandler({ error, request, fallbackMessage: ACCESS_TEXT.internalError });
  }
}
