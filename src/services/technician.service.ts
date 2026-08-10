import { TECHNICIAN_ROUTES } from "@/constants/technician.constant";
import {
  TechnicianApiMessage,
  TechnicianLoginPayload,
  TechnicianWorkspaceSummary,
} from "@/interfaces/technician.interface";
import clientAxios from "@/utils/clientAxios.util";

export async function loginTechnician(payload: TechnicianLoginPayload): Promise<void> {
  await clientAxios.post(TECHNICIAN_ROUTES.sessionApi, payload);
}

export async function logoutTechnician(): Promise<TechnicianApiMessage> {
  const response = await clientAxios.delete<TechnicianApiMessage>(
    TECHNICIAN_ROUTES.sessionApi
  );
  return response.data;
}

export async function getTechnicianWorkspace(): Promise<TechnicianWorkspaceSummary> {
  const response = await clientAxios.get<TechnicianWorkspaceSummary>(
    TECHNICIAN_ROUTES.workspaceApi
  );
  return response.data;
}
