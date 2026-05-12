"use client";

import { useState, useEffect } from "react";
import { GenericModal } from "@/components/common/GenericModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductSearch } from "./ProductSearch";
import { ClientSearch } from "@/components/clients/ClientSearch";
import { ClientDTO } from "@/services/client.service";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import {
  createServiceOrder,
  updateServiceOrder,
  getServiceOrderById,
  CreateServiceOrderDTO,
  UpdateServiceOrderDTO,
} from "@/services/serviceOrder.service";
import { uploadServiceOrderImages, deleteServiceOrderImage } from "@/services/serviceOrderImage.service";
import { ServiceOrderStatus, ProductType } from "@prisma/client";
import { SERVICE_ORDER_STATUS_LABELS } from "@/constants/serviceOrder.constant";
import { Upload, X, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { formatNumber } from "@/utils/formatters.util";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServiceDetails } from "./ServiceDetails";
import { ServiceOrderReceipt } from "./ServiceOrderReceipt";

interface ServiceOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  order?: {
    id: string;
    clientName: string;
    clientPhone: string;
    advancePayment?: number;
    balance?: number;
    deliveryDate?: string;
    status: ServiceOrderStatus;
    images?: { id: string; url: string }[];
    products?: {
      id: string;
      productName: string;
      productType: ProductType;
      unitPrice: number;
      totalPrice: number;
      isDry?: boolean;
      hasImpact?: boolean;
      isBrokenScreen?: boolean;
      isTurnedOn?: boolean;
      isCharging?: boolean;
      color?: string;
      description?: string;
    }[];
  };
}

