"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { EmpresaModal } from "@/components/empresas/EmpresaModal";
import { ConfirmModal } from "@/components/common/GenericModal";
import { getEmpresas, deleteEmpresa } from "@/services/empresa.service";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { EMPRESA_MESSAGES } from "@/constants/empresa.constant";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import { motion } from "framer-motion";

interface Empresa {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  _count: {
    vendedores: number;
    branches: number;
    companyServiceOrders: number;
  };
}

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | undefined>();
  const [empresaToDelete, setEmpresaToDelete] = useState<Empresa | undefined>();
  const [deleting, setDeleting] = useState(false);

  const loadEmpresas = async () => {
    try {
      setLoading(true);
      const data = await getEmpresas();
      setEmpresas(data);
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmpresas();
  }, []);

  const handleDelete = async () => {
    if (!empresaToDelete) return;
    setDeleting(true);
    try {
      await deleteEmpresa(empresaToDelete.id);
      clientSuccessHandler(EMPRESA_MESSAGES.DELETED);
      loadEmpresas();
      setConfirmOpen(false);
      setEmpresaToDelete(undefined);
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedEmpresa(undefined);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedEmpresa(undefined);
  };

  const columns = [
    {
      key: "username",
      label: "Empresa",
      render: (item: Empresa) => <span className="text-lavender font-bold">{item.username}</span>,
    },
    {
      key: "branches",
      label: "Sucursales",
      render: (item: Empresa) => <Badge className="bg-lime/20 text-lime border-lime/30">{item._count.branches}</Badge>,
    },
    {
      key: "vendedores",
      label: "Vendedores",
      render: (item: Empresa) => (
        <Badge className="bg-lavender/20 text-lavender border-lavender/30">{item._count.vendedores}</Badge>
      ),
    },
    {
      key: "orders",
      label: "Órdenes",
      render: (item: Empresa) => (
        <span className="text-lavender/80 font-semibold">{item._count.companyServiceOrders}</span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (item: Empresa) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(item)}
            className="text-lime hover:text-green hover:bg-lime/20 transition-all"
          >
            <Edit size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEmpresaToDelete(item);
              setConfirmOpen(true);
            }}
            className="text-destructive hover:text-destructive/80 hover:bg-destructive/20 transition-all"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-charcoal p-4 sm:p-6 md:p-8 overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl mx-auto"
      >
        <DataTable
          title="Empresas"
          subtitle="Gestión de empresas clientes"
          data={empresas}
          columns={columns}
          keyExtractor={(item: Empresa) => item.id}
          loading={loading}
          emptyMessage="No hay empresas registradas"
          emptyIcon={<Building2 size={32} className="text-lime" />}
          actions={
            <Button onClick={handleCreate} className="bg-lime hover:bg-green text-dark font-bold px-6 py-3 shadow-lg">
              <Plus className="mr-2" size={20} />
              Nueva Empresa
            </Button>
          }
        />
      </motion.div>

      <EmpresaModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        onSuccess={loadEmpresas}
        empresa={selectedEmpresa}
      />

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar Empresa"
        description={`¿Seguro que querés eliminar "${empresaToDelete?.username}"? Se eliminarán todas sus sucursales, vendedores y órdenes.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
