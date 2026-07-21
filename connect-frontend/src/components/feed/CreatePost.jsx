import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

const PhotoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);
const VideoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
  </svg>
);
const XIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
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

export default function CreatePost({ onAddPost }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [media, setMedia] = useState([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [draggedMediaIndex, setDraggedMediaIndex] = useState(null);
  const [posting, setPosting] = useState(false);
  const photoRef = useRef();
  const videoRef = useRef();

  const avatarInitial = (user?.name || "A")[0].toUpperCase();
  const canPost = text.trim().length > 0 || media.length > 0;
  const mediaLimitReached = media.length >= 6;
  const remainingChars = 1000 - text.length;

  const addPhotos = (e) => {
    const files = Array.from(e.target.files);
    const newItems = files.map(f => ({ type: "image", url: URL.createObjectURL(f), name: f.name, file: f }));
    setMedia(prev => {
      const updated = [...prev, ...newItems].slice(0, 6);
      if (!prev.length && updated.length) setActiveMediaIndex(0);
      return updated;
    });
    e.target.value = "";
  };

  const addVideo = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newItems = files.map(f => ({ type: "video", url: URL.createObjectURL(f), name: f.name, file: f }));
    setMedia(prev => {
      const updated = [...prev, ...newItems].slice(0, 6);
      if (!prev.length && updated.length) setActiveMediaIndex(0);
      return updated;
    });
    e.target.value = "";
  };

  const removeMedia = (idx) => {
    setMedia(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      if (!updated.length) {
        setActiveMediaIndex(0);
      } else if (activeMediaIndex >= updated.length) {
        setActiveMediaIndex(updated.length - 1);
      }
      return updated;
    });
  };

  const moveMedia = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= media.length || fromIndex === toIndex) return;
    setMedia(prev => {
      const updated = [...prev];
      const [item] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, item);
      return updated;
    });
    setActiveMediaIndex(toIndex);
  };

  const handleDragStart = (index) => setDraggedMediaIndex(index);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (draggedMediaIndex === null) return;
    moveMedia(draggedMediaIndex, dropIndex);
    setDraggedMediaIndex(null);
  };

  const handleDragEnd = () => setDraggedMediaIndex(null);

  const goPrevMedia = () => {
    if (!media.length) return;
    setActiveMediaIndex(prev => (prev - 1 + media.length) % media.length);
  };

  const goNextMedia = () => {
    if (!media.length) return;
    setActiveMediaIndex(prev => (prev + 1) % media.length);
  };

  // Convert File object to base64 string
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  const handlePost = async () => {
    if (!canPost || posting) return;
    setPosting(true);
    try {
      // Convert file objects to base64 so the backend can upload to Cloudinary
      const mediaBase64 = await Promise.all(
        media.filter(m => m.file).map(async (m) => ({
          type: m.type,
          data: await toBase64(m.file),
        }))
      );

      await onAddPost({
        content: text,
        media: mediaBase64,
      });

      setText("");
      setMedia([]);
      setActiveMediaIndex(0);
    } catch (err) {
      console.error("Post failed:", err);
      alert("Failed to create post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const activeMedia = media[activeMediaIndex];

  return (
    <div style={{
      background: "linear-gradient(180deg, rgba(124,92,252,0.08), rgba(124,92,252,0)) , var(--bg-3)",
      border: "1px solid var(--border)",
      borderRadius: 20,
      padding: "18px",
      marginBottom: 20,
      boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
    }}>
      {/* Top row: avatar + textarea */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {/* Avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: 13, flexShrink: 0,
          background: "linear-gradient(135deg, #7C5CFC, #FF7043)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: 16, fontWeight: 700, fontFamily: "Plus Jakarta Sans",
          border: "2px solid rgba(255,255,255,0.22)",
          boxShadow: "0 8px 18px rgba(124,92,252,0.34)",
          overflow: "hidden",
        }}>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user?.name || "User"}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            avatarInitial
          )}
        </div>

        {/* Textarea */}
        <div style={{ flex: 1 }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Share an insight, tip, achievement, or session announcement..."
            rows={4}
            style={{
              width: "100%",
              resize: "vertical",
              minHeight: 96,
              maxHeight: 220,
              background: "var(--bg-4)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "12px 14px",
              color: "var(--text)",
              fontSize: 14,
              lineHeight: 1.65,
              outline: "none",
              fontFamily: "DM Sans",
              boxSizing: "border-box",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={e => {
              e.target.style.borderColor = "rgba(124,92,252,0.5)";
              e.target.style.boxShadow = "0 0 0 3px rgba(124,92,252,0.14)";
            }}
            onBlur={e => {
              e.target.style.borderColor = "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          />
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginTop: 7,
            fontSize: 12,
            fontFamily: "DM Sans",
            color: "var(--text-3)",
          }}>
            <span>Up to 6 photos/videos</span>
            <span style={{
              padding: "2px 8px",
              borderRadius: 999,
              background: "var(--bg-4)",
              border: "1px solid var(--border)",
              color: mediaLimitReached ? "#FF7043" : "var(--text-3)",
            }}>{media.length}/6 selected</span>
          </div>
        </div>
      </div>

      {/* Media previews */}
      {media.length > 0 && (
        <div style={{ marginTop: 13 }}>
          <div style={{
            position: "relative",
            borderRadius: 14,
            overflow: "hidden",
            background: "var(--bg-4)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 22px rgba(0,0,0,0.2)",
            marginBottom: 10,
          }}>
            {activeMedia?.type === "image" ? (
              <img src={activeMedia.url} alt="" style={{ width: "100%", height: 280, objectFit: "cover", display: "block" }} />
            ) : (
              <video src={activeMedia?.url} controls style={{ width: "100%", height: 280, objectFit: "cover", display: "block" }} />
            )}

            {media.length > 1 && (
              <>
                <button
                  onClick={goPrevMedia}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.35)",
                    background: "rgba(0,0,0,0.55)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                ><ChevronLeftIcon /></button>
                <button
                  onClick={goNextMedia}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.35)",
                    background: "rgba(0,0,0,0.55)",
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
              left: 8,
              top: 8,
              padding: "2px 7px",
              borderRadius: 999,
              background: "rgba(0,0,0,0.62)",
              border: "1px solid rgba(255,255,255,0.22)",
              color: "white",
              fontSize: 11,
              fontFamily: "DM Sans",
            }}>{activeMedia?.type === "image" ? "Photo" : "Video"}</span>
            <span style={{
              position: "absolute",
              right: 44,
              top: 8,
              padding: "2px 8px",
              borderRadius: 999,
              background: "rgba(0,0,0,0.62)",
              border: "1px solid rgba(255,255,255,0.22)",
              color: "white",
              fontSize: 11,
              fontFamily: "DM Sans",
            }}>{activeMediaIndex + 1} / {media.length}</span>
            <button
              onClick={() => removeMedia(activeMediaIndex)}
              style={{
                position: "absolute", top: 8, right: 8,
                width: 26, height: 26, borderRadius: "50%",
                background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.25)",
                color: "white", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,64,64,0.9)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.7)"; }}
            ><XIcon /></button>
          </div>

          <div style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 3,
          }}>
            {media.map((m, i) => (
              <button
                key={`${m.name}-${i}`}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(i)}
                onDragEnd={handleDragEnd}
                onClick={() => setActiveMediaIndex(i)}
                title="Drag to reorder"
                style={{
                  minWidth: 86,
                  width: 86,
                  textAlign: "left",
                  borderRadius: 10,
                  padding: "5px",
                  background: i === activeMediaIndex ? "rgba(124,92,252,0.2)" : "var(--bg-4)",
                  border: i === activeMediaIndex ? "1px solid rgba(124,92,252,0.45)" : "1px solid var(--border)",
                  color: "var(--text-2)",
                  cursor: draggedMediaIndex === i ? "grabbing" : "grab",
                  opacity: draggedMediaIndex === i ? 0.65 : 1,
                  transition: "transform 0.12s",
                }}
              >
                <div style={{
                  width: "100%",
                  height: 62,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "#111827",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 5,
                }}>
                  {m.type === "image" ? (
                    <img src={m.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#d4e9ff",
                      fontSize: 11,
                      fontFamily: "DM Sans",
                      background: "linear-gradient(145deg, #103050, #1e3a8a)",
                    }}>Video</div>
                  )}
                </div>
                <div style={{ fontSize: 10, fontFamily: "DM Sans", color: "var(--text-3)", lineHeight: 1.3 }}>
                  {i + 1}. {m.type === "image" ? "Photo" : "Video"}
                </div>
              </button>
            ))}
          </div>
          <p style={{ marginTop: 7, fontSize: 11, color: "var(--text-3)", fontFamily: "DM Sans" }}>
            Drag thumbnails to set post order.
          </p>
        </div>
      )}

      {/* Bottom row: media buttons + post button */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 14,
        flexWrap: "wrap",
      }}>
        {/* Photo button */}
        <button
          onClick={() => photoRef.current?.click()}
          title="Add photos"
          disabled={mediaLimitReached}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 11,
            background: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.35)",
            color: "#81d884", fontSize: 13, fontFamily: "DM Sans",
            cursor: mediaLimitReached ? "not-allowed" : "pointer",
            transition: "all 0.15s",
            opacity: mediaLimitReached ? 0.45 : 1,
          }}
          onMouseEnter={e => {
            if (!mediaLimitReached) {
              e.currentTarget.style.background = "rgba(76,175,80,0.16)";
              e.currentTarget.style.borderColor = "rgba(76,175,80,0.55)";
            }
          }}
          onMouseLeave={e => {
            if (!mediaLimitReached) {
              e.currentTarget.style.background = "rgba(76,175,80,0.08)";
              e.currentTarget.style.borderColor = "rgba(76,175,80,0.35)";
            }
          }}
        >
          <PhotoIcon /><span>Add Photos</span>
        </button>

        {/* Video button */}
        <button
          onClick={() => videoRef.current?.click()}
          title="Add video"
          disabled={mediaLimitReached}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 11,
            background: "rgba(33,150,243,0.1)", border: "1px solid rgba(33,150,243,0.35)",
            color: "#7ac4ff", fontSize: 13, fontFamily: "DM Sans",
            cursor: mediaLimitReached ? "not-allowed" : "pointer",
            transition: "all 0.15s",
            opacity: mediaLimitReached ? 0.45 : 1,
          }}
          onMouseEnter={e => {
            if (!mediaLimitReached) {
              e.currentTarget.style.background = "rgba(33,150,243,0.18)";
              e.currentTarget.style.borderColor = "rgba(33,150,243,0.55)";
            }
          }}
          onMouseLeave={e => {
            if (!mediaLimitReached) {
              e.currentTarget.style.background = "rgba(33,150,243,0.1)";
              e.currentTarget.style.borderColor = "rgba(33,150,243,0.35)";
            }
          }}
        >
          <VideoIcon /><span>Add Videos</span>
        </button>

        {/* Char count */}
        <span style={{
          marginLeft: "auto",
          fontSize: 12,
          fontFamily: "DM Sans",
          color: remainingChars < 100 ? "#FF8A65" : "var(--text-3)",
          padding: "2px 8px",
          borderRadius: 999,
          border: "1px solid var(--border)",
          background: "var(--bg-4)",
        }}>{remainingChars} chars left</span>

        {/* Post button */}
        <button
          onClick={handlePost}
          disabled={!canPost || posting}
          style={{
            padding: "10px 24px", borderRadius: 12, border: "none",
            background: canPost ? "linear-gradient(135deg, #7C5CFC, #9B7EFF)" : "var(--bg-4)",
            color: canPost ? "white" : "var(--text-3)",
            fontSize: 14, fontWeight: 700, fontFamily: "Plus Jakarta Sans",
            cursor: canPost ? "pointer" : "not-allowed",
            boxShadow: canPost ? "0 4px 14px rgba(124,92,252,0.35)" : "none",
            transition: "all 0.2s",
            opacity: posting ? 0.7 : 1,
          }}
        >
          {posting ? "Posting…" : "Post"}
        </button>
      </div>

      {/* Hidden file inputs */}
      <input ref={photoRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={addPhotos} />
      <input ref={videoRef} type="file" accept="video/*" multiple style={{ display: "none" }} onChange={addVideo} />
    </div>
  );
}