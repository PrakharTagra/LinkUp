import express from "express";
import axios from "axios";

import Student from "../models/Student.js";
import { protect, roleGuard } from "../middleware/auth.js";

const router = express.Router();

const rawServiceUrl =
  process.env.SKILL_GAP_SERVICE_URL ||
  process.env.ML_SERVICE_URL ||
  "http://localhost:8002";

const SKILL_GAP_SERVICE_URL = rawServiceUrl.replace(/\/predict\/?$/, "").replace(/\/$/, "");

const skillGapClient = axios.create({
  baseURL: SKILL_GAP_SERVICE_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

function toAnalyzerStudent(studentDoc) {
  return {
    _id: studentDoc._id,
    name: studentDoc.name,
    email: studentDoc.email,
    role: studentDoc.role,
    year: studentDoc.year,
    branch: studentDoc.branch,
    skills: Array.isArray(studentDoc.skills) ? studentDoc.skills : [],
    enrolledCourses: Array.isArray(studentDoc.enrolledCourses) ? studentDoc.enrolledCourses : [],
    enrolledSessions: Array.isArray(studentDoc.enrolledSessions) ? studentDoc.enrolledSessions : [],
  };
}

async function getStudentByLookup({ studentId, studentEmail, fallbackUserId }) {
  if (studentId) {
    return Student.findById(studentId).lean();
  }

  if (studentEmail) {
    return Student.findOne({ email: studentEmail }).lean();
  }

  if (fallbackUserId) {
    return Student.findById(fallbackUserId).lean();
  }

  return null;
}

router.get("/health", async (req, res) => {
  try {
    const { data } = await skillGapClient.get("/health");
    return res.json(data);
  } catch (error) {
    return res.status(502).json({
      message: "Skill Gap service is unavailable",
      error: error.message,
    });
  }
});

router.get("/my-analysis", protect, roleGuard("student"), async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const domains = Array.isArray(req.query.domains)
      ? req.query.domains
      : String(req.query.domains || "")
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean);

    const { data } = await skillGapClient.post("/api/skill-gap/analyze", {
      student: toAnalyzerStudent(student),
      domains,
    });

    return res.json(data);
  } catch (error) {
    return res.status(502).json({
      message: "Skill Gap analysis failed",
      error: error.message,
    });
  }
});

router.get("/my-profile", protect, roleGuard("student"), async (req, res) => {
  try {
    const student = await Student.findById(req.user._id)
      .select("name email role year branch skills enrolledCourses enrolledSessions")
      .lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json({ student: toAnalyzerStudent(student) });
  } catch (error) {
    return res.status(500).json({
      message: "Could not fetch student profile",
      error: error.message,
    });
  }
});

router.get("/domains", protect, roleGuard("student", "alumni", "admin"), async (req, res) => {
  try {
    const { data } = await skillGapClient.get("/api/skill-gap/domains");
    return res.json(data);
  } catch (error) {
    return res.status(502).json({
      message: "Could not fetch available domains",
      error: error.message,
    });
  }
});

router.post("/analyze", protect, async (req, res) => {
  try {
    const studentId = req.body?.student_id?.trim?.() || "";
    const studentEmail = req.body?.student?.email?.trim?.() || "";
    const domains = Array.isArray(req.body?.domains)
      ? req.body.domains.map((d) => String(d).trim()).filter(Boolean)
      : [];

    const student = await getStudentByLookup({
      studentId,
      studentEmail,
      fallbackUserId: req.user?.role === "student" ? String(req.user._id) : null,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (req.user?.role === "student" && String(student._id) !== String(req.user._id)) {
      return res.status(403).json({ message: "Students can only analyze their own profile" });
    }

    const { data } = await skillGapClient.post("/api/skill-gap/analyze", {
      student: toAnalyzerStudent(student),
      domains,
    });

    return res.json(data);
  } catch (error) {
    return res.status(502).json({
      message: "Skill Gap analysis failed",
      error: error.message,
    });
  }
});

router.get("/market-skills", protect, async (req, res) => {
  try {
    const n = Number.parseInt(req.query.n, 10) || 20;
    const { data } = await skillGapClient.get(`/api/skill-gap/market-skills?n=${n}`);
    return res.json(data);
  } catch (error) {
    return res.status(502).json({
      message: "Could not fetch market skills",
      error: error.message,
    });
  }
});

router.post("/learning-path", protect, async (req, res) => {
  try {
    const { gap_skills = [] } = req.body || {};
    const { data } = await skillGapClient.post("/api/skill-gap/learning-path", { gap_skills });
    return res.json(data);
  } catch (error) {
    return res.status(502).json({
      message: "Could not fetch learning path",
      error: error.message,
    });
  }
});

router.get("/batch", protect, roleGuard("admin"), async (req, res) => {
  try {
    const { data } = await skillGapClient.post("/api/skill-gap/batch-analyze", {});
    return res.json(data);
  } catch (error) {
    return res.status(502).json({
      message: "Could not run batch analysis",
      error: error.message,
    });
  }
});

export default router;