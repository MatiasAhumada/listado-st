"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getProductos, deleteProducto } from "@/services/producto.service";
import { logoutUsuario } from "@/services/auth.service";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddProductModal } from "@/components/dashboard/AddProductModal";
import { GenericModal } from "@/components/common/GenericModal";
import { LogOut, Plus, Edit, Trash } from "lucide-react";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState("TODOS");
  const [selectedQuality, setSelectedQuality] = useState("TODAS");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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
    if (!isHydrated) return;
    if (!user) {
      router.push("/");
      return;
    }
    fetchData();
  }, [user, isHydrated, router, debouncedSearch, selectedType, selectedQuality]);

  const handleLogout = async () => {
    await logoutUsuario();
    logout();
    router.push("/");
  };

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

  const columns = useMemo(() => {
    const baseCols: { key: string; label: string; render?: (item: any) => any; className?: string }[] = [
      { key: "name", label: "Producto" },
      { key: "type", label: "Tipo" },
      { 
        key: "quality", 
        label: "Calidad",
        render: (item: any) => item.quality || <span className="text-skybase-200 font-bold">-</span>
      },
      {
        key: "available",
        label: "Estado",
        render: (item: any) => (
          <Badge className={item.available ? "bg-bluegreen-500 hover:bg-bluegreen-600" : "bg-princeton-500 hover:bg-princeton-600"}>
            {item.available ? "Disponible" : "Sin Stock"}
          </Badge>
        )
      },
    ];

    if (isEmpresa) {
      baseCols.push({
        key: "cost",
        label: "Costo",
        render: (item: any) => <span className="font-semibold text-deepspace-500">${Number(item.cost).toFixed(2)}</span>
      });
    }

    baseCols.push({
      key: "cash",
      label: "Efectivo",
      render: (item: any) => <span className="font-bold text-bluegreen-500">${Number(item.cash).toFixed(2)}</span>
    });

    baseCols.push({
      key: "credit",
      label: "Tarjeta",
      render: (item: any) => <span className="font-bold text-amber-500">${Number(item.credit).toFixed(2)}</span>
    });

    if (isEmpresa) {
      baseCols.push({
        key: "actions",
        label: "Acciones",
        className: "text-center",
        render: (item: any) => (
          <div className="flex gap-2 justify-center">
            <Button size="icon" variant="ghost" className="hover:bg-bluegreen-100/50 hover:text-bluegreen-600" onClick={(e) => { e.stopPropagation(); setProductToEdit(item); setModalOpen(true); }}>
              <Edit size={16} className="text-bluegreen-500" />
            </Button>
            <Button size="icon" variant="ghost" className="hover:bg-red-50 hover:text-red-600" onClick={(e) => { e.stopPropagation(); setProductToDelete(item); setDeleteModalOpen(true); }}>
              <Trash size={16} className="text-red-500" />
            </Button>
          </div>
        )
      });
    }

    return baseCols;
  }, [isEmpresa]);

  if (!isHydrated || !user) return null;

  return (
    <div className="min-h-screen bg-skybase-900 relative overflow-hidden">
      {/* Decorative background for Dashboard */}
      <div className="absolute top-0 w-full h-80 bg-gradient-to-r from-deepspace-500 via-deepspace-400 to-deepspace-300 rounded-b-[4rem] shadow-xl z-0 pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="relative z-10 mx-auto max-w-7xl pt-6 px-4">
        <div className="bg-white/95 backdrop-blur-md shadow-lg border border-skybase-700/50 rounded-2xl h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-deepspace-500">
              Listado ST
            </h1>
            <Badge className="bg-amber-500 hover:bg-amber-400 uppercase text-deepspace-100 font-bold border-0 shadow-sm">
              {user.role}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-skybase-200 font-medium">Hola, <b className="text-deepspace-500 font-bold">{user.username}</b></span>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-skybase-200 hover:text-princeton-500 hover:bg-skybase-900 rounded-full transition-colors">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8 pb-32 max-w-7xl">
        <div className="bg-white shadow-xl rounded-2xl p-6 border border-skybase-800">
          <DataTable
            title="Inventario Activo"
            subtitle={isEmpresa ? "Vista administrador global" : "Catálogo disponible para venta"}
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
                  <SelectTrigger className="w-full sm:w-[150px] bg-white border-border"><SelectValue placeholder="Filtrar Tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos los Tipos</SelectItem>
                    <SelectItem value="MODULO">Módulos</SelectItem>
                    <SelectItem value="BATERIA">Baterías</SelectItem>
                    <SelectItem value="PIN">Pines</SelectItem>
                    <SelectItem value="VARIOS">Varios</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                  <SelectTrigger className="w-full sm:w-[160px] bg-white border-border"><SelectValue placeholder="Filtrar Calidad" /></SelectTrigger>
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

                {isEmpresa && (
                  <Button onClick={() => { setProductToEdit(null); setModalOpen(true); }} className="gap-2 bg-gradient-to-r from-bluegreen-500 to-bluegreen-400 hover:shadow-lg hover:shadow-bluegreen-400/30 transition-all font-bold text-white rounded-xl px-4">
                    <Plus size={18} />
                    Nuevo
                  </Button>
                )}
              </div>
            }
          />
        </div>
      </main>

      {/* Modals */}
      {isEmpresa && (
        <>
          <AddProductModal 
            open={modalOpen} 
            onOpenChange={setModalOpen} 
            onSuccess={fetchData}
            initialData={productToEdit}
          />
          <GenericModal
            open={deleteModalOpen}
            onOpenChange={setDeleteModalOpen}
            title="Confirmar Eliminación"
            description="Esta acción es irreversible, el producto y todos sus datos se borrarán para siempre."
            footer={
              <>
                <Button variant="ghost" className="hover:bg-skybase-900 text-deepspace-500 h-11 px-6 font-semibold" onClick={() => setDeleteModalOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 h-11 px-6 font-bold tracking-wide transition-all hover:scale-[1.02]" onClick={handleDelete}>
                  Eliminar Producto
                </Button>
              </>
            }
          >
            <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 flex flex-col gap-2 mt-2">
              <span className="text-red-800 font-semibold">¿Seguro que deseas borrar el siguiente producto?</span>
              <span className="text-deepspace-500 font-black text-lg">{productToDelete?.name}</span>
              <span className="text-muted-foreground text-sm">{productToDelete?.type} - {productToDelete?.quality || "Ninguna"}</span>
            </div>
          </GenericModal>
        </>
      )}
    </div>
  );
}
