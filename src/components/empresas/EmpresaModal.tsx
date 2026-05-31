"use client";

import { useState, useEffect } from "react";
import { GenericModal } from "@/components/common/GenericModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { createEmpresa, updateEmpresa, CreateEmpresaDTO, UpdateEmpresaDTO } from "@/services/empresa.service";
import { EMPRESA_MESSAGES } from "@/constants/empresa.constant";

interface EmpresaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  empresa?: {
    id: string;
    username: string;
  };
}

export function EmpresaModal({ open, onOpenChange, onSuccess, empresa }: EmpresaModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });

  useEffect(() => {
    if (empresa) {
      setFormData({ username: empresa.username, password: "" });
    } else {
      setFormData({ username: "", password: "" });
    }
  }, [empresa, open]);

  const handleSubmit = async () => {
    if (!formData.username) {
      return clientErrorHandler("El nombre de usuario es obligatorio");
    }

    if (!empresa && !formData.password) {
      return clientErrorHandler("La contraseña es obligatoria");
    }

    setLoading(true);

    try {
      if (empresa) {
        const updateData: UpdateEmpresaDTO = { username: formData.username };
        if (formData.password) updateData.password = formData.password;
        await updateEmpresa(empresa.id, updateData);
        clientSuccessHandler(EMPRESA_MESSAGES.UPDATED);
      } else {
        const createData: CreateEmpresaDTO = {
          username: formData.username,
          password: formData.password,
        };
        await createEmpresa(createData);
        clientSuccessHandler(EMPRESA_MESSAGES.CREATED);
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
      title={empresa ? "Editar Empresa" : "Nueva Empresa"}
      description={empresa ? "Modificá los datos de la empresa" : "Completá los datos de la nueva empresa"}
      size="sm"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="hover:bg-lavender/10 text-lavender border border-lavender/20"
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-lime hover:bg-green text-dark font-bold">
            {loading ? "Guardando..." : empresa ? "Actualizar" : "Crear"}
          </Button>
        </>
      }
    >
      <div className="space-y-4 p-4 sm:p-6">
        <div className="space-y-2">
          <Label className="text-lavender font-semibold">Usuario *</Label>
          <Input
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Nombre de usuario de la empresa"
            className="bg-charcoal border-lavender/20 text-lavender placeholder:text-lavender/50"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-lavender font-semibold">
            {empresa ? "Nueva Contraseña (opcional)" : "Contraseña *"}
          </Label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={empresa ? "Dejar vacío para mantener la actual" : "Contraseña"}
            className="bg-charcoal border-lavender/20 text-lavender placeholder:text-lavender/50"
          />
        </div>
      </div>
    </GenericModal>
  );
}
