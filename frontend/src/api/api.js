import axios from "axios";
import { API_URL } from "../config/urls.js";

const rawUrl = (API_URL !== undefined && API_URL !== null ? String(API_URL) : "").trim();
let resolvedBaseURL = "/api";

if (rawUrl) {
  const clean = rawUrl.replace(/\/+$/, "");
  resolvedBaseURL = clean.endsWith("/api") ? clean : `${clean}/api`;
} else if (import.meta.env.DEV) {
  resolvedBaseURL = "http://localhost:5000/api";
} else {
  resolvedBaseURL = "/api";
}

const api = axios.create({
  baseURL: resolvedBaseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
