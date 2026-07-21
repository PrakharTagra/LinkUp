import courseThumbnail from "../assets/hero.png";
import API from "./api";

export const DEFAULT_COURSES = [
  {
    id: 1,
    title: "Crack FAANG Interviews",
    instructor: "Rahul Sharma (Google)",
    description: "Complete DSA + System Design roadmap. 120+ problems, 10 mock interviews, placement strategy.",
    price: 1999,
    originalPrice: 2999,
    rating: 4.8,
    students: 1240,
    isCollegePartner: true,
  },
  {
    id: 2,
    title: "Frontend Mastery",
    instructor: "Ananya Verma (Amazon)",
    description: "React, Tailwind, Next.js with 5 real-world projects and code reviews from an FAANG engineer.",
    price: 1499,
    originalPrice: 2199,
    rating: 4.7,
    students: 840,
    isCollegePartner: false,
  },
  {
    id: 3,
    title: "Data Science Zero to Hero",
    instructor: "Aman Gupta (Microsoft)",
    description: "Python, ML, Deep Learning, and career guidance from a senior data scientist at Microsoft.",
    price: 2299,
    originalPrice: 3499,
    rating: 4.9,
    students: 2100,
    isCollegePartner: true,
  },
  {
    id: 4,
    title: "Firebase",
    instructor: "Prakhar Tagra (Google)",
    description: "In this course students will learn about Firebase.",
    price: 498,
    originalPrice: 999,
    rating: 4.9,
    students: 540,
    isCollegePartner: true,
    syllabus: [
      { 
        week: "Lecture 1", topic: "What is Firebase & Setup", 
        video: { url: "https://www.youtube.com/embed/O17OWywmsHE", duration: "12:45" } 
      },
      { 
        week: "Lecture 2", topic: "Firebase Authentication", 
        video: { url: "https://www.youtube.com/embed/8sGY55yxicA", duration: "15:20" } 
      },
      { 
        week: "Lecture 3", topic: "Cloud Firestore Real-time Database", 
        video: { url: "https://www.youtube.com/embed/QcsAb2RR52c", duration: "18:10" } 
      },
      { 
        week: "Lecture 4", topic: "Cloud Storage for Firebase", 
        video: { url: "https://www.youtube.com/embed/SpxHVrpfGgU", duration: "14:30" } 
      },
      { 
        week: "Lecture 5", topic: "Cloud Functions", 
        video: { url: "https://www.youtube.com/embed/vr0Gfvp5v1A", duration: "10:15" } 
      },
      { 
        week: "Lecture 6", topic: "Firebase Hosting & Deployment", 
        video: { url: "https://www.youtube.com/embed/jsRVHeQd5kU", duration: "08:45" } 
      }
    ],
    assignments: [
      { title: "Assignment 1: Data Modeling", description: "Design a Firestore schema for a Social Media app, including Users, Posts, and Comments collections.", dueDate: "2026-05-10", marks: 100 },
      { title: "Assignment 2: Auth Integration", description: "Implement Google and Email/Password sign-in using Firebase Authentication.", dueDate: "2026-05-15", marks: 100 },
      { title: "Assignment 3: Cloud Triggers", description: "Create a Cloud Function that automatically sends a welcome email on new user signup.", dueDate: "2026-05-20", marks: 100 }
    ]
  },
];

