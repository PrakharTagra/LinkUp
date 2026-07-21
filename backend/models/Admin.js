import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  avatar: { type: String, default: "" },
  coverPhoto: { type: String, default: "" },
  about: { type: String, default: "" },
  title: { type: String, default: "" },
  headline: { type: String, default: "" },
  skills: [String],
  college: { type: String, default: "" },
  company: { type: String, default: "" },
  tokens: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },

  dashboardAccess: {
    type: Boolean,
    default: true,
  },
  // Sub-admins vs super-admins
  permissions: [{
    type: String,
    enum: ['manage_users', 'manage_posts', 'manage_courses', 'manage_reports'],
  }],
}, { timestamps: true });

// ── Hooks & Methods ──────────────────────────────────────────────────
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;