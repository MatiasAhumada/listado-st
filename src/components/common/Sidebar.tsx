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
      path: "/service-orders",
      roles: ["EMPRESA", "VENDEDOR"],
    },
  ];

  const filteredMenu = menuItems.filter((item) => item.roles.includes(user?.role || ""));

  return (
    <aside className="w-64 bg-gradient-to-b from-deepspace-600 to-deepspace-700 h-screen fixed left-0 top-0 flex flex-col shadow-2xl">
      <div className="p-6 border-b border-deepspace-500/50">
        <h1 className="text-2xl font-black text-white">Listado ST</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-bluegreen-500 text-white shadow-lg"
                  : "text-skybase-200 hover:bg-deepspace-500/50 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span className="font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-deepspace-500/50 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-bluegreen-500 flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user?.username}</p>
            <Badge className="bg-amber-500 hover:bg-amber-400 text-xs uppercase font-bold border-0">
              {user?.role}
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-center text-skybase-200 hover:text-white hover:bg-deepspace-500/50"
        >
          <LogOut size={18} />
        </Button>
      </div>
    </aside>
  );
}
