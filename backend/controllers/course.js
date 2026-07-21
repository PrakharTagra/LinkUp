import Course from "../models/Course.js";
import Student from '../models/Student.js';
import Alumni from '../models/Alumni.js';
import Admin from '../models/Admin.js';
import Earning from "../models/Earning.js";
import { uploadImage } from "../config/cloudinary.js";

const PLATFORM_CUT = Number(process.env.PLATFORM_CUT) || 0.20;

const MEMBERSHIP_DISCOUNT_PERCENT = 15;

const getMembershipAlumniIdSet = (student) => {
  if (!student || !Array.isArray(student.takenMemberships)) return new Set();
  return new Set(student.takenMemberships.map((m) => String(m.alumni)));
};

const applyCourseMembershipDiscount = (course, membershipAlumniIds) => {
  const instructorId = String(course?.instructor?._id || course?.instructor || "");
  const hasMembershipDiscount = membershipAlumniIds.has(instructorId);
  const basePrice = Number(course.price || 0);
  const discountedPrice = hasMembershipDiscount
    ? Math.max(0, Math.round(basePrice * (100 - MEMBERSHIP_DISCOUNT_PERCENT) / 100))
    : basePrice;

  return {
    ...course,
    hasMembershipDiscount,
    membershipDiscountPercent: hasMembershipDiscount ? MEMBERSHIP_DISCOUNT_PERCENT : 0,
    discountedPrice,
  };
};

// ─────────────────────────────────────────────
// GET COURSES
// ─────────────────────────────────────────────
export const getCourses = async (req, res) => {
  try {
    const { page = 1, limit = 12, category } = req.query;

    const filter = { isApproved: true, isPublished: true };
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Course.countDocuments(filter);

    const courses = await Course.find(filter)
      .populate("instructor", "name avatar college company isVerified alumniPlan")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    let mappedCourses = courses.map((course) => course.toObject());

    if (req.user?.role === "student") {
      const student = await Student.findById(req.user._id).select("takenMemberships");
      const membershipAlumniIds = getMembershipAlumniIdSet(student);
      mappedCourses = mappedCourses.map((course) => applyCourseMembershipDiscount(course, membershipAlumniIds));
    }

    res.json({
      courses: mappedCourses,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET MY COURSES (ALUMNI)
// ─────────────────────────────────────────────
export const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate("instructor", "name avatar college company isVerified alumniPlan")
      .sort({ createdAt: -1 });

    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET COURSE BY ID
// ─────────────────────────────────────────────
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "instructor",
      "name avatar college company about isVerified tokens"
    );

    if (!course) return res.status(404).json({ message: "Course not found" });

    let coursePayload = course.toObject();
    if (req.user?.role === "student") {
      const student = await Student.findById(req.user._id).select("takenMemberships");
      const membershipAlumniIds = getMembershipAlumniIdSet(student);
      coursePayload = applyCourseMembershipDiscount(coursePayload, membershipAlumniIds);
    }

    res.json({ course: coursePayload });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// CREATE COURSE
// ─────────────────────────────────────────────
export const createCourse = async (req, res) => {
  try {
    const user = await ((await Student.findById(req.user._id)) || (await Alumni.findById(req.user._id)) || (await Admin.findById(req.user._id))); // ✅ FIX

    if (user.alumniPlan !== "premium") {
      return res.status(403).json({ message: "Upgrade to Premium to create courses" });
    }

    const { title, description, price, originalPrice, category, curriculum, thumbnail, thumbnailRatio, thumbnailFit } = req.body;

    if (!title || !price) {
      return res.status(400).json({ message: "Title and price are required" });
    }

    let thumbnailUrl = "";
    if (thumbnail && thumbnail.startsWith("data:")) {
      const { url } = await uploadImage(thumbnail, "courses");
      thumbnailUrl = url;
    }

    const course = await Course.create({
      instructor: req.user._id,
      title,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category: category || "General",
      curriculum: curriculum || [],
      thumbnail: thumbnailUrl,
      thumbnailRatio: thumbnailRatio || "16 / 9",
      thumbnailFit: thumbnailFit || "contain",
      isApproved: true,
      isPublished: true,
    });

    await course.populate("instructor", "name avatar");

    res.status(201).json({ message: "Course submitted for approval", course });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// UPDATE COURSE
// ─────────────────────────────────────────────
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const isOwner = course.instructor.toString() === req.user._id.toString(); // ✅ FIX
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, description, price, originalPrice, category } = req.body;

    if (title) course.title = title;
    if (description) course.description = description;
    if (price) course.price = Number(price);
    if (originalPrice) course.originalPrice = Number(originalPrice);
    if (category) course.category = category;

    await course.save();

    res.json({ message: "Course updated", course });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// DELETE COURSE
// ─────────────────────────────────────────────
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const isOwner = course.instructor.toString() === req.user._id.toString(); // ✅ FIX
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await course.deleteOne();

    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// ENROLL COURSE
// ─────────────────────────────────────────────
export const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const userId = req.user._id;

    // Fetch the Student document to update enrollment
    const student = await Student.findById(userId);
    if (!student) return res.status(404).json({ message: "Student account not found" });

    const alreadyEnrolled = student.enrolledCourses.some(e => e.course?.toString() === course._id.toString());
    if (alreadyEnrolled) {
      return res.status(409).json({ message: "Already enrolled in this course" });
    }

    const hasMembershipDiscount = (student.takenMemberships || []).some(
      (item) => String(item.alumni) === String(course.instructor)
    );
    const discountPercent = hasMembershipDiscount ? MEMBERSHIP_DISCOUNT_PERCENT : 0;
    const basePrice = Number(course.price || 0);
    const payableAmount = hasMembershipDiscount
      ? Math.max(0, Math.round(basePrice * (100 - MEMBERSHIP_DISCOUNT_PERCENT) / 100))
      : basePrice;

    const { paymentMethod, paymentId } = req.body;
    const grossAmount = payableAmount;
    const platformFee = Math.round(grossAmount * PLATFORM_CUT);

    const enrollmentData = {
      course: course._id,
      paymentId: paymentId || `pay_${Math.random().toString(36).slice(2, 11)}`,
      paymentMethod: paymentMethod || "upi",
      amountPaid: grossAmount,
      enrolledAt: new Date()
    };

    // 1. Update Student doc (this grants "access")
    student.enrolledCourses.push(enrollmentData);
    await student.save();

    // 2. Update Course doc (for enrollment count/stats)
    course.enrolledStudents.push({
      student: userId,
      ...enrollmentData
    });
    await course.save();

    // 3. Create Earning record for the alumnus
    const alumniShare = Math.round(grossAmount * (1 - PLATFORM_CUT));
    await Earning.create({
      alumni: course.instructor,
      source: course._id,
      sourceModel: "Course",
      title: course.title,
      grossAmount,
      platformFee,
      alumniShare, // ✅ ADDED
      student: userId,
      paymentMethod: enrollmentData.paymentMethod,
      paymentId: enrollmentData.paymentId,
      type: "course",
    });

    res.json({
      success: true,
      message: hasMembershipDiscount
        ? `Enrollment successful! ${MEMBERSHIP_DISCOUNT_PERCENT}% membership discount applied.`
        : "Enrollment successful! You can now access the course content.",
      courseId: course._id,
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
// APPROVE COURSE (ADMIN)
// ─────────────────────────────────────────────
export const approveCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate("instructor", "name email");

    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json({ message: "Course approved", course });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};