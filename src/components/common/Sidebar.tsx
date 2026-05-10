"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { logoutUsuario } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ClipboardList, LogOut, User } from "lucide-react";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const handleLogout = async () => {
    await logoutUsuario();
    logout();
    router.push("/");
  };

  const isEmpresa = user?.role === "EMPRESA";
  const isVendedor = user?.role === "VENDEDOR";

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
  ];

  const filteredMenu = menuItems.filter((item) => item.roles.includes(user?.role || ""));

  return (
    <aside className="w-64 bg-gradient-to-b from-hunter-green-600 to-hunter-green-700 h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-50 border-r-4 border-yellow-green-500">
      <div className="p-6 border-b border-yellow-green-500/30 bg-hunter-green-500">
        <h1 className="text-2xl font-black text-yellow-green-400">Listado ST</h1>
        <p className="text-xs text-vanilla-cream-600 mt-1">Sistema de Gestión</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-semibold ${
                isActive
                  ? "bg-yellow-green-500 text-hunter-green-900 shadow-lg shadow-yellow-green-500/50"
                  : "text-vanilla-cream-500 hover:bg-hunter-green-500 hover:text-yellow-green-400"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-yellow-green-500/30 bg-hunter-green-500">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-green-400 to-yellow-green-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <User size={20} className="text-hunter-green-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-vanilla-cream-500 font-bold text-sm truncate">{user?.username}</p>
            <Badge className="bg-blushed-brick-500 hover:bg-blushed-brick-600 text-white text-xs uppercase font-bold border-0 shadow-md">
              {user?.role}
            </Badge>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            size="icon"
            className="flex-shrink-0 text-vanilla-cream-600 hover:text-blushed-brick-400 hover:bg-hunter-green-400/50 transition-all"
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </aside>
  );
}
