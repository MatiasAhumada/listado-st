import clientAxios from "@/utils/clientAxios.util";

export const loginUsuario = async (credentials: any) => {
  const { data } = await clientAxios.post("/auth/login", credentials);
  return data;
};

export const logoutUsuario = async () => {
  const { data } = await clientAxios.post("/auth/logout");
  return data;
};
