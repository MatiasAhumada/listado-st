import clientAxios from "@/utils/clientAxios.util";
import { LoginCredentials, LoginResponse } from "@/interfaces/auth.interface";

export const loginUsuario = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const { data } = await clientAxios.post<LoginResponse>("/auth/login", credentials);
  if (data?.token) {
    clientAxios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
  }
  return data;
};

export const logoutUsuario = async () => {
  const { data } = await clientAxios.post("/auth/logout");
  delete clientAxios.defaults.headers.common["Authorization"];
  return data;
};
