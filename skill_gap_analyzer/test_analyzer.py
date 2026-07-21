"""
Test the Skill Gap Analyzer end-to-end with mock data.
Run: python test_analyzer.py
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))

from models.skill_gap_model import SkillGapAnalyzer
from utils.db_client import get_mock_portal_data, get_mock_student

print("=" * 60)
print("SKILL GAP ANALYZER — END-TO-END TEST")
print("=" * 60)

portal_data = get_mock_portal_data()
analyzer = SkillGapAnalyzer(
    job_csv_path="data/sample_job_postings.csv",
    portal_data=portal_data
)

# Test with student from your screenshot
student = get_mock_student()
result = analyzer.analyze(student)

# Pretty print summary
print(result["summary_text"])

print("\n\n📋 FULL JSON RESULT KEYS:")
for key in result:
    val = result[key]
    if isinstance(val, dict):
        print(f"  {key}: {list(val.keys())}")
    elif isinstance(val, list):
        print(f"  {key}: [{len(val)} items]")
    else:
        print(f"  {key}: {str(val)[:60]}")

print("\n\n🎯 TOP 5 ROLE MATCHES:")
for match in result["role_matches"][:5]:
    print(f"  {match['role']}: {match['match_score']}% | "
          f"Missing: {match['missing_skills'][:3]}")

print("\n\n📚 LEARNING PATH PREVIEW:")
for item in result["learning_path"][:5]:
    print(f"\n  Skill: {item['skill']} ({item['category']})")
    for c in item["portal_courses"]:
        print(f"    📗 Course: {c['title']} — ₹{c['price']}")
    for s in item["portal_sessions"]:
        print(f"    🎙️  Session: {s['title']}")
    for a in item["alumni_mentors"]:
        print(f"    👤 Mentor: {a['name']} @ {a['company']}")
    if not item["has_portal_resource"]:
        print(f"    ⚡ No portal resource yet — suggest adding content!")

# Save full result as JSON
with open("data/sample_result.json", "w") as f:
    json.dump(result, f, indent=2, default=str)
print("\n\n✅ Full result saved to data/sample_result.json")