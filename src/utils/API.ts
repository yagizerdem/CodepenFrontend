import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // optional, if your API uses cookies / auth
  validateStatus: (s) => s * 1 < 500,
});

export { API };