export const DEFAULT_SESSIONS = [
  {
    id: 1,
    title: "System Design Live Session",
    instructor: "Rahul Sharma (Google)",
    description: "Learn HLD + LLD with real-world examples. Covers Netflix, Uber, WhatsApp architectures.",
    date: "2026-04-25",
    time: "18:00",
    price: 999,
    seatsLeft: 5,
    isLive: false,
    scheduledAt: "2026-04-25T18:00:00",
  },
  {
    id: 2,
    title: "React Workshop – Build & Deploy",
    instructor: "Ananya Verma (Amazon)",
    description: "3-hour hands-on workshop. Build a full-stack React app with CI/CD, deploy to production.",
    date: "2026-04-28",
    time: "19:00",
    price: 799,
    seatsLeft: 0,
    isLive: false,
    scheduledAt: "2026-04-28T19:00:00",
  },
  {
    id: 3,
    title: "Breaking into Data Science",
    instructor: "Aman Gupta (Microsoft)",
    description: "No-fluff guide. What recruiters actually look for, portfolio tips, and live Q&A.",
    date: "2026-04-30",
    time: "17:00",
    price: 499,
    seatsLeft: 18,
    isLive: false,
    scheduledAt: "2026-04-30T17:00:00",
  },
];

export const DEFAULT_ALUMNI_ITEMS = [
  {
    id: 1,
    title: "System Design Live Session",
    description: "Learn HLD + LLD with real-world examples",
    date: "2026-04-25",
    time: "18:00",
    duration: "2 hours",
    price: 999,
    seatsLeft: 5,
    totalSeats: 20,
    enrolled: 15,
    isLive: false,
    type: "session",
    thumbnail: courseThumbnail,
    thumbnailFit: "contain",
    thumbnailRatio: "16 / 9",
    scheduledAt: "2026-04-25T18:00:00",
    videos: [],
  },
  {
    id: 2,
    title: "React Workshop – Build & Deploy",
    description: "3-hour hands-on workshop with deployment",
    date: "2026-04-28",
    time: "19:00",
    duration: "3 hours",
    price: 799,
    seatsLeft: 0,
    totalSeats: 15,
    enrolled: 15,
    isLive: false,
    type: "workshop",
    thumbnail: courseThumbnail,
    thumbnailFit: "contain",
    thumbnailRatio: "16 / 9",
    scheduledAt: "2026-04-28T19:00:00",
    videos: [],
  },
  {
    id: 3,
    title: "Full Stack Web Development",
    description: "Complete MERN stack course from beginner to advanced",
    duration: "8 weeks",
    price: 4999,
    totalSeats: 50,
    enrolled: 32,
    seatsLeft: 18,
    isLive: false,
    type: "course",
    thumbnail: courseThumbnail,
    thumbnailFit: "contain",
    thumbnailRatio: "16 / 9",
    instructor: "Rahul Sharma",
    level: "Beginner to Advanced",
    outcomes: ["Build full-stack apps", "Deploy on AWS", "REST API design", "React & Node.js"],
    syllabus: [
      { week: "Week 1-2", topic: "HTML, CSS & JavaScript Fundamentals", video: null },
      { week: "Week 3-4", topic: "React.js – Components, Hooks, Routing", video: null },
      { week: "Week 5-6", topic: "Node.js & Express – REST APIs", video: null },
      { week: "Week 7-8", topic: "MongoDB, Deployment & Project", video: null },
    ],
  },
];

const STORE_KEY = "__connectAcademicCatalog";

function getStore() {
  const root = typeof window !== "undefined" ? window : globalThis;
  if (!root[STORE_KEY]) {
    root[STORE_KEY] = {
      alumniItems: DEFAULT_ALUMNI_ITEMS.map(item => ({ ...item })),
    };
  }
  return root[STORE_KEY];
}

export function getAlumniItems() {
  return getStore().alumniItems.map(item => ({
    ...item,
    outcomes: item.outcomes ? [...item.outcomes] : item.outcomes,
    syllabus: item.syllabus ? item.syllabus.map(row => ({ ...row })) : item.syllabus,
    videos: item.videos ? item.videos.map(video => ({ ...video })) : item.videos,
  }));
}

export function setAlumniItems(items) {
  getStore().alumniItems = items.map(item => ({
    ...item,
    outcomes: item.outcomes ? [...item.outcomes] : item.outcomes,
    syllabus: item.syllabus ? item.syllabus.map(row => ({ ...row })) : item.syllabus,
    videos: item.videos ? item.videos.map(video => ({ ...video })) : item.videos,
  }));
}

