import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "var(--bg)", color: "var(--text)",
      padding: "40px 20px", textAlign: "center", position: "relative", overflow: "hidden",
    }}>
      {/* Background orbs */}
      <div style={{
        position: "absolute", top: "20%", left: "30%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,92,252,0.12) 0%, transparent 70%)",
        filter: "blur(40px)", pointerEvents: "none",
        animation: "float 7s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "15%", right: "25%",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,112,67,0.1) 0%, transparent 70%)",
        filter: "blur(35px)", pointerEvents: "none",
        animation: "float 9s ease-in-out infinite reverse",
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, animation: "fadeUp 0.5s ease" }}>
        {/* 404 */}
        <div style={{ marginBottom: 24 }}>
          <span style={{
            fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 120, lineHeight: 1,
            background: "linear-gradient(135deg, #7C5CFC, #FF7043)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            display: "block",
          }}>404</span>
        </div>

        <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 28, color: "var(--text)", marginBottom: 12 }}>
          Page not found
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.7, maxWidth: 400, marginBottom: 36 }}>
          Looks like this page took a detour. The link might be broken or the page may have moved.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate(-1)} style={{
            padding: "11px 24px", borderRadius: 12,
            background: "transparent", border: "1.5px solid var(--border)",
            color: "var(--text-2)", fontSize: 14, fontWeight: 600,
            fontFamily: "Plus Jakarta Sans", cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--purple)"; e.currentTarget.style.color = "var(--purple-light)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}
          >← Go Back</button>

          <button onClick={() => navigate("/")} style={{
            padding: "11px 24px", borderRadius: 12,
            background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
            border: "none", color: "white", fontSize: 14, fontWeight: 700,
            fontFamily: "Plus Jakarta Sans", cursor: "pointer", transition: "opacity 0.2s",
            boxShadow: "0 4px 20px rgba(124,92,252,0.4)",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >Go to Home →</button>
        </div>
      </div>
    </div>
  );
}