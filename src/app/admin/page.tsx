import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { PLATFORM_ADMIN_ROUTES } from "@/constants/platformAdmin.constant";
import { getPlatformAdminIdentity } from "@/server/guards/platformAdmin.guard";
import { PlatformWorkshopService } from "@/server/service/platformWorkshop.service";
import { SaasPlanService } from "@/server/service/saasPlan.service";

export default async function AdminPage() {
  const admin = await getPlatformAdminIdentity(await cookies());
  if (!admin) redirect(PLATFORM_ADMIN_ROUTES.login);

  const [workshops, plans] = await Promise.all([
    PlatformWorkshopService.listWorkshops(),
    SaasPlanService.listPlans(),
  ]);
  return (
    <AdminDashboard
      admin={admin}
      initialWorkshops={workshops}
      initialPlans={plans}
    />
  );
}
