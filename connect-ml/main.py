import os
import re
import time
import threading
import gc
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime
from collections import Counter

os.environ["OMP_NUM_THREADS"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import torch
torch.set_num_threads(1)
torch.set_grad_enabled(False)

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Skill Gap imports
from skill_gap_model import SkillGapAnalyzer
from db_client import ConnectDBClient

app = FastAPI(
    title="LinkUp Unified ML & Skill Gap Service",
    description="Career Path Recommendation & Skill Gap Analysis for LinkUp Platform",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

START_TIME = time.time()
BASE_DIR = Path(__file__).resolve().parent

# ── Load Career Path Model & Dataset ───────────────────────────────────────
print("Loading Career Path model and dataset...")
model = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")

jobs_csv_path = BASE_DIR / "data" / "processed" / "jobs_production.csv"
embeddings_path = BASE_DIR / "models" / "job_embeddings_production.npy"

df = pd.read_csv(jobs_csv_path)
if "skills_required" not in df.columns:
    df["skills_required"] = df.get("skills_list", "").fillna("")
else:
    df["skills_required"] = df["skills_required"].fillna(df.get("skills_list", "")).fillna("")

embeddings = np.load(embeddings_path)
print(f"Ready: {len(df)} production jobs and embeddings loaded.")

VALID_DOMAINS = [
    "Software Engineering",
    "Data & AI",
    "Product Management",
    "Design",
    "Finance",
    "Marketing",
    "Human Resources",
    "Sales & Business Development"
]

ROADMAP_STAGES = [
    "Foundations",
    "Core Build",
    "Applied Projects",
    "Job Ready",
    "Advanced Growth",
]

# ── Skill Gap Analyzer Initialization ──────────────────────────────────────
print("Initializing Skill Gap Analyzer with production dataset...")
default_postings_csv = jobs_csv_path
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "test")

portal_data = {"courses": [], "sessions": [], "workshops": [], "alumnis": []}
if MONGO_URI:
    try:
        db_client = ConnectDBClient(MONGO_URI, DB_NAME)
        portal_data = db_client.get_portal_data()
        db_client.close()
        print(f"Skill Gap: Connected to live MongoDB ({DB_NAME})")
    except Exception as e:
        print(f"Skill Gap DB Notice: {e}. Live portal content will sync on request.")

skill_analyzer = SkillGapAnalyzer(str(default_postings_csv), portal_data, max_postings_rows=15058)
print("Skill Gap Analyzer ready.")

gc.collect()

# ── Helper Functions ───────────────────────────────────────────────────────
def clean_title(title: str) -> str:
    title = re.sub(r"\s+\d+$", "", str(title).strip())
    title = re.sub(r"\s+(Ii|Iii|Iv|Vi|Vii)$", "", title.strip())
    return title.strip()

def tokenize_skill_text(raw_text: str) -> list[str]:
    if not isinstance(raw_text, str) or not raw_text.strip():
        return []
    parts = [
        p.strip().lower()
        for p in re.split(r"[,|;/\\]", raw_text)
        if p and p.strip()
    ]
    deduped = []
    seen = set()
    for token in parts:
        if token not in seen:
            deduped.append(token)
            seen.add(token)
    return deduped

def build_roadmap(
    readiness_percent: float,
    job_skills: set[str],
    matched_skills: list[str],
    similarity_score: float,
) -> tuple[list[dict[str, float | str]], int]:
    roadmap = []
    ordered_skills = sorted(job_skills)
    stage_count = len(ROADMAP_STAGES)
    stage_skill_groups = [ordered_skills[idx::stage_count] for idx in range(stage_count)]

    matched_set = set(matched_skills)
    cumulative_required = 0
    cumulative_matched = 0
    role_complexity = max(0.85, min(1.6, len(ordered_skills) / 6))
    stage_difficulty = [0.88, 0.96, 1.04, 1.14, 1.24]

    for idx, stage in enumerate(ROADMAP_STAGES):
        group = stage_skill_groups[idx]
        required_in_stage = len(group)
        matched_in_stage = sum(1 for s in group if s in matched_set)

        cumulative_required += required_in_stage
        cumulative_matched += matched_in_stage

        cumulative_coverage = (cumulative_matched / max(cumulative_required, 1)) * 100
        stage_coverage = (matched_in_stage / max(required_in_stage, 1)) * 100
        progression_bonus = ((idx + 1) / stage_count) * 6

        blended_signal = (
            (stage_coverage * 0.45)
            + (cumulative_coverage * 0.25)
            + (similarity_score * 0.30)
        )

        stage_readiness = round(
            min(
                100,
                max(
                    3,
                    (blended_signal / (role_complexity * stage_difficulty[idx])) + progression_bonus,
                ),
            ),
            1,
        )

        roadmap.append({
            "stage": stage,
            "stage_index": idx,
            "readiness": stage_readiness,
        })

    if readiness_percent >= 80:
        stage_idx = 4
    elif readiness_percent >= 60:
        stage_idx = 3
    elif readiness_percent >= 40:
        stage_idx = 2
    elif readiness_percent >= 20:
        stage_idx = 1
    else:
        stage_idx = 0
    return roadmap, stage_idx

# ── Schemas ────────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    student_skills: str = ""
    student_interests: str = ""
    target_domain: Optional[str] = None
    top_n: int = 6

class CareerPath(BaseModel):
    career_path: str
    match_score: str
    experience_level: str
    domain: str
    trending_score: str
    matched_skills: list[str]
    missing_skills: list[str]
    current_stage_index: int
    current_stage_label: str
    roadmap: list[dict[str, float | str]]

class PredictResponse(BaseModel):
    student_profile: str
    target_domain: str
    used_profile_skills: list[str] = Field(default_factory=list)
    predictions: list[CareerPath]

# ── Health & Keep-Alive ────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "service": "LinkUp ML & Skill Gap Service",
        "status": "online",
        "version": "2.1.0",
        "uptime_seconds": round(time.time() - START_TIME, 1),
        "total_jobs": len(df),
        "endpoints": {
            "career_predict": "/predict",
            "career_domains": "/domains",
            "skill_gap_domains": "/api/skill-gap/domains",
            "skill_gap_analyze": "/api/skill-gap/analyze",
            "health": "/health",
        }
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "linkup-ml",
        "uptime_seconds": round(time.time() - START_TIME, 1),
        "timestamp": datetime.utcnow().isoformat(),
        "memory_friendly": True,
        "jobs_loaded": len(df),
    }

