import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import StudentSidebar from "./StudentSidebar";
import AlumniSidebar from "./AlumniSidebar";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../../context/AuthContext";

export default function MainLayout({ children }) {
  const { user } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();

  const renderSidebar = (onItemClick, isDrawer = false) => {
    if (!user) return null;
    if (user.role === "student") return <StudentSidebar onNavigate={onItemClick} isDrawer={isDrawer} />;
    if (user.role === "alumni")  return <AlumniSidebar onNavigate={onItemClick} isDrawer={isDrawer} />;
    if (user.role === "admin")   return <AdminSidebar onNavigate={onItemClick} isDrawer={isDrawer} />;
  };

  const getBottomNavItems = () => {
    if (!user) return [];
    if (user.role === "student") {
      return [
        { label: "Feed", path: "/feed", icon: "📰" },
        { label: "Network", path: "/networking", icon: "🤝" },
        { label: "Career", path: "/career-path", icon: "🎯" },
        { label: "Courses", path: "/academics", icon: "📚" },
        { label: "Chat", path: "/messages", icon: "💬" },
      ];
    }
    if (user.role === "alumni") {
      return [
        { label: "Feed", path: "/alumni/dashboard/feed", icon: "📰" },
        { label: "Posts", path: "/alumni/dashboard/my-posts", icon: "✍️" },
        { label: "Requests", path: "/alumni/dashboard/connection-requests", icon: "👥" },
        { label: "Chat", path: "/alumni/dashboard/messages", icon: "💬" },
        { label: "Profile", path: "/alumni/profile", icon: "👤" },
      ];
    }
    return [
      { label: "Dashboard", path: "/admin", icon: "📊" },
      { label: "Users", path: "/admin/users", icon: "👥" },
      { label: "Courses", path: "/admin/courses", icon: "📚" },
      { label: "Analytics", path: "/admin/analytics", icon: "📈" },
    ];
  };

  const bottomItems = getBottomNavItems();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar onToggleSidebar={() => setMobileDrawerOpen(prev => !prev)} />

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div
          className="mobile-nav-drawer-overlay"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="mobile-nav-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 16, color: "var(--text)" }}>Menu</span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-3)",
                  fontSize: 22,
                  cursor: "pointer",
                  padding: 4,
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>
            {renderSidebar(() => setMobileDrawerOpen(false), true)}
          </div>
        </div>
      )}

      <div className={bottomItems.length ? "main-layout-body" : ""} style={{ display: "flex", flex: 1 }}>
        {renderSidebar()}
        <main className="main-content-pad" style={{ flex: 1, padding: "0 24px", overflowY: "auto", minWidth: 0 }}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {bottomItems.length > 0 && (
        <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
          {bottomItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  gap: 3,
                  flex: 1,
                  height: "100%",
                  color: active ? "var(--purple-light)" : "var(--text-3)",
                  transition: "color 0.15s ease",
                }}
              >
                <span style={{ fontSize: 17, lineHeight: 1 }}>{item.icon}</span>
                <span style={{
                  fontSize: 10.5,
                  fontWeight: active ? 700 : 500,
                  fontFamily: "Plus Jakarta Sans",
                  letterSpacing: "0.01em",
                }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}