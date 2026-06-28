import clientAxios from "@/utils/clientAxios.util";

export async function searchServicios(search: string) {
  const response = await clientAxios.get("/servicios", {
    params: { search },
  });
  return response.data;
}
