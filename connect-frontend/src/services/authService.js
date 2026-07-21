import API from "../utils/api";

// 🔑 Login
export async function loginUser({ email, password, role }) {
  const res = await API.post("/auth/login", { email, password, role });
  return res.data;
}

// 📝 Signup
export async function signupUser(payload) {
  const res = await API.post("/auth/signup", payload);
  return res.data;
}

// 🚪 Logout
export async function logoutUser() {
  const res = await API.post("/auth/logout");
  return res.data;
}

// 🌐 Google Login
export async function googleAuth(payload) {
  const res = await API.post("/auth/google", payload);
  return res.data;
}
