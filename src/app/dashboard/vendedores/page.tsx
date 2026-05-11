"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VendedorModal } from "@/components/vendedores/VendedorModal";
import { getVendedores, deleteVendedor } from "@/services/vendedor.service";
import { getBranches } from "@/services/branch.service";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { motion } from "framer-motion";

interface Vendedor {
  id: string;
  username: string;
  branch?: {
    id: string;
    name: string;
  };
}

interface Branch {
  id: string;
  name: string;
}

export default function VendedoresPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVendedor, setSelectedVendedor] = useState<Vendedor | undefined>();

  const loadData = async () => {
    try {
      setLoading(true);
      const [vendedoresData, branchesData] = await Promise.all([
        getVendedores(),
        getBranches(),
      ]);
      setVendedores(vendedoresData);
      setBranches(branchesData);
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este vendedor?")) return;

    try {
      await deleteVendedor(id);
      clientSuccessHandler("Vendedor eliminado correctamente");
      loadData();
    } catch (error) {
      clientErrorHandler(error);
    }
  };

  const handleEdit = (vendedor: Vendedor) => {
    setSelectedVendedor(vendedor);
    setModalOpen(true);
  };

  const handleCreate = () => {
    if (branches.length === 0) {
      return clientErrorHandler("Debe crear al menos una sucursal antes de agregar vendedores");
    }
    setSelectedVendedor(undefined);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedVendedor(undefined);
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
            <h1 className="text-4xl font-black text-lavender">Vendedores</h1>
            <p className="text-lavender/60 text-lg mt-1">Gestión de vendedores de la empresa</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-lime hover:bg-green text-dark font-bold px-6 py-6 text-lg shadow-lg"
          >
            <Plus className="mr-2" size={24} />
            Nuevo Vendedor
          </Button>
        </div>

        <Card className="bg-dark/80 backdrop-blur-sm border border-lavender/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-lavender/10">
                  <th className="text-left p-4 text-lavender font-bold">Usuario</th>
                  <th className="text-left p-4 text-lavender font-bold">Sucursal</th>
                  <th className="text-left p-4 text-lavender font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center p-8 text-lavender/60 font-semibold">
                      Cargando...
                    </td>
                  </tr>
                ) : vendedores.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center p-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-lime/20 flex items-center justify-center">
                          <Users size={32} className="text-lime" />
                        </div>
                        <p className="text-lavender font-semibold text-lg">No hay vendedores</p>
                        <p className="text-lavender/60">Crea tu primer vendedor para comenzar</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  vendedores.map((vendedor) => (
                    <tr key={vendedor.id} className="border-b border-lavender/10 hover:bg-lavender/5 transition-all">
                      <td className="p-4 text-lavender font-bold">{vendedor.username}</td>
                      <td className="p-4">
                        {vendedor.branch ? (
                          <Badge className="bg-lime/20 text-lime border-lime/30">
                            {vendedor.branch.name}
                          </Badge>
                        ) : (
                          <span className="text-lavender/40">Sin sucursal</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(vendedor)}
                            className="text-lime hover:text-green hover:bg-lime/20 transition-all"
                          >
                            <Edit size={18} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(vendedor.id)}
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/20 transition-all"
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
      </motion.div>

      <VendedorModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        onSuccess={loadData}
        branches={branches}
        vendedor={selectedVendedor}
      />
    </div>
  );
}
