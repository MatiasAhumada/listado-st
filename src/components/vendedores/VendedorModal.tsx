"use client";

import { useState, useEffect } from "react";
import { GenericModal } from "@/components/common/GenericModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { createVendedor, updateVendedor, CreateVendedorDTO, UpdateVendedorDTO } from "@/services/vendedor.service";

interface VendedorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  branches: { id: string; name: string }[];
  vendedor?: {
    id: string;
    username: string;
    branch?: {
      id: string;
      name: string;
    };
  };
}

export function VendedorModal({ open, onOpenChange, onSuccess, branches, vendedor }: VendedorModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    branchId: "",
  });

  useEffect(() => {
    if (vendedor) {
      setFormData({
        username: vendedor.username,
        password: "",
        branchId: vendedor.branch?.id || "",
      });
    } else {
      setFormData({
        username: "",
        password: "",
        branchId: "",
      });
    }
  }, [vendedor, open]);

  const handleSubmit = async () => {
    if (!formData.username || !formData.branchId) {
      return clientErrorHandler("Complete todos los campos obligatorios");
    }

    if (!vendedor && !formData.password) {
      return clientErrorHandler("La contraseña es obligatoria");
    }

    setLoading(true);

    try {
      if (vendedor) {
        const updateData: UpdateVendedorDTO = {
          username: formData.username,
          branchId: formData.branchId,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await updateVendedor(vendedor.id, updateData);
        clientSuccessHandler("Vendedor actualizado correctamente");
      } else {
        const createData: CreateVendedorDTO = {
          username: formData.username,
          password: formData.password,
          branchId: formData.branchId,
        };
        await createVendedor(createData);
        clientSuccessHandler("Vendedor creado correctamente");
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
      title={vendedor ? "Editar Vendedor" : "Nuevo Vendedor"}
      description={vendedor ? "Modifica los datos del vendedor" : "Completa los datos del nuevo vendedor"}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading} className="bg-charcoal hover:bg-charcoal/80 text-lavender border border-lavender/20">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-lime hover:bg-green text-dark">
            {loading ? "Guardando..." : vendedor ? "Actualizar" : "Crear"}
          </Button>
        </>
      }
    >
      <div className="space-y-4 p-1">
        <div className="space-y-2">
          <Label>Usuario *</Label>
          <Input
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Nombre de usuario"
          />
        </div>

        <div className="space-y-2">
          <Label>{vendedor ? "Nueva Contraseña (opcional)" : "Contraseña *"}</Label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={vendedor ? "Dejar vacío para mantener actual" : "Contraseña"}
          />
        </div>

        <div className="space-y-2">
          <Label>Sucursal *</Label>
          <Select value={formData.branchId} onValueChange={(value) => setFormData({ ...formData, branchId: value })}>
            <SelectTrigger className="bg-charcoal border-lavender/20 text-lavender">
              <SelectValue placeholder="Seleccionar sucursal" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </GenericModal>
  );
}
