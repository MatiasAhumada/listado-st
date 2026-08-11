import { ACCESS_ROUTES } from "@/constants/access.constant";
import {
  AccessLoginPayload,
  AccessSessionResponse,
} from "@/interfaces/access.interface";
import clientAxios from "@/utils/clientAxios.util";

export async function loginAccess(payload: AccessLoginPayload): Promise<AccessSessionResponse> {
  const response = await clientAxios.post<AccessSessionResponse>(ACCESS_ROUTES.sessionApi, payload);
  return response.data;
}

export async function logoutAccess(): Promise<void> {
  await clientAxios.delete(ACCESS_ROUTES.sessionApi);
}
