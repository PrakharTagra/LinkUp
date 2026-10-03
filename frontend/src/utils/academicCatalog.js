import API from "./api";

export const DEFAULT_COURSES = [];
export const DEFAULT_SESSIONS = [];
export const DEFAULT_ALUMNI_ITEMS = [];

const STORE_KEY = "__connectAcademicCatalog";

function getStore() {
  const root = typeof window !== "undefined" ? window : globalThis;
  if (!root[STORE_KEY]) {
    root[STORE_KEY] = {
      alumniItems: [],
    };
  }
  return root[STORE_KEY];
}

export function getAlumniItems() {
  return (getStore().alumniItems || []).map(item => ({
    ...item,
    outcomes: item.outcomes ? [...item.outcomes] : item.outcomes,
    syllabus: item.syllabus ? item.syllabus.map(row => ({ ...row })) : item.syllabus,
    videos: item.videos ? item.videos.map(video => ({ ...video })) : item.videos,
  }));
}

export function setAlumniItems(items) {
  getStore().alumniItems = (items || []).map(item => ({
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
    courses: alumniItems.filter(item => item.type === "course").map(item => ({ ...item })),
    sessions: alumniItems.filter(item => item.type === "session" || item.type === "workshop").map(item => ({ ...item })),
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
