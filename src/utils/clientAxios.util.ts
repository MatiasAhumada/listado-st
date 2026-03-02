import axios from "axios";
import { useAuthStore } from "@/hooks/useAuthStore";

const clientAxios = axios.create({
  baseURL: "/api", // Updated to /api for common Next.js usage, original was /
  withCredentials: true,
});

// automatically add bearer token from zustand store if available
clientAxios.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default clientAxios;
