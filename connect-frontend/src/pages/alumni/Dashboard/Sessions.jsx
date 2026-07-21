import React, { useRef, useState, useEffect } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import AlumniModelGate from "../../../components/common/AlumniModelGate";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  combineDateTime,
  formatAcademicDate,
  isItemLive,
  createVideoEntry
} from "../../../utils/academicCatalog";
import courseThumbnail from "../../../assets/hero.png";
import API from "../../../utils/api";

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const inputStyle = {
  width: "100%", padding: "11px 14px", boxSizing: "border-box",
  background: "var(--bg-3)", border: "1px solid var(--border)",
  borderRadius: 11, color: "var(--text)", fontSize: 14,
  outline: "none", fontFamily: "DM Sans", transition: "border-color 0.2s",
};
const labelStyle = { fontSize: 12, color: "var(--text-3)", fontWeight: 600, display: "block", marginBottom: 7 };

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <Field label={label}>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={inputStyle}
        onFocus={e => e.target.style.borderColor = "var(--purple)"}
        onBlur={e => e.target.style.borderColor = "var(--border)"}
      />
    </Field>
  );
}
function TextareaField({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <Field label={label}>
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
        onFocus={e => e.target.style.borderColor = "var(--purple)"}
        onBlur={e => e.target.style.borderColor = "var(--border)"}
      />
    </Field>
  );
}

function UploadPreview({ label, value, onChange, accept, helperText, buttonLabel, aspectRatio = "16 / 9", fit = "contain" }) {
  const inputId = `${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${Math.random().toString(16).slice(2)}`;

  return (
    <Field label={label}>
      <div style={{ display: "grid", gap: 10 }}>
        {value ? (
          <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-4)" }}>
            <img src={value} alt={label} style={{ display: "block", width: "100%", aspectRatio, objectFit: fit, background: "var(--bg-2)" }} />
          </div>
        ) : (
          <div style={{ padding: 16, borderRadius: 14, border: "1px dashed rgba(124,92,252,0.35)", background: "rgba(124,92,252,0.06)" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{buttonLabel}</p>
            <p style={{ fontSize: 12, color: "var(--text-3)" }}>{helperText}</p>
          </div>
        )}
        <label htmlFor={inputId} style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(124,92,252,0.25)",
          background: "rgba(124,92,252,0.08)", color: "var(--purple-light)", cursor: "pointer",
          fontSize: 13, fontWeight: 700,
        }}>
          {value ? "Change thumbnail" : "Add thumbnail"}
        </label>
        <input
          id={inputId}
          type="file"
          accept={accept}
          style={{ display: "none" }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => onChange(reader.result);
              reader.readAsDataURL(file);
            }
            e.target.value = "";
          }}
        />
      </div>
    </Field>
  );
}

function ThumbnailControls({ ratio, setRatio, fit, setFit }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <Field label="Thumbnail Ratio">
        <select
          value={ratio}
          onChange={e => setRatio(e.target.value)}
          style={{ ...inputStyle, appearance: "none" }}
        >
          {[
            ["16 / 9", "Wide 16:9"],
            ["4 / 5", "Portrait 4:5"],
            ["1 / 1", "Square 1:1"],
          ].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </Field>
      <Field label="Thumbnail Fit">
        <select
          value={fit}
          onChange={e => setFit(e.target.value)}
          style={{ ...inputStyle, appearance: "none" }}
        >
          <option value="contain">Contain</option>
          <option value="cover">Cover</option>
        </select>
      </Field>
    </div>
  );
}