# ── Career Path Predictor Endpoints ────────────────────────────────────────
@app.get("/domains")
def get_domains():
    domain_stats = {}
    for domain in VALID_DOMAINS:
        domain_stats[domain] = int((df["domain"] == domain).sum())
    return {
        "available_domains": VALID_DOMAINS,
        "job_counts": domain_stats
    }

@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    if not 1 <= request.top_n <= 10:
        raise HTTPException(status_code=400, detail="top_n must be between 1 and 10")

    target_domain = request.target_domain or "All Domains"
    if request.target_domain and request.target_domain not in VALID_DOMAINS and request.target_domain != "All Domains":
        raise HTTPException(status_code=400, detail=f"Invalid domain. Choose from: {VALID_DOMAINS}")

    student_profile = f"Skills: {request.student_skills}. Interests: {request.student_interests}"

    with torch.inference_mode():
        student_embedding = model.encode([student_profile])

    if request.target_domain and request.target_domain != "All Domains":
        domain_mask = (df["domain"] == request.target_domain).values
        domain_df = df[domain_mask].reset_index(drop=True)
        domain_embeddings = embeddings[domain_mask]
    else:
        domain_df = df.reset_index(drop=True)
        domain_embeddings = embeddings

    if len(domain_df) == 0:
        raise HTTPException(status_code=404, detail=f"No jobs found for domain: {target_domain}")

    similarities = cosine_similarity(student_embedding, domain_embeddings)[0]

    normalized_student_skills = {
        s.strip().lower() for s in re.split(r"[,|;]", request.student_skills) if s.strip()
    }

    title_counts = (
        domain_df["title"]
        .fillna("")
        .apply(clean_title)
        .str.title()
        .value_counts()
        .to_dict()
    )
    max_title_count = max(title_counts.values()) if title_counts else 1

    top_indices = similarities.argsort()[::-1][: request.top_n * 20]

    seen_titles: set[str] = set()
    predictions = []

    for idx in top_indices:
        raw_title = str(domain_df.iloc[idx]["title"]).title()
        title = clean_title(raw_title)
        role_domain = str(domain_df.iloc[idx].get("domain", "General"))
        similarity_score = round(float(similarities[idx]) * 100, 1)
        trending_boost = round((title_counts.get(title, 1) / max_title_count) * 100, 1)
        combined_score = round((similarity_score * 0.8) + (trending_boost * 0.2), 1)

        raw_skills = str(
            domain_df.iloc[idx].get("skills_required")
            or domain_df.iloc[idx].get("skills_list")
            or ""
        )
        job_skills = set(tokenize_skill_text(raw_skills))

        # Enrich skills based on title keywords if raw skills are generic
        title_lower = title.lower()
        if any(k in title_lower for k in ("software", "developer", "frontend", "full stack")):
            job_skills.update({"javascript", "react.js", "node.js", "git", "html", "css"})
        elif any(k in title_lower for k in ("backend", "api", "engineer")):
            job_skills.update({"python", "node.js", "sql", "docker", "rest api", "git"})
        elif any(k in title_lower for k in ("data", "ai", "machine learning", "analyst")):
            job_skills.update({"python", "sql", "pandas", "machine learning", "data analysis"})
        elif any(k in title_lower for k in ("design", "ui", "ux")):
            job_skills.update({"figma", "ui design", "ux research", "prototyping"})
        elif any(k in title_lower for k in ("product", "manager")):
            job_skills.update({"product management", "agile", "roadmapping", "scrum"})

        matched_skills = sorted(list(normalized_student_skills.intersection(job_skills)))
        missing_skills = sorted(list(job_skills - normalized_student_skills))[:6]

        coverage = 0.0
        if job_skills:
            coverage = (len(matched_skills) / len(job_skills)) * 100
        readiness_percent = round((coverage * 0.6) + (similarity_score * 0.4), 1)
        roadmap, current_stage_index = build_roadmap(
            readiness_percent=readiness_percent,
            job_skills=job_skills,
            matched_skills=matched_skills,
            similarity_score=similarity_score,
        )

        if title not in seen_titles:
            seen_titles.add(title)

            exp_level = domain_df.iloc[idx].get("formatted_experience_level", "All levels")
            if pd.isna(exp_level):
                exp_level = "All levels"

            predictions.append(CareerPath(
                career_path=title,
                match_score=f"{combined_score}%",
                experience_level=exp_level,
                domain=role_domain,
                trending_score=f"{trending_boost}%",
                matched_skills=matched_skills,
                missing_skills=missing_skills,
                current_stage_index=current_stage_index,
                current_stage_label=ROADMAP_STAGES[current_stage_index],
                roadmap=roadmap,
            ))

        if len(predictions) == request.top_n:
            break

    return PredictResponse(
        student_profile=student_profile,
        target_domain=target_domain,
        used_profile_skills=sorted(list(normalized_student_skills)),
        predictions=predictions
    )

