import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";

const COURSES_INIT = [
  { id: 1, title: "Crack FAANG Interviews",   instructor: "Rahul Sharma",  price: 1999, originalPrice: 2999, enrolled: 1240, status: "active",  category: "DSA"      },
  { id: 2, title: "Frontend Mastery",          instructor: "Ananya Verma",  price: 1499, originalPrice: 2199, enrolled: 840,  status: "active",  category: "Frontend" },
  { id: 3, title: "Data Science Zero to Hero", instructor: "Aman Gupta",    price: 2299, originalPrice: 3499, enrolled: 2100, status: "active",  category: "Data"     },
  { id: 4, title: "Backend with Node.js",      instructor: "Karan Joshi",   price: 1299, originalPrice: 1999, enrolled: 0,    status: "pending", category: "Backend"  },
  { id: 5, title: "System Design Masterclass", instructor: "Priya Nair",    price: 2999, originalPrice: 4999, enrolled: 620,  status: "active",  category: "Design"   },
];

const catColors = {
  DSA:      "rgba(124,92,252,0.1)",
  Frontend: "rgba(0,229,195,0.1)",
  Data:     "rgba(255,112,67,0.1)",
  Backend:  "rgba(245,200,66,0.1)",
  Design:   "rgba(255,75,110,0.1)",
};
const catText = {
  DSA: "var(--purple-light)", Frontend: "var(--teal)", Data: "var(--orange)", Backend: "#F5C842", Design: "var(--danger)",
};

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

