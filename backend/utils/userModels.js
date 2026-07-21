import Student from "../models/Student.js";
import Alumni from "../models/Alumni.js";
import Admin from "../models/Admin.js";

const models = {
  student: Student,
  alumni: Alumni,
  admin: Admin,
};

const selectUser = (query, includePassword) => {
  return includePassword ? query : query.select("-password");
};

export const getUserModelByRole = (role) => {
  return models[role] || null;
};

export const findUserById = async (id, { includePassword = false } = {}) => {
  return (
    (await selectUser(Student.findById(id), includePassword)) ||
    (await selectUser(Alumni.findById(id), includePassword)) ||
    (await selectUser(Admin.findById(id), includePassword))
  );
};

export const findUserByEmail = async (email, { includePassword = false } = {}) => {
  return (
    (await selectUser(Student.findOne({ email }), includePassword)) ||
    (await selectUser(Alumni.findOne({ email }), includePassword)) ||
    (await selectUser(Admin.findOne({ email }), includePassword))
  );
};

export const updateUserById = async (id, updates) => {
  const user = await findUserById(id);

  if (!user) {
    return null;
  }

  Object.assign(user, updates);
  await user.save();
  return user;
};

export const deleteUserById = async (id) => {
  const user = await findUserById(id);

  if (!user) {
    return null;
  }

  await user.deleteOne();
  return user;
};

export const countAllUsers = async () => {
  const [students, alumni, admins] = await Promise.all([
    Student.countDocuments(),
    Alumni.countDocuments(),
    Admin.countDocuments(),
  ]);

  return students + alumni + admins;
};

export const countVerifiedUsers = async () => {
  const [students, alumni, admins] = await Promise.all([
    Student.countDocuments({ isVerified: true }),
    Alumni.countDocuments({ isVerified: true }),
    Admin.countDocuments({ isVerified: true }),
  ]);

  return students + alumni + admins;
};

export const countPremiumUsers = async () => {
  return Alumni.countDocuments({ alumniPlan: "premium" });
};
