import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Loader from "../../components/common/Loader";
import PostCard from "../../components/feed/PostCard";
import PaymentModal from "../../components/academics/PaymentModal";
import API from "../../utils/api";

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const MessageIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const formatValue = (value, fallback = "—") => {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
};

const formatArray = (value) => {
  if (!Array.isArray(value) || value.length === 0) return [];
  return value.filter(Boolean);
};

const hasDisplayValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return value !== 0;

  const text = String(value).trim();
  if (!text) return false;

  const normalized = text.toLowerCase();
  return !["0", "null", "undefined", "na", "n/a", "-", "—"].includes(normalized);
};



export default function StudentAlumniProfile() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState(state?.alumni || null);
  const [loading, setLoading] = useState(!alumni);
  const alumniId = state?.alumniId || alumni?._id || alumni?.id;
  const [items, setItems] = useState([]);
  const [posts, setPosts] = useState(state?.posts || []);

  const [connectStatus, setConnectStatus] = useState("connect");
  const [activeTab, setActiveTab] = useState("About");
  const [membershipTaken, setMembershipTaken] = useState(false);
  const [showMembershipPayment, setShowMembershipPayment] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (alumni) {
      setMembershipTaken(Boolean(alumni.subscribed || alumni.membershipTaken));
    }
  }, [alumni]);

  const allowsMembership = Boolean(alumni?.alumniMembershipActive || alumni?.membershipEnabled || alumni?.priceMonth === 199);

  useEffect(() => {
    if (!alumniId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [userRes, postsRes, coursesRes, sessionsRes] = await Promise.all([
          API.get(`/users/${alumniId}`),
          posts.length === 0 ? API.get(`/posts/user/${alumniId}`) : Promise.resolve({ data: { posts } }),
          API.get("/courses"),
          API.get("/sessions")
        ]);

        setAlumni(userRes.data.user || null);
        if (posts.length === 0) setPosts(postsRes.data.posts || []);

        const matchedCourses = (coursesRes.data.courses || []).filter(c => c.instructor?._id === alumniId).map(c => ({
          ...c, id: c._id, type: "course", date: new Date(c.createdAt).toLocaleDateString(), seatsLeft: 100
        }));
        const matchedSessions = (sessionsRes.data.sessions || []).filter(s => s.instructor?._id === alumniId).map(s => ({
          ...s, id: s._id, type: s.type || "session", date: s.date ? new Date(s.date).toLocaleDateString() : "", seatsLeft: s.totalSeats - (s.enrolledStudents?.length || 0)
        }));
        setItems([...matchedCourses, ...matchedSessions]);
      } catch (err) {
        console.error("Alumni profile error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [alumniId]);

  useEffect(() => {
    if (!alumniId) return;
    const fetchStatus = async () => {
      try {
        const res = await API.get(`/connections/status/${alumniId}`);
        if (res.data.status === "none") setConnectStatus("connect");
        else setConnectStatus(res.data.status);
      } catch (err) {
        console.error("fetch status error", err);
      }
    };
    fetchStatus();
  }, [alumniId]);

  const handleConnect = async () => {
    if (connectStatus !== "connect" || connecting) return;
    setConnecting(true);
    try {
      const res = await API.post(`/connections/${alumniId}`);
      const nextStatus = res?.data?.connection?.status;
      setConnectStatus(nextStatus === "accepted" ? "connected" : "pending");
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || "Could not send connection request.";
      alert(message);
    } finally {
      setConnecting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewRating < 1) return alert("Please select a rating!");
    setSubmittingReview(true);
    try {
      const res = await API.post(`/users/${alumniId}/review`, { rating: reviewRating, comment: reviewComment });
      setAlumni(prev => ({ ...prev, reviews: res.data.reviews }));
      setReviewRating(0);
      setReviewComment("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const TABS = ["About", "Posts", "Sessions", "Reviews"];

  const companies = {
    "Google": "#4285F4", "Amazon": "#FF9900", "Microsoft": "#00A4EF",
    "Meta": "#1877F2", "Netflix": "#E50914", "Flipkart": "#2874F0",
  };
  const companyName =
    (hasDisplayValue(alumni?.company) && String(alumni.company).trim()) ||
    (typeof alumni?.role === "string" && alumni.role.includes("@")
      ? alumni.role.split("@").pop().trim()
      : "");
  const accentColor = companies[companyName] || "var(--purple)";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const mainContainer = document.querySelector("main");
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div style={{ maxWidth: 720, margin: "60px auto", textAlign: "center", color: "var(--text-3)" }}>
          <Loader text="Loading alumni profile..." />
        </div>
      </MainLayout>
    );
  }

  if (!alumni) {
    return (
      <MainLayout>
        <div style={{ maxWidth: 720, margin: "60px auto", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 22, color: "var(--text)", marginBottom: 8 }}>
            Alumni not found
          </h2>
          <p style={{ color: "var(--text-3)", marginBottom: 24 }}>Navigate from the Networking page to view an alumni profile.</p>
          <button onClick={() => navigate("/networking")} style={{
            padding: "10px 24px", background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
            border: "none", borderRadius: 11, color: "white", fontWeight: 700,
            fontFamily: "Plus Jakarta Sans", cursor: "pointer",
          }}>Go to Networking →</button>
        </div>
      </MainLayout>
    );
  }

  const derivedNameFromEmail = hasDisplayValue(alumni.email)
    ? String(alumni.email)
        .split("@")[0]
        .replace(/[._-]+/g, " ")
        .trim()
    : "";
  const titleCaseName = hasDisplayValue(derivedNameFromEmail)
    ? derivedNameFromEmail.replace(/\b\w/g, (char) => char.toUpperCase())
    : "";
  const roleParts = hasDisplayValue(alumni.role) ? String(alumni.role).split("@") : [];
  const displayName = hasDisplayValue(alumni.name)
    ? alumni.name
    : hasDisplayValue(alumni.fullName)
      ? alumni.fullName
      : hasDisplayValue(titleCaseName)
        ? titleCaseName
        : "Alumni Mentor";
  const displayRole = hasDisplayValue(alumni.title)
    ? alumni.title
    : hasDisplayValue(roleParts[0])
      ? String(roleParts[0]).trim()
      : "Alumni Mentor";
  const displayCompany = hasDisplayValue(alumni.company)
    ? alumni.company
    : hasDisplayValue(roleParts[1])
      ? String(roleParts[1]).trim()
      : "";
  const displayCollege = hasDisplayValue(alumni.college) ? alumni.college : "";
  const displayLocation = [alumni.city, alumni.country].filter((item) => hasDisplayValue(item)).join(", ");

  const initial = displayName[0].toUpperCase();
  const sessionsCount = items.filter(item => item.type === "session" || item.type === "workshop").length;
  const coursesCount = items.filter(item => item.type === "course").length;
  const studentsCount = items.reduce((sum, item) => sum + (item.enrolledStudents?.length || item.enrolled || 0), 0);
  const aboutText = alumni.about?.trim() || "This alumni has not added a bio yet.";
  const skills = Array.isArray(alumni.skills) ? alumni.skills.filter(Boolean) : [];
  const reviews = Array.isArray(alumni.reviews) ? alumni.reviews : [];
  const experience = formatArray(alumni.experience);
  const availability = formatArray(alumni.availability);
  const sessionPricing = formatArray(alumni.sessionPricing);
  const alumniStats = alumni.stats || {};
  const normalizedCollege = String(alumni.college || "").toLowerCase();
  const isConnectVerifiedAlumni =
    normalizedCollege.includes("ajay kumar garg engineering college") ||
    normalizedCollege.includes("akgec");

  const detailRows = [
    { label: "Title", value: alumni.title },
    { label: "Headline", value: alumni.headline },
    { label: "Company", value: displayCompany },
    { label: "Domain", value: alumni.domain },
    { label: "City", value: alumni.city },
    { label: "Country", value: alumni.country },
  ];

  const educationRows = [
    { label: "College", value: alumni.college },
    { label: "Degree", value: alumni.degree },
    { label: "Branch", value: alumni.branch },
    { label: "Joining Year", value: alumni.joiningYear },
    { label: "Passing Year", value: alumni.passingYear },
  ].filter((row) => hasDisplayValue(row.value));

  const statCards = [
    { label: "Average Rating", value: alumni.avgRating ?? 0, sub: `${reviews.length} reviews`, color: "#F5C842" },
    { label: "Review Count", value: alumni.reviewCount ?? reviews.length, sub: "student feedback", color: "var(--purple-light)" },
    { label: "Connections", value: alumni.connectionsCount ?? (Array.isArray(alumni.connections) ? alumni.connections.length : 0), sub: "network size", color: "#00E5C3" },
    { label: "Sessions Hosted", value: alumniStats.totalSessionsHosted ?? sessionsCount, sub: "live sessions", color: "var(--orange)" },
  ].filter((stat) => hasDisplayValue(stat.value));

  const primaryStats = [
    { label: "Sessions", value: sessionsCount, color: "var(--purple-light)" },
    { label: "Students", value: studentsCount, color: "var(--teal)" },
    { label: "Courses", value: coursesCount, color: "var(--orange)" },
    { label: "Posts", value: posts.length, color: "#F5C842" },
  ].filter((stat) => hasDisplayValue(stat.value));

  const hasEducationData = educationRows.length > 0;
  const filteredDetailRows = detailRows.filter((row) => hasDisplayValue(row.value));
  const professionalRows = filteredDetailRows.filter((row) => ["Title", "Headline", "Company", "Domain"].includes(row.label));
  const locationRows = filteredDetailRows.filter((row) => ["City", "Country"].includes(row.label));
  const joiningYear = hasDisplayValue(alumni.joiningYear) ? alumni.joiningYear : null;
  const passingYear = hasDisplayValue(alumni.passingYear) ? alumni.passingYear : null;

  return (
    <MainLayout>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 0" }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "none", border: "none", color: "var(--text-3)",
          fontSize: 13, cursor: "pointer", marginBottom: 20,
          fontFamily: "DM Sans", transition: "color 0.2s", padding: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
        onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}
        >
          <BackIcon /> Back
        </button>

        {/* Profile card */}
        <div style={{
          background: "var(--bg-3)", border: "1px solid var(--border)",
          borderRadius: 20, overflow: "hidden", marginBottom: 20,
        }}>
          {/* Cover */}
          <div style={{
            height: 180,
            background: alumni.coverPhoto
              ? `url(${alumni.coverPhoto}) center/cover no-repeat`
              : `linear-gradient(135deg, ${accentColor}18 0%, rgba(124,92,252,0.12) 50%, rgba(0,229,195,0.08) 100%)`,
            position: "relative",
          }}>
            {!alumni.coverPhoto && (
              <div style={{
                position: "absolute", top: "40%", left: "50%", transform: "translateX(-50%)",
                width: 280, height: 60,
                background: `radial-gradient(ellipse, ${accentColor}22 0%, transparent 70%)`,
                filter: "blur(20px)",
              }} />
            )}
          </div>

          <div style={{ padding: "22px 28px 28px" }}>
            {/* Profile identity */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "88px minmax(0, 1fr)",
              gap: 14,
              marginBottom: 16,
              alignItems: "start",
            }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: 88, height: 88, borderRadius: 22,
                  background: alumni.avatar
                    ? `url(${alumni.avatar}) center/cover no-repeat`
                    : `linear-gradient(135deg, ${accentColor}55, ${accentColor}22)`,
                  border: `2px solid rgba(255,255,255,0.16)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: accentColor, fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 34,
                  boxShadow: `0 6px 24px ${accentColor}30`,
                }}>
                  {!alumni.avatar && initial}
                </div>
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  <h1 style={{
                    fontFamily: "Plus Jakarta Sans",
                    fontWeight: 900,
                    fontSize: 30,
                    lineHeight: 1.12,
                    color: "#F8FAFF",
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}>
                    {displayName}
                  </h1>
                  {isConnectVerifiedAlumni && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span className="badge-verified">Connect Verified</span>
                      <button
                        type="button"
                        title="College tie ups results in verification"
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          border: "1px solid rgba(0,229,195,0.35)",
                          background: "rgba(0,229,195,0.1)",
                          color: "var(--teal)",
                          fontSize: 11,
                          fontWeight: 700,
                          lineHeight: 1,
                          cursor: "help",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                        }}
                      >
                        i
                      </button>
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text-2)",
                      background: "rgba(124,92,252,0.12)",
                      border: "1px solid rgba(124,92,252,0.24)",
                      borderRadius: 999,
                      padding: "5px 10px",
                    }}
                  >
                    {displayRole}
                  </span>
                  {hasDisplayValue(displayCompany) && (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#F3D68A",
                        background: "rgba(245,200,66,0.1)",
                        border: "1px solid rgba(245,200,66,0.2)",
                        borderRadius: 999,
                        padding: "5px 10px",
                      }}
                    >
                      {displayCompany}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                  {hasDisplayValue(displayCollege) && <span style={{ fontSize: 13, color: "var(--text-3)" }}>🎓 {displayCollege}</span>}
                  {hasDisplayValue(displayLocation) && <span style={{ fontSize: 13, color: "var(--text-3)" }}>📍 {displayLocation}</span>}
                  {allowsMembership && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: membershipTaken ? "#10B981" : "#F5C842", background: membershipTaken ? "rgba(16,185,129,0.12)" : "rgba(245,200,66,0.12)", border: membershipTaken ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(245,200,66,0.3)", borderRadius: 99, padding: "4px 10px" }}>
                      {membershipTaken ? "Membership subscribed" : "Membership available"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action row */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              {allowsMembership && (
                <button
                  onClick={() => {
                    if (membershipTaken) return;
                    setShowMembershipPayment(true);
                  }}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 11,
                    border: membershipTaken ? "1px solid rgba(16,185,129,0.3)" : "none",
                    background: membershipTaken ? "rgba(16,185,129,0.12)" : "linear-gradient(135deg, #F5C842, #FFB830)",
                    color: membershipTaken ? "#10B981" : "#1A1A1A",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "Plus Jakarta Sans",
                    cursor: membershipTaken ? "default" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {membershipTaken ? "Membership Active" : "Take Membership"}
                </button>
              )}
              {connectStatus === "connected" && (
                <button onClick={() => navigate(`/messages?user=${alumniId}`)} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "10px 18px", borderRadius: 11,
                  background: "rgba(0,229,195,0.1)", border: "1px solid rgba(0,229,195,0.3)",
                  color: "var(--teal)", fontSize: 13, fontWeight: 700,
                  fontFamily: "Plus Jakarta Sans", cursor: "pointer", transition: "all 0.2s",
                }}>
                  <MessageIcon /> Message
                </button>
              )}
              <button
                onClick={handleConnect}
                disabled={connecting}
                style={{
                  padding: "10px 22px", borderRadius: 11, border: "none",
                  fontSize: 13, fontWeight: 700, fontFamily: "Plus Jakarta Sans", cursor: "pointer",
                  transition: "all 0.2s",
                  background: connectStatus === "connect" ? "linear-gradient(135deg, #7C5CFC, #9B7EFF)"
                    : connectStatus === "pending" ? "var(--bg-4)"
                    : "rgba(0,229,195,0.1)",
                  color: connectStatus === "connect" ? "white"
                    : connectStatus === "pending" ? "var(--text-3)"
                    : "var(--teal)",
                  border: connectStatus !== "connect" ? "1px solid var(--border)" : "none",
                  boxShadow: connectStatus === "connect" ? "0 4px 18px rgba(124,92,252,0.35)" : "none",
                }}
              >
                {connectStatus === "connect" ? "Connect" : connectStatus === "pending" ? "Pending…" : "✓ Connected"}
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              {[
                { icon: "✉️", label: "Email", value: alumni.email },
                { icon: "🏢", label: "Company", value: displayCompany },
                { icon: "🧭", value: alumni.domain },
                { icon: "📍", value: alumni.city },
              ].filter((item) => hasDisplayValue(item.value)).map((item, idx) => (
                <span
                  key={`${item.icon}-${item.value}-${idx}`}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.02)",
                    color: "var(--text-2)",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {item.icon} {item.label ? `${item.label}: ` : ""}{item.value}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        {primaryStats.length > 0 && (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 20,
          }}>
            {primaryStats.map((s, i) => (
            <div key={i} style={{
              background: "var(--bg-3)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "16px 12px", textAlign: "center",
            }}>
              <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 20, color: s.color, marginBottom: 4 }}>
                {String(s.value)}
              </p>
              <p style={{ fontSize: 11, color: "var(--text-3)" }}>{s.label}</p>
            </div>
            ))}
          </div>
        )}

        {statCards.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            marginBottom: 20,
          }}>
            {statCards.map((stat) => (
              <div key={stat.label} style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 14px" }}>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>{stat.label}</div>
                <div style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 22, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{stat.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "8px 20px", borderRadius: 99,
              background: activeTab === tab ? "linear-gradient(135deg, #7C5CFC, #9B7EFF)" : "var(--bg-3)",
              border: `1px solid ${activeTab === tab ? "transparent" : "var(--border)"}`,
              color: activeTab === tab ? "white" : "var(--text-2)",
              fontSize: 13, fontWeight: activeTab === tab ? 700 : 400,
              fontFamily: "Plus Jakarta Sans", cursor: "pointer", transition: "all 0.2s",
              boxShadow: activeTab === tab ? "0 4px 14px rgba(124,92,252,0.3)" : "none",
            }}>{tab}</button>
          ))}
        </div>

        {/* About tab */}
        {activeTab === "About" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeUp 0.3s ease" }}>
            <div style={{
              background: "var(--bg-3)", border: "1px solid var(--border)",
              borderRadius: 16, padding: "20px 22px",
            }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>About</h3>
              <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75 }}>
                {aboutText}
              </p>
            </div>

            <div style={{
              background: "var(--bg-3)", border: "1px solid var(--border)",
              borderRadius: 16, padding: "20px 22px",
            }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Education</h3>
              {hasEducationData === false ? (
                <p style={{ fontSize: 13, color: "var(--text-3)" }}>Education details are not available.</p>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(250px, 1.2fr) minmax(200px, 0.8fr)",
                  gap: 12,
                }}>
                  <div style={{
                    borderRadius: 14,
                    padding: "16px",
                    border: "1px solid rgba(124,92,252,0.3)",
                    background: "linear-gradient(135deg, rgba(124,92,252,0.16), rgba(124,92,252,0.05) 55%, rgba(0,229,195,0.04))",
                  }}>
                    <div style={{ fontSize: 11, color: "#C8BCFF", marginBottom: 8, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                      Academic Foundation
                    </div>
                    {hasDisplayValue(alumni.college) && (
                      <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", lineHeight: 1.35, marginBottom: 10 }}>
                        {alumni.college}
                      </div>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {hasDisplayValue(alumni.degree) && (
                        <span style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.05)", fontSize: 12, color: "var(--text-2)", fontWeight: 700 }}>
                          {alumni.degree}
                        </span>
                      )}
                      {hasDisplayValue(alumni.branch) && (
                        <span style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.05)", fontSize: 12, color: "var(--text-2)", fontWeight: 700 }}>
                          {alumni.branch}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{
                    borderRadius: 14,
                    padding: "16px",
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.02)",
                  }}>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 10, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                      Timeline
                    </div>
                    <div style={{ display: "grid", gap: 10 }}>
                      {joiningYear !== null && (
                        <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>
                            <InfoIcon />
                            Joining Year
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>{joiningYear}</div>
                        </div>
                      )}
                      {passingYear !== null && (
                        <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>
                            <InfoIcon />
                            Passing Year
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>{passingYear}</div>
                        </div>
                      )}
                      {joiningYear !== null && passingYear !== null && Number(passingYear) >= Number(joiningYear) && (
                        <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                          Program Duration: <span style={{ color: "var(--text-2)", fontWeight: 700 }}>{Number(passingYear) - Number(joiningYear)} years</span>
                        </div>
                      )}
                      {joiningYear === null && passingYear === null && (
                        <div style={{ fontSize: 13, color: "var(--text-3)" }}>Academic year timeline is not available.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{
              background: "var(--bg-3)", border: "1px solid var(--border)",
              borderRadius: 16, padding: "20px 22px",
            }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Profile Details</h3>
              {filteredDetailRows.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-3)" }}>Profile details are not available.</p>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(250px, 1.2fr) minmax(200px, 0.8fr)",
                  gap: 12,
                }}>
                  <div style={{
                    borderRadius: 14,
                    padding: "16px",
                    border: "1px solid rgba(0,229,195,0.28)",
                    background: "linear-gradient(145deg, rgba(0,229,195,0.13), rgba(0,229,195,0.04) 55%, rgba(124,92,252,0.05))",
                  }}>
                    <div style={{ fontSize: 11, color: "#9CEFE3", marginBottom: 10, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                      Professional Snapshot
                    </div>
                    <div style={{ display: "grid", gap: 10 }}>
                      {professionalRows.map((row) => (
                        <div key={row.label} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.12)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>
                            <InfoIcon />
                            {row.label}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#F3FFFC", lineHeight: 1.45 }}>
                            {row.value}
                          </div>
                        </div>
                      ))}
                      {professionalRows.length === 0 && (
                        <div style={{ fontSize: 13, color: "var(--text-3)" }}>Professional details are not available.</div>
                      )}
                    </div>
                  </div>

                  <div style={{
                    borderRadius: 14,
                    padding: "16px",
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.02)",
                  }}>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 10, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                      Location and Contact
                    </div>
                    <div style={{ display: "grid", gap: 10 }}>
                      {locationRows.map((row) => (
                        <div key={row.label} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>
                            <InfoIcon />
                            {row.label}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>
                            {row.value}
                          </div>
                        </div>
                      ))}
                      {hasDisplayValue(alumni.email) && (
                        <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>
                            <InfoIcon />
                            Email
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)", wordBreak: "break-word" }}>
                            {alumni.email}
                          </div>
                        </div>
                      )}
                      {locationRows.length === 0 && !hasDisplayValue(alumni.email) && (
                        <div style={{ fontSize: 13, color: "var(--text-3)" }}>Location and contact details are not available.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {availability.length > 0 && (
              <div style={{
                background: "var(--bg-3)", border: "1px solid var(--border)",
                borderRadius: 16, padding: "20px 22px",
              }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Availability</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {availability.map((slot, i) => (
                    <div key={i} style={{ padding: "10px 12px", borderRadius: 999, background: "rgba(0,229,195,0.08)", border: "1px solid rgba(0,229,195,0.2)", color: "var(--text)", fontSize: 12 }}>
                      <strong>{slot.day}</strong>
                      {slot.startTime && slot.endTime ? ` · ${slot.startTime} - ${slot.endTime}` : ""}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sessionPricing.length > 0 && (
              <div style={{
                background: "var(--bg-3)", border: "1px solid var(--border)",
                borderRadius: 16, padding: "20px 22px",
              }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Session Pricing</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                  {sessionPricing.map((item, i) => (
                    <div key={i} style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.18)" }}>
                      <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Duration</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{item.duration ? `${item.duration} mins` : "Custom"}</div>
                      <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Price</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--purple-light)" }}>₹{item.price ?? 0}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {experience.length > 0 && (
              <div style={{
                background: "var(--bg-3)", border: "1px solid var(--border)",
                borderRadius: 16, padding: "20px 22px",
              }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Experience</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {experience.map((exp, i) => (
                    <div key={i} style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>{formatValue(exp.title)}</div>
                      <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 4 }}>{formatValue(exp.company)}{exp.location ? ` · ${exp.location}` : ""}</div>
                      <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: exp.description ? 8 : 0 }}>
                        {formatValue(exp.startDate ? new Date(exp.startDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : null)}
                        {exp.endDate ? ` - ${new Date(exp.endDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}` : exp.isCurrent ? " - Present" : ""}
                      </div>
                      {exp.description && <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              background: "var(--bg-3)", border: "1px solid var(--border)",
              borderRadius: 16, padding: "20px 22px",
            }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Skills</h3>
              {skills.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-3)" }}>No skills added yet.</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {skills.map((skill, i) => (
                  <span key={i} style={{
                    padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500,
                    background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.22)",
                    color: "var(--purple-light)",
                  }}>{skill}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Posts tab */}
        {activeTab === "Posts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.3s ease" }}>
            {posts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "44px 20px", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 16 }}>
                <p style={{ fontSize: 34, marginBottom: 10 }}>📝</p>
                <p style={{ fontSize: 14, color: "var(--text-3)" }}>No posts available for this alumni yet.</p>
              </div>
            ) : (
              posts.map(post => (
                <PostCard key={post._id || post.id} post={post} />
              ))
            )}
          </div>
        )}

        {/* Sessions tab */}
        {activeTab === "Sessions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.3s ease" }}>
            {items.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-3)", textAlign: "center", padding: 20 }}>No courses or sessions available yet.</p>
            )}
            {items.map(s => (
              <div key={s.id} style={{
                background: "var(--bg-3)", border: "1px solid var(--border)",
                borderRadius: 16, padding: "18px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h4 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{s.title}</h4>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(124,92,252,0.1)", color: "var(--purple-light)", textTransform: "uppercase" }}>{s.type}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-3)" }}>📅 {s.date} · {s.seatsLeft || "Unlimited"} seats left</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 18, color: "var(--text)", marginBottom: 8 }}>₹{s.price}</p>
                  <button onClick={() => navigate(s.type === "course" ? "/academics" : "/academics", { state: { item: s } })} style={{
                    padding: "7px 16px", background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
                    border: "none", borderRadius: 9, color: "white", fontSize: 12, fontWeight: 700,
                    fontFamily: "Plus Jakarta Sans", cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(124,92,252,0.3)",
                  }}>Enroll →</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === "Reviews" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.3s ease" }}>
            
            {/* Leave a review form */}
            <form onSubmit={handleReviewSubmit} style={{
              background: "var(--bg-3)", border: "1px solid var(--border)",
              borderRadius: 16, padding: "20px 22px", marginBottom: 12,
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Leave a Review</h3>
              
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewRating(star)}
                    style={{
                      background: "none", border: "none", fontSize: 24, cursor: "pointer",
                      color: reviewRating >= star ? "#F5C842" : "var(--border)", transition: "color 0.2s"
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              
              <textarea
                placeholder="Share your experience (optional)..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                style={{
                  width: "100%", minHeight: 80, padding: 14, borderRadius: 12,
                  background: "var(--bg-2)", border: "1px solid var(--border)",
                  color: "var(--text)", fontFamily: "DM Sans", fontSize: 13,
                  resize: "vertical", marginBottom: 16, boxSizing: "border-box"
                }}
              />
              
              <button
                type="submit"
                disabled={submittingReview}
                style={{
                  padding: "10px 20px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
                  color: "white", fontSize: 13, fontWeight: 700, fontFamily: "Plus Jakarta Sans",
                  cursor: submittingReview ? "not-allowed" : "pointer", opacity: submittingReview ? 0.7 : 1
                }}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>

            {reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "44px 20px", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 16 }}>
                <p style={{ fontSize: 34, marginBottom: 10 }}>⭐</p>
                <p style={{ fontSize: 14, color: "var(--text-3)" }}>No reviews yet.</p>
              </div>
            ) : (
              reviews.map((r, i) => (
                <div key={r._id || i} style={{
                  background: "var(--bg-3)", border: "1px solid var(--border)",
                  borderRadius: 14, padding: "16px 20px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{r.student?.name || "Student"}</span>
                    <span style={{ color: "#F5C842", fontSize: 13 }}>{"⭐".repeat(Number(r.rating || 0))}</span>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>{r.text || r.reviewText || r.comment}</p>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      <PaymentModal
        isOpen={showMembershipPayment}
        onClose={() => setShowMembershipPayment(false)}
        course={{
          title: `${alumni.name} Membership`,
          instructor: alumni.name,
          price: alumni?.priceMonth || 199,
        }}
        skipEnrollment
        onPaymentSuccess={async () => {
          try {
            await API.post(`/users/${alumniId}/membership`);
            setMembershipTaken(true);
          } catch (err) {
            console.error("Failed to activate membership", err);
            alert(err?.response?.data?.message || "Membership activation failed.");
          }
        }}
      />
    </MainLayout>
  );
}
