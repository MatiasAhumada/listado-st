import clientAxios from "@/utils/clientAxios.util";

export const getProductos = async (filters?: { type?: string; quality?: string; search?: string }) => {
  const params = new URLSearchParams();
  if (filters?.type) params.append("type", filters.type);
  if (filters?.quality) params.append("quality", filters.quality);
  if (filters?.search) params.append("search", filters.search);

  const { data } = await clientAxios.get(`/productos?${params.toString()}`);
  return data;
};

export const createProducto = async (producto: any) => {
  const { data } = await clientAxios.post("/productos", producto);
  return data;
};

export const updateProducto = async (id: string, producto: any) => {
  const { data } = await clientAxios.put(`/productos/${id}`, producto);
  return data;
};

export const deleteProducto = async (id: string) => {
  const { data } = await clientAxios.delete(`/productos/${id}`);
  return data;
};
