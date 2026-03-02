import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  role: "EMPRESA" | "VENDEDOR";
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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
      name: 'auth-storage',
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
