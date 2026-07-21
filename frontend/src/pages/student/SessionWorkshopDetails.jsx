import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import PaymentModal from "../../components/academics/PaymentModal";
import courseThumbnail from "../../assets/hero.png";
import { isAcademicItemEnrolled, isItemLive } from "../../utils/academicCatalog";

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 15" />
  </svg>
);

const UsersIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TagIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41 12 22l-9-9V3h10l7.59 7.59a2 2 0 0 1 0 2.82Z" />
    <path d="M7 7h.01" />
  </svg>
);

const Badge = ({ children, tone = "purple" }) => {
  const palette = {
    purple: { bg: "rgba(124,92,252,0.1)", border: "rgba(124,92,252,0.25)", color: "var(--purple-light)" },
    teal: { bg: "rgba(0,229,195,0.1)", border: "rgba(0,229,195,0.25)", color: "var(--teal)" },
    orange: { bg: "rgba(255,112,67,0.1)", border: "rgba(255,112,67,0.25)", color: "var(--orange)" },
  };
  const style = palette[tone];

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 12px", borderRadius: 99,
      background: style.bg, border: `1px solid ${style.border}`,
      color: style.color, fontSize: 12, fontWeight: 700,
    }}>
      {children}
    </span>
  );
};

import { useAuth } from "../../context/AuthContext";

