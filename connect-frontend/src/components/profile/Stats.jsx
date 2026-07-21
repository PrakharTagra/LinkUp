import React from "react";

export default function Stats({ stats = [] }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
      gap: 12,
    }}>
      {stats.map((item, i) => (
        <div key={i} style={{
          background: "var(--bg-3)",
          border: "1px solid var(--border)",
          borderRadius: 16, padding: "18px 16px",
          textAlign: "center",
          transition: "border-color 0.2s, transform 0.2s",
          animation: "fadeUp 0.4s ease both",
          animationDelay: `${i * 70}ms`,
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,92,252,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <p style={{
            fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 22,
            background: "linear-gradient(135deg, var(--purple-light), var(--teal))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", marginBottom: 6,
          }}>{item.value}</p>
          <p style={{ fontSize: 12, color: "var(--text-3)" }}>{item.label}</p>
        </div>
      ))}
    </div>
  );
}