import React from "react";
import Navbar from "./Navbar";
import StudentSidebar from "./StudentSidebar";
import AlumniSidebar from "./AlumniSidebar";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../../context/AuthContext";

export default function MainLayout({ children }) {
  const { user } = useAuth();

  const renderSidebar = () => {
    if (!user) return null;
    if (user.role === "student") return <StudentSidebar />;
    if (user.role === "alumni")  return <AlumniSidebar />;
    if (user.role === "admin")   return <AdminSidebar />;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ display: "flex", flex: 1 }}>
        {renderSidebar()}
        <main style={{ flex: 1, padding: "0 24px", overflowY: "auto", minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}