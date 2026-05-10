"use client";

import { useState, useEffect } from "react";
import { GenericModal } from "@/components/common/GenericModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { createServiceOrder, updateServiceOrder, CreateServiceOrderDTO, UpdateServiceOrderDTO } from "@/services/serviceOrder.service";
import { ServiceOrderStatus } from "@prisma/client";
import { SERVICE_ORDER_STATUS_LABELS } from "@/constants/serviceOrder.constant";

interface ServiceOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  order?: {
    id: string;
    clientName: string;
    clientPhone: string;
    deviceModel: string;
    deviceIssue: string;
    estimatedCost: number;
    finalCost?: number;
    status: ServiceOrderStatus;
    notes?: string;
  };
}

export function ServiceOrderModal({ open, onOpenChange, onSuccess, order }: ServiceOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    deviceModel: "",
    deviceIssue: "",
    estimatedCost: 0,
    finalCost: 0,
    status: ServiceOrderStatus.RECEPCIONADO,
    notes: "",
  });

  useEffect(() => {
    if (order) {
      setFormData({
        clientName: order.clientName,
        clientPhone: order.clientPhone,
        deviceModel: order.deviceModel,
        deviceIssue: order.deviceIssue,
        estimatedCost: order.estimatedCost,
        finalCost: order.finalCost || 0,
        status: order.status,
        notes: order.notes || "",
      });
    } else {
      setFormData({
        clientName: "",
        clientPhone: "",
        deviceModel: "",
        deviceIssue: "",
        estimatedCost: 0,
        finalCost: 0,
        status: ServiceOrderStatus.RECEPCIONADO,
        notes: "",
      });
    }
  }, [order, open]);

  const handleSubmit = async () => {
    if (!formData.clientName || !formData.clientPhone || !formData.deviceModel || !formData.deviceIssue) {
      return clientErrorHandler("Complete todos los campos obligatorios");
    }

    setLoading(true);

    try {
      if (order) {
        const updateData: UpdateServiceOrderDTO = {
          clientName: formData.clientName,
          clientPhone: formData.clientPhone,
          deviceModel: formData.deviceModel,
          deviceIssue: formData.deviceIssue,
          estimatedCost: formData.estimatedCost,
          finalCost: formData.finalCost || undefined,
          status: formData.status,
          notes: formData.notes || undefined,
        };
        await updateServiceOrder(order.id, updateData);
        clientSuccessHandler("Orden actualizada correctamente");
      } else {
        const createData: CreateServiceOrderDTO = {
          clientName: formData.clientName,
          clientPhone: formData.clientPhone,
          deviceModel: formData.deviceModel,
          deviceIssue: formData.deviceIssue,
          estimatedCost: formData.estimatedCost,
          notes: formData.notes || undefined,
        };
        await createServiceOrder(createData);
        clientSuccessHandler("Orden creada correctamente");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={order ? "Editar Orden de Servicio" : "Nueva Orden de Servicio"}
      description={order ? "Modifica los datos de la orden" : "Completa los datos del servicio técnico"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Guardando..." : order ? "Actualizar" : "Crear"}
          </Button>
        </>
      }
    >
      <div className="space-y-4 p-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Input
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="Nombre del cliente"
            />
          </div>

          <div className="space-y-2">
            <Label>Teléfono *</Label>
            <Input
              value={formData.clientPhone}
              onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
              placeholder="Teléfono de contacto"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Modelo del Dispositivo *</Label>
          <Input
            value={formData.deviceModel}
            onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
            placeholder="Ej: iPhone 13 Pro"
          />
        </div>

        <div className="space-y-2">
          <Label>Problema Reportado *</Label>
          <Input
            value={formData.deviceIssue}
            onChange={(e) => setFormData({ ...formData, deviceIssue: e.target.value })}
            placeholder="Descripción del problema"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Costo Estimado</Label>
            <Input
              type="number"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>

          {order && (
            <div className="space-y-2">
              <Label>Costo Final</Label>
              <Input
                type="number"
                value={formData.finalCost}
                onChange={(e) => setFormData({ ...formData, finalCost: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          )}
        </div>

        {order && (
          <div className="space-y-2">
            <Label>Estado</Label>
            <select
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ServiceOrderStatus })}
            >
              {Object.entries(SERVICE_ORDER_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Notas</Label>
          <textarea
            className="w-full min-h-20 px-3 py-2 rounded-md border border-input bg-background"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notas adicionales..."
          />
        </div>
      </div>
    </GenericModal>
  );
}
