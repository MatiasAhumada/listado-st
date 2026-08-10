"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Sidebar } from "@/components/common/Sidebar";

const subscribeToHydration = (onStoreChange: () => void) =>
  useAuthStore.persist.onFinishHydration(onStoreChange);
const getHydrationSnapshot = () => useAuthStore.persist.hasHydrated();
const getServerHydrationSnapshot = () => false;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydrationSnapshot,
    getServerHydrationSnapshot
  );

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/");
    }
  }, [user, isHydrated, router]);

  if (!isHydrated || !user) return null;

  return (
    <div className="flex min-h-screen bg-charcoal overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 md:ml-[20%] md:max-w-[80%] transition-all duration-300 overflow-x-hidden">{children}</div>
    </div>
  );
}
