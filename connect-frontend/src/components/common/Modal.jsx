import React, { useEffect } from "react";

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const sizes = { sm: 400, md: 500, lg: 620, xl: 760 };

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  useEffect(() => {
    const handleEsc = e => { if (e.key === "Escape") onClose(); };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
      animation: "fadeIn 0.2s ease",
    }}>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }} />

      {/* Modal box */}
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: sizes[size],
        maxHeight: "calc(100vh - 40px)",
        background: "var(--bg-2)",
        border: "1px solid var(--border-bright)",
        borderRadius: 22,
        overflow: "hidden",
        animation: "fadeUp 0.25s cubic-bezier(.22,.68,0,1.2)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px",
          borderBottom: "1px solid var(--border)",
        }}>
          <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 17, color: "var(--text)" }}>
            {title}
          </h2>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8,
            background: "transparent", border: "1px solid var(--border)",
            color: "var(--text-3)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-4)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-3)"; }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "22px", maxHeight: "calc(100vh - 140px)", overflowY: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}