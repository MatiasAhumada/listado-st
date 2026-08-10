import axios from "axios";

const clientAxios = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export default clientAxios;
