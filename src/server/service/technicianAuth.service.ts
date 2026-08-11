import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { TECHNICIAN_TEXT } from "@/constants/technician.constant";
import {
  TechnicianIdentity,
  TechnicianLoginPayload,
  TechnicianSessionResult,
} from "@/interfaces/technician.interface";
import { hasTechnicianAccess } from "@/server/domain/technicianAccess.domain";
import {
  TechnicianAuthRepository,
  TechnicianWithWorkshopAccess,
} from "@/server/repositories/technicianAuth.repository";
import { ApiError } from "@/utils/handlers/apiError.handler";
import {
  calculateSessionExpiration,
  createSessionToken,
  hashSessionToken,
} from "@/utils/session.util";

export class TechnicianAuthService {
  static async login(payload: TechnicianLoginPayload): Promise<TechnicianSessionResult> {
    const technician = await TechnicianAuthRepository.findByUsername(payload.username);
    if (!technician) {
      throw new ApiError({
        status: httpStatus.UNAUTHORIZED,
        message: TECHNICIAN_TEXT.invalidCredentials,
      });
    }

    const passwordMatches = await bcrypt.compare(payload.password, technician.passwordHash);
    if (!passwordMatches) {
      throw new ApiError({
        status: httpStatus.UNAUTHORIZED,
        message: TECHNICIAN_TEXT.invalidCredentials,
      });
    }

    const subscription = technician.workshop.subscription;
    const hasAccess = hasTechnicianAccess({
      technicianStatus: technician.status,
      workshopStatus: technician.workshop.status,
      subscriptionStatus: subscription?.status,
    });
    if (!subscription || !hasAccess) {
      throw new ApiError({
        status: httpStatus.FORBIDDEN,
        message: TECHNICIAN_TEXT.accessUnavailable,
      });
    }

    const token = createSessionToken();
    const expiresAt = calculateSessionExpiration();
    await TechnicianAuthRepository.createSession({
      technicianId: technician.id,
      tokenHash: hashSessionToken(token),
      expiresAt,
    });

    return {
      token,
      expiresAt,
      technician: this.toIdentity(technician),
    };
  }

  static async getIdentity(token?: string): Promise<TechnicianIdentity | undefined> {
    if (!token) return undefined;

    const session = await TechnicianAuthRepository.findValidSession(
      hashSessionToken(token),
      new Date()
    );
    if (!session?.technician.workshop.subscription) return undefined;

    return this.toIdentity(session.technician);
  }

  static async requireIdentity(token?: string): Promise<TechnicianIdentity> {
    const identity = await this.getIdentity(token);
    if (!identity) {
      throw new ApiError({
        status: httpStatus.UNAUTHORIZED,
        message: TECHNICIAN_TEXT.unauthenticated,
      });
    }
    return identity;
  }

  static async logout(token?: string): Promise<void> {
    if (!token) return;
    await TechnicianAuthRepository.revokeSession(hashSessionToken(token));
  }

  private static toIdentity(technician: TechnicianWithWorkshopAccess): TechnicianIdentity {
    const subscription = technician.workshop.subscription;
    if (!subscription) {
      throw new ApiError({ message: TECHNICIAN_TEXT.internalError, isOperational: false });
    }

    return {
      id: technician.id,
      workshopId: technician.workshopId,
      username: technician.username,
      displayName: technician.displayName,
      workshopName: technician.workshop.name,
      workshopSlug: technician.workshop.slug,
      plan: {
        id: subscription.plan.id,
        code: subscription.plan.code,
        name: subscription.plan.name,
        isActive: subscription.plan.isActive,
      },
      subscriptionStatus: subscription.status,
    };
  }
}
