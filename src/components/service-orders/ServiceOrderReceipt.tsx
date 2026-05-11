"use client";

import { useEffect } from "react";
import Image from "next/image";
import { formatNumber } from "@/utils/formatters.util";
import { ProductType } from "@prisma/client";

interface ServiceOrderReceiptProps {
  order: {
    id: string;
    clientName: string;
    clientPhone: string;
    clientAddress?: string;
    advancePayment?: number;
    balance?: number;
    deliveryDate?: string;
    receivedAt: string;
    products?: {
      productName: string;
      productType: ProductType;
      unitPrice: number;
      isDry?: boolean;
      hasImpact?: boolean;
      isBrokenScreen?: boolean;
      isTurnedOn?: boolean;
      isCharging?: boolean;
      color?: string;
      description?: string;
    }[];
  };
  onClose: () => void;
}

export function ServiceOrderReceipt({ order, onClose }: ServiceOrderReceiptProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    const handleAfterPrint = () => {
      onClose();
    };

    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [onClose]);

  const total = order.products?.reduce((sum, p) => sum + p.unitPrice, 0) || 0;
  const advancePayment = order.advancePayment || 0;
  const balance = order.balance || total - advancePayment;

  const getDeviceConditions = () => {
    if (!order.products || order.products.length === 0) return [];

    const conditions: string[] = [];
    const product = order.products[0];

    if (!product.isDry) conditions.push("Mojado");
    if (product.hasImpact) conditions.push("Golpeado");
    if (product.isBrokenScreen) conditions.push("Pantalla Rota");
    if (product.isTurnedOn) conditions.push("Prendido");
    if (product.isCharging) conditions.push("Cargando");
    if (product.color) conditions.push(`Color: ${product.color}`);

    return conditions;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto print:relative">
      <div className="max-w-4xl mx-auto p-8 bg-white text-black">
        <div className="flex items-start justify-between mb-6">
          <div className="w-32 h-32 relative">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold uppercase">Formulario Recepción Servicio Técnico</h1>
            <p className="text-sm mt-2">Fecha: {formatDate(order.receivedAt)}</p>
            <p className="text-sm">N° Orden: {order.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-bold text-sm uppercase">Nombre del Cliente:</label>
            <div className="border-2 border-gray-400 rounded p-2 mt-1 min-h-[40px]">{order.clientName}</div>
          </div>

          <div>
            <label className="font-bold text-sm uppercase">Domicilio:</label>
            <div className="border-2 border-gray-400 rounded p-2 mt-1 min-h-[40px]">{order.clientAddress || "-"}</div>
          </div>

          <div>
            <label className="font-bold text-sm uppercase">Número de Contacto:</label>
            <div className="border-2 border-gray-400 rounded p-2 mt-1 min-h-[40px]">{order.clientPhone}</div>
          </div>

          <div>
            <label className="font-bold text-sm uppercase">Modelo de Celular y Trabajo a Realizar:</label>
            <div className="border-2 border-gray-400 rounded p-3 mt-1 min-h-[80px]">
              {order.products && order.products.length > 0 ? (
                <ul className="space-y-1">
                  {order.products.map((product, index) => (
                    <li key={index} className="text-sm">
                      • {product.productName} - ${formatNumber(product.unitPrice)}
                    </li>
                  ))}
                </ul>
              ) : (
                "-"
              )}
            </div>
          </div>

          <div>
            <label className="font-bold text-sm uppercase">Estado General de Recepción de Equipo:</label>
            <div className="border-2 border-gray-400 rounded p-3 mt-1 min-h-[100px]">
              {getDeviceConditions().length > 0 ? (
                <ul className="space-y-1">
                  {getDeviceConditions().map((condition, index) => (
                    <li key={index} className="text-sm">
                      • {condition}
                    </li>
                  ))}
                </ul>
              ) : (
                "-"
              )}
            </div>
          </div>

          <div>
            <label className="font-bold text-sm uppercase">Observación:</label>
            <div className="border-2 border-gray-400 rounded p-3 mt-1 min-h-[120px]">
              {order.products?.[0]?.description || "-"}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-sm uppercase">Precio:</label>
              <div className="border-2 border-gray-400 rounded p-2 mt-1 text-center font-bold">
                ${formatNumber(total)}
              </div>
            </div>
            <div>
              <label className="font-bold text-sm uppercase">Entrega:</label>
              <div className="border-2 border-gray-400 rounded p-2 mt-1 text-center">
                {order.deliveryDate ? formatDate(order.deliveryDate) : "-"}
              </div>
            </div>
            <div>
              <label className="font-bold text-sm uppercase">Saldo:</label>
              <div className="border-2 border-gray-400 rounded p-2 mt-1 text-center font-bold">
                ${formatNumber(balance)}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded text-xs leading-relaxed">
            <p className="font-bold mb-2">DATOS IMPORTANTE:</p>
            <p>
              Los equipos que no encienden se recibe bajo responsabilidad del cliente, ya que como están apagados no
              permite verificar otros fallos, si existe una falla adicional será una reparación aparte con otro cobro,
              equipos que son llevados a otros servicios técnicos perderán su garantía, para retirar el equipo debe
              presentar la factura original y se les dará un máximo de 30 días para retirar.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t-2 border-gray-300">
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-2 mt-12">
                <p className="font-bold text-sm">FIRMA CLIENTE</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-2 mt-12">
                <p className="font-bold text-sm">ACLARACIÓN</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-2 mt-12">
                <p className="font-bold text-sm">DNI</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-2 mt-12">
                <p className="font-bold text-sm">COD VEND</p>
              </div>
            </div>
          </div>
        </div>

        <button onClick={onClose} className="mt-8 px-6 py-2 bg-gray-800 text-white rounded print:hidden">
          Cerrar
        </button>
      </div>

      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}
