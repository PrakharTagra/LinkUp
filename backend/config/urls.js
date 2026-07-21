/**
 * ═══════════════════════════════════════════════════════════════
 *  DEPLOYED URLS — single source of truth
 *
 *  Every deployed URL the backend talks to (or accepts requests
 *  from) is defined ONCE here. Change a URL here — or override it
 *  via the matching environment variable in .env — and it takes
 *  effect everywhere it's used.
 *
 *  Do NOT hardcode a deployed URL anywhere else in the backend;
 *  import it from this file instead.
 * ═══════════════════════════════════════════════════════════════
 */

// The deployed frontend URL, used for CORS.
export const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://connect-six-ebon.vercel.app";

// The Skill Gap / ML microservice URL.
const rawSkillGapUrl =
  process.env.SKILL_GAP_SERVICE_URL ||
  process.env.ML_SERVICE_URL ||
  "http://localhost:8002";

export const SKILL_GAP_SERVICE_URL = rawSkillGapUrl
  .replace(/\/predict\/?$/, "")
  .replace(/\/$/, "");
