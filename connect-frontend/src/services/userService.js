import API from "../utils/api";

// 👤 Get current user
export async function getCurrentUser() {
  const res = await API.get("/auth/me");
  return res.data;
}


// ✏️ Update user profile
export async function updateUserProfile(updatedData) {
  const res = await API.put("/users/profile", updatedData);
  return res.data;
}

// 🤝 Get all alumni (for networking)
export async function getAlumni(params = {}) {
  const res = await API.get("/users/alumni", { params });
  return res.data;
}

// 🔍 Get single user by ID
export async function getUserById(id) {
  const res = await API.get(`/users/${id}`);
  return res.data;
}
