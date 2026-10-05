import React, { useState } from "react";
import Navbar from "./Navbar";
import StudentSidebar from "./StudentSidebar";
import AlumniSidebar from "./AlumniSidebar";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../../context/AuthContext";

export default function MainLayout({ children }) {
  const { user } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const renderSidebar = (onItemClick, isDrawer = false) => {
    if (!user) return null;
    if (user.role === "student") return <StudentSidebar onNavigate={onItemClick} isDrawer={isDrawer} />;
    if (user.role === "alumni")  return <AlumniSidebar onNavigate={onItemClick} isDrawer={isDrawer} />;
    if (user.role === "admin")   return <AdminSidebar onNavigate={onItemClick} isDrawer={isDrawer} />;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)", width: "100%", overflowX: "hidden" }}>
      <Navbar onToggleSidebar={() => setMobileDrawerOpen(prev => !prev)} />

      {/* Mobile Drawer Overlay for existing sidebar */}
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

      <div style={{ display: "flex", flex: 1, minWidth: 0, width: "100%" }}>
        {renderSidebar()}
        <main className="main-content-pad" style={{ flex: 1, padding: "0 24px", overflowY: "auto", minWidth: 0, width: "100%" }}>
          {children}
        </main>
      </div>
    </div>
  );
}