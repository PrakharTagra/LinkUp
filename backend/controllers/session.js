import Session from "../models/Session.js";
import Student from '../models/Student.js';
import Alumni from '../models/Alumni.js';
import Admin from '../models/Admin.js';
import Earning from "../models/Earning.js";
import { uploadImage } from "../config/cloudinary.js";

const PLATFORM_CUT = Number(process.env.PLATFORM_CUT) || 0.20;
const TOKEN_SESSION_COMPLETE = 20;
const MEMBERSHIP_DISCOUNT_PERCENT = 15;

const getMembershipAlumniIdSet = (student) => {
  if (!student || !Array.isArray(student.takenMemberships)) return new Set();
  return new Set(student.takenMemberships.map((m) => String(m.alumni)));
};

const applySessionMembershipDiscount = (session, membershipAlumniIds) => {
  const instructorId = String(session?.instructor?._id || session?.instructor || "");
  const hasMembershipDiscount = membershipAlumniIds.has(instructorId);
  const basePrice = Number(session.price || 0);
  const discountedPrice = hasMembershipDiscount
    ? Math.max(0, Math.round(basePrice * (100 - MEMBERSHIP_DISCOUNT_PERCENT) / 100))
    : basePrice;

  return {
    ...session,
    hasMembershipDiscount,
    membershipDiscountPercent: hasMembershipDiscount ? MEMBERSHIP_DISCOUNT_PERCENT : 0,
    discountedPrice,
  };
};

