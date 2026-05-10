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
    } catch (error) {
      clientErrorHandler(error);
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
    <div className="min-h-screen bg-gradient-to-br from-skybase-950 via-deepspace-900 to-skybase-900 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Órdenes de Servicio</h1>
            <p className="text-skybase-300 mt-1">Gestión de servicios técnicos</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-bluegreen-500 to-bluegreen-600 hover:from-bluegreen-400 hover:to-bluegreen-500"
          >
            <Plus className="mr-2" size={20} />
            Nueva Orden
          </Button>
        </div>

        <Card className="bg-skybase-900/50 border-skybase-700/50 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-skybase-700/50">
                  <th className="text-left p-4 text-skybase-300 font-semibold">Cliente</th>
                  <th className="text-left p-4 text-skybase-300 font-semibold">Teléfono</th>
                  <th className="text-left p-4 text-skybase-300 font-semibold">Dispositivo</th>
                  <th className="text-left p-4 text-skybase-300 font-semibold">Problema</th>
                  <th className="text-left p-4 text-skybase-300 font-semibold">Costo Est.</th>
                  <th className="text-left p-4 text-skybase-300 font-semibold">Estado</th>
                  <th className="text-left p-4 text-skybase-300 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-skybase-400">
                      Cargando...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-skybase-400">
                      No hay órdenes de servicio
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-skybase-800/30 hover:bg-skybase-800/20">
                      <td className="p-4 text-white font-medium">{order.clientName}</td>
                      <td className="p-4 text-skybase-300">{order.clientPhone}</td>
                      <td className="p-4 text-skybase-300">{order.deviceModel}</td>
                      <td className="p-4 text-skybase-300 max-w-xs truncate">{order.deviceIssue}</td>
                      <td className="p-4 text-bluegreen-400 font-semibold">${formatNumber(order.estimatedCost)}</td>
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
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(order.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={16} />
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
