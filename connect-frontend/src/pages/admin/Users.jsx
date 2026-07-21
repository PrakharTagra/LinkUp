import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";

const USERS_INIT = [
  { id: 1, name: "Rahul Sharma",   email: "rahul@iitd.ac.in",    role: "alumni",  college: "IIT Delhi",   verified: true,  status: "active",    joined: "Jan 2026", sessions: 32, revenue: "₹45K" },
  { id: 2, name: "Ananya Verma",   email: "ananya@dtu.ac.in",    role: "alumni",  college: "DTU",         verified: false, status: "pending",   joined: "Feb 2026", sessions: 24, revenue: "₹32K" },
  { id: 3, name: "Priya Nair",     email: "priya@iitb.ac.in",    role: "alumni",  college: "IIT Bombay",  verified: true,  status: "active",    joined: "Jan 2026", sessions: 18, revenue: "₹22K" },
  { id: 4, name: "Arjun Mehta",    email: "arjun@bits.ac.in",    role: "student", college: "BITS Pilani", verified: false, status: "active",    joined: "Mar 2026", sessions: 0,  revenue: "—"    },
  { id: 5, name: "Neha Singh",     email: "neha@nit.ac.in",      role: "student", college: "NIT Trichy",  verified: false, status: "active",    joined: "Mar 2026", sessions: 0,  revenue: "—"    },
  { id: 6, name: "Karan Joshi",    email: "karan@alumni.in",     role: "alumni",  college: "IIT Bombay",  verified: false, status: "suspended", joined: "Dec 2025", sessions: 5,  revenue: "₹5K"  },
];

const roleColors = {
  alumni:  { bg: "rgba(255,112,67,0.1)",  border: "rgba(255,112,67,0.3)",  text: "var(--orange)"      },
  student: { bg: "rgba(124,92,252,0.1)",  border: "rgba(124,92,252,0.3)",  text: "var(--purple-light)" },
};
const statusColors = {
  active:    { bg: "rgba(0,229,195,0.1)",   text: "var(--teal)",   label: "Active"    },
  pending:   { bg: "rgba(245,200,66,0.1)",  text: "#F5C842",       label: "Pending"   },
  suspended: { bg: "rgba(255,75,110,0.1)",  text: "var(--danger)", label: "Suspended" },
};

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function Users() {
  const [users, setUsers]       = useState(USERS_INIT);
  const [search, setSearch]     = useState("");
  const [roleFilter, setRole]   = useState("all");
  const [statusFilter, setStatus] = useState("all");

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter   === "all" || u.role   === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const verify  = id => setUsers(prev => prev.map(u => u.id === id ? { ...u, verified: true,  status: "active" }    : u));
  const suspend = id => setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "suspended" } : u));
  const restore = id => setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "active"    } : u));
  const remove  = id => setUsers(prev => prev.filter(u => u.id !== id));

  const sel = (val, cur) => ({
    padding: "7px 14px", borderRadius: 99, cursor: "pointer", fontSize: 13,
    fontFamily: "DM Sans", outline: "none",
    background: val === cur ? "var(--purple)" : "var(--bg-3)",
    border: `1px solid ${val === cur ? "var(--purple)" : "var(--border)"}`,
    color: val === cur ? "white" : "var(--text-2)",
    transition: "all 0.2s",
  });

  return (
    <MainLayout>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 0" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 24, color: "var(--text)", marginBottom: 4 }}>Manage Users</h1>
            <p style={{ fontSize: 14, color: "var(--text-3)" }}>{filtered.length} of {users.length} users shown</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}><SearchIcon /></span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
                style={{ padding: "8px 12px 8px 32px", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "DM Sans", width: 200, transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "var(--purple)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>
            {/* Role filter */}
            {["all", "student", "alumni"].map(r => (
              <button key={r} onClick={() => setRole(r)} style={sel(r, roleFilter)}>
                {r === "all" ? "All Roles" : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
            {/* Status filter */}
            {["all", "active", "pending", "suspended"].map(s => (
              <button key={s} onClick={() => setStatus(s)} style={sel(s, statusFilter)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 1.5fr",
            padding: "12px 20px", borderBottom: "1px solid var(--border)",
            background: "var(--bg-4)",
          }}>
            {["Name", "Email", "Role", "Status", "Sessions", "Revenue", "Actions"].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--text-3)" }}>
              <p style={{ fontSize: 32, marginBottom: 10 }}>🔍</p>
              <p>No users match your filters.</p>
            </div>
          ) : (
            filtered.map((user, i) => {
              const rc = roleColors[user.role];
              const sc = statusColors[user.status];
              return (
                <div key={user.id} style={{
                  display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 1.5fr",
                  padding: "14px 20px", alignItems: "center",
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                  transition: "background 0.15s",
                  animation: "fadeUp 0.3s ease both", animationDelay: `${i * 40}ms`,
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* Name */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                      background: `${rc.bg}`, border: `1px solid ${rc.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: rc.text, fontWeight: 700, fontSize: 13, fontFamily: "Plus Jakarta Sans",
                    }}>{user.name[0]}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{user.name}</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)" }}>🎓 {user.college}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <p style={{ fontSize: 12, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>

                  {/* Role */}
                  <span style={{
                    display: "inline-block", padding: "3px 10px", borderRadius: 99,
                    fontSize: 11, fontWeight: 700,
                    background: rc.bg, border: `1px solid ${rc.border}`, color: rc.text,
                    textTransform: "capitalize",
                  }}>{user.role}</span>

                  {/* Status */}
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                    background: sc.bg, color: sc.text,
                  }}>
                    {user.verified && user.role === "alumni" && "✓ "}{sc.label}
                  </span>

                  {/* Sessions */}
                  <p style={{ fontSize: 13, color: "var(--text-2)" }}>{user.sessions}</p>

                  {/* Revenue */}
                  <p style={{ fontSize: 13, color: user.revenue !== "—" ? "var(--teal)" : "var(--text-3)", fontWeight: user.revenue !== "—" ? 600 : 400 }}>{user.revenue}</p>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {user.role === "alumni" && !user.verified && (
                      <button onClick={() => verify(user.id)} style={{
                        padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                        background: "rgba(0,229,195,0.1)", border: "1px solid rgba(0,229,195,0.3)",
                        color: "var(--teal)", cursor: "pointer", transition: "opacity 0.2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                      >✓ Verify</button>
                    )}
                    {user.status === "active" ? (
                      <button onClick={() => suspend(user.id)} style={{
                        padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                        background: "rgba(255,200,66,0.1)", border: "1px solid rgba(255,200,66,0.3)",
                        color: "#F5C842", cursor: "pointer", transition: "opacity 0.2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                      >Suspend</button>
                    ) : user.status === "suspended" ? (
                      <button onClick={() => restore(user.id)} style={{
                        padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                        background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.3)",
                        color: "var(--purple-light)", cursor: "pointer", transition: "opacity 0.2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                      >Restore</button>
                    ) : null}
                    <button onClick={() => remove(user.id)} style={{
                      padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                      background: "rgba(255,75,110,0.1)", border: "1px solid rgba(255,75,110,0.3)",
                      color: "var(--danger)", cursor: "pointer", transition: "opacity 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >Delete</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}