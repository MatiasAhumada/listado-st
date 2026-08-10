import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { PlatformAdminRepository } from "@/server/repositories/platformAdmin.repository";
import {
  PlatformAdminIdentity,
  PlatformAdminLoginPayload,
  PlatformAdminSessionResult,
} from "@/interfaces/platformAdmin.interface";
import { PLATFORM_ADMIN_TEXT } from "@/constants/platformAdmin.constant";
import { ApiError } from "@/utils/handlers/apiError.handler";
import {
  calculateSessionExpiration,
  createSessionToken,
  hashSessionToken,
} from "@/utils/session.util";

export class PlatformAdminAuthService {
  static async login(payload: PlatformAdminLoginPayload): Promise<PlatformAdminSessionResult> {
    const admin = await PlatformAdminRepository.findByEmail(payload.email);

    if (!admin) {
      throw new ApiError({ status: httpStatus.UNAUTHORIZED, message: PLATFORM_ADMIN_TEXT.invalidCredentials });
    }

    const passwordMatches = await bcrypt.compare(payload.password, admin.passwordHash);
    if (!passwordMatches) {
      throw new ApiError({ status: httpStatus.UNAUTHORIZED, message: PLATFORM_ADMIN_TEXT.invalidCredentials });
    }
    if (!admin.isActive) {
      throw new ApiError({ status: httpStatus.FORBIDDEN, message: PLATFORM_ADMIN_TEXT.inactiveAdmin });
    }

    const token = createSessionToken();
    const expiresAt = calculateSessionExpiration();
    await PlatformAdminRepository.createSession({
      adminId: admin.id,
      tokenHash: hashSessionToken(token),
      expiresAt,
    });

    return {
      token,
      expiresAt,
      admin: {
        id: admin.id,
        email: admin.email,
        displayName: admin.displayName,
      },
    };
  }

  static async getIdentity(token?: string): Promise<PlatformAdminIdentity | undefined> {
    if (!token) return undefined;

    const session = await PlatformAdminRepository.findValidSession(
      hashSessionToken(token),
      new Date()
    );
    if (!session) return undefined;

    return {
      id: session.admin.id,
      email: session.admin.email,
      displayName: session.admin.displayName,
    };
  }

  static async requireIdentity(token?: string): Promise<PlatformAdminIdentity> {
    const identity = await this.getIdentity(token);
    if (!identity) {
      throw new ApiError({ status: httpStatus.UNAUTHORIZED, message: PLATFORM_ADMIN_TEXT.unauthenticated });
    }

    return identity;
  }

  static async logout(token?: string): Promise<void> {
    if (!token) return;
    await PlatformAdminRepository.revokeSession(hashSessionToken(token));
  }
}
