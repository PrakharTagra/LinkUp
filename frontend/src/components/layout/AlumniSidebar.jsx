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
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
};

const allNavItems = [
  { name: "Feed",     path: "/alumni/dashboard/feed",     freeAccess: true  },
  { name: "MyPosts",  path: "/alumni/dashboard/my-posts", freeAccess: true, label: "My Posts" },
  { name: "ConnectionRequests", path: "/alumni/dashboard/connection-requests", freeAccess: true, label: "Requests" },
  { name: "Connections", path: "/alumni/dashboard/connections", freeAccess: true },
  { name: "Messages", path: "/alumni/dashboard/messages", freeAccess: true },
  { name: "Sessions",   path: "/alumni/dashboard/sessions",   freeAccess: false },
  { name: "Earnings",   path: "/alumni/dashboard/earnings",   freeAccess: false },
  { name: "Membership", path: "/alumni/dashboard/membership", freeAccess: true, label: "Membership" },
  { name: "Profile",    path: "/alumni/profile",              freeAccess: true  },
];

export default function AlumniSidebar({ onNavigate, isDrawer = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Read from alumniPlan
  const isPremium = user?.alumniPlan === "premium";

  useEffect(() => {
    let isMounted = true;

    const fetchSidebarData = async () => {
      try {
        const [connRes, msgRes] = await Promise.allSettled([
          API.get("/connections/pending"),
          API.get("/messages/conversations"),
        ]);

        if (isMounted && connRes.status === "fulfilled") {
          setPendingRequestsCount((connRes.value?.data?.pending || []).length);
        }

        if (isMounted && msgRes.status === "fulfilled") {
          const conversations = msgRes.value?.data?.conversations || [];
          const totalUnread = conversations.reduce(
            (sum, row) => sum + Number(row?.unread || 0),
            0
          );
          setUnreadMessagesCount(totalUnread);
        }
      } catch (err) {
        console.error("Sidebar data fetch error:", err);
      }
    };

    fetchSidebarData();
    const intervalId = setInterval(fetchSidebarData, 20000);
    const onFocus = () => fetchSidebarData();
    window.addEventListener("focus", onFocus);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [location.pathname]);

  const handleLockedClick = (targetPath) => {
    if (onNavigate) onNavigate();
    navigate(targetPath || "/alumni/dashboard/sessions");
  };

  const isItemActive = (item) => {
    const current = location.pathname;
    if (current === item.path) return true;
    if ((item.name === "Sessions" || item.name === "MyPosts") && current === "/alumni/dashboard/item-detail") {
      return true;
    }
    return false;
  };

  return (
    <aside
      className={`linkup-sidebar ${isDrawer ? "" : "hidden-mobile"}`}
      style={{
        width: isDrawer ? "100%" : 240,
        flexShrink: 0,
        background: isDrawer ? "transparent" : "var(--bg-2)",
        borderRight: isDrawer ? "none" : "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: isDrawer ? "0 0 20px 0" : "16px 12px 24px 12px",
        position: isDrawer ? "static" : "sticky",
        top: 60,
        height: isDrawer ? "auto" : "calc(100vh - 60px)",
        maxHeight: isDrawer ? "none" : "calc(100vh - 60px)",
        overflowY: "auto",
        overflowX: "hidden",
        boxSizing: "border-box",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.12) transparent",
      }}
    >
      {/* Section label + plan badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", marginBottom: 10 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
          Alumni Panel
        </p>
        {isPremium ? (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 99,
            background: "rgba(255,112,67,0.12)",
            color: "var(--orange)",
            border: "1px solid rgba(255,112,67,0.3)",
          }}>
            <CrownIcon size={12} /> PRO
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
      <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {allNavItems.map(item => {
          const isLocked = !isPremium && !item.freeAccess;
          const active = isItemActive(item) && !isLocked;

          let badgeCount = 0;
          if (item.name === "ConnectionRequests") badgeCount = pendingRequestsCount;
          if (item.name === "Messages") badgeCount = unreadMessagesCount;

          if (isLocked) {
            return (
              <div
                key={item.path}
                onClick={() => handleLockedClick(item.path)}
                title="Premium feature — click to upgrade"
                style={{
                  display: "flex", alignItems: "center",
                  padding: "8px 12px", borderRadius: 10,
                  background: "rgba(255,112,67,0.03)",
                  border: "1px solid rgba(255,112,67,0.1)",
                  color: "var(--text-3)",
                  cursor: "pointer", transition: "all 0.15s ease",
                  justifyContent: "space-between",
                  opacity: 0.72,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,112,67,0.08)";
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.borderColor = "rgba(255,112,67,0.25)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,112,67,0.03)";
                  e.currentTarget.style.opacity = "0.72";
                  e.currentTarget.style.borderColor = "rgba(255,112,67,0.1)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span style={{ opacity: 0.5, display: "flex", flexShrink: 0 }}>{icons[item.name]}</span>
                  <span style={{ fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.label || item.name}
                  </span>
                </div>
                <span style={{ color: "var(--orange)", opacity: 0.8, display: "flex", flexShrink: 0 }}>
                  {icons.Lock}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => onNavigate && onNavigate()}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  display: "flex", alignItems: "center",
                  padding: "8px 12px", borderRadius: 10,
                  background: active ? "rgba(255,112,67,0.12)" : "transparent",
                  border: `1px solid ${active ? "rgba(255,112,67,0.3)" : "transparent"}`,
                  color: active ? "var(--orange)" : "var(--text-2)",
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                  justifyContent: "space-between",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "var(--text)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-2)";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span style={{ opacity: active ? 1 : 0.65, display: "flex", flexShrink: 0 }}>
                    {icons[item.name]}
                  </span>
                  <span style={{
                    fontSize: 13.5,
                    fontWeight: active ? 600 : 400,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {item.label || item.name}
                  </span>
                </div>
                {badgeCount > 0 && (
                  <span style={{
                    background: "var(--orange)", color: "white",
                    borderRadius: 99, fontSize: 10, fontWeight: 700,
                    padding: "1px 6px", minWidth: 18, height: 18,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {badgeCount}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Spacer to push promotional card down if there's spare vertical space */}
      <div style={{ flex: 1, minHeight: 14 }} />

      {/* Free plan notice & Upgrade card — only shown when not premium */}
      {!isPremium && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          <div style={{
            padding: "9px 11px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--border)",
            borderRadius: 10,
          }}>
            <p style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.45, margin: 0 }}>
              🔒 <strong style={{ color: "var(--text-2)" }}>Free plan:</strong> Feed & Chat enabled. Sessions & Earnings unlock on Premium.
            </p>
          </div>

          <div style={{
            padding: "12px",
            background: "linear-gradient(135deg, rgba(255,112,67,0.12), rgba(245,200,66,0.06))",
            border: "1px solid rgba(255,112,67,0.25)",
            borderRadius: 12,
            textAlign: "center",
          }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
              <span style={{ display: "inline-flex", color: "var(--orange)" }}><CrownIcon size={16} /></span>
            </div>
            <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 12.5, margin: "0 0 4px 0", color: "var(--text)" }}>
              Upload Sessions & Earn
            </p>
            <p style={{ fontSize: 11, color: "var(--text-2)", margin: "0 0 10px 0", lineHeight: 1.4 }}>
              Host courses, mentor students and monetize your expertise.
            </p>
            <button
              style={{
                width: "100%", padding: "7px 10px",
                background: "linear-gradient(135deg, #FF7043, #FF9A6C)",
                border: "none", borderRadius: 8,
                color: "white", fontSize: 12, fontWeight: 700,
                fontFamily: "Plus Jakarta Sans", cursor: "pointer",
                transition: "opacity 0.2s ease, transform 0.15s ease",
                display: "inline-flex", justifyContent: "center", alignItems: "center",
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
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
                  console.error("Profile update fallback trigger", err1);
                  try {
                    await API.patch("/users/upgrade-plan", { plan: "premium" });
                    alert("🎉 You are now a Premium member!");
                    window.location.reload();
                  } catch (err2) {
                    const errMsg = err2?.response?.data?.message || err2.message || "Unknown error";
                    alert("Upgrade notice: " + errMsg);
                  }
                }
              }}
            >
              Go Premium — ₹499 →
            </button>
          </div>
        </div>
      )}

      {/* Premium member status card */}
      {isPremium && (
        <div style={{
          marginTop: 10,
          padding: "12px",
          background: "linear-gradient(135deg, rgba(255,112,67,0.1), rgba(255,154,108,0.04))",
          border: "1px solid rgba(255,112,67,0.25)",
          borderRadius: 12,
          textAlign: "center",
        }}>
          <p style={{ margin: "0 0 4px 0", display: "inline-flex", color: "var(--orange)" }}>
            <CrownIcon size={18} />
          </p>
          <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 12, color: "var(--orange)", letterSpacing: "0.08em", margin: 0 }}>
            PREMIUM ACTIVE
          </p>
          <p style={{ fontSize: 11, color: "var(--text-3)", margin: "3px 0 0 0" }}>
            All mentor features unlocked
          </p>
        </div>
      )}
    </aside>
  );
}
