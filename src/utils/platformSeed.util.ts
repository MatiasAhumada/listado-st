import { randomBytes } from "node:crypto";
import {
  PLATFORM_SEED_ADMIN,
  PLATFORM_SEED_FLAGS,
} from "@/constants/platformSeed.constant";

export function generatePlatformSeedPassword(): string {
  return randomBytes(PLATFORM_SEED_ADMIN.passwordRandomBytes).toString("base64url");
}

export function isPlatformSeedPasswordRotationRequested(argumentsList: string[]): boolean {
  return argumentsList.includes(PLATFORM_SEED_FLAGS.rotatePassword);
}
