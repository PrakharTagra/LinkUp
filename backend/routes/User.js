import express from "express";
import {
  getAlumni,
  getAlumniWithMembership,
  getUserById,
  updateProfile,
  upgradePlan,
  getEnrolledItems,
  addReview,
  takeAlumniMembership,
  activateAlumniMembership,
} from "../controllers/user.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// ─────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────

// Get all alumni (networking page)
router.get("/alumni", getAlumni);

// ─────────────────────────────
// PROTECTED ROUTES
// ─────────────────────────────
router.use(protect);

// Get alumni list with membership flag for current user
router.get("/alumni-memberships", getAlumniWithMembership);

// Update profile (includes avatar upload already)
router.put("/profile", updateProfile);

// Upgrade alumni plan (simple → premium)
router.patch("/upgrade-plan", upgradePlan);

// Add review to an alumni
router.post("/:id/review", addReview);

// Student takes alumni membership
router.post("/:id/membership", takeAlumniMembership);

// Alumni activates own membership
router.post("/membership/activate", activateAlumniMembership);

// Get enrolled items (courses + sessions)
router.get("/me/enrolled", getEnrolledItems);

// Get single user profile (MUST be last route so it doesn't match the above endpoints)
router.get("/:id", getUserById);

export default router;