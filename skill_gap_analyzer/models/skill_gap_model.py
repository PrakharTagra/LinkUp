"""
Skill Gap Analyzer core model.
Domain-aware analysis based on postings.csv and portal resources.
"""

from __future__ import annotations

import re
from collections import Counter, defaultdict
from typing import Dict, List

import pandas as pd


SKILL_ALIASES = {
    "react": "React.js",
    "reactjs": "React.js",
    "react.js": "React.js",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "express": "Express.js",
    "expressjs": "Express.js",
    "express.js": "Express.js",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "html5": "HTML",
    "html": "HTML",
    "css3": "CSS",
    "css": "CSS",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mysql": "SQL",
    "sql": "SQL",
    "python3": "Python",
    "python": "Python",
    "tensorflow": "TensorFlow",
    "tf": "TensorFlow",
    "pytorch": "PyTorch",
    "torch": "PyTorch",
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "nlp": "NLP",
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "GCP",
    "google cloud": "GCP",
    "azure": "Azure",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "docker": "Docker",
    "git": "Git",
    "github": "Git",
    "figma": "Figma",
    "adobe xd": "Adobe XD",
    "dsa": "DSA",
    "data structures": "DSA",
    "algorithms": "DSA",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "leadership": "Leadership",
    "teamwork": "Teamwork",
    "communication": "Communication",
    "agile": "Agile",
    "firebase": "Firebase",
    "java": "Java",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "rest api": "REST API",
    "restful": "REST API",
    "system design": "System Design",
    "kotlin": "Kotlin",
    "swift": "Swift",
    "go": "Go",
    "golang": "Go",
    "redis": "Redis",
    "kafka": "Kafka",
    "tableau": "Tableau",
    "power bi": "Power BI",
    "excel": "Excel",
    "seo": "SEO",
    "sem": "SEM",
    "content marketing": "Content Marketing",
    "salesforce": "Salesforce",
    "hr": "HR",
    "recruitment": "Recruitment",
}

DOMAIN_KEYWORDS = {
    "Software Engineering": ["software", "developer", "engineer", "backend", "frontend", "full stack", "api"],
    "Data & AI": ["data", "machine learning", "ml", "ai", "analytics", "scientist", "analyst", "etl"],
    "DevOps & Cloud": ["devops", "cloud", "sre", "platform", "infrastructure", "aws", "kubernetes", "docker"],
    "Product Management": ["product manager", "product management", "roadmap", "stakeholder", "scrum"],
    "Design": ["design", "ui", "ux", "figma", "prototype"],
    "Marketing": ["marketing", "seo", "sem", "campaign", "content"],
    "Finance": ["finance", "accounting", "financial", "audit", "risk"],
    "Human Resources": ["human resources", "hr", "recruiter", "talent", "people operations"],
    "Sales & Business Development": ["sales", "business development", "account executive", "lead generation"],
    "Cybersecurity": ["security", "cyber", "soc", "penetration", "infosec"],
}


def normalize_skill(skill: str) -> str:
    cleaned = str(skill or "").strip().lower()
    if not cleaned:
        return ""
    return SKILL_ALIASES.get(cleaned, str(skill).strip())


def normalize_skills_list(skills: List[str]) -> List[str]:
    values = [normalize_skill(s) for s in (skills or [])]
    return sorted({v for v in values if v})


def classify_domain(text: str) -> str:
    candidate = str(text or "").lower()
    scores = {}
    for domain, keywords in DOMAIN_KEYWORDS.items():
        score = sum(1 for k in keywords if k in candidate)
        if score > 0:
            scores[domain] = score
    if not scores:
        return "Software Engineering"
    return max(scores, key=scores.get)


