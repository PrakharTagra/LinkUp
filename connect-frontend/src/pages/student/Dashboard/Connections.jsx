import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import Loader from "../../../components/common/Loader";
import API from "../../../utils/api";

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function StudentConnections() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeConnections, setActiveConnections] = useState([]);
  const [pendingConnections, setPendingConnections] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("active");

  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      setError("");
      try {
        const [activeRes, pendingRes] = await Promise.all([
          API.get("/connections"),
          API.get("/connections/pending-all"),
        ]);

        const activeRows = activeRes?.data?.connections || [];
        const pendingRows = pendingRes?.data?.pending || [];

        const activePartners = activeRows.map((conn) => {
          const from = conn.from || {};
          const to = conn.to || {};
          const partner = from.role === "student" ? to : from;
          return {
            _id: partner._id,
            name: partner.name,
            avatar: partner.avatar,
            role: partner.role,
            college: partner.college,
            company: partner.company,
          };
        }).filter((row) => row?._id);

        const uniqueActive = Array.from(
          new Map(activePartners.map((partner) => [String(partner._id), partner])).values()
        );

        setActiveConnections(uniqueActive);
        setPendingConnections(pendingRows);
      } catch (err) {
        console.error("Failed to fetch student connections", err);
        setActiveConnections([]);
        setPendingConnections([]);
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

  const query = search.trim().toLowerCase();

  const filteredActive = useMemo(() => {
    if (!query) return activeConnections;
    return activeConnections.filter((item) => {
      const text = `${item.name || ""} ${item.role || ""} ${item.college || ""} ${item.company || ""}`.toLowerCase();
      return text.includes(query);
    });
  }, [activeConnections, query]);

  const filteredPending = useMemo(() => {
    if (!query) return pendingConnections;
    return pendingConnections.filter((item) => {
      const partner = item.partner || {};
      const text = `${partner.name || ""} ${partner.role || ""} ${partner.college || ""} ${partner.company || ""}`.toLowerCase();
      return text.includes(query);
    });
  }, [pendingConnections, query]);

  const renderUserRow = (user, extraRight = null) => {
    const initial = (user.name || "U")[0].toUpperCase();
    return (
      <div key={String(user._id)} style={{
        background: "var(--bg-3)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: user.avatar
              ? `url(${user.avatar}) center/cover no-repeat`
              : "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Plus Jakarta Sans",
            fontWeight: 700,
            fontSize: 15,
            flexShrink: 0,
          }}>
            {!user.avatar && initial}
          </div>

          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: "Plus Jakarta Sans", fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 1 }}>
              {user.name || "User"}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.college || user.company || "Profile details not available"}
            </p>
          </div>
        </div>

        {extraRight}
      </div>
    );
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 0" }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 24, color: "var(--text)", marginBottom: 4 }}>
            Connections
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>
            {activeConnections.length} active · {pendingConnections.length} pending
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button
            onClick={() => setActiveSection("active")}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: `1px solid ${activeSection === "active" ? "rgba(124,92,252,0.35)" : "var(--border)"}`,
              background: activeSection === "active" ? "rgba(124,92,252,0.15)" : "var(--bg-3)",
              color: activeSection === "active" ? "var(--purple-light)" : "var(--text-2)",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "Plus Jakarta Sans",
              cursor: "pointer",
            }}
          >
            Active ({activeConnections.length})
          </button>
          <button
            onClick={() => setActiveSection("pending")}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: `1px solid ${activeSection === "pending" ? "rgba(255,112,67,0.35)" : "var(--border)"}`,
              background: activeSection === "pending" ? "rgba(255,112,67,0.14)" : "var(--bg-3)",
              color: activeSection === "pending" ? "var(--orange)" : "var(--text-2)",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "Plus Jakarta Sans",
              cursor: "pointer",
            }}
          >
            Pending ({pendingConnections.length})
          </button>
        </div>

        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}>
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search by name, college, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 14px 11px 36px",
              background: "var(--bg-3)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--text)",
              fontSize: 13,
              fontFamily: "DM Sans",
              outline: "none",
            }}
          />
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

        {!loading && activeSection === "active" && (
          <>
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>
                Active Connections
              </h3>

              {filteredActive.length === 0 ? (
                <div style={{
                  border: "1px solid var(--border)",
                  background: "var(--bg-3)",
                  borderRadius: 14,
                  padding: "18px 16px",
                  color: "var(--text-3)",
                  fontSize: 13,
                }}>
                  No active connections found.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filteredActive.map((user) => renderUserRow(
                    user,
                    <button
                      onClick={() => navigate(`/messages?user=${user._id}`)}
                      style={{
                        padding: "7px 12px",
                        borderRadius: 9,
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
                  ))}
                </div>
              )}
            </div>

          </>
        )}

        {!loading && activeSection === "pending" && (
          <div>
            <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>
              Pending Connections
            </h3>

            {filteredPending.length === 0 ? (
              <div style={{
                border: "1px solid var(--border)",
                background: "var(--bg-3)",
                borderRadius: 14,
                padding: "18px 16px",
                color: "var(--text-3)",
                fontSize: 13,
              }}>
                No pending connections.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredPending.map((item) => {
                  const partner = item.partner || {};
                  return renderUserRow(
                    { _id: item._id, ...partner },
                    <span style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: item.direction === "outgoing" ? "rgba(124,92,252,0.14)" : "rgba(255,112,67,0.14)",
                      border: `1px solid ${item.direction === "outgoing" ? "rgba(124,92,252,0.3)" : "rgba(255,112,67,0.3)"}`,
                      color: item.direction === "outgoing" ? "var(--purple-light)" : "var(--orange)",
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "Plus Jakarta Sans",
                      whiteSpace: "nowrap",
                    }}>
                      {item.direction === "outgoing" ? "Sent" : "Received"}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
