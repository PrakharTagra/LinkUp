import API from "../utils/api";

export async function getSkillGapDomains() {
  const res = await API.get("/skill-gap/domains");
  return res.data?.domains || [];
}

export async function getSkillGapMyProfile() {
  const res = await API.get("/skill-gap/my-profile");
  return res.data?.student || null;
}

export async function analyzeSkillGapForDomains(domains = []) {
  const res = await API.post("/skill-gap/analyze", { domains });
  return res.data;
}
