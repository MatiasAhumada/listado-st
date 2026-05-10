"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getProductos, deleteProducto } from "@/services/producto.service";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddProductModal } from "@/components/dashboard/AddProductModal";
import { BulkUploadModal } from "@/components/dashboard/BulkUploadModal";
import { GenericModal } from "@/components/common/GenericModal";
import { Plus, Edit, Trash, Upload } from "lucide-react";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { formatNumber } from "@/utils/formatters.util";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState("TODOS");
  const [selectedQuality, setSelectedQuality] = useState("TODAS");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const productos = await getProductos({
        type: selectedType !== "TODOS" ? selectedType : undefined,
        quality: selectedQuality !== "TODAS" ? selectedQuality : undefined,
        search: debouncedSearch || undefined,
      });
      setData(productos);
    } catch (error) {
      console.error(error);
      logout();
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, selectedType, selectedQuality]);

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProducto(productToDelete.id);
      clientSuccessHandler("Producto eliminado exitosamente");
      fetchData();
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      clientErrorHandler(error);
    }
  };

  const isEmpresa = user?.role === "EMPRESA";
  const isTecnico = user?.role === "TECNICO";

  const columns = useMemo(() => {
    const baseCols: { key: string; label: string; render?: (item: any) => any; className?: string }[] = [
      { key: "name", label: "Producto" },
      { key: "type", label: "Tipo" },
      {
        key: "quality",
        label: "Calidad",
        render: (item: any) => item.quality || <span className="text-lavender/40 font-bold">-</span>,
      },
      {
        key: "available",
        label: "Estado",
        render: (item: any) => (
          <Badge
            className={
              item.available 
                ? "bg-lime text-dark shadow-md" 
                : "bg-destructive text-white shadow-md"
            }
          >
            {item.available ? "Disponible" : "Sin Stock"}
          </Badge>
        ),
      },
    ];

    if (isTecnico) {
      baseCols.push({
        key: "costTech",
        label: "Costo Repuesto",
        render: (item: any) => (
          <span className="font-bold text-lavender">${formatNumber(item.costTech || 0)}</span>
        ),
      });
      baseCols.push({
        key: "cost",
        label: "Costo Cliente",
        render: (item: any) => <span className="font-bold text-lime">${formatNumber(item.cost || 0)}</span>,
      });
    }

    if (isEmpresa) {
      baseCols.push({
        key: "cost",
        label: "Costo",
        render: (item: any) => <span className="font-bold text-lavender">${formatNumber(item.cost)}</span>,
      });
      baseCols.push({
        key: "cash",
        label: "Efectivo",
        render: (item: any) => <span className="font-bold text-lime">${formatNumber(item.cash)}</span>,
      });
      baseCols.push({
        key: "credit",
        label: "Tarjeta",
        render: (item: any) => <span className="font-bold text-green">${formatNumber(item.credit)}</span>,
      });
    }

    if (!isTecnico && !isEmpresa) {
      baseCols.push({
        key: "cash",
        label: "Efectivo",
        render: (item: any) => <span className="font-bold text-lime">${formatNumber(item.cash || 0)}</span>,
      });
      baseCols.push({
        key: "credit",
        label: "Tarjeta",
        render: (item: any) => <span className="font-bold text-green">${formatNumber(item.credit || 0)}</span>,
      });
    }

    if (isTecnico) {
      baseCols.push({
        key: "actions",
        label: "Acciones",
        className: "text-center",
        render: (item: any) => (
          <div className="flex gap-2 justify-center">
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-lime/20 hover:text-lime transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setProductToEdit(item);
                setModalOpen(true);
              }}
            >
              <Edit size={16} className="text-lime" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-destructive/20 hover:text-destructive transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setProductToDelete(item);
                setDeleteModalOpen(true);
              }}
            >
              <Trash size={16} className="text-destructive" />
            </Button>
          </div>
        ),
      });
    }

    if (isEmpresa) {
      baseCols.push({
        key: "actions",
        label: "Acciones",
        className: "text-center",
        render: (item: any) => (
          <div className="flex gap-2 justify-center">
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-lime/20 hover:text-lime transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setProductToEdit(item);
                setModalOpen(true);
              }}
            >
              <Edit size={16} className="text-lime" />
            </Button>
          </div>
        ),
      });
    }

    return baseCols;
  }, [isEmpresa, isTecnico]);

  return (
    <div className="min-h-screen bg-charcoal p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-6">
          <h1 className="text-4xl font-black text-lavender mb-2">Inventario Activo</h1>
          <p className="text-lavender/60 text-lg">{isEmpresa ? "Vista administrador global" : "Catálogo disponible para venta"}</p>
        </div>

        <div className="bg-dark/80 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-lavender/10">
          <DataTable
            title=""
            subtitle=""
            data={data}
            columns={columns}
            keyExtractor={(item: any) => item.id}
            loading={loading}
            searchPlaceholder="Buscar por nombre..."
            onSearch={setSearchTerm}
            totalLabel={`Resultados: ${data.length}`}
            actions={
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-[150px] bg-charcoal border-lavender/20 text-lavender hover:border-lime transition-all">
                    <SelectValue placeholder="Filtrar Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos los Tipos</SelectItem>
                    <SelectItem value="MODULO">Módulos</SelectItem>
                    <SelectItem value="BATERIA">Baterías</SelectItem>
                    <SelectItem value="PIN">Pines</SelectItem>
                    <SelectItem value="VARIOS">Varios</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                  <SelectTrigger className="w-full sm:w-[160px] bg-charcoal border-lavender/20 text-lavender hover:border-lime transition-all">
                    <SelectValue placeholder="Filtrar Calidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODAS">Todas las Calidades</SelectItem>
                    <SelectItem value="INCELL">Incell</SelectItem>
                    <SelectItem value="OLED">OLED</SelectItem>
                    <SelectItem value="ORIGINAL">Original</SelectItem>
                    <SelectItem value="SERVICEPACK">Service Pack</SelectItem>
                    <SelectItem value="REMANOFACTURADO">Remanufacturado</SelectItem>
                    <SelectItem value="NINGUNA">Ninguna</SelectItem>
                  </SelectContent>
                </Select>

                {(isEmpresa || isTecnico) && (
                  <>
                    <Button
                      onClick={() => {
                        setProductToEdit(null);
                        setModalOpen(true);
                      }}
                      className="gap-2 bg-lime hover:bg-green text-dark shadow-lg transition-all font-bold rounded-xl px-6"
                    >
                      <Plus size={18} />
                      Nuevo
                    </Button>
                    {isTecnico && (
                      <Button
                        onClick={() => setBulkUploadOpen(true)}
                        className="gap-2 bg-green hover:bg-lime text-white shadow-lg transition-all font-bold rounded-xl px-6"
                      >
                        <Upload size={18} />
                        Carga Masiva
                      </Button>
                    )}
                  </>
                )}
              </div>
            }
          />
        </div>
      </motion.div>

      {(isEmpresa || isTecnico) && (
        <>
          <AddProductModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            onSuccess={fetchData}
            initialData={productToEdit}
            userRole={isTecnico ? "TECNICO" : "EMPRESA"}
          />
          {isTecnico && (
            <BulkUploadModal open={bulkUploadOpen} onOpenChange={setBulkUploadOpen} onSuccess={fetchData} />
          )}
          <GenericModal
            open={deleteModalOpen}
            onOpenChange={setDeleteModalOpen}
            title="Confirmar Eliminación"
            description="Esta acción es irreversible, el producto y todos sus datos se borrarán para siempre."
            footer={
              <>
                <Button
                  variant="ghost"
                  className="hover:bg-lavender/10 text-lavender h-11 px-6 font-semibold border border-lavender/20"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="bg-destructive hover:bg-destructive/90 text-white shadow-lg h-11 px-6 font-bold tracking-wide transition-all hover:scale-105"
                  onClick={handleDelete}
                >
                  Eliminar Producto
                </Button>
              </>
            }
          >
            <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20 flex flex-col gap-2 mt-2">
              <span className="text-lavender font-semibold">¿Seguro que deseas borrar el siguiente producto?</span>
              <span className="text-lavender font-black text-lg">{productToDelete?.name}</span>
              <span className="text-lavender/60 text-sm">
                {productToDelete?.type} - {productToDelete?.quality || "Ninguna"}
              </span>
            </div>
          </GenericModal>
        </>
      )}
    </div>
  );
}
