import React from "react";
import { useNavigate } from "react-router-dom";
const connectLogo = "/connect-logo.png";

const LINKS = [
  { label: "About",   href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Terms",   href: "#" },
  { label: "Support", href: "#" },
];

const LinkedInIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const GithubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>
);

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer style={{
      borderTop: "1px solid var(--border)",
      background: "var(--bg-2)",
      padding: "20px 28px",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 14,
      }}>
        {/* Logo + brand + copyright */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={connectLogo}
            alt="Connect"
            style={{
              height: 32,
              width: "auto",
              objectFit: "contain",
              mixBlendMode: "screen",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{
              fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 15,
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #4FC8FF 0%, #0A8FE8 45%, #00C9A7 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              lineHeight: 1.1,
            }}>Connect</span>
            <span style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>
              Learn · Mentor · Succeed
            </span>
          </div>
          <span style={{
            fontSize: 11.5, color: "var(--text-3)", marginLeft: 8,
            borderLeft: "1px solid var(--border)", paddingLeft: 12,
          }}>
            © {new Date().getFullYear()} All rights reserved.
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 22 }}>
          {LINKS.map(l => (
            <a key={l.label} href={l.href} style={{
              fontSize: 13, color: "var(--text-3)", textDecoration: "none",
              transition: "color 0.15s", fontWeight: 500,
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#4FC8FF"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}
            >{l.label}</a>
          ))}
        </div>

        {/* Social icons */}
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { Icon: LinkedInIcon, label: "LinkedIn" },
            { Icon: TwitterIcon, label: "Twitter" },
            { Icon: GithubIcon, label: "GitHub" },
          ].map(({ Icon, label }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              style={{
                width: 32, height: 32,
                borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-3)",
                border: "1px solid var(--border)",
                transition: "all 0.18s",
                textDecoration: "none",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "#4FC8FF";
                e.currentTarget.style.borderColor = "rgba(79,200,255,0.4)";
                e.currentTarget.style.background = "rgba(79,200,255,0.07)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "var(--text-3)";
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}