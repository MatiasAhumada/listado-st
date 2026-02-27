import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search01Icon } from "hugeicons-react";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  title: string;
  subtitle?: string;
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
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
  loading = false,
  searchPlaceholder = "Buscar...",
  onSearch,
  actions,
  totalLabel,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1 text-sm sm:text-base">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">{actions}</div>}
      </div>

      <div className="border border-border rounded-lg shadow-lg bg-card">
        {onSearch && (
          <div className="p-4 lg:p-6 border-b border-border">
            <div className="relative w-full sm:max-w-md">
              <Search01Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        )}

        <div className="p-4 lg:p-6 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wide">
                {columns.map((column) => (
                  <th key={column.key} className={`pb-3 font-medium ${column.className || ""}`}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="py-8 text-center text-muted-foreground">
                    Cargando...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-8 text-center text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={keyExtractor(item)}
                    onClick={() => onRowClick?.(item)}
                    className={`border-b border-border hover:bg-muted/30 transition-colors ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                  >
                    {columns.map((column) => (
                      <td key={column.key} className={`py-4 ${column.className || ""}`}>
                        {column.render ? column.render(item) : String((item as Record<string, unknown>)[column.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalLabel && (
          <div className="px-4 lg:px-6 pb-4 lg:pb-6">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">{totalLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
}
