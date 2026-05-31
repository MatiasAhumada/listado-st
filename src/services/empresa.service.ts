import clientAxios from "@/utils/clientAxios.util";

export interface CreateEmpresaDTO {
  username: string;
  password: string;
}

export interface UpdateEmpresaDTO {
  username?: string;
  password?: string;
}

export async function getEmpresas() {
  const response = await clientAxios.get("/empresas");
  return response.data;
}

export async function createEmpresa(data: CreateEmpresaDTO) {
  const response = await clientAxios.post("/empresas", data);
  return response.data;
}

export async function updateEmpresa(id: string, data: UpdateEmpresaDTO) {
  const response = await clientAxios.put(`/empresas/${id}`, data);
  return response.data;
}

export async function deleteEmpresa(id: string) {
  const response = await clientAxios.delete(`/empresas/${id}`);
  return response.data;
}
