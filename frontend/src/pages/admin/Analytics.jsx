import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";

const STATS = [
  { label: "Total Users",     value: "12,400", icon: "👥", trend: "+8%"  },
  { label: "Revenue (month)", value: "₹2.4L",  icon: "💰", trend: "+18%" },
  { label: "Courses Sold",    value: "1,320",  icon: "📚", trend: "+23%" },
  { label: "Active Sessions", value: "48",     icon: "🎥", trend: "+12%" },
];

const BAR_DATA = [
  { label: "Oct", value: 62, revenue: 180000 },
  { label: "Nov", value: 78, revenue: 220000 },
  { label: "Dec", value: 54, revenue: 160000 },
  { label: "Jan", value: 85, revenue: 260000 },
  { label: "Feb", value: 91, revenue: 290000 },
  { label: "Mar", value: 76, revenue: 240000 },
  { label: "Apr", value: 100, revenue: 320000 },
];

const TOP_ALUMNI = [
  { name: "Rahul Sharma",   sessions: 32, revenue: "₹45K", college: "IIT Delhi"   },
  { name: "Ananya Verma",   sessions: 24, revenue: "₹32K", college: "DTU"         },
  { name: "Aman Gupta",     sessions: 28, revenue: "₹38K", college: "NIT Trichy"  },
  { name: "Priya Nair",     sessions: 18, revenue: "₹22K", college: "IIT Bombay"  },
];

export default function Analytics() {
  const [activeMetric, setActiveMetric] = useState("Sessions");
  const maxVal = Math.max(...BAR_DATA.map(d => d.value));

  return (
    <MainLayout>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 0" }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 24, color: "var(--text)", marginBottom: 4 }}>Analytics</h1>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>Platform performance, revenue and growth</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 32 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              background: "var(--bg-3)", border: "1px solid var(--border)",
              borderRadius: 16, padding: "18px",
              animation: "fadeUp 0.4s ease both", animationDelay: `${i * 60}ms`,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(0,229,195,0.1)", color: "var(--teal)", border: "1px solid rgba(0,229,195,0.2)" }}>{s.trend}</span>
              </div>
              <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 20, color: "var(--text)", marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: "var(--text-3)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 18, padding: "22px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>Monthly Overview</h2>
            <div style={{ display: "flex", gap: 6 }}>
              {["Sessions", "Revenue"].map(m => (
                <button key={m} onClick={() => setActiveMetric(m)} style={{
                  padding: "5px 14px", borderRadius: 99,
                  background: activeMetric === m ? "var(--purple)" : "transparent",
                  border: `1px solid ${activeMetric === m ? "var(--purple)" : "var(--border)"}`,
                  color: activeMetric === m ? "white" : "var(--text-2)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  fontFamily: "Plus Jakarta Sans",
                }}>{m}</button>
              ))}
            </div>
          </div>

          {/* Bars */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 160 }}>
            {BAR_DATA.map((d, i) => {
              const pct = (d.value / maxVal) * 100;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, color: "var(--text-3)" }}>
                    {activeMetric === "Revenue" ? `₹${Math.round(d.revenue / 1000)}K` : d.value}
                  </span>
                  <div style={{ width: "100%", position: "relative", height: 120, display: "flex", alignItems: "flex-end" }}>
                    <div style={{
                      width: "100%",
                      height: `${pct}%`,
                      background: i === BAR_DATA.length - 1
                        ? "linear-gradient(180deg, #7C5CFC, #9B7EFF)"
                        : "linear-gradient(180deg, rgba(124,92,252,0.5), rgba(124,92,252,0.2))",
                      borderRadius: "6px 6px 0 0",
                      transition: "height 0.5s ease",
                      position: "relative",
                    }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-3)" }}>{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Alumni */}
        <div style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>Top Performing Alumni</h2>
          </div>
          {TOP_ALUMNI.map((a, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 20px",
              borderBottom: i < TOP_ALUMNI.length - 1 ? "1px solid var(--border)" : "none",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{
                width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                background: i === 0 ? "rgba(245,200,66,0.15)" : "var(--bg-4)",
                border: `1px solid ${i === 0 ? "rgba(245,200,66,0.3)" : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, fontFamily: "Plus Jakarta Sans",
                color: i === 0 ? "#F5C842" : "var(--text-3)",
              }}>#{i + 1}</span>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, #7C5CFC44, #FF704344)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--purple-light)", fontWeight: 700, fontFamily: "Plus Jakarta Sans", fontSize: 14,
              }}>{a.name[0]}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{a.name}</p>
                <p style={{ fontSize: 12, color: "var(--text-3)" }}>{a.college}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 13, color: "var(--teal)", fontWeight: 700 }}>{a.revenue}</p>
                <p style={{ fontSize: 11, color: "var(--text-3)" }}>{a.sessions} sessions</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}