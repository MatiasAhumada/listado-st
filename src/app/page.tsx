import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_ROUTES } from "@/constants/access.constant";
import { PLATFORM_ADMIN_ROUTES } from "@/constants/platformAdmin.constant";
import { TECHNICIAN_ROUTES } from "@/constants/technician.constant";
import { getPlatformAdminIdentity } from "@/server/guards/platformAdmin.guard";
import { getTechnicianIdentity } from "@/server/guards/technician.guard";

export default async function HomePage() {
  const cookieStore = await cookies();
  const [adminIdentity, clientIdentity] = await Promise.all([
    getPlatformAdminIdentity(cookieStore),
    getTechnicianIdentity(cookieStore),
  ]);

  if (adminIdentity) redirect(PLATFORM_ADMIN_ROUTES.dashboard);
  if (clientIdentity) redirect(TECHNICIAN_ROUTES.dashboard);
  redirect(ACCESS_ROUTES.login);
}
