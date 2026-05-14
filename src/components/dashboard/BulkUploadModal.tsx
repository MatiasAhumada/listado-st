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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BulkUploadModal({ open, onOpenChange, onSuccess }: BulkUploadModalProps) {
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState<ProductoProcesado[]>([]);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<string>("MODULO");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArchivo(file);

    try {
      const productosProcesados = await procesarExcelFile(file, selectedType);
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
            className="bg-charcoal hover:bg-charcoal/80 text-lavender border border-lavender/20 h-11 px-6 font-semibold shadow-md transition-all"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            className="bg-lime hover:bg-green text-dark shadow-lg h-11 px-6 font-bold tracking-wide transition-all hover:scale-[1.02]"
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
          <div className="flex items-center gap-3 p-4 bg-lime/10 border border-lime/30 rounded-lg">
            <FileSpreadsheet className="text-lime" size={24} />
            <div className="flex-1">
              <h4 className="font-semibold text-lavender">Formato del archivo</h4>
              <p className="text-sm text-lavender/70">
                Archivo Excel (.xlsx) con productos y precios. Primera columna: descripción, Segunda columna: precio
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-lavender font-semibold">Tipo de Producto</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full bg-charcoal border-lavender/20 text-lavender focus:ring-lime h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MODULO">Módulos</SelectItem>
                <SelectItem value="BATERIA">Baterías</SelectItem>
                <SelectItem value="PIN">Pines</SelectItem>
                <SelectItem value="CONSOLA">Consolas</SelectItem>
                <SelectItem value="MANTENIMIENTO">Mantenimiento</SelectItem>
                <SelectItem value="VIDRIOS_CAMARA">Vidrios de Cámara</SelectItem>
                <SelectItem value="VARIOS">Varios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-lavender font-semibold">Seleccionar Archivo</Label>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="flex-1 bg-charcoal border-lavender/20 text-lavender focus-visible:ring-lime h-11"
              />
              <Upload className="text-lavender/60" size={20} />
            </div>
            {archivo && (
              <p className="text-sm text-lavender/60">
                Archivo: <span className="font-semibold text-lavender">{archivo.name}</span>
              </p>
            )}
          </div>

          {productos.length > 0 && (
            <div className="space-y-2">
              <Label className="text-lavender font-semibold">Vista Previa ({productos.length} productos)</Label>
              <div className="max-h-64 overflow-y-auto border border-lavender/20 rounded-lg p-3 bg-charcoal">
                {productos.slice(0, 10).map((prod, idx) => (
                  <div key={idx} className="flex justify-between py-2 border-b border-lavender/10 last:border-0">
                    <span className="text-sm font-medium text-lavender">{prod.name}</span>
                    <span className="text-sm font-bold text-lime">${formatNumber(prod.costTech)}</span>
                  </div>
                ))}
                {productos.length > 10 && (
                  <p className="text-xs text-lavender/60 text-center mt-2">
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
