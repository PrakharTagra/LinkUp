import React from "react";
import { Link, useLocation } from "react-router-dom";

const icons = {
  Dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Courses: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  Sessions: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  ),
  Analytics: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
};

const navItems = [
  { name: "Dashboard", path: "/admin"          },
  { name: "Users",     path: "/admin/users"    },
  { name: "Courses",   path: "/admin/courses"  },
  { name: "Sessions",  path: "/admin/sessions" },
  { name: "Analytics", path: "/admin/analytics"},
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <div style={{
      width: 220,
      background: "var(--bg-2)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      padding: "20px 12px",
      minHeight: "calc(100vh - 60px)",
      position: "sticky", top: 60,
      height: "calc(100vh - 60px)", overflowY: "auto",
    }} className="hidden-mobile">

      <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 8px", marginBottom: 12 }}>
        Admin Panel
      </p>

      <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 10,
                background: active ? "rgba(0,229,195,0.1)" : "transparent",
                border: `1px solid ${active ? "rgba(0,229,195,0.25)" : "transparent"}`,
                color: active ? "var(--teal)" : "var(--text-2)",
                transition: "all 0.15s", cursor: "pointer",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text)"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; } }}
              >
                <span style={{ opacity: active ? 1 : 0.6, display: "flex" }}>{icons[item.name]}</span>
                <span style={{ fontSize: 14, fontWeight: active ? 600 : 400 }}>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      <div style={{
        margin: "16px 0", padding: "14px",
        background: "rgba(0,229,195,0.06)", border: "1px solid rgba(0,229,195,0.18)", borderRadius: 12,
      }}>
        <p style={{ fontSize: 10, color: "var(--teal)", fontWeight: 700, marginBottom: 4 }}>ADMIN MODE</p>
        <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>Full platform access enabled.</p>
      </div>

      <style>{`@media (max-width: 768px) { .hidden-mobile { display: none !important; } }`}</style>
    </div>
  );
}