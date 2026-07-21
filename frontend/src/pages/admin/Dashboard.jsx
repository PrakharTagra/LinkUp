import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import { useNavigate } from "react-router-dom";

const STATS = [
  { label: "Total Users",     value: "12,400", icon: "👥", trend: "+8%",  color: "var(--purple-light)" },
  { label: "Verified Alumni", value: "3,520",  icon: "✅", trend: "+5%",  color: "var(--teal)"         },
  { label: "Active Courses",  value: "142",    icon: "📚", trend: "+12%", color: "var(--orange)"       },
  { label: "Revenue (20%)",   value: "₹2.4L",  icon: "💰", trend: "+18%", color: "#F5C842"             },
];

const QUICK_ACTIONS = [
  { label: "Manage Users",    path: "/admin/users",    icon: "👥", color: "rgba(124,92,252,0.1)", border: "rgba(124,92,252,0.25)", text: "var(--purple-light)", desc: "Verify alumni, suspend accounts" },
  { label: "Review Courses",  path: "/admin/courses",  icon: "📚", color: "rgba(255,112,67,0.1)", border: "rgba(255,112,67,0.25)", text: "var(--orange)",        desc: "Approve, price, manage listings" },
  { label: "Live Sessions",   path: "/admin/sessions", icon: "🎥", color: "rgba(0,229,195,0.1)",  border: "rgba(0,229,195,0.25)",  text: "var(--teal)",          desc: "Monitor upcoming sessions"      },
  { label: "Analytics",       path: "/admin/analytics",icon: "📈", color: "rgba(245,200,66,0.1)", border: "rgba(245,200,66,0.25)", text: "#F5C842",              desc: "Revenue, retention, trends"     },
];

const RECENT_ACTIVITY = [
  { action: "New alumni verified",      who: "Priya Nair (Meta)",          time: "2m ago",  type: "verify"   },
  { action: "Course submitted",         who: "Rahul Sharma – System Design", time: "14m ago", type: "course"   },
  { action: "Revenue payment",          who: "₹1,200 from Frontend Mastery", time: "1h ago",  type: "revenue"  },
  { action: "Student flagged content",  who: "Post #4821 – review needed",  time: "2h ago",  type: "flag"     },
  { action: "College partner joined",   who: "BITS Pilani onboarded",       time: "Yesterday",type: "college"  },
];

const typeIcon = { verify: "✅", course: "📚", revenue: "💰", flag: "🚩", college: "🏛️" };
const typeColor = {
  verify: "rgba(0,229,195,0.1)", course: "rgba(124,92,252,0.1)",
  revenue: "rgba(245,200,66,0.1)", flag: "rgba(255,75,110,0.1)", college: "rgba(255,112,67,0.1)",
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 0" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 24, color: "var(--text)", marginBottom: 4 }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>Platform overview and quick actions</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 32 }}>
          {STATS.map((stat, i) => (
            <div key={i} style={{
              background: "var(--bg-3)", border: "1px solid var(--border)",
              borderRadius: 16, padding: "18px",
              animation: "fadeUp 0.4s ease both", animationDelay: `${i * 70}ms`,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{stat.icon}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                  background: "rgba(0,229,195,0.1)", color: "var(--teal)",
                  border: "1px solid rgba(0,229,195,0.2)",
                }}>{stat.trend}</span>
              </div>
              <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 22, color: stat.color, marginBottom: 4 }}>{stat.value}</p>
              <p style={{ fontSize: 12, color: "var(--text-3)" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Quick Actions */}
          <div>
            <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 14 }}>Quick Actions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {QUICK_ACTIONS.map((a, i) => (
                <div key={i}
                  onClick={() => navigate(a.path)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px", borderRadius: 14,
                    background: "var(--bg-3)", border: "1px solid var(--border)",
                    cursor: "pointer", transition: "all 0.2s",
                    animation: "fadeUp 0.4s ease both", animationDelay: `${i * 60}ms`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = a.border; e.currentTarget.style.transform = "translateX(4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateX(0)"; }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                    background: a.color, border: `1px solid ${a.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                  }}>{a.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 14, color: a.text, marginBottom: 2 }}>{a.label}</p>
                    <p style={{ fontSize: 12, color: "var(--text-3)" }}>{a.desc}</p>
                  </div>
                  <span style={{ color: "var(--text-3)", fontSize: 18 }}>›</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 14 }}>Recent Activity</h2>
            <div style={{
              background: "var(--bg-3)", border: "1px solid var(--border)",
              borderRadius: 16, overflow: "hidden",
            }}>
              {RECENT_ACTIVITY.map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 16px",
                  borderBottom: i < RECENT_ACTIVITY.length - 1 ? "1px solid var(--border)" : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    background: typeColor[item.type],
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                  }}>{typeIcon[item.type]}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, marginBottom: 2 }}>{item.action}</p>
                    <p style={{ fontSize: 12, color: "var(--text-3)" }}>{item.who}</p>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-3)", flexShrink: 0 }}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}