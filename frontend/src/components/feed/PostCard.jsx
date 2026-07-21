import React, { useEffect, useState } from "react";

// ── Add this helper component at the top of PostCard.jsx ────
const AIFlagBadge = ({ flag }) => {
  if (!flag || flag === "human") return null;

  const config = {
    ai_assisted: {
      label: "AI-Assisted",
      emoji: "🟡",
      color: "rgba(255, 193, 7, 0.15)",
      border: "rgba(255, 193, 7, 0.35)",
      text: "#FFC107",
    },
    ai_generated: {
      label: "AI-Generated",
      emoji: "🤖",
      color: "rgba(255, 112, 67, 0.1)",
      border: "rgba(255, 112, 67, 0.35)",
      text: "#FF7043",
    },
  };

  const c = config[flag];
  if (!c) return null;

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999, fontSize: 11,
      fontWeight: 600, fontFamily: "DM Sans",
      background: c.color, border: `1px solid ${c.border}`, color: c.text,
    }}>
      {c.emoji} {c.label}
    </span>
  );
};

const HeartIcon = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const CommentIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const ShareIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const LinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/* ── Certificate Badge ──────────────────────────────────────── */
function CertificateBadge({ title, issuer, date }) {
  return (
    <div style={{
      margin: "12px 0",
      background: "linear-gradient(135deg, rgba(255,112,67,0.1) 0%, rgba(124,92,252,0.08) 100%)",
      border: "1.5px solid rgba(255,112,67,0.3)",
      borderRadius: 16,
      padding: "16px 18px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative ribbon */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 60, height: 60,
        background: "linear-gradient(135deg, transparent 50%, rgba(255,112,67,0.12) 50%)",
      }} />
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: "linear-gradient(135deg, #FF7043, #FF9A6C)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, boxShadow: "0 4px 12px rgba(255,112,67,0.35)",
        }}>🏅</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#FF7043", fontFamily: "Plus Jakarta Sans", marginBottom: 3, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Certificate of Achievement
          </p>
          <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", fontFamily: "Plus Jakarta Sans", marginBottom: 4 }}>{title}</p>
          {issuer && <p style={{ fontSize: 12, color: "var(--text-2)", fontFamily: "DM Sans" }}>Issued by <strong>{issuer}</strong></p>}
          {date && <p style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "DM Sans", marginTop: 3 }}>📅 {date}</p>}
        </div>
        <div style={{ fontSize: 24 }}>✨</div>
      </div>
    </div>
  );
}

