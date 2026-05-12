"use client";

import { useEffect } from "react";
import Image from "next/image";

interface WarrantyReceiptProps {
  order: {
    client?: {
      fullName: string;
    };
  };
  onClose: () => void;
}

export function WarrantyReceipt({ order, onClose }: WarrantyReceiptProps) {
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

  const formatDate = () => {
    const date = new Date();
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
                <h1 className="text-2xl font-bold uppercase text-blue-900">
                  Formulario Entrega y Garantía Servicio Técnico
                </h1>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="font-bold text-base uppercase text-blue-900">Nombre del Cliente:</label>
                <div className="border-2 border-gray-800 rounded p-2 mt-1 min-h-[40px]">
                  <span className="text-base text-black">{order.client?.fullName || "-"}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-base uppercase text-blue-900">Items de Garantía de Reparación:</label>
                <div className="border-2 border-gray-800 rounded p-4 mt-1 min-h-[200px]">
                  <ul className="space-y-2 text-base text-black">
                    <li>• LA GARANTÍA DE LA REPARACIÓN SE RESPONSABILIZA POR FALLA DE FÁBRICA DEL REPUESTO.</li>
                    <li>• NO CUBRE ROTURA, RAYONES, GOLPES, HUMEDAD NI SALPICADURAS DE CUALQUIER ÍNDOLE.</li>
                    <li>
                      • LA GARANTÍA DEL ARREGLO CORRE DESDE EL MOMENTO DE LA ENTREGA, CAMBIO DIRECTO 48HS Y LA GARANTÍA
                      DEL ARREGLO CORRE DESDE EL MOMENTO DE LA ENTREGA, CAMBIO DIRECTO 48HS Y LA GARANTÍA DE PRUEBA 30
                      DÍAS.( PASADA LA FECHA DE LA MISMA, EL CLIENTE NO TIENE DERECHO A RECLAMOS NI QUEJAS SOBRE EL
                      TRABAJO REALIZADO)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-2 border-gray-800 rounded p-4 min-h-[120px]">
                <p className="text-base text-black leading-relaxed">
                  EN LA PRESENTE, SE ENTREGA AL CLIENTE( DETALLANDO SU NOMBRE EN EL COMIENZO), SU RESPECTIVO EQUIPO
                  ARREGLADO EN PERFECTAS CONDICIONES Y ACEPTA EN CONFORMIDAD LA ENTREGA DEL MISMO. DETALLANDO Y
                  ACEPTANDO LOS TÉRMINOS Y CONDICIONES DE LA REPARACIÓN.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t-2 border-gray-800">
                <div className="text-center">
                  <p className="font-bold text-base text-blue-900 mb-2">FIRMA</p>
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
              </div>

              <div className="text-right mt-4">
                <p className="font-bold text-base text-blue-900">FECHA</p>
                <div className="border-t-2 border-gray-800 pt-2 mt-2 inline-block min-w-[200px]">
                  <span className="text-base text-black">{formatDate()}</span>
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

      <div className="hidden print:block" id="warranty-print-content">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-72 h-32 relative">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold uppercase text-blue-900">
                Formulario Entrega y Garantía Servicio Técnico
              </h1>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <label className="font-bold text-base uppercase text-blue-900">Nombre del Cliente:</label>
              <div className="border-2 border-gray-800 rounded p-2 mt-1">
                <span className="text-base text-black">{order.client?.fullName || "-"}</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-base uppercase text-blue-900">Items de Garantía de Reparación:</label>
              <div className="border-2 border-gray-800 rounded p-3 mt-1">
                <ul className="space-y-1 text-sm text-black">
                  <li>• LA GARANTÍA DE LA REPARACIÓN SE RESPONSABILIZA POR FALLA DE FÁBRICA DEL REPUESTO.</li>
                  <li>• NO CUBRE ROTURA, RAYONES, GOLPES, HUMEDAD NI SALPICADURAS DE CUALQUIER ÍNDOLE.</li>
                  <li>
                    • LA GARANTÍA DEL ARREGLO CORRE DESDE EL MOMENTO DE LA ENTREGA, CAMBIO DIRECTO 48HS Y LA GARANTÍA DE
                    PRUEBA 30 DÍAS.( PASADA LA FECHA DE LA MISMA, EL CLIENTE NO TIENE DERECHO A RECLAMOS NI QUEJAS SOBRE
                    EL TRABAJO REALIZADO)
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-2 border-gray-800 rounded p-3">
              <p className="text-sm text-black leading-relaxed">
                EN LA PRESENTE, SE ENTREGA AL CLIENTE( DETALLANDO SU NOMBRE EN EL COMIENZO), SU RESPECTIVO EQUIPO
                ARREGLADO EN PERFECTAS CONDICIONES Y ACEPTA EN CONFORMIDAD LA ENTREGA DEL MISMO. DETALLANDO Y ACEPTANDO
                LOS TÉRMINOS Y CONDICIONES DE LA REPARACIÓN.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t-2 border-gray-800">
              <div className="text-center">
                <p className="font-bold text-base text-blue-900 mb-2">FIRMA</p>
                <div className="border-t-2 border-gray-800 pt-2 mt-8"></div>
              </div>
              <div className="text-center">
                <p className="font-bold text-base text-blue-900 mb-2">ACLARACIÓN</p>
                <div className="border-t-2 border-gray-800 pt-2 mt-8"></div>
              </div>
              <div className="text-center">
                <p className="font-bold text-base text-blue-900 mb-2">DNI</p>
                <div className="border-t-2 border-gray-800 pt-2 mt-8"></div>
              </div>
              <div className="text-center">
                <p className="font-bold text-base text-blue-900 mb-2">FECHA</p>
                <p className="text-lg font-bold text-black mt-2">{formatDate()}</p>
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

          #warranty-print-content,
          #warranty-print-content * {
            visibility: visible;
          }

          #warranty-print-content {
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
