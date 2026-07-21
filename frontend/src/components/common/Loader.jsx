import React from "react";

export default function Loader({ size = "md", fullScreen = false, text = "" }) {
  const dims = { sm: 16, md: 24, lg: 40 };
  const bw   = { sm: 2,  md: 2.5, lg: 4 };
  const d    = dims[size] || 24;
  const b    = bw[size]   || 2.5;

  const spinner = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{
        width: d, height: d, borderRadius: "50%",
        border: `${b}px solid rgba(124,92,252,0.2)`,
        borderTopColor: "var(--purple)",
        animation: "spin 0.7s linear infinite",
      }} />
      {text && <p style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "DM Sans" }}>{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "rgba(8,9,14,0.85)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>{spinner}</div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 0" }}>
      {spinner}
    </div>
  );
}