export default function PostCard({ post, onOpenProfile }) {
  const [liked, setLiked] = useState(false);
  const initialLikes = Array.isArray(post.likes) ? post.likes.length : (post.likes || 0);
  const [likes, setLikes] = useState(initialLikes);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(Array.isArray(post.comments) ? post.comments : []);
  const [mediaIndex, setMediaIndex] = useState(0);

  const authorObj = typeof post.author === "object" ? post.author : null;
  const authorName = authorObj?.name || post.author || "Unknown";
  const authorAvatarStr = authorObj?.avatar || post.authorAvatar || null;
  const displayRole = authorObj?.role || post.role;
  
  let displayTime = post.time || "";
  if (!displayTime && post.createdAt) {
    const d = new Date(post.createdAt);
    displayTime = isNaN(d.getTime()) ? "" : d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const handleLike = async () => {
    // Optimistic update
    setLiked(prev => !prev);
    setLikes(l => liked ? l - 1 : l + 1);
    if (post._id) {
      try {
        const res = await import("../../utils/api").then(m => m.default.post(`/posts/${post._id}/like`));
        setLiked(res.data.liked);
        setLikes(res.data.likesCount);
      } catch (err) { console.error(err); }
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    const textToSend = comment;
    if (!post._id) return;
    try {
      const res = await import("../../utils/api").then(m => m.default.post(`/posts/${post._id}/comment`, { content: textToSend }));
      setComments(prev => [...prev, res.data.comment]);
      setComment("");
    } catch (err) {
      console.error(err);
      alert("Failed to post comment. Please try again.");
    }
  };

  const slides = post.media?.filter(m => m.type === "image" || m.type === "video") || [];
  const docs   = post.media?.filter(m => m.type === "doc") || [];
  const activeSlide = slides[mediaIndex];

  useEffect(() => {
    setMediaIndex(0);
  }, [post._id]);

  useEffect(() => {
    if (mediaIndex >= slides.length) {
      setMediaIndex(slides.length ? slides.length - 1 : 0);
    }
  }, [mediaIndex, slides.length]);

  const goPrev = () => {
    if (!slides.length) return;
    setMediaIndex(prev => (prev - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    if (!slides.length) return;
    setMediaIndex(prev => (prev + 1) % slides.length);
  };

  const handleCardClick = (event) => {
    if (!onOpenProfile) return;
    if (event.target.closest("button, a, input, video, textarea")) return;
    onOpenProfile(post);
  };

  return (
    <div style={{
      background: "var(--bg-card, var(--bg-3))",
      border: "1px solid var(--border)",
      borderRadius: 18, padding: "18px 20px",
      transition: "border-color 0.2s",
      cursor: onOpenProfile ? "pointer" : "default",
    }}
    onClick={handleCardClick}
    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: authorAvatarStr ? `url(${authorAvatarStr}) center/cover no-repeat` : "linear-gradient(135deg, #7C5CFC, #FF7043)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: 700, fontSize: 16, fontFamily: "Plus Jakarta Sans",
          overflow: "hidden",
        }}>
          {!authorAvatarStr && authorName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{authorName}</span>
            <AIFlagBadge flag={post.aiDetection?.flag} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
            <p style={{ fontSize: 12, color: "var(--text-3)" }}>{displayTime}</p>
            {displayRole && <p style={{ fontSize: 11, color: "var(--text-3)" }}>· {displayRole}</p>}
            {post.visibility && post.visibility !== "everyone" && (
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>· {post.visibility === "connections" ? "🤝 Connections" : "🎓 Students"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 12 }}>{post.content}</p>
      )}

      {/* Certificate block */}
      {post.postType === "certificate" && post.certTitle && (
        <CertificateBadge title={post.certTitle} issuer={post.certIssuer} date={post.certDate} />
      )}

      {/* Legacy certificate payload support */}
      {post.certificate && (
        <CertificateBadge title={post.certificate.title} issuer={post.certificate.issuer} date={post.certificate.date} />
      )}

      {/* Media carousel */}
      {slides.length > 0 && (
        <div style={{
          position: "relative",
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid var(--border)",
          marginBottom: 12,
          background: "var(--bg-4)",
        }}>
          {activeSlide?.type === "image" ? (
            <img src={activeSlide.url} alt="" style={{ width: "100%", maxHeight: 360, objectFit: "cover", display: "block" }} />
          ) : (
            <video src={activeSlide?.url} controls style={{ width: "100%", maxHeight: 360, display: "block" }} />
          )}

          {slides.length > 1 && (
            <>
              <button
                onClick={goPrev}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: "rgba(0,0,0,0.5)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              ><ChevronLeftIcon /></button>
              <button
                onClick={goNext}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: "rgba(0,0,0,0.5)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              ><ChevronRightIcon /></button>
            </>
          )}

          <span style={{
            position: "absolute",
            left: 10,
            bottom: 10,
            padding: "3px 8px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            fontSize: 11,
            fontFamily: "DM Sans",
          }}>{activeSlide?.type === "image" ? "Photo" : "Video"} {mediaIndex + 1}/{slides.length}</span>

          {slides.length > 1 && (
            <div style={{
              position: "absolute",
              right: 10,
              bottom: 10,
              display: "flex",
              gap: 5,
            }}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setMediaIndex(i)}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    border: "none",
                    background: i === mediaIndex ? "white" : "rgba(255,255,255,0.45)",
                    padding: 0,
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legacy single image */}
      {post.image && !post.media?.length && (
        <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", marginBottom: 12 }}>
          <img src={post.image} alt="post" style={{ width: "100%", display: "block" }} />
        </div>
      )}

      {/* Poster image (same as image but labeled) */}
      {post.posterImage && (
        <div style={{ borderRadius: 14, overflow: "hidden", border: "2px solid rgba(124,92,252,0.25)", marginBottom: 12 }}>
          <img src={post.posterImage} alt="poster" style={{ width: "100%", display: "block" }} />
        </div>
      )}

      {/* Docs */}
      {docs.map((d, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", borderRadius: 10,
          background: "var(--bg-4)", border: "1px solid var(--border)",
          marginBottom: 8,
        }}>
          <span style={{ fontSize: 20 }}>📎</span>
          <span style={{ fontSize: 13, color: "var(--text-2)", fontFamily: "DM Sans" }}>{d.name}</span>
        </div>
      ))}

      {/* Link preview */}
      {post.linkUrl && (
        <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "9px 14px", borderRadius: 10,
          background: "var(--bg-4)", border: "1px solid var(--border)",
          color: "var(--teal)", fontSize: 13, fontFamily: "DM Sans",
          textDecoration: "none", marginBottom: 12,
          transition: "background 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-3)"}
        onMouseLeave={e => e.currentTarget.style.background = "var(--bg-4)"}
        ><LinkIcon />{post.linkUrl}</a>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border)", marginBottom: 10 }} />

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button onClick={handleLike} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8,
          background: liked ? "rgba(124,92,252,0.1)" : "transparent", border: "none",
          color: liked ? "var(--purple-light)" : "var(--text-3)",
          fontSize: 13, fontWeight: liked ? 600 : 400, transition: "all 0.15s", cursor: "pointer", fontFamily: "DM Sans",
        }}
        onMouseEnter={e => { if (!liked) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
        onMouseLeave={e => { if (!liked) e.currentTarget.style.background = "transparent"; }}
        ><HeartIcon filled={liked} />{likes > 0 && <span>{likes}</span>}<span>Like</span></button>

        <button onClick={() => setShowComment(!showComment)} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8,
          background: showComment ? "rgba(0,229,195,0.08)" : "transparent", border: "none",
          color: showComment ? "var(--teal)" : "var(--text-3)",
          fontSize: 13, transition: "all 0.15s", cursor: "pointer", fontFamily: "DM Sans",
        }}
        onMouseEnter={e => { if (!showComment) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
        onMouseLeave={e => { if (!showComment) e.currentTarget.style.background = "transparent"; }}
        ><CommentIcon /><span>Comment {comments.length > 0 && `(${comments.length})`}</span></button>

        <button style={{
          display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8,
          background: "transparent", border: "none", color: "var(--text-3)",
          fontSize: 13, transition: "background 0.15s", cursor: "pointer", fontFamily: "DM Sans", marginLeft: "auto",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        ><ShareIcon /><span>Share</span></button>
      </div>

      {/* Comments */}
      {showComment && (
        <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          {comments.map((c, i) => {
            const commenterName = c.author?.name || c.author || "User";
            const initial = commenterName.charAt(0).toUpperCase();
            return (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: "linear-gradient(135deg, #7C5CFC40, #FF704340)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--purple-light)", fontSize: 12, fontWeight: 700,
                }}>{initial}</div>
                <div style={{ background: "var(--bg-4)", borderRadius: 10, padding: "8px 12px", flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{commenterName}</p>
                  <p style={{ fontSize: 13, color: "var(--text-2)" }}>{c.content || c.text}</p>
                  <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>{c.time || c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Just now"}</p>
                </div>
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === "Enter" && handleComment()}
              placeholder="Write a comment…" style={{
                flex: 1, padding: "9px 14px", background: "var(--bg-4)",
                border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)",
                fontSize: 13, outline: "none", fontFamily: "DM Sans", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--purple)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            <button onClick={handleComment} style={{
              padding: "9px 16px", background: "var(--purple)", border: "none",
              borderRadius: 10, color: "white", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "DM Sans",
            }}>Post</button>
          </div>
        </div>
      )}
    </div>
  );
}