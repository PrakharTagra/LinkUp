import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageCropper from "./ImageCropper";

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const CameraIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

export default function ProfileCard({ user = {}, onEdit, onAvatarChange, onCoverChange }) {
  const navigate = useNavigate();
  const initial = (user.name || "U")[0].toUpperCase();
  const isAlumni = user.role === "alumni" || user.isAlumni;
  const normalizedCollege = String(user.college || "").toLowerCase();
  const isConnectVerifiedAlumni =
    isAlumni &&
    (normalizedCollege.includes("ajay kumar garg engineering college") ||
      normalizedCollege.includes("akgec"));

  const avatarRef = useRef();
  const coverRef = useRef();
  const [avatarHover, setAvatarHover] = useState(false);
  const [coverHover, setCoverHover] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [cropType, setCropType] = useState(null);

  const formatYear = (dateValue) => {
    if (!dateValue) return "—";
    const d = new Date(dateValue);
    return Number.isNaN(d.getTime()) ? "—" : String(d.getFullYear());
  };

  const experiences = Array.isArray(user.experience) ? user.experience : [];
  const activeExperience = experiences.find((exp) => exp?.isCurrent);
  const latestExperience = activeExperience || experiences[0] || null;

  const eduStart = user.joiningYear || "—";
  const eduEnd = user.passingYear || "Present";

  const companyStart = latestExperience?.startDate ? formatYear(latestExperience.startDate) : "";
  const companyEnd = latestExperience?.isCurrent
    ? "Present"
    : latestExperience?.endDate
      ? formatYear(latestExperience.endDate)
      : (latestExperience?.startDate ? "Present" : "");
  const companyName = latestExperience?.company || user.company || "Not added";
  const companyRole = latestExperience?.title || user.title || "Role not added";
  const companyDuration = companyStart && companyEnd ? `${companyStart} - ${companyEnd}` : "";

  // Convert file to base64 so backend can upload to Cloudinary
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  const handleAvatarFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await toBase64(file);
      setCropImage(base64);
      setCropType("avatar");
    } catch (err) {
      console.error("Avatar file read failed:", err);
    }
  };

  const handleCoverFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await toBase64(file);
      setCropImage(base64);
      setCropType("cover");
    } catch (err) {
      console.error("Cover file read failed:", err);
    }
  };

  const handleCropComplete = (croppedImage) => {
    if (cropType === "avatar") {
      onAvatarChange && onAvatarChange(croppedImage);
    } else if (cropType === "cover") {
      onCoverChange && onCoverChange(croppedImage);
    }
    setCropImage(null);
    setCropType(null);
  };

  return (
    <>
    <div style={{
      background: "var(--bg-3)",
      border: "1px solid var(--border)",
      borderRadius: 20,
      overflow: "hidden",
    }}>
      {/* Cover Photo Banner */}
      <div
        style={{
          height: 130,
          background: user.coverPhoto
            ? `url(${user.coverPhoto}) center/cover no-repeat`
            : "linear-gradient(135deg, #7C5CFC22 0%, #FF704322 50%, #00E5C322 100%)",
          position: "relative",
          borderBottom: "1px solid var(--border)",
          cursor: "pointer",
        }}
        onMouseEnter={() => setCoverHover(true)}
        onMouseLeave={() => setCoverHover(false)}
        onClick={() => coverRef.current?.click()}
      >
        {!user.coverPhoto && (
          <div style={{
            position: "absolute", top: "30%", left: "50%",
            transform: "translateX(-50%)",
            width: 300, height: 80,
            background: "radial-gradient(ellipse, rgba(124,92,252,0.2) 0%, transparent 70%)",
            filter: "blur(20px)",
          }} />
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8,
          opacity: coverHover ? 1 : 0,
          transition: "opacity 0.2s",
        }}>
          <CameraIcon />
          <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>
            {user.coverPhoto ? "Change Cover Photo" : "Add Cover Photo"}
          </span>
        </div>
        <input ref={coverRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverFile} />
      </div>

      <div style={{ padding: "0 24px 24px" }}>
        {/* Avatar row */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16, marginTop: -40 }}>
          <div
            style={{ position: "relative", cursor: "pointer", flexShrink: 0 }}
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
            onClick={() => avatarRef.current?.click()}
          >
            <div style={{
              width: 82, height: 82, borderRadius: 20,
              background: user.avatar
                ? `url(${user.avatar}) center/cover no-repeat`
                : "linear-gradient(135deg, #7C5CFC, #FF7043)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 30,
              border: "3px solid var(--bg-3)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              overflow: "hidden",
            }}>
              {!user.avatar && initial}
            </div>
            <div style={{
              position: "absolute", inset: 0,
              borderRadius: 20,
              background: "rgba(0,0,0,0.55)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 3,
              opacity: avatarHover ? 1 : 0,
              transition: "opacity 0.2s",
            }}>
              <CameraIcon />
              <span style={{ fontSize: 9, fontWeight: 700, color: "white", textAlign: "center" }}>
                {user.avatar ? "Change" : "Upload"}
              </span>
            </div>
            <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarFile} />
          </div>

          {onEdit && (
            <button onClick={onEdit} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 14px", borderRadius: 10,
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--text-2)", fontSize: 13, cursor: "pointer",
              transition: "all 0.2s", fontFamily: "DM Sans",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--purple)"; e.currentTarget.style.color = "var(--purple-light)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}
            >
              <EditIcon /> Edit Profile
            </button>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 22, color: "var(--text)" }}>
              {user.name || "Your Name"}
            </h2>
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
          <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 4 }}>
            {user.title} {user.company ? `@ ${user.company}` : ""}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>
            ✉️ {user.email}
          </p>
          {isAlumni && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
              <p style={{ fontSize: 13, color: "var(--purple-light)", fontWeight: 600 }}>
                🤝 {user.connections?.length || 0} Connections
              </p>
              <button
                onClick={() => navigate("/alumni/dashboard/connections")}
                style={{
                  padding: "6px 12px",
                  borderRadius: 9,
                  border: "1px solid rgba(124,92,252,0.28)",
                  background: "rgba(124,92,252,0.1)",
                  color: "var(--purple-light)",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "Plus Jakarta Sans",
                  cursor: "pointer",
                }}
              >
                View Connections
              </button>
            </div>
          )}
        </div>

        {isAlumni && (
          <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 8,
              padding: "14px 16px",
              borderRadius: 14,
              background: "var(--bg-4)",
              border: "1px solid var(--border)",
            }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  Education
                </div>
                <div style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>
                  {user.college || "College not added"}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>
                  {user.degree || "Degree not added"}{user.branch ? ` · ${user.branch}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--purple-light)",
                  background: "rgba(124,92,252,0.12)",
                  border: "1px solid rgba(124,92,252,0.26)",
                  borderRadius: 999,
                  padding: "4px 10px",
                }}>
                  Joined {eduStart}
                </span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--orange)",
                  background: "rgba(255,112,67,0.12)",
                  border: "1px solid rgba(255,112,67,0.28)",
                  borderRadius: 999,
                  padding: "4px 10px",
                }}>
                  Passed {eduEnd}
                </span>
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 6,
              padding: "14px 16px",
              borderRadius: 14,
              background: "var(--bg-4)",
              border: "1px solid var(--border)",
            }}>
              <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
                Company
              </div>
              <div style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 2 }}>
                {companyName}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>
                {companyRole}
              </div>
              {companyDuration && (
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                  {companyDuration}
                </div>
              )}
            </div>
          </div>
        )}

        {user.about && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>About</h3>
            <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>{user.about}</p>
          </div>
        )}

        {user.skills?.length > 0 && (
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Skills</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {user.skills.map((skill, i) => (
                <span key={i} style={{
                  padding: "5px 13px", borderRadius: 99, fontSize: 12, fontWeight: 500,
                  background: "rgba(124,92,252,0.1)",
                  border: "1px solid rgba(124,92,252,0.22)",
                  color: "var(--purple-light)",
                }}>{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Image Cropper Modal */}
    {cropImage && (
      <ImageCropper
        imageSrc={cropImage}
        isCover={cropType === "cover"}
        onCrop={handleCropComplete}
        onCancel={() => {
          setCropImage(null);
          setCropType(null);
        }}
        aspectRatio={cropType === "cover" ? 4 / 3 : 1}
      />
    )}
  </>
  );
}
