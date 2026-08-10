import {
  CreateWorkshopPayload,
  PlatformAdminLoginPayload,
  PlatformApiMessage,
  UpdateWorkshopStatusPayload,
  WorkshopSummary,
} from "@/interfaces/platformAdmin.interface";
import {
  CatalogAdminDashboard,
  ReplaceCatalogPricingRulesPayload,
} from "@/interfaces/catalog.interface";
import {
  CATALOG_FIELDS,
  CATALOG_ROUTES,
  CATALOG_STATUS,
} from "@/constants/catalog.constant";
import { PLATFORM_ADMIN_ROUTES } from "@/constants/platformAdmin.constant";
import clientAxios from "@/utils/clientAxios.util";

export async function loginPlatformAdmin(payload: PlatformAdminLoginPayload): Promise<void> {
  await clientAxios.post(PLATFORM_ADMIN_ROUTES.sessionApi, payload);
}

export async function logoutPlatformAdmin(): Promise<PlatformApiMessage> {
  const response = await clientAxios.delete<PlatformApiMessage>(PLATFORM_ADMIN_ROUTES.sessionApi);
  return response.data;
}

export async function getPlatformWorkshops(): Promise<WorkshopSummary[]> {
  const response = await clientAxios.get<WorkshopSummary[]>(PLATFORM_ADMIN_ROUTES.workshopsApi);
  return response.data;
}

export async function createPlatformWorkshop(payload: CreateWorkshopPayload): Promise<WorkshopSummary> {
  const response = await clientAxios.post<WorkshopSummary>(PLATFORM_ADMIN_ROUTES.workshopsApi, payload);
  return response.data;
}

export async function updatePlatformWorkshopStatus(
  workshopId: string,
  payload: UpdateWorkshopStatusPayload
): Promise<WorkshopSummary> {
  const response = await clientAxios.patch<WorkshopSummary>(
    `${PLATFORM_ADMIN_ROUTES.workshopsApi}/${workshopId}`,
    payload
  );
  return response.data;
}

export async function importPlatformCatalog(file: File): Promise<CatalogAdminDashboard> {
  const formData = new FormData();
  formData.append(CATALOG_FIELDS.upload, file);
  const response = await clientAxios.post<CatalogAdminDashboard>(
    CATALOG_ROUTES.adminImportsApi,
    formData
  );
  return response.data;
}

export async function publishPlatformCatalog(
  batchId: string
): Promise<CatalogAdminDashboard> {
  const response = await clientAxios.patch<CatalogAdminDashboard>(
    `${CATALOG_ROUTES.adminImportsApi}/${batchId}`,
    { status: CATALOG_STATUS.published }
  );
  return response.data;
}

export async function replacePlatformCatalogPricingRules(
  payload: ReplaceCatalogPricingRulesPayload
): Promise<CatalogAdminDashboard> {
  const response = await clientAxios.put<CatalogAdminDashboard>(
    CATALOG_ROUTES.adminPricingRulesApi,
    payload
  );
  return response.data;
}
