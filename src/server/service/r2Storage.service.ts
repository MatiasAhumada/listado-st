import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { IMAGE_UPLOAD_CONFIG } from "@/constants/imageUpload.constant";
import { ApiError } from "@/utils/handlers/apiError.handler";
import httpStatus from "http-status";
import sharp from "sharp";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

interface UploadImageResult {
  url: string;
  key: string;
}

export const r2StorageService = {
  isWebP(buffer: Buffer): boolean {
    return buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
  },

  async optimizeImage(buffer: Buffer): Promise<Buffer> {
    if (this.isWebP(buffer)) {
      return buffer;
    }
    return sharp(buffer)
      .webp({
        quality: IMAGE_UPLOAD_CONFIG.QUALITY,
        effort: IMAGE_UPLOAD_CONFIG.EFFORT,
      })
      .toBuffer();
  },

  async uploadImage(file: Buffer, key: string): Promise<UploadImageResult> {
    if (!process.env.R2_BUCKET_NAME) {
      throw new ApiError({
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Configuración de almacenamiento no disponible",
      });
    }

    try {
      const optimizedBuffer = await this.optimizeImage(file);

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
          Body: optimizedBuffer,
          ContentType: "image/webp",
        })
      );

      const url = `${process.env.R2_PUBLIC_URL}/${key}`;

      return { url, key };
    } catch (error) {
      throw new ApiError({
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Error al subir la imagen",
      });
    }
  },

  async deleteImage(key: string): Promise<void> {
    if (!process.env.R2_BUCKET_NAME) {
      throw new ApiError({
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Configuración de almacenamiento no disponible",
      });
    }

    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
        })
      );
    } catch (error) {
      throw new ApiError({
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Error al eliminar la imagen",
      });
    }
  },

  extractKeyFromUrl(url: string): string {
    if (!process.env.R2_PUBLIC_URL) {
      return "";
    }
    return url.replace(`${process.env.R2_PUBLIC_URL}/`, "");
  },

  generateServiceOrderKey(folderName: string, index: number): string {
    return `service-orders/${folderName}/${index}.webp`;
  },

  generateFolderName(clientName: string, date: Date): string {
    const formattedDate = date.toISOString().split("T")[0];
    const sanitizedName = clientName.replace(/[^a-zA-Z0-9]/g, "_");
    return `${sanitizedName}_${formattedDate}`;
  },

  async deleteServiceOrderFolder(folderName: string): Promise<void> {
    if (!process.env.R2_BUCKET_NAME) {
      throw new ApiError({
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Configuración de almacenamiento no disponible",
      });
    }

    try {
      const prefix = `service-orders/${folderName}/`;
      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
        Prefix: prefix,
      });

      const listedObjects = await s3Client.send(listCommand);

      if (listedObjects.Contents && listedObjects.Contents.length > 0) {
        for (const object of listedObjects.Contents) {
          if (object.Key) {
            await this.deleteImage(object.Key);
          }
        }
      }
    } catch (error) {
      console.error(`Error deleting folder ${folderName}:`, error);
      throw new ApiError({
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Error al eliminar carpeta de imágenes",
      });
    }
  },

  async deleteServiceOrderImages(serviceOrderId: string, imageUrls: string[]): Promise<void> {
    for (const url of imageUrls) {
      const key = this.extractKeyFromUrl(url);
      if (key) {
        try {
          await this.deleteImage(key);
        } catch (error) {
          console.error(`Error deleting image ${key}:`, error);
        }
      }
    }
  },
};
