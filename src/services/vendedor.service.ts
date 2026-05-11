import clientAxios from "@/utils/clientAxios.util";

export interface CreateVendedorDTO {
  username: string;
  password: string;
  branchId: string;
}

export interface UpdateVendedorDTO {
  username?: string;
  password?: string;
  branchId?: string;
}

export async function createVendedor(data: CreateVendedorDTO) {
  const response = await clientAxios.post("/vendedores", data);
  return response.data;
}

export async function getVendedores() {
  const response = await clientAxios.get("/vendedores");
  return response.data;
}

export async function updateVendedor(id: string, data: UpdateVendedorDTO) {
  const response = await clientAxios.put(`/vendedores/${id}`, data);
  return response.data;
}

export async function deleteVendedor(id: string) {
  const response = await clientAxios.delete(`/vendedores/${id}`);
  return response.data;
}
