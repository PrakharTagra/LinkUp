import express from "express";
import {
  getCourses,
  getMyCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  approveCourse,
} from "../controllers/course.js"; // ✅ FIX

import { protect, roleGuard, optionalProtect } from "../middleware/auth.js"; // ✅ FIX

const router = express.Router();

// ─────────────────────────────
// PUBLIC
// ─────────────────────────────
router.get("/", optionalProtect, getCourses);

// ─────────────────────────────
// ALUMNI (CREATE / MANAGE)
// ─────────────────────────────
router.get("/my", protect, roleGuard("alumni"), getMyCourses); // ✅ Must be before /:id
router.post("/", protect, roleGuard("alumni"), createCourse);

// ─────────────────────────────
// PUBLIC (single item — must come after /my)
// ─────────────────────────────
router.get("/:id", optionalProtect, getCourseById);

router.put("/:id", protect, roleGuard("alumni", "admin"), updateCourse);
router.delete("/:id", protect, roleGuard("alumni", "admin"), deleteCourse);

// ─────────────────────────────
// STUDENT (ENROLL)
// ─────────────────────────────
router.post("/:id/enroll", protect, enrollCourse); // ✅ role check handled logically

// ─────────────────────────────
// ADMIN
// ─────────────────────────────
router.patch("/:id/approve", protect, roleGuard("admin"), approveCourse);

export default router;