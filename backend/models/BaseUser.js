import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  role: {
    type: String,
    enum: ["student", "alumni", "admin"],
    default: "student",
  },

  avatar: String,
  coverPhoto: String,
  about: String,
  title: String, // professional title, e.g. "Software Engineer @ Google"
  headline: String,
  skills: [String],

  college: String,
  company: String,

  // Extra Alumni details
  domain: String,
  city: String,
  country: String,
  joiningYear: Number,
  passingYear: Number,
  degree: String,
  branch: String,

  alumniPlan: {
    type: String,
    enum: ["simple", "premium"],
    default: "simple",
  },

  tokens: { type: Number, default: 0 },

  isVerified: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },

  has24hReply: { type: Boolean, default: false },
  isCollegePartner: { type: Boolean, default: false },

}, { timestamps: true });

// 🔒 HASH PASSWORD PRE-SAVE
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 🔓 COMPARE PASSWORD
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const BaseUser = mongoose.model("BaseUser", userSchema);

export default BaseUser;