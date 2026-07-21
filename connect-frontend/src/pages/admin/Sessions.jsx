import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";

const SESSIONS_INIT = [
  { id: 1, title: "System Design Live",    instructor: "Rahul Sharma",  price: 999,  enrolled: 15, seats: 20, date: "25 Apr 2026", status: "upcoming", revenue: "₹2,997" },
  { id: 2, title: "React Workshop",        instructor: "Ananya Verma",  price: 799,  enrolled: 15, seats: 15, date: "28 Apr 2026", status: "full",     revenue: "₹2,397" },
  { id: 3, title: "Data Science Intro",    instructor: "Aman Gupta",    price: 499,  enrolled: 8,  seats: 30, date: "30 Apr 2026", status: "upcoming", revenue: "₹798"   },
  { id: 4, title: "DSA Bootcamp",          instructor: "Karan Joshi",   price: 1200, enrolled: 0,  seats: 25, date: "2 May 2026",  status: "pending",  revenue: "₹0"     },
];

const statusStyles = {
  upcoming: { bg: "rgba(124,92,252,0.1)", border: "rgba(124,92,252,0.3)", text: "var(--purple-light)", label: "Upcoming" },
  full:     { bg: "rgba(255,112,67,0.1)", border: "rgba(255,112,67,0.3)", text: "var(--orange)",       label: "Full"     },
  live:     { bg: "rgba(255,75,110,0.1)", border: "rgba(255,75,110,0.3)", text: "var(--danger)",       label: "Live"     },
  pending:  { bg: "rgba(245,200,66,0.1)", border: "rgba(245,200,66,0.3)", text: "#F5C842",             label: "Pending"  },
};

export default function AdminSessions() {
  const [sessions, setSessions] = useState(SESSIONS_INIT);

  const approve = id => setSessions(prev => prev.map(s => s.id === id ? { ...s, status: "upcoming" } : s));
  const goLive  = id => setSessions(prev => prev.map(s => s.id === id ? { ...s, status: "live"     } : s));
  const remove  = id => setSessions(prev => prev.filter(s => s.id !== id));

  const totalRevenue = sessions.reduce((acc, s) => acc + (s.enrolled * s.price * 0.2), 0);

  return (
    <MainLayout>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 0" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 24, color: "var(--text)", marginBottom: 4 }}>Manage Sessions</h1>
            <p style={{ fontSize: 14, color: "var(--text-3)" }}>Monitor all upcoming sessions and workshops</p>
          </div>
          <div style={{
            padding: "10px 16px", background: "rgba(0,229,195,0.08)", border: "1px solid rgba(0,229,195,0.2)", borderRadius: 12,
            textAlign: "right",
          }}>
            <p style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 2 }}>Platform revenue (20%)</p>
            <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 18, color: "var(--teal)" }}>
              ₹{Math.round(totalRevenue).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Summary chips */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Total", val: sessions.length, color: "var(--text-2)", bg: "var(--bg-3)" },
            { label: "Upcoming", val: sessions.filter(s => s.status === "upcoming").length, color: "var(--purple-light)", bg: "rgba(124,92,252,0.1)" },
            { label: "Live", val: sessions.filter(s => s.status === "live").length, color: "var(--danger)", bg: "rgba(255,75,110,0.1)" },
            { label: "Pending", val: sessions.filter(s => s.status === "pending").length, color: "#F5C842", bg: "rgba(245,200,66,0.1)" },
          ].map(c => (
            <div key={c.label} style={{ padding: "8px 16px", borderRadius: 10, background: c.bg, border: "1px solid var(--border)" }}>
              <span style={{ fontSize: 11, color: "var(--text-3)", marginRight: 6 }}>{c.label}</span>
              <span style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 15, color: c.color }}>{c.val}</span>
            </div>
          ))}
        </div>

        {/* Sessions list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sessions.map((s, i) => {
            const ss = statusStyles[s.status] || statusStyles.upcoming;
            const pct = Math.round((s.enrolled / s.seats) * 100);
            const cut = Math.round(s.enrolled * s.price * 0.2);
            return (
              <div key={s.id} style={{
                background: "var(--bg-3)", border: "1px solid var(--border)",
                borderRadius: 18, overflow: "hidden", transition: "border-color 0.2s",
                animation: "fadeUp 0.35s ease both", animationDelay: `${i * 60}ms`,
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <div style={{ height: 4, background: `linear-gradient(90deg, ${ss.text}, var(--purple))` }} />
                <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                      <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{s.title}</h3>
                      <span style={{ padding: "2px 9px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: ss.bg, border: `1px solid ${ss.border}`, color: ss.text }}>
                        {s.status === "live" && <span className="live-dot" style={{ marginRight: 4 }} />}{ss.label}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: "var(--text-2)" }}>👤 {s.instructor}</span>
                      <span style={{ fontSize: 12, color: "var(--text-3)" }}>📅 {s.date}</span>
                      <span style={{ fontSize: 12, color: "var(--text-3)" }}>💰 ₹{s.price}/seat</span>
                    </div>
                  </div>

                  {/* Enrollment progress */}
                  <div style={{ width: 140, flexShrink: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: "var(--text-3)" }}>{s.enrolled}/{s.seats} enrolled</span>
                      <span style={{ fontSize: 11, color: pct >= 80 ? "var(--orange)" : "var(--text-3)", fontWeight: pct >= 80 ? 700 : 400 }}>{pct}%</span>
                    </div>
                    <div style={{ height: 5, background: "var(--bg-4)", borderRadius: 99 }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${pct >= 80 ? "#FF7043" : "#7C5CFC"}, ${pct >= 80 ? "#FF9A6C" : "#9B7EFF"})`, transition: "width 0.5s" }} />
                    </div>
                  </div>

                  {/* Revenue */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 15, color: "var(--teal)" }}>₹{cut.toLocaleString()}</p>
                    <p style={{ fontSize: 11, color: "var(--text-3)" }}>platform cut</p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
                    {s.status === "pending" && (
                      <button onClick={() => approve(s.id)} style={{
                        padding: "6px 12px", borderRadius: 9, fontSize: 12, fontWeight: 600,
                        background: "rgba(0,229,195,0.1)", border: "1px solid rgba(0,229,195,0.3)",
                        color: "var(--teal)", cursor: "pointer", fontFamily: "Plus Jakarta Sans", transition: "opacity 0.2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                      >✓ Approve</button>
                    )}
                    {s.status === "upcoming" && (
                      <button onClick={() => goLive(s.id)} style={{
                        padding: "6px 12px", borderRadius: 9, fontSize: 12, fontWeight: 600,
                        background: "rgba(255,75,110,0.1)", border: "1px solid rgba(255,75,110,0.3)",
                        color: "var(--danger)", cursor: "pointer", fontFamily: "Plus Jakarta Sans", transition: "opacity 0.2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                      >▶ Go Live</button>
                    )}
                    <button onClick={() => remove(s.id)} style={{
                      padding: "6px 12px", borderRadius: 9, fontSize: 12, fontWeight: 600,
                      background: "rgba(255,75,110,0.1)", border: "1px solid rgba(255,75,110,0.3)",
                      color: "var(--danger)", cursor: "pointer", fontFamily: "Plus Jakarta Sans", transition: "opacity 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}