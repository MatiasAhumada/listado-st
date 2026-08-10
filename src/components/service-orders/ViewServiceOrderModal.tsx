"use client";

import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { GenericModal } from "@/components/common/GenericModal";
import { Badge } from "@/components/ui/badge";
import {
  SERVICE_ORDER_STATUS_LABELS,
  SERVICE_ORDER_STATUS_COLORS,
  SERVICE_ORDER_MARGIN_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_BADGE_COLORS,
} from "@/constants/serviceOrder.constant";
import { formatNumber, formatDate } from "@/utils/formatters.util";
import { ServiceOrderStatus, ServiceType, PaymentMethod } from "@prisma/client";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

interface ViewServiceOrderItem {
  id: string;
  serviceName: string;
  serviceType: ServiceType;
  unitPrice: number;
  totalPrice: number;
  cashPrice: number;
  creditPrice: number;
  unitCostCompany?: number;
  totalCostCompany?: number;
  unitTechMargin?: number;
  totalTechMargin?: number;
  companyMargin?: number;
  isDry?: boolean;
  hasImpact?: boolean;
  isBrokenScreen?: boolean;
  isTurnedOn?: boolean;
  isCharging?: boolean;
  color?: string;
  description?: string;
}

interface ViewServiceOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: string;
    clientName: string;
    clientPhone: string;
    advancePayment?: number;
    balance?: number;
    deliveryDate?: string;
    status: ServiceOrderStatus;
    receivedAt: string;
    images?: { id: string; url: string }[];
    items?: ViewServiceOrderItem[];
    branch?: {
      id: string;
      name: string;
    };
    company?: {
      id: string;
      username: string;
    };
    client?: {
      fullName: string;
      dni: string;
      phone?: string;
      address?: string;
    };
    paymentMethod?: PaymentMethod | null;
    totalClientPrice?: number;
    totalCompanyCost?: number;
    realTechCost?: number;
    totalTechMargin?: number;
    statusHistory?: { id: string; status: ServiceOrderStatus; occurredAt: string }[];
  };
}

