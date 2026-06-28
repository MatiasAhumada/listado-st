import axios from "axios";

const gastosAxios = axios.create({
  baseURL: process.env.GASTOS_APP_URL,
  headers: {
    "x-api-key": process.env.INTERNAL_API_KEY,
  },
});

export default gastosAxios;
