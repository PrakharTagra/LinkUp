import React from "react";

const variantStyles = {
  primary: {
    background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
    color: "white",
    border: "none",
    boxShadow: "0 4px 14px rgba(124,92,252,0.3)",
  },
  secondary: {
    background: "var(--bg-4)",
    color: "var(--text-2)",
    border: "1px solid var(--border)",
    boxShadow: "none",
  },
  outline: {
    background: "transparent",
    color: "var(--purple-light)",
    border: "1.5px solid rgba(124,92,252,0.4)",
    boxShadow: "none",
  },
  danger: {
    background: "rgba(255,75,110,0.1)",
    color: "var(--danger)",
    border: "1px solid rgba(255,75,110,0.3)",
    boxShadow: "none",
  },
  teal: {
    background: "linear-gradient(135deg, #00E5C3, #33DFB8)",
    color: "#000",
    border: "none",
    boxShadow: "0 4px 14px rgba(0,229,195,0.25)",
  },
};

const sizeStyles = {
  sm: { padding: "6px 14px", fontSize: 12 },
  md: { padding: "10px 20px", fontSize: 14 },
  lg: { padding: "13px 26px", fontSize: 16 },
};

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  style: extraStyle = {},
  className = "",
}) {
  const vs = variantStyles[variant] || variantStyles.primary;
  const ss = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      style={{
        ...vs, ...ss,
        borderRadius: 10,
        fontFamily: "Plus Jakarta Sans",
        fontWeight: 700,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.55 : 1,
        transition: "all 0.2s ease",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        ...extraStyle,
      }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.opacity = "0.88"; }}
      onMouseLeave={e => { if (!disabled && !loading) e.currentTarget.style.opacity = "1"; }}
    >
      {loading && (
        <span style={{
          width: 14, height: 14, borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.35)",
          borderTopColor: "white",
          display: "inline-block",
          animation: "spin 0.7s linear infinite",
        }} />
      )}
      {children}
    </button>
  );
}