# ── Skill Gap Analyzer Endpoints ───────────────────────────────────────────
@app.get("/api/skill-gap/domains")
def skill_gap_domains(n: int = 12):
    domains = skill_analyzer.get_domains(n=n)
    return {"domains": domains, "total": len(domains)}

@app.post("/api/skill-gap/analyze")
async def skill_gap_analyze(request: Request):
    body = await request.json() or {}
    student = body.get("student")
    student_id = body.get("student_id")

    if not student and student_id and MONGO_URI:
        try:
            client = ConnectDBClient(MONGO_URI, DB_NAME)
            student = client.get_student(student_id=student_id)
            client.close()
        except Exception as e:
            print("Skill gap DB lookup error:", e)

    if not student or not isinstance(student, dict):
        raise HTTPException(
            status_code=400,
            detail="Student profile data or valid student_id is required for Skill Gap analysis."
        )

    domains = body.get("domains", [])
    result = skill_analyzer.analyze(student, target_domains=domains)
    result["meta"] = {
        "service": "unified-ml",
        "data_source": "live-db" if MONGO_URI else "dataset",
    }
    return result

@app.get("/api/skill-gap/market-skills")
def skill_gap_market_skills(domain: str = "", n: int = 20):
    if domain:
        skills = skill_analyzer.job_processor.get_top_skills_for_domain(domain, n)
        freq = skill_analyzer.job_processor.get_domain_skill_frequency(domain, n)
    else:
        skills = skill_analyzer.job_processor.get_top_skills(n)
        freq = dict(skill_analyzer.job_processor.skill_freq.most_common(n))

    return {
        "top_skills": skills,
        "frequency": freq,
        "domain": domain or "all",
        "total_jobs": len(skill_analyzer.job_processor.df),
    }

