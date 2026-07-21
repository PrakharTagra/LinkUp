import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser, googleAuth } from "../../services/authService";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

const roles = [
  { value: "student", label: "Student", desc: "Access mentorship & courses" },
  { value: "alumni",  label: "Alumni",  desc: "Share knowledge & earn"    },
  { value: "admin",   label: "Admin",   desc: "Platform management"        },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError("");
        const userInfo = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        
        const data = await googleAuth({
          name: userInfo.data.name,
          email: userInfo.data.email,
          avatar: userInfo.data.picture,
          role: form.role
        });
        
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user._id);
        login(data.user);
        
        if (data.user.role === "student") navigate("/feed");
        else if (data.user.role === "alumni") navigate("/alumni/dashboard/feed");
        else navigate("/admin");
      } catch (err) {
        setError(err.response?.data?.message || "Google Login failed");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Google Login Failed")
  });

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const data = await loginUser({
        email: form.email,
        password: form.password,
        role: form.role,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user._id);
      login(data.user);

      if (data.user.role === "student") navigate("/feed");
      else if (data.user.role === "alumni") navigate("/alumni/dashboard/feed");
      else navigate("/admin");

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const roleAccent = { student: "var(--purple)", alumni: "var(--orange)", admin: "var(--teal)" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)", color: "var(--text)" }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: 1, display: "none", position: "relative", overflow: "hidden",
        background: "linear-gradient(145deg, #0F1018 0%, #14151F 100%)",
        borderRight: "1px solid var(--border)",
      }} className="left-panel">
        {/* Orbs */}
        <div style={{
          position: "absolute", top: "20%", left: "20%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,92,252,0.25) 0%, transparent 70%)",
          filter: "blur(30px)", animation: "float 6s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "20%", right: "15%",
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,112,67,0.2) 0%, transparent 70%)",
          filter: "blur(25px)", animation: "float 8s ease-in-out infinite reverse",
        }} />

        <div style={{
          position: "relative", zIndex: 1, height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "48px",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/connect-logo.png" alt="Connect" style={{ height: 150, width: "auto", objectFit: "contain" }} />
          </div>

          {/* Main copy */}
          <div>
            <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 38, lineHeight: 1.15, marginBottom: 16 }}>
              Your career bridge<br /><span className="grad-text">starts here</span>
            </h2>
            <p style={{ color: "var(--text-2)", fontSize: 16, lineHeight: 1.7, marginBottom: 36 }}>
              Join 12,000+ students and 3,500+ verified alumni already building real careers together.
            </p>

            {/* Mini stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { text: "3,500+ verified alumni profiles" },
                { text: "Membership-first student alumni engagement" },
                { text: "Host paid sessions and workshops" },
                { text: "Partner-college learning ecosystem" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg, #7C5CFC, #00E5C3)", display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "var(--text-2)" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 13, color: "var(--text-3)" }}>© {new Date().getFullYear()} Connect Platform</p>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px 10px",
      }}>
        <div className="anim-fadeUp opacity-0" style={{ width: "100%", maxWidth: 420 }}>

          {/* Back to Home */}
          <button
            onClick={() => navigate("/")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-3)", fontSize: 13, fontWeight: 500,
              padding: "4px 0", marginBottom: 6,
              transition: "color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back to home
          </button>

          <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 30, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: "var(--text-2)", fontSize: 15, marginBottom: 28 }}>
            Don't have an account?{" "}
            <span style={{ color: "var(--purple-light)", cursor: "pointer", fontWeight: 600 }}
              onClick={() => navigate("/signup")}>Sign up free</span>
          </p>

          {/* Role selector */}
          <div style={{ marginBottom: 4 }}>
            <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 10, fontWeight: 500 }}>
              Logging in as
            </p>
            <div style={{ display: "flex", gap: 8, padding: 6, background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 14 }}>
              {roles.map(r => (
                <button key={r.value}
                  onClick={() => set("role", r.value)}
                  style={{
                    flex: 1, padding: "10px 8px", borderRadius: 10,
                    border: `1px solid ${form.role === r.value ? roleAccent[r.value] : "transparent"}`,
                    background: form.role === r.value
                      ? `linear-gradient(135deg, ${roleAccent[r.value]}22, rgba(255,255,255,0.02))`
                      : "transparent",
                    color: form.role === r.value ? "var(--text)" : "var(--text-3)",
                    cursor: "pointer", transition: "all 0.2s",
                    textAlign: "center",
                  }}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.02em" }}>{r.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, color: "var(--text-2)", fontWeight: 500, marginBottom: 7 }}>
              Email address
            </label>
            <input
              type="email"
              className="dark-input"
              placeholder="you@email.com"
              value={form.email}
              onChange={e => set("email", e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <label style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500 }}>Password</label>
              <span style={{ fontSize: 13, color: "var(--purple-light)", cursor: "pointer" }}>Forgot?</span>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPwd ? "text" : "password"}
                className="dark-input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => set("password", e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{ paddingRight: 44 }}
              />
              <button
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "var(--text-3)", cursor: "pointer",
                  display: "flex", alignItems: "center",
                }}
              ><EyeIcon open={showPwd} /></button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "12px 16px", borderRadius: 10, marginBottom: 16,
              background: "rgba(255,75,110,0.1)", border: "1px solid rgba(255,75,110,0.3)",
              color: "var(--danger)", fontSize: 13,
            }}>{error}</div>
          )}

          {/* Submit */}
          <button
            className="btn-purple"
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: "100%", fontSize: 16, padding: "14px", justifyContent: "center",
              display: "flex", alignItems: "center", gap: 8,
              opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            <span style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: 8 }}>
              {loading
                ? <><span className="anim-spin" style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", display: "block" }}></span> Logging in…</>
                : "Log In →"
              }
            </span>
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Google */}
          <button className="btn-ghost" onClick={() => loginWithGoogle()} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p style={{ textAlign: "center", marginTop: 28, fontSize: 12, color: "var(--text-3)" }}>
            By logging in you agree to our{" "}
            <span style={{ color: "var(--purple-light)", cursor: "pointer" }}>Terms</span> &{" "}
            <span style={{ color: "var(--purple-light)", cursor: "pointer" }}>Privacy Policy</span>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 860px) {
          .left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}