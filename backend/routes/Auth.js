import express from "express";
import {
  signup,
  login,
  getMe,
  logout,
  googleAuth,
  sendOTP,
  verifyOTP,
} from "../controllers/auth.js";

import { protect } from "../middleware/auth.js"; // ✅ FIX

const router = express.Router();

// ─────────────────────────────
// AUTH
// ─────────────────────────────
router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/logout", protect, logout);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// ─────────────────────────────
// USER
// ─────────────────────────────
router.get("/me", protect, getMe);

// ❌ REMOVE (moved to user.routes.js)
// router.patch("/upgrade-plan", protect, upgradePlan);

export default router;