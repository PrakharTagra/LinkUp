import React from "react";
import { useNavigate } from "react-router-dom";
import courseThumbnail from "../../assets/hero.png";

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

import { useAuth } from "../../context/AuthContext";
import { isAcademicItemEnrolled } from "../../utils/academicCatalog";

export function CourseCard({ course }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const enrolled = isAcademicItemEnrolled(course, user);
  const hasMembershipDiscount = Boolean(course?.hasMembershipDiscount) && Number(course?.price) < Number(course?.basePrice || course?.originalPrice || course?.price);
  const comparePrice = Number(course?.basePrice || course?.originalPrice || course?.price || 0);
  const instructorLabel = typeof course.instructor === "string"
    ? course.instructor
    : course.instructor?.name || "Instructor";

  return (
    <div
      onClick={() => navigate("/course-detail", { state: { course } })}
      style={{
        background: "var(--bg-3)",
        border: "1px solid var(--border)",
        borderRadius: 18,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.22s",
        display: "flex", flexDirection: "column",
        position: "relative",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "rgba(124,92,252,0.35)";
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(124,92,252,0.15)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {enrolled && (
        <div style={{
          position: "absolute", top: 12, right: 12, zIndex: 5,
          background: "rgba(0, 229, 195, 0.15)", color: "var(--teal)",
          padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800,
          border: "1px solid rgba(0, 229, 195, 0.3)", backdropFilter: "blur(4px)",
        }}>ENROLLED</div>
      )}

      {/* Color header bar */}
      <div style={{
        height: 6,
        background: enrolled ? "linear-gradient(90deg, #00E5C3, #00B8A0)" : "linear-gradient(90deg, #7C5CFC, #FF7043)",
      }} />

      <div style={{ padding: "18px 18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{
          marginBottom: 14,
          borderRadius: 14,
          overflow: "hidden",
          background: "var(--bg-4)",
          border: "1px solid var(--border)",
        }}>
          <img
            src={course.thumbnail || courseThumbnail}
            alt={course.title}
            style={{ display: "block", width: "100%", aspectRatio: course.thumbnailRatio || "16 / 9", objectFit: course.thumbnailFit || "contain", background: "var(--bg-2)" }}
          />
        </div>

        <h3 style={{
          fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 16,
          color: "var(--text)", lineHeight: 1.3, marginBottom: 6,
        }}>{course.title}</h3>

        <p style={{ fontSize: 13, color: "var(--purple-light)", marginBottom: 8, fontWeight: 500 }}>
          by {instructorLabel}
        </p>

        <p style={{
          marginBottom: 16, flex: 1,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>{course.description}</p>

        {/* Rating */}
        {course.rating && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 14 }}>
            <span style={{ color: "#F5C842", display: "flex" }}><StarIcon /></span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{course.rating}</span>
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>({course.students || 0} students)</span>
          </div>
        )}

        {/* Price & CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 20, color: "var(--text)" }}>
              {enrolled ? "Free Access" : `₹${course.price.toLocaleString()}`}
            </span>
            {!enrolled && hasMembershipDiscount && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                <span style={{ fontSize: 12, color: "var(--text-3)", textDecoration: "line-through" }}>₹{comparePrice.toLocaleString()}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--teal)" }}>
                  {course?.membershipDiscountPercent || 15}% off
                </span>
              </div>
            )}
          </div>
          <button
            onClick={e => { e.stopPropagation(); navigate("/course-detail", { state: { course } }); }}
            style={{
              padding: "8px 16px",
              background: enrolled ? "rgba(0, 229, 195, 0.1)" : "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
              border: enrolled ? "1px solid rgba(0, 229, 195, 0.4)" : "none",
              borderRadius: 10,
              color: enrolled ? "var(--teal)" : "white", fontSize: 13, fontWeight: 700,
              fontFamily: "Plus Jakarta Sans", cursor: "pointer",
              boxShadow: enrolled ? "none" : "0 4px 14px rgba(124,92,252,0.3)",
              transition: "opacity 0.2s, transform 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >{enrolled ? "Open →" : "Enroll →"}</button>
        </div>
      </div>
    </div>
  );
}

export function SessionCard({ session }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const enrolled = isAcademicItemEnrolled(session, user);
  const hasMembershipDiscount = Boolean(session?.hasMembershipDiscount) && Number(session?.price) < Number(session?.basePrice || session?.price || 0);
  const comparePrice = Number(session?.basePrice || session?.price || 0);
  const isFull = session.seatsLeft === 0;
  const instructorLabel = typeof session.instructor === "string"
    ? session.instructor
    : session.instructor?.name || "Instructor";

  return (
    <div style={{
      background: "var(--bg-3)",
      border: "1px solid var(--border)",
      borderRadius: 18,
      overflow: "hidden",
      transition: "all 0.22s",
      display: "flex", flexDirection: "column",
      cursor: "pointer",
      position: "relative",
    }}
    onClick={() => navigate("/session-workshop-detail", { state: { session } })}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = enrolled ? "rgba(0,229,195,0.3)" : "rgba(124,92,252,0.3)";
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = enrolled ? "0 8px 28px rgba(0,229,195,0.15)" : "0 8px 28px rgba(124,92,252,0.1)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = "var(--border)";
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
    >
      {enrolled && (
        <div style={{
          position: "absolute", top: 12, right: 12, zIndex: 5,
          background: "rgba(0, 229, 195, 0.15)", color: "var(--teal)",
          padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800,
          border: "1px solid rgba(0, 229, 195, 0.3)", backdropFilter: "blur(4px)",
        }}>JOINED</div>
      )}

      {/* Teal header bar */}
      <div style={{ height: 5, background: enrolled ? "linear-gradient(90deg, #00E5C3, #00B8A0)" : "linear-gradient(90deg, #00E5C3, #7C5CFC)" }} />

      <div style={{ padding: "18px 18px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{
          marginBottom: 14,
          borderRadius: 14,
          overflow: "hidden",
          background: "var(--bg-4)",
          border: "1px solid var(--border)",
        }}>
          <img
            src={session.thumbnail || courseThumbnail}
            alt={session.title}
            style={{ display: "block", width: "100%", aspectRatio: session.thumbnailRatio || "16 / 9", objectFit: session.thumbnailFit || "contain", background: "var(--bg-2)" }}
          />
        </div>

        <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 16, color: "var(--text)", lineHeight: 1.3, marginBottom: 5 }}>
          {session.title}
        </h3>
        <p style={{ fontSize: 13, color: "var(--teal)", marginBottom: 8, fontWeight: 500 }}>
          by {instructorLabel}
        </p>
        <p style={{
          fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 14, flex: 1,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{session.description}</p>

        {/* Date/time */}
        <div style={{
          display: "flex", gap: 14, marginBottom: 16,
          padding: "10px 12px",
          background: "var(--bg-4)", borderRadius: 10,
          border: "1px solid var(--border)",
        }}>
          <span style={{ fontSize: 12, color: "var(--text-2)" }}>📅 {session.date}</span>
          <span style={{ fontSize: 12, color: "var(--text-2)" }}>⏰ {session.time}</span>
        </div>

        {/* Price & CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 20, color: "var(--text)" }}>
              {enrolled ? "Paid" : `₹${session.price.toLocaleString()}`}
            </span>
            {!enrolled && hasMembershipDiscount && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                <span style={{ fontSize: 12, color: "var(--text-3)", textDecoration: "line-through" }}>₹{comparePrice.toLocaleString()}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--teal)" }}>
                  {session?.membershipDiscountPercent || 15}% off
                </span>
              </div>
            )}
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              navigate("/session-workshop-detail", { state: { session } });
            }}
            disabled={isFull && !enrolled}
            style={{
              padding: "8px 16px",
              background: enrolled 
                ? "rgba(0, 229, 195, 0.1)" 
                : isFull 
                  ? "var(--bg-4)" 
                  : "linear-gradient(135deg, #00E5C3, #7C5CFC)",
              border: enrolled ? "1px solid rgba(0, 229, 195, 0.4)" : isFull ? "1px solid var(--border)" : "none",
              borderRadius: 10,
              color: enrolled ? "var(--teal)" : isFull ? "var(--text-3)" : "white",
              fontSize: 13, fontWeight: 700, fontFamily: "Plus Jakarta Sans",
              cursor: isFull && !enrolled ? "not-allowed" : "pointer",
              boxShadow: enrolled || isFull ? "none" : "0 4px 14px rgba(0,229,195,0.2)",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => { if (!isFull || enrolled) e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            {enrolled ? "Open →" : isFull ? "Full" : "Join →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;