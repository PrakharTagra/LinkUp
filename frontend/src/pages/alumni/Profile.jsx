import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import ProfileCard from "../../components/profile/ProfileCard";
import EditProfile from "../../components/profile/EditProfile";
import ProfileCompletion from "../../components/profile/ProfileCompletion";
import Stats from "../../components/profile/Stats";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";
import PostCard from "../../components/feed/PostCard";
import API from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

function AlumniProfile() {
  const { user, updateUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [profileUser, setProfileUser] = useState(user || null);
  const [connectionsList, setConnectionsList] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState([
    { label: "Total Sessions", value: 0 },
    { label: "Students Mentored", value: 0 },
    { label: "Membership", value: "Inactive" },
    { label: "Earnings", value: "₹0" },
  ]);
  const [loading, setLoading] = useState(true);

  const currentUserId = String(profileUser?._id || "");
  const normalizedConnections = connectionsList.map((row) => {
    const from = row?.from;
    const to = row?.to;
    const partner = String(from?._id) === currentUserId ? to : from;
    return {
      _id: partner?._id,
      name: partner?.name || "Unknown User",
      title: partner?.title || "",
      company: partner?.company || "",
      college: partner?.college || "",
      avatar: partner?.avatar || "",
      role: partner?.role || "student",
    };
  }).filter((c) => c?._id);

  const displayProfileUser = {
    ...(profileUser || {}),
    connections: normalizedConnections.length > 0
      ? normalizedConnections
      : (profileUser?.connections || []),
  };

  const completionChecks = [
    { label: "Profile Photo", done: Boolean(displayProfileUser?.avatar) },
    { label: "Title", done: Boolean(String(displayProfileUser?.title || "").trim()) },
    { label: "Company", done: Boolean(String(displayProfileUser?.company || "").trim()) },
    { label: "About", done: Boolean(String(displayProfileUser?.about || "").trim()) },
    { label: "Skills", done: (displayProfileUser?.skills || []).length > 0 },
    { label: "Education", done: (displayProfileUser?.education || []).length > 0 },
    { label: "Projects", done: (displayProfileUser?.projects || []).length > 0 },
    { label: "Connections", done: (displayProfileUser?.connections || []).length > 0 },
  ];
  const completedChecks = completionChecks.filter((item) => item.done).length;
  const profileCompletionPercent = completionChecks.length
    ? Math.round((completedChecks / completionChecks.length) * 100)
    : 0;
  const missingSections = completionChecks.filter((item) => !item.done).map((item) => item.label);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [meRes, postsRes, earningsRes, sessionsRes] = await Promise.all([
          API.get("/auth/me"),
          API.get("/posts/my"),
          API.get("/earnings/stats"),
          API.get("/sessions/my"),
        ]);

        const latestUser = meRes?.data?.user || meRes?.data || user;
        setProfileUser(latestUser);

        setPosts(postsRes.data.posts || []);

        const statsData = earningsRes.data;
        setStats([
          { label: "Total Sessions", value: sessionsRes.data.sessions?.length || 0 },
          { label: "Students Mentored", value: statsData?.totalTransactions || 0 },
          { label: "Membership", value: latestUser?.alumniMembershipActive ? "Active" : "Inactive" },
          { label: "Total Earnings", value: `₹${(statsData?.totalGross || 0).toLocaleString()}` },
        ]);
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchConnections = async () => {
      try {
        const res = await API.get("/connections");
        setConnectionsList(res?.data?.connections || []);
      } catch (err) {
        console.error("Failed to load connections list:", err);
        setConnectionsList([]);
      }
    };

    fetchConnections();
  }, [user]);

  const handleAvatarChange = async (base64) => {
    try {
      const res = await updateUser({ avatar: base64 });
      const updated = res?.user || res;
      if (updated) setProfileUser(updated);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      alert("Failed to upload avatar. Please try again.");
    }
  };

  const handleCoverChange = async (base64) => {
    try {
      const res = await updateUser({ coverPhoto: base64 });
      const updated = res?.user || res;
      if (updated) setProfileUser(updated);
    } catch (err) {
      console.error("Cover photo upload failed:", err);
      alert("Failed to upload cover photo. Please try again.");
    }
  };

  const handleSaveProfile = async (updated) => {
    try {
      const res = await updateUser(updated);
      const updatedUser = res?.user || res;
      if (updatedUser) setProfileUser(updatedUser);
      setOpen(false);
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  if (!profileUser) return null;

  return (
    <MainLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 720, margin: "0 auto", padding: "24px 0" }}>
        <ProfileCard
          user={displayProfileUser}
          onEdit={() => setOpen(true)}
          onAvatarChange={handleAvatarChange}
          onCoverChange={handleCoverChange}
        />

        <ProfileCompletion
          percent={profileCompletionPercent}
          missing={missingSections}
          onCompleteProfile={() => setOpen(true)}
        />

        {/* Stats */}
        <Stats stats={stats} />

        {/* Alumni Posts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 18, color: "var(--text)", margin: 0 }}>
            My Posts
          </h2>

          {loading ? (
            <Loader text="Loading posts..." />
          ) : posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 20px", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 14 }}>
              <p style={{ fontSize: 14, color: "var(--text-3)", margin: 0 }}>No posts found for your profile yet.</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))
          )}
        </div>

        <div style={{ padding: 20, background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 14 }}>
          <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 18, color: "var(--text)", margin: 0, marginBottom: 12 }}>
            Projects
          </h2>

          {displayProfileUser?.projects?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {displayProfileUser.projects.map((project, index) => (
                <div
                  key={`${project.title || "project"}-${index}`}
                  style={{
                    padding: "12px 14px",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    background: "var(--bg-2)",
                  }}
                >
                  <h3 style={{ margin: 0, marginBottom: 6, fontSize: 14, color: "var(--text)", fontWeight: 700 }}>
                    {project.title || "Untitled Project"}
                  </h3>

                  {project.description && (
                    <p style={{ margin: 0, marginBottom: 8, fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                      {project.description}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 12, fontWeight: 700, color: "var(--purple-light)", textDecoration: "none" }}
                      >
                        Open Project Link
                      </a>
                    )}

                    {project.fileUrl && (
                      <a
                        href={project.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 12, fontWeight: 700, color: "var(--teal)", textDecoration: "none" }}
                      >
                        View File {project.fileName ? `(${project.fileName})` : ""}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-3)" }}>
              No projects added yet. Add projects from Edit Profile.
            </p>
          )}
        </div>

        {/* Edit Profile Modal */}
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Edit Profile"
        >
          <EditProfile
            user={displayProfileUser}
            onSave={handleSaveProfile}
          />
        </Modal>

      </div>
    </MainLayout>
  );
}

export default AlumniProfile;