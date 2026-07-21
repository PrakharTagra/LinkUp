import React, { useState, useRef, useEffect } from "react";

const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

export default function ChatWindow({ activeChat }) {
  const [messages, setMessages] = useState([
    { sender: "them", text: "Hey! How can I help you?",               time: "10:30 AM" },
    { sender: "me",   text: "I wanted guidance for placements.",       time: "10:32 AM" },
    { sender: "them", text: "Sure! Let's start from the basics first.", time: "10:33 AM" },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { sender: "me", text: input, time: "Just now" }]);
    setInput("");
  };

  if (!activeChat) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--text-3)" }}>
        <span style={{ fontSize: 48 }}>💬</span>
        <p style={{ fontSize: 14 }}>Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "linear-gradient(135deg, #7C5CFC44, #FF704344)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--purple-light)", fontWeight: 700, fontFamily: "Plus Jakarta Sans",
        }}>{activeChat.name[0]}</div>
        <div>
          <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{activeChat.name}</p>
          <p style={{ fontSize: 12, color: "var(--teal)" }}>● Online</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10, background: "var(--bg)" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.sender === "me" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "65%", padding: "10px 14px",
              borderRadius: msg.sender === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: msg.sender === "me" ? "linear-gradient(135deg, #7C5CFC, #9B7EFF)" : "var(--bg-3)",
              border: msg.sender === "me" ? "none" : "1px solid var(--border)",
              color: msg.sender === "me" ? "white" : "var(--text)",
              fontSize: 14, lineHeight: 1.5,
            }}>
              <p>{msg.text}</p>
              <p style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: msg.sender === "me" ? "right" : "left" }}>{msg.time}</p>
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
          style={{
            flex: 1, padding: "10px 15px",
            background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 11,
            color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "DM Sans", transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = "var(--purple)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
        <button onClick={handleSend} disabled={!input.trim()} style={{
          width: 40, height: 40, borderRadius: 11, border: "none",
          background: input.trim() ? "linear-gradient(135deg, #7C5CFC, #9B7EFF)" : "var(--bg-4)",
          color: input.trim() ? "white" : "var(--text-3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: input.trim() ? "pointer" : "not-allowed",
          boxShadow: input.trim() ? "0 4px 14px rgba(124,92,252,0.3)" : "none",
          transition: "all 0.2s", flexShrink: 0,
        }}>
          <SendIcon />
        </button>
      </div>
    </div>
  );
}