import React, { useState, useEffect } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import Loader from "../../../components/common/Loader";
import API from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";

/* ── Icons ── */
const HeartIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const CommentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

/* ── Post Card ── */
function MyPostCard({ post, onDelete, onUpdated }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(
    Array.isArray(post.likes) && post.likes.some(id => id === user?._id || id?._id === user?._id)
  );
  const [likesCount, setLikesCount] = useState(
    Array.isArray(post.likes) ? post.likes.length : (post.likes || 0)
  );
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLike = async () => {
    try {
      const res = await API.post(`/posts/${post._id}/like`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (err) { console.error(err); }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await API.post(`/posts/${post._id}/comment`, { content: newComment });
      setComments(prev => [...prev, res.data.comment]);
      setNewComment("");
    } catch (err) { console.error(err); }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      const res = await API.put(`/posts/${post._id}`, { content: editContent });
      onUpdated(res.data.post);
      setEditing(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    setDeleting(true);
    try {
      await API.delete(`/posts/${post._id}`);
      onDelete(post._id);
    } catch (err) { console.error(err); setDeleting(false); }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div style={{
      background: "var(--bg-3)", border: "1px solid var(--border)",
      borderRadius: 18, overflow: "hidden",
      animation: "fadeUp 0.3s ease both",
      transition: "border-color 0.2s",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
    >
      <div style={{ height: 3, background: "linear-gradient(90deg, #7C5CFC, #FF7043)" }} />
      <div style={{ padding: "18px 20px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #7C5CFC, #FF7043)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: 15, fontFamily: "Plus Jakarta Sans",
            }}>
              {(post.author?.name || "Y")[0].toUpperCase()}
            </div>
            <div>
              <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                {post.author?.name || "You"}
              </p>
              <p style={{ fontSize: 11, color: "var(--text-3)" }}>{timeAgo(post.createdAt)}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { setEditing(!editing); setEditContent(post.content); }}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 8,
                background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.2)",
                color: "var(--purple-light)", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              <EditIcon /> Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 8,
                background: "rgba(255,68,68,0.07)", border: "1px solid rgba(255,68,68,0.18)",
                color: "#FF6B6B", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              <TrashIcon /> {deleting ? "..." : "Delete"}
            </button>
          </div>
        </div>

        {/* Content / Edit */}
        {editing ? (
          <div style={{ marginBottom: 14 }}>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={4}
              style={{
                width: "100%", padding: "12px 14px", boxSizing: "border-box",
                background: "var(--bg-4)", border: "1px solid rgba(124,92,252,0.35)",
                borderRadius: 12, color: "var(--text)", fontSize: 14,
                lineHeight: 1.65, outline: "none", fontFamily: "DM Sans", resize: "vertical",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                style={{
                  padding: "8px 18px", borderRadius: 10,
                  background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
                  border: "none", color: "white", fontSize: 13, fontWeight: 700,
                  fontFamily: "Plus Jakarta Sans", cursor: "pointer",
                }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{
                  padding: "8px 14px", borderRadius: 10,
                  background: "transparent", border: "1px solid var(--border)",
                  color: "var(--text-3)", fontSize: 13, cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 14, whiteSpace: "pre-wrap" }}>
            {post.content}
          </p>
        )}

        {/* Media */}
        {(Array.isArray(post.media) ? post.media.length > 0 : Boolean(post.image)) && !editing && (
          <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
            {(Array.isArray(post.media) ? post.media : [{ url: post.image, type: "image" }]).filter(item => item?.url).map((item, index) => (
              <div key={`${item.url}-${index}`} style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-4)" }}>
                {item.type === "video" ? (
                  <video
                    controls
                    src={item.url}
                    style={{ width: "100%", display: "block", maxHeight: 360, objectFit: "cover" }}
                  />
                ) : (
                  <img
                    src={item.url}
                    alt="Post media"
                    style={{ width: "100%", display: "block", maxHeight: 420, objectFit: "cover" }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 16, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <button
            onClick={handleLike}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none",
              color: liked ? "#FF6B6B" : "var(--text-3)",
              fontSize: 13, cursor: "pointer", padding: 0,
              transition: "color 0.15s",
            }}
          >
            <HeartIcon filled={liked} /> {likesCount}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none",
              color: showComments ? "var(--purple-light)" : "var(--text-3)",
              fontSize: 13, cursor: "pointer", padding: 0,
            }}
          >
            <CommentIcon /> {comments.length}
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div style={{ marginTop: 14 }}>
            {comments.map((c, i) => (
              <div key={c._id || i} style={{
                padding: "8px 12px", borderRadius: 10, background: "var(--bg-4)",
                border: "1px solid var(--border)", marginBottom: 6,
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", marginRight: 6 }}>
                  {c.author?.name || "User"}
                </span>
                <span style={{ fontSize: 13, color: "var(--text-2)" }}>{c.content}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleComment()}
                placeholder="Add a comment…"
                style={{
                  flex: 1, padding: "9px 14px",
                  background: "var(--bg-4)", border: "1px solid var(--border)",
                  borderRadius: 10, color: "var(--text)", fontSize: 13,
                  outline: "none", fontFamily: "DM Sans",
                }}
                onFocus={e => e.target.style.borderColor = "var(--purple)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
              <button
                onClick={handleComment}
                disabled={!newComment.trim()}
                style={{
                  padding: "9px 14px", borderRadius: 10,
                  background: newComment.trim() ? "linear-gradient(135deg, #7C5CFC, #9B7EFF)" : "var(--bg-4)",
                  border: "none", color: newComment.trim() ? "white" : "var(--text-3)",
                  fontSize: 12, fontWeight: 700, cursor: newComment.trim() ? "pointer" : "not-allowed",
                }}
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts/my");
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error(err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = (id) => setPosts(prev => prev.filter(p => p._id !== id));
  const handleUpdated = (updatedPost) => setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));

  return (
    <MainLayout>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 0" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 24, color: "var(--text)", marginBottom: 4 }}>
            My Posts
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>
            {posts.length} post{posts.length !== 1 ? "s" : ""} published
          </p>
        </div>

        {loading && <Loader text="Loading posts..." />}

        {!loading && posts.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 18,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
            <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
              No posts yet
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-3)" }}>
              Share insights and announcements from your Feed page.
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {posts.map(post => (
            <MyPostCard
              key={post._id}
              post={post}
              onDelete={handleDelete}
              onUpdated={handleUpdated}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}