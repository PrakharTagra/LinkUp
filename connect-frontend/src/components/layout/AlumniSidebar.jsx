import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../utils/api";
import CrownIcon from "../common/CrownIcon";

const icons = {
  Feed: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Sessions: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  ),
  Earnings: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  Messages: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  MyPosts: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  ConnectionRequests: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 8v6"/>
      <path d="M20 11h6"/>
    </svg>
  ),
  Connections: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <path d="M20 8v6"/>
      <path d="M17 11h6"/>
    </svg>
  ),
  Profile: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Membership: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Lock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
};

// Free alumni can only access Feed + Messages
// Premium alumni get everything
const allNavItems = [
  { name: "Feed",     path: "/alumni/dashboard/feed",     freeAccess: true  },
  { name: "MyPosts",  path: "/alumni/dashboard/my-posts", freeAccess: true, label: "My Posts" },
  { name: "ConnectionRequests", path: "/alumni/dashboard/connection-requests", freeAccess: true, label: "Requests" },
  { name: "Connections", path: "/alumni/dashboard/connections", freeAccess: true },
  { name: "Messages", path: "/alumni/dashboard/messages", freeAccess: true,  badge: 1 },
  { name: "Sessions",   path: "/alumni/dashboard/sessions",   freeAccess: false },
  { name: "Earnings",   path: "/alumni/dashboard/earnings",   freeAccess: false },
  { name: "Membership", path: "/alumni/dashboard/membership", freeAccess: true, label: "Membership" },
  { name: "Profile",    path: "/alumni/profile",              freeAccess: true  },
];