export function ServiceOrderModal({ open, onOpenChange, onSuccess, order }: ServiceOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<
    {
      productId: string;
      productName: string;
      productType: ProductType;
      unitPrice: number;
      cost: number;
      priceType: "cash" | "credit";
      cashPrice: number;
      creditPrice: number;
      isDry: boolean;
      hasImpact: boolean;
      isBrokenScreen: boolean;
      isTurnedOn: boolean;
      isCharging: boolean;
      color: string;
      description: string;
      showDetails: boolean;
    }[]
  >([]);
  const [selectedClient, setSelectedClient] = useState<ClientDTO | null>(null);
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    advancePayment: 0,
    balance: 0,
    deliveryDate: "",
    status: ServiceOrderStatus.RECEPCIONADO as ServiceOrderStatus,
  });

  useEffect(() => {
    if (order) {
      setFormData({
        clientName: order.clientName,
        clientPhone: order.clientPhone,
        advancePayment: order.advancePayment || 0,
        balance: order.balance || 0,
        deliveryDate: order.deliveryDate ? order.deliveryDate.split("T")[0] : "",
        status: order.status,
      });
      setExistingImages(order.images || []);
      setSelectedProducts(
        order.products?.map((p) => ({
          productId: p.id,
          productName: p.productName,
          productType: p.productType,
          unitPrice: p.unitPrice,
          cost: 0,
          priceType: "cash" as "cash" | "credit",
          cashPrice: p.unitPrice,
          creditPrice: p.unitPrice,
          isDry: p.isDry || false,
          hasImpact: p.hasImpact || false,
          isBrokenScreen: p.isBrokenScreen || false,
          isTurnedOn: p.isTurnedOn || false,
          isCharging: p.isCharging || false,
          color: p.color || "",
          description: p.description || "",
          showDetails: false,
        })) || []
      );
    } else {
      setFormData({
        clientName: "",
        clientPhone: "",
        advancePayment: 0,
        balance: 0,
        deliveryDate: "",
        status: ServiceOrderStatus.RECEPCIONADO,
      });
      setExistingImages([]);
      setSelectedProducts([]);
      setSelectedClient(null);
    }
    setSelectedFiles([]);
  }, [order, open]);

  useEffect(() => {
    if (selectedProducts.length > 0) {
      const total = calculateTotal();
      const advance = formData.advancePayment;
      setFormData((prev) => ({
        ...prev,
        balance: total - advance,
      }));
    }
  }, [selectedProducts, formData.advancePayment]);

  const handleAddProduct = () => {
    setSelectedProducts([
      ...selectedProducts,
      {
        productId: "",
        productName: "",
        productType: ProductType.MODULO,
        unitPrice: 0,
        cost: 0,
        priceType: "cash",
        cashPrice: 0,
        creditPrice: 0,
        isDry: false,
        hasImpact: false,
        isBrokenScreen: false,
        isTurnedOn: false,
        isCharging: false,
        color: "",
        description: "",
        showDetails: true,
      },
    ]);
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index: number, product: any) => {
    const updated = [...selectedProducts];
    updated[index] = {
      ...updated[index],
      productId: product.id,
      productName: product.name,
      productType: product.type,
      unitPrice: product.cash || 0,
      cost: product.cost || 0,
      priceType: "cash",
      cashPrice: product.cash || 0,
      creditPrice: product.credit || 0,
    };
    setSelectedProducts(updated);
  };

  const handlePriceTypeChange = (index: number, priceType: "cash" | "credit") => {
    const updated = [...selectedProducts];
    updated[index].priceType = priceType;
    updated[index].unitPrice = priceType === "cash" ? updated[index].cashPrice : updated[index].creditPrice;
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
    if (!formData.clientName || !formData.clientPhone) {
      return clientErrorHandler("Complete todos los campos obligatorios");
    }

    setLoading(true);

    try {
      if (order) {
        const updateData: UpdateServiceOrderDTO = {
          clientName: formData.clientName,
          clientPhone: formData.clientPhone,
          advancePayment: formData.advancePayment || undefined,
          balance: formData.balance || undefined,
          deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate) : undefined,
          status: formData.status,
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
          clientId: selectedClient?.id,
          deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate) : undefined,
          advancePayment: formData.advancePayment || undefined,
          balance: formData.balance || undefined,
          products:
            selectedProducts.length > 0
              ? selectedProducts.map((p) => ({
                  productName: p.productName,
                  productType: p.productType,
                  unitPrice: p.unitPrice,
                  cost: p.cost,
                  isDry: p.isDry,
                  hasImpact: p.hasImpact,
                  isBrokenScreen: p.isBrokenScreen,
                  isTurnedOn: p.isTurnedOn,
                  isCharging: p.isCharging,
                  color: p.color || undefined,
                  description: p.description || undefined,
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

        const orderWithClient = await getServiceOrderById(newOrder.id);
        setCreatedOrder(orderWithClient);
        setShowReceipt(true);
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
    <>
      {showReceipt && createdOrder ? (
        <ServiceOrderReceipt
          order={createdOrder}
          onClose={() => {
            setShowReceipt(false);
            setCreatedOrder(null);
            onSuccess();
            onOpenChange(false);
          }}
        />
      ) : (
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
            {!order && (
              <div className="space-y-2">
                <Label className="text-white">Cliente *</Label>
                <ClientSearch
                  onSelect={(client) => {
                    setSelectedClient(client);
                    setFormData({
                      ...formData,
                      clientName: client.fullName,
                      clientPhone: client.phone || "",
                    });
                  }}
                />
              </div>
            )}

            {order && (
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white">Servicios</Label>
                <Button type="button" size="sm" onClick={handleAddProduct} className="bg-lime hover:bg-green text-dark">
                  <Plus size={16} className="mr-1" />
                  Agregar
                </Button>
              </div>

              {selectedProducts.map((product, index) => (
                <div key={index} className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 p-3 bg-gray-900 rounded-lg border border-gray-700">
                    <div className="col-span-6">
                      <ProductSearch
                        value={product.productName}
                        onSelect={(p) => handleProductSelect(index, p)}
                        placeholder="Buscar servicio..."
                      />
                    </div>
                    <div className="col-span-3">
                      <Select
                        value={product.priceType}
                        onValueChange={(value) => handlePriceTypeChange(index, value as "cash" | "credit")}
                      >
                        <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Efectivo</SelectItem>
                          <SelectItem value="credit">Crédito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <span className="text-lime font-bold">${formatNumber(product.unitPrice)}</span>
                    </div>
                    <div className="col-span-1 flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          const updated = [...selectedProducts];
                          updated[index].showDetails = !updated[index].showDetails;
                          setSelectedProducts(updated);
                        }}
                        className="h-8 w-8 text-lavender hover:bg-lavender/20"
                      >
                        {product.showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </Button>
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

                  {product.showDetails && (
                    <ServiceDetails
                      index={index}
                      isDry={product.isDry}
                      hasImpact={product.hasImpact}
                      isBrokenScreen={product.isBrokenScreen}
                      isTurnedOn={product.isTurnedOn}
                      isCharging={product.isCharging}
                      color={product.color}
                      description={product.description}
                      onChange={(field, value) => {
                        const updated = [...selectedProducts];
                        updated[index] = { ...updated[index], [field]: value };
                        setSelectedProducts(updated);
                      }}
                    />
                  )}
                </div>
              ))}

              {selectedProducts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-end p-3 bg-lime/10 rounded-lg border border-lime/30">
                    <span className="text-lg font-bold text-lime">Total: ${formatNumber(calculateTotal())}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-2">
                      <Label className="text-white text-sm">Anticipo</Label>
                      <Input
                        type="number"
                        value={formData.advancePayment === 0 ? "" : formData.advancePayment}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const value = e.target.value;
                          const advance = value === "" ? 0 : parseInt(value);
                          const total = calculateTotal();
                          setFormData({
                            ...formData,
                            advancePayment: advance,
                            balance: total - advance,
                          });
                        }}
                        placeholder="0"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white text-sm">Saldo</Label>
                      <Input
                        type="number"
                        value={formData.balance}
                        disabled
                        placeholder="0"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 opacity-60 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white text-sm">Fecha de Entrega</Label>
                      <Input
                        type="date"
                        value={formData.deliveryDate}
                        onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-white">Imágenes</Label>
              <div className="space-y-3">
                <label className="flex items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-gray-700 bg-gray-900 rounded-lg cursor-pointer hover:border-lime transition-colors">
                  <Upload size={20} className="text-gray-400" />
                  <span className="text-sm text-gray-400">Seleccionar imágenes</span>
                  <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                </label>

                {existingImages.length > 0 && (
                  <div className="overflow-x-auto">
                    <div className="flex gap-2 pb-2">
                      {existingImages.map((img) => (
                        <div key={img.id} className="relative group flex-shrink-0">
                          <Image
                            src={img.url}
                            alt="Imagen de orden"
                            width={150}
                            height={150}
                            className="w-32 h-24 object-cover rounded-lg border border-gray-700"
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
                  </div>
                )}

                {selectedFiles.length > 0 && (
                  <div className="overflow-x-auto">
                    <div className="flex gap-2 pb-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group flex-shrink-0">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt="Nueva imagen"
                            width={150}
                            height={150}
                            className="w-32 h-24 object-cover rounded-lg border border-lime"
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </GenericModal>
      )}
    </>
  );
}
