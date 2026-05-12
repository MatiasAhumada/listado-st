"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { ServiceOrderModal } from "@/components/service-orders/ServiceOrderModal";
import {
  getServiceOrders,
  deleteServiceOrder,
  updateServiceOrder,
  UpdateServiceOrderDTO,
} from "@/services/serviceOrder.service";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { SERVICE_ORDER_STATUS_LABELS, SERVICE_ORDER_STATUS_COLORS } from "@/constants/serviceOrder.constant";
import { formatNumber } from "@/utils/formatters.util";
import { Plus, Edit, Trash2, Eye, Printer } from "lucide-react";
import { ServiceOrderStatus, ProductType } from "@prisma/client";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ViewServiceOrderModal } from "@/components/service-orders/ViewServiceOrderModal";
import { ServiceOrderReceipt } from "@/components/service-orders/ServiceOrderReceipt";
import { WarrantyReceipt } from "@/components/service-orders/WarrantyReceipt";

interface ServiceOrder {
  id: string;
  clientName: string;
  clientPhone: string;
  advancePayment?: number;
  balance?: number;
  deliveryDate?: string;
  status: ServiceOrderStatus;
  receivedAt: string;
  branch?: {
    id: string;
    name: string;
  };
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
  seller?: {
    id: string;
    username: string;
  };
  client?: {
    fullName: string;
    dni: string;
    phone?: string;
    address?: string;
  };
}

export default function ServiceOrdersPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | undefined>();
  const [printOrder, setPrintOrder] = useState<ServiceOrder | null>(null);
  const [warrantyOrder, setWarrantyOrder] = useState<ServiceOrder | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth-token="))
      ?.split("=")[1];

    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserRole(payload.role);
    }
  }, []);

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

  const handleStatusChange = async (orderId: string, newStatus: ServiceOrderStatus) => {
    try {
      const updateData: UpdateServiceOrderDTO = {
        status: newStatus,
      };
      await updateServiceOrder(orderId, updateData);
      clientSuccessHandler("Estado actualizado correctamente");
      loadOrders();
    } catch (error) {
      clientErrorHandler(error);
    }
  };

  const handleEdit = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleView = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setViewModalOpen(true);
  };

  const handlePrint = (order: ServiceOrder) => {
    if (order.status === ServiceOrderStatus.ENTREGADO_A_CLIENTE || order.status === ServiceOrderStatus.COBRADO) {
      setWarrantyOrder(order);
    } else {
      setPrintOrder(order);
    }
  };

  const handleCreate = () => {
    setSelectedOrder(undefined);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedOrder(undefined);
  };

  const columns = useMemo(() => {
    const baseColumns = [
      {
        key: "clientName",
        label: "Cliente",
        render: (item: ServiceOrder) => <span className="text-lavender font-bold">{item.clientName}</span>,
      },
      {
        key: "clientPhone",
        label: "Teléfono",
        render: (item: ServiceOrder) => <span className="text-lavender/80">{item.clientPhone}</span>,
      },
    ];

    if (userRole === "EMPRESA") {
      baseColumns.push(
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
          key: "seller",
          label: "Vendedor",
          render: (item: ServiceOrder) =>
            item.seller ? (
              <span className="text-lavender/80">{item.seller.username}</span>
            ) : (
              <span className="text-lavender/40">-</span>
            ),
        }
      );
    }

    baseColumns.push(
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
          <Select
            value={item.status}
            onValueChange={(value) => handleStatusChange(item.id, value as ServiceOrderStatus)}
          >
            <SelectTrigger className="w-auto border-0 bg-transparent hover:bg-lavender/5 transition-colors p-0">
              <Badge
                className={`${SERVICE_ORDER_STATUS_COLORS[item.status]} cursor-pointer hover:opacity-80 transition-opacity`}
              >
                {SERVICE_ORDER_STATUS_LABELS[item.status]}
              </Badge>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SERVICE_ORDER_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  <Badge className={SERVICE_ORDER_STATUS_COLORS[value as ServiceOrderStatus]}>{label}</Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              onClick={() => handleView(item)}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/20 transition-all"
            >
              <Eye size={18} />
            </Button>
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
              onClick={() => handlePrint(item)}
              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/20 transition-all"
            >
              <Printer size={18} />
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
      }
    );

    return baseColumns;
  }, [userRole]);

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

      <ServiceOrderModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        onSuccess={loadOrders}
        order={selectedOrder}
      />

      {selectedOrder && (
        <ViewServiceOrderModal open={viewModalOpen} onOpenChange={setViewModalOpen} order={selectedOrder} />
      )}

      {printOrder && <ServiceOrderReceipt order={printOrder} onClose={() => setPrintOrder(null)} />}
      {warrantyOrder && <WarrantyReceipt order={warrantyOrder} onClose={() => setWarrantyOrder(null)} />}
    </div>
  );
}
