import { TECHNICIAN_SECURITY } from "@/constants/technician.constant";
import { SessionCookieStore } from "@/interfaces/session.interface";
import { TechnicianIdentity } from "@/interfaces/technician.interface";
import { TechnicianAuthService } from "@/server/service/technicianAuth.service";

export async function getTechnicianIdentity(
  cookieStore: SessionCookieStore
): Promise<TechnicianIdentity | undefined> {
  return TechnicianAuthService.getIdentity(
    cookieStore.get(TECHNICIAN_SECURITY.cookieName)?.value
  );
}

export async function requireTechnicianIdentity(
  cookieStore: SessionCookieStore
): Promise<TechnicianIdentity> {
  return TechnicianAuthService.requireIdentity(
    cookieStore.get(TECHNICIAN_SECURITY.cookieName)?.value
  );
}
