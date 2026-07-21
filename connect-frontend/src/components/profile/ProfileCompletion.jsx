import React from "react";

export default function ProfileCompletion({ percent = 0, missing = [], onCompleteProfile }) {
  const clampedPercent = Math.max(0, Math.min(100, Math.round(percent)));
  const progressColor = clampedPercent >= 80 ? "#10B981" : clampedPercent >= 50 ? "#F59E0B" : "#EF4444";
  const missingPreview = missing.slice(0, 3).join(", ");

  return (
    <div
      style={{
        padding: "14px 16px",
        border: "1px solid var(--border)",
        borderRadius: 14,
        background: "var(--bg-3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: `conic-gradient(${progressColor} ${clampedPercent * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "var(--bg-2)",
              display: "grid",
              placeItems: "center",
              fontSize: 11,
              fontWeight: 800,
              color: "var(--text)",
              fontFamily: "Plus Jakarta Sans",
            }}
          >
            {clampedPercent}%
          </div>
        </div>

        <div>
          <h4 style={{ margin: 0, marginBottom: 3, fontSize: 14, color: "var(--text)", fontWeight: 700 }}>
            Profile Completion
          </h4>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-3)", lineHeight: 1.45 }}>
            {clampedPercent === 100
              ? "Great work. Your profile looks complete."
              : `Add ${missing.length} more section${missing.length > 1 ? "s" : ""}${missingPreview ? `: ${missingPreview}` : ""}`}
          </p>
        </div>
      </div>

      {clampedPercent < 100 && (
        <button
          onClick={onCompleteProfile}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
            color: "white",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "Plus Jakarta Sans",
            cursor: "pointer",
          }}
        >
          Complete Profile
        </button>
      )}
    </div>
  );
}
