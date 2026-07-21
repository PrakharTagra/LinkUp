import Student from '../models/Student.js';
import Alumni from '../models/Alumni.js';
import Admin from '../models/Admin.js';
import Course from '../models/Course.js';
import Session from '../models/Session.js';
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import {
  findUserByEmail,
  findUserById,
  getUserModelByRole,
} from "../utils/userModels.js";

// ─────────────────────────────────────────────
// IN-MEMORY OTP STORE (expires after 10 min)
// ─────────────────────────────────────────────
const otpStore = new Map(); // email -> { otp, expiresAt }

// ─────────────────────────────────────────────
// EMAIL TRANSPORTER IS INSTANTIATED PER REQUEST
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// GENERATE TOKEN
// ─────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ─────────────────────────────────────────────
// SIGNUP
// ─────────────────────────────────────────────


// ─────────────────────────────
// SIGNUP
// ─────────────────────────────
export const signup = async (req, res) => {
  try {
    const {
      name, email, password, role, college, company, alumniPlan,
      domain, city, country, joiningYear, passingYear, degree, branch
    } = req.body;

    const existingUser = await findUserByEmail(email, { includePassword: true });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const userData = {
      name, email, password,
      role: role || "student",
      college: college || "",
      company: company || "",
      alumniPlan: role === "alumni" ? (alumniPlan || "simple") : undefined,
      domain, city, country,
      joiningYear, passingYear,
      degree, branch
    };
    
    let user;
    if (userData.role === "alumni") {
      user = await Alumni.create(userData);
    } else if (userData.role === "admin") {
      user = await Admin.create(userData);
    } else {
      user = await Student.create(userData);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const fullUser = await findUserById(user._id);

    res.status(201).json({ message: "Signup successful", user: fullUser, token });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(email.toLowerCase(), { otp, expiresAt });

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Connect Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Connect Verification Code",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; background: #0F1018; color: #fff; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #7C5CFC, #9B7EFF); padding: 28px 32px;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Connect·Verify</h1>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 15px; color: #ccc; margin-bottom: 24px;">Use the code below to verify your college email address:</p>
            <div style="background: #1a1b2e; border: 1px solid rgba(124,92,252,0.3); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #9B7EFF;">${otp}</span>
            </div>
            <p style="font-size: 13px; color: #888;">This code expires in <strong style="color:#fff">10 minutes</strong>. Do not share it with anyone.</p>
          </div>
        </div>
      `,
    });

    res.json({ message: "OTP sent to your college email" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP: " + err.message });
  }
};

// ─────────────────────────────────────────────
// VERIFY OTP
// ─────────────────────────────────────────────
export const verifyOTP = (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

  const record = otpStore.get(email.toLowerCase());
  if (!record) return res.status(400).json({ message: "No OTP found. Please request a new one." });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ message: "OTP expired. Please request a new one." });
  }
  if (record.otp !== otp.trim()) {
    return res.status(400).json({ message: "Incorrect OTP. Please try again." });
  }

  otpStore.delete(email.toLowerCase()); // consume the OTP
  res.json({ message: "Email verified successfully", verified: true });
};
// ─────────────────────────────────────────────
// GOOGLE AUTH
// ─────────────────────────────────────────────
export const googleAuth = async (req, res) => {
  try {
    const { email, name, avatar, role } = req.body;
     let user = await findUserByEmail(email, { includePassword: true });

    if (user && role && user.role !== role) {
      return res.status(403).json({
        message: `This account is registered as ${user.role}. Please select ${user.role} to continue.`,
      });
    }
    
    if (!user) {
       const userModel = getUserModelByRole(role || "student");

       if (!userModel) {
        return res.status(400).json({ message: "Invalid user role" });
       }

       user = await userModel.create({
          name,
          email,
          avatar,
          role: role || "student",
          password: Math.random().toString(36).slice(-8), // random dummy password
       });
    }

    const token = generateToken(user._id);
    res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "lax" });
    
    res.json({
       message: "Google Auth successful",
       user: {
         _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar
       },
       token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await findUserByEmail(email, { includePassword: true });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        message: `This account is registered as ${user.role}. Please select ${user.role} to continue.`,
      });
    }

    // compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    // ✅ Return FULL user profile so frontend doesn't lose fields like alumniPlan
    const fullUser = await findUserById(user._id);

    res.json({
      message: "Login successful",
      user: fullUser,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET ME
// ─────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    let user = await findUserById(req.user._id);

    if (user && user.role === "student") {
      user = await Student.findById(req.user._id)
        .select("-password")
        .populate("enrolledCourses.course", "title price thumbnail")
        .populate("enrolledSessions.session", "title date time")
        .populate("connections", "name avatar college company title");
    } else if (user && user.role === "alumni") {
      user = await Alumni.findById(req.user._id)
        .select("-password")
        .populate("connections", "name avatar college branch title")
        .populate("connectionRequests.student", "name avatar title");
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────
export const logout = (req, res) => {
  res.clearCookie("token");

  res.json({ message: "Logged out successfully" });
};