class JobPostingsProcessor:
    def __init__(self, csv_path: str, max_rows: int | None = None):
        usecols = ["title", "description", "skills_desc", "required_skills", "posting_domain"]
        read_args = {
            "low_memory": False,
            "usecols": lambda c: c in usecols,
        }
        if max_rows and max_rows > 0:
            read_args["nrows"] = max_rows

        self.df = pd.read_csv(csv_path, **read_args)
        self.skill_freq = Counter()
        self.domain_skill_freq = defaultdict(Counter)
        self.role_skill_freq = defaultdict(Counter)
        self.domain_role_skill_freq = defaultdict(lambda: defaultdict(Counter))
        self.domain_counts = Counter()
        self._process()

    def _extract_skills(self, title: str, description: str, skills_desc: str, required_skills: str) -> List[str]:
        text_chunks = [title or "", skills_desc or ""]

        raw_required = str(required_skills or "")
        if raw_required and raw_required.lower() != "nan":
            text_chunks.extend(raw_required.split(","))

        if description:
            text_chunks.append(description)

        full_text = " ".join(text_chunks).lower()
        extracted = []
        for alias, canonical in SKILL_ALIASES.items():
            if alias in full_text:
                extracted.append(canonical)

        return sorted(set(extracted))

    def _process(self) -> None:
        parsed_skills_col = []
        domains_col = []

        for row in self.df.itertuples(index=False):
            title = str(getattr(row, "title", "") or "")
            description = str(getattr(row, "description", "") or "")
            skills_desc = str(getattr(row, "skills_desc", "") or "")
            required_skills = str(getattr(row, "required_skills", "") or "")

            parsed = self._extract_skills(title, description, skills_desc, required_skills)
            parsed_skills_col.append(parsed)
            domains_col.append(classify_domain(f"{title} {description}"))

        self.df["parsed_skills"] = parsed_skills_col
        self.df["career_domain"] = domains_col

        for _, row in self.df.iterrows():
            role = str(row.get("title", "General")).strip() or "General"
            domain = str(row.get("career_domain", "Software Engineering"))
            self.domain_counts[domain] += 1

            for skill in row.get("parsed_skills", []):
                self.skill_freq[skill] += 1
                self.domain_skill_freq[domain][skill] += 1
                self.role_skill_freq[role][skill] += 1
                self.domain_role_skill_freq[domain][role][skill] += 1

    def get_domains(self, n: int = 12) -> List[Dict]:
        return [
            {"domain": domain, "postings_count": count}
            for domain, count in self.domain_counts.most_common(n)
        ]

    def get_top_skills(self, n: int = 20) -> List[str]:
        return [skill for skill, _ in self.skill_freq.most_common(n)]

    def get_top_skills_for_domain(self, domain: str, n: int = 20) -> List[str]:
        domain_counter = self.domain_skill_freq.get(domain)
        if not domain_counter:
            return self.get_top_skills(n)
        return [skill for skill, _ in domain_counter.most_common(n)]

    def get_domain_skill_frequency(self, domain: str, n: int = 20) -> Dict[str, int]:
        domain_counter = self.domain_skill_freq.get(domain)
        if not domain_counter:
            return dict(self.skill_freq.most_common(n))
        return dict(domain_counter.most_common(n))

    def get_matching_roles(self, student_skills: List[str], top_n: int = 5, domains: List[str] | None = None) -> List[Dict]:
        student_set = set(student_skills)
        role_counter = defaultdict(Counter)
        if domains:
            for domain in domains:
                for role, skills in self.domain_role_skill_freq.get(domain, {}).items():
                    role_counter[role].update(skills)

        if not role_counter:
            for role, skills in self.role_skill_freq.items():
                role_counter[role].update(skills)

        results = []
        for role, skill_counts in role_counter.items():
            role_skills = set(skill_counts.keys())
            if not role_skills:
                continue
            overlap = student_set.intersection(role_skills)
            score = round((len(overlap) / max(len(role_skills), 1)) * 100, 1)
            results.append(
                {
                    "role": role,
                    "match_score": score,
                    "matching_skills": sorted(overlap),
                    "missing_skills": sorted(role_skills - student_set),
                }
            )

        results.sort(key=lambda x: x["match_score"], reverse=True)
        return results[:top_n]


