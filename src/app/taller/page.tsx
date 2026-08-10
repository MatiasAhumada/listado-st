import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TechnicianWorkspaceDashboard } from "@/components/technician/TechnicianWorkspaceDashboard";
import { TECHNICIAN_ROUTES } from "@/constants/technician.constant";
import { getTechnicianIdentity } from "@/server/guards/technician.guard";
import { technicianWorkspaceService } from "@/server/service/technicianWorkspace.service";

export default async function TechnicianWorkspacePage() {
  const identity = await getTechnicianIdentity(await cookies());
  if (!identity) redirect(TECHNICIAN_ROUTES.login);

  const workspace = await technicianWorkspaceService.getWorkspace(identity);
  return <TechnicianWorkspaceDashboard workspace={workspace} />;
}
