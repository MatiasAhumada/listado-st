import clientAxios from "@/utils/clientAxios.util";

export interface CreateBranchDTO {
  name: string;
  address?: string;
  phone?: string;
}

export interface UpdateBranchDTO {
  name?: string;
  address?: string;
  phone?: string;
}

export async function createBranch(data: CreateBranchDTO) {
  const response = await clientAxios.post("/api/branches", data);
  return response.data;
}

export async function getBranches() {
  const response = await clientAxios.get("/api/branches");
  return response.data;
}

export async function updateBranch(id: string, data: UpdateBranchDTO) {
  const response = await clientAxios.put(`/api/branches/${id}`, data);
  return response.data;
}

export async function deleteBranch(id: string) {
  const response = await clientAxios.delete(`/api/branches/${id}`);
  return response.data;
}