export default function Courses() {
  const [courses, setCourses] = useState(COURSES_INIT);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", instructor: "", price: "", originalPrice: "", category: "DSA" });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd  = () => { setEditing(null); setForm({ title: "", instructor: "", price: "", originalPrice: "", category: "DSA" }); setShowModal(true); };
  const openEdit = (c)  => { setEditing(c.id); setForm({ title: c.title, instructor: c.instructor, price: String(c.price), originalPrice: String(c.originalPrice || ""), category: c.category }); setShowModal(true); };

  const handleSave = () => {
    if (!form.title || !form.price) return;
    if (editing) {
      setCourses(prev => prev.map(c => c.id === editing ? { ...c, ...form, price: Number(form.price), originalPrice: Number(form.originalPrice) || null } : c));
    } else {
      setCourses(prev => [...prev, { id: Date.now(), ...form, price: Number(form.price), originalPrice: Number(form.originalPrice) || null, enrolled: 0, status: "pending" }]);
    }
    setShowModal(false);
  };

  const approve = id => setCourses(prev => prev.map(c => c.id === id ? { ...c, status: "active" }   : c));
  const remove  = id => setCourses(prev => prev.filter(c => c.id !== id));

  const inputStyle = { width: "100%", padding: "10px 13px", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "DM Sans", transition: "border-color 0.2s" };
  const labelStyle = { display: "block", fontSize: 11, color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 };

  return (
    <MainLayout>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 0" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 24, color: "var(--text)", marginBottom: 4 }}>Manage Courses</h1>
            <p style={{ fontSize: 14, color: "var(--text-3)" }}>{courses.filter(c => c.status === "pending").length} pending approval</p>
          </div>
          <button onClick={openAdd} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 18px", background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
            border: "none", borderRadius: 12, color: "white", fontSize: 13, fontWeight: 700,
            fontFamily: "Plus Jakarta Sans", cursor: "pointer", boxShadow: "0 4px 20px rgba(124,92,252,0.35)", transition: "opacity 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >+ Add Course</button>
        </div>

        {/* Course cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {courses.map((c, i) => {
            const discount = c.originalPrice ? Math.round((1 - c.price / c.originalPrice) * 100) : null;
            const platformCut = Math.round(c.price * c.enrolled * 0.2);
            return (
              <div key={c.id} style={{
                background: "var(--bg-3)", border: `1px solid ${c.status === "pending" ? "rgba(245,200,66,0.35)" : "var(--border)"}`,
                borderRadius: 18, overflow: "hidden", transition: "all 0.2s",
                animation: "fadeUp 0.4s ease both", animationDelay: `${i * 60}ms`,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = c.status === "pending" ? "rgba(245,200,66,0.6)" : "rgba(124,92,252,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = c.status === "pending" ? "rgba(245,200,66,0.35)" : "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ height: 4, background: c.status === "pending" ? "linear-gradient(90deg, #F5C842, #FF7043)" : "linear-gradient(90deg, #7C5CFC, #FF7043)" }} />
                <div style={{ padding: "16px 18px" }}>
                  {/* Badges row */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                    <span style={{ padding: "2px 9px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: catColors[c.category] || "var(--bg-4)", color: catText[c.category] || "var(--text-2)" }}>{c.category}</span>
                    {c.status === "pending" && <span style={{ padding: "2px 9px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: "rgba(245,200,66,0.12)", color: "#F5C842", border: "1px solid rgba(245,200,66,0.3)" }}>⏳ Pending</span>}
                    {discount && <span style={{ padding: "2px 9px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: "rgba(0,229,195,0.1)", color: "var(--teal)" }}>{discount}% OFF</span>}
                  </div>

                  <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 4, lineHeight: 1.3 }}>{c.title}</h3>
                  <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 12 }}>by {c.instructor}</p>

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <span style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 18, color: "var(--text)" }}>₹{c.price.toLocaleString()}</span>
                      {c.originalPrice && <span style={{ fontSize: 12, color: "var(--text-3)", textDecoration: "line-through", marginLeft: 6 }}>₹{c.originalPrice.toLocaleString()}</span>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 12, color: "var(--teal)", fontWeight: 600 }}>₹{platformCut.toLocaleString()} cut</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)" }}>{c.enrolled} enrolled</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 7, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                    {c.status === "pending" && (
                      <button onClick={() => approve(c.id)} style={{
                        flex: 1, padding: "7px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                        background: "rgba(0,229,195,0.1)", border: "1px solid rgba(0,229,195,0.3)",
                        color: "var(--teal)", cursor: "pointer", fontFamily: "Plus Jakarta Sans", transition: "opacity 0.2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                      >✓ Approve</button>
                    )}
                    <button onClick={() => openEdit(c)} style={{
                      flex: 1, padding: "7px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                      background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.3)",
                      color: "var(--purple-light)", cursor: "pointer", fontFamily: "Plus Jakarta Sans", transition: "opacity 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >Edit</button>
                    <button onClick={() => remove(c.id)} style={{
                      flex: 1, padding: "7px", borderRadius: 9, fontSize: 12, fontWeight: 700,
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", animation: "fadeIn 0.2s" }}>
          <div style={{ width: "100%", maxWidth: 440, background: "var(--bg-2)", border: "1px solid var(--border-bright)", borderRadius: 22, overflow: "hidden", animation: "fadeUp 0.25s ease" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 17, color: "var(--text)" }}>{editing ? "Edit Course" : "Add New Course"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", display: "flex" }}><CloseIcon /></button>
            </div>
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 13 }}>
              {[
                { key: "title",       label: "Course Title",  placeholder: "e.g. Crack FAANG Interviews"      },
                { key: "instructor",  label: "Instructor",    placeholder: "e.g. Rahul Sharma"                },
              ].map(f => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <input value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "var(--purple)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                </div>
              ))}
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Price (₹)</label>
                  <input type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="1999" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "var(--purple)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Original Price</label>
                  <input type="number" value={form.originalPrice} onChange={e => set("originalPrice", e.target.value)} placeholder="2999" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "var(--purple)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={form.category} onChange={e => set("category", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  {["DSA", "Frontend", "Backend", "Data", "Design"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {form.price && (
                <div style={{ padding: "9px 13px", background: "rgba(0,229,195,0.06)", border: "1px solid rgba(0,229,195,0.2)", borderRadius: 9 }}>
                  <p style={{ fontSize: 12, color: "var(--text-2)" }}>
                    Platform cut (20%): <strong style={{ color: "var(--teal)" }}>₹{Math.round(Number(form.price) * 0.2)}</strong> per enrollment
                  </p>
                </div>
              )}
              <button onClick={handleSave} style={{
                width: "100%", padding: "12px", background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
                border: "none", borderRadius: 11, color: "white", fontSize: 14, fontWeight: 700,
                fontFamily: "Plus Jakarta Sans", cursor: "pointer", boxShadow: "0 4px 16px rgba(124,92,252,0.35)", transition: "opacity 0.2s", marginTop: 2,
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >{editing ? "Save Changes →" : "Create Course →"}</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}