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
        getVendedores().catch((error) => {
          if (error?.response?.status === 404) return [];
          throw error;
        }),
        getBranches().catch((error) => {
          if (error?.response?.status === 404) return [];
          throw error;
        }),
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
    <div className="min-h-screen bg-charcoal p-4 sm:p-6 md:p-8 overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl mx-auto space-y-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-lavender">Vendedores</h1>
            <p className="text-lavender/60 text-sm sm:text-base md:text-lg mt-1">Gestión de vendedores de la empresa</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-lime hover:bg-green text-dark font-bold px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg shadow-lg"
          >
            <Plus className="mr-2" size={20} />
            Nuevo Vendedor
          </Button>
        </div>

        <Card className="bg-dark/80 backdrop-blur-sm border border-lavender/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-lavender/10">
                  <th className="text-left p-2 sm:p-3 md:p-4 text-lavender font-bold text-xs sm:text-sm md:text-base whitespace-nowrap">
                    Usuario
                  </th>
                  <th className="text-left p-2 sm:p-3 md:p-4 text-lavender font-bold text-xs sm:text-sm md:text-base whitespace-nowrap">
                    Sucursal
                  </th>
                  <th className="text-left p-2 sm:p-3 md:p-4 text-lavender font-bold text-xs sm:text-sm md:text-base whitespace-nowrap">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center p-4 sm:p-6 md:p-8 text-lavender/60 font-semibold text-sm sm:text-base"
                    >
                      Cargando...
                    </td>
                  </tr>
                ) : vendedores.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center p-4 sm:p-6 md:p-8">
                      <div className="flex flex-col items-center gap-2 sm:gap-3">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-lime/20 flex items-center justify-center">
                          <Users size={24} className="text-lime sm:w-7 sm:h-7 md:w-8 md:h-8" />
                        </div>
                        <p className="text-lavender font-semibold text-sm sm:text-base md:text-lg">No hay vendedores</p>
                        <p className="text-lavender/60 text-xs sm:text-sm">Crea tu primer vendedor para comenzar</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  vendedores.map((vendedor) => (
                    <tr key={vendedor.id} className="border-b border-lavender/10 hover:bg-lavender/5 transition-all">
                      <td className="p-2 sm:p-3 md:p-4 text-lavender font-bold text-xs sm:text-sm md:text-base whitespace-nowrap">
                        {vendedor.username}
                      </td>
                      <td className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm md:text-base whitespace-nowrap">
                        {vendedor.branch ? (
                          <Badge className="bg-lime/20 text-lime border-lime/30 text-xs sm:text-sm">
                            {vendedor.branch.name}
                          </Badge>
                        ) : (
                          <span className="text-lavender/40">Sin sucursal</span>
                        )}
                      </td>
                      <td className="p-2 sm:p-3 md:p-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(vendedor)}
                            className="text-lime hover:text-green hover:bg-lime/20 transition-all"
                          >
                            <Edit size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(vendedor.id)}
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/20 transition-all"
                          >
                            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
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
