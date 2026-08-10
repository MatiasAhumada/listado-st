import { createHash, randomBytes } from "crypto";
import { PLATFORM_ADMIN_SECURITY } from "@/constants/platformAdmin.constant";

export function createPlatformSessionToken(): string {
  return randomBytes(PLATFORM_ADMIN_SECURITY.sessionTokenBytes).toString(
    PLATFORM_ADMIN_SECURITY.sessionTokenEncoding
  );
}

export function hashPlatformSessionToken(token: string): string {
  return createHash(PLATFORM_ADMIN_SECURITY.sessionHashAlgorithm).update(token).digest("hex");
}

export function calculatePlatformSessionExpiration(): Date {
  return new Date(Date.now() + PLATFORM_ADMIN_SECURITY.sessionDurationMilliseconds);
}

export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV?.startsWith("prod") ?? false;
}