class PortalContentMapper:
    def __init__(self, portal_data: Dict):
        self.courses = portal_data.get("courses", [])
        self.sessions = portal_data.get("sessions", [])
        self.workshops = portal_data.get("workshops", [])
        self.alumni = portal_data.get("alumnis", [])
        self.skill_to_courses = defaultdict(list)
        self.skill_to_sessions = defaultdict(list)
        self.skill_to_workshops = defaultdict(list)
        self.skill_to_alumni = defaultdict(list)
        self._build_skill_index()

    def _extract_item_skills(self, item: Dict) -> List[str]:
        text = " ".join(
            [
                str(item.get("title", "")),
                str(item.get("description", "")),
                " ".join([str(t) for t in item.get("tags", [])]),
            ]
        ).lower()

        found = []
        for alias, canonical in SKILL_ALIASES.items():
            if re.search(r"\b" + re.escape(alias) + r"\b", text):
                found.append(canonical)
        return sorted(set(found))

    def _build_skill_index(self) -> None:
        for course in self.courses:
            for skill in self._extract_item_skills(course):
                self.skill_to_courses[skill].append(course)

        for session in self.sessions:
            session_type = str(session.get("type", "session")).lower()
            target = self.skill_to_workshops if session_type == "workshop" else self.skill_to_sessions
            for skill in self._extract_item_skills(session):
                target[skill].append(session)

        for item in self.workshops:
            for skill in self._extract_item_skills(item):
                self.skill_to_workshops[skill].append(item)

        for alum in self.alumni:
            alum_skills = normalize_skills_list(alum.get("skills", []))
            for skill in alum_skills:
                self.skill_to_alumni[skill].append(
                    {
                        "id": str(alum.get("_id", "")),
                        "name": alum.get("name", ""),
                        "company": alum.get("company", ""),
                        "domain": alum.get("domain", ""),
                        "skills": alum_skills,
                    }
                )

    def _limit_unique(self, items: List[Dict], key: str = "id", max_items: int = 6) -> List[Dict]:
        seen = set()
        out = []
        for item in items:
            val = item.get(key) or item.get("_id") or item.get("title")
            if val in seen:
                continue
            seen.add(val)
            out.append(item)
            if len(out) >= max_items:
                break
        return out

    def get_domain_alumni(self, domains: List[str], skills: List[str]) -> List[Dict]:
        domain_set = {d.lower() for d in domains}
        ranked = []
        for alum in self.alumni:
            alum_domain = str(alum.get("domain", "")).lower()
            alum_skills = normalize_skills_list(alum.get("skills", []))
            match_skill_count = len(set(alum_skills).intersection(skills))
            domain_match = any(d in alum_domain for d in domain_set) if domain_set else False
            if domain_match or match_skill_count > 0:
                ranked.append(
                    {
                        "id": str(alum.get("_id", "")),
                        "name": alum.get("name", ""),
                        "company": alum.get("company", ""),
                        "domain": alum.get("domain", ""),
                        "skills": alum_skills,
                        "match_score": match_skill_count + (3 if domain_match else 0),
                    }
                )
        ranked.sort(key=lambda x: x["match_score"], reverse=True)
        return self._limit_unique(ranked, key="id", max_items=8)

    def get_resources_for_gap_skills(self, gap_skills: List[str]) -> Dict:
        courses = []
        sessions = []
        workshops = []

        for skill in gap_skills:
            for c in self.skill_to_courses.get(skill, []):
                courses.append(
                    {
                        "id": str(c.get("_id", "")),
                        "title": c.get("title", ""),
                        "price": c.get("price", 0),
                        "level": c.get("level", ""),
                        "skill": skill,
                    }
                )
            for s in self.skill_to_sessions.get(skill, []):
                sessions.append(
                    {
                        "id": str(s.get("_id", "")),
                        "title": s.get("title", ""),
                        "type": s.get("type", "session"),
                        "date": s.get("date"),
                        "skill": skill,
                    }
                )
            for w in self.skill_to_workshops.get(skill, []):
                workshops.append(
                    {
                        "id": str(w.get("_id", "")),
                        "title": w.get("title", ""),
                        "type": w.get("type", "workshop"),
                        "date": w.get("date"),
                        "skill": skill,
                    }
                )

        return {
            "courses": self._limit_unique(courses, key="id", max_items=8),
            "sessions": self._limit_unique(sessions, key="id", max_items=8),
            "workshops": self._limit_unique(workshops, key="id", max_items=8),
        }


