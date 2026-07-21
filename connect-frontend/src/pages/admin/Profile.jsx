import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../context/AuthContext";

const ADMIN_STATS = [
  { label: "Users Managed",    value: "12,400", icon: "👥", color: "var(--purple-light)" },
  { label: "Alumni Verified",  value: "3,520",  icon: "✅", color: "var(--teal)"         },
  { label: "Courses Approved", value: "142",    icon: "📚", color: "var(--orange)"       },
  { label: "Revenue Tracked",  value: "₹2.4L",  icon: "💰", color: "#F5C842"             },
];

const PERMISSIONS = [
  { label: "User Management",       desc: "Create, suspend, verify accounts",     granted: true  },
  { label: "Content Moderation",    desc: "Review & remove posts, flag content",  granted: true  },
  { label: "Course Approval",       desc: "Approve/reject alumni courses",        granted: true  },
  { label: "Revenue Reports",       desc: "View full financial analytics",        granted: true  },
  { label: "College Partnerships",  desc: "Manage institutional tie-ups",         granted: true  },
  { label: "System Configuration",  desc: "Platform settings & feature flags",   granted: false },
];

const ACTIVITY_LOG = [
  { action: "Verified alumni profile",   target: "Priya Nair (Meta)",             time: "2m ago",    type: "verify"  },
  { action: "Approved course",           target: "System Design Masterclass",      time: "18m ago",   type: "course"  },
  { action: "Suspended user account",    target: "Spam account #8821",            time: "1h ago",    type: "flag"    },
  { action: "Onboarded college partner", target: "BITS Pilani",                   time: "3h ago",    type: "college" },
  { action: "Processed revenue payout",  target: "₹8,400 batch disbursed",        time: "Yesterday", type: "revenue" },
  { action: "Updated platform settings", target: "Updated notification settings", time: "2d ago",    type: "settings"},
];

const typeIcon  = { verify:"✅", course:"📚", revenue:"💰", flag:"🚩", college:"🏛️", settings:"⚙️" };
const typeColor = {
  verify:"rgba(0,229,195,0.12)", course:"rgba(124,92,252,0.12)",
  revenue:"rgba(245,200,66,0.12)", flag:"rgba(255,75,110,0.12)",
  college:"rgba(255,112,67,0.12)", settings:"rgba(155,126,255,0.12)",
};

