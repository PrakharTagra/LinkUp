import React, { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import Loader from "../../../components/common/Loader";
import API from "../../../utils/api";

export default function ConnectionRequests() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");
  const [error, setError] = useState("");

  const fetchPending = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/connections/pending");
      setPending(res.data.pending || []);
    } catch (err) {
      console.error("Failed to fetch connection requests", err);
      setPending([]);
      setError(err?.response?.data?.message || "Failed to load connection requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();

    const intervalId = setInterval(fetchPending, 15000);
    const onFocus = () => fetchPending();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const handleAction = async (requestId, action) => {
    if (processingId) return;
    setProcessingId(requestId);
    try {
      await API.patch(`/connections/${requestId}/${action}`);
      setPending((prev) => prev.filter((req) => req._id !== requestId));
    } catch (err) {
      console.error(`Failed to ${action} connection request`, err);
      alert(`Could not ${action} request. Please try again.`);
    } finally {
      setProcessingId("");
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 0" }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 24, color: "var(--text)", marginBottom: 4 }}>
            Connection Requests
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>
            {pending.length} pending request{pending.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading && <Loader text="Loading connection requests..." />}

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

        {!loading && pending.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "52px 20px",
            background: "var(--bg-3)",
            border: "1px solid var(--border)",
            borderRadius: 18,
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🤝</div>
            <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>
              No pending requests
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>
              New connection requests from students will appear here.
            </p>
          </div>
        )}

        {!loading && pending.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pending.map((request) => {
              const student = request.from || {};
              const avatarInitial = (student.name || "S")[0].toUpperCase();
              const busy = processingId === request._id;

              return (
                <div
                  key={request._id}
                  style={{
                    background: "var(--bg-3)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <div style={{
                      width: 46,
                      height: 46,
                      borderRadius: 13,
                      background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "Plus Jakarta Sans",
                      fontWeight: 700,
                      fontSize: 16,
                      flexShrink: 0,
                    }}>
                      {avatarInitial}
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

                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => handleAction(request._id, "reject")}
                      disabled={busy}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        border: "1px solid var(--border)",
                        background: "transparent",
                        color: "var(--text-3)",
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "Plus Jakarta Sans",
                        cursor: busy ? "not-allowed" : "pointer",
                        opacity: busy ? 0.6 : 1,
                      }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(request._id, "accept")}
                      disabled={busy}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        border: "none",
                        background: "linear-gradient(135deg, #00E5C3, #0A8FE8)",
                        color: "white",
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "Plus Jakarta Sans",
                        cursor: busy ? "not-allowed" : "pointer",
                        opacity: busy ? 0.75 : 1,
                      }}
                    >
                      {busy ? "Please wait..." : "Accept"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
