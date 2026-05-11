import clientAxios from "@/utils/clientAxios.util";

export interface CreateClientDTO {
  fullName: string;
  dni: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface ClientDTO {
  id: string;
  fullName: string;
  dni: string;
  phone?: string;
  email?: string;
  address?: string;
}

export const searchClients = async (query: string): Promise<ClientDTO[]> => {
  const { data } = await clientAxios.get(`/clients?search=${encodeURIComponent(query)}`);
  return data;
};

export const createClient = async (clientData: CreateClientDTO): Promise<ClientDTO> => {
  const { data } = await clientAxios.post("/clients", clientData);
  return data.client;
};
