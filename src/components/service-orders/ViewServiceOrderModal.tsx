"use client";

import { GenericModal } from "@/components/common/GenericModal";
import { Badge } from "@/components/ui/badge";
import { SERVICE_ORDER_STATUS_LABELS, SERVICE_ORDER_STATUS_COLORS } from "@/constants/serviceOrder.constant";
import { formatNumber } from "@/utils/formatters.util";
import { ServiceOrderStatus, ProductType } from "@prisma/client";
import Image from "next/image";

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
  };
}

export function ViewServiceOrderModal({ open, onOpenChange, order }: ViewServiceOrderModalProps) {
  const total = order.products?.reduce((sum, p) => sum + p.totalPrice, 0) || 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDeviceConditions = (product: any) => {
    const conditions: string[] = [];
    if (!product.isDry) conditions.push("Mojado");
    if (product.hasImpact) conditions.push("Golpeado");
    if (product.isBrokenScreen) conditions.push("Pantalla Rota");
    if (product.isTurnedOn) conditions.push("Prendido");
    if (product.isCharging) conditions.push("Cargando");
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
            <div className="mt-1">
              <Badge className={SERVICE_ORDER_STATUS_COLORS[order.status]}>
                {SERVICE_ORDER_STATUS_LABELS[order.status]}
              </Badge>
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

        <div className="border-t border-lavender/10 pt-4">
          <label className="text-lavender font-medium">Servicios</label>
          <div className="space-y-3 mt-2">
            {order.products?.map((product, index) => (
              <div key={product.id} className="bg-gray-900 p-3 rounded-lg border border-lavender/10">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-white font-medium">{product.productName}</span>
                  <span className="text-lime font-bold">${formatNumber(product.unitPrice)}</span>
                </div>

                {(product.color || getDeviceConditions(product).length > 0) && (
                  <div className="space-y-1 text-sm">
                    {product.color && (
                      <p className="text-lavender/70">
                        Color: <span className="text-white">{product.color}</span>
                      </p>
                    )}
                    {getDeviceConditions(product).length > 0 && (
                      <p className="text-lavender/70">
                        Estado: <span className="text-white">{getDeviceConditions(product).join(", ")}</span>
                      </p>
                    )}
                  </div>
                )}

                {product.description && <p className="text-lavender/70 text-sm mt-2">{product.description}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-lavender/10 pt-4 space-y-2">
          <div className="flex justify-between text-lg">
            <span className="text-lavender font-medium">Total:</span>
            <span className="text-lime font-bold">${formatNumber(total)}</span>
          </div>
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
              {order.images.map((img) => (
                <div key={img.id} className="relative aspect-square">
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
    </GenericModal>
  );
}