class SkillGapAnalyzer:
    def __init__(self, job_csv_path: str, portal_data: Dict, max_postings_rows: int | None = None):
        print("Loading job postings...")
        self.job_processor = JobPostingsProcessor(job_csv_path, max_rows=max_postings_rows)
        print(f"Loaded {len(self.job_processor.df)} job postings")
        print("Indexing portal content...")
        self.portal_mapper = PortalContentMapper(portal_data)
        print("Portal content indexed")

    def get_domains(self, n: int = 12) -> List[Dict]:
        return self.job_processor.get_domains(n)

    def analyze(self, student: Dict, target_domains: List[str] | None = None) -> Dict:
        student_skills = normalize_skills_list(student.get("skills", []))
        domains = [d for d in (target_domains or []) if d]
        if not domains:
            domains = ["Software Engineering"]

        domain_insights = []
        all_required = set()
        aggregate_frequency = Counter()

        for domain in domains:
            required = self.job_processor.get_top_skills_for_domain(domain, n=18)
            freq = self.job_processor.get_domain_skill_frequency(domain, n=18)
            matched = sorted(set(required).intersection(student_skills))
            gaps = sorted(set(required) - set(student_skills))

            domain_insights.append(
                {
                    "domain": domain,
                    "required_skills": required,
                    "required_skill_frequency": freq,
                    "matched_skills": matched,
                    "gap_skills": gaps,
                }
            )

            all_required.update(required)
            aggregate_frequency.update(freq)

        market_aligned = sorted(set(student_skills).intersection(all_required))
        gap_skills = sorted(all_required - set(student_skills), key=lambda s: aggregate_frequency.get(s, 0), reverse=True)
        priority_gaps = gap_skills[:12]

        role_matches = self.job_processor.get_matching_roles(student_skills, top_n=5, domains=domains)
        resources = self.portal_mapper.get_resources_for_gap_skills(priority_gaps)
        alumni = self.portal_mapper.get_domain_alumni(domains, priority_gaps)

        readiness = round((len(market_aligned) / max(len(all_required), 1)) * 100, 1)

        summary = {
            "target_domains": domains,
            "readiness_score": readiness,
            "matched_skills_count": len(market_aligned),
            "required_skills_count": len(all_required),
            "top_gap_skills": priority_gaps[:5],
            "recommended_role": role_matches[0]["role"] if role_matches else None,
            "best_role_match_score": role_matches[0]["match_score"] if role_matches else 0,
            "student_has_skills": student_skills,
        }

        return {
            "student": {
                "name": student.get("name", "Student"),
                "email": student.get("email", ""),
                "branch": student.get("branch", ""),
                "year": student.get("year", 1),
                "current_skills": student_skills,
                "enrolled_courses_count": len(student.get("enrolledCourses", [])),
                "enrolled_sessions_count": len(student.get("enrolledSessions", [])),
            },
            "summary": summary,
            "domain_insights": domain_insights,
            "skill_analysis": {
                "skills_you_have": student_skills,
                "market_aligned_skills": market_aligned,
                "skill_gaps": priority_gaps,
                "readiness_score": readiness,
            },
            "role_matches": role_matches,
            "recommended_resources": resources,
            "recommended_alumni": alumni,
        }
