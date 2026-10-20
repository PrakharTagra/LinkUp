import express from "express";
import {
  getMyEarnings,
  getEarningStats,
  requestWithdrawal,
} from "../controllers/earning.js";

import { protect, roleGuard, premiumGuard } from "../middleware/auth.js";

const router = express.Router();

// ─────────────────────────────
// EARNINGS
// ─────────────────────────────
// Any authenticated alumni can view their earnings and stats (returns 0 if simple or empty)
router.get("/", protect, roleGuard("alumni"), getMyEarnings);
router.get("/stats", protect, getEarningStats);

// Only premium alumni can request withdrawals
router.post("/withdraw", protect, roleGuard("alumni"), premiumGuard, requestWithdrawal);

export default router;
