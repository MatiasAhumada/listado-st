import { TECHNICIAN_ROUTES } from "@/constants/technician.constant";
import { CATALOG_DEFAULTS, CATALOG_ROUTES } from "@/constants/catalog.constant";
import { TechnicianCatalogResult } from "@/interfaces/catalog.interface";
import {
  TechnicianWorkspaceSummary,
} from "@/interfaces/technician.interface";
import clientAxios from "@/utils/clientAxios.util";
import {
  AcceptQuotePayload,
  CreateWorkshopCustomerPayload,
  MobileDevicePayload,
  QuoteSummary,
  SaveQuotePayload,
  UpdateWorkshopCustomerPayload,
  WorkshopCustomerSummary,
} from "@/interfaces/workshopOperations.interface";
import { WORKSHOP_OPERATIONS_ROUTES } from "@/constants/workshopOperations.constant";

export async function getTechnicianWorkspace(): Promise<TechnicianWorkspaceSummary> {
  const response = await clientAxios.get<TechnicianWorkspaceSummary>(TECHNICIAN_ROUTES.workspaceApi);
  return response.data;
}

export async function getTechnicianCatalog(
  query: string = CATALOG_DEFAULTS.emptySearch
): Promise<TechnicianCatalogResult> {
  const response = await clientAxios.get<TechnicianCatalogResult>(CATALOG_ROUTES.technicianCatalogApi, {
    params: { query },
  });
  return response.data;
}

export async function getWorkshopCustomers(): Promise<WorkshopCustomerSummary[]> {
  const response = await clientAxios.get<WorkshopCustomerSummary[]>(WORKSHOP_OPERATIONS_ROUTES.customersApi);
  return response.data;
}

export async function createWorkshopCustomer(payload: CreateWorkshopCustomerPayload): Promise<WorkshopCustomerSummary> {
  const response = await clientAxios.post<WorkshopCustomerSummary>(WORKSHOP_OPERATIONS_ROUTES.customersApi, payload);
  return response.data;
}

export async function updateWorkshopCustomer(
  customerId: string,
  payload: UpdateWorkshopCustomerPayload
): Promise<WorkshopCustomerSummary> {
  const response = await clientAxios.put<WorkshopCustomerSummary>(
    `${WORKSHOP_OPERATIONS_ROUTES.customersApi}/${customerId}`,
    payload
  );
  return response.data;
}

export async function addWorkshopCustomerDevice(
  customerId: string,
  payload: MobileDevicePayload
): Promise<WorkshopCustomerSummary> {
  const response = await clientAxios.post<WorkshopCustomerSummary>(
    `${WORKSHOP_OPERATIONS_ROUTES.customersApi}/${customerId}/devices`,
    payload
  );
  return response.data;
}

export async function getWorkshopQuotes(): Promise<QuoteSummary[]> {
  const response = await clientAxios.get<QuoteSummary[]>(WORKSHOP_OPERATIONS_ROUTES.quotesApi);
  return response.data;
}

export async function createWorkshopQuote(payload: SaveQuotePayload): Promise<QuoteSummary> {
  const response = await clientAxios.post<QuoteSummary>(WORKSHOP_OPERATIONS_ROUTES.quotesApi, payload);
  return response.data;
}

export async function updateWorkshopQuote(quoteId: string, payload: SaveQuotePayload): Promise<QuoteSummary> {
  const response = await clientAxios.put<QuoteSummary>(`${WORKSHOP_OPERATIONS_ROUTES.quotesApi}/${quoteId}`, payload);
  return response.data;
}

export async function sendWorkshopQuoteRevision(quoteId: string): Promise<QuoteSummary> {
  const response = await clientAxios.post<QuoteSummary>(`${WORKSHOP_OPERATIONS_ROUTES.quotesApi}/${quoteId}/revisions`);
  return response.data;
}

export async function prepareWorkshopQuoteRevision(quoteId: string): Promise<QuoteSummary> {
  const response = await clientAxios.post<QuoteSummary>(`${WORKSHOP_OPERATIONS_ROUTES.quotesApi}/${quoteId}/draft`);
  return response.data;
}

export async function acceptWorkshopQuoteAlternative(
  quoteId: string,
  payload: AcceptQuotePayload
): Promise<QuoteSummary> {
  const response = await clientAxios.post<QuoteSummary>(
    `${WORKSHOP_OPERATIONS_ROUTES.quotesApi}/${quoteId}/acceptance`,
    payload
  );
  return response.data;
}
