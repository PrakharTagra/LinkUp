import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import Loader from "../../../components/common/Loader";
import API from "../../../utils/api";

export default function AlumniConnections() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get("/connections");
        const all = res.data.connections || [];

        const students = all
          .map((conn) => {
            const from = conn.from || {};
            const to = conn.to || {};

            if (from.role === "student") return from;
            if (to.role === "student") return to;
            return null;
          })
          .filter(Boolean);

        const uniqueStudents = Array.from(
          new Map(students.map((student) => [student._id, student])).values()
        );

        setConnections(uniqueStudents);
      } catch (err) {
        console.error("Failed to fetch connections", err);
        setConnections([]);
        setError(err?.response?.data?.message || "Failed to load connections.");
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
    const intervalId = setInterval(fetchConnections, 15000);
    const onFocus = () => fetchConnections();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return (
    <MainLayout>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 0" }}>
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 24, color: "var(--text)", marginBottom: 4 }}>
            Student Connections
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>
            {connections.length} connected student{connections.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading && <Loader text="Loading your connections..." />}

        {!loading && error && (
          <div style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,75,110,0.25)",
            background: "rgba(255,75,110,0.08)",
            color: "#ff9cb0",
            fontSize: 12,
            fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        {!loading && connections.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "52px 20px",
            borderRadius: 16,
            background: "var(--bg-3)",
            border: "1px solid var(--border)",
          }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>🤝</div>
            <p style={{ fontFamily: "Plus Jakarta Sans", fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
              No student connections yet
            </p>
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>
              Accept student requests to see them listed here.
            </p>
          </div>
        )}

        {!loading && connections.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {connections.map((student) => {
              const initial = (student.name || "S")[0].toUpperCase();
              return (
                <div key={student._id} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: "var(--bg-3)",
                  border: "1px solid var(--border)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <div style={{
                      width: 46,
                      height: 46,
                      borderRadius: 13,
                      background: student.avatar
                        ? `url(${student.avatar}) center/cover no-repeat`
                        : "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "Plus Jakarta Sans",
                      fontWeight: 700,
                      fontSize: 16,
                      flexShrink: 0,
                    }}>
                      {!student.avatar && initial}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: "Plus Jakarta Sans", fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
                        {student.name || "Student"}
                      </p>
                      <p style={{ fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {student.college || "College not available"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/alumni/dashboard/messages?user=${student._id}`)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid rgba(0,229,195,0.25)",
                      background: "rgba(0,229,195,0.1)",
                      color: "var(--teal)",
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: "Plus Jakarta Sans",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    Message
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
