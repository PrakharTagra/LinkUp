/**
 * ═══════════════════════════════════════════════════════════════
 *  DEPLOYED URLS — single source of truth
 *
 *  Every deployed URL the frontend talks to is defined ONCE here.
 *  Change a URL here — or override it via the matching VITE_ env
 *  variable in .env — and it takes effect everywhere it's used.
 * ═══════════════════════════════════════════════════════════════
 */

// Main backend API (auth, users, posts, courses, messages, chat, etc.)
export const API_URL = import.meta.env.VITE_API_URL || "https://linkup-backend-kfum.onrender.com";

// AI chat widget API (integrated directly into main backend by default)
export const AI_API_URL = import.meta.env.VITE_AI_API_URL || API_URL;

// Unified Career path & Skill Gap ML recommendation microservice
export const ML_API_URL = import.meta.env.VITE_ML_API_URL || "https://linkup-ml-sygp.onrender.com";
