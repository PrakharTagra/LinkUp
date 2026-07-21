import React, { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ─── Icons ────────────────────────────────────────────────────────────────────
const ChatIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const BotIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>
  </svg>
);

// ─── Suggestion chips shown at start ──────────────────────────────────────────
const ROLE_SUGGESTIONS = {
  student: [
    "How do I find a mentor?",
    "What courses and sessions should I start with?",
    "How does My Learning work?",
    "How can I connect with alumni in my field?",
  ],
  alumni: [
    "How do I create a paid session or workshop?",
    "How does premium upgrade and payout work?",
    "How can I improve enrollments for my course?",
    "Where do I manage my sessions and earnings?",
  ],
  admin: [
    "How do I review platform analytics?",
    "Where can I manage users and access?",
    "How do I track sessions and course activity?",
    "What are the key moderation tools available?",
  ],
  guest: [
    "What can students do here?",
    "How does alumni premium work?",
    "How do I find a mentor?",
    "What courses are available?",
  ],
};

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "6px 2px" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "var(--purple-light)",
          animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
          display: "inline-block",
        }}/>
      ))}
      <style>{`
        @keyframes bounce {
          0%,80%,100% { transform: scale(0.7); opacity:0.4 }
          40% { transform: scale(1); opacity:1 }
        }
      `}</style>
    </div>
  );
}

// ─── Format bot reply (supports **bold** and bullet lines) ────────────────────
function BotMessage({ text }) {
  const lines = text.split("\n").filter(Boolean);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} style={{ margin: 0, lineHeight: 1.55 }}>
            {parts.map((part, j) =>
              part.startsWith("**") && part.endsWith("**")
                ? <strong key={j} style={{ color: "var(--purple-light)" }}>{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_AI_API_URL || "http://localhost:5001";

export default function ChatWidget() {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: `Hi${user?.name ? ` ${user.name.split(" ")[0]}` : ""}! 👋 I'm **Connect AI** — your guide to this platform.\n\nI can help you explore features, find mentors, understand courses, and answer any question about Connect.`,
    },
  ]);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  async function send(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { from: "user", text: msg }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          userRole: user?.role || "student",
          userSkills: user?.skills || [],
          userName: user?.name || "",
          isGuest: !user,
          pagePath: location.pathname,
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { from: "bot", text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { from: "bot", text: "⚠️ Couldn't reach the server. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  const hasSentMessage = messages.length > 1;
  const suggestedQuestions = useMemo(() => {
    const role = user?.role || "guest";
    return ROLE_SUGGESTIONS[role] || ROLE_SUGGESTIONS.guest;
  }, [user?.role]);

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          width: 52, height: 52, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--purple) 0%, #5B4FCF 100%)",
          border: "none", cursor: "pointer", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(124,92,252,0.5)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(124,92,252,0.65)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)";   e.currentTarget.style.boxShadow = "0 4px 20px rgba(124,92,252,0.5)"; }}
        aria-label="Toggle Connect AI chat"
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>

      {/* ── Chat Panel ── */}
      {open && (
        <div style={{
          position: "fixed", bottom: 88, right: 24, zIndex: 9998,
          width: 360, maxHeight: "calc(100vh - 120px)",
          background: "var(--bg-2)",
          border: "1px solid var(--border-bright)",
          borderRadius: 16,
          boxShadow: "0 12px 48px rgba(0,0,0,0.55)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          animation: "slideUp 0.22s ease-out",
        }}>
          <style>{`
            @keyframes slideUp {
              from { opacity:0; transform:translateY(16px) }
              to   { opacity:1; transform:translateY(0) }
            }
            .chat-scroll::-webkit-scrollbar { width:4px }
            .chat-scroll::-webkit-scrollbar-track { background:transparent }
            .chat-scroll::-webkit-scrollbar-thumb { background:rgba(124,92,252,0.3); border-radius:4px }
          `}</style>

          {/* Header */}
          <div style={{
            padding: "14px 16px",
            background: "linear-gradient(135deg, rgba(124,92,252,0.18) 0%, rgba(91,79,207,0.1) 100%)",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--purple), #5B4FCF)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff",
            }}>
              <BotIcon />
            </div>
            <div>
              <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 13.5 }}>Connect AI</div>
              <div style={{ color: "var(--teal)", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", display: "inline-block" }}/>
                Online · Platform & Career Assistant
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              marginLeft: "auto", background: "none", border: "none",
              color: "var(--text-3)", cursor: "pointer", padding: 4,
            }}>
              <CloseIcon />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-scroll" style={{
            flex: 1, overflowY: "auto", padding: "14px 12px",
            display: "flex", flexDirection: "column", gap: 10,
            minHeight: 0,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: m.from === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "82%",
                  padding: "9px 13px",
                  borderRadius: m.from === "user"
                    ? "14px 14px 4px 14px"
                    : "14px 14px 14px 4px",
                  background: m.from === "user"
                    ? "linear-gradient(135deg, var(--purple) 0%, #5B4FCF 100%)"
                    : "var(--bg-4)",
                  color: m.from === "user" ? "#fff" : "var(--text)",
                  fontSize: 13, lineHeight: 1.55,
                  border: m.from === "bot" ? "1px solid var(--border)" : "none",
                  boxShadow: m.from === "user" ? "0 2px 12px rgba(124,92,252,0.35)" : "none",
                }}>
                  {m.from === "bot" ? <BotMessage text={m.text} /> : m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  padding: "6px 13px", borderRadius: "14px 14px 14px 4px",
                  background: "var(--bg-4)", border: "1px solid var(--border)",
                }}>
                  <TypingDots />
                </div>
              </div>
            )}

            {/* Suggestion chips — only on first open */}
            {!hasSentMessage && !loading && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {suggestedQuestions.map(s => (
                  <button key={s} onClick={() => send(s)} style={{
                    background: "transparent",
                    border: "1px solid var(--border-bright)",
                    color: "var(--purple-light)",
                    borderRadius: 20, padding: "5px 11px",
                    fontSize: 11.5, cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--purple-dim)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "10px 12px",
            borderTop: "1px solid var(--border)",
            display: "flex", gap: 8, alignItems: "center",
            background: "var(--bg-3)",
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask anything about Connect..."
              style={{
                flex: 1, background: "var(--bg-4)",
                border: "1px solid var(--border)",
                borderRadius: 10, padding: "9px 13px",
                color: "var(--text)", fontSize: 13,
                outline: "none", transition: "border 0.2s",
                fontFamily: "inherit",
              }}
              onFocus={e => e.target.style.borderColor = "var(--purple)"}
              onBlur={e  => e.target.style.borderColor = "var(--border)"}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, var(--purple), #5B4FCF)"
                  : "var(--bg-4)",
                border: "1px solid var(--border)",
                color: input.trim() && !loading ? "#fff" : "var(--text-3)",
                cursor: input.trim() && !loading ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s, color 0.2s",
                flexShrink: 0,
              }}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
}