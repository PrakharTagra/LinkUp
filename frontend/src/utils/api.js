import axios from "axios";
import { API_URL } from "../config/urls.js";

// Normalize baseURL:
// - If VITE_API_URL is configured, use it.
// - In production with unified Vercel deployment, defaults to relative "/api" (same origin).
// - In local dev without VITE_API_URL, defaults to "http://localhost:5000/api".
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

const API = axios.create({
  baseURL: resolvedBaseURL,
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

export default API;
