/**
 * ═══════════════════════════════════════════════════════════════
 *  DEPLOYED URLS — single source of truth
 *
 *  Every deployed URL the backend talks to (or accepts requests
 *  from) is defined ONCE here. Change a URL here — or override it
 *  via the matching environment variable in .env — and it takes
 *  effect everywhere it's used.
 * ═══════════════════════════════════════════════════════════════
 */

// The deployed frontend URL, used for CORS fallback.
export const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://linkup-blue.vercel.app";

// The Unified ML & Skill Gap microservice URL on Render.
const rawSkillGapUrl =
  process.env.SKILL_GAP_SERVICE_URL ||
  process.env.ML_SERVICE_URL ||
  "https://linkup-q4xj.onrender.com";

export const SKILL_GAP_SERVICE_URL = rawSkillGapUrl
  .replace(/\/predict\/?$/, "")
  .replace(/\/+$/, "");
