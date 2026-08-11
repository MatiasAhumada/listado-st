import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TechnicianWorkspaceDashboard } from "@/components/technician/TechnicianWorkspaceDashboard";
import { CATALOG_DEFAULTS } from "@/constants/catalog.constant";
import { TECHNICIAN_ROUTES } from "@/constants/technician.constant";
import { getTechnicianIdentity } from "@/server/guards/technician.guard";
import { GlobalCatalogService } from "@/server/service/globalCatalog.service";
import { QuoteService } from "@/server/service/quote.service";
import { RepairService } from "@/server/service/repair.service";
import { technicianWorkspaceService } from "@/server/service/technicianWorkspace.service";
import { WorkshopCustomerService } from "@/server/service/workshopCustomer.service";

export default async function ClientWorkshopPage() {
  const identity = await getTechnicianIdentity(await cookies());
  if (!identity) redirect(TECHNICIAN_ROUTES.login);

  const [workspace, catalog, customers, quotes, repairs] = await Promise.all([
    technicianWorkspaceService.getWorkspace(identity),
    GlobalCatalogService.searchPublishedCatalog(CATALOG_DEFAULTS.emptySearch),
    WorkshopCustomerService.listCustomers(identity),
    QuoteService.listQuotes(identity),
    RepairService.listRepairs(identity),
  ]);

  return (
    <TechnicianWorkspaceDashboard
      workspace={workspace}
      initialCatalog={catalog}
      initialCustomers={customers}
      initialQuotes={quotes}
      initialRepairs={repairs}
    />
  );
}
