import { REPAIR_ROUTES } from "@/constants/repairOperations.constant";
import {
  ChangeRepairStatusPayload,
  CreateRepairExpensePayload,
  CreateRepairPaymentPayload,
  CreateRepairPayload,
  RepairAlertRuleSummary,
  RepairSummary,
  ReverseFinancialEntryPayload,
  UpdateRepairAlertRulesPayload,
} from "@/interfaces/repairOperations.interface";
import clientAxios from "@/utils/clientAxios.util";

export async function getWorkshopRepairs(): Promise<RepairSummary[]> {
  const response = await clientAxios.get<RepairSummary[]>(REPAIR_ROUTES.clientApi);
  return response.data;
}

export async function createWorkshopRepair(payload: CreateRepairPayload): Promise<RepairSummary> {
  const response = await clientAxios.post<RepairSummary>(REPAIR_ROUTES.clientApi, payload);
  return response.data;
}

export async function changeWorkshopRepairStatus(
  repairId: string,
  payload: ChangeRepairStatusPayload
): Promise<RepairSummary> {
  const response = await clientAxios.post<RepairSummary>(`${REPAIR_ROUTES.clientApi}/${repairId}/status`, payload);
  return response.data;
}

export async function addWorkshopRepairPayment(
  repairId: string,
  payload: CreateRepairPaymentPayload
): Promise<RepairSummary> {
  const response = await clientAxios.post<RepairSummary>(`${REPAIR_ROUTES.clientApi}/${repairId}/payments`, payload);
  return response.data;
}

export async function reverseWorkshopRepairPayment(
  repairId: string,
  paymentId: string,
  payload: ReverseFinancialEntryPayload
): Promise<RepairSummary> {
  const response = await clientAxios.post<RepairSummary>(
    `${REPAIR_ROUTES.clientApi}/${repairId}/payments/${paymentId}/reversal`,
    payload
  );
  return response.data;
}

export async function addWorkshopRepairExpense(
  repairId: string,
  payload: CreateRepairExpensePayload
): Promise<RepairSummary> {
  const response = await clientAxios.post<RepairSummary>(`${REPAIR_ROUTES.clientApi}/${repairId}/expenses`, payload);
  return response.data;
}

export async function reverseWorkshopRepairExpense(
  repairId: string,
  expenseId: string,
  payload: ReverseFinancialEntryPayload
): Promise<RepairSummary> {
  const response = await clientAxios.post<RepairSummary>(
    `${REPAIR_ROUTES.clientApi}/${repairId}/expenses/${expenseId}/reversal`,
    payload
  );
  return response.data;
}

export async function updatePlatformRepairAlertRules(
  payload: UpdateRepairAlertRulesPayload
): Promise<RepairAlertRuleSummary[]> {
  const response = await clientAxios.put<RepairAlertRuleSummary[]>(REPAIR_ROUTES.platformAlertRulesApi, payload);
  return response.data;
}
