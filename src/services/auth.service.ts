import clientAxios from "@/utils/clientAxios.util";

export const loginUsuario = async (credentials: any) => {
  const { data } = await clientAxios.post("/auth/login", credentials);
  // server returns { user, token }
  if (data?.token) {
    clientAxios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
  }
  return data;
};

export const logoutUsuario = async () => {
  const { data } = await clientAxios.post("/auth/logout");
  // clear authorization header when logging out
  delete clientAxios.defaults.headers.common["Authorization"];
  return data;
};
