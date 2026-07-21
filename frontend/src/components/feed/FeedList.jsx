import React from "react";
import PostCard from "./PostCard";

export default function FeedList({ posts = [], loading = false }) {
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            background: "var(--bg-3)", border: "1px solid var(--border)",
            borderRadius: 18, padding: "20px", height: 140,
            animation: "shimmer 1.5s infinite",
            backgroundImage: "linear-gradient(90deg, var(--bg-3) 25%, var(--bg-4) 50%, var(--bg-3) 75%)",
            backgroundSize: "200% 100%",
          }} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "50px 20px",
        background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 18,
      }}>
        <p style={{ fontSize: 36, marginBottom: 12 }}>📭</p>
        <p style={{ fontSize: 14, color: "var(--text-3)" }}>No posts yet. Be the first to post!</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {posts.map((post, i) => (
        <div key={post.id} style={{ animation: "fadeUp 0.4s ease both", animationDelay: `${i * 60}ms` }}>
          <PostCard post={post} />
        </div>
      ))}
    </div>
  );
}