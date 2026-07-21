import axios from "axios";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${backendUrl}/api`, // your backend
  withCredentials: true, // IMPORTANT for auth cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;