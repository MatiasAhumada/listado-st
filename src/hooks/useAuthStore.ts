import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthenticatedUser } from "@/interfaces/auth.interface";

interface AuthState {
  user: AuthenticatedUser | null;
  token: string | null;
  setUser: (user: AuthenticatedUser | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => {
        set({ token });
        // keep axios header in sync when token changes
        if (token) {
          import("@/utils/clientAxios.util").then((m) => {
            m.default.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          });
        } else {
          import("@/utils/clientAxios.util").then((m) => {
            delete m.default.defaults.headers.common["Authorization"];
          });
        }
      },
      logout: () => {
        set({ user: null, token: null });
        import("@/utils/clientAxios.util").then((m) => {
          delete m.default.defaults.headers.common["Authorization"];
        });
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          import("@/utils/clientAxios.util").then((m) => {
            m.default.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
          });
        }
      },
    }
  )
);
