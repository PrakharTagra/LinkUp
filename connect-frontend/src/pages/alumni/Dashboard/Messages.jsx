import React, { useState, useRef, useEffect } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import Loader from "../../../components/common/Loader";
import { useAuth } from "../../../context/AuthContext";

/* ── Icons ── */
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

import API from "../../../utils/api";
import { useLocation } from "react-router-dom";

/* ── Conversation Item ── */
function ConversationItem({ chat, active, onClick }) {
  return (
    <div
      onClick={() => onClick(chat)}
      style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 14px", cursor: "pointer", borderBottom: "1px solid var(--border)", background: active ? "rgba(124,92,252,0.08)" : "transparent", borderLeft: active ? "2px solid var(--purple)" : "2px solid transparent", transition: "all 0.15s" }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: chat.subscribed ? "linear-gradient(135deg, #FF704344, #FF9A6C44)" : "linear-gradient(135deg, #7C5CFC22, #9B7EFF22)", display: "flex", alignItems: "center", justifyContent: "center", color: chat.subscribed ? "var(--orange)" : "var(--purple-light)", fontWeight: 700, fontSize: 14, fontFamily: "Plus Jakarta Sans" }}>
          {chat.avatar}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{chat.name}</span>
            {chat.subscribed && <span style={{ color: "#FFB830", display: "flex" }}><StarIcon /></span>}
          </div>
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>{chat.time}</span>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
          {chat.lastMessage}
        </p>
      </div>

      {chat.unread > 0 && (
        <span style={{ width: 18, height: 18, borderRadius: "50%", background: chat.subscribed ? "var(--orange)" : "var(--purple)", color: "white", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {chat.unread}
        </span>
      )}
    </div>
  );
}

/* ── Main ── */
export default function AlumniMessages() {
  const { user } = useAuth();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef();

  const hasActiveMembership = user?.alumniMembershipActive ?? (user?.alumniPlan === "premium");

  useEffect(() => {
    fetchConversations();
  }, [location.search]);

  const fetchConversations = async () => {
    setConversationsLoading(true);
    try {
      const res = await API.get("/messages/conversations");
      const fetched = res.data.conversations || [];
      const formatted = fetched.map(c => ({
        id: c.partner?._id,
        name: c.partner?.name,
        company: c.partner?.company || c.partner?.role,
        lastMessage: c.lastMessage,
        time: new Date(c.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: "2-digit" }),
        unread: c.unread,
        avatar: c.partner?.name ? c.partner.name[0].toUpperCase() : "U",
        color: "#7C5CFC",
        subscribed: Boolean(c.partner?.membershipTaken || c.partner?.subscribed)
      })).filter(c => c.id);
      setConversations(formatted);
      
      const searchParams = new URLSearchParams(location.search);
      const userParam = searchParams.get("user");

      const currentList = formatted;

      if (userParam) {
        const existing = currentList.find(c => c.id === userParam);
        if (existing) setActiveChat(existing);
        else {
          try {
            const userRes = await API.get(`/users/${userParam}`);
            const profile = userRes?.data?.user || {};
            setActiveChat({
              id: userParam,
              name: profile.name || "New Conversation",
              company: profile.company || profile.role || "Start chatting...",
              avatar: profile.name ? profile.name[0].toUpperCase() : "N",
              color: "#7C5CFC",
              subscribed: Boolean(profile.membershipTaken || profile.subscribed),
            });
          } catch {
            setActiveChat({ id: userParam, name: "New Conversation", company: "Start chatting...", avatar: "N", color: "#7C5CFC", subscribed: true });
          }
        }
      } else if (currentList.length > 0 && !activeChat) {
        setActiveChat(currentList[0]);
      } else if (currentList.length === 0) {
        setActiveChat(null);
      }
    } catch(err) { 
       console.error(err);
       setConversations([]);
       setActiveChat(null);
    } finally {
      setConversationsLoading(false);
    }
  };

  useEffect(() => {
    if (activeChat?.id) fetchMessages(activeChat.id);
  }, [activeChat]);

  const fetchMessages = async (userId) => {
    setMessagesLoading(true);
    try {
      const res = await API.get(`/messages/${userId}`);
      const fetched = res.data.messages || [];
      const formatted = fetched.map(m => ({
        sender: String(m.sender?._id || m.sender) === String(userId) ? "them" : "me",
        text: m.content,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: "2-digit" })
      }));
      setMessages(formatted);
    } catch(err) { 
      console.error(err);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat]);

  const handleSend = async () => {
    if (!input.trim() || !activeChat) return;
    const textToSend = input.trim();
    setInput("");
    
    setMessages(prev => [...prev, { sender: "me", text: textToSend, time: "Just now" }]);
    
    try {
      await API.post(`/messages/${activeChat.id}`, { content: textToSend });
      fetchConversations();
    } catch (err) { console.error(err); }
  };

  const currentMsgs = messages || [];
  const visibleActiveMembershipChats = hasActiveMembership ? conversations.filter(c => c.subscribed) : [];
  const basicChats = conversations.filter(c => !c.subscribed);

  const totalActiveMembershipUnread = visibleActiveMembershipChats.reduce((s, c) => s + c.unread, 0);
  const totalBasicUnread = basicChats.reduce((s, c) => s + c.unread, 0);

  return (
    <MainLayout>
      <div style={{ display: "flex", height: "calc(100vh - 108px)", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>

        {/* LEFT */}
        <div style={{ width: 290, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", flexShrink: 0 }}>

          <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>Messages</h2>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
              {visibleActiveMembershipChats.length + basicChats.length} conversations
            </p>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {conversationsLoading && <Loader text="Loading conversations..." />}

            {!hasActiveMembership && (
              <div style={{ margin: "8px 10px", padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
                <p style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.5, margin: 0 }}>
                  Membership is inactive. You can currently access only basic messages.
                </p>
              </div>
            )}

            {hasActiveMembership && !conversationsLoading && (
              <>
                {/* ACTIVE MEMBERSHIP section header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px 6px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ color: "#FFB830", display: "flex" }}><StarIcon /></span>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--orange)" }}>Active Membership</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 10, color: "var(--text-3)" }}>Members</span>
                    {totalActiveMembershipUnread > 0 && (
                      <span style={{ background: "var(--orange)", color: "white", borderRadius: 99, fontSize: 9, fontWeight: 700, padding: "1px 5px" }}>{totalActiveMembershipUnread}</span>
                    )}
                  </div>
                </div>

                {/* Membership info box */}
                <div style={{ margin: "8px 10px", padding: "7px 10px", borderRadius: 8, background: "rgba(255,112,67,0.06)", border: "1px solid rgba(255,112,67,0.15)" }}>
                  <p style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.5, margin: 0 }}>
                    ⭐ These students currently have an active membership with you.
                  </p>
                </div>

                {visibleActiveMembershipChats.map(chat => (
                  <ConversationItem key={chat.id} chat={chat} active={activeChat?.id === chat.id} onClick={setActiveChat} />
                ))}
              </>
            )}

            {/* BASIC section header */}
            {!conversationsLoading && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 14px 6px", borderBottom: "1px solid var(--border)", borderTop: "1px solid var(--border)", marginTop: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)" }}>Basic</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, color: "var(--text-3)" }}>Free students</span>
                {totalBasicUnread > 0 && (
                  <span style={{ background: "var(--purple)", color: "white", borderRadius: 99, fontSize: 9, fontWeight: 700, padding: "1px 5px" }}>{totalBasicUnread}</span>
                )}
              </div>
              </div>
            )}

            {!conversationsLoading && basicChats.map(chat => (
              <ConversationItem key={chat.id} chat={chat} active={activeChat?.id === chat.id} onClick={setActiveChat} />
            ))}
          </div>
        </div>

        {/* RIGHT */}
        {!activeChat ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 48 }}>💬</span>
            <p style={{ color: "var(--text-3)", fontSize: 14 }}>Select a conversation</p>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

            {/* Chat header */}
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: activeChat.subscribed ? "linear-gradient(135deg, #FF704344, #FF9A6C44)" : "linear-gradient(135deg, #7C5CFC22, #9B7EFF22)", display: "flex", alignItems: "center", justifyContent: "center", color: activeChat.subscribed ? "var(--orange)" : "var(--purple-light)", fontWeight: 700, fontFamily: "Plus Jakarta Sans" }}>
                  {activeChat.avatar}
                </div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{activeChat.name}</span>
                  {activeChat.subscribed ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: "rgba(255,112,67,0.12)", color: "var(--orange)", border: "1px solid rgba(255,112,67,0.2)" }}>
                      <StarIcon /> Member
                    </span>
                  ) : (
                    <span style={{ padding: "2px 7px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: "rgba(255,255,255,0.05)", color: "var(--text-3)", border: "1px solid var(--border)" }}>Basic</span>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messagesLoading && <Loader text="Loading messages..." />}

              {currentMsgs.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.sender === "me" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "68%", padding: "10px 14px", borderRadius: msg.sender === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.sender === "me" ? "linear-gradient(135deg, #7C5CFC, #9B7EFF)" : "var(--bg-4)", border: msg.sender === "me" ? "none" : "1px solid var(--border)", color: msg.sender === "me" ? "white" : "var(--text)", fontSize: 14, lineHeight: 1.5 }}>
                    <p style={{ margin: 0 }}>{msg.text}</p>
                    <p style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: msg.sender === "me" ? "right" : "left", margin: "4px 0 0" }}>{msg.time}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="text" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Type a message…"
                style={{ flex: 1, padding: "11px 16px", background: "var(--bg-4)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "DM Sans", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "var(--purple)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
              <button onClick={handleSend} disabled={!input.trim()} style={{ width: 42, height: 42, borderRadius: 12, background: input.trim() ? "linear-gradient(135deg, #7C5CFC, #9B7EFF)" : "var(--bg-4)", border: input.trim() ? "none" : "1px solid var(--border)", color: input.trim() ? "white" : "var(--text-3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "not-allowed", transition: "all 0.2s", flexShrink: 0, boxShadow: input.trim() ? "0 4px 14px rgba(124,92,252,0.3)" : "none" }}>
                <SendIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}