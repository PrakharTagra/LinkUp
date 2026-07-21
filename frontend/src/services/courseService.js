import API from "../utils/api";

// 📚 Get all courses
export async function getCourses() {
  const res = await API.get("/courses");
  return res.data;
}

// 🎥 Get all sessions (live workshops)
export async function getSessions() {
  const res = await API.get("/sessions");
  return res.data;
}

// 📄 Get single course by ID
export async function getCourseById(id) {
  const res = await API.get(`/courses/${id}`);
  return res.data;
}

// 💰 Enroll in course
export async function enrollCourse(courseId) {
  const res = await API.post(`/courses/${courseId}/enroll`);
  return res.data;
}