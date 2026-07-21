import axios from "axios";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: `${backendUrl}/api`,
  withCredentials: true,
});

// 🔥 attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

// ✅ VERY IMPORTANT (THIS WAS MISSING)
export default API;