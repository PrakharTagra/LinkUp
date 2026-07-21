import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ── Sub-schemas ──────────────────────────────────────────────

const reviewSchema = new mongoose.Schema({
  student:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  rating:     { type: Number, min: 1, max: 5 },
  reviewText: { type: String, maxlength: 500 },
  date:       { type: Date, default: Date.now },
}, { _id: false });

const experienceSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  company:     { type: String, required: true },
  location:    { type: String },
  startDate:   { type: Date, required: true },
  endDate:     { type: Date },
  isCurrent:   { type: Boolean, default: false },
  description: { type: String, maxlength: 500 },
});

const connectionRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  receivedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
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

const projectSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  link: { type: String, default: "" },
  description: { type: String, default: "" },
  fileUrl: { type: String, default: "" },
  fileName: { type: String, default: "" },
  fileType: { type: String, default: "" },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

// ── Alumni Schema ────────────────────────────────────────────

const alumniSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "alumni" },
  avatar: { type: String, default: "" },
  coverPhoto: { type: String, default: "" },
  about: { type: String, default: "" },
  title: { type: String, default: "" },
  headline: { type: String, default: "" },
  skills: [String],
  certifications: [String],
  education: [educationSchema],
  projects: [projectSchema],
  college: { type: String, default: "" },
  company: { type: String, default: "" },
  tokens: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },

  domain: { type: String, default: "" },
  city: { type: String, default: "" },
  country: { type: String, default: "" },
  joiningYear: { type: Number },
  passingYear: { type: Number },
  degree: { type: String, default: "" },
  branch: { type: String, default: "" },
  alumniPlan: { type: String, enum: ["simple", "premium"], default: "simple" },
  alumniMembershipActive: { type: Boolean, default: false },
  alumniMembershipStartedAt: { type: Date, default: null },

  availability: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    startTime: { type: String },
    endTime: { type: String },
  }],
  sessionPricing: [{
    duration: { type: Number },
    price: { type: Number },
  }],

  stats: {
    totalSessionsHosted: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
  },

  reviews: [reviewSchema],
  experience: [experienceSchema],

  connectionRequests: [connectionRequestSchema],
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
}, { timestamps: true });

// ── Virtuals ─────────────────────────────────────────────────
alumniSchema.virtual('avgRating').get(function () {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, curr) => acc + curr.rating, 0);
  return (sum / this.reviews.length).toFixed(1);
});
alumniSchema.virtual('reviewCount').get(function () { return this.reviews ? this.reviews.length : 0; });
alumniSchema.virtual('connectionsCount').get(function () { return this.connections ? this.connections.length : 0; });

alumniSchema.set('toJSON',   { virtuals: true });
alumniSchema.set('toObject', { virtuals: true });

// ── Hooks & Methods ──────────────────────────────────────────────────
alumniSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

alumniSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Alumni = mongoose.model("Alumni", alumniSchema);
export default Alumni;