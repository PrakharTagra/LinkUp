/**
 * Skill Gap Analyzer — Express.js Integration
 * Drop this into your Connect backend as a route module.
 *
 * Usage in your app.js / server.js:
 *   const skillGapRouter = require('./routes/skillGap');
 *   app.use('/api/skill-gap', skillGapRouter);
 *
 * This module spawns the Python ML service or calls it via HTTP
 * depending on your deployment setup.
 */

const express = require("express");
const router = express.Router();
const axios = require("axios");

// ── Config ──────────────────────────────────────────────────
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8001";

// Models — import from your existing mongoose models
const Student = require("../models/Student");   // your students model
const Course  = require("../models/Course");    // your courses model
const Session = require("../models/Session");   // your sessions model (if exists)
const Alumni  = require("../models/Alumni");    // your alumnis model

// Auth middleware — reuse your existing one
const { protect, authorize } = require("../middleware/auth");


// ── Helper: call Python ML service ──────────────────────────
async function callMLService(endpoint, data = {}) {
  const res = await axios.post(`${ML_SERVICE_URL}${endpoint}`, data, {
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}


// ────────────────────────────────────────────────────────────
// GET /api/skill-gap/my-analysis
// Logged-in student gets their own skill gap report
// ────────────────────────────────────────────────────────────
router.get("/my-analysis", protect, authorize("student"), async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).lean();
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const result = await callMLService("/api/skill-gap/analyze", { student });
    res.json({ success: true, data: result });

  } catch (err) {
    console.error("[SkillGap] Error:", err.message);
    res.status(500).json({ success: false, message: "Analysis failed", error: err.message });
  }
});


// ────────────────────────────────────────────────────────────
// POST /api/skill-gap/analyze/:studentId
// Admin/alumni analyzes a specific student
// ────────────────────────────────────────────────────────────
router.post(
  "/analyze/:studentId",
  protect,
  authorize("admin", "alumni"),
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.studentId).lean();
      if (!student) return res.status(404).json({ success: false, message: "Student not found" });

      const result = await callMLService("/api/skill-gap/analyze", { student });
      res.json({ success: true, data: result });

    } catch (err) {
      console.error("[SkillGap] Error:", err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);


// ────────────────────────────────────────────────────────────
// GET /api/skill-gap/market-skills
// What skills are in demand (public or authenticated)
// ────────────────────────────────────────────────────────────
router.get("/market-skills", protect, async (req, res) => {
  try {
    const n = parseInt(req.query.n) || 20;
    const result = await axios.get(`${ML_SERVICE_URL}/api/skill-gap/market-skills?n=${n}`);
    res.json({ success: true, data: result.data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ────────────────────────────────────────────────────────────
// POST /api/skill-gap/role-matches
// What roles best match given skills
// ────────────────────────────────────────────────────────────
router.post("/role-matches", protect, async (req, res) => {
  try {
    const { skills } = req.body;
    const result = await callMLService("/api/skill-gap/role-matches", {
      skills,
      top_n: 5,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ────────────────────────────────────────────────────────────
// POST /api/skill-gap/learning-path
// Get learning path for a list of skill gaps
// ────────────────────────────────────────────────────────────
router.post("/learning-path", protect, async (req, res) => {
  try {
    const { gap_skills } = req.body;
    const result = await callMLService("/api/skill-gap/learning-path", { gap_skills });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ────────────────────────────────────────────────────────────
// GET /api/skill-gap/batch  (Admin only)
// Batch analyze all students — for admin dashboard
// ────────────────────────────────────────────────────────────
router.get("/batch", protect, authorize("admin"), async (req, res) => {
  try {
    const students = await Student.find({ role: "student" })
      .select("name skills branch year enrolledCourses enrolledSessions")
      .lean();

    // Send to ML service in batches of 20
    const BATCH = 20;
    const allResults = [];
    for (let i = 0; i < students.length; i += BATCH) {
      const batch = students.slice(i, i + BATCH);
      const promises = batch.map((s) =>
        callMLService("/api/skill-gap/analyze", { student: s }).then((r) => ({
          student_id: s._id,
          name: s.name,
          readiness_score: r.skill_analysis?.readiness_score,
          top_gaps: r.skill_analysis?.skill_gaps?.slice(0, 5),
          best_role: r.role_matches?.[0]?.role,
        }))
      );
      const batchResults = await Promise.allSettled(promises);
      batchResults.forEach((r) => {
        if (r.status === "fulfilled") allResults.push(r.value);
      });
    }

    res.json({
      success: true,
      data: {
        total: allResults.length,
        analyses: allResults,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;