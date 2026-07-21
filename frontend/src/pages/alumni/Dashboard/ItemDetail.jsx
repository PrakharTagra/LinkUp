import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import courseThumbnail from "../../../assets/hero.png";
import {
  combineDateTime,
  createVideoEntry,
  isItemLive,
  removeAlumniItem,
  upsertAlumniItem,
} from "../../../utils/academicCatalog";

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function createInitialForm(item) {
  return {
    title: item?.title || "",
    description: item?.description || "",
    instructor: item?.instructor || "",
    date: item?.date || "",
    time: item?.time || "",
    duration: item?.duration || "",
    level: item?.level || "",
    language: item?.language || "",
    prerequisites: item?.prerequisites || "",
    outcome: item?.outcome || "",
    price: item?.price ?? "",
    totalSeats: item?.totalSeats ?? "",
    seatsLeft: item?.seatsLeft ?? "",
    thumbnail: item?.thumbnail || "",
    thumbnailRatio: item?.thumbnailRatio || "16 / 9",
    thumbnailFit: item?.thumbnailFit || "contain",
    outcomes: item?.outcomes?.length ? item.outcomes : ["", "", ""],
    syllabus: item?.syllabus?.length ? item.syllabus : [{ week: "", topic: "", video: null }, { week: "", topic: "", video: null }],
    videos: item?.videos?.length ? item.videos : [],
  };
}

