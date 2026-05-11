"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Check } from "lucide-react";

interface ServiceDetailsProps {
  index: number;
  isDry: boolean;
  hasImpact: boolean;
  isBrokenScreen: boolean;
  isTurnedOn: boolean;
  isCharging: boolean;
  color: string;
  description: string;
  onChange: (field: string, value: boolean | string) => void;
}

export function ServiceDetails({
  index,
  isDry,
  hasImpact,
  isBrokenScreen,
  isTurnedOn,
  isCharging,
  color,
  description,
  onChange,
}: ServiceDetailsProps) {
  return (
    <div className="mt-3 p-4 bg-gray-950 rounded-lg border border-gray-700 space-y-3">
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`isDry-${index}`}
            checked={!isDry}
            onCheckedChange={(checked) => onChange("isDry", !checked)}
            className="border-gray-600"
          />
          <Label htmlFor={`isDry-${index}`} className="text-white text-sm cursor-pointer">
            Está Mojado
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id={`hasImpact-${index}`}
            checked={hasImpact}
            onCheckedChange={(checked) => onChange("hasImpact", checked as boolean)}
            className="border-gray-600"
          />
          <Label htmlFor={`hasImpact-${index}`} className="text-white text-sm cursor-pointer">
            Está Golpeado
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id={`isBrokenScreen-${index}`}
            checked={isBrokenScreen}
            onCheckedChange={(checked) => onChange("isBrokenScreen", checked as boolean)}
            className="border-gray-600"
          />
          <Label htmlFor={`isBrokenScreen-${index}`} className="text-white text-sm cursor-pointer">
            Pantalla Rota
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id={`isTurnedOn-${index}`}
            checked={isTurnedOn}
            onCheckedChange={(checked) => onChange("isTurnedOn", checked as boolean)}
            className="border-gray-600"
          />
          <Label htmlFor={`isTurnedOn-${index}`} className="text-white text-sm cursor-pointer">
            Está Prendido
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id={`isCharging-${index}`}
            checked={isCharging}
            onCheckedChange={(checked) => onChange("isCharging", checked as boolean)}
            className="border-gray-600"
          />
          <Label htmlFor={`isCharging-${index}`} className="text-white text-sm cursor-pointer">
            Está Cargando
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm">Color</Label>
        <div className="grid grid-cols-6 gap-2">
          {[
            { name: 'Negro', value: 'Negro', hex: '#000000' },
            { name: 'Blanco', value: 'Blanco', hex: '#FFFFFF' },
            { name: 'Gris', value: 'Gris', hex: '#808080' },
            { name: 'Azul', value: 'Azul', hex: '#0000FF' },
            { name: 'Rojo', value: 'Rojo', hex: '#FF0000' },
            { name: 'Verde', value: 'Verde', hex: '#00FF00' },
            { name: 'Amarillo', value: 'Amarillo', hex: '#FFFF00' },
            { name: 'Naranja', value: 'Naranja', hex: '#FFA500' },
            { name: 'Rosa', value: 'Rosa', hex: '#FFC0CB' },
            { name: 'Morado', value: 'Morado', hex: '#800080' },
            { name: 'Dorado', value: 'Dorado', hex: '#FFD700' },
            { name: 'Plateado', value: 'Plateado', hex: '#C0C0C0' },
          ].map((colorOption) => (
            <button
              key={colorOption.value}
              type="button"
              onClick={() => onChange('color', colorOption.value)}
              className="relative group flex flex-col items-center"
              title={colorOption.name}
            >
              <div
                className={`w-8 h-8 rounded-md border-2 transition-all ${
                  color === colorOption.value
                    ? 'border-lime scale-110'
                    : 'border-gray-600 hover:border-lavender/40'
                }`}
                style={{ backgroundColor: colorOption.hex }}
              >
                {color === colorOption.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white drop-shadow-lg" strokeWidth={3} />
                  </div>
                )}
              </div>
              <span className="text-xs text-lavender/80 mt-1 truncate w-full text-center">
                {colorOption.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description" className="text-white text-sm">
          Descripción
        </Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Descripción detallada del servicio..."
          className="w-full min-h-20 px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 text-sm"
        />
      </div>
    </div>
  );
}
