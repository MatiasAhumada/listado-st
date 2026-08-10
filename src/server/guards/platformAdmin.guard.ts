import { PLATFORM_ADMIN_SECURITY } from "@/constants/platformAdmin.constant";
import { PlatformAdminIdentity } from "@/interfaces/platformAdmin.interface";
import { SessionCookieStore } from "@/interfaces/session.interface";
import { PlatformAdminAuthService } from "@/server/service/platformAdminAuth.service";

export async function getPlatformAdminIdentity(
  cookieStore: SessionCookieStore
): Promise<PlatformAdminIdentity | undefined> {
  return PlatformAdminAuthService.getIdentity(
    cookieStore.get(PLATFORM_ADMIN_SECURITY.cookieName)?.value
  );
}

export async function requirePlatformAdminIdentity(
  cookieStore: SessionCookieStore
): Promise<PlatformAdminIdentity> {
  return PlatformAdminAuthService.requireIdentity(
    cookieStore.get(PLATFORM_ADMIN_SECURITY.cookieName)?.value
  );
}
