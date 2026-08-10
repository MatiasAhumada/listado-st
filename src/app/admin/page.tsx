import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { PLATFORM_ADMIN_ROUTES } from "@/constants/platformAdmin.constant";
import { getPlatformAdminIdentity } from "@/server/guards/platformAdmin.guard";
import { PlatformWorkshopService } from "@/server/service/platformWorkshop.service";

export default async function AdminPage() {
  const admin = await getPlatformAdminIdentity(await cookies());
  if (!admin) redirect(PLATFORM_ADMIN_ROUTES.login);

  const workshops = await PlatformWorkshopService.listWorkshops();
  return <AdminDashboard admin={admin} initialWorkshops={workshops} />;
}
