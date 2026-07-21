import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Loader from "../../components/common/Loader";
import courseThumbnail from "../../assets/hero.png";
import API from "../../utils/api";

const sectionStyle = {
  background: "var(--bg-3)",
  border: "1px solid var(--border)",
  borderRadius: 18,
  padding: 20,
};

const titleStyle = {
  fontFamily: "Plus Jakarta Sans",
  fontWeight: 700,
  fontSize: 18,
  color: "var(--text)",
  marginBottom: 14,
};

export default function MyLearning() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await API.get("/users/me/enrolled");
        setItems(res.data.enrollments || []);
      } catch (err) {
        console.error("Fetch enrollments error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const courses = items.filter(item => (item.type || "course") === "course");
  const sessions = items.filter(item => item.type === "session");
  const workshops = items.filter(item => item.type === "workshop");

  return (
    <MainLayout>
      <div style={{ padding: "24px 0 32px" }}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 24, color: "var(--text)", marginBottom: 4 }}>
            My Learning
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>
            Everything you enrolled in, including unlocked videos and live sessions.
          </p>
        </div>

        {loading ? (
          <div style={sectionStyle}>
            <Loader text="Loading your enrollments..." />
          </div>
        ) : items.length === 0 ? (
          <div style={sectionStyle}>
            <h2 style={titleStyle}>No enrollments yet</h2>
            <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 16 }}>
              Enroll in a course, live session, or workshop to see it here.
            </p>
            <button
              onClick={() => navigate("/academics")}
              style={{
                padding: "10px 16px",
                borderRadius: 11,
                border: "none",
                background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
                color: "white",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "Plus Jakarta Sans",
                cursor: "pointer",
              }}
            >
              Browse Academics
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 18 }}>
            <LearningSection title="Courses" items={courses} onOpen={item => navigate("/course-detail", { state: { course: item } })} />
            <LearningSection title="Live Sessions" items={sessions} onOpen={item => navigate("/session-workshop-detail", { state: { session: item } })} />
            <LearningSection title="Workshops" items={workshops} onOpen={item => navigate("/session-workshop-detail", { state: { session: item } })} />
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function LearningSection({ title, items, onOpen }) {
  return (
    <section style={sectionStyle}>
      <h2 style={titleStyle}>{title}</h2>
      {items.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--text-3)" }}>No enrolled {title.toLowerCase()}.</p>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {items.map((item, idx) => (
            <div key={item._id || item.id || idx} style={{ display: "grid", gridTemplateColumns: "110px 1fr auto", gap: 14, alignItems: "center", padding: 14, borderRadius: 14, background: "var(--bg-4)", border: "1px solid var(--border)" }}>
              <div style={{ borderRadius: 12, overflow: "hidden", background: "var(--bg-2)", border: "1px solid var(--border)" }}>
                <img
                  src={item.thumbnail || courseThumbnail}
                  alt={item.title}
                  style={{ display: "block", width: "100%", aspectRatio: item.thumbnailRatio || "16 / 9", objectFit: item.thumbnailFit || "contain" }}
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 4 }}>{item.title}</p>
                <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 6 }}>{item.description}</p>
                <p style={{ fontSize: 12, color: "var(--text-3)" }}>
                  {item.type === "course" ? "Course" : item.type === "workshop" ? "Workshop" : "Live Session"}
                </p>
              </div>
              <button
                onClick={() => onOpen(item)}
                style={{
                  padding: "9px 14px",
                  borderRadius: 11,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text)",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "Plus Jakarta Sans",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Open
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}