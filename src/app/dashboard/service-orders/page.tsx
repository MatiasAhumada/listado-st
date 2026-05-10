"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceOrderModal } from "@/components/service-orders/ServiceOrderModal";
import { getServiceOrders, deleteServiceOrder } from "@/services/serviceOrder.service";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { SERVICE_ORDER_STATUS_LABELS, SERVICE_ORDER_STATUS_COLORS } from "@/constants/serviceOrder.constant";
import { formatNumber } from "@/utils/formatters.util";
import { Plus, Edit, Trash2 } from "lucide-react";
import { ServiceOrderStatus } from "@prisma/client";

interface ServiceOrder {
  id: string;
  clientName: string;
  clientPhone: string;
  deviceModel: string;
  deviceIssue: string;
  estimatedCost: number;
  finalCost?: number;
  status: ServiceOrderStatus;
  receivedAt: string;
  notes?: string;
}

export default function ServiceOrdersPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | undefined>();

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getServiceOrders();
      setOrders(data);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setOrders([]);
      } else {
        clientErrorHandler(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta orden?")) return;

    try {
      await deleteServiceOrder(id);
      clientSuccessHandler("Orden eliminada correctamente");
      loadOrders();
    } catch (error) {
      clientErrorHandler(error);
    }
  };

  const handleEdit = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedOrder(undefined);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedOrder(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vanilla-cream-800 via-vanilla-cream-700 to-vanilla-cream-600 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-hunter-green-700">Órdenes de Servicio</h1>
            <p className="text-hunter-green-500 text-lg mt-1">Gestión de servicios técnicos</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-yellow-green-500 to-yellow-green-600 hover:from-yellow-green-400 hover:to-yellow-green-500 shadow-lg shadow-yellow-green-500/40 text-hunter-green-900 font-bold px-6 py-6 text-lg"
          >
            <Plus className="mr-2" size={24} />
            Nueva Orden
          </Button>
        </div>

        <Card className="bg-white border-2 border-yellow-green-400 shadow-2xl backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-yellow-green-400 bg-gradient-to-r from-hunter-green-50 to-sage-green-50">
                  <th className="text-left p-4 text-hunter-green-700 font-bold">Cliente</th>
                  <th className="text-left p-4 text-hunter-green-700 font-bold">Teléfono</th>
                  <th className="text-left p-4 text-hunter-green-700 font-bold">Dispositivo</th>
                  <th className="text-left p-4 text-hunter-green-700 font-bold">Problema</th>
                  <th className="text-left p-4 text-hunter-green-700 font-bold">Costo Est.</th>
                  <th className="text-left p-4 text-hunter-green-700 font-bold">Estado</th>
                  <th className="text-left p-4 text-hunter-green-700 font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-hunter-green-500 font-semibold">
                      Cargando...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-yellow-green-100 flex items-center justify-center">
                          <Plus size={32} className="text-yellow-green-600" />
                        </div>
                        <p className="text-hunter-green-600 font-semibold text-lg">No hay órdenes de servicio</p>
                        <p className="text-hunter-green-400">Crea tu primera orden para comenzar</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-sage-green-100 hover:bg-yellow-green-50 transition-all">
                      <td className="p-4 text-hunter-green-800 font-bold">{order.clientName}</td>
                      <td className="p-4 text-hunter-green-600">{order.clientPhone}</td>
                      <td className="p-4 text-hunter-green-600 font-semibold">{order.deviceModel}</td>
                      <td className="p-4 text-hunter-green-600 max-w-xs truncate">{order.deviceIssue}</td>
                      <td className="p-4 text-yellow-green-700 font-bold text-lg">${formatNumber(order.estimatedCost)}</td>
                      <td className="p-4">
                        <Badge className={SERVICE_ORDER_STATUS_COLORS[order.status]}>
                          {SERVICE_ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(order)}
                            className="text-yellow-green-600 hover:text-yellow-green-800 hover:bg-yellow-green-100 transition-all"
                          >
                            <Edit size={18} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(order.id)}
                            className="text-blushed-brick-600 hover:text-blushed-brick-800 hover:bg-blushed-brick-100 transition-all"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <ServiceOrderModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        onSuccess={loadOrders}
        order={selectedOrder}
      />
    </div>
  );
}
