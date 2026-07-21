import Student from '../models/Student.js';
import Alumni from '../models/Alumni.js';
import Admin from '../models/Admin.js';
import Session from "../models/Session.js";
import Course from "../models/Course.js";
import {
  countAllUsers,
  countPremiumUsers,
  countVerifiedUsers,
  deleteUserById,
  updateUserById,
} from "../utils/userModels.js";

// ─────────────────────────────
// GET USERS
// ─────────────────────────────
export const getUsers = async (req, res) => {
  try {
    const users = await [...(await Student.find().select('-password')), ...(await Alumni.find().select('-password'))];
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────
// VERIFY USER
// ─────────────────────────────
export const verifyUser = async (req, res) => {
  try {
    const user = await updateUserById(req.params.id, { isVerified: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User verified", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────
// SUSPEND USER
// ─────────────────────────────
export const suspendUser = async (req, res) => {
  try {
    const user = await updateUserById(req.params.id, { isSuspended: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User suspended", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────
// RESTORE USER
// ─────────────────────────────
export const restoreUser = async (req, res) => {
  try {
    const user = await updateUserById(req.params.id, { isSuspended: false });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User restored", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────
// DELETE USER
// ─────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await deleteUserById(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────
// STATS
// ─────────────────────────────
export const getStats = async (req, res) => {
  try {
    const users = await countAllUsers();
    const sessions = await Session.countDocuments();
    const courses = await Course.countDocuments();

    res.json({ users, sessions, courses });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────
// ANALYTICS (BASIC)
// ─────────────────────────────
export const getAnalytics = async (req, res) => {
  try {
    const verifiedUsers = await countVerifiedUsers();
    const premiumUsers = await countPremiumUsers();

    res.json({ verifiedUsers, premiumUsers });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────
// GET ALL SESSIONS
// ─────────────────────────────
export const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find().populate("instructor", "name email");
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────
// GET ALL COURSES
// ─────────────────────────────
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("instructor", "name email");
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};