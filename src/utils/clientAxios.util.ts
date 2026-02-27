import axios from "axios";

const clientAxios = axios.create({
  baseURL: "/api", // Updated to /api for common Next.js usage, original was /
  withCredentials: true,
});

export default clientAxios;
