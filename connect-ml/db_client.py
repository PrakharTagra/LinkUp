"""
MongoDB Data Fetcher for LinkUp Platform.
Fetches real students, alumni, courses, and sessions from live MongoDB instance.
"""

import os
from pymongo import MongoClient
from bson import ObjectId


class ConnectDBClient:
    def __init__(self, mongo_uri: str = None, db_name: str = "test"):
        uri = mongo_uri or os.getenv("MONGO_URI", "mongodb://localhost:27017")
        self.client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        self.db = self.client[db_name]

    def get_student(self, student_id: str = None, email: str = None) -> dict:
        """Fetch a student document by ID or email."""
        query = {}
        if student_id:
            try:
                query["_id"] = ObjectId(student_id)
            except Exception:
                query["_id"] = student_id
        elif email:
            query["email"] = email
        else:
            return {}

        query["role"] = "student"
        doc = self.db.students.find_one(query) or self.db.users.find_one(query)
        return self._serialize(doc) if doc else {}

    def get_all_students(self) -> list:
        """Fetch all students from live DB."""
        students = list(self.db.students.find({"role": "student"}))
        if not students:
            students = list(self.db.users.find({"role": "student"}))
        return [self._serialize(s) for s in students]

    def get_portal_data(self) -> dict:
        """Fetch all live courses, sessions, workshops, and alumni from MongoDB."""
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
        if not alumni and "users" in self.db.list_collection_names():
            alumni.extend(list(self.db.users.find({"role": "alumni"})))

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
        try:
            self.client.close()
        except Exception:
            pass