import React from "react";

export default function ConversationList({ conversations = [], activeChat, setActiveChat }) {
  return (
    <div style={{
      width: 280, flexShrink: 0,
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      background: "var(--bg-2)",
    }}>
      <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border)" }}>
        <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>Messages</h2>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {conversations.length === 0 ? (
          <p style={{ padding: 16, fontSize: 13, color: "var(--text-3)" }}>No conversations yet.</p>
        ) : conversations.map(chat => (
          <div key={chat.id}
            onClick={() => setActiveChat(chat)}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", cursor: "pointer",
              borderBottom: "1px solid var(--border)",
              background: activeChat?.id === chat.id ? "rgba(124,92,252,0.08)" : "transparent",
              borderLeft: activeChat?.id === chat.id ? "2px solid var(--purple)" : "2px solid transparent",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { if (activeChat?.id !== chat.id) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            onMouseLeave={e => { if (activeChat?.id !== chat.id) e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 11, flexShrink: 0,
              background: "linear-gradient(135deg, #7C5CFC44, #FF704344)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--purple-light)", fontWeight: 700, fontSize: 15, fontFamily: "Plus Jakarta Sans",
            }}>{chat.name[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{chat.name}</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}