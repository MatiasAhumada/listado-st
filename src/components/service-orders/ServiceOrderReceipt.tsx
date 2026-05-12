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
    client?: {
      fullName: string;
      dni: string;
      phone?: string;
      address?: string;
    };
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
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-[21cm] bg-white rounded-lg shadow-2xl overflow-auto max-h-[90vh] print:hidden">
          <div className="p-8 bg-white text-black">
            <div className="flex items-start justify-between mb-6">
              <div className="w-64 h-32 relative">
                <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold uppercase text-blue-900">Formulario Recepción Servicio Técnico</h1>
                <p className="text-base mt-2 text-gray-800">Fecha: {formatDate(order.receivedAt)}</p>
                <p className="text-base text-gray-800">N° Orden: {order.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-bold text-base uppercase text-blue-900">Nombre del Cliente:</label>
                <div className="border-2 border-gray-800 rounded p-2 mt-1 min-h-[40px]">
                  <span className="text-base text-black">{order.clientName}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-base uppercase text-blue-900">Domicilio:</label>
                <div className="border-2 border-gray-800 rounded p-2 mt-1 min-h-[40px]">
                  <span className="text-base text-black">{order.client?.address || "-"}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-base uppercase text-blue-900">Número de Contacto:</label>
                <div className="border-2 border-gray-800 rounded p-2 mt-1 min-h-[40px]">
                  <span className="text-base text-black">{order.clientPhone}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-base uppercase text-blue-900">
                  Modelo de Celular y Trabajo a Realizar:
                </label>
                <div className="border-2 border-gray-800 rounded p-3 mt-1 min-h-[80px]">
                  {order.products && order.products.length > 0 ? (
                    <ul className="space-y-1">
                      {order.products.map((product, index) => (
                        <li key={index} className="text-base text-black">
                          • {product.productName} - ${formatNumber(product.unitPrice)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-base text-black">-</span>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-base uppercase text-blue-900">
                  Estado General de Recepción de Equipo:
                </label>
                <div className="border-2 border-gray-800 rounded p-3 mt-1 min-h-[100px]">
                  {getDeviceConditions().length > 0 ? (
                    <ul className="space-y-1">
                      {getDeviceConditions().map((condition, index) => (
                        <li key={index} className="text-base text-black">
                          • {condition}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-base text-black">-</span>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-base uppercase text-blue-900">Observación:</label>
                <div className="border-2 border-gray-800 rounded p-3 mt-1 min-h-[120px]">
                  <span className="text-base text-black">{order.products?.[0]?.description || "-"}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-base uppercase text-blue-900">Precio:</label>
                  <div className="border-2 border-gray-800 rounded p-2 mt-1 text-center">
                    <span className="text-base font-bold text-black">${formatNumber(total)}</span>
                  </div>
                </div>
                <div>
                  <label className="font-bold text-base uppercase text-blue-900">Entrega:</label>
                  <div className="border-2 border-gray-800 rounded p-2 mt-1 text-center">
                    <span className="text-base text-black">
                      {order.deliveryDate ? formatDate(order.deliveryDate) : "-"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="font-bold text-base uppercase text-blue-900">Saldo:</label>
                  <div className="border-2 border-gray-800 rounded p-2 mt-1 text-center">
                    <span className="text-base font-bold text-black">${formatNumber(balance)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded leading-relaxed">
                <p className="font-bold mb-2 text-base text-yellow-900 uppercase">DATOS IMPORTANTE:</p>
                <p className="text-sm text-gray-800">
                  Los equipos que no encienden se recibe bajo responsabilidad del cliente, ya que como están apagados no
                  permite verificar otros fallos, si existe una falla adicional será una reparación aparte con otro
                  cobro, equipos que son llevados a otros servicios técnicos perderán su garantía, para retirar el
                  equipo debe presentar la factura original y se les dará un máximo de 30 días para retirar.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t-2 border-gray-800">
                <div className="text-center">
                  <p className="font-bold text-base text-blue-900 mb-2">FIRMA CLIENTE</p>
                  <div className="border-t-2 border-gray-800 pt-2 mt-12"></div>
                </div>
                <div className="text-center">
                  <p className="font-bold text-base text-blue-900 mb-2">ACLARACIÓN</p>
                  <div className="border-t-2 border-gray-800 pt-2 mt-12"></div>
                </div>
                <div className="text-center">
                  <p className="font-bold text-base text-blue-900 mb-2">DNI</p>
                  <div className="border-t-2 border-gray-800 pt-2 mt-12"></div>
                </div>
                <div className="text-center">
                  <p className="font-bold text-base text-blue-900 mb-2">COD VEND</p>
                  <p className="text-lg font-mono font-bold text-black mb-2">{order.id.slice(-8).toUpperCase()}</p>
                  <div className="border-t-2 border-gray-800 pt-2"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-100 border-t flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-lime text-dark rounded hover:bg-green transition-colors font-bold"
            >
              Imprimir
            </button>
          </div>
        </div>
      </div>

      <div className="hidden print:block">
        <div className="p-12">
          <div className="flex items-start justify-between mb-6">
            <div className="w-64 h-32 relative">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold uppercase text-blue-900">Formulario Recepción Servicio Técnico</h1>
              <p className="text-base mt-2 text-gray-800">Fecha: {formatDate(order.receivedAt)}</p>
              <p className="text-base text-gray-800">N° Orden: {order.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-bold text-base uppercase text-blue-900">Nombre del Cliente:</label>
              <div className="border-2 border-gray-800 rounded p-2 mt-1 min-h-[40px]">
                <span className="text-base text-black">{order.clientName}</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-base uppercase text-blue-900">Domicilio:</label>
              <div className="border-2 border-gray-800 rounded p-2 mt-1 min-h-[40px]">
                <span className="text-base text-black">{order.client?.address || "-"}</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-base uppercase text-blue-900">Número de Contacto:</label>
              <div className="border-2 border-gray-800 rounded p-2 mt-1 min-h-[40px]">
                <span className="text-base text-black">{order.clientPhone}</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-base uppercase text-blue-900">
                Modelo de Celular y Trabajo a Realizar:
              </label>
              <div className="border-2 border-gray-800 rounded p-3 mt-1 min-h-[80px]">
                {order.products && order.products.length > 0 ? (
                  <ul className="space-y-1">
                    {order.products.map((product, index) => (
                      <li key={index} className="text-base text-black">
                        • {product.productName} - ${formatNumber(product.unitPrice)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-base text-black">-</span>
                )}
              </div>
            </div>

            <div>
              <label className="font-bold text-base uppercase text-blue-900">
                Estado General de Recepción de Equipo:
              </label>
              <div className="border-2 border-gray-800 rounded p-3 mt-1 min-h-[100px]">
                {getDeviceConditions().length > 0 ? (
                  <ul className="space-y-1">
                    {getDeviceConditions().map((condition, index) => (
                      <li key={index} className="text-base text-black">
                        • {condition}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-base text-black">-</span>
                )}
              </div>
            </div>

            <div>
              <label className="font-bold text-base uppercase text-blue-900">Observación:</label>
              <div className="border-2 border-gray-800 rounded p-3 mt-1 min-h-[120px]">
                <span className="text-base text-black">{order.products?.[0]?.description || "-"}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-base uppercase text-blue-900">Precio:</label>
                <div className="border-2 border-gray-800 rounded p-2 mt-1 text-center">
                  <span className="text-base font-bold text-black">${formatNumber(total)}</span>
                </div>
              </div>
              <div>
                <label className="font-bold text-base uppercase text-blue-900">Entrega:</label>
                <div className="border-2 border-gray-800 rounded p-2 mt-1 text-center">
                  <span className="text-base text-black">
                    {order.deliveryDate ? formatDate(order.deliveryDate) : "-"}
                  </span>
                </div>
              </div>
              <div>
                <label className="font-bold text-base uppercase text-blue-900">Saldo:</label>
                <div className="border-2 border-gray-800 rounded p-2 mt-1 text-center">
                  <span className="text-base font-bold text-black">${formatNumber(balance)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded leading-relaxed">
              <p className="font-bold mb-2 text-base text-yellow-900 uppercase">DATOS IMPORTANTE:</p>
              <p className="text-sm text-gray-800">
                Los equipos que no encienden se recibe bajo responsabilidad del cliente, ya que como están apagados no
                permite verificar otros fallos, si existe una falla adicional será una reparación aparte con otro cobro,
                equipos que son llevados a otros servicios técnicos perderán su garantía, para retirar el equipo debe
                presentar la factura original y se les dará un máximo de 30 días para retirar.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t-2 border-gray-800">
              <div className="text-center">
                <p className="font-bold text-base text-blue-900 mb-2">FIRMA CLIENTE</p>
                <div className="border-t-2 border-gray-800 pt-2 mt-12"></div>
              </div>
              <div className="text-center">
                <p className="font-bold text-base text-blue-900 mb-2">ACLARACIÓN</p>
                <div className="border-t-2 border-gray-800 pt-2 mt-12"></div>
              </div>
              <div className="text-center">
                <p className="font-bold text-base text-blue-900 mb-2">DNI</p>
                <div className="border-t-2 border-gray-800 pt-2 mt-12"></div>
              </div>
              <div className="text-center">
                <p className="font-bold text-base text-blue-900 mb-2">COD VEND</p>
                <p className="text-lg font-mono font-bold text-black mb-2">{order.id.slice(-8).toUpperCase()}</p>
                <div className="border-t-2 border-gray-800 pt-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }

          body * {
            visibility: hidden;
          }

          .hidden.print\:block,
          .hidden.print\:block * {
            visibility: visible;
          }

          .hidden.print\:block {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
