import clientAxios from "@/utils/clientAxios.util";

export async function searchProductos(search: string) {
  const response = await clientAxios.get("/productos", {
    params: { search },
  });
  return response.data;
}