export function ViewServiceOrderModal({ open, onOpenChange, order }: ViewServiceOrderModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const { canViewMargins } = useUserRole();
  const total = order.totalClientPrice ?? order.items?.reduce((sum, p) => sum + p.totalPrice, 0) ?? 0;

  const handlePreviousImage = useCallback(() => {
    if (!order.images) return;
    const imageCount = order.images.length;
    setSelectedImageIndex((currentIndex) => {
      if (currentIndex == null) return currentIndex;
      return (currentIndex - 1 + imageCount) % imageCount;
    });
  }, [order.images]);

  const handleNextImage = useCallback(() => {
    if (!order.images) return;
    const imageCount = order.images.length;
    setSelectedImageIndex((currentIndex) => {
      if (currentIndex == null) return currentIndex;
      return (currentIndex + 1) % imageCount;
    });
  }, [order.images]);

  const handleCloseImageViewer = useCallback(() => {
    setSelectedImageIndex(null);
  }, []);

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (selectedImageIndex === null) return;

    if (event.key === "Escape") {
      handleCloseImageViewer();
    }
    if (event.key === "ArrowLeft") {
      handlePreviousImage();
    }
    if (event.key === "ArrowRight") {
      handleNextImage();
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseImageViewer();
    }
  };

  const getDeviceConditions = (item: {
    isDry?: boolean;
    hasImpact?: boolean;
    isBrokenScreen?: boolean;
    isTurnedOn?: boolean;
    isCharging?: boolean;
  }) => {
    const conditions: string[] = [];
    if (!item.isDry) conditions.push("Mojado");
    if (item.hasImpact) conditions.push("Golpeado");
    if (item.isBrokenScreen) conditions.push("Pantalla Rota");
    if (item.isTurnedOn) conditions.push("Prendido");
    if (item.isCharging) conditions.push("Cargando");
    return conditions;
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title="Detalle de Orden de Servicio"
      description={`Orden N° ${order.id.slice(0, 8).toUpperCase()}`}
      size="lg"
    >
      <div className="space-y-4 p-6 bg-black rounded-lg max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-lavender/70 text-sm">Cliente</label>
            <p className="text-white font-medium">{order.clientName}</p>
          </div>
          <div>
            <label className="text-lavender/70 text-sm">Teléfono</label>
            <p className="text-white font-medium">{order.clientPhone}</p>
          </div>
        </div>

        {order.client?.address && (
          <div>
            <label className="text-lavender/70 text-sm">Domicilio</label>
            <p className="text-white font-medium">{order.client.address}</p>
          </div>
        )}

        {order.client?.dni && (
          <div>
            <label className="text-lavender/70 text-sm">DNI</label>
            <p className="text-white font-medium">{order.client.dni}</p>
          </div>
        )}

        {order.company && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-lavender/70 text-sm">Empresa</label>
              <p className="text-white font-medium">{order.company.username}</p>
            </div>
            {order.branch && (
              <div>
                <label className="text-lavender/70 text-sm">Sucursal</label>
                <p className="text-white font-medium">{order.branch.name}</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-lavender/70 text-sm">Estado</label>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge className={SERVICE_ORDER_STATUS_COLORS[order.status]}>
                {SERVICE_ORDER_STATUS_LABELS[order.status]}
              </Badge>
              {order.paymentMethod && (
                <Badge className={PAYMENT_METHOD_BADGE_COLORS[order.paymentMethod]}>
                  {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                </Badge>
              )}
            </div>
          </div>
          <div>
            <label className="text-lavender/70 text-sm">Fecha de Recepción</label>
            <p className="text-white font-medium">{formatDate(order.receivedAt)}</p>
          </div>
        </div>

        {order.deliveryDate && (
          <div>
            <label className="text-lavender/70 text-sm">Fecha de Entrega</label>
            <p className="text-white font-medium">{formatDate(order.deliveryDate)}</p>
          </div>
        )}

        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="border-t border-lavender/10 pt-4">
            <label className="text-lavender font-medium flex items-center gap-2">
              <Clock size={16} />
              Historial de estados
            </label>
            <div className="space-y-2 mt-3">
              {order.statusHistory.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-lavender/40 flex-shrink-0" />
                  <Badge className={SERVICE_ORDER_STATUS_COLORS[entry.status]}>
                    {SERVICE_ORDER_STATUS_LABELS[entry.status]}
                  </Badge>
                  <span className="text-lavender/60 text-xs">{formatDate(entry.occurredAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-lavender/10 pt-4">
          <label className="text-lavender font-medium">Servicios</label>
          <div className="space-y-3 mt-2">
            {order.items?.map((item) => (
              <div key={item.id} className="bg-gray-900 p-3 rounded-lg border border-lavender/10">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-white font-medium">{item.serviceName}</span>
                  <span className="text-lime font-bold">${formatNumber(item.unitPrice)}</span>
                </div>

                <div className="flex gap-4 mt-1 mb-2">
                  <span className="text-lavender/60 text-xs">
                    Efectivo: <span className="text-lime font-semibold">${formatNumber(item.cashPrice)}</span>
                  </span>
                  <span className="text-lavender/60 text-xs">
                    Crédito: <span className="text-green font-semibold">${formatNumber(item.creditPrice)}</span>
                  </span>
                </div>

                {canViewMargins && (
                  <div className="grid grid-cols-4 gap-2 mt-2 p-2 bg-black/40 rounded-md border border-lavender/5">
                    <div className="text-center">
                      <p className="text-lavender/50 text-xs">{SERVICE_ORDER_MARGIN_LABELS.UNIT_COST_COMPANY}</p>
                      <p className="text-yellow-400 font-medium text-sm">
                        ${formatNumber(item.unitCostCompany ?? 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lavender/50 text-xs">Precio cliente</p>
                      <p className="text-lime font-medium text-sm">${formatNumber(item.unitPrice)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lavender/50 text-xs">Gan. técnico</p>
                      <p
                        className={`font-bold text-sm ${
                          (item.unitTechMargin ?? 0) >= 0 ? "text-blue-400" : "text-destructive"
                        }`}
                      >
                        ${formatNumber(item.unitTechMargin ?? 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lavender/50 text-xs">{SERVICE_ORDER_MARGIN_LABELS.COMPANY_MARGIN}</p>
                      <p
                        className={`font-bold text-sm ${
                          (item.companyMargin ?? 0) >= 0 ? "text-lime" : "text-destructive"
                        }`}
                      >
                        ${formatNumber(item.companyMargin ?? 0)}
                      </p>
                    </div>
                  </div>
                )}

                {(item.color || getDeviceConditions(item).length > 0) && (
                  <div className="space-y-1 text-sm mt-2">
                    {item.color && (
                      <p className="text-lavender/70">
                        Color: <span className="text-white">{item.color}</span>
                      </p>
                    )}
                    {getDeviceConditions(item).length > 0 && (
                      <p className="text-lavender/70">
                        Estado: <span className="text-white">{getDeviceConditions(item).join(", ")}</span>
                      </p>
                    )}
                  </div>
                )}

                {item.description && <p className="text-lavender/70 text-sm mt-2">{item.description}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-lavender/10 pt-4 space-y-2">
          <div className="flex justify-between text-lg">
            <span className="text-lavender font-medium">Total:</span>
            <span className="text-lime font-bold">${formatNumber(total)}</span>
          </div>

          {canViewMargins && (
            <div className="mt-3 p-3 bg-black/40 rounded-lg border border-lavender/10 space-y-2">
              <div className="flex justify-between">
                <span className="text-lavender/70 text-sm">{SERVICE_ORDER_MARGIN_LABELS.TOTAL_CLIENT_PRICE}:</span>
                <span className="text-lime font-medium">${formatNumber(order.totalClientPrice ?? total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lavender/70 text-sm">{SERVICE_ORDER_MARGIN_LABELS.TOTAL_COMPANY_COST}:</span>
                <span className="text-yellow-400 font-medium">${formatNumber(order.totalCompanyCost ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lavender/70 text-sm">{SERVICE_ORDER_MARGIN_LABELS.REAL_TECH_COST}:</span>
                <span className="text-orange-400 font-medium">${formatNumber(order.realTechCost ?? 0)}</span>
              </div>
              <div className="flex justify-between border-t border-lavender/10 pt-2">
                <span className="text-lavender font-medium text-sm">{SERVICE_ORDER_MARGIN_LABELS.TOTAL_MARGIN}:</span>
                <span
                  className={`font-bold ${
                    (order.totalTechMargin ?? 0) >= 0 ? "text-lime" : "text-destructive"
                  }`}
                >
                  ${formatNumber(order.totalTechMargin ?? 0)}
                </span>
              </div>
            </div>
          )}

          {order.advancePayment !== undefined && order.advancePayment > 0 && (
            <div className="flex justify-between">
              <span className="text-lavender/70">Anticipo:</span>
              <span className="text-white">${formatNumber(order.advancePayment)}</span>
            </div>
          )}
          {order.balance !== undefined && (
            <div className="flex justify-between">
              <span className="text-lavender/70">Saldo:</span>
              <span className="text-white font-bold">${formatNumber(order.balance)}</span>
            </div>
          )}
        </div>

        {order.images && order.images.length > 0 && (
          <div className="border-t border-lavender/10 pt-4">
            <label className="text-lavender font-medium">Imágenes</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {order.images.map((img, index) => (
                <div
                  key={img.id}
                  className="relative aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <Image
                    src={img.url}
                    alt="Imagen de orden"
                    fill
                    className="object-cover rounded-lg border border-lavender/20"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedImageIndex !== null && order.images && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={handleBackdropClick}
        >
          <button
            onClick={handleCloseImageViewer}
            className="absolute top-4 right-4 text-white hover:text-lime transition-colors z-10"
          >
            <X size={32} />
          </button>

          <button
            onClick={handlePreviousImage}
            className="absolute left-4 text-white hover:text-lime transition-colors z-10"
            disabled={order.images.length <= 1}
          >
            <ChevronLeft size={48} />
          </button>

          <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center p-8">
            <Image src={order.images[selectedImageIndex].url} alt="Imagen ampliada" fill className="object-contain" />
          </div>

          <button
            onClick={handleNextImage}
            className="absolute right-4 text-white hover:text-lime transition-colors z-10"
            disabled={order.images.length <= 1}
          >
            <ChevronRight size={48} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {selectedImageIndex + 1} / {order.images.length}
          </div>
        </div>
      )}
    </GenericModal>
  );
}
