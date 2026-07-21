import express from "express";
import {
  getSessions,
  getMySessions,
  createSession,
  updateSession,
  deleteSession,
  enrollSession,
  approveSession,
  goLive,
} from "../controllers/session.js";

import { protect, roleGuard, premiumGuard, optionalProtect } from "../middleware/auth.js";

const router = express.Router();

// ─────────────────────────────
// PUBLIC
// ─────────────────────────────
router.get("/", optionalProtect, getSessions);

// ─────────────────────────────
// ALUMNI
// ─────────────────────────────
router.get("/my", protect, roleGuard("alumni"), getMySessions); // ✅ FIX (mine → my)

router.post("/", protect, roleGuard("alumni"), premiumGuard, createSession);

router.put("/:id", protect, roleGuard("alumni", "admin"), updateSession);
router.delete("/:id", protect, roleGuard("alumni", "admin"), deleteSession);

// ─────────────────────────────
// STUDENT
// ─────────────────────────────
router.post("/:id/enroll", protect, enrollSession); // ✅ role handled logically

// ─────────────────────────────
// ADMIN
// ─────────────────────────────
router.patch("/:id/approve", protect, roleGuard("admin"), approveSession);

// Alumni can go live for their own session
router.patch("/:id/live", protect, roleGuard("alumni", "admin"), goLive);

export default router;