// ─────────────────────────────────────────────
// SESSION MODAL
// ─────────────────────────────────────────────
function SessionModal({ onClose, onSave }) {
  const videoInputRef = useRef(null);
  const [form, setForm] = useState({
    title: "", description: "", date: "", time: "", duration: "", price: "", seats: "", videos: [], thumbnail: "", thumbnailRatio: "16 / 9", thumbnailFit: "contain",
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.title && form.date && form.time && form.duration && form.price && form.thumbnail;

  const addVideos = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setForm(p => ({ ...p, videos: [...p.videos, ...files.map(createVideoEntry)] }));
    }
    e.target.value = "";
  };

  const handleSave = () => {
    if (!valid) return;
    const payload = {
      type: "session",
      title: form.title, description: form.description,
      date: form.date, time: form.time, duration: parseInt(form.duration) || 60,
      price: Number(form.price),
      totalSeats: Number(form.seats) || 20,
      thumbnail: form.thumbnail
    };
    onSave(payload);
    onClose();
  };

  return (
    <ModalShell title="Create Live Session" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <UploadPreview
          label="Session Thumbnail *"
          value={form.thumbnail}
          onChange={v => set("thumbnail", v)}
          accept="image/*"
          helperText="Add a cover image that will appear on student and alumni cards, details, and lists."
          buttonLabel="Upload the session thumbnail"
          aspectRatio={form.thumbnailRatio}
          fit={form.thumbnailFit}
        />
        <ThumbnailControls
          ratio={form.thumbnailRatio}
          setRatio={v => set("thumbnailRatio", v)}
          fit={form.thumbnailFit}
          setFit={v => set("thumbnailFit", v)}
        />
        <InputField label="Session Title *" value={form.title} onChange={v => set("title", v)} placeholder="e.g. System Design Deep Dive" />
        <TextareaField label="Description" value={form.description} onChange={v => set("description", v)} placeholder="What will students learn from this session?" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <InputField label="Date *" value={form.date} onChange={v => set("date", v)} type="date" />
          <InputField label="Time *" value={form.time} onChange={v => set("time", v)} type="time" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <InputField label="Duration *" value={form.duration} onChange={v => set("duration", v)} placeholder="e.g. 2 hours" />
          <InputField label="Total Seats" value={form.seats} onChange={v => set("seats", v)} placeholder="20" type="number" />
        </div>
        <Field label="Session Videos">
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={() => videoInputRef.current?.click()} style={{
              padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(124,92,252,0.25)",
              background: "rgba(124,92,252,0.08)", color: "var(--purple-light)", cursor: "pointer",
              fontSize: 13, fontWeight: 700,
            }}>
              Upload Videos
            </button>
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>Attach intro clips, live-room recordings, or reference videos</span>
          </div>
          <input ref={videoInputRef} type="file" accept="video/*" multiple style={{ display: "none" }} onChange={addVideos} />
          {form.videos.length > 0 && (
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              {form.videos.map(video => (
                <div key={video.id} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--bg-4)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: 13, color: "var(--text-2)" }}>{video.name}</span>
                </div>
              ))}
            </div>
          )}
        </Field>
        <InputField label="Price (₹) *" value={form.price} onChange={v => set("price", v)} placeholder="999" type="number" />
        {form.price && (
          <div style={{ padding: "10px 14px", background: "rgba(0,229,195,0.06)", border: "1px solid rgba(0,229,195,0.2)", borderRadius: 10 }}>
            <p style={{ fontSize: 12, color: "var(--text-2)" }}>
              Your share: <strong style={{ color: "var(--teal)" }}>₹{Math.round(form.price * 0.8)}</strong> per enrollment
            </p>
          </div>
        )}
        <SubmitBtn label="Create Session" onClick={handleSave} disabled={!valid} />
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────
// WORKSHOP MODAL
// ─────────────────────────────────────────────
function WorkshopModal({ onClose, onSave }) {
  const videoInputRef = useRef(null);
  const [form, setForm] = useState({
    title: "", description: "", date: "", time: "", duration: "", price: "", seats: "", prerequisites: "", outcome: "", videos: [], thumbnail: "", thumbnailRatio: "16 / 9", thumbnailFit: "contain",
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.title && form.date && form.time && form.duration && form.price && form.thumbnail;

  const addVideos = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setForm(p => ({ ...p, videos: [...p.videos, ...files.map(createVideoEntry)] }));
    }
    e.target.value = "";
  };

  const handleSave = () => {
    if (!valid) return;
    const payload = {
      type: "workshop",
      title: form.title, description: form.description,
      date: form.date, time: form.time, duration: parseInt(form.duration) || 120,
      price: Number(form.price),
      totalSeats: Number(form.seats) || 30,
      thumbnail: form.thumbnail
    };
    onSave(payload);
    onClose();
  };

  return (
    <ModalShell title="Create Workshop" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <UploadPreview
          label="Workshop Thumbnail *"
          value={form.thumbnail}
          onChange={v => set("thumbnail", v)}
          accept="image/*"
          helperText="This cover image will be shown wherever the workshop appears."
          buttonLabel="Upload the workshop thumbnail"
          aspectRatio={form.thumbnailRatio}
          fit={form.thumbnailFit}
        />
        <ThumbnailControls
          ratio={form.thumbnailRatio}
          setRatio={v => set("thumbnailRatio", v)}
          fit={form.thumbnailFit}
          setFit={v => set("thumbnailFit", v)}
        />
        <InputField label="Workshop Title *" value={form.title} onChange={v => set("title", v)} placeholder="e.g. React Hooks – Hands-on Workshop" />
        <TextareaField label="Description" value={form.description} onChange={v => set("description", v)} placeholder="What will students build/learn?" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <InputField label="Date *" value={form.date} onChange={v => set("date", v)} type="date" />
          <InputField label="Time *" value={form.time} onChange={v => set("time", v)} type="time" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <InputField label="Duration *" value={form.duration} onChange={v => set("duration", v)} placeholder="e.g. 3 hours" />
          <InputField label="Total Seats" value={form.seats} onChange={v => set("seats", v)} placeholder="30" type="number" />
        </div>
        <InputField label="Prerequisites" value={form.prerequisites} onChange={v => set("prerequisites", v)} placeholder="e.g. Basic JavaScript knowledge" />
        <InputField label="Learning Outcome" value={form.outcome} onChange={v => set("outcome", v)} placeholder="e.g. Build & deploy a React app" />
        <Field label="Workshop Videos">
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={() => videoInputRef.current?.click()} style={{
              padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(255,112,67,0.25)",
              background: "rgba(255,112,67,0.08)", color: "var(--orange)", cursor: "pointer",
              fontSize: 13, fontWeight: 700,
            }}>
              Upload Videos
            </button>
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>Add clips, recordings, or supporting material</span>
          </div>
          <input ref={videoInputRef} type="file" accept="video/*" multiple style={{ display: "none" }} onChange={addVideos} />
          {form.videos.length > 0 && (
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              {form.videos.map(video => (
                <div key={video.id} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--bg-4)", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 13, color: "var(--text-2)" }}>{video.name}</span>
                </div>
              ))}
            </div>
          )}
        </Field>
        <InputField label="Price (₹) *" value={form.price} onChange={v => set("price", v)} placeholder="599" type="number" />
        {form.price && (
          <div style={{ padding: "10px 14px", background: "rgba(0,229,195,0.06)", border: "1px solid rgba(0,229,195,0.2)", borderRadius: 10 }}>
            <p style={{ fontSize: 12, color: "var(--text-2)" }}>
              Your share: <strong style={{ color: "var(--teal)" }}>₹{Math.round(form.price * 0.8)}</strong> per enrollment
            </p>
          </div>
        )}
        <SubmitBtn label="Create Workshop" onClick={handleSave} disabled={!valid} />
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────
// COURSE MODAL
// ─────────────────────────────────────────────
function CourseModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    title: "", overview: "", instructor: "", duration: "", level: "",
    language: "", price: "", seats: "", prerequisites: "",
    thumbnail: "", thumbnailRatio: "16 / 9", thumbnailFit: "contain",
    outcomes: ["", "", ""],
    syllabus: [{ week: "", topic: "", video: null }, { week: "", topic: "", video: null }],
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.title && form.overview && form.instructor && form.duration && form.price && form.thumbnail;

  const setOutcome = (i, v) => {
    const arr = [...form.outcomes];
    arr[i] = v;
    setForm(p => ({ ...p, outcomes: arr }));
  };
  const addOutcome = () => setForm(p => ({ ...p, outcomes: [...p.outcomes, ""] }));
  const removeOutcome = (i) => setForm(p => ({ ...p, outcomes: p.outcomes.filter((_, idx) => idx !== i) }));

  const setSyllabus = (i, k, v) => {
    const arr = [...form.syllabus];
    arr[i] = { ...arr[i], [k]: v };
    setForm(p => ({ ...p, syllabus: arr }));
  };
  const addSyllabusRow = () => setForm(p => ({ ...p, syllabus: [...p.syllabus, { week: "", topic: "", video: null }] }));
  const removeSyllabusRow = (i) => setForm(p => ({ ...p, syllabus: p.syllabus.filter((_, idx) => idx !== i) }));

  const handleSave = () => {
    if (!valid) return;
    const payload = {
      title: form.title, description: form.overview,
      duration: form.duration, level: form.level || "beginner",
      price: Number(form.price), thumbnail: form.thumbnail
    };
    onSave(payload, "course");
    onClose();
  };

  return (
    <ModalShell title="Create Course" onClose={onClose} wide>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Basic Info */}
        <SectionHeader label="Basic Information" />
        <UploadPreview
          label="Course Thumbnail *"
          value={form.thumbnail}
          onChange={v => set("thumbnail", v)}
          accept="image/*"
          helperText="Use a clear, high-contrast cover image that represents the course."
          buttonLabel="Upload the course thumbnail"
          aspectRatio={form.thumbnailRatio}
          fit={form.thumbnailFit}
        />
        <ThumbnailControls
          ratio={form.thumbnailRatio}
          setRatio={v => set("thumbnailRatio", v)}
          fit={form.thumbnailFit}
          setFit={v => set("thumbnailFit", v)}
        />
        <InputField label="Course Name *" value={form.title} onChange={v => set("title", v)} placeholder="e.g. Full Stack Web Development" />
        <TextareaField label="Course Overview *" value={form.overview} onChange={v => set("overview", v)} placeholder="Describe the course in detail — what it covers, who it's for..." rows={4} />

        {/* Instructor & Details */}
        <SectionHeader label="Course Details" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <InputField label="Instructor Name *" value={form.instructor} onChange={v => set("instructor", v)} placeholder="e.g. Rahul Sharma" />
          <InputField label="Duration *" value={form.duration} onChange={v => set("duration", v)} placeholder="e.g. 8 weeks / 40 hours" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Level">
            <select
              value={form.level} onChange={e => set("level", e.target.value)}
              style={{ ...inputStyle, appearance: "none" }}
              onFocus={e => e.target.style.borderColor = "var(--purple)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            >
              <option value="">Select level</option>
              {["Beginner", "Intermediate", "Advanced", "Beginner to Advanced"].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </Field>
          <InputField label="Language" value={form.language} onChange={v => set("language", v)} placeholder="e.g. English / Hindi" />
        </div>
        <InputField label="Prerequisites" value={form.prerequisites} onChange={v => set("prerequisites", v)} placeholder="e.g. Basic programming knowledge" />

        {/* Course Outcomes */}
        <SectionHeader label="Course Outcomes" />
        <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: -8 }}>What will students be able to do after completing this course?</p>
        {form.outcomes.map((o, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--purple-light)", fontWeight: 700, minWidth: 20 }}>#{i + 1}</span>
            <input
              type="text" value={o} onChange={e => setOutcome(i, e.target.value)}
              placeholder={`Outcome ${i + 1}…`}
              style={{ ...inputStyle, flex: 1 }}
              onFocus={e => e.target.style.borderColor = "var(--purple)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            {form.outcomes.length > 1 && (
              <button onClick={() => removeOutcome(i)} style={{
                background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)",
                borderRadius: 8, color: "#FF6B6B", cursor: "pointer", padding: "8px",
                display: "flex", alignItems: "center",
              }}><TrashIcon /></button>
            )}
          </div>
        ))}
        <button onClick={addOutcome} style={{
          alignSelf: "flex-start", padding: "7px 14px", borderRadius: 9,
          background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.2)",
          color: "var(--purple-light)", fontSize: 12, fontWeight: 600, cursor: "pointer",
        }}>+ Add Outcome</button>

        {/* Syllabus */}
        <SectionHeader label="Syllabus" />
        <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: -8 }}>Break down the course week by week or module by module.</p>
        {form.syllabus.map((row, i) => {
          const videoInputId = `course-topic-video-${i}`;

          return (
            <div key={i} style={{ display: "grid", gap: 10, padding: 14, borderRadius: 14, background: "var(--bg-4)", border: "1px solid var(--border)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr auto", gap: 8, alignItems: "center" }}>
                <input
                  type="text"
                  value={row.week}
                  onChange={e => setSyllabus(i, "week", e.target.value)}
                  placeholder="Week 1-2 / Module 1"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--purple)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />
                <input
                  type="text"
                  value={row.topic}
                  onChange={e => setSyllabus(i, "topic", e.target.value)}
                  placeholder="Topic / content covered"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--purple)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />
                {form.syllabus.length > 1 && (
                  <button
                    onClick={() => removeSyllabusRow(i)}
                    style={{
                      background: "rgba(255,68,68,0.08)",
                      border: "1px solid rgba(255,68,68,0.2)",
                      borderRadius: 8,
                      color: "#FF6B6B",
                      cursor: "pointer",
                      padding: "8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <input
                  id={videoInputId}
                  type="file"
                  accept="video/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setSyllabus(i, "video", createVideoEntry(file));
                    e.target.value = "";
                  }}
                  style={{ display: "none" }}
                />
                <label
                  htmlFor={videoInputId}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(124,92,252,0.25)",
                    background: "rgba(124,92,252,0.08)",
                    color: "var(--purple-light)",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {row.video ? "Change topic video" : "Upload topic video"}
                </label>
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                  {row.video ? row.video.name : "Upload one video per topic"}
                </span>
              </div>

              {row.video && (
                <video src={row.video.url} controls style={{ width: "100%", borderRadius: 12, display: "block" }} />
              )}
            </div>
          );
        })}
        <button onClick={addSyllabusRow} style={{
          alignSelf: "flex-start", padding: "7px 14px", borderRadius: 9,
          background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.2)",
          color: "var(--purple-light)", fontSize: 12, fontWeight: 600, cursor: "pointer",
        }}>+ Add Row</button>

        {/* Pricing */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <InputField label="Price (₹) *" value={form.price} onChange={v => set("price", v)} placeholder="4999" type="number" />
          <InputField label="Total Seats" value={form.seats} onChange={v => set("seats", v)} placeholder="50" type="number" />
        </div>
        {form.price && (
          <div style={{ padding: "10px 14px", background: "rgba(0,229,195,0.06)", border: "1px solid rgba(0,229,195,0.2)", borderRadius: 10 }}>
            <p style={{ fontSize: 12, color: "var(--text-2)" }}>
              Your share: <strong style={{ color: "var(--teal)" }}>₹{Math.round(form.price * 0.8)}</strong> per enrollment
            </p>
          </div>
        )}

        <SubmitBtn label="Create Course" onClick={handleSave} disabled={!valid} />
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────
// SHARED MODAL COMPONENTS
// ─────────────────────────────────────────────
function ModalShell({ title, onClose, children, wide }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, animation: "fadeIn 0.2s ease",
    }}>
      <div style={{
        width: "100%", maxWidth: wide ? 620 : 490,
        maxHeight: "90vh", overflowY: "auto",
        background: "var(--bg-2)", border: "1px solid var(--border-bright)",
        borderRadius: 22, animation: "fadeUp 0.25s ease",
      }}>
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          position: "sticky", top: 0, background: "var(--bg-2)", zIndex: 1,
        }}>
          <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", display: "flex" }}>
            <CloseIcon />
          </button>
        </div>
        <div style={{ padding: "22px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

function SectionHeader({ label }) {
  return (
    <div style={{
      paddingBottom: 8, borderBottom: "1px solid var(--border)", marginTop: 4,
    }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--purple-light)" }}>
        {label}
      </p>
    </div>
  );
}

function SubmitBtn({ label, onClick, disabled }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        width: "100%", padding: 13, marginTop: 4,
        background: disabled ? "var(--bg-4)" : "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
        border: disabled ? "1px solid var(--border)" : "none",
        borderRadius: 12, color: disabled ? "var(--text-3)" : "white",
        fontSize: 15, fontWeight: 700, fontFamily: "Plus Jakarta Sans",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "opacity 0.2s",
        boxShadow: disabled ? "none" : "0 6px 20px rgba(124,92,252,0.35)",
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "0.88"; }}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >
      {label} →
    </button>
  );
}