export default function AlumniSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  // Read from the correct field set during signup
  const isPremium = user?.alumniPlan === "premium";

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const res = await API.get("/connections/pending");
        setPendingRequestsCount((res.data.pending || []).length);
      } catch {
        setPendingRequestsCount(0);
      }
    };

    fetchPendingRequests();
    const intervalId = setInterval(fetchPendingRequests, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const handleLockedClick = () => {
    // Navigate to the locked page — the AlumniModelGate will show the upgrade UI
    navigate("/alumni/dashboard/sessions");
  };

  return (
    <div style={{
      width: 220,
      background: "var(--bg-2)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "14px 10px",
      position: "sticky",
      top: 60,
      height: "calc(100vh - 60px)",
      overflowY: "hidden",
    }} className="hidden-mobile">

      {/* Section label + plan badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", marginBottom: 8 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Alumni Panel
        </p>
        {isPremium ? (
          <span style={{ display: "inline-flex", alignItems: "center" }}>
            <CrownIcon size={16} />
          </span>
        ) : (
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
            background: "rgba(255,255,255,0.06)",
            color: "var(--text-3)",
            border: "1px solid var(--border)",
          }}>
            FREE
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {allNavItems.map(item => {
          const isLocked = !isPremium && !item.freeAccess;
          const active = location.pathname === item.path && !isLocked;

          if (isLocked) {
            return (
              <div
                key={item.path}
                onClick={handleLockedClick}
                title="Premium only — upgrade to unlock"
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 11px", borderRadius: 9,
                  background: "rgba(255,112,67,0.04)",
                  border: "1px solid rgba(255,112,67,0.12)",
                  color: "var(--text-3)",
                  cursor: "pointer", transition: "all 0.15s",
                  justifyContent: "space-between",
                  opacity: 0.65,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,112,67,0.09)"; e.currentTarget.style.opacity = "1"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,112,67,0.04)"; e.currentTarget.style.opacity = "0.65"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ opacity: 0.4, display: "flex" }}>{icons[item.name]}</span>
                  <span style={{ fontSize: 14 }}>{item.label || item.name}</span>
                </div>
                <span style={{ color: "var(--orange)", opacity: 0.7, display: "flex" }}>{icons.Lock}</span>
              </div>
            );
          }

          return (
            <Link key={item.path} to={item.path} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 11px", borderRadius: 9,
                background: active ? "rgba(255,112,67,0.1)" : "transparent",
                border: `1px solid ${active ? "rgba(255,112,67,0.25)" : "transparent"}`,
                color: active ? "var(--orange)" : "var(--text-2)",
                transition: "all 0.15s",
                cursor: "pointer",
                justifyContent: "space-between",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text)"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; } }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ opacity: active ? 1 : 0.6, display: "flex" }}>{icons[item.name]}</span>
                  <span style={{ fontSize: 14, fontWeight: active ? 600 : 400 }}>{item.label || item.name}</span>
                </div>
                {(item.name === "ConnectionRequests" ? pendingRequestsCount : item.badge) ? (
                  <span style={{
                    background: "var(--orange)", color: "white",
                    borderRadius: 99, fontSize: 10, fontWeight: 700,
                    padding: "1px 6px", minWidth: 18, textAlign: "center",
                  }}>{item.name === "ConnectionRequests" ? pendingRequestsCount : item.badge}</span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Free plan notice — only shown when not premium */}
      {!isPremium && (
        <div style={{
          marginTop: 10,
          padding: "10px 12px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--border)",
          borderRadius: 11,
        }}>
          <p style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.5 }}>
            🔒 <span style={{ color: "var(--text-2)", fontWeight: 600 }}>Free plan:</span> Feed & Chat only.<br />
            Sessions, Earnings & Membership are Premium.
          </p>
        </div>
      )}

      {/* Premium CTA (only for free) */}
      {!isPremium && (
        <div style={{
          margin: "10px 0 0",
          padding: "12px",
          background: "linear-gradient(135deg, rgba(255,112,67,0.12), rgba(245,200,66,0.08))",
          border: "1px solid rgba(255,112,67,0.25)",
          borderRadius: 14,
          textAlign: "center",
        }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
            <span style={{ display: "inline-flex", color: "var(--orange)" }}><CrownIcon size={14} /></span>
          </div>
          <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 13, marginBottom: 4, textAlign: "center" }}>
            Upload Sessions & Earn
          </p>
          <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 12, lineHeight: 1.5, textAlign: "center" }}>
            Host courses. Earn more.
          </p>
          <button style={{
            width: "auto", minWidth: 130, padding: "8px 14px",
            background: "linear-gradient(135deg, #FF7043, #FF9A6C)",
            border: "none", borderRadius: 9,
            color: "white", fontSize: 12, fontWeight: 700,
            fontFamily: "Plus Jakarta Sans", cursor: "pointer", transition: "opacity 0.2s", display: "inline-flex", justifyContent: "center",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          onClick={async () => {
            if (!user || user.role !== "alumni") {
              navigate("/signup", { state: { role: "alumni", plan: "premium" } });
              return;
            }
            try {
              await updateUser({ alumniPlan: "premium" });
              alert("🎉 You are now a Premium member!");
              window.location.reload();
            } catch (err1) {
              console.error("Profile update failed", err1);
              try {
                await API.patch("/users/upgrade-plan", { plan: "premium" });
                alert("🎉 You are now a Premium member!");
                window.location.reload();
              } catch (err2) {
                console.error("Upgrade failed", err2);
                const errMsg = err2?.response?.data?.message || err2.message || "Unknown error";
                alert("Upgrade failed. Details: " + errMsg);
              }
            }
          }}
          >
            Go Premium — ₹499 →
          </button>
        </div>
      )}

      {/* Premium member badge */}
      {isPremium && (
        <div style={{
          margin: "10px 0 0", padding: "12px",
          background: "linear-gradient(135deg, rgba(255,112,67,0.1), rgba(255,154,108,0.06))",
          border: "1px solid rgba(255,112,67,0.3)",
          borderRadius: 14, textAlign: "center",
        }}>
          <p style={{ marginBottom: 4, display: "inline-flex", color: "var(--orange)" }}><CrownIcon size={20} /></p>
          <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 12, color: "var(--orange)", letterSpacing: "0.08em" }}>PREMIUM</p>
          <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>All features unlocked</p>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
      `}</style>
    </div>
  );
}