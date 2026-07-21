import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ── Sub-schemas ──────────────────────────────────────────────

const enrolledCourseSchema = new mongoose.Schema({
  course:        { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  enrolledAt:    { type: Date, default: Date.now },
  paymentId:     { type: String, default: '' },
  paymentMethod: { type: String, enum: ['card', 'upi', 'net'], default: 'upi' },
  amountPaid:    { type: Number, default: 0 },
}, { _id: false });

const enrolledSessionSchema = new mongoose.Schema({
  session:       { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  enrolledAt:    { type: Date, default: Date.now },
  paymentId:     { type: String, default: '' },
  paymentMethod: { type: String, enum: ['card', 'upi', 'net'], default: 'upi' },
  amountPaid:    { type: Number, default: 0 },
}, { _id: false });

const takenMembershipSchema = new mongoose.Schema({
  alumni: { type: mongoose.Schema.Types.ObjectId, ref: "Alumni", required: true },
  takenAt: { type: Date, default: Date.now },
}, { _id: false });

const educationSchema = new mongoose.Schema({
  institution: { type: String, default: "" },
  degree: { type: String, default: "" },
  fieldOfStudy: { type: String, default: "" },
  startYear: { type: Number },
  endYear: { type: Number },
  grade: { type: String, default: "" },
  description: { type: String, default: "" },
}, { _id: false });

// ── Student Schema ───────────────────────────────────────────

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "student" },
  avatar: { type: String, default: "" },
  coverPhoto: { type: String, default: "" },
  about: { type: String, default: "" },
  title: { type: String, default: "" },
  headline: { type: String, default: "" },
  skills: [String],
  certifications: [String],
  education: [educationSchema],
  college: { type: String, default: "" },
  company: { type: String, default: "" },
  tokens: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },

  year: { type: Number, min: 1, max: 5, default: 1 },
  branch: { type: String, default: '' },
  joiningYear: { type: Number },
  passingYear: { type: Number },
  degree: { type: String, default: "" },

  enrolledCourses: [enrolledCourseSchema],
  enrolledSessions: [enrolledSessionSchema],

  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumni',
  }],

  takenMemberships: [takenMembershipSchema],

  isCollegePartner: { type: Boolean, default: false },
  has24hReply: { type: Boolean, default: false },
  replyUnlockExpiresAt: { type: Date, default: null },
}, { timestamps: true });

// ── Virtuals ─────────────────────────────────────────────────
studentSchema.virtual('coursesEnrolledCount').get(function () { return this.enrolledCourses.length; });
studentSchema.virtual('sessionsAttendedCount').get(function () { return this.enrolledSessions.length; });
studentSchema.virtual('connectionsCount').get(function () { return this.connections.length; });

studentSchema.set('toJSON',   { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

// ── Hooks & Methods ──────────────────────────────────────────────────
studentSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

studentSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

studentSchema.methods.enrollCourse = function ({ courseId, amountPaid, paymentId, paymentMethod }) {
  const alreadyEnrolled = this.enrolledCourses.some(ec => ec.course.toString() === courseId.toString());
  if (alreadyEnrolled) throw new Error('Already enrolled in this course');
  this.enrolledCourses.push({ course: courseId, amountPaid, paymentId, paymentMethod });
};
studentSchema.methods.enrollSession = function ({ sessionId, amountPaid, paymentId, paymentMethod }) {
  const alreadyEnrolled = this.enrolledSessions.some(es => es.session.toString() === sessionId.toString());
  if (alreadyEnrolled) throw new Error('Already enrolled in this session');
  this.enrolledSessions.push({ session: sessionId, amountPaid, paymentId, paymentMethod });
};
studentSchema.methods.isEnrolledInCourse = function (courseId) {
  return this.enrolledCourses.some(ec => ec.course.toString() === courseId.toString());
};
studentSchema.methods.isEnrolledInSession = function (sessionId) {
  return this.enrolledSessions.some(es => es.session.toString() === sessionId.toString());
};

const Student = mongoose.model("Student", studentSchema);
export default Student;