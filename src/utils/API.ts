import axios from "axios";

const API = axios.create({
  baseURL: "https://localhost:7255/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // optional, if your API uses cookies / auth
  validateStatus: (s) => s * 1 < 500,
});

export { API };
