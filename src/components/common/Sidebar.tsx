"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
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

  if (!user) return null;

  const handleLogout = async () => {
    await logoutUsuario();
    logout();
    router.push("/");
  };

  const menuItems = [
    {
      label: "Productos",
      icon: Package,
      path: "/dashboard",
      roles: ["EMPRESA", "VENDEDOR", "TECNICO"],
    },
    {
      label: "Órdenes de Servicio",
      icon: ClipboardList,
      path: "/dashboard/service-orders",
      roles: ["EMPRESA", "VENDEDOR"],
    },
    {
      label: "Sucursales",
      icon: MapPin,
      path: "/dashboard/branches",
      roles: ["EMPRESA"],
    },
    {
      label: "Vendedores",
      icon: Users,
      path: "/dashboard/vendedores",
      roles: ["EMPRESA"],
    },
  ];

  const filteredMenu = menuItems.filter((item) => item.roles.includes(user?.role || ""));

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-12 h-12 bg-lime rounded-full flex items-center justify-center shadow-lg"
      >
        {isOpen ? <X size={24} className="text-dark" /> : <Menu size={24} className="text-dark" />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-dark/95 backdrop-blur-sm border-r border-lavender/10 transform transition-all duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-16"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-lavender/10">
            <div className="flex items-center justify-center lg:justify-between">
              <div
                className={cn("flex items-center gap-2 transition-opacity duration-300", !isOpen && "hidden lg:hidden")}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-lime to-green rounded-lg flex items-center justify-center">
                  <Package size={20} className="text-lavender" />
                </div>
                {isOpen && <span className="text-xl font-bold text-lavender">Listado ST</span>}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="hidden lg:flex text-lavender/60 hover:text-lavender hover:bg-lavender/10 h-10 w-10"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1">
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
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                    isActive ? "bg-lime text-dark" : "text-lavender/70 hover:bg-lavender/5 hover:text-lavender"
                  )}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {isOpen && <span className="truncate">{item.label}</span>}
                  {!isOpen && (
                    <div className="absolute left-16 bg-charcoal border border-lavender/10 text-lavender px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-lavender/10">
            <div className={cn("flex items-center gap-3", !isOpen && "justify-center")}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime to-green flex items-center justify-center shadow-lg flex-shrink-0">
                <User size={20} className="text-dark" />
              </div>
              {isOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-lavender font-bold text-sm truncate">{user?.username}</p>
                  <Badge className="bg-lime hover:bg-green text-dark text-xs uppercase font-bold border-0 shadow-md">
                    {user?.role}
                  </Badge>
                </div>
              )}
              {isOpen && (
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  size="icon"
                  className="flex-shrink-0 text-lavender/60 hover:text-lavender hover:bg-lavender/10 transition-all"
                >
                  <LogOut size={18} />
                </Button>
              )}
            </div>
            {!isOpen && (
              <Button
                variant="ghost"
                onClick={handleLogout}
                size="icon"
                className="w-full mt-2 text-lavender/60 hover:text-lavender hover:bg-lavender/10 transition-all"
              >
                <LogOut size={18} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
