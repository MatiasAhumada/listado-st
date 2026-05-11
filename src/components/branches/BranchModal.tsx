"use client";

import { useState, useEffect } from "react";
import { GenericModal } from "@/components/common/GenericModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { createBranch, updateBranch, CreateBranchDTO, UpdateBranchDTO } from "@/services/branch.service";

interface BranchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  branch?: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
  };
}

export function BranchModal({ open, onOpenChange, onSuccess, branch }: BranchModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name,
        address: branch.address || "",
        phone: branch.phone || "",
      });
    } else {
      setFormData({
        name: "",
        address: "",
        phone: "",
      });
    }
  }, [branch, open]);

  const handleSubmit = async () => {
    if (!formData.name) {
      return clientErrorHandler("El nombre es obligatorio");
    }

    setLoading(true);

    try {
      if (branch) {
        const updateData: UpdateBranchDTO = {
          name: formData.name,
          address: formData.address || undefined,
          phone: formData.phone || undefined,
        };
        await updateBranch(branch.id, updateData);
        clientSuccessHandler("Sucursal actualizada correctamente");
      } else {
        const createData: CreateBranchDTO = {
          name: formData.name,
          address: formData.address || undefined,
          phone: formData.phone || undefined,
        };
        await createBranch(createData);
        clientSuccessHandler("Sucursal creada correctamente");
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
      title={branch ? "Editar Sucursal" : "Nueva Sucursal"}
      description={branch ? "Modifica los datos de la sucursal" : "Completa los datos de la nueva sucursal"}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-lime hover:bg-green text-dark">
            {loading ? "Guardando..." : branch ? "Actualizar" : "Crear"}
          </Button>
        </>
      }
    >
      <div className="space-y-4 p-6">
        <div className="space-y-2">
          <Label className="text-white">Nombre *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nombre de la sucursal"
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Dirección</Label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Dirección de la sucursal"
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Teléfono</Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Teléfono de contacto"
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
      </div>
    </GenericModal>
  );
}
