"""
Flask API for Skill Gap Analyzer
Integrate with your Connect application backend.

Endpoints:
    GET  /api/skill-gap/domains          -> Available target domains from postings dataset
  POST /api/skill-gap/analyze          → Full analysis for a student
  GET  /api/skill-gap/market-skills    → Top demanded skills in market
  GET  /api/skill-gap/role-matches     → Best role matches for student skills
  POST /api/skill-gap/learning-path    → Custom learning path for given gap skills
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import Optional

# Add parent dir to path
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from models.skill_gap_model import SkillGapAnalyzer
from utils.db_client import get_mock_portal_data, get_mock_student, ConnectDBClient

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────────────────────────
# Initialize Analyzer (singleton on startup)
# ─────────────────────────────────────────────────────────────
default_jobs_csv = os.path.join(os.path.dirname(__file__), "../data/postings.csv")
if not os.path.exists(default_jobs_csv):
    default_jobs_csv = os.path.join(os.path.dirname(__file__), "../data/sample_job_postings.csv")
if not os.path.exists(default_jobs_csv):
    default_jobs_csv = os.path.join(os.path.dirname(__file__), "../data/job_skills.csv")

def _parse_env_file(path: str) -> dict:
    env = {}
    if not os.path.exists(path):
        return env

    with open(path, "r", encoding="utf-8") as f:
        for raw_line in f:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def _env_or_fallback(key: str, default: Optional[str] = None) -> Optional[str]:
    current = os.getenv(key)
    if current is not None and str(current).strip() != "":
        return current

    backend_env_path = os.path.join(os.path.dirname(__file__), "../../backend/.env")
    fallback_env = _parse_env_file(backend_env_path)
    value = fallback_env.get(key)
    return value if value not in (None, "") else default


def _to_bool(value: Optional[str], default: bool = False) -> bool:
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


JOB_CSV_PATH = _env_or_fallback("JOB_CSV_PATH", default_jobs_csv)
MONGO_URI = _env_or_fallback("MONGO_URI", None)
DB_NAME = _env_or_fallback("DB_NAME", "test")
USE_MOCK = _to_bool(_env_or_fallback("USE_MOCK_DATA", "false"), default=False)
MAX_POSTINGS_ROWS = int(os.getenv("MAX_POSTINGS_ROWS", "30000"))

print("Initializing Skill Gap Analyzer...")

if USE_MOCK or not MONGO_URI:
    portal_data = get_mock_portal_data()
    print("Using mock portal data (set MONGO_URI to use real DB)")
else:
    db = ConnectDBClient(MONGO_URI, DB_NAME)
    portal_data = db.get_portal_data()
    db.close()
    print(f"Loaded portal data from MongoDB ({DB_NAME})")

analyzer = SkillGapAnalyzer(JOB_CSV_PATH, portal_data, max_postings_rows=MAX_POSTINGS_ROWS)
print("Analyzer ready")


# ─────────────────────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "skill-gap-analyzer",
        "using_mock_data": USE_MOCK or not bool(MONGO_URI),
        "db_name": DB_NAME,
    })


@app.route("/api/skill-gap/domains", methods=["GET"])
def domains():
    n = int(request.args.get("n", 12))
    return jsonify({"domains": analyzer.get_domains(n=n)})


@app.route("/api/skill-gap/analyze", methods=["POST"])
def analyze():
    """
    Full skill gap analysis for a student.
    
    Body (JSON):
    {
        "student_id": "...",   // optional, fetch from DB
        "student": { ... }     // or pass student object directly
    }
    """
    body = request.get_json(force=True) or {}

    student = body.get("student")
    student_id = body.get("student_id")

    if not student and student_id and MONGO_URI:
        db = ConnectDBClient(MONGO_URI, DB_NAME)
        student = db.get_student(student_id=student_id)
        db.close()

    if not student:
        # Fallback to mock for testing
        student = get_mock_student()

    if not student:
        return jsonify({"error": "Student not found"}), 404

    domains = body.get("domains", [])

    # Refresh portal resources from Mongo on each request when DB is available.
    # This keeps course/session/workshop/alumni recommendations synced with live data.
    data_source = "mock"
    portal_counts = {
        "courses": len(getattr(analyzer.portal_mapper, "courses", [])),
        "sessions": len(getattr(analyzer.portal_mapper, "sessions", [])),
        "workshops": len(getattr(analyzer.portal_mapper, "workshops", [])),
        "alumnis": len(getattr(analyzer.portal_mapper, "alumni", [])),
    }

    if MONGO_URI and not USE_MOCK:
        db = ConnectDBClient(MONGO_URI, DB_NAME)
        analyzer.portal_mapper.courses = []
        analyzer.portal_mapper.sessions = []
        analyzer.portal_mapper.workshops = []
        analyzer.portal_mapper.alumni = []
        portal_data = db.get_portal_data()
        db.close()
        analyzer.portal_mapper = analyzer.portal_mapper.__class__(portal_data)
        data_source = "mongodb"
        portal_counts = {
            "courses": len(portal_data.get("courses", [])),
            "sessions": len(portal_data.get("sessions", [])),
            "workshops": len(portal_data.get("workshops", [])),
            "alumnis": len(portal_data.get("alumnis", [])),
        }

    result = analyzer.analyze(student, target_domains=domains)
    result["meta"] = {
        "data_source": data_source,
        "portal_counts": portal_counts,
    }
    return jsonify(result)


@app.route("/api/skill-gap/market-skills", methods=["GET"])
def market_skills():
    """Get top demanded skills from job market."""
    domain = request.args.get("domain", "")
    n = int(request.args.get("n", 20))
    if domain:
        skills = analyzer.job_processor.get_top_skills_for_domain(domain, n)
        freq = analyzer.job_processor.get_domain_skill_frequency(domain, n)
    else:
        skills = analyzer.job_processor.get_top_skills(n)
        freq = dict(analyzer.job_processor.skill_freq.most_common(n))
    return jsonify({
        "top_skills": skills,
        "frequency": freq,
        "domain": domain,
        "total_jobs": len(analyzer.job_processor.df),
    })


@app.route("/api/skill-gap/role-matches", methods=["POST"])
def role_matches():
    """Get best role matches for a list of skills."""
    body = request.get_json(force=True) or {}
    skills = body.get("skills", [])
    top_n = body.get("top_n", 5)
    matches = analyzer.job_processor.get_matching_roles(skills, top_n)
    return jsonify({"role_matches": matches})


@app.route("/api/skill-gap/learning-path", methods=["POST"])
def learning_path():
    """Get learning path from portal for specific skill gaps."""
    body = request.get_json(force=True) or {}
    gap_skills = body.get("gap_skills", [])
    path = analyzer.portal_mapper.get_learning_path(gap_skills)
    return jsonify({"learning_path": path})


@app.route("/api/skill-gap/batch-analyze", methods=["POST"])
def batch_analyze():
    """Analyze all students (for admin dashboard)."""
    if MONGO_URI:
        db = ConnectDBClient(MONGO_URI, DB_NAME)
        students = db.get_all_students()
        db.close()
    else:
        students = [get_mock_student()]

    results = []
    for student in students[:50]:  # limit to 50 for performance
        result = analyzer.analyze(student)
        results.append({
            "student_id": student.get("_id"),
            "name": student.get("name"),
            "readiness_score": result["skill_analysis"]["readiness_score"],
            "top_gaps": result["skill_analysis"]["skill_gaps"][:5],
            "best_role_match": result["role_matches"][0]["role"] if result["role_matches"] else None,
        })

    return jsonify({
        "total_students": len(results),
        "analyses": results,
        "common_gaps": _get_common_gaps(results),
    })


def _get_common_gaps(results: list) -> list:
    """Find most common skill gaps across all students."""
    from collections import Counter
    gap_counter = Counter()
    for r in results:
        for gap in r.get("top_gaps", []):
            gap_counter[gap] += 1
    return [{"skill": s, "count": c} for s, c in gap_counter.most_common(10)]


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8002))
    app.run(debug=True, port=port)