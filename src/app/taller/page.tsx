import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TechnicianWorkspaceDashboard } from "@/components/technician/TechnicianWorkspaceDashboard";
import { CATALOG_DEFAULTS } from "@/constants/catalog.constant";
import { TECHNICIAN_ROUTES } from "@/constants/technician.constant";
import { getTechnicianIdentity } from "@/server/guards/technician.guard";
import { GlobalCatalogService } from "@/server/service/globalCatalog.service";
import { technicianWorkspaceService } from "@/server/service/technicianWorkspace.service";

export default async function TechnicianWorkspacePage() {
  const identity = await getTechnicianIdentity(await cookies());
  if (!identity) redirect(TECHNICIAN_ROUTES.login);

  const [workspace, catalog] = await Promise.all([
    technicianWorkspaceService.getWorkspace(identity),
    GlobalCatalogService.searchPublishedCatalog(CATALOG_DEFAULTS.emptySearch),
  ]);
  return (
    <TechnicianWorkspaceDashboard workspace={workspace} initialCatalog={catalog} />
  );
}
