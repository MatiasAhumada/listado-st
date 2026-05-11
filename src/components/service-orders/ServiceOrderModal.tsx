"use client";

import { useState, useEffect } from "react";
import { GenericModal } from "@/components/common/GenericModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductSearch } from "./ProductSearch";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import {
  createServiceOrder,
  updateServiceOrder,
  CreateServiceOrderDTO,
  UpdateServiceOrderDTO,
} from "@/services/serviceOrder.service";
import { uploadServiceOrderImages, deleteServiceOrderImage } from "@/services/serviceOrderImage.service";
import { ServiceOrderStatus, ProductType } from "@prisma/client";
import { SERVICE_ORDER_STATUS_LABELS } from "@/constants/serviceOrder.constant";
import { Upload, X, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { formatNumber } from "@/utils/formatters.util";

interface ServiceOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  order?: {
    id: string;
    clientName: string;
    clientPhone: string;
    deviceModel: string;
    deviceIssue: string;
    estimatedCost: number;
    finalCost?: number;
    status: ServiceOrderStatus;
    notes?: string;
    images?: { id: string; url: string }[];
    products?: {
      id: string;
      productName: string;
      productType: ProductType;
      unitPrice: number;
      totalPrice: number;
    }[];
  };
}

export function ServiceOrderModal({ open, onOpenChange, onSuccess, order }: ServiceOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<
    { productId: string; productName: string; productType: ProductType; unitPrice: number }[]
  >([]);
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    deviceModel: "",
    deviceIssue: "",
    finalCost: 0,
    status: ServiceOrderStatus.RECEPCIONADO as ServiceOrderStatus,
    notes: "",
  });

  useEffect(() => {
    if (order) {
      setFormData({
        clientName: order.clientName,
        clientPhone: order.clientPhone,
        deviceModel: order.deviceModel,
        deviceIssue: order.deviceIssue,
        finalCost: order.finalCost || 0,
        status: order.status,
        notes: order.notes || "",
      });
      setExistingImages(order.images || []);
      setSelectedProducts(
        order.products?.map((p) => ({
          productId: p.id,
          productName: p.productName,
          productType: p.productType,
          unitPrice: p.unitPrice,
        })) || []
      );
    } else {
      setFormData({
        clientName: "",
        clientPhone: "",
        deviceModel: "",
        deviceIssue: "",
        finalCost: 0,
        status: ServiceOrderStatus.RECEPCIONADO,
        notes: "",
      });
      setExistingImages([]);
      setSelectedProducts([]);
    }
    setSelectedFiles([]);
  }, [order, open]);

  const handleAddProduct = () => {
    setSelectedProducts([
      ...selectedProducts,
      { productId: "", productName: "", productType: ProductType.MODULO, unitPrice: 0 },
    ]);
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index: number, product: any) => {
    const updated = [...selectedProducts];
    updated[index] = {
      productId: product.id,
      productName: product.name,
      productType: product.type,
      unitPrice: product.cash || 0,
    };
    setSelectedProducts(updated);
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, p) => sum + p.unitPrice, 0);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageId: string) => {
    if (!order) return;

    try {
      await deleteServiceOrderImage(order.id, imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      clientSuccessHandler("Imagen eliminada");
    } catch (error) {
      clientErrorHandler(error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.clientName || !formData.clientPhone || !formData.deviceModel || !formData.deviceIssue) {
      return clientErrorHandler("Complete todos los campos obligatorios");
    }

    setLoading(true);

    try {
      if (order) {
        const updateData: UpdateServiceOrderDTO = {
          clientName: formData.clientName,
          clientPhone: formData.clientPhone,
          deviceModel: formData.deviceModel,
          deviceIssue: formData.deviceIssue,
          finalCost: formData.finalCost || undefined,
          status: formData.status,
          notes: formData.notes || undefined,
        };
        await updateServiceOrder(order.id, updateData);

        if (selectedFiles.length > 0) {
          setUploadingImages(true);
          try {
            await uploadServiceOrderImages(order.id, selectedFiles);
          } catch (error) {
            clientErrorHandler("Error al subir imágenes");
          } finally {
            setUploadingImages(false);
          }
        }

        clientSuccessHandler("Orden actualizada correctamente");
      } else {
        const createData: CreateServiceOrderDTO = {
          clientName: formData.clientName,
          clientPhone: formData.clientPhone,
          deviceModel: formData.deviceModel,
          deviceIssue: formData.deviceIssue,
          notes: formData.notes || undefined,
          products:
            selectedProducts.length > 0
              ? selectedProducts.map((p) => ({
                  productName: p.productName,
                  productType: p.productType,
                  unitPrice: p.unitPrice,
                }))
              : undefined,
        };
        const newOrder = await createServiceOrder(createData);

        if (selectedFiles.length > 0) {
          setUploadingImages(true);
          try {
            await uploadServiceOrderImages(newOrder.id, selectedFiles);
          } catch (error) {
            clientErrorHandler("Error al subir imágenes");
          } finally {
            setUploadingImages(false);
          }
        }

        clientSuccessHandler("Orden creada correctamente");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={order ? "Editar Orden de Servicio" : "Nueva Orden de Servicio"}
      description={order ? "Modifica los datos de la orden" : "Completa los datos del servicio técnico"}
      size="lg"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading || uploadingImages}
            className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || uploadingImages}
            className="bg-lime hover:bg-green text-dark"
          >
            {loading || uploadingImages ? "Guardando..." : order ? "Actualizar" : "Crear"}
          </Button>
        </>
      }
    >
      <div className="space-y-4 p-6 bg-black rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Cliente *</Label>
            <Input
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="Nombre del cliente"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Teléfono *</Label>
            <Input
              value={formData.clientPhone}
              onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
              placeholder="Teléfono de contacto"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white">Modelo del Dispositivo *</Label>
          <Input
            value={formData.deviceModel}
            onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
            placeholder="Ej: iPhone 13 Pro"
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Problema Reportado *</Label>
          <Input
            value={formData.deviceIssue}
            onChange={(e) => setFormData({ ...formData, deviceIssue: e.target.value })}
            placeholder="Descripción del problema"
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>

        {order && (
          <div className="space-y-2">
            <Label className="text-white">Costo Final</Label>
            <Input
              type="number"
              value={formData.finalCost}
              onChange={(e) => setFormData({ ...formData, finalCost: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
        )}

        {order && (
          <div className="space-y-2">
            <Label className="text-white">Estado</Label>
            <select
              className="w-full h-10 px-3 rounded-md border border-gray-700 bg-gray-800 text-white"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ServiceOrderStatus })}
            >
              {Object.entries(SERVICE_ORDER_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-white">Notas</Label>
          <textarea
            className="w-full min-h-20 px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notas adicionales..."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-white">Servicios</Label>
            <Button type="button" size="sm" onClick={handleAddProduct} className="bg-lime hover:bg-green text-dark">
              <Plus size={16} className="mr-1" />
              Agregar
            </Button>
          </div>

          {selectedProducts.map((product, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-gray-900 rounded-lg border border-gray-700">
              <div className="col-span-8">
                <ProductSearch
                  value={product.productName}
                  onSelect={(p) => handleProductSelect(index, p)}
                  placeholder="Buscar servicio..."
                />
              </div>
              <div className="col-span-3 flex items-center justify-end">
                <span className="text-lime font-bold">${formatNumber(product.unitPrice)}</span>
              </div>
              <div className="col-span-1 flex items-center justify-end">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveProduct(index)}
                  className="h-8 w-8 text-red-500 hover:bg-red-500/20"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}

          {selectedProducts.length > 0 && (
            <div className="flex justify-end p-3 bg-lime/10 rounded-lg border border-lime/30">
              <span className="text-lg font-bold text-lime">Total: ${formatNumber(calculateTotal())}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-white">Imágenes</Label>
          <div className="space-y-3">
            {existingImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <Image
                      src={img.url}
                      alt="Imagen de orden"
                      width={150}
                      height={150}
                      className="w-full h-24 object-cover rounded-lg border border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(img.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt="Nueva imagen"
                      width={150}
                      height={150}
                      className="w-full h-24 object-cover rounded-lg border border-lime"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-gray-700 bg-gray-900 rounded-lg cursor-pointer hover:border-lime transition-colors">
              <Upload size={20} className="text-gray-400" />
              <span className="text-sm text-gray-400">Seleccionar imágenes</span>
              <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </GenericModal>
  );
}