@app.post("/api/skill-gap/role-matches")
async def skill_gap_role_matches(request: Request):
    body = await request.json() or {}
    skills = body.get("skills", [])
    top_n = body.get("top_n", 5)
    matches = skill_analyzer.job_processor.get_matching_roles(skills, top_n)
    return {"role_matches": matches}

@app.post("/api/skill-gap/learning-path")
async def skill_gap_learning_path(request: Request):
    body = await request.json() or {}
    gap_skills = body.get("gap_skills", [])
    path = skill_analyzer.portal_mapper.get_learning_path(gap_skills)
    return {"learning_path": path}

@app.post("/api/skill-gap/batch-analyze")
def skill_gap_batch_analyze():
    students = []
    if MONGO_URI:
        try:
            client = ConnectDBClient(MONGO_URI, DB_NAME)
            students = client.get_all_students()
            client.close()
        except Exception as e:
            print("Batch analyze DB query notice:", e)

    if not students:
        return {
            "total_students": 0,
            "analyses": [],
            "common_gaps": [],
        }

    results = []
    for student in students[:50]:
        res = skill_analyzer.analyze(student)
        results.append({
            "student_id": student.get("_id"),
            "name": student.get("name"),
            "readiness_score": res["skill_analysis"]["readiness_score"],
            "top_gaps": res["skill_analysis"]["skill_gaps"][:5],
            "best_role_match": res["role_matches"][0]["role"] if res["role_matches"] else None,
        })

    gap_counter = Counter()
    for r in results:
        for gap in r.get("top_gaps", []):
            gap_counter[gap] += 1
    common_gaps = [{"skill": s, "count": c} for s, c in gap_counter.most_common(10)]

    return {
        "total_students": len(results),
        "analyses": results,
        "common_gaps": common_gaps,
    }

# ── Render Keep-Alive Background Worker ────────────────────────────────────
def run_keep_alive():
    """Pings itself every 13 minutes on Render so free instance stays awake."""
    import requests
    time.sleep(30)
    while True:
        try:
            self_url = os.getenv("RENDER_EXTERNAL_URL") or os.getenv("KEEP_ALIVE_URL")
            if self_url:
                target = self_url.rstrip("/") + "/health"
                resp = requests.get(target, timeout=10)
                print(f"[Keep-Alive] Pinged self at {target} -> {resp.status_code}")
        except Exception as e:
            print(f"[Keep-Alive] Notice: {e}")
        time.sleep(13 * 60)

threading.Thread(target=run_keep_alive, daemon=True).start()

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)