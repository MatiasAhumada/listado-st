import { createHash, randomBytes } from "crypto";
import { AUTH_SECURITY } from "@/constants/auth.constant";

export function createSessionToken(): string {
  return randomBytes(AUTH_SECURITY.sessionTokenBytes).toString(
    AUTH_SECURITY.sessionTokenEncoding
  );
}

export function hashSessionToken(token: string): string {
  return createHash(AUTH_SECURITY.sessionHashAlgorithm)
    .update(token)
    .digest(AUTH_SECURITY.sessionHashEncoding);
}

export function calculateSessionExpiration(): Date {
  return new Date(Date.now() + AUTH_SECURITY.sessionDurationMilliseconds);
}

export function isProductionEnvironment(): boolean {
  return (
    process.env.NODE_ENV?.startsWith(AUTH_SECURITY.productionEnvironmentPrefix) ?? false
  );
}
