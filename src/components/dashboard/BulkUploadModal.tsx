"use client";

import { useState } from "react";
import { GenericModal } from "@/components/common/GenericModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { procesarExcelFile, ProductoProcesado } from "@/utils/excelParser.util";
import { formatNumber } from "@/utils/formatters.util";
import { bulkCreateOrUpdateProductos } from "@/services/producto.service";
import { Upload, FileSpreadsheet } from "lucide-react";

interface BulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BulkUploadModal({ open, onOpenChange, onSuccess }: BulkUploadModalProps) {
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState<ProductoProcesado[]>([]);
  const [archivo, setArchivo] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArchivo(file);

    try {
      const productosProcesados = await procesarExcelFile(file);
      setProductos(productosProcesados);
      clientSuccessHandler(`${productosProcesados.length} productos detectados`);
    } catch (error) {
      clientErrorHandler("Error al procesar el archivo");
      setProductos([]);
    }
  };

  const handleUpload = async () => {
    if (productos.length === 0) {
      return clientErrorHandler("No hay productos para cargar");
    }

    setLoading(true);

    try {
      const resultados = await bulkCreateOrUpdateProductos(productos);
      
      clientSuccessHandler(
        `Carga completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`
      );
      
      onSuccess();
      onOpenChange(false);
      setProductos([]);
      setArchivo(null);
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
      title="Carga Masiva de Productos"
      description="Sube un archivo de texto con el formato de productos para cargar masivamente"
      size="lg"
      footer={
        <>
          <Button
            variant="ghost"
            className="hover:bg-skybase-900 text-deepspace-500 h-11 px-6 font-semibold"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            className="bg-gradient-to-r from-bluegreen-500 to-bluegreen-600 hover:from-bluegreen-400 hover:to-bluegreen-500 text-white shadow-lg shadow-bluegreen-500/30 h-11 px-6 font-bold tracking-wide transition-all hover:scale-[1.02]"
            onClick={handleUpload}
            disabled={loading || productos.length === 0}
          >
            {loading ? "Cargando..." : `Cargar ${productos.length} Productos`}
          </Button>
        </>
      }
    >
      <div className="space-y-6 p-1">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <FileSpreadsheet className="text-blue-600" size={24} />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900">Formato del archivo</h4>
              <p className="text-sm text-blue-700">
                Archivo Excel (.xlsx) con productos y precios. Primera columna: descripción, Segunda columna: precio
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-deepspace-500 font-semibold">Seleccionar Archivo</Label>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="flex-1 bg-skybase-900/30 border-skybase-700/50 focus-visible:ring-bluegreen-500 h-11"
              />
              <Upload className="text-skybase-400" size={20} />
            </div>
            {archivo && (
              <p className="text-sm text-skybase-300">
                Archivo: <span className="font-semibold text-deepspace-500">{archivo.name}</span>
              </p>
            )}
          </div>

          {productos.length > 0 && (
            <div className="space-y-2">
              <Label className="text-deepspace-500 font-semibold">
                Vista Previa ({productos.length} productos)
              </Label>
              <div className="max-h-64 overflow-y-auto border border-skybase-700/50 rounded-lg p-3 bg-skybase-900/20">
                {productos.slice(0, 10).map((prod, idx) => (
                  <div key={idx} className="flex justify-between py-2 border-b border-skybase-800/30 last:border-0">
                    <span className="text-sm font-medium text-deepspace-500">{prod.name}</span>
                    <span className="text-sm font-bold text-bluegreen-500">${formatNumber(prod.costTech)}</span>
                  </div>
                ))}
                {productos.length > 10 && (
                  <p className="text-xs text-skybase-300 text-center mt-2">
                    ... y {productos.length - 10} productos más
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </GenericModal>
  );
}