export default function SessionWorkshopDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const session = state?.session || state?.item || state?.workshop;
  const [openPayment, setOpenPayment] = useState(Boolean(state?.openPayment));
  const isEnrolled = isAcademicItemEnrolled(session, user);

  if (!session) {
    return (
      <MainLayout>
        <div style={{ maxWidth: 720, margin: "60px auto", textAlign: "center", padding: "0 16px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔎</div>
          <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 22, color: "var(--text)", marginBottom: 8 }}>
            Session not found
          </h2>
          <p style={{ color: "var(--text-3)", marginBottom: 24 }}>
            Open this page from a session or workshop card to see the full details.
          </p>
          <button onClick={() => navigate("/academics")} style={{
            padding: "10px 22px", background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
            border: "none", borderRadius: 11, color: "white", cursor: "pointer",
            fontFamily: "Plus Jakarta Sans", fontWeight: 700,
          }}>
            Back to Academics
          </button>
        </div>
      </MainLayout>
    );
  }

  const isWorkshop = session.type === "workshop";
  const liveReady = isItemLive(session);
  const payablePrice = Number(session?.discountedPrice ?? session?.price ?? 0);
  const basePrice = Number(session?.basePrice ?? session?.price ?? 0);
  const hasMembershipDiscount = Boolean(session?.hasMembershipDiscount) && payablePrice < basePrice;
  const seatsLeft = Number(session.seatsLeft ?? 0);
  const totalSeats = Number(session.totalSeats ?? seatsLeft);
  const enrolledCount = Number(session.enrolled ?? Math.max(totalSeats - seatsLeft, 0));
  const fillPct = totalSeats > 0 ? Math.min(100, Math.round((enrolledCount / totalSeats) * 100)) : 0;
  const thumbnail = session.thumbnail || courseThumbnail;
  const highlights = isWorkshop
    ? [
        session.outcome || "Build something hands-on during the workshop",
        session.prerequisites || "Recommended for students with basic fundamentals",
        "Live Q&A and practical guidance throughout the session",
      ]
    : [
        "Real-world examples and practical explanations",
        "Structured live teaching with Q&A support",
        "Recording and follow-up resources for revision",
      ];

  return (
    <MainLayout>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 0 32px" }}>
        <button onClick={() => navigate(-1)} style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: 0, background: "none", border: "none",
          color: "var(--text-3)", fontSize: 13, cursor: "pointer",
          marginBottom: 20, fontFamily: "DM Sans",
        }}>
          <BackIcon /> Back
        </button>

        <div style={{
          background: "var(--bg-3)", border: "1px solid var(--border)",
          borderRadius: 22, overflow: "hidden", marginBottom: 16,
        }}>
          <div style={{ height: 6, background: isWorkshop
            ? "linear-gradient(90deg, #FF7043, #7C5CFC)"
            : "linear-gradient(90deg, #7C5CFC, #00E5C3)" }} />

          <div style={{ padding: 24 }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1.2fr 0.9fr", gap: 20,
              alignItems: "stretch",
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  <Badge tone={isWorkshop ? "orange" : "purple"}>{isWorkshop ? "Workshop" : "Live Session"}</Badge>
                  {(session.isLive || liveReady) && <Badge tone="teal">LIVE</Badge>}
                  <Badge tone="teal">₹{payablePrice.toLocaleString()}</Badge>
                  {hasMembershipDiscount && <Badge tone="teal">{session?.membershipDiscountPercent || 15}% off via membership</Badge>}
                </div>

                <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 30, color: "var(--text)", lineHeight: 1.2, marginBottom: 10 }}>
                  {session.title}
                </h1>
                <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 18 }}>
                  {session.description}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginBottom: 18 }}>
                  {session.date && (
                    <InfoTile icon={<CalendarIcon />} label="Date" value={session.date} />
                  )}
                  {session.time && (
                    <InfoTile icon={<ClockIcon />} label="Time" value={session.time} />
                  )}
                  {session.duration && (
                    <InfoTile icon={<ClockIcon />} label="Duration" value={session.duration} />
                  )}
                  <InfoTile icon={<UsersIcon />} label="Seats" value={`${enrolledCount}/${totalSeats} filled`} sub={`${seatsLeft} left`} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  <div style={{ flex: 1, height: 8, borderRadius: 99, background: "var(--bg-4)", overflow: "hidden", border: "1px solid var(--border)" }}>
                    <div style={{ width: `${fillPct}%`, height: "100%", background: "linear-gradient(90deg, #7C5CFC, #9B7EFF)" }} />
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-3)", minWidth: 52 }}>{fillPct}% full</span>
                </div>

                {isEnrolled && (session.isLive || liveReady) ? (
                  <button 
                    onClick={() => navigate(`/live/${session._id || session.id}`, { state: { item: session } })}
                    style={{
                      padding: "12px 28px", borderRadius: 12,
                      border: "none", background: "linear-gradient(135deg, #10B981, #059669)",
                      color: "white", fontSize: 14, fontWeight: 700,
                      fontFamily: "Plus Jakarta Sans", cursor: "pointer",
                      boxShadow: "0 6px 22px rgba(16,185,129,0.35)",
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "white", animation: "pulse 1.5s infinite" }} />
                    Join Live Session Now →
                  </button>
                ) : isEnrolled ? (
                  <button disabled style={{
                    padding: "12px 24px", borderRadius: 12,
                    border: "1px solid var(--border)", background: "var(--bg-4)",
                    color: "var(--text-3)", fontSize: 14, fontWeight: 700,
                    fontFamily: "Plus Jakarta Sans", cursor: "default",
                  }}>
                    Enrolled • Waiting for live
                  </button>
                ) : (
                  <button onClick={() => setOpenPayment(true)} style={{
                    padding: "12px 20px", borderRadius: 12,
                    border: "none", background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
                    color: "white", fontSize: 14, fontWeight: 700,
                    fontFamily: "Plus Jakarta Sans", cursor: "pointer",
                    boxShadow: "0 6px 22px rgba(124,92,252,0.35)",
                  }}>
                    {isWorkshop ? "Register for Workshop →" : "Join Session →"}
                  </button>
                )}
              </div>

              <div style={{
                borderRadius: 18, overflow: "hidden",
                border: "1px solid var(--border)", background: "var(--bg-4)",
                minHeight: 280,
                aspectRatio: session.thumbnailRatio || "16 / 9",
              }}>
                <img
                  src={thumbnail}
                  alt={session.title}
                  style={{ display: "block", width: "100%", height: "100%", objectFit: session.thumbnailFit || "contain", background: "var(--bg-2)" }}
                />
              </div>
            </div>
          </div>
        </div>

        {isEnrolled && session.videos?.length > 0 && (
          <section style={{ ...panelStyle, marginBottom: 16 }}>
            <h2 style={sectionTitleStyle}>Session Videos</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {session.videos.map(video => (
                <div key={video.id} style={{ padding: 12, borderRadius: 12, background: "var(--bg-4)", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{video.name}</p>
                  <video src={video.url} controls style={{ width: "100%", borderRadius: 10, display: "block" }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {!isEnrolled && session.videos?.length > 0 && (
          <section style={{ ...panelStyle, marginBottom: 16 }}>
            <h2 style={sectionTitleStyle}>Session Videos</h2>
            <p style={bodyTextStyle}>Enroll to unlock the uploaded videos for this session or workshop.</p>
          </section>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <section style={panelStyle}>
            <h2 style={sectionTitleStyle}>What to Expect</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {highlights.map((item, index) => (
                <div key={index} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: isWorkshop ? "var(--orange)" : "var(--purple-light)", fontWeight: 700 }}>•</span>
                  <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section style={panelStyle}>
            <h2 style={sectionTitleStyle}>Session Details</h2>
            <div style={{ display: "grid", gap: 10 }}>
              <DetailRow label="Price" value={`₹${Number(session.price).toLocaleString()}`} />
              {hasMembershipDiscount && <DetailRow label="Original Price" value={`₹${basePrice.toLocaleString()}`} />}
              <DetailRow label="Type" value={isWorkshop ? "Workshop" : "Live Session"} />
              <DetailRow label="Seats Left" value={String(seatsLeft)} />
              <DetailRow label="Total Seats" value={String(totalSeats)} />
            </div>
          </section>
        </div>

        {isWorkshop && (session.prerequisites || session.outcome) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {session.prerequisites && (
              <section style={panelStyle}>
                <h2 style={sectionTitleStyle}>Prerequisites</h2>
                <p style={bodyTextStyle}>{session.prerequisites}</p>
              </section>
            )}
            {session.outcome && (
              <section style={panelStyle}>
                <h2 style={sectionTitleStyle}>Learning Outcome</h2>
                <p style={bodyTextStyle}>{session.outcome}</p>
              </section>
            )}
          </div>
        )}

        <PaymentModal
          isOpen={openPayment}
          onClose={() => setOpenPayment(false)}
          course={{
            ...session,
            id: session?.id || session?._id,
            price: payablePrice,
            originalPrice: hasMembershipDiscount ? basePrice : session?.originalPrice,
          }}
        />
      </div>
    </MainLayout>
  );
}

function InfoTile({ icon, label, value, sub }) {
  return (
    <div style={{
      padding: "14px 14px 13px",
      borderRadius: 14,
      background: "var(--bg-4)",
      border: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, color: "var(--purple-light)" }}>
        {icon}
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: sub ? 2 : 0 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: "var(--text-3)" }}>{sub}</p>}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      padding: "12px 14px", borderRadius: 12,
      background: "var(--bg-4)", border: "1px solid var(--border)",
    }}>
      <span style={{ fontSize: 13, color: "var(--text-3)" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{value}</span>
    </div>
  );
}

const panelStyle = {
  background: "var(--bg-3)",
  border: "1px solid var(--border)",
  borderRadius: 18,
  padding: 20,
};

const sectionTitleStyle = {
  fontFamily: "Plus Jakarta Sans",
  fontWeight: 700,
  fontSize: 18,
  color: "var(--text)",
  marginBottom: 14,
};

const bodyTextStyle = {
  fontSize: 14,
  color: "var(--text-2)",
  lineHeight: 1.7,
};