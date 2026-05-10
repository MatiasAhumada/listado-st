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
        render: (item: any) => item.quality || <span className="text-hunter-green-400 font-bold">-</span>,
      },
      {
        key: "available",
        label: "Estado",
        render: (item: any) => (
          <Badge
            className={
              item.available 
                ? "bg-gradient-to-r from-sage-green-500 to-sage-green-600 text-white shadow-md" 
                : "bg-gradient-to-r from-blushed-brick-500 to-blushed-brick-600 text-white shadow-md"
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
          <span className="font-bold text-hunter-green-700">${formatNumber(item.costTech || 0)}</span>
        ),
      });
      baseCols.push({
        key: "cost",
        label: "Costo Cliente",
        render: (item: any) => <span className="font-bold text-sage-green-700">${formatNumber(item.cost || 0)}</span>,
      });
    }

    if (isEmpresa) {
      baseCols.push({
        key: "cost",
        label: "Costo",
        render: (item: any) => <span className="font-bold text-hunter-green-700">${formatNumber(item.cost)}</span>,
      });
      baseCols.push({
        key: "cash",
        label: "Efectivo",
        render: (item: any) => <span className="font-bold text-yellow-green-700">${formatNumber(item.cash)}</span>,
      });
      baseCols.push({
        key: "credit",
        label: "Tarjeta",
        render: (item: any) => <span className="font-bold text-blushed-brick-600">${formatNumber(item.credit)}</span>,
      });
    }

    if (!isTecnico && !isEmpresa) {
      baseCols.push({
        key: "cash",
        label: "Efectivo",
        render: (item: any) => <span className="font-bold text-yellow-green-700">${formatNumber(item.cash || 0)}</span>,
      });
      baseCols.push({
        key: "credit",
        label: "Tarjeta",
        render: (item: any) => <span className="font-bold text-blushed-brick-600">${formatNumber(item.credit || 0)}</span>,
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
              className="hover:bg-yellow-green-100 hover:text-yellow-green-800 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setProductToEdit(item);
                setModalOpen(true);
              }}
            >
              <Edit size={16} className="text-yellow-green-600" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-blushed-brick-100 hover:text-blushed-brick-800 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setProductToDelete(item);
                setDeleteModalOpen(true);
              }}
            >
              <Trash size={16} className="text-blushed-brick-600" />
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
              className="hover:bg-yellow-green-100 hover:text-yellow-green-800 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setProductToEdit(item);
                setModalOpen(true);
              }}
            >
              <Edit size={16} className="text-yellow-green-600" />
            </Button>
          </div>
        ),
      });
    }

    return baseCols;
  }, [isEmpresa, isTecnico]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-vanilla-cream-800 via-vanilla-cream-700 to-vanilla-cream-600 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-black text-hunter-green-700 mb-2">Inventario Activo</h1>
          <p className="text-hunter-green-500 text-lg">{isEmpresa ? "Vista administrador global" : "Catálogo disponible para venta"}</p>
        </div>

        <div className="bg-white shadow-2xl rounded-2xl p-6 border-2 border-yellow-green-400">
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
                  <SelectTrigger className="w-full sm:w-[150px] bg-white border-2 border-hunter-green-300 hover:border-yellow-green-500 transition-all">
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
                  <SelectTrigger className="w-full sm:w-[160px] bg-white border-2 border-hunter-green-300 hover:border-yellow-green-500 transition-all">
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
                      className="gap-2 bg-gradient-to-r from-yellow-green-500 to-yellow-green-600 hover:from-yellow-green-400 hover:to-yellow-green-500 shadow-lg shadow-yellow-green-500/40 transition-all font-bold text-hunter-green-900 rounded-xl px-6"
                    >
                      <Plus size={18} />
                      Nuevo
                    </Button>
                    {isTecnico && (
                      <Button
                        onClick={() => setBulkUploadOpen(true)}
                        className="gap-2 bg-gradient-to-r from-sage-green-500 to-sage-green-600 hover:from-sage-green-400 hover:to-sage-green-500 shadow-lg shadow-sage-green-500/40 transition-all font-bold text-white rounded-xl px-6"
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
      </div>

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
                  className="hover:bg-hunter-green-100 text-hunter-green-700 h-11 px-6 font-semibold border-2 border-hunter-green-300"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="bg-gradient-to-r from-blushed-brick-500 to-blushed-brick-600 hover:from-blushed-brick-400 hover:to-blushed-brick-500 text-white shadow-lg shadow-blushed-brick-500/40 h-11 px-6 font-bold tracking-wide transition-all hover:scale-105"
                  onClick={handleDelete}
                >
                  Eliminar Producto
                </Button>
              </>
            }
          >
            <div className="p-4 bg-blushed-brick-50 rounded-xl border-2 border-blushed-brick-300 flex flex-col gap-2 mt-2">
              <span className="text-blushed-brick-700 font-semibold">¿Seguro que deseas borrar el siguiente producto?</span>
              <span className="text-hunter-green-800 font-black text-lg">{productToDelete?.name}</span>
              <span className="text-hunter-green-600 text-sm">
                {productToDelete?.type} - {productToDelete?.quality || "Ninguna"}
              </span>
            </div>
          </GenericModal>
        </>
      )}
    </div>
  );
}
