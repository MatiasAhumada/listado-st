"use client";

import { useState, useMemo, useEffect } from "react";
import { createProducto, updateProducto } from "@/services/producto.service";
import { GenericModal } from "@/components/common/GenericModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { CheckIcon } from "lucide-react";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any;
}

const PRODUCT_TYPES = ["MODULO", "BATERIA", "PIN", "VARIOS"];
const PRODUCT_QUALITIES = ["INCELL", "OLED", "ORIGINAL", "SERVICEPACK", "REMANOFACTURADO", "NINGUNA"];

const PERCENTAGES = Array.from({ length: 11 }, (_, i) => i * 10); // 0, 10, 20... 100

export function AddProductModal({ open, onOpenChange, onSuccess, initialData }: AddProductModalProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialData;
  const [form, setForm] = useState({
    name: "",
    type: "MODULO",
    quality: "INCELL",
    available: true,
  });

  const [pricing, setPricing] = useState({
    baseCost: 0,
    costMargin: 0,
    cashMargin: 0,
    creditMargin: 0,
  });

  useEffect(() => {
    if (open && initialData) {
      setForm({
        name: initialData.name || "",
        type: initialData.type || "MODULO",
        quality: initialData.quality || "NINGUNA",
        available: initialData.available !== undefined ? initialData.available : true,
      });

      // Simple reverse check mapping or direct injection for exact pricing margins if they aren't saved in schema. 
      // Note: we can't fully reverse calculate exact percentages if the user saved custom ones, but we initialize base and computed.
      // Since schema doesn't save baseCost, costMargin etc, we set baseCost to cost, and rest to 0 margins dynamically.
      const costMarginVal = 0;
      const baseCostVal = initialData.cost || 0;
      const cashVal = initialData.cash || 0;
      const creditVal = initialData.credit || 0;

      // Un cálculo simple asumiendo margen directo de cada precio
      let cashMarginVal = baseCostVal > 0 ? Math.round(((cashVal / baseCostVal) - 1) * 100) : 0;
      let creditMarginVal = cashVal > 0 ? Math.round(((creditVal / cashVal) - 1) * 100) : 0;

      // Asegurarse de que el margen caiga en los percentages base, sino truncar a lo más cercano o 0
      if (!PERCENTAGES.includes(cashMarginVal)) cashMarginVal = 0;
      if (!PERCENTAGES.includes(creditMarginVal)) creditMarginVal = 0;

      setPricing({
        baseCost: baseCostVal,
        costMargin: 0,
        cashMargin: cashMarginVal,
        creditMargin: creditMarginVal,
      });
    } else if (open && !initialData) {
      setForm({ name: "", type: "MODULO", quality: "INCELL", available: true });
      setPricing({ baseCost: 0, costMargin: 0, cashMargin: 0, creditMargin: 0 });
    }
  }, [open, initialData]);

  const computedCost = useMemo(() => {
    return pricing.baseCost * (1 + pricing.costMargin / 100);
  }, [pricing.baseCost, pricing.costMargin]);

  const computedCash = useMemo(() => {
    return computedCost * (1 + pricing.cashMargin / 100);
  }, [computedCost, pricing.cashMargin]);

  const computedCredit = useMemo(() => {
    return computedCash * (1 + pricing.creditMargin / 100);
  }, [computedCash, pricing.creditMargin]);

  const handleSave = async () => {
    if (!form.name) return clientErrorHandler("El nombre es requerido");

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        type: form.type,
        quality: form.quality === "NINGUNA" ? null : form.quality,
        available: form.available,
        cost: computedCost,
        cash: computedCash,
        credit: computedCredit,
      };

      if (isEditing) {
        await updateProducto(initialData.id, payload);
        clientSuccessHandler("Producto actualizado con éxito");
      } else {
        await createProducto(payload);
        clientSuccessHandler("Producto creado con éxito");
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
      title={isEditing ? "Editar Producto" : "Agregar Producto"}
      description={isEditing ? "Actualiza los datos del producto seleccionado." : "Ingresa los datos del nuevo producto y los márgenes de ganancia."}
      size="lg"
      footer={
        <>
          <Button variant="ghost" className="hover:bg-skybase-900 text-deepspace-500 h-11 px-6 font-semibold" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button className="bg-gradient-to-r from-bluegreen-500 to-bluegreen-600 hover:from-bluegreen-400 hover:to-bluegreen-500 text-white shadow-lg shadow-bluegreen-500/30 h-11 px-6 font-bold tracking-wide transition-all hover:scale-[1.02]" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : (isEditing ? "Actualizar Producto" : "Guardar Producto")}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
        {/* Datos Básicos */}
        <div className="space-y-5">
          <h3 className="font-bold text-lg border-b border-skybase-800 pb-2 text-deepspace-500">Datos Básicos</h3>
          
          <div className="space-y-2">
            <Label className="text-deepspace-500 font-semibold">Nombre del Producto</Label>
            <Input
              className="w-full bg-skybase-900/30 border-skybase-700/50 focus-visible:ring-bluegreen-500 transition-all h-11"
              placeholder="Ej: Módulo iPhone 11"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-deepspace-500 font-semibold">Tipo</Label>
            <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
              <SelectTrigger className="w-full bg-skybase-900/30 border-skybase-700/50 focus:ring-bluegreen-500 transition-all h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-deepspace-500 font-semibold">Calidad</Label>
            <Select value={form.quality} onValueChange={(val) => setForm({ ...form, quality: val })}>
              <SelectTrigger className="w-full bg-skybase-900/30 border-skybase-700/50 focus:ring-bluegreen-500 transition-all h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRODUCT_QUALITIES.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Button
              type="button"
              className={`w-full h-11 transition-all shadow-sm ${form.available ? "bg-bluegreen-500 hover:bg-bluegreen-600 text-white" : "bg-princeton-500 hover:bg-princeton-600 text-white"}`}
              onClick={() => setForm({ ...form, available: !form.available })}
            >
              <CheckIcon className={`mr-2 h-5 w-5 ${form.available ? "opacity-100" : "opacity-0"}`} />
              {form.available ? "Disponible" : "Sin Stock"}
            </Button>
          </div>
        </div>

        {/* Precios y Márgenes */}
        <div className="space-y-5">
          <h3 className="font-bold text-lg border-b border-skybase-800 pb-2 text-deepspace-500">Estructura de Precios</h3>

          <div className="space-y-2 p-4 bg-skybase-900/40 rounded-xl border border-skybase-700/50 shadow-sm">
            <Label className="text-deepspace-500 font-bold">Costo Base (Proveedor)</Label>
            <div className="flex items-center gap-2">
              <span className="flex items-center text-skybase-200 font-black text-xl">$</span>
              <Input
                type="number"
                min={0}
                className="w-full bg-white border-skybase-700/50 focus-visible:ring-bluegreen-500 text-lg font-black text-deepspace-500 h-11"
                value={pricing.baseCost}
                onChange={(e) => setPricing({ ...pricing, baseCost: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2 px-3 py-2 bg-skybase-900/10 rounded-lg border border-skybase-800/30">
            <Label className="flex justify-between text-deepspace-500 font-semibold">
              <span>% Costo Interno</span>
              <span className="font-black text-deepspace-500">${computedCost.toFixed(2)}</span>
            </Label>
            <Select value={pricing.costMargin.toString()} onValueChange={(val) => setPricing({ ...pricing, costMargin: Number(val) })}>
              <SelectTrigger className="w-full bg-white border-skybase-700/50 focus:ring-bluegreen-500"><SelectValue placeholder="Seleccionar %" /></SelectTrigger>
              <SelectContent>
                {PERCENTAGES.map((p) => <SelectItem key={p} value={p.toString()}>+{p}%</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 px-3 py-2 bg-skybase-900/10 rounded-lg border border-skybase-800/30">
            <Label className="flex justify-between text-deepspace-500 font-semibold">
              <span>% Margen Efectivo</span>
              <span className="font-black text-bluegreen-500">${computedCash.toFixed(2)}</span>
            </Label>
            <Select value={pricing.cashMargin.toString()} onValueChange={(val) => setPricing({ ...pricing, cashMargin: Number(val) })}>
              <SelectTrigger className="w-full bg-white border-skybase-700/50 focus:ring-bluegreen-500"><SelectValue placeholder="Seleccionar %" /></SelectTrigger>
              <SelectContent>
                {PERCENTAGES.map((p) => <SelectItem key={p} value={p.toString()}>+{p}%</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 px-3 py-2 bg-skybase-900/10 rounded-lg border border-skybase-800/30">
            <Label className="flex justify-between text-deepspace-500 font-semibold">
              <span>% Margen Crédito</span>
              <span className="font-black text-amber-500">${computedCredit.toFixed(2)}</span>
            </Label>
            <Select value={pricing.creditMargin.toString()} onValueChange={(val) => setPricing({ ...pricing, creditMargin: Number(val) })}>
              <SelectTrigger className="w-full bg-white border-skybase-700/50 focus:ring-bluegreen-500"><SelectValue placeholder="Seleccionar %" /></SelectTrigger>
              <SelectContent>
                {PERCENTAGES.map((p) => <SelectItem key={p} value={p.toString()}>+{p}%</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>
    </GenericModal>
  );
}