export default function AdminProfile() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");

  const tabs = ["overview", "permissions", "activity"];

  return (
    <MainLayout>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 0" }}>

        {/* ── Admin Identity Banner ── */}
        <div style={{
          borderRadius: 20,
          background: "linear-gradient(135deg, rgba(0,229,195,0.08) 0%, rgba(124,92,252,0.08) 100%)",
          border: "1px solid rgba(0,229,195,0.2)",
          padding: "28px 32px",
          marginBottom: 24,
          position: "relative", overflow: "hidden",
          animation: "fadeUp 0.4s ease both",
        }}>
          {/* Decorative accent line */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: "linear-gradient(90deg, var(--teal), var(--purple), var(--orange))",
          }} />

          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: 18, flexShrink: 0,
              background: "linear-gradient(135deg, #00E5C3 0%, #7C5CFC 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30, fontWeight: 800,
              boxShadow: "0 8px 32px rgba(0,229,195,0.35)",
              border: "3px solid rgba(0,229,195,0.3)",
            }}>
              {(user?.name || "A")[0].toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 22, color: "var(--text)" }}>
                  {user?.name || "Admin User"}
                </h1>
                <span style={{
                  padding: "3px 10px", borderRadius: 99,
                  background: "rgba(0,229,195,0.15)", border: "1px solid rgba(0,229,195,0.35)",
                  color: "var(--teal)", fontSize: 11, fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--teal)", display: "inline-block" }} />
                  ADMIN
                </span>
                <span style={{
                  padding: "3px 10px", borderRadius: 99,
                  background: "rgba(0,229,195,0.08)", border: "1px solid rgba(0,229,195,0.2)",
                  color: "var(--text-3)", fontSize: 11, fontWeight: 600,
                }}>⚙️ Platform Manager</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 10 }}>
                {user?.email || "admin@connect.in"} · Full platform access
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["User Verification", "Revenue", "Moderation", "Partnerships"].map(tag => (
                  <span key={tag} style={{
                    padding: "3px 10px", borderRadius: 99,
                    background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
                    fontSize: 11, color: "var(--text-2)",
                  }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Admin ID badge */}
            <div style={{
              padding: "14px 18px", borderRadius: 14,
              background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,229,195,0.2)",
              textAlign: "center", minWidth: 130,
            }}>
              <p style={{ fontSize: 10, color: "var(--teal)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4 }}>ADMIN ID</p>
              <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 18, color: "var(--text)", letterSpacing: "0.05em" }}>
                #ADM-001
              </p>
              <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 4 }}>Since Jan 2024</p>
            </div>
          </div>
        </div>

        {/* ── Tab Switcher ── */}
        <div style={{
          display: "inline-flex", padding: 4, borderRadius: 12,
          background: "var(--bg-3)", border: "1px solid var(--border)",
          gap: 4, marginBottom: 24,
        }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 20px", borderRadius: 9, border: "none",
              fontFamily: "Plus Jakarta Sans", fontWeight: 600, fontSize: 13,
              cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize",
              background: tab === t ? "rgba(0,229,195,0.15)" : "transparent",
              color: tab === t ? "var(--teal)" : "var(--text-3)",
              boxShadow: tab === t ? "0 0 0 1px rgba(0,229,195,0.3)" : "none",
            }}>{t}</button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 0.3s ease" }}>
            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 14 }}>
              {ADMIN_STATS.map((s, i) => (
                <div key={i} style={{
                  padding: "18px", borderRadius: 16,
                  background: "var(--bg-3)", border: "1px solid var(--border)",
                  transition: "border-color 0.2s",
                  animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 60}ms`,
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <span style={{ fontSize: 22, display: "block", marginBottom: 10 }}>{s.icon}</span>
                  <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 22, color: s.color, marginBottom: 4 }}>{s.value}</p>
                  <p style={{ fontSize: 12, color: "var(--text-3)" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Platform scope card */}
            <div style={{
              padding: "24px 28px", borderRadius: 18,
              background: "var(--bg-3)", border: "1px solid var(--border)",
            }}>
              <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 16 }}>
                🛡️ Administrative Scope
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { icon: "🌐", label: "Platform-wide access", sub: "All roles & dashboards" },
                  { icon: "🔒", label: "No content restrictions", sub: "Full moderation control" },
                  { icon: "📊", label: "Revenue visibility", sub: "Total & per-alumni" },
                  { icon: "🏛️", label: "Partner management", sub: "College tie-ups & contracts" },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 12,
                    background: "var(--bg-4)", border: "1px solid var(--border)",
                  }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <div>
                      <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{item.label}</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)" }}>{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Permissions Tab ── */}
        {tab === "permissions" && (
          <div style={{
            background: "var(--bg-3)", border: "1px solid var(--border)",
            borderRadius: 18, overflow: "hidden",
            animation: "fadeIn 0.3s ease",
          }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>Access Permissions</h3>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>5 of 6 granted</span>
            </div>
            {PERMISSIONS.map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "16px 22px",
                borderBottom: i < PERMISSIONS.length - 1 ? "1px solid var(--border)" : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: p.granted ? "rgba(0,229,195,0.1)" : "rgba(255,75,110,0.08)",
                  border: `1px solid ${p.granted ? "rgba(0,229,195,0.25)" : "rgba(255,75,110,0.2)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                }}>{p.granted ? "✅" : "🔒"}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, color: "var(--text)", fontWeight: 600, marginBottom: 2 }}>{p.label}</p>
                  <p style={{ fontSize: 12, color: "var(--text-3)" }}>{p.desc}</p>
                </div>
                <span style={{
                  padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                  background: p.granted ? "rgba(0,229,195,0.1)" : "rgba(255,75,110,0.1)",
                  color: p.granted ? "var(--teal)" : "var(--danger)",
                  border: `1px solid ${p.granted ? "rgba(0,229,195,0.25)" : "rgba(255,75,110,0.25)"}`,
                }}>{p.granted ? "GRANTED" : "RESTRICTED"}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Activity Tab ── */}
        {tab === "activity" && (
          <div style={{
            background: "var(--bg-3)", border: "1px solid var(--border)",
            borderRadius: 18, overflow: "hidden",
            animation: "fadeIn 0.3s ease",
          }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>Recent Admin Activity</h3>
            </div>
            {ACTIVITY_LOG.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 22px",
                borderBottom: i < ACTIVITY_LOG.length - 1 ? "1px solid var(--border)" : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: typeColor[item.type],
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                }}>{typeIcon[item.type]}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, marginBottom: 2 }}>{item.action}</p>
                  <p style={{ fontSize: 12, color: "var(--text-3)" }}>{item.target}</p>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-3)", flexShrink: 0 }}>{item.time}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </MainLayout>
  );
}
