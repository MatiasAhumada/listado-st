import { NextRequest, NextResponse } from "next/server";
import { r2StorageService } from "@/server/service/r2Storage.service";
import { prisma } from "@/lib/prisma";
import apiErrorHandler, { ApiError } from "@/utils/handlers/apiError.handler";
import { IMAGE_UPLOAD_CONFIG, IMAGE_UPLOAD_MESSAGES } from "@/constants/imageUpload.constant";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: serviceOrderId } = await params;

    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: { id: serviceOrderId },
      include: { images: true },
    });

    if (!serviceOrder) {
      return NextResponse.json({ message: "Orden de servicio no encontrada" }, { status: 404 });
    }

    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (files.length === 0) {
      return NextResponse.json({ message: "No se enviaron imágenes" }, { status: 400 });
    }

    const uploadedImages = [];
    const currentImageCount = serviceOrder.images.length;
    const folderName = r2StorageService.generateFolderName(serviceOrder.clientName, serviceOrder.createdAt);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > IMAGE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
        return NextResponse.json({ message: IMAGE_UPLOAD_MESSAGES.FILE_TOO_LARGE }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const key = r2StorageService.generateServiceOrderKey(folderName, currentImageCount + i);
      const { url } = await r2StorageService.uploadImage(buffer, key);

      const image = await prisma.serviceOrderImage.create({
        data: {
          url,
          serviceOrderId,
        },
      });

      uploadedImages.push(image);
    }

    return NextResponse.json({
      message: IMAGE_UPLOAD_MESSAGES.UPLOAD_SUCCESS,
      images: uploadedImages,
    });
  } catch (error: any) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al subir imágenes" }),
      request,
    });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: serviceOrderId } = await params;
    const { imageId } = await request.json();

    const image = await prisma.serviceOrderImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.serviceOrderId !== serviceOrderId) {
      return NextResponse.json({ message: "Imagen no encontrada" }, { status: 404 });
    }

    const key = r2StorageService.extractKeyFromUrl(image.url);
    if (key) {
      await r2StorageService.deleteImage(key);
    }

    await prisma.serviceOrderImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ message: "Imagen eliminada exitosamente" });
  } catch (error: any) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error al eliminar imagen" }),
      request,
    });
  }
}
