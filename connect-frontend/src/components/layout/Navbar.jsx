import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";
const connectLogo = "/connect-logo.png";

const SEARCH_INDEX = [
  { title: "Feed", path: "/feed", roles: ["student"], keywords: ["posts", "updates", "feed"] },
  { title: "Networking", path: "/networking", roles: ["student"], keywords: ["alumni", "connect", "mentors"] },
  { title: "Academics", path: "/academics", roles: ["student"], keywords: ["courses", "sessions", "workshops"] },
  { name: "CareerPath", label: "Career Path", path: "/career-path" },
  { title: "Messages", path: "/messages", roles: ["student"], keywords: ["chat", "conversation", "inbox"] },
  { title: "My Learning", path: "/my-learning", roles: ["student"], keywords: ["enrolled", "learning", "courses"] },
  { title: "Membership Alumni", path: "/membership-alumni", roles: ["student"], keywords: ["membership", "subscribe", "alumni"] },
  { title: "Student Profile", path: "/profile", roles: ["student"], keywords: ["profile", "account", "settings"] },

  { title: "Alumni Feed", path: "/alumni/dashboard/feed", roles: ["alumni"], keywords: ["feed", "posts", "insights"] },
  { title: "Alumni Messages", path: "/alumni/dashboard/messages", roles: ["alumni"], keywords: ["messages", "students", "chat"] },
  { title: "My Posts", path: "/alumni/dashboard/my-posts", roles: ["alumni"], keywords: ["posts", "content", "publish"] },
  { title: "Sessions", path: "/alumni/dashboard/sessions", roles: ["alumni"], keywords: ["sessions", "events", "workshops"] },
  { title: "Earnings", path: "/alumni/dashboard/earnings", roles: ["alumni"], keywords: ["earnings", "revenue", "payout"] },
  { title: "Alumni Membership", path: "/alumni/dashboard/membership", roles: ["alumni"], keywords: ["membership", "subscribers", "dashboard"] },
  { title: "Alumni Profile", path: "/alumni/profile", roles: ["alumni"], keywords: ["profile", "account", "bio"] },

  { title: "Admin Dashboard", path: "/admin", roles: ["admin"], keywords: ["admin", "overview", "dashboard"] },
  { title: "Admin Users", path: "/admin/users", roles: ["admin"], keywords: ["users", "students", "alumni"] },
  { title: "Admin Courses", path: "/admin/courses", roles: ["admin"], keywords: ["courses", "catalog"] },
  { title: "Admin Sessions", path: "/admin/sessions", roles: ["admin"], keywords: ["sessions", "events"] },
  { title: "Admin Analytics", path: "/admin/analytics", roles: ["admin"], keywords: ["analytics", "reports", "insights"] },
  { title: "Admin Profile", path: "/admin/profile", roles: ["admin"], keywords: ["profile", "account"] },

  { title: "Landing", path: "/", roles: ["student", "alumni", "admin"], keywords: ["home", "landing", "connect"] },
  { title: "Login", path: "/login", roles: ["student", "alumni", "admin"], keywords: ["login", "signin", "auth"] },
  { title: "Signup", path: "/signup", roles: ["student", "alumni", "admin"], keywords: ["signup", "register", "auth"] },
];

const BellIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 5.5 2.5 7 2.5 7H3.5S6 13.5 6 8"/>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    <line x1="12" y1="2" x2="12" y2="4"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10.5" cy="10.5" r="7.5"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
);

const roleColors = { student: "#7C5CFC", alumni: "#FF7043", admin: "#00E5C3" };