// ─────────────────────────────────────────────
// SESSION CARD
// ─────────────────────────────────────────────
function SessionCard({ s, i, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const pct = Math.round((s.enrolled / s.totalSeats) * 100);
  const earned = s.enrolled * s.price * 0.8;

  const typeColor = s.type === "course"
    ? { bg: "rgba(0,229,195,0.1)", color: "var(--teal)", border: "rgba(0,229,195,0.3)" }
    : s.type === "workshop"
    ? { bg: "rgba(255,112,67,0.1)", color: "var(--orange)", border: "rgba(255,112,67,0.3)" }
    : { bg: "rgba(124,92,252,0.1)", color: "var(--purple-light)", border: "rgba(124,92,252,0.3)" };

  return (
    <div style={{
      background: "var(--bg-3)", border: "1px solid var(--border)",
      borderRadius: 18, overflow: "hidden",
      animation: "fadeUp 0.35s ease both", animationDelay: `${i * 60}ms`,
      transition: "border-color 0.2s",
      cursor: "pointer",
    }}
    onClick={() => navigate("/alumni/dashboard/item-detail", { state: { item: s } })}
    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
    >
      <div style={{ height: 4, background: "linear-gradient(90deg, #7C5CFC, #FF7043)" }} />
      <div style={{ padding: "18px 20px" }}>
        <div style={{
          marginBottom: 14,
          borderRadius: 14,
          overflow: "hidden",
          background: "var(--bg-4)",
          border: "1px solid var(--border)",
        }}>
          <img
            src={s.thumbnail || courseThumbnail}
            alt={s.title}
            style={{ display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "contain", background: "var(--bg-2)" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
              <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{s.title}</h3>
              <span style={{
                padding: "2px 9px", borderRadius: 99, fontSize: 10, fontWeight: 700,
                background: typeColor.bg, color: typeColor.color,
                border: `1px solid ${typeColor.border}`, textTransform: "capitalize",
              }}>{s.type}</span>
              {s.isLive && (
                <span style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "2px 9px", borderRadius: 99, fontSize: 10, fontWeight: 700,
                  background: "rgba(255,75,110,0.12)", color: "var(--danger)",
                  border: "1px solid rgba(255,75,110,0.3)",
                }}>
                  <span className="live-dot" /> LIVE
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 10 }}>{s.description}</p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {s.date && <span style={{ fontSize: 12, color: "var(--text-3)" }}>📅 {s.date}</span>}
              {s.time && <span style={{ fontSize: 12, color: "var(--text-3)" }}>⏰ {s.time}</span>}
              {s.duration && <span style={{ fontSize: 12, color: "var(--text-3)" }}>⏱ {s.duration}</span>}
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>💰 ₹{s.price}</span>
              {s.instructor && <span style={{ fontSize: 12, color: "var(--text-3)" }}>👤 {s.instructor}</span>}
              {s.level && <span style={{ fontSize: 12, color: "var(--text-3)" }}>📊 {s.level}</span>}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 20 }}>
            <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 18, color: "var(--teal)" }}>
              ₹{Math.round(earned).toLocaleString()}
            </p>
            <p style={{ fontSize: 11, color: "var(--text-3)" }}>your share</p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12, gap: 10 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(s); }}
            style={{
              padding: "8px 12px",
              borderRadius: 11,
              background: "transparent",
              border: "1px solid rgba(255,68,68,0.2)",
              color: "#FF6B6B",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "Plus Jakarta Sans",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrashIcon />
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              navigate("/alumni/dashboard/item-detail", { state: { item: s } });
            }}
            style={{
              padding: "8px 14px",
              borderRadius: 11,
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "Plus Jakarta Sans",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(124,92,252,0.35)";
              e.currentTarget.style.color = "var(--purple-light)";
              e.currentTarget.style.background = "rgba(124,92,252,0.06)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            View Details
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: s.type === "course" ? 10 : 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>{s.enrolled} / {s.totalSeats} enrolled</span>
            <span style={{
              fontSize: 12, color: pct >= 80 ? "var(--orange)" : "var(--text-3)",
              fontWeight: pct >= 80 ? 700 : 400,
            }}>{pct}% full {pct >= 80 && "🔥"}</span>
          </div>
          <div style={{ height: 5, background: "var(--bg-4)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              width: `${pct}%`, height: "100%",
              background: `linear-gradient(90deg, ${pct >= 80 ? "#FF7043" : "#7C5CFC"}, ${pct >= 80 ? "#FF9A6C" : "#9B7EFF"})`,
              borderRadius: 99, transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        {/* Course expand: outcomes + syllabus */}
        {s.type === "course" && (s.outcomes?.length > 0 || s.syllabus?.length > 0) && (
          <>
            <button
              onClick={e => { e.stopPropagation(); setExpanded(!expanded); }}
              style={{
                display: "flex", alignItems: "center", gap: 5, marginTop: 10,
                background: "none", border: "none", color: "var(--purple-light)",
                fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0,
                fontFamily: "DM Sans",
              }}
            >
              {expanded ? "Hide details" : "View course details"}
              <span style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "0.2s", display: "flex" }}>
                <ChevronDown />
              </span>
            </button>

            {expanded && (
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Outcomes */}
                {s.outcomes?.length > 0 && (
                  <div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {s.outcomes.map((o, oi) => (
                        <div key={oi} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <span style={{
                            width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                            background: "rgba(124,92,252,0.15)", color: "var(--purple-light)",
                            fontSize: 10, fontWeight: 700,
                            display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
                          }}>{oi + 1}</span>
                          <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>{o}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Syllabus */}
                {s.syllabus?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Syllabus</p>
                    <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                      {s.syllabus.map((row, ri) => (
                        <div key={ri} style={{
                          display: "grid", gridTemplateColumns: "140px 1fr",
                          padding: "10px 14px",
                          background: ri % 2 === 0 ? "var(--bg-4)" : "transparent",
                          borderBottom: ri < s.syllabus.length - 1 ? "1px solid var(--border)" : "none",
                        }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--purple-light)" }}>{row.week}</span>
                          <span style={{ fontSize: 13, color: "var(--text-2)" }}>{row.topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function Sessions() {
  const { user } = useAuth();
  const isPremium = user?.alumniPlan === "premium";

  const [sessions, setSessions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [openModal, setOpenModal] = useState(null); // "session" | "workshop" | "course"

  const fetchItems = async () => {
    try {
      const [cr, sr] = await Promise.all([
        API.get("/courses/my"),
        API.get("/sessions/my")
      ]);
      const myCourses = (cr.data.courses || []).map(c => ({
        id: c._id, type: "course",
        title: c.title, description: c.description || "",
        date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "", time: "",
        duration: c.duration || "", price: c.price,
        totalSeats: 100, enrolled: c.enrolledStudents?.length || 0,
        isLive: false, thumbnail: c.thumbnail || ""
      }));
      const mySessions = (sr.data.sessions || []).map(s => ({
        id: s._id, type: s.type || "session",
        title: s.title, description: s.description || "",
        date: s.date ? new Date(s.date).toLocaleDateString() : "", time: s.time || "",
        duration: s.duration || 60, price: s.price,
        totalSeats: s.totalSeats || 50, enrolled: s.enrolledStudents?.length || 0,
        isLive: s.isLive || false, thumbnail: s.thumbnail || ""
      }));
      
      setSessions([...myCourses, ...mySessions]);
    } catch(err) {
      console.error(err);
      setSessions([]);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);


  const addItem = async (payload, targetType) => {
    try {
      if (targetType === "course" || payload.type === "course") {
        await API.post("/courses", payload);
      } else {
        await API.post("/sessions", payload);
      }
      fetchItems();
    } catch (err) { console.error(err); }
  };

  const handleStartLive = async (item) => {
    if (item.type === "course") return;
    try {
      await API.patch(`/sessions/${item.id}/live`);
      fetchItems();
    } catch(err) { console.error(err); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.title}"?`)) return;
    try {
      const type = item.type === "course" ? "courses" : "sessions";
      await API.delete(`/${type}/${item.id}`);
      fetchItems();
    } catch (err) {
      console.error("Delete error", err);
      alert("Failed to delete item");
    }
  };

  const scheduledItems = sessions.filter(item => item.type === "session" || item.type === "workshop");
  const upcomingItems = scheduledItems.filter(item => !isItemLive(item));
  const liveItems = scheduledItems.filter(item => isItemLive(item) || item.isLive);

  const createOptions = [
    { type: "session",  icon: "🎥", label: "Live Session",  desc: "1-on-1 or group live call" },
    { type: "workshop", icon: "🛠", label: "Workshop",      desc: "Hands-on multi-hour event" },
    { type: "course",   icon: "📚", label: "Course",        desc: "Structured multi-week program" },
  ];

  return (
    <MainLayout>
      <AlumniModelGate isPremium={isPremium} featureName="Sessions & Workshops">
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 0" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
            <div>
                <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 24, color: "var(--text)", marginBottom: 4 }}>
                  Courses, Sessions & Workshops
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-3)" }}>
                  Manage all your courses, workshops & live sessions in one place
              </p>
            </div>

            {/* Create dropdown button */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "10px 18px",
                  background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
                  border: "none", borderRadius: 12,
                  color: "white", fontSize: 13, fontWeight: 700, fontFamily: "Plus Jakarta Sans",
                  cursor: "pointer", transition: "all 0.2s",
                  boxShadow: "0 4px 20px rgba(124,92,252,0.35)",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                <PlusIcon /> Create <ChevronDown />
              </button>

              {showDropdown && (
                <>
                  <div onClick={() => setShowDropdown(false)} style={{ position: "fixed", inset: 0, zIndex: 98 }} />
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 99,
                    background: "var(--bg-2)", border: "1px solid var(--border)",
                    borderRadius: 14, padding: 8, minWidth: 220,
                    boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
                    animation: "fadeUp 0.15s ease",
                  }}>
                    {createOptions.map(opt => (
                      <button
                        key={opt.type}
                        onClick={() => { setOpenModal(opt.type); setShowDropdown(false); }}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 12,
                          padding: "10px 12px", borderRadius: 10,
                          background: "transparent", border: "none",
                          cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(124,92,252,0.08)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <span style={{ fontSize: 20 }}>{opt.icon}</span>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "Plus Jakarta Sans" }}>{opt.label}</p>
                          <p style={{ fontSize: 11, color: "var(--text-3)" }}>{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Scheduled streaming queue */}
          <div style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <div>
                <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 4 }}>
                  Scheduled Sessions & Workshops
                </h2>
                <p style={{ fontSize: 13, color: "var(--text-3)" }}>
                  Start live streaming when the scheduled time arrives.
                </p>
              </div>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                {upcomingItems.length} scheduled · {liveItems.length} live
              </span>
            </div>

            {scheduledItems.length === 0 ? (
              <div style={{ padding: 20, borderRadius: 16, background: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text-3)", fontSize: 14 }}>
                No scheduled sessions or workshops yet.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
                {scheduledItems.map(item => {
                  const ready = isItemLive(item);
                  return (
                    <div key={item.id} style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden" }}>
                      <div style={{ height: 4, background: item.type === "workshop" ? "linear-gradient(90deg, #FF7043, #7C5CFC)" : "linear-gradient(90deg, #7C5CFC, #00E5C3)" }} />
                      <div style={{ padding: 16 }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div style={{ width: 76, flexShrink: 0, borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-4)" }}>
                            <img src={item.thumbnail || ""} alt={item.title} style={{ display: "block", width: "100%", aspectRatio: item.thumbnailRatio || "1 / 1", objectFit: item.thumbnailFit || "contain", background: "var(--bg-2)" }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                              <span style={{
                                display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 99,
                                fontSize: 10, fontWeight: 700, textTransform: "capitalize",
                                background: item.type === "workshop" ? "rgba(255,112,67,0.1)" : "rgba(124,92,252,0.1)",
                                color: item.type === "workshop" ? "var(--orange)" : "var(--purple-light)",
                              }}>{item.type}</span>
                              <span style={{ fontSize: 11, color: ready ? "var(--teal)" : "var(--text-3)", fontWeight: 700 }}>
                                {ready ? "Ready to go live" : `Scheduled for ${formatAcademicDate(item.date)}`}
                              </span>
                            </div>
                            <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 4 }}>
                              {item.title}
                            </h3>
                            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 10 }}>
                              {item.description}
                            </p>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                              <span style={{ fontSize: 12, color: "var(--text-3)" }}>🗓 {formatAcademicDate(item.date)}</span>
                              <span style={{ fontSize: 12, color: "var(--text-3)" }}>⏰ {item.time}</span>
                              <span style={{ fontSize: 12, color: "var(--text-3)" }}>💰 ₹{Number(item.price).toLocaleString()}</span>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={() => handleStartLive(item)}
                                disabled={!ready || item.isLive}
                                style={{
                                  flex: 1,
                                  padding: "9px 14px",
                                  borderRadius: 11,
                                  border: ready && !item.isLive ? "none" : "1px solid var(--border)",
                                  background: item.isLive
                                    ? "rgba(0,229,195,0.12)"
                                    : ready
                                    ? "linear-gradient(135deg, #00E5C3, #7C5CFC)"
                                    : "var(--bg-4)",
                                  color: item.isLive ? "var(--teal)" : ready ? "white" : "var(--text-3)",
                                  fontSize: 13,
                                  fontWeight: 700,
                                  cursor: ready && !item.isLive ? "pointer" : "not-allowed",
                                  fontFamily: "Plus Jakarta Sans",
                                }}
                              >
                                {item.isLive ? "Live now" : ready ? "Start live streaming" : "Not live yet"}
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                style={{
                                  padding: "9px 12px",
                                  borderRadius: 11,
                                  border: "1px solid rgba(255,68,68,0.2)",
                                  background: "rgba(255,68,68,0.06)",
                                  color: "#FF6B6B",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Terms and conditions note */}
          <div style={{
            marginBottom: 24,
            paddingTop: 6,
            borderTop: "1px dashed var(--border)",
          }}>
            <p style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              Terms & Conditions
            </p>
            <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.6 }}>
              Platform commission: 20% on paid enrollments. Alumni payout share: 80%.
            </p>
          </div>

          {/* Cards */}
          {sessions.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 18,
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎥</div>
              <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>Nothing here yet</h3>
              <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 20 }}>Create your first course, session, or workshop to start earning</p>
              <button
                onClick={() => setShowDropdown(true)}
                style={{
                  padding: "10px 22px", background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
                  border: "none", borderRadius: 11, color: "white",
                  fontSize: 14, fontWeight: 700, fontFamily: "Plus Jakarta Sans", cursor: "pointer",
                }}
              >+ Create</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16, alignItems: "stretch" }}>
              {sessions.map((s, i) => <SessionCard key={s.id || s._id || i} s={s} i={i} onDelete={handleDelete} />)}
            </div>
          )}

        </div>
      </AlumniModelGate>

      {/* Modals */}
      {openModal === "session"  && <SessionModal  onClose={() => setOpenModal(null)} onSave={addItem} />}
      {openModal === "workshop" && <WorkshopModal onClose={() => setOpenModal(null)} onSave={addItem} />}
      {openModal === "course"   && <CourseModal   onClose={() => setOpenModal(null)} onSave={addItem} />}
    </MainLayout>
  );
}