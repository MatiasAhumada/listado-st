import {
  CreateWorkshopPayload,
  UpdateWorkshopPlanPayload,
  UpdateWorkshopStatusPayload,
  WorkshopSummary,
} from "@/interfaces/platformAdmin.interface";
import {
  CatalogAdminDashboard,
  ReplaceCatalogPricingRulesPayload,
} from "@/interfaces/catalog.interface";
import { SaasPlanSummary, SaveSaasPlanPayload } from "@/interfaces/saasPlan.interface";
import {
  CATALOG_FIELDS,
  CATALOG_ROUTES,
  CATALOG_STATUS,
} from "@/constants/catalog.constant";
import { PLATFORM_ADMIN_ROUTES } from "@/constants/platformAdmin.constant";
import { SAAS_PLAN_ROUTES } from "@/constants/saasPlan.constant";
import clientAxios from "@/utils/clientAxios.util";

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

export async function updatePlatformWorkshopPlan(
  workshopId: string,
  payload: UpdateWorkshopPlanPayload
): Promise<WorkshopSummary> {
  const response = await clientAxios.patch<WorkshopSummary>(
    `${PLATFORM_ADMIN_ROUTES.workshopsApi}/${workshopId}/subscription`,
    payload
  );
  return response.data;
}

export async function getSaasPlans(): Promise<SaasPlanSummary[]> {
  const response = await clientAxios.get<SaasPlanSummary[]>(SAAS_PLAN_ROUTES.adminApi);
  return response.data;
}

export async function createSaasPlan(payload: SaveSaasPlanPayload): Promise<SaasPlanSummary> {
  const response = await clientAxios.post<SaasPlanSummary>(SAAS_PLAN_ROUTES.adminApi, payload);
  return response.data;
}

export async function updateSaasPlan(
  planId: string,
  payload: SaveSaasPlanPayload
): Promise<SaasPlanSummary> {
  const response = await clientAxios.put<SaasPlanSummary>(
    `${SAAS_PLAN_ROUTES.adminApi}/${planId}`,
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
