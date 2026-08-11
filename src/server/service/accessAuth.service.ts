import { ACCESS_ROLES, ACCESS_TEXT } from "@/constants/access.constant";
import { PLATFORM_ADMIN_ROUTES } from "@/constants/platformAdmin.constant";
import { TECHNICIAN_ROUTES } from "@/constants/technician.constant";
import { AccessLoginPayload } from "@/interfaces/access.interface";
import { AccessIdentityRepository } from "@/server/repositories/accessIdentity.repository";
import { PlatformAdminAuthService } from "@/server/service/platformAdminAuth.service";
import { TechnicianAuthService } from "@/server/service/technicianAuth.service";
import { ApiError } from "@/utils/handlers/apiError.handler";
import httpStatus from "http-status";

export class AccessAuthService {
  static async login(payload: AccessLoginPayload) {
    const { admin, technician } = await AccessIdentityRepository.findByUsername(payload.username);

    if (admin && technician) {
      throw new ApiError({ message: ACCESS_TEXT.internalError, isOperational: false });
    }
    if (admin) {
      const session = await PlatformAdminAuthService.login(payload);
      return {
        role: ACCESS_ROLES.admin,
        destination: PLATFORM_ADMIN_ROUTES.dashboard,
        session,
      } as const;
    }
    if (technician) {
      const session = await TechnicianAuthService.login(payload);
      return {
        role: ACCESS_ROLES.client,
        destination: TECHNICIAN_ROUTES.dashboard,
        session,
      } as const;
    }

    throw new ApiError({
      status: httpStatus.UNAUTHORIZED,
      message: ACCESS_TEXT.invalidCredentials,
    });
  }
}