export function upsertAlumniItem(nextItem) {
  const items = getAlumniItems();
  const index = items.findIndex(item => item.id === nextItem.id);

  if (index >= 0) {
    items[index] = nextItem;
  } else {
    items.unshift(nextItem);
  }

  setAlumniItems(items);
  return items;
}

export function removeAlumniItem(itemId) {
  const items = getAlumniItems().filter(item => item.id !== itemId);
  setAlumniItems(items);
  return items;
}

const ENROLLMENT_KEY = "__connectEnrollments";

function getEnrollmentStore() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(ENROLLMENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function setEnrollmentStore(items) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ENROLLMENT_KEY, JSON.stringify(items));
}

export function getAcademicItemKey(item) {
  if (!item) return "";
  const type = item.type || "course";
  return `${type}:${item.id ?? item.title}`;
}

function resolveAcademicType(item) {
  const explicitType = String(item?.type || "").toLowerCase();
  if (explicitType.includes("course")) return "course";
  if (explicitType.includes("session") || explicitType.includes("workshop")) return "session";

  if (Array.isArray(item?.syllabus) || Array.isArray(item?.assignments)) return "course";
  if (item?.date || item?.time || item?.scheduledAt) return "session";

  // Default to course to avoid hitting session enrollment for course cards missing type.
  return "course";
}

export async function enrollAcademicItem(item, paymentDetails = {}) {
  if (!item) return;
  const itemId = item._id || item.id;
  if (!itemId) {
    throw new Error("Missing academic item id for enrollment");
  }

  const type = resolveAcademicType(item) === "course" ? "courses" : "sessions";

  try {
    const res = await API.post(`/${type}/${itemId}/enroll`, {
      paymentMethod: paymentDetails.method || "upi",
      amountPaid: item.price,
      paymentId: paymentDetails.id || `PAY-${Math.random().toString(16).slice(2).toUpperCase()}`
    });
    return res.data;
  } catch (err) {
    console.error("Enrollment failed", err);
    throw err;
  }
}

export function getEnrolledAcademicItems() {
  return getEnrollmentStore();
}

export function isAcademicItemEnrolled(item, user) {
  if (!item || !user) return false;
  
  const itemId = (item.id || item._id)?.toString();
  if (!itemId) return false;

  const isCourse = resolveAcademicType(item) === "course";
  
  if (isCourse) {
    return (user.enrolledCourses || []).some(ec => {
      const cid = (ec.course?._id || ec.course)?.toString();
      return cid === itemId;
    });
  } else {
    return (user.enrolledSessions || []).some(es => {
      const sid = (es.session?._id || es.session)?.toString();
      return sid === itemId;
    });
  }
}

export function getThumbnailStyle(item) {
  const ratio = item?.thumbnailRatio || "16 / 9";
  const fit = item?.thumbnailFit || "contain";

  return {
    ratio,
    fit,
  };
}

export function getStudentCatalog() {
  const alumniItems = getAlumniItems();

  return {
    courses: [
      ...DEFAULT_COURSES,
      ...alumniItems.filter(item => item.type === "course").map(item => ({ ...item })),
    ],
    sessions: [
      ...DEFAULT_SESSIONS,
      ...alumniItems.filter(item => item.type === "session" || item.type === "workshop").map(item => ({ ...item })),
    ],
  };
}

export function createVideoEntry(file) {
  return {
    id: `${file.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: file.name,
    url: URL.createObjectURL(file),
    type: file.type || "video/mp4",
  };
}

export function combineDateTime(date, time) {
  if (!date || !time) return "";
  const safeTime = time.length === 5 ? `${time}:00` : time;
  return `${date}T${safeTime}`;
}

export function isItemLive(item) {
  if (item?.isLive) return true;
  if (!item?.scheduledAt) return false;
  return new Date(item.scheduledAt).getTime() <= Date.now();
}

export function formatAcademicDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
