import axios from "axios";
import { API_URL } from "../config/urls.js";

const api = axios.create({
  baseURL: `${API_URL}/api`, // your backend
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