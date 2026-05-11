"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { searchClients, createClient, ClientDTO } from "@/services/client.service";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { Search, Plus } from "lucide-react";

interface ClientSearchProps {
  onSelect: (client: ClientDTO) => void;
}

export function ClientSearch({ onSelect }: ClientSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClientDTO[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    dni: "",
    phone: "",
    address: "",
    email: "",
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (searchValue: string) => {
    setQuery(searchValue);

    if (searchValue.length >= 2) {
      setLoading(true);
      try {
        const data = await searchClients(searchValue);
        setResults(data);
        setShowDropdown(true);
      } catch (error) {
        clientErrorHandler(error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (client: ClientDTO) => {
    setQuery(`${client.fullName} - ${client.dni}`);
    setShowDropdown(false);
    setShowForm(false);
    onSelect(client);
  };

  const handleCreateClient = async () => {
    if (!formData.fullName || !formData.dni) {
      return clientErrorHandler("Nombre completo y DNI son obligatorios");
    }

    setCreating(true);
    try {
      const newClient = await createClient({
        fullName: formData.fullName,
        dni: formData.dni,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        email: formData.email || undefined,
      });

      clientSuccessHandler("Cliente creado correctamente");
      setQuery(`${newClient.fullName} - ${newClient.dni}`);
      setShowForm(false);
      setShowDropdown(false);
      setFormData({ fullName: "", dni: "", phone: "", address: "", email: "" });
      onSelect(newClient);
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative w-full" ref={dropdownRef}>
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => query.length >= 2 && setShowDropdown(true)}
              placeholder="Buscar cliente..."
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          </div>
          <Button
            type="button"
            size="icon"
            onClick={() => setShowForm(!showForm)}
            className="bg-lime hover:bg-green text-dark"
          >
            <Plus size={18} />
          </Button>
        </div>

        {showDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
            {loading ? (
              <div className="p-3 text-center text-gray-400">Buscando...</div>
            ) : results.length > 0 ? (
              results.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleSelect(client)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white transition-colors"
                >
                  <div className="font-medium">{client.fullName}</div>
                  <div className="text-sm text-gray-400">
                    DNI: {client.dni} {client.phone && `• ${client.phone}`}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-gray-400">No se encontraron clientes</div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 space-y-3">
          <div className="space-y-2">
            <Label className="text-white text-sm">Nombre Completo *</Label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Nombre completo"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white text-sm">DNI *</Label>
            <Input
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              placeholder="DNI"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white text-sm">Teléfono</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Teléfono (opcional)"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white text-sm">Dirección</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Dirección (opcional)"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white text-sm">Email</Label>
            <Input
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email (opcional)"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setFormData({ fullName: "", dni: "", phone: "", address: "", email: "" });
              }}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreateClient}
              disabled={creating}
              className="flex-1 bg-lime hover:bg-green text-dark"
            >
              {creating ? "Creando..." : "Crear Cliente"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
