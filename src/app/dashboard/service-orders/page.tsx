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
import { motion } from "framer-motion";

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
  products?: {
    id: string;
    productName: string;
    unitPrice: number;
    totalPrice: number;
  }[];
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
    <div className="min-h-screen bg-charcoal p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-lavender">Órdenes de Servicio</h1>
            <p className="text-lavender/60 text-lg mt-1">Gestión de servicios técnicos</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-lime hover:bg-green text-dark font-bold px-6 py-6 text-lg shadow-lg"
          >
            <Plus className="mr-2" size={24} />
            Nueva Orden
          </Button>
        </div>

        <Card className="bg-dark/80 backdrop-blur-sm border border-lavender/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-lavender/10">
                  <th className="text-left p-4 text-lavender font-bold">Cliente</th>
                  <th className="text-left p-4 text-lavender font-bold">Teléfono</th>
                  <th className="text-left p-4 text-lavender font-bold">Dispositivo</th>
                  <th className="text-left p-4 text-lavender font-bold">Problema</th>
                  <th className="text-left p-4 text-lavender font-bold">Productos</th>
                  <th className="text-left p-4 text-lavender font-bold">Total</th>
                  <th className="text-left p-4 text-lavender font-bold">Estado</th>
                  <th className="text-left p-4 text-lavender font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-lavender/60 font-semibold">
                      Cargando...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-lime/20 flex items-center justify-center">
                          <Plus size={32} className="text-lime" />
                        </div>
                        <p className="text-lavender font-semibold text-lg">No hay órdenes de servicio</p>
                        <p className="text-lavender/60">Crea tu primera orden para comenzar</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const total = order.products?.reduce((sum, p) => sum + p.totalPrice, 0) || 0;
                    return (
                      <tr key={order.id} className="border-b border-lavender/10 hover:bg-lavender/5 transition-all">
                        <td className="p-4 text-lavender font-bold">{order.clientName}</td>
                        <td className="p-4 text-lavender/80">{order.clientPhone}</td>
                        <td className="p-4 text-lavender/80 font-semibold">{order.deviceModel}</td>
                        <td className="p-4 text-lavender/80 max-w-xs truncate">{order.deviceIssue}</td>
                        <td className="p-4">
                          {order.products && order.products.length > 0 ? (
                            <div className="text-xs text-lavender/70">
                              {order.products.length} servicio{order.products.length > 1 ? "s" : ""}
                            </div>
                          ) : (
                            <span className="text-lavender/40">-</span>
                          )}
                        </td>
                        <td className="p-4 text-lime font-bold text-lg">${formatNumber(total)}</td>
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
                              className="text-lime hover:text-green hover:bg-lime/20 transition-all"
                            >
                              <Edit size={18} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(order.id)}
                              className="text-destructive hover:text-destructive/80 hover:bg-destructive/20 transition-all"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      <ServiceOrderModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        onSuccess={loadOrders}
        order={selectedOrder}
      />
    </div>
  );
}
