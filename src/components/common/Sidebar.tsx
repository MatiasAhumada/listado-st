"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useUserRole } from "@/hooks/useUserRole";
import { logoutUsuario } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ClipboardList, LogOut, User, Menu, X, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { isEmpresa, isVendedor, isTecnico } = useUserRole();

  if (!user) return null;

  const handleLogout = async () => {
    await logoutUsuario();
    logout();
    router.push("/");
  };

  const menuItems = [
    {
      label: "Servicios",
      icon: Package,
      path: "/dashboard",
      show: isEmpresa || isVendedor || isTecnico,
    },
    {
      label: "Órdenes de Servicio",
      icon: ClipboardList,
      path: "/dashboard/service-orders",
      show: isEmpresa || isVendedor,
    },
    {
      label: "Sucursales",
      icon: MapPin,
      path: "/dashboard/branches",
      show: isEmpresa,
    },
    {
      label: "Vendedores",
      icon: Users,
      path: "/dashboard/vendedores",
      show: isEmpresa,
    },
  ];

  const filteredMenu = menuItems.filter((item) => item.show);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 bg-lime rounded-lg flex items-center justify-center shadow-lg hover:bg-green transition-colors"
      >
        <Menu size={20} className="text-dark" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-dark/95 backdrop-blur-sm border-r border-lavender/10 transition-all duration-300 ease-in-out",
          "lg:w-14 lg:hover:w-48",
          isOpen ? "w-56 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 lg:w-14"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-3 border-b border-lavender/10 flex-shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 bg-gradient-to-r from-lime to-green rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package size={18} className="text-dark" />
                </div>
                <span className="text-base font-bold text-lavender truncate lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  Service Tech
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-lavender/60 hover:text-lavender hover:bg-lavender/10 h-8 w-8 flex-shrink-0 lg:hidden"
              >
                <X size={18} />
              </Button>
            </div>
          </div>

          <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
            {filteredMenu.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                    isActive ? "bg-lime text-dark" : "text-lavender/70 hover:bg-lavender/5 hover:text-lavender"
                  )}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="truncate whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-lavender/10 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime to-green flex items-center justify-center shadow-lg flex-shrink-0">
                <User size={16} className="text-dark" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lavender font-bold text-xs truncate">{user?.username}</p>
                <Badge className="bg-lime hover:bg-green text-dark text-[10px] uppercase font-bold border-0 shadow-sm px-1.5 py-0">
                  {user?.role}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full text-lavender/60 hover:text-lavender hover:bg-lavender/10 transition-all text-xs h-8 justify-start gap-2"
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
