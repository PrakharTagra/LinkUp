import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import PostCard from "../../../components/feed/PostCard";
import Loader from "../../../components/common/Loader";
import { getPosts } from "../../../services/feedService";
import API from "../../../utils/api";

const FilterTabs = ["All", "Connected", "Trending", "Current Activity"];

export default function Feed() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [connectedIds, setConnectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsRes = await getPosts();
        setPosts(postsRes.posts || []);

        const connectionsRes = await API.get("/connections").catch(() => null);
        const activeRows = connectionsRes?.data?.connections || [];
        const connectedAlumni = activeRows
          .map((conn) => {
            const from = conn.from || {};
            const to = conn.to || {};
            const partner = from.role === "student" ? to : from;
            return partner?.role === "alumni" ? String(partner._id) : null;
          })
          .filter(Boolean);

        setConnectedIds(Array.from(new Set(connectedAlumni)));
      } catch (err) {
        console.error("Error fetching posts", err);
        setPosts([]);
        setConnectedIds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const openAlumniProfile = (post) => {
    const author = post?.author;
    const alumniId = typeof author === "object" ? author?._id : author;
    if (!alumniId) return;

    navigate("/alumni-profile", {
      state: {
        alumniId,
        alumni: typeof author === "object" ? author : undefined,
      },
    });
  };

  const connectedAlumniIds = useMemo(() => new Set(connectedIds), [connectedIds]);

  const filteredPosts = useMemo(() => {
    if (activeTab === "Trending") {
      return [...posts].sort((a, b) => {
        const likesA = Array.isArray(a?.likes) ? a.likes.length : Number(a?.likes || 0);
        const likesB = Array.isArray(b?.likes) ? b.likes.length : Number(b?.likes || 0);
        return likesB - likesA;
      });
    }

    return posts.filter((p) => {
      const authorId = typeof p.author === "object" ? p.author?._id : p.author;

      if (activeTab === "All") return true;
      if (activeTab === "Connected") {
        if (!authorId) return false;
        const isAlumniPost = p.author?.role === "alumni";
        return isAlumniPost && connectedAlumniIds.has(String(authorId));
      }
      if (activeTab === "Current Activity") return true;
      return true;
    });
  }, [activeTab, posts, connectedAlumniIds]);

  return (
    <MainLayout>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 0" }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontWeight: 800, fontSize: 24 }}>Home Feed</h1>
          <p style={{ fontSize: 14, color: "gray" }}>
            Real posts from your network
          </p>
        </div>

        {/* FILTER TABS */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          {FilterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "7px 18px",
                borderRadius: 99,
                flexShrink: 0,
                background: activeTab === tab
                  ? "linear-gradient(135deg, #7C5CFC, #9B7EFF)"
                  : "var(--bg-3)",
                border: `1px solid ${activeTab === tab ? "transparent" : "var(--border)"}`,
                color: activeTab === tab ? "white" : "var(--text-2)",
                fontSize: 13,
                fontWeight: activeTab === tab ? 700 : 500,
                fontFamily: activeTab === tab ? "Plus Jakarta Sans" : "DM Sans",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: activeTab === tab ? "0 4px 14px rgba(124,92,252,0.3)" : "none",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading && <Loader text="Loading posts..." />}

        {/* POSTS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onOpenProfile={() => openAlumniProfile(post)}
            />
          ))}
        </div>

        {/* EMPTY */}
        {!loading && filteredPosts.length === 0 && (
          <p style={{ textAlign: "center" }}>No posts found</p>
        )}
      </div>
    </MainLayout>
  );
}