const formatRelativeTime = (dateValue) => {
  if (!dateValue) return "Just now";
  const time = new Date(dateValue).getTime();
  if (Number.isNaN(time)) return "Just now";

  const diffMs = Date.now() - time;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "Just now";
  if (diffMs < hour) return `${Math.max(1, Math.floor(diffMs / minute))}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  return `${Math.floor(diffMs / day)}d ago`;
};

export default function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showUser, setShowUser]   = useState(false);
  const [search, setSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const notifRef = useRef();
  const userRef  = useRef();
  const searchRef = useRef();

  const searchItems = SEARCH_INDEX.filter(item => item.roles?.includes(user?.role || "student"));
  const searchResults = search
    ? searchItems
        .filter(item => {
          const query = search.toLowerCase();
          const titleMatch = item.title.toLowerCase().includes(query);
          const keywordMatch = item.keywords.some(k => k.includes(query));
          return titleMatch || keywordMatch;
        })
        .slice(0, 8)
    : [];

  const handleSearchNavigate = (path) => {
    navigate(path);
    setSearch("");
    setShowSearchResults(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setShowUser(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchResults(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?._id) {
        setNotifications([]);
        return;
      }

      const readKey = `navbar_notifications_read_${user._id}`;
      let readIds = new Set();
      try {
        readIds = new Set(JSON.parse(localStorage.getItem(readKey) || "[]"));
      } catch {
        readIds = new Set();
      }

      const [pendingResult, conversationsResult] = await Promise.allSettled([
        API.get("/connections/pending"),
        API.get("/messages/conversations"),
      ]);

      const nextNotifications = [];

      if (pendingResult.status === "fulfilled") {
        const pending = pendingResult.value?.data?.pending || [];
        pending.forEach((request) => {
          const fromUser = request.from || {};
          const notifId = `conn-${request._id}`;
          nextNotifications.push({
            id: notifId,
            text: `${fromUser.name || "Someone"} sent you a connection request`,
            time: formatRelativeTime(request.createdAt || request.updatedAt),
            timestamp: new Date(request.createdAt || request.updatedAt || Date.now()).getTime(),
            unread: !readIds.has(notifId),
            path: user.role === "alumni" ? "/alumni/dashboard/connection-requests" : "/networking",
          });
        });
      }

      if (conversationsResult.status === "fulfilled") {
        const conversations = conversationsResult.value?.data?.conversations || [];
        conversations
          .filter((conv) => Number(conv.unread) > 0)
          .forEach((conv) => {
            const partner = conv.partner || {};
            const lastTime = conv.lastTime || Date.now();
            const notifId = `msg-${partner._id || "unknown"}-${new Date(lastTime).getTime()}`;
            nextNotifications.push({
              id: notifId,
              text: `${partner.name || "Someone"} sent ${conv.unread} unread message${conv.unread > 1 ? "s" : ""}`,
              time: formatRelativeTime(lastTime),
              timestamp: new Date(lastTime).getTime(),
              unread: !readIds.has(notifId),
              path: user.role === "alumni" ? "/alumni/dashboard/messages" : "/messages",
            });
          });
      }

      nextNotifications.sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(nextNotifications.slice(0, 10));
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 15000);
    const onFocus = () => fetchNotifications();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [user?._id, user?.role]);

  const persistReadIds = (updatedNotifications) => {
    if (!user?._id) return;
    const readKey = `navbar_notifications_read_${user._id}`;
    const readIds = updatedNotifications.filter((n) => !n.unread).map((n) => n.id);
    localStorage.setItem(readKey, JSON.stringify(readIds));
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    setNotifications(updated);
    persistReadIds(updated);
  };

  const handleNotificationClick = (notification) => {
    const updated = notifications.map((n) => n.id === notification.id ? { ...n, unread: false } : n);
    setNotifications(updated);
    persistReadIds(updated);
    setShowNotifs(false);
    if (notification.path) navigate(notification.path);
  };

  const handleLogout = () => { logout(); navigate("/"); };
  const unreadCount  = notifications.filter(n => n.unread).length;
  const accent = roleColors[user?.role] || "#7C5CFC";

  return (
    <div style={{
      height: 60,
      background: "rgba(8,9,14,0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px",
      position: "sticky", top: 0, zIndex: 100,
      gap: 16,
    }}>

      {/* Logo */}
      <div
        onClick={() => navigate(user?.role === "alumni" ? "/alumni/dashboard/feed" : user?.role === "admin" ? "/admin" : "/feed")}
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0 }}
      >
        <img
          src={connectLogo}
          alt="Connect"
          style={{
            height: 38,
            width: "auto",
            objectFit: "contain",
            mixBlendMode: "screen",
            flexShrink: 0,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
          <span style={{
            fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 23,
            letterSpacing: "-0.03em",
            color: "#FFFFFF",
          }}>Connect</span>
          <span style={{
            fontFamily: "DM Sans",
            fontWeight: 700,
            fontSize: 9,
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.45)",
            marginTop: 3,
            paddingLeft: 1,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}>LEARN·MENTOR·SUCCEED</span>
        </div>
      </div>

      {/* Search */}
      <div ref={searchRef} style={{ flex: 1, maxWidth: 380, position: "relative" }}>
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}>
          <SearchIcon />
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && searchResults.length > 0) {
              handleSearchNavigate(searchResults[0].path);
            }
          }}
          placeholder="Search alumni, courses, sessions…"
          style={{
            width: "100%",
            padding: "9px 14px 9px 36px",
            background: "var(--bg-3)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            color: "var(--text)",
            fontSize: 13,
            outline: "none",
            fontFamily: "DM Sans",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={e => {
            setShowSearchResults(true);
            e.target.style.borderColor = "var(--purple)";
            e.target.style.boxShadow = "0 0 0 3px rgba(124,92,252,0.12)";
          }}
          onBlur={e => {
            e.target.style.borderColor = "var(--border)";
            e.target.style.boxShadow = "none";
          }}
        />

        {showSearchResults && search.trim() !== "" && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "var(--bg-3)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
            zIndex: 220,
          }}>
          {searchResults.length > 0 ? (
            searchResults.map((item) => (
              <button
                key={item.path + item.title}
                onMouseDown={e => {
                  e.preventDefault();
                  handleSearchNavigate(item.path);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  borderBottom: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text)",
                  padding: "10px 12px",
                  cursor: "pointer",
                  fontFamily: "DM Sans",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{item.path}</div>
              </button>
            ))
          ) : (
            <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-3)" }}>
              No matching content found
            </div>
          )}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

        {/* Role badge */}
        {user?.role && (
          <div style={{
            padding: "4px 10px", borderRadius: 99,
            background: `${accent}18`,
            border: `1px solid ${accent}40`,
            color: accent,
            fontSize: 11, fontWeight: 700,
            textTransform: "capitalize",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: accent, display: "inline-block" }} />
            {user.role}
          </div>
        )}

        {/* Notifications */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            style={{
              width: 36, height: 36, borderRadius: 9,
              background: showNotifs ? "var(--bg-4)" : "transparent",
              border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-2)", transition: "all 0.2s", position: "relative",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-3)"}
            onMouseLeave={e => e.currentTarget.style.background = showNotifs ? "var(--bg-4)" : "transparent"}
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: 6, right: 6,
                width: 7, height: 7, borderRadius: "50%",
                background: "var(--danger)", border: "1.5px solid var(--bg)",
              }} />
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              width: 300,
              background: "var(--bg-3)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              zIndex: 200, overflow: "hidden",
              animation: "fadeUp 0.2s ease",
            }}>
              <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 14 }}>Notifications</span>
                <span
                  style={{ fontSize: 11, color: "var(--purple-light)", cursor: "pointer", fontWeight: 600 }}
                  onClick={handleMarkAllRead}
                >
                  Mark all read
                </span>
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: "14px 16px", fontSize: 12, color: "var(--text-3)" }}>
                  You are all caught up.
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border)",
                    display: "flex", gap: 10, alignItems: "flex-start",
                    background: n.unread ? "rgba(124,92,252,0.05)" : "transparent",
                    cursor: "pointer", transition: "background 0.15s",
                  }}
                    onClick={() => handleNotificationClick(n)}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                    onMouseLeave={e => e.currentTarget.style.background = n.unread ? "rgba(124,92,252,0.05)" : "transparent"}
                  >
                    {n.unread && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--purple)", flexShrink: 0, marginTop: 5 }} />}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.4 }}>{n.text}</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>{n.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User avatar */}
        <div ref={userRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowUser(!showUser)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "4px 8px 4px 4px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 10, cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-3)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: user?.avatar
                ? `url(${user.avatar}) center/cover no-repeat`
                : `linear-gradient(135deg, ${accent}, #FF7043)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: 13, fontWeight: 700,
              overflow: "hidden", flexShrink: 0,
            }}>
              {!user?.avatar && (user?.name || "U")[0].toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500 }}>
              {user?.name || "User"}
            </span>
          </button>

          {showUser && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              width: 180,
              background: "var(--bg-3)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
              zIndex: 200, overflow: "hidden",
              animation: "fadeUp 0.2s ease",
            }}>
              {[
                { label: "Profile", path: user?.role === "alumni" ? "/alumni/profile" : user?.role === "admin" ? "/admin/profile" : "/profile" },
                { label: "Settings", path: "#" },
              ].map(item => (
                <button key={item.label} onClick={() => { navigate(item.path); setShowUser(false); }}
                  style={{
                    width: "100%", padding: "10px 14px", textAlign: "left",
                    background: "transparent", border: "none",
                    color: "var(--text-2)", fontSize: 13,
                    borderBottom: "1px solid var(--border)",
                    transition: "all 0.15s", cursor: "pointer",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; }}
                >{item.label}</button>
              ))}
              <button onClick={handleLogout}
                style={{
                  width: "100%", padding: "10px 14px", textAlign: "left",
                  background: "transparent", border: "none",
                  color: "var(--danger)", fontSize: 13, cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,75,110,0.08)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >Log out</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}