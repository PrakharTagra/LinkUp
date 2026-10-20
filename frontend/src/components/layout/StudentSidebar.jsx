import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getConversations } from "../../services/chatService";
import API from "../../utils/api";

const icons = {
  CareerPath: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  SkillGap: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-6" />
    </svg>
  ),
  Feed: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Networking: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
  Academics: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  MyLearning: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 3H20v18H6.5A2.5 2.5 0 0 0 4 20.5v-15A2.5 2.5 0 0 1 6.5 3Z" />
    </svg>
  ),
  Messages: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
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
};

const navItems = [
  { name: "CareerPath", label: "Career Path", path: "/career-path" },
  { name: "SkillGap", label: "Skill Gap", path: "/skill-gap" },
  { name: "Feed", path: "/feed" },
  { name: "Networking", path: "/networking" },
  { name: "Connections", path: "/connections" },
  { name: "Academics", path: "/academics" },
  { name: "MyLearning", label: "My Learning", path: "/my-learning" },
  { name: "Membership", label: "Memberships", path: "/membership-alumni" },
  { name: "Messages", path: "/messages" },
  { name: "Profile", path: "/profile" },
];

export default function StudentSidebar({ onNavigate, isDrawer = false }) {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const refreshSidebarData = async () => {
      try {
        const [convRes, connRes] = await Promise.allSettled([
          getConversations(),
          API.get("/connections/pending-all").catch(() => API.get("/connections/pending")),
        ]);

        if (isMounted && convRes.status === "fulfilled") {
          const totalUnread = (convRes.value?.conversations || []).reduce(
            (sum, row) => sum + Number(row?.unread || 0),
            0
          );
          setUnreadCount(totalUnread);
        }

        if (isMounted && connRes.status === "fulfilled") {
          const pending = connRes.value?.data?.pending || [];
          setPendingCount(pending.length);
        }
      } catch {
        if (isMounted) {
          setUnreadCount(0);
          setPendingCount(0);
        }
      }
    };

    refreshSidebarData();
    const intervalId = setInterval(refreshSidebarData, 20000);
    const onFocus = () => refreshSidebarData();

    window.addEventListener("focus", onFocus);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [location.pathname]);

  const isItemActive = (item) => {
    const current = location.pathname;
    if (current === item.path) return true;
    if (item.name === "Academics" && (current === "/course-detail" || current === "/session-workshop-detail" || current.startsWith("/live/"))) {
      return true;
    }
    if (item.name === "Networking" && current === "/alumni-profile") {
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
        position: isDrawer ? "static" : "fixed",
        top: isDrawer ? "auto" : 60,
        left: isDrawer ? "auto" : 0,
        bottom: isDrawer ? "auto" : 0,
        zIndex: isDrawer ? "auto" : 40,
        height: isDrawer ? "auto" : "calc(100vh - 60px)",
        maxHeight: isDrawer ? "none" : "calc(100vh - 60px)",
        overflowY: "auto",
        overflowX: "hidden",
        boxSizing: "border-box",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.12) transparent",
      }}
    >
      {/* Section label */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", marginBottom: 10 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
          Student Portal
        </p>
        <span style={{
          fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
          background: "rgba(124,92,252,0.12)",
          color: "var(--purple-light)",
          border: "1px solid rgba(124,92,252,0.25)",
        }}>
          ACTIVE
        </span>
      </div>

      {/* Nav items */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {navItems.map(item => {
          const active = isItemActive(item);

          let badgeCount = 0;
          if (item.name === "Messages") badgeCount = unreadCount;
          if (item.name === "Connections") badgeCount = pendingCount;

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
                  background: active ? "rgba(124,92,252,0.12)" : "transparent",
                  border: `1px solid ${active ? "rgba(124,92,252,0.3)" : "transparent"}`,
                  color: active ? "var(--purple-light)" : "var(--text-2)",
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
                    {icons[item.name] || icons.MyLearning}
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
                    background: "var(--purple)", color: "white",
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

      {/* Upgrade CTA */}
      <div style={{
        marginTop: 10,
        padding: "12px",
        background: "linear-gradient(135deg, rgba(124,92,252,0.14), rgba(255,112,67,0.08))",
        border: "1px solid rgba(124,92,252,0.22)",
        borderRadius: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
          <span style={{ fontSize: 14 }}>⭐</span>
          <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 12.5, margin: 0, color: "var(--text)" }}>
            Explore Memberships
          </p>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-2)", margin: "0 0 10px 0", lineHeight: 1.4 }}>
          Access 1:1 alumni mentorship, mock interviews, and courses.
        </p>
        <Link
          to="/membership-alumni"
          onClick={() => onNavigate && onNavigate()}
          style={{
            width: "100%",
            padding: "7px 10px",
            background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
            borderRadius: 8,
            color: "white",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "Plus Jakarta Sans",
            cursor: "pointer",
            transition: "opacity 0.2s ease, transform 0.15s ease",
            textDecoration: "none",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            boxSizing: "border-box",
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
        >
          View Plans →
        </Link>
      </div>
    </aside>
  );
}
