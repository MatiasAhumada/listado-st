import clientAxios from "@/utils/clientAxios.util";

export const getServicios = async (filters?: { type?: string; quality?: string; search?: string }) => {
  const params = new URLSearchParams();
  if (filters?.type) params.append("type", filters.type);
  if (filters?.quality) params.append("quality", filters.quality);
  if (filters?.search) params.append("search", filters.search);

  const { data } = await clientAxios.get(`/servicios?${params.toString()}`);
  return data;
};

export const createServicio = async (servicio: unknown) => {
  const { data } = await clientAxios.post("/servicios", servicio);
  return data;
};

export const updateServicio = async (id: string, servicio: unknown) => {
  const { data } = await clientAxios.put(`/servicios/${id}`, servicio);
  return data;
};

export const deleteServicio = async (id: string) => {
  const { data } = await clientAxios.delete(`/servicios/${id}`);
  return data;
};

export const bulkCreateOrUpdateServicios = async (servicios: unknown[]) => {
  const { data } = await clientAxios.post("/servicios", { servicios });
  return data;
};
