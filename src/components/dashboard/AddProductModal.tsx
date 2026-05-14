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
import { formatNumber } from "@/utils/formatters.util";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any;
  userRole?: "EMPRESA" | "TECNICO" | "VENDEDOR";
}

const PRODUCT_TYPES = ["MODULO", "BATERIA", "PIN", "CONSOLA", "MANTENIMIENTO", "VIDRIOS_CAMARA", "VARIOS"];

export function AddProductModal({
  open,
  onOpenChange,
  onSuccess,
  initialData,
  userRole: propUserRole,
}: AddProductModalProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialData;
  const authUser = useAuthStore((state) => state.user);
  const userRole = propUserRole ?? authUser?.role ?? "EMPRESA";
  const isTecnico = userRole === "TECNICO";
  const isEmpresa = userRole === "EMPRESA";

  const [form, setForm] = useState({
    name: "",
    type: "MODULO" as string,
    available: true,
  });

  const [pricing, setPricing] = useState({
    costTech: 0,
    costTechMargin: 0,
    cashMargin: 0,
    creditMargin: 0,
  });

  useEffect(() => {
    if (open && initialData) {
      setForm({
        name: initialData.name || "",
        type: initialData.type || "MODULO",
        available: initialData.available !== undefined ? initialData.available : true,
      });

      if (isTecnico) {
        const costTechVal = initialData.costTech || 0;
        let costTechMarginVal = 0;
        if (initialData.cost > 0 && costTechVal > 0) {
          costTechMarginVal = Math.round((initialData.cost / costTechVal - 1) * 100);
        }
        if (!MARGIN_OPTIONS.includes(costTechMarginVal)) costTechMarginVal = 0;

        setPricing({
          costTech: costTechVal,
          costTechMargin: costTechMarginVal,
          cashMargin: 0,
          creditMargin: 0,
        });
      } else if (isEmpresa) {
        let cashMarginVal = 0;
        let creditMarginVal = 0;

        if (initialData.cash > 0 && initialData.cost > 0) {
          cashMarginVal = Math.round((initialData.cash / initialData.cost - 1) * 100);
        }

        if (initialData.credit > 0 && initialData.cash > 0) {
          creditMarginVal = Math.round((initialData.credit / initialData.cash - 1) * 100);
        }

        if (!MARGIN_OPTIONS.includes(cashMarginVal)) cashMarginVal = 0;
        if (!MARGIN_OPTIONS.includes(creditMarginVal)) creditMarginVal = 0;

        setPricing({
          costTech: 0,
          costTechMargin: 0,
          cashMargin: cashMarginVal,
          creditMargin: creditMarginVal,
        });
      }
    } else if (open && !initialData) {
      setForm({ name: "", type: "MODULO", available: true });
      setPricing({ costTech: 0, costTechMargin: 0, cashMargin: 0, creditMargin: 0 });
    }
  }, [open, initialData, isTecnico, isEmpresa]);

  const computedCost = useMemo(() => {
    return pricing.costTech * (1 + pricing.costTechMargin / 100);
  }, [pricing.costTech, pricing.costTechMargin]);

  const computedCash = useMemo(() => {
    if (isEmpresa && initialData?.cost) {
      return initialData.cost * (1 + pricing.cashMargin / 100);
    }
    return computedCost * (1 + pricing.cashMargin / 100);
  }, [computedCost, pricing.cashMargin, isEmpresa, initialData]);

  const computedCredit = useMemo(() => {
    return computedCash * (1 + pricing.creditMargin / 100);
  }, [computedCash, pricing.creditMargin]);

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
          cashMargin: pricing.cashMargin,
          creditMargin: pricing.creditMargin,
        };
      }

      if (isEditing) {
        await updateProducto(initialData.id, payload);
        clientSuccessHandler("Producto actualizado con éxito");
      } else if (isTecnico) {
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
      description={
        isEditing
          ? "Actualiza los datos del producto seleccionado."
          : "Ingresa los datos del nuevo producto y los márgenes de ganancia."
      }
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
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Guardando..." : isEditing ? "Actualizar Producto" : "Guardar Producto"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-3 sm:p-4 md:p-6">
        {/* Datos Básicos */}
        <div className="space-y-3 sm:space-y-4 md:space-y-5">
          <h3 className="font-bold text-base sm:text-lg border-b border-lavender/20 pb-2 text-lavender">
            Datos Básicos
          </h3>

          <div className="space-y-2">
            <Label className="text-lavender font-semibold">Nombre del Producto</Label>
            <Input
              className="w-full bg-charcoal border-lavender/20 text-lavender focus-visible:ring-lime transition-all h-11"
              placeholder="Ej: Módulo iPhone 11"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-lavender font-semibold">Trabajo</Label>
            <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
              <SelectTrigger className="w-full bg-charcoal border-lavender/20 text-lavender focus:ring-lime transition-all h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Button
              type="button"
              className={`w-full h-11 transition-all shadow-sm ${form.available ? "bg-lime hover:bg-green text-dark" : "bg-destructive hover:bg-destructive/90 text-white"}`}
              onClick={() => setForm({ ...form, available: !form.available })}
            >
              <CheckIcon className={`mr-2 h-5 w-5 ${form.available ? "opacity-100" : "opacity-0"}`} />
              {form.available ? "Disponible" : "Sin Stock"}
            </Button>
          </div>
        </div>

        {/* Precios y Márgenes */}
        <div className="space-y-3 sm:space-y-4 md:space-y-5">
          <h3 className="font-bold text-base sm:text-lg border-b border-lavender/20 pb-2 text-lavender">
            {isTecnico ? "Costo Técnico" : "Estructura de Precios"}
          </h3>

          {isTecnico ? (
            <>
              <div className="space-y-2 p-4 bg-charcoal/60 rounded-xl border border-lavender/20 shadow-sm">
                <Label className="text-lavender font-bold">Costo Técnico</Label>
                <div className="flex items-center gap-2">
                  <span className="flex items-center text-lavender/60 font-black text-xl">$</span>
                  <Input
                    type="number"
                    min={0}
                    className="w-full bg-dark border-lavender/20 text-lavender focus-visible:ring-lime text-lg font-black h-11"
                    value={pricing.costTech}
                    onChange={(e) => setPricing({ ...pricing, costTech: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2 px-3 py-2 bg-charcoal/40 rounded-lg border border-lavender/10">
                <Label className="flex justify-between text-lavender font-semibold">
                  <span>% Margen Técnico</span>
                  <span className="font-black text-lime">${formatNumber(computedCost)}</span>
                </Label>
                <Select
                  value={pricing.costTechMargin.toString()}
                  onValueChange={(val) => setPricing({ ...pricing, costTechMargin: Number(val) })}
                >
                  <SelectTrigger className="w-full bg-dark border-lavender/20 text-lavender focus:ring-lime">
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
                <div className="space-y-2 p-4 bg-charcoal/60 rounded-xl border border-lavender/20 shadow-sm">
                  <Label className="text-lavender font-bold">Costo Base</Label>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center text-lavender/60 font-black text-xl">$</span>
                    <Input
                      type="number"
                      min={0}
                      readOnly
                      className="w-full bg-charcoal/80 border-lavender/20 text-lavender text-lg font-black h-11"
                      value={initialData?.cost || 0}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 px-3 py-2 bg-charcoal/40 rounded-lg border border-lavender/10">
                <Label className="flex justify-between text-lavender font-semibold">
                  <span>% Margen Efectivo</span>
                  <span className="font-black text-lime">${formatNumber(computedCash)}</span>
                </Label>
                <Select
                  value={pricing.cashMargin.toString()}
                  onValueChange={(val) => setPricing({ ...pricing, cashMargin: Number(val) })}
                >
                  <SelectTrigger className="w-full bg-dark border-lavender/20 text-lavender focus:ring-lime">
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

              <div className="space-y-2 px-3 py-2 bg-charcoal/40 rounded-lg border border-lavender/10">
                <Label className="flex justify-between text-lavender font-semibold">
                  <span>% Margen Crédito</span>
                  <span className="font-black text-green">${formatNumber(computedCredit)}</span>
                </Label>
                <Select
                  value={pricing.creditMargin.toString()}
                  onValueChange={(val) => setPricing({ ...pricing, creditMargin: Number(val) })}
                >
                  <SelectTrigger className="w-full bg-dark border-lavender/20 text-lavender focus:ring-lime">
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
