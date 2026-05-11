"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Sidebar } from "@/components/common/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/");
    }
  }, [user, isHydrated, router]);

  if (!isHydrated || !user) return null;

  return (
    <div className="flex min-h-screen bg-charcoal">
      <Sidebar />
      <div className="flex-1 lg:ml-16 transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
