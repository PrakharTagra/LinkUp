"""
MongoDB Data Fetcher for Connect Application
Fetches students, alumni, courses, sessions from your MongoDB instance.
"""

import os
from pymongo import MongoClient
from bson import ObjectId
import json


class ConnectDBClient:
    def __init__(self, mongo_uri: str = None, db_name: str = "test"):
        uri = mongo_uri or os.getenv("MONGO_URI", "mongodb://localhost:27017")
        self.client = MongoClient(uri)
        self.db = self.client[db_name]

    def get_student(self, student_id: str = None, email: str = None) -> dict:
        """Fetch a student document by ID or email."""
        query = {}
        if student_id:
            query["_id"] = ObjectId(student_id)
        elif email:
            query["email"] = email
        else:
            return {}
        query["role"] = "student"
        doc = self.db.students.find_one(query)
        return self._serialize(doc) if doc else {}

    def get_all_students(self) -> list:
        """Fetch all students."""
        return [self._serialize(s) for s in self.db.students.find({"role": "student"})]

    def get_portal_data(self) -> dict:
        """Fetch all portal content: courses, sessions, alumni."""
        # Keep resource pull permissive so recommendations reflect all portal data.
        courses = list(self.db.courses.find({}))
        sessions = list(self.db.sessions.find({}))

        workshops = [s for s in sessions if str(s.get("type", "")).lower() == "workshop"]
        if "workshops" in self.db.list_collection_names():
            workshops.extend(list(self.db.workshops.find({})))

        alumni = []
        if "alumnis" in self.db.list_collection_names():
            alumni.extend(list(self.db.alumnis.find({"role": "alumni"})))
        if "alumni" in self.db.list_collection_names():
            alumni.extend(list(self.db.alumni.find({"role": "alumni"})))

        unique_alumni = {}
        for a in alumni:
            unique_alumni[str(a.get("_id"))] = a

        return {
            "courses": [self._serialize(c) for c in courses],
            "sessions": [self._serialize(s) for s in sessions],
            "workshops": [self._serialize(w) for w in workshops],
            "alumnis": [self._serialize(a) for a in unique_alumni.values()],
        }

    def _serialize(self, doc: dict) -> dict:
        """Convert MongoDB document to JSON-serializable dict."""
        if doc is None:
            return {}
        result = {}
        for key, val in doc.items():
            if isinstance(val, ObjectId):
                result[key] = str(val)
            elif isinstance(val, list):
                result[key] = [
                    str(v) if isinstance(v, ObjectId) else v for v in val
                ]
            elif isinstance(val, dict):
                result[key] = self._serialize(val)
            else:
                result[key] = val
        return result

    def close(self):
        self.client.close()


# ─────────────────────────────────────────────────────────────
# MOCK DATA (for testing without MongoDB connection)
# ─────────────────────────────────────────────────────────────
def get_mock_portal_data() -> dict:
    return {
        "courses": [
            {
                "_id": "69e118bb40baec0f9d61e04b",
                "title": "Firebase",
                "description": "In this course students will learn about Firebase.",
                "level": "beginner",
                "price": 498,
                "tags": ["Firebase", "Backend", "Mobile"],
                "isPublished": True,
                "isApproved": True,
            },
            {
                "_id": "course002",
                "title": "React.js Complete Bootcamp",
                "description": "Master React.js with hooks, Redux, and modern patterns.",
                "level": "intermediate",
                "price": 999,
                "tags": ["React.js", "JavaScript", "Redux", "Frontend"],
                "isPublished": True,
                "isApproved": True,
            },
            {
                "_id": "course003",
                "title": "DSA Masterclass",
                "description": "Data Structures and Algorithms for placements.",
                "level": "beginner",
                "price": 799,
                "tags": ["DSA", "Python", "Java", "Algorithms"],
                "isPublished": True,
                "isApproved": True,
            },
            {
                "_id": "course004",
                "title": "Node.js & Express Backend",
                "description": "Build REST APIs with Node.js and Express.js.",
                "level": "intermediate",
                "price": 699,
                "tags": ["Node.js", "Express.js", "REST API", "Backend"],
                "isPublished": True,
                "isApproved": True,
            },
            {
                "_id": "course005",
                "title": "Machine Learning with Python",
                "description": "Intro to ML: regression, classification, clustering.",
                "level": "intermediate",
                "price": 1499,
                "tags": ["Machine Learning", "Python", "Pandas", "NumPy"],
                "isPublished": True,
                "isApproved": True,
            },
            {
                "_id": "course006",
                "title": "Docker & Kubernetes for Developers",
                "description": "Containerization and orchestration from scratch.",
                "level": "advanced",
                "price": 1299,
                "tags": ["Docker", "Kubernetes", "DevOps"],
                "isPublished": True,
                "isApproved": True,
            },
            {
                "_id": "course007",
                "title": "TypeScript for React Developers",
                "description": "Add TypeScript to your React projects.",
                "level": "intermediate",
                "price": 599,
                "tags": ["TypeScript", "React.js", "JavaScript"],
                "isPublished": True,
                "isApproved": True,
            },
        ],
        "sessions": [
            {
                "_id": "sess001",
                "title": "1:1 System Design Mentoring",
                "description": "Live system design session with industry expert.",
                "type": "mentoring",
                "tags": ["System Design", "Backend", "Architecture"],
            },
            {
                "_id": "sess002",
                "title": "AWS Cloud Workshop",
                "description": "Hands-on AWS session covering EC2, S3, Lambda.",
                "type": "workshop",
                "tags": ["AWS", "Cloud", "DevOps"],
            },
            {
                "_id": "sess003",
                "title": "Resume & Interview Prep",
                "description": "Get your resume reviewed and mock interview practice.",
                "type": "career",
                "tags": ["Leadership", "Communication", "Interview"],
            },
            {
                "_id": "sess004",
                "title": "React + TypeScript Project Workshop",
                "description": "Build a real project with React and TypeScript.",
                "type": "workshop",
                "tags": ["React.js", "TypeScript", "JavaScript", "Frontend"],
            },
        ],
        "workshops": [],
        "alumnis": [
            {
                "_id": "69e0e11a6d69fa2ba3e89a5c",
                "name": "Prakhar Tagra",
                "company": "Amazon",
                "domain": "SDE",
                "skills": ["DSA", "React", "NodeJS"],
            },
            {
                "_id": "alum002",
                "name": "Priya Sharma",
                "company": "Google",
                "domain": "ML Engineer",
                "skills": ["Python", "Machine Learning", "TensorFlow", "SQL"],
            },
            {
                "_id": "alum003",
                "name": "Rohan Gupta",
                "company": "Microsoft",
                "domain": "Cloud",
                "skills": ["AWS", "Docker", "Kubernetes", "Python"],
            },
        ],
    }


def get_mock_student() -> dict:
    """Sample student from your screenshot."""
    return {
        "_id": "69e0e0626d69fa2ba3e89a5b",
        "name": "Prakhar Tagra",
        "email": "prakhar2410063@akgec.ac.in",
        "role": "student",
        "branch": "Computer Science and Engineering",
        "year": 1,
        "college": "Ajay Kumar Garg Engineering College (AKGEC), Ghaziabad",
        "skills": ["DSA", "React.js", "Node.js", "Express.js", "MongoDB",
                   "Python", "Figma", "Leadership", "Teamwork"],
        "enrolledCourses": ["69e118bb40baec0f9d61e04b", "course002"],
        "enrolledSessions": [],
        "degree": "BTECH",
    }