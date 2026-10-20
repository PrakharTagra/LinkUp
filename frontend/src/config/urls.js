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
// In a unified Vercel project, frontend and backend share the same origin,
// so leaving this empty uses relative calls to /api without cross-origin latency or CORS issues.
export const API_URL = import.meta.env.VITE_API_URL || "";

// AI chat widget API (integrated directly into main backend)
export const AI_API_URL = import.meta.env.VITE_AI_API_URL || API_URL;

// Unified Career path & Skill Gap ML recommendation microservice on Render
export const ML_API_URL = import.meta.env.VITE_ML_API_URL || "https://linkup-ml.onrender.com";
