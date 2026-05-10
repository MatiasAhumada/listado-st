import { clientAxios } from "@/utils/clientAxios.util";

export const uploadServiceOrderImages = async (serviceOrderId: string, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  const response = await clientAxios.post(`/service-orders/${serviceOrderId}/images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteServiceOrderImage = async (serviceOrderId: string, imageId: string) => {
  const response = await clientAxios.delete(`/service-orders/${serviceOrderId}/images`, {
    data: { imageId },
  });

  return response.data;
};
