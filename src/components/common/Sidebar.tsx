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
    <aside className="w-64 bg-gradient-to-b from-hunter-green-500 to-hunter-green-600 h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-50">
      <div className="p-6 border-b border-hunter-green-400/50">
        <h1 className="text-2xl font-black text-vanilla-cream-500">Listado ST</h1>
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
                  ? "bg-sage-green-500 text-white shadow-lg"
                  : "text-vanilla-cream-600 hover:bg-hunter-green-400/50 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span className="font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-hunter-green-400/50 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-sage-green-500 flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-vanilla-cream-500 font-semibold text-sm truncate">{user?.username}</p>
            <Badge className="bg-yellow-green-500 hover:bg-yellow-green-400 text-hunter-green-900 text-xs uppercase font-bold border-0">
              {user?.role}
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-center text-vanilla-cream-600 hover:text-white hover:bg-hunter-green-400/50"
        >
          <LogOut size={18} />
        </Button>
      </div>
    </aside>
  );
}
