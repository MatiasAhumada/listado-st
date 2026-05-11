import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  title?: string;
  subtitle?: string;
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  loading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  actions?: ReactNode;
  totalLabel?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  title,
  subtitle,
  columns,
  data,
  keyExtractor,
  emptyMessage = "No hay datos disponibles",
  emptyIcon,
  loading = false,
  searchPlaceholder = "Buscar...",
  onSearch,
  actions,
  totalLabel,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="space-y-6">
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            {title && <h1 className="text-4xl font-black text-lavender">{title}</h1>}
            {subtitle && <p className="text-lavender/60 text-lg mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-3">{actions}</div>}
        </div>
      )}

      <div className="bg-dark/80 backdrop-blur-sm border border-lavender/10 shadow-2xl rounded-lg overflow-hidden">
        {onSearch && (
          <div className="p-4 border-b border-lavender/10">
            <div className="relative w-full max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender/50" />
              <Input
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10 bg-charcoal border-lavender/20 text-lavender placeholder:text-lavender/50"
              />
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-lavender/10">
                {columns.map((column) => (
                  <th key={column.key} className={`text-left p-4 text-lavender font-bold ${column.className || ""}`}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center p-8 text-lavender/60 font-semibold">
                    Cargando...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center p-8">
                    <div className="flex flex-col items-center gap-3">
                      {emptyIcon && (
                        <div className="w-16 h-16 rounded-full bg-lime/20 flex items-center justify-center">
                          {emptyIcon}
                        </div>
                      )}
                      <p className="text-lavender font-semibold text-lg">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={keyExtractor(item)}
                    onClick={() => onRowClick?.(item)}
                    className={`border-b border-lavender/10 hover:bg-lavender/5 transition-all ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                  >
                    {columns.map((column) => (
                      <td key={column.key} className={`p-4 ${column.className || ""}`}>
                        {column.render ? (
                          column.render(item)
                        ) : (
                          <span className="text-lavender">
                            {String((item as Record<string, unknown>)[column.key] ?? "")}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalLabel && (
          <div className="p-4 border-t border-lavender/10">
            <p className="text-sm text-lavender/60">{totalLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
}
