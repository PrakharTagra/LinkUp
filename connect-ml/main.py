from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np
import re
from pathlib import Path
from typing import Optional
import os

app = FastAPI(
    title="Connect ML API",
    description="Career Path Predictor for the Connect platform",
    version="2.0.0"
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
os.environ["OMP_NUM_THREADS"] = "1"
import torch
torch.set_num_threads(1)

# ── Load production data on startup ──────────────────────────
print("Loading model and data...")

model = SentenceTransformer('all-MiniLM-L6-v2', device='cpu')

BASE_DIR = Path(__file__).resolve().parent
df = pd.read_csv(BASE_DIR / "data" / "processed" / "jobs_production.csv")
embeddings = np.load(BASE_DIR / "models" / "job_embeddings_production.npy")

print(f"Ready - {len(df)} jobs loaded")
print(f"   Domains: {df['domain'].value_counts().to_dict()}")

# ── Available domains (now 8, up from 6) ─────────────────────
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

# ── Helper: clean messy job titles ───────────────────────────
def clean_title(title: str) -> str:
    title = re.sub(r'\s+\d+$', '', title.strip())
    title = re.sub(r'\s+(Ii|Iii|Iv|Vi|Vii)$', '', title.strip())
    return title.strip()

# ── Request & Response models ─────────────────────────────────
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

# ── Routes ────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "message": "Connect ML API is running",
        "version": "2.0.0",
        "total_jobs": len(df),
        "endpoints": {
            "predict": "/predict",
            "domains": "/domains",
            "health": "/health"
        }
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": "all-MiniLM-L6-v2",
        "jobs_loaded": len(df),
        "domains": df['domain'].value_counts().to_dict()
    }

@app.get("/domains")
def get_domains():
    domain_stats = {}
    for domain in VALID_DOMAINS:
        count = len(df[df['domain'] == domain])
        domain_stats[domain] = count
    return {
        "available_domains": VALID_DOMAINS,
        "job_counts": domain_stats
    }

@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    if not 1 <= request.top_n <= 10:
        raise HTTPException(
            status_code=400,
            detail="top_n must be between 1 and 10"
        )

    target_domain = request.target_domain or "All Domains"
    if request.target_domain and request.target_domain not in VALID_DOMAINS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid domain. Choose from: {VALID_DOMAINS}"
        )

    student_profile = f"Skills: {request.student_skills}. Interests: {request.student_interests}"
    student_embedding = model.encode([student_profile])

    if request.target_domain:
        domain_mask = df['domain'] == request.target_domain
        domain_df = df[domain_mask].reset_index(drop=True)
        domain_embeddings = embeddings[domain_mask]
    else:
        domain_df = df.reset_index(drop=True)
        domain_embeddings = embeddings

    if len(domain_df) == 0:
        raise HTTPException(
            status_code=404,
            detail=f"No jobs found for domain: {target_domain}"
        )

    similarities = cosine_similarity(student_embedding, domain_embeddings)[0]

    normalized_student_skills = {
        s.strip().lower() for s in request.student_skills.split(",") if s.strip()
    }

    title_counts = (
        domain_df['title']
        .fillna('')
        .apply(clean_title)
        .str.title()
        .value_counts()
        .to_dict()
    )
    max_title_count = max(title_counts.values()) if title_counts else 1

    top_indices = similarities.argsort()[::-1][: request.top_n * 20]

    seen_titles: set[str] = set()
    predictions = []

    def tokenize_skill_text(raw_text: str) -> list[str]:
        if not isinstance(raw_text, str):
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

        # Spread role-specific skills across stages so each career path has its own curve.
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

    for idx in top_indices:
        raw_title = domain_df.iloc[idx]['title'].title()
        title = clean_title(raw_title)
        role_domain = str(domain_df.iloc[idx].get('domain', 'General'))
        similarity_score = round(float(similarities[idx]) * 100, 1)
        trending_boost = round((title_counts.get(title, 1) / max_title_count) * 100, 1)
        combined_score = round((similarity_score * 0.8) + (trending_boost * 0.2), 1)

        job_skills = set(tokenize_skill_text(str(domain_df.iloc[idx].get('skills_required', ''))))
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

            exp_level = domain_df.iloc[idx].get('formatted_experience_level', 'All levels')
            if pd.isna(exp_level):
                exp_level = 'All levels'

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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=int(os.getenv("PORT", 8001)), reload=False)