// ─────────────────────────────────────────────
// GET SESSIONS
// ─────────────────────────────────────────────
export const getSessions = async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;

    const filter = { isApproved: true, isPublished: true };
    if (type) filter.type = type;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Session.countDocuments(filter);

    const sessions = await Session.find(filter)
      .populate("instructor", "name avatar college company isVerified alumniPlan")
      .sort({ date: 1 })
      .skip(skip)
      .limit(Number(limit));

    let mappedSessions = sessions.map((session) => session.toObject());
    if (req.user?.role === "student") {
      const student = await Student.findById(req.user._id).select("takenMemberships");
      const membershipAlumniIds = getMembershipAlumniIdSet(student);
      mappedSessions = mappedSessions.map((session) => applySessionMembershipDiscount(session, membershipAlumniIds));
    }

    res.json({
      sessions: mappedSessions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET MY SESSIONS
// ─────────────────────────────────────────────
export const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ instructor: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// CREATE SESSION
// ─────────────────────────────────────────────
export const createSession = async (req, res) => {
  try {
    const user = await ((await Student.findById(req.user._id)) || (await Alumni.findById(req.user._id)) || (await Admin.findById(req.user._id)));

    if (user.alumniPlan !== "premium") {
      return res.status(403).json({ message: "Upgrade to Premium to host sessions" });
    }

    const { title, description, date, time, price, totalSeats, duration, type, thumbnail, thumbnailRatio, thumbnailFit } = req.body;

    if (!title || !date || price === undefined) {
      return res.status(400).json({ message: "Title, date, and price are required" });
    }

    let thumbnailUrl = "";
    if (thumbnail && thumbnail.startsWith("data:")) {
      const { url } = await uploadImage(thumbnail, "sessions");
      thumbnailUrl = url;
    }

    const session = await Session.create({
      instructor: req.user._id,
      title, description,
      date: new Date(date),
      time: time || "",
      price: Number(price),
      totalSeats: Number(totalSeats) || 20,
      duration: Number(duration) || 60,
      type: type || "session",
      thumbnail: thumbnailUrl,
      thumbnailRatio: thumbnailRatio || "16 / 9",
      thumbnailFit: thumbnailFit || "contain",
      isApproved: true,
      isPublished: true,
      isLive: false,
      enrolledStudents: [],
    });

    await session.populate("instructor", "name avatar");

    res.status(201).json({ message: "Session created", session });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// UPDATE SESSION
// ─────────────────────────────────────────────
export const updateSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const isOwner = session.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, description, date, time, price, seats, type } = req.body;

    if (title) session.title = title;
    if (description) session.description = description;
    if (date) session.date = new Date(date);
    if (time) session.time = time;
    if (price) session.price = Number(price);
    if (seats) session.totalSeats = Number(seats);
    if (type) session.type = type;

    await session.save();

    res.json({ message: "Session updated", session });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// DELETE SESSION
// ─────────────────────────────────────────────
export const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const isOwner = session.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await session.deleteOne();

    res.json({ message: "Session deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// ENROLL SESSION
// ─────────────────────────────────────────────
export const enrollSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (!session.isApproved) {
      return res.status(400).json({ message: "Session is not available yet" });
    }

    const userId = req.user._id;

    const alreadyEnrolled = session.enrolledStudents.some(e => e.student && e.student.toString() === userId.toString());
    if (alreadyEnrolled) {
      return res.status(409).json({ message: "Already enrolled" });
    }

    const seatsLeft = session.totalSeats - session.enrolledStudents.length;
    if (seatsLeft <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }

    // 1. Update Student doc (this gives the access)
    const student = await Student.findById(userId);
    if (!student) return res.status(404).json({ message: "Student account not found" });

    const hasMembershipDiscount = (student.takenMemberships || []).some(
      (item) => String(item.alumni) === String(session.instructor)
    );
    const discountPercent = hasMembershipDiscount ? MEMBERSHIP_DISCOUNT_PERCENT : 0;
    const basePrice = Number(session.price || 0);
    const payableAmount = hasMembershipDiscount
      ? Math.max(0, Math.round(basePrice * (100 - MEMBERSHIP_DISCOUNT_PERCENT) / 100))
      : basePrice;

    const { paymentMethod, paymentId } = req.body;
    const grossAmount = payableAmount;
    const platformFee = Math.round(grossAmount * PLATFORM_CUT);

    const enrollmentData = {
      session: session._id,
      paymentId: paymentId || `pay_${Math.random().toString(36).slice(2, 11)}`,
      paymentMethod: paymentMethod || "upi",
      amountPaid: grossAmount,
      enrolledAt: new Date()
    };

    const alreadyEnrolledInStudent = student.enrolledSessions.some(e => e.session?.toString() === session._id.toString());
    if (!alreadyEnrolledInStudent) {
      student.enrolledSessions.push(enrollmentData);
      await student.save();
    }

    // 2. Update Session doc (for count/stats)
    session.enrolledStudents.push({
      student: userId,
      ...enrollmentData
    });
    await session.save();

    // 3. Create Earnings
    const alumniShare = Math.round(grossAmount * (1 - PLATFORM_CUT));
    await Earning.create({
      alumni: session.instructor,
      source: session._id,
      sourceModel: "Session",
      title: session.title,
      grossAmount,
      platformFee,
      alumniShare, // ✅ ADDED
      student: userId,
      paymentMethod: enrollmentData.paymentMethod,
      paymentId: enrollmentData.paymentId,
      type: session.type || "session",
    });

    res.json({
      message: hasMembershipDiscount
        ? `Enrolled successfully with ${MEMBERSHIP_DISCOUNT_PERCENT}% membership discount.`
        : "Enrolled successfully",
      seatsLeft: session.totalSeats - session.enrolledStudents.length,
      pricing: {
        basePrice,
        discountPercent,
        amountPaid: grossAmount,
      },
    });
  } catch (err) {
    console.error("Enrollment error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// APPROVE SESSION
// ─────────────────────────────────────────────
export const approveSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate("instructor", "name email");

    if (!session) return res.status(404).json({ message: "Session not found" });

    res.json({ message: "Session approved", session });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// GO LIVE
// ─────────────────────────────────────────────
export const goLive = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const isOwner = session.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    session.isLive = true;
    await session.save();

    res.json({ message: "Session is now live", session });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};