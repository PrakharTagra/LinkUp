import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import CreatePost from "../../../components/feed/CreatePost";
import PostCard from "../../../components/feed/PostCard";
import CrownIcon from "../../../components/common/CrownIcon";
import Loader from "../../../components/common/Loader";
import { useAuth } from "../../../context/AuthContext";
import API from "../../../utils/api";

export default function AlumniFeed() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const isPremium = user?.alumniPlan === "premium";
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/posts");
      setPosts(res.data.posts || []);
    } catch(err) {
      console.error(err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };


  const addPost = async (newPost) => {
    try {
      await API.post("/posts", {
        content: newPost.content,
        media: newPost.media || [],
      });
      await fetchPosts();
    } catch (err) {
      const data = err?.response?.data;

      // ── Show specific rejection reason ───────────────────────
      if (err?.response?.status === 422) {
        alert(
          `❌ Post Rejected\n\n${data?.reason}\n\n` +
          `Strikes: ${data?.strikes}/4 — repeated violations may restrict your account.`
        );
      } else {
        alert("Failed to post: " + (data?.message || err.message));
      }
    }
  };

  const handleGoPremium = async () => {
    if (!user || user.role !== "alumni") {
      navigate("/signup", { state: { role: "alumni", plan: "premium" } });
      return;
    }

    try {
      await updateUser({ alumniPlan: "premium" });
      alert("🎉 You are now a Premium member!");
      window.location.reload();
    } catch (err1) {
      console.error("Profile update failed, trying upgrade-plan endpoint", err1);
      try {
        await API.patch("/users/upgrade-plan", { plan: "premium" });
        alert("🎉 You are now a Premium member!");
        window.location.reload();
      } catch (err2) {
        console.error("Upgrade failed", err2);
        const errMsg = err2?.response?.data?.message || err2.message || "Unknown error";
        alert("Upgrade failed. Details: " + errMsg);
      }
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 0" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 24, color: "var(--text)" }}>Alumni Feed</h1>
            {isPremium ? (
              <span style={{ display: "inline-flex", alignItems: "center" }}>
                <CrownIcon size={18} />
              </span>
            ) : (
              <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text-3)" }}>Free Plan</span>
            )}
          </div>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>Share insights, tips & session announcements</p>
        </div>

        {!isPremium && (
          <div style={{
            padding: "14px 18px", marginBottom: 20,
            background: "linear-gradient(135deg, rgba(255,112,67,0.08), rgba(255,154,108,0.06))",
            border: "1px solid rgba(255,112,67,0.2)", borderRadius: 14,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 20 }}>🆓</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>Free Plan — Post, connect & message students</p>
                <p style={{ fontSize: 12, color: "var(--text-3)" }}>Upgrade to Premium to create paid sessions, courses & workshops</p>
              </div>
            </div>
            <button onClick={handleGoPremium} style={{
              padding: "8px 16px", flexShrink: 0,
              background: "linear-gradient(135deg, #FF7043, #FF9A6C)", border: "none", borderRadius: 10,
              color: "white", fontSize: 12, fontWeight: 700, fontFamily: "Plus Jakarta Sans", cursor: "pointer",
            }}>Go Premium — ₹499 →</button>
          </div>
        )}

        <CreatePost onAddPost={addPost} />

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {loading && <Loader text="Loading posts..." />}

          {!loading && posts.length === 0 && (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-3)", fontSize: 14 }}>
              No posts yet.
            </div>
          )}

          {posts.map((post, i) => (
            <div key={post._id || post.id || i} style={{ animation: "fadeUp 0.35s ease both", animationDelay: `${i * 60}ms` }}>
              <PostCard post={post} />
            </div>
          ))}
        </div>

      </div>
    </MainLayout>
  );
}