export default function ItemDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const item = state?.item;
  const [currentItem, setCurrentItem] = useState(item);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const scrollContainer = document.querySelector("main");
    scrollContainer?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const type = currentItem?.type || "session";
  const isCourse = type === "course";
  const isWorkshop = type === "workshop";
  const thumbnail = currentItem?.thumbnail || courseThumbnail;
  const liveReady = isCourse ? false : isItemLive(currentItem);

  const [form, setForm] = useState(() => createInitialForm(item));

  if (!item) {
    return (
      <MainLayout>
        <div style={{ maxWidth: 760, margin: "60px auto", textAlign: "center", padding: "0 16px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔎</div>
          <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 22, color: "var(--text)", marginBottom: 8 }}>Item not found</h2>
          <p style={{ color: "var(--text-3)", marginBottom: 24 }}>Open this page from a course, session, or workshop card.</p>
          <button onClick={() => navigate("/alumni/dashboard/sessions")} style={{ padding: "10px 22px", background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)", border: "none", borderRadius: 11, color: "white", cursor: "pointer", fontFamily: "Plus Jakarta Sans", fontWeight: 700 }}>Back to Dashboard</button>
        </div>
      </MainLayout>
    );
  }

  const handleSave = () => {
    setCurrentItem(prev => {
      const nextItem = {
        ...prev,
        title: form.title,
        description: form.description,
        instructor: form.instructor,
        date: form.date,
        time: form.time,
        duration: form.duration,
        level: form.level,
        language: form.language,
        prerequisites: form.prerequisites,
        outcome: form.outcome,
        price: Number(form.price),
        totalSeats: Number(form.totalSeats),
        seatsLeft: prev.seatsLeft,
        scheduledAt: combineDateTime(form.date, form.time),
        videos: form.videos,
        thumbnail: form.thumbnail || prev.thumbnail,
        thumbnailRatio: form.thumbnailRatio || prev.thumbnailRatio,
        thumbnailFit: form.thumbnailFit || prev.thumbnailFit,
      };

      if (type === "course") {
        nextItem.outcomes = form.outcomes.filter(Boolean);
        nextItem.syllabus = form.syllabus.filter(row => row.week || row.topic || row.video);
      }

      upsertAlumniItem(nextItem);

      return nextItem;
    });
    setEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete ${currentItem.title}?`)) {
      removeAlumniItem(currentItem.id);
      navigate("/alumni/dashboard/sessions");
    }
  };

  const handleStartLive = async () => {
    if (!liveReady) return;
    try {
      await API.patch(`/sessions/${currentItem._id || currentItem.id}/live`);
      setCurrentItem(prev => ({ ...prev, isLive: true }));
      navigate(`/live/${currentItem._id || currentItem.id}`, { state: { item: currentItem } });
    } catch (err) {
      console.error(err);
      alert("Failed to start live session");
    }
  };

  const handleJoinLive = () => {
    navigate(`/live/${currentItem._id || currentItem.id}`, { state: { item: currentItem } });
  };

  const tags = [type === "course" ? "Course" : isWorkshop ? "Workshop" : "Live Session"];
  if (currentItem.instructor) tags.push(currentItem.instructor);
  if (currentItem.level) tags.push(currentItem.level);
  if (currentItem.language) tags.push(currentItem.language);

  return (
    <MainLayout>
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "24px 0 32px" }}>
        <button onClick={() => navigate(-1)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: 0, background: "none", border: "none", color: "var(--text-3)", fontSize: 13, cursor: "pointer", marginBottom: 20, fontFamily: "DM Sans" }}>
          <BackIcon /> Back
        </button>

        <div style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 22, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ height: 6, background: type === "workshop" ? "linear-gradient(90deg, #FF7043, #7C5CFC)" : type === "course" ? "linear-gradient(90deg, #00E5C3, #7C5CFC)" : "linear-gradient(90deg, #7C5CFC, #FF7043)" }} />
          <div style={{ padding: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 20, alignItems: "stretch" }}>
              <div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  <Badge tone={type === "workshop" ? "orange" : type === "course" ? "teal" : "purple"}>{tags[0]}</Badge>
                  <Badge tone="teal">₹{Number(currentItem.price).toLocaleString()}</Badge>
                  <Badge tone="purple">{currentItem.seatsLeft} seats left</Badge>
                </div>
                <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 30, color: "var(--text)", lineHeight: 1.2, marginBottom: 10 }}>{currentItem.title}</h1>
                <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 18 }}>{currentItem.description}</p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginBottom: 18 }}>
                  {currentItem.date && <InfoTile label="Date" value={currentItem.date} />}
                  {currentItem.time && <InfoTile label="Time" value={currentItem.time} />}
                  {currentItem.duration && <InfoTile label="Duration" value={currentItem.duration} />}
                  <InfoTile label="Seats" value={`${currentItem.enrolled || 0}/${currentItem.totalSeats || 0} filled`} sub={`${currentItem.seatsLeft || 0} left`} />
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={() => setEditing(true)} style={actionButtonStyle("linear-gradient(135deg, #7C5CFC, #9B7EFF)", "white")}><EditIcon /> Edit</button>
                  <button onClick={handleDelete} style={actionButtonStyle("rgba(255,75,110,0.12)", "var(--danger)", "1px solid rgba(255,75,110,0.25)")}><TrashIcon /> Delete</button>
                  {!isCourse && (
                      <button
                        onClick={currentItem.isLive ? handleJoinLive : handleStartLive}
                        disabled={!liveReady && !currentItem.isLive}
                        style={{
                          ...actionButtonStyle(
                            currentItem.isLive ? "rgba(0,229,195,0.12)" : liveReady ? "linear-gradient(135deg, #00E5C3, #7C5CFC)" : "rgba(255,255,255,0.04)",
                            currentItem.isLive ? "var(--teal)" : liveReady ? "white" : "var(--text-3)",
                            liveReady || currentItem.isLive ? "none" : "1px solid var(--border)",
                          ),
                          cursor: (liveReady || currentItem.isLive) ? "pointer" : "not-allowed",
                        }}
                      >
                        {currentItem.isLive ? "Enter Live Room →" : liveReady ? "Start live session now →" : "Not yet scheduled"}
                      </button>
                  )}
                </div>
              </div>
              <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-4)", minHeight: 280, aspectRatio: currentItem.thumbnailRatio || "16 / 9" }}>
                <img src={thumbnail} alt={currentItem.title} style={{ display: "block", width: "100%", height: "100%", objectFit: currentItem.thumbnailFit || "contain", background: "var(--bg-2)" }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <section style={panelStyle}>
            <h2 style={sectionTitleStyle}>{isCourse ? "Course Overview" : isWorkshop ? "Workshop Overview" : "Session Overview"}</h2>
            <p style={bodyTextStyle}>{currentItem.description}</p>
          </section>
          <section style={panelStyle}>
            <h2 style={sectionTitleStyle}>Details</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {tags.map((tag, index) => <DetailRow key={index} label={index === 0 ? "Type" : `Tag ${index}`} value={tag} />)}
            </div>
          </section>
        </div>

        {isCourse && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <section style={panelStyle}><h2 style={sectionTitleStyle}>Outcomes</h2><p style={bodyTextStyle}>{(currentItem.outcomes || []).join(" • ") || "No outcomes added yet."}</p></section>
            <section style={panelStyle}><h2 style={sectionTitleStyle}>Syllabus</h2><div style={{ display: "grid", gap: 10 }}>{(currentItem.syllabus || []).map((row, index) => (<div key={index} style={{ padding: 12, borderRadius: 12, background: "var(--bg-4)", border: "1px solid var(--border)" }}><p style={{ fontSize: 12, fontWeight: 700, color: "var(--purple-light)", marginBottom: 4 }}>{row.week}</p><p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: row.video ? 10 : 0 }}>{row.topic}</p>{row.video && (<video src={row.video.url} controls style={{ width: "100%", borderRadius: 10, display: "block" }} />)}</div>)) || "No syllabus added yet."}</div></section>
          </div>
        )}

        {(currentItem.videos?.length > 0) && (
          <section style={{ ...panelStyle, marginBottom: 16 }}>
            <h2 style={sectionTitleStyle}>{isCourse ? "Course Videos" : "Session Videos"}</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {currentItem.videos.map(video => (
                <div key={video.id} style={{ padding: 12, borderRadius: 12, background: "var(--bg-4)", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{video.name}</p>
                  <video src={video.url} controls style={{ width: "100%", borderRadius: 10, display: "block" }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {isWorkshop && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <section style={panelStyle}><h2 style={sectionTitleStyle}>Prerequisites</h2><p style={bodyTextStyle}>{currentItem.prerequisites || "No prerequisites added yet."}</p></section>
            <section style={panelStyle}><h2 style={sectionTitleStyle}>Learning Outcome</h2><p style={bodyTextStyle}>{currentItem.outcome || "No learning outcome added yet."}</p></section>
          </div>
        )}

        {editing && (
          <EditModal
            type={type}
            form={form}
            setForm={setForm}
            onClose={() => setEditing(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </MainLayout>
  );
}

function Badge({ children, tone = "purple" }) {
  const palette = {
    purple: { bg: "rgba(124,92,252,0.1)", border: "rgba(124,92,252,0.25)", color: "var(--purple-light)" },
    teal: { bg: "rgba(0,229,195,0.1)", border: "rgba(0,229,195,0.25)", color: "var(--teal)" },
    orange: { bg: "rgba(255,112,67,0.1)", border: "rgba(255,112,67,0.25)", color: "var(--orange)" },
  };
  const style = palette[tone];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 99, background: style.bg, border: `1px solid ${style.border}`, color: style.color, fontSize: 12, fontWeight: 700 }}>{children}</span>;
}

function InfoTile({ label, value, sub }) {
  return <div style={{ padding: "14px 14px 13px", borderRadius: 14, background: "var(--bg-4)", border: "1px solid var(--border)" }}><p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--purple-light)", marginBottom: 6 }}>{label}</p><p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: sub ? 2 : 0 }}>{value}</p>{sub && <p style={{ fontSize: 12, color: "var(--text-3)" }}>{sub}</p>}</div>;
}

function DetailRow({ label, value }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderRadius: 12, background: "var(--bg-4)", border: "1px solid var(--border)" }}><span style={{ fontSize: 13, color: "var(--text-3)" }}>{label}</span><span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{value}</span></div>;
}

function EditModal({ type, form, setForm, onClose, onSave }) {
  const isCourse = type === "course";
  const isWorkshop = type === "workshop";

  const setOutcome = (index, value) => {
    const outcomes = [...form.outcomes];
    outcomes[index] = value;
    setForm(prev => ({ ...prev, outcomes }));
  };

  const addOutcome = () => setForm(prev => ({ ...prev, outcomes: [...prev.outcomes, ""] }));
  const removeOutcome = index => setForm(prev => ({ ...prev, outcomes: prev.outcomes.filter((_, itemIndex) => itemIndex !== index) }));

  const setSyllabus = (index, key, value) => {
    const syllabus = [...form.syllabus];
    syllabus[index] = { ...syllabus[index], [key]: value };
    setForm(prev => ({ ...prev, syllabus }));
  };

  const addSyllabusRow = () => setForm(prev => ({ ...prev, syllabus: [...prev.syllabus, { week: "", topic: "", video: null }] }));
  const removeSyllabusRow = index => setForm(prev => ({ ...prev, syllabus: prev.syllabus.filter((_, itemIndex) => itemIndex !== index) }));
  const addVideos = (files) => {
    const nextVideos = Array.from(files || []).map(createVideoEntry);
    if (!nextVideos.length) return;
    setForm(prev => ({ ...prev, videos: [...(prev.videos || []), ...nextVideos] }));
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, maxHeight: "88vh", background: "var(--bg-2)", border: "1px solid var(--border-bright)", borderRadius: 22, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>Edit {type}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", display: "flex" }}><CloseIcon /></button>
        </div>
        <div style={{ padding: 22, display: "grid", gap: 12, overflowY: "auto" }}>
          {isCourse ? (
            <>
              <SectionLabel text="Basic Information" />
              <UploadPreview
                label="Course Thumbnail"
                value={form.thumbnail}
                onChange={v => setForm(p => ({ ...p, thumbnail: v }))}
                accept="image/*"
                helperText="Update the thumbnail shown on student and alumni cards."
                buttonLabel="Upload a course thumbnail"
              />
              <TextField label="Course Name *" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} />
              <TextAreaField label="Course Overview *" value={form.description} onChange={v => setForm(p => ({ ...p, description: v }))} />

              <SectionLabel text="Course Details" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <TextField label="Instructor Name *" value={form.instructor} onChange={v => setForm(p => ({ ...p, instructor: v }))} />
                <TextField label="Duration *" value={form.duration} onChange={v => setForm(p => ({ ...p, duration: v }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <TextField label="Level" value={form.level} onChange={v => setForm(p => ({ ...p, level: v }))} />
                <TextField label="Language" value={form.language} onChange={v => setForm(p => ({ ...p, language: v }))} />
              </div>
              <TextField label="Prerequisites" value={form.prerequisites} onChange={v => setForm(p => ({ ...p, prerequisites: v }))} />
              <TextField label="Scheduled Date" type="date" value={form.date} onChange={v => setForm(p => ({ ...p, date: v }))} />
              <TextField label="Scheduled Time" type="time" value={form.time} onChange={v => setForm(p => ({ ...p, time: v }))} />

              <SectionLabel text="Course Outcomes" />
              {form.outcomes.map((outcome, index) => (
                <div key={index} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--purple-light)", fontWeight: 700, minWidth: 20 }}>#{index + 1}</span>
                  <input
                    type="text"
                    value={outcome}
                    onChange={e => setOutcome(index, e.target.value)}
                    placeholder={`Outcome ${index + 1}…`}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  {form.outcomes.length > 1 && (
                    <button onClick={() => removeOutcome(index)} style={iconButtonStyle}>
                      <TrashIcon />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addOutcome} style={secondaryActionStyle}>+ Add Outcome</button>

              <SectionLabel text="Syllabus" />
              {form.syllabus.map((row, index) => (
                <div key={index} style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr auto", gap: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    value={row.week}
                    onChange={e => setSyllabus(index, "week", e.target.value)}
                    placeholder="Week 1-2 / Module 1"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={row.topic}
                    onChange={e => setSyllabus(index, "topic", e.target.value)}
                    placeholder="Topic / content covered"
                    style={inputStyle}
                  />
                  <input
                    type="file"
                    accept="video/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) setSyllabus(index, "video", createVideoEntry(file));
                      e.target.value = "";
                    }}
                    style={{ ...inputStyle, padding: "8px 10px" }}
                  />
                  {form.syllabus.length > 1 && (
                    <button onClick={() => removeSyllabusRow(index)} style={iconButtonStyle}>
                      <TrashIcon />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addSyllabusRow} style={secondaryActionStyle}>+ Add Row</button>

              <SectionLabel text="Course Videos" />
              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 700 }}>Upload additional videos</span>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={e => {
                    addVideos(e.target.files);
                    e.target.value = "";
                  }}
                  style={inputStyle}
                />
              </label>
              {(form.videos || []).length > 0 && (
                <div style={{ display: "grid", gap: 8 }}>
                  {form.videos.map(video => (
                    <div key={video.id} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--bg-4)", border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: 13, color: "var(--text-2)" }}>{video.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <SectionLabel text="Pricing & Seats" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <TextField label="Price (₹) *" value={form.price} onChange={v => setForm(p => ({ ...p, price: v }))} />
                <TextField label="Total Seats" value={form.totalSeats} onChange={v => setForm(p => ({ ...p, totalSeats: v }))} />
              </div>
            </>
          ) : (
            <>
              <TextField label={isWorkshop ? "Workshop Title *" : "Session Title *"} value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} />
              <UploadPreview
                label="Thumbnail"
                value={form.thumbnail}
                onChange={v => setForm(p => ({ ...p, thumbnail: v }))}
                accept="image/*"
                helperText="Update the cover image used everywhere this item appears."
                buttonLabel="Upload a thumbnail"
              />
              <TextAreaField label="Description" value={form.description} onChange={v => setForm(p => ({ ...p, description: v }))} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <TextField label="Date *" type="date" value={form.date} onChange={v => setForm(p => ({ ...p, date: v }))} />
                <TextField label="Time *" type="time" value={form.time} onChange={v => setForm(p => ({ ...p, time: v }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <TextField label="Duration *" value={form.duration} onChange={v => setForm(p => ({ ...p, duration: v }))} />
                <TextField label="Total Seats" value={form.totalSeats} onChange={v => setForm(p => ({ ...p, totalSeats: v }))} />
              </div>
              {isWorkshop && (
                <>
                  <TextField label="Prerequisites" value={form.prerequisites} onChange={v => setForm(p => ({ ...p, prerequisites: v }))} />
                  <TextField label="Learning Outcome" value={form.outcome} onChange={v => setForm(p => ({ ...p, outcome: v }))} />
                </>
              )}
              <SectionLabel text="Videos" />
              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 700 }}>Upload session or workshop videos</span>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={e => {
                    addVideos(e.target.files);
                    e.target.value = "";
                  }}
                  style={inputStyle}
                />
              </label>
              {(form.videos || []).length > 0 && (
                <div style={{ display: "grid", gap: 8 }}>
                  {form.videos.map(video => (
                    <div key={video.id} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--bg-4)", border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: 13, color: "var(--text-2)" }}>{video.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <TextField label="Price (₹) *" value={form.price} onChange={v => setForm(p => ({ ...p, price: v }))} />
            </>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button onClick={onClose} style={{ padding: "10px 16px", borderRadius: 11, border: "1px solid var(--border)", background: "transparent", color: "var(--text-3)", cursor: "pointer" }}>Cancel</button>
            <button onClick={onSave} style={{ padding: "10px 16px", borderRadius: 11, border: "none", background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)", color: "white", cursor: "pointer", fontWeight: 700 }}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, type = "text" }) { return <label style={{ display: "grid", gap: 6 }}><span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 700 }}>{label}</span><input type={type} value={value} onChange={e => onChange(e.target.value)} style={inputStyle} /></label>; }
function TextAreaField({ label, value, onChange }) { return <label style={{ display: "grid", gap: 6 }}><span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 700 }}>{label}</span><textarea value={value} onChange={e => onChange(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical" }} /></label>; }
function UploadPreview({ label, value, onChange, accept, helperText, buttonLabel }) {
  const inputId = `${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${Math.random().toString(16).slice(2)}`;

  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 700 }}>{label}</span>
      <div style={{ display: "grid", gap: 10 }}>
        {value ? (
          <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-4)" }}>
            <img src={value} alt={label} style={{ display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "contain", background: "var(--bg-2)" }} />
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
            if (file) onChange(URL.createObjectURL(file));
            e.target.value = "";
          }}
        />
      </div>
    </label>
  );
}
function actionButtonStyle(background, color, border = "none") { return { display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 12, background, border, color, fontSize: 14, fontWeight: 700, fontFamily: "Plus Jakarta Sans", cursor: "pointer" }; }
const secondaryActionStyle = { alignSelf: "flex-start", padding: "7px 14px", borderRadius: 9, background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.2)", color: "var(--purple-light)", fontSize: 12, fontWeight: 600, cursor: "pointer" };
const iconButtonStyle = { background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 8, color: "#FF6B6B", cursor: "pointer", padding: "8px", display: "flex", alignItems: "center" };
function SectionLabel({ text }) { return <div style={{ paddingBottom: 8, borderBottom: "1px solid var(--border)", marginTop: 4 }}><p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--purple-light)" }}>{text}</p></div>; }

const inputStyle = { width: "100%", padding: "11px 14px", boxSizing: "border-box", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 11, color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "DM Sans" };
const panelStyle = { background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 18, padding: 20 };
const sectionTitleStyle = { fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 14 };
const bodyTextStyle = { fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 };