import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getConversations } from "../../services/chatService";

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
  P2P: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
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

export default function StudentSidebar() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const refreshUnreadCount = async () => {
      try {
        const data = await getConversations();
        const totalUnread = (data?.conversations || []).reduce(
          (sum, row) => sum + Number(row?.unread || 0),
          0
        );

        if (isMounted) {
          setUnreadCount(totalUnread);
        }
      } catch {
        if (isMounted) {
          setUnreadCount(0);
        }
      }
    };

    refreshUnreadCount();
    const intervalId = setInterval(refreshUnreadCount, 15000);
    const onFocus = () => refreshUnreadCount();

    window.addEventListener("focus", onFocus);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [location.pathname]);

  const computedNavItems = navItems.map((item) =>
    item.name === "Messages" ? { ...item, badge: unreadCount > 0 ? unreadCount : undefined } : item
  );

  return (
    <div style={{
      width: 220,
      background: "var(--bg-2)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "20px 12px",
      minHeight: "calc(100vh - 60px)",
      position: "sticky",
      top: 60,
      height: "calc(100vh - 60px)",
      overflowY: "auto",
    }} className="hidden-mobile">

      {/* Section label */}
      <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 8px", marginBottom: 12 }}>
        Student Portal
      </p>

      {/* Nav items */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {computedNavItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 10,
                background: active ? "rgba(124,92,252,0.12)" : "transparent",
                border: `1px solid ${active ? "rgba(124,92,252,0.25)" : "transparent"}`,
                color: active ? "var(--purple-light)" : "var(--text-2)",
                transition: "all 0.15s",
                cursor: "pointer",
                justifyContent: "space-between",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text)"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; } }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ opacity: active ? 1 : 0.6, display: "flex" }}>{icons[item.name] || icons.MyLearning}</span>
                  <span style={{ fontSize: 14, fontWeight: active ? 600 : 400 }}>{item.label || item.name}</span>
                </div>
                {item.badge && (
                  <span style={{
                    background: "var(--purple)", color: "white",
                    borderRadius: 99, fontSize: 10, fontWeight: 700,
                    padding: "1px 6px", minWidth: 18, textAlign: "center",
                  }}>{item.badge}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Upgrade CTA */}
      <div style={{
        margin: "16px 0",
        padding: "16px",
        background: "linear-gradient(135deg, rgba(124,92,252,0.15), rgba(255,112,67,0.1))",
        border: "1px solid rgba(124,92,252,0.25)",
        borderRadius: 14,
      }}>
        <div style={{ fontSize: 16, marginBottom: 6 }}>⭐</div>
        <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
          Explore Membership Plans
        </p>
        <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 12, lineHeight: 1.5 }}>
          Compare plans to unlock mentorship perks, priority support, and exclusive student benefits.
        </p>
        <Link
          to="/membership-alumni"
          style={{
            width: "100%",
            padding: "8px",
            background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
            borderRadius: 9,
            color: "white",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "Plus Jakarta Sans",
            cursor: "pointer",
            transition: "opacity 0.2s",
            textDecoration: "none",
            display: "block",
            textAlign: "center",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          View Memberships →
        </Link>
      </div>

      <style>{`
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
      `}</style>
    </div>
  );
}