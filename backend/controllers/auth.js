import Student from '../models/Student.js';
import Alumni from '../models/Alumni.js';
import Admin from '../models/Admin.js';
import Course from '../models/Course.js';
import Session from '../models/Session.js';
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import axios from "axios";
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

// ─────────────────────────────────────────────
// EMAIL SENDER HELPER (BREVO API v3 + SMTP)
// ─────────────────────────────────────────────
const sendEmailWithBrevo = async ({ toEmail, subject, htmlContent }) => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    throw new Error("BREVO_API_KEY is not configured on the server.");
  }

  // Determine sender: use env if provided, or query Brevo account/senders
  let senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;
  let senderName = process.env.BREVO_SENDER_NAME || "LinkUp Platform";

  if (!senderEmail) {
    try {
      // Auto-detect verified sender from Brevo account
      const sendersRes = await axios.get("https://api.brevo.com/v3/senders", {
        headers: { "api-key": brevoApiKey },
        timeout: 7000,
      });
      if (sendersRes.data?.senders?.length > 0) {
        // Prefer active verified sender
        const verifiedSender = sendersRes.data.senders.find(s => s.active) || sendersRes.data.senders[0];
        senderEmail = verifiedSender.email;
        senderName = verifiedSender.name || senderName;
      }
    } catch (e) {
      console.warn("[Brevo] Could not fetch senders list:", e.message);
    }
  }

  if (!senderEmail) {
    try {
      // Fallback: check Brevo account profile email
      const accountRes = await axios.get("https://api.brevo.com/v3/account", {
        headers: { "api-key": brevoApiKey },
        timeout: 7000,
      });
      if (accountRes.data?.email) {
        senderEmail = accountRes.data.email;
      }
    } catch (e) {
      console.warn("[Brevo] Could not fetch account info:", e.message);
    }
  }

  if (!senderEmail) {
    throw new Error("No verified sender email found in Brevo. Please set BREVO_SENDER_EMAIL in backend environment variables.");
  }

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail }],
    subject,
    htmlContent,
  };

  const response = await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
    headers: {
      "api-key": brevoApiKey,
      "Content-Type": "application/json",
      "accept": "application/json",
    },
    timeout: 10000,
  });

  return response.data;
};

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Generate 6-digit cryptographic random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(email.toLowerCase().trim(), { otp, expiresAt });

    const htmlContent = `
      <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; max-width: 500px; margin: 0 auto; background: #0F1018; color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #232538;">
        <div style="background: linear-gradient(135deg, #7C5CFC, #9B7EFF); padding: 28px 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #FFFFFF;">LinkUp Platform</h1>
          <p style="margin: 6px 0 0; font-size: 13px; color: #E8E5FF;">Student & Alumni Professional Network</p>
        </div>
        <div style="padding: 32px 28px; text-align: center;">
          <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 10px; color: #FFFFFF;">Verify Your Email Address</h2>
          <p style="font-size: 14px; color: #9B9EAE; line-height: 1.5; margin: 0 0 24px;">
            Thank you for registering on LinkUp. Enter the 6-digit verification code below to confirm your account:
          </p>
          <div style="background: #181926; border: 1.5px solid rgba(124,92,252,0.4); border-radius: 14px; padding: 22px; display: inline-block; min-width: 260px; margin-bottom: 24px;">
            <span style="font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #9B7EFF; font-family: 'Courier New', Courier, monospace;">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #6F7285; margin: 0 0 8px;">
            This verification code is valid for <strong>10 minutes</strong>.
          </p>
          <p style="font-size: 12px; color: #53566A; margin: 0;">
            If you did not request this code, you can safely ignore this email.
          </p>
        </div>
      </div>
    `;

    // Priority 1: Use Brevo API if BREVO_API_KEY is configured
    if (process.env.BREVO_API_KEY) {
      try {
        const brevoResult = await sendEmailWithBrevo({
          toEmail: email.trim(),
          subject: "Your LinkUp Verification Code",
          htmlContent,
        });
        console.log(`[Brevo] OTP email dispatched successfully to ${email}. MessageId:`, brevoResult?.messageId);
        return res.json({
          message: "Verification code sent to your email",
          emailSent: true,
        });
      } catch (brevoErr) {
        console.error("[Brevo] Delivery error:", brevoErr.response?.data || brevoErr.message);
        const errMsg = brevoErr.response?.data?.message || brevoErr.message;
        return res.status(500).json({
          message: `Failed to send email via Brevo: ${errMsg}`,
        });
      }
    }

    // Priority 2: Standard SMTP fallback (if configured)
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (emailUser && emailPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || "smtp.gmail.com",
          port: parseInt(process.env.EMAIL_PORT || "587", 10),
          secure: process.env.EMAIL_SECURE === "true",
          auth: { user: emailUser, pass: emailPass },
          connectionTimeout: 6000,
          greetingTimeout: 6000,
          socketTimeout: 6000,
        });

        await transporter.sendMail({
          from: `"LinkUp Platform" <${emailUser}>`,
          to: email,
          subject: "Your LinkUp Verification Code",
          html: htmlContent,
        });

        return res.json({ message: "Verification code sent to your email", emailSent: true });
      } catch (mailErr) {
        console.error("[SMTP] Delivery error:", mailErr.message);
        return res.status(500).json({
          message: `Failed to send email via SMTP: ${mailErr.message}`,
        });
      }
    }

    // No email service configured
    return res.status(500).json({
      message: "Email service not configured. Please configure BREVO_API_KEY on the server.",
    });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ message: "Failed to process OTP request: " + err.message });
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
          password: crypto.randomBytes(32).toString("hex"),
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