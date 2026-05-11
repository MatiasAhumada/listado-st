"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { searchProductos } from "@/services/productoSearch.service";
import { Search } from "lucide-react";

interface ProductSearchProps {
  value: string;
  onSelect: (product: any) => void;
  placeholder?: string;
}

export function ProductSearch({ value, onSelect, placeholder }: ProductSearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

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
        const data = await searchProductos(searchValue);
        setResults(data);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error searching products:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (product: any) => {
    setQuery(product.name);
    setShowDropdown(false);
    onSelect(product);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          placeholder={placeholder || "Buscar servicio..."}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pr-10"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-3 text-center text-gray-400">Buscando...</div>
          ) : results.length > 0 ? (
            results.map((product) => (
              <button
                key={product.id}
                onClick={() => handleSelect(product)}
                className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white transition-colors"
              >
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-400">${product.cash?.toLocaleString()}</div>
              </button>
            ))
          ) : (
            <div className="p-3 text-center text-gray-400">No se encontraron resultados</div>
          )}
        </div>
      )}
    </div>
  );
}
