import axios from "axios";

const ML_API_BASE = import.meta.env.VITE_ML_API_URL || "http://127.0.0.1:8001";

const ML_API = axios.create({
  baseURL: ML_API_BASE,
});

export const predictCareerPaths = async ({ skills, interests, domain, topN = 6 }) => {
  const payload = {
    student_skills: skills,
    student_interests: interests,
    top_n: topN,
  };

  if (domain && domain !== "All Domains") {
    payload.target_domain = domain;
  }

  const res = await ML_API.post("/predict", payload);
  return res.data;
};

export const getDomains = async () => {
  const res = await ML_API.get("/domains");
  return res.data;
};