import React from "react";

export default function Input({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  name,
  error,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <div style={{ width: "100%" }} className={className}>
      {label && (
        <label style={{
          display: "block", fontSize: 12,
          color: "var(--text-3)", fontWeight: 600,
          marginBottom: 7, letterSpacing: "0.02em",
        }}>{label}</label>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: "100%", padding: "11px 14px",
          background: disabled ? "var(--bg-4)" : "var(--bg-3)",
          border: `1.5px solid ${error ? "var(--danger)" : "var(--border)"}`,
          borderRadius: 11,
          color: disabled ? "var(--text-3)" : "var(--text)",
          fontSize: 14, outline: "none",
          fontFamily: "DM Sans",
          transition: "border-color 0.2s, box-shadow 0.2s",
          cursor: disabled ? "not-allowed" : "text",
        }}
        onFocus={e => {
          if (!disabled) {
            e.target.style.borderColor = error ? "var(--danger)" : "var(--purple)";
            e.target.style.boxShadow = error
              ? "0 0 0 3px rgba(255,75,110,0.12)"
              : "0 0 0 3px rgba(124,92,252,0.12)";
          }
        }}
        onBlur={e => {
          e.target.style.borderColor = error ? "var(--danger)" : "var(--border)";
          e.target.style.boxShadow = "none";
        }}
        {...props}
      />

      {error && (
        <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 5 }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}