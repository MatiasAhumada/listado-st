"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { ServiceOrderModal } from "@/components/service-orders/ServiceOrderModal";
import { getServiceOrders, deleteServiceOrder } from "@/services/serviceOrder.service";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { SERVICE_ORDER_STATUS_LABELS, SERVICE_ORDER_STATUS_COLORS } from "@/constants/serviceOrder.constant";
import { formatNumber } from "@/utils/formatters.util";
import { Plus, Edit, Trash2 } from "lucide-react";
import { ServiceOrderStatus, ProductType } from "@prisma/client";
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
  branch?: {
    id: string;
    name: string;
  };
  products?: {
    id: string;
    productName: string;
    productType: ProductType;
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

  const columns = useMemo(
    () => [
      { key: "clientName", label: "Cliente", render: (item: ServiceOrder) => <span className="text-lavender font-bold">{item.clientName}</span> },
      { key: "clientPhone", label: "Teléfono", render: (item: ServiceOrder) => <span className="text-lavender/80">{item.clientPhone}</span> },
      { key: "deviceModel", label: "Dispositivo", render: (item: ServiceOrder) => <span className="text-lavender/80 font-semibold">{item.deviceModel}</span> },
      { key: "deviceIssue", label: "Problema", render: (item: ServiceOrder) => <span className="text-lavender/80 max-w-xs truncate block">{item.deviceIssue}</span> },
      {
        key: "branch",
        label: "Sucursal",
        render: (item: ServiceOrder) =>
          item.branch ? (
            <Badge className="bg-lime/20 text-lime border-lime/30">{item.branch.name}</Badge>
          ) : (
            <span className="text-lavender/40">-</span>
          ),
      },
      {
        key: "products",
        label: "Productos",
        render: (item: ServiceOrder) =>
          item.products && item.products.length > 0 ? (
            <div className="text-xs text-lavender/70">
              {item.products.length} servicio{item.products.length > 1 ? "s" : ""}
            </div>
          ) : (
            <span className="text-lavender/40">-</span>
          ),
      },
      {
        key: "total",
        label: "Total",
        render: (item: ServiceOrder) => {
          const total = item.products?.reduce((sum, p) => sum + p.totalPrice, 0) || 0;
          return <span className="text-lime font-bold text-lg">${formatNumber(total)}</span>;
        },
      },
      {
        key: "status",
        label: "Estado",
        render: (item: ServiceOrder) => (
          <Badge className={SERVICE_ORDER_STATUS_COLORS[item.status]}>{SERVICE_ORDER_STATUS_LABELS[item.status]}</Badge>
        ),
      },
      {
        key: "actions",
        label: "Acciones",
        render: (item: ServiceOrder) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEdit(item)}
              className="text-lime hover:text-green hover:bg-lime/20 transition-all"
            >
              <Edit size={18} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(item.id)}
              className="text-destructive hover:text-destructive/80 hover:bg-destructive/20 transition-all"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-charcoal p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <DataTable
          title="Órdenes de Servicio"
          subtitle="Gestión de servicios técnicos"
          data={orders}
          columns={columns}
          keyExtractor={(item: ServiceOrder) => item.id}
          loading={loading}
          emptyMessage="No hay órdenes de servicio"
          emptyIcon={<Plus size={32} className="text-lime" />}
          actions={
            <Button onClick={handleCreate} className="bg-lime hover:bg-green text-dark font-bold px-6 py-3 shadow-lg">
              <Plus className="mr-2" size={20} />
              Nueva Orden
            </Button>
          }
        />
      </motion.div>

      <ServiceOrderModal open={modalOpen} onOpenChange={handleModalClose} onSuccess={loadOrders} order={selectedOrder} />
    </div>
  );
}
