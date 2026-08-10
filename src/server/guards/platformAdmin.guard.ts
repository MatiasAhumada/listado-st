import { PLATFORM_ADMIN_SECURITY } from "@/constants/platformAdmin.constant";
import { PlatformAdminIdentity } from "@/interfaces/platformAdmin.interface";
import { PlatformAdminAuthService } from "@/server/service/platformAdminAuth.service";

interface PlatformCookieStore {
  get: (name: string) => { value: string } | undefined;
}

export async function getPlatformAdminIdentity(
  cookieStore: PlatformCookieStore
): Promise<PlatformAdminIdentity | undefined> {
  return PlatformAdminAuthService.getIdentity(
    cookieStore.get(PLATFORM_ADMIN_SECURITY.cookieName)?.value
  );
}

export async function requirePlatformAdminIdentity(
  cookieStore: PlatformCookieStore
): Promise<PlatformAdminIdentity> {
  return PlatformAdminAuthService.requireIdentity(
    cookieStore.get(PLATFORM_ADMIN_SECURITY.cookieName)?.value
  );
}
