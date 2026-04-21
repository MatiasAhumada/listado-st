"use client";

import { useState, useMemo, useEffect } from "react";
import { createProducto, updateProducto } from "@/services/producto.service";
import { GenericModal } from "@/components/common/GenericModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { useAuthStore } from "@/hooks/useAuthStore";
import { CheckIcon } from "lucide-react";
import { MARGIN_OPTIONS } from "@/constants/pricing.constant";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any;
  userRole?: "EMPRESA" | "TECNICO" | "VENDEDOR";
}

const PRODUCT_TYPES = ["MODULO", "BATERIA", "PIN", "VARIOS"];
const PRODUCT_QUALITIES = ["INCELL", "OLED", "ORIGINAL", "SERVICEPACK", "REMANOFACTURADO", "NINGUNA"];

export function AddProductModal({ open, onOpenChange, onSuccess, initialData, userRole: propUserRole }: AddProductModalProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialData;
  const authUser = useAuthStore((state) => state.user);
  const userRole = propUserRole ?? authUser?.role ?? "EMPRESA";
  const isTecnico = userRole === "TECNICO";
  const isEmpresa = userRole === "EMPRESA";

  const [form, setForm] = useState({
    name: "",
    type: "MODULO" as string,
    quality: "INCELL" as string,
    available: true,
  });

  const [pricing, setPricing] = useState({
    costTech: 0,
    costTechMargin: 0,
    costMargin: 0,
    cashMargin: 0,
  });

  useEffect(() => {
    if (open && initialData) {
      setForm({
        name: initialData.name || "",
        type: initialData.type || "MODULO",
        quality: initialData.quality || "NINGUNA",
        available: initialData.available !== undefined ? initialData.available : true,
      });

      if (isTecnico) {
        const costTechVal = initialData.costTech || 0;
        let costTechMarginVal = 0;
        if (initialData.cost > 0 && costTechVal > 0) {
          costTechMarginVal = Math.round(((initialData.cost / costTechVal - 1) * 100));
        }
        if (!MARGIN_OPTIONS.includes(costTechMarginVal)) costTechMarginVal = 0;

        setPricing({
          costTech: costTechVal,
          costTechMargin: costTechMarginVal,
          costMargin: 0,
          cashMargin: 0,
        });
      } else if (isEmpresa) {
        const baseCostVal = initialData.costTech || initialData.cost || 0;
        let costMarginVal = 0;
        let cashMarginVal = 0;

        if (initialData.cost > 0 && baseCostVal > 0) {
          costMarginVal = Math.round(((initialData.cost / baseCostVal - 1) * 100));
        }
        if (initialData.cash > 0 && initialData.cost > 0) {
          cashMarginVal = Math.round(((initialData.cash / initialData.cost - 1) * 100));
        }

        if (!MARGIN_OPTIONS.includes(costMarginVal)) costMarginVal = 0;
        if (!MARGIN_OPTIONS.includes(cashMarginVal)) cashMarginVal = 0;

        setPricing({
          costTech: baseCostVal,
          costTechMargin: 0,
          costMargin: costMarginVal,
          cashMargin: cashMarginVal,
        });
      }
    } else if (open && !initialData) {
      setForm({ name: "", type: "MODULO", quality: "INCELL", available: true });
      setPricing({ costTech: 0, costTechMargin: 0, costMargin: 0, cashMargin: 0 });
    }
  }, [open, initialData, isTecnico, isEmpresa]);

  const computedCost = useMemo(() => {
    return pricing.costTech * (1 + pricing.costTechMargin / 100);
  }, [pricing.costTech, pricing.costTechMargin]);

  const computedCash = useMemo(() => {
    return computedCost * (1 + pricing.cashMargin / 100);
  }, [computedCost, pricing.cashMargin]);

  const handleSave = async () => {
    if (!form.name) return clientErrorHandler("El nombre es requerido");
    if (isTecnico && pricing.costTech <= 0) {
      return clientErrorHandler("El costo técnico es requerido");
    }

    setLoading(true);
    try {
      let payload: Record<string, unknown> = {
        name: form.name,
        type: form.type,
        quality: form.quality === "NINGUNA" ? null : form.quality,
        available: form.available,
      };

      if (isTecnico) {
        payload = {
          ...payload,
          costTech: pricing.costTech,
          costTechMargin: pricing.costTechMargin,
        };
      } else if (isEmpresa) {
        payload = {
          ...payload,
          costTech: pricing.costTech > 0 ? pricing.costTech : initialData?.costTech,
          costMargin: pricing.costMargin,
          cashMargin: pricing.cashMargin,
        };
      }

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
          <h3 className="font-bold text-lg border-b border-skybase-800 pb-2 text-deepspace-500">
            {isTecnico ? "Costo Técnico" : "Estructura de Precios"}
          </h3>

          {isTecnico ? (
            <>
              <div className="space-y-2 p-4 bg-skybase-900/40 rounded-xl border border-skybase-700/50 shadow-sm">
                <Label className="text-deepspace-500 font-bold">Costo Técnico</Label>
                <div className="flex items-center gap-2">
                  <span className="flex items-center text-skybase-200 font-black text-xl">$</span>
                  <Input
                    type="number"
                    min={0}
                    className="w-full bg-white border-skybase-700/50 focus-visible:ring-bluegreen-500 text-lg font-black text-deepspace-500 h-11"
                    value={pricing.costTech}
                    onChange={(e) => setPricing({ ...pricing, costTech: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2 px-3 py-2 bg-skybase-900/10 rounded-lg border border-skybase-800/30">
                <Label className="flex justify-between text-deepspace-500 font-semibold">
                  <span>% Margen Técnico</span>
                  <span className="font-black text-deepspace-500">${computedCost.toFixed(2)}</span>
                </Label>
                <Select
                  value={pricing.costTechMargin.toString()}
                  onValueChange={(val) => setPricing({ ...pricing, costTechMargin: Number(val) })}
                >
                  <SelectTrigger className="w-full bg-white border-skybase-700/50 focus:ring-bluegreen-500">
                    <SelectValue placeholder="Seleccionar %" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARGIN_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p.toString()}>
                        +{p}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              {isEmpresa && (
                <div className="space-y-2 p-4 bg-skybase-900/40 rounded-xl border border-skybase-700/50 shadow-sm">
                  <Label className="text-deepspace-500 font-bold">Costo del Técnico</Label>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center text-skybase-200 font-black text-xl">$</span>
                    <Input
                      type="number"
                      min={0}
                      readOnly
                      className="w-full bg-skybase-800/50 border-skybase-700/50 text-lg font-black text-deepspace-500 h-11"
                      value={pricing.costTech}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 px-3 py-2 bg-skybase-900/10 rounded-lg border border-skybase-800/30">
                <Label className="flex justify-between text-deepspace-500 font-semibold">
                  <span>% Margen Empresa</span>
                  <span className="font-black text-deepspace-500">${computedCost.toFixed(2)}</span>
                </Label>
                <Select
                  value={pricing.costMargin.toString()}
                  onValueChange={(val) => setPricing({ ...pricing, costMargin: Number(val) })}
                >
                  <SelectTrigger className="w-full bg-white border-skybase-700/50 focus:ring-bluegreen-500">
                    <SelectValue placeholder="Seleccionar %" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARGIN_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p.toString()}>
                        +{p}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 px-3 py-2 bg-skybase-900/10 rounded-lg border border-skybase-800/30">
                <Label className="flex justify-between text-deepspace-500 font-semibold">
                  <span>% Margen Efectivo</span>
                  <span className="font-black text-bluegreen-500">${computedCash.toFixed(2)}</span>
                </Label>
                <Select
                  value={pricing.cashMargin.toString()}
                  onValueChange={(val) => setPricing({ ...pricing, cashMargin: Number(val) })}
                >
                  <SelectTrigger className="w-full bg-white border-skybase-700/50 focus:ring-bluegreen-500">
                    <SelectValue placeholder="Seleccionar %" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARGIN_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p.toString()}>
                        +{p}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </div>
    </GenericModal>
  );
}
