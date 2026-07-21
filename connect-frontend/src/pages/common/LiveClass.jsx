import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import API from "../../utils/api";

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

export default function LiveClass() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  
  const [session, setSession] = useState(state?.item || null);
  const [loading, setLoading] = useState(!session);
  const [chat, setChat] = useState([
    { id: 1, user: "System", text: "Welcome to the live session! Feel free to ask questions here.", time: "12:00 PM" },
    { id: 2, user: "Ananya", text: "Can we get the notes after this session?", time: "12:05 PM" },
  ]);
  const [message, setMessage] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await API.get(`/sessions/${id}`);
        setSession(res.data.session);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (!session) fetchSession();
  }, [id, session]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const newMessage = {
      id: Date.now(),
      user: user?.name || "Me",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChat([...chat, newMessage]);
    setMessage("");
  };

  if (loading) return <MainLayout><div style={{ padding: 40, textAlign: "center" }}>Initialising Live Stream...</div></MainLayout>;
  if (!session) return <MainLayout><div style={{ padding: 40, textAlign: "center" }}>Session Not Found</div></MainLayout>;

  const isInstructor = user?._id === session.instructor?._id || user?._id === session.instructor;

  return (
    <MainLayout hideFooter>
      <div style={{
        height: "calc(100vh - 140px)",
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        gap: 20,
        margin: "10px 0",
      }}>
        
        {/* VIDEO AREA */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 14,
          background: "#000", borderRadius: 24, overflow: "hidden",
          position: "relative",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        }}>
          {/* Top Bar Overlay */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
            padding: "20px 24px",
            background: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ 
                  background: "#FF4B6E", color: "white", fontSize: 11, fontWeight: 900, 
                  padding: "4px 10px", borderRadius: 6, letterSpacing: "0.08em" 
                }}>LIVE</span>
                <h1 style={{ color: "white", fontSize: 18, fontWeight: 700, fontFamily: "Plus Jakarta Sans" }}>{session.title}</h1>
              </div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{session.instructor?.name || "Alumni Instructor"} • 42 viewers</p>
            </div>
            <button onClick={() => navigate(-1)} style={{
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              color: "white", padding: "8px 16px", borderRadius: 10, cursor: "pointer",
              fontSize: 13, fontWeight: 600, backdropFilter: "blur(10px)",
            }}>Leave Session</button>
          </div>

          {/* Video Placeholder */}
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            background: "#111",
          }}>
             {isInstructor ? (
                 <div style={{ textAlign: "center", color: "white" }}>
                    <div style={{ fontSize: 60, marginBottom: 16 }}>📹</div>
                    <p style={{ fontSize: 18, fontWeight: 700 }}>Your camera is live</p>
                    <p style={{ color: "var(--text-3)", fontSize: 14 }}>Instructors can see your screen and video</p>
                 </div>
             ) : (
                <div style={{ width: "100%", height: "100%", position: "relative" }}>
                   {/* Simulating a video backdrop */}
                   <img src={session.thumbnail} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.3, filter: "blur(20px)" }} alt="" />
                   <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ textAlign: "center" }}>
                            <div className="live-ring" style={{ width: 80, height: 80, borderRadius: "50%", border: "4px solid #7C5CFC", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#7C5CFC" }} />
                            </div>
                            <p style={{ color: "white", fontSize: 18, fontWeight: 700 }}>Instructor is teaching...</p>
                        </div>
                   </div>
                </div>
             )}
          </div>

          {/* Controls Overlay */}
          <div style={{
            position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(14px)",
            padding: "8px 12px", borderRadius: 40, border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", gap: 10, zIndex: 10,
          }}>
             {[ 
               { icon: "🎙️", active: true },
               { icon: "📹", active: true },
               { icon: "🖥️", active: false },
               { icon: "✋", active: false },
               { icon: "⚙️", active: false }
             ].map((btn, i) => (
               <button key={i} style={{
                 width: 44, height: 44, borderRadius: "50%",
                 border: "none", background: btn.active ? "#333" : "transparent",
                 color: "white", fontSize: 18, cursor: "pointer", 
                 display: "flex", alignItems: "center", justifyContent: "center",
                 transition: "all 0.2s",
               }}
               onMouseEnter={e => e.currentTarget.style.background = "#444"}
               onMouseLeave={e => e.currentTarget.style.background = btn.active ? "#333" : "transparent"}
               >
                 {btn.icon}
               </button>
             ))}
          </div>
        </div>

        {/* CHAT AREA */}
        <div style={{
          display: "flex", flexDirection: "column",
          background: "var(--bg-3)", border: "1px solid var(--border)",
          borderRadius: 24, overflow: "hidden",
        }}>
          <div style={{
            padding: "18px 20px", borderBottom: "1px solid var(--border)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Live Chat</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--teal)", fontSize: 12, fontWeight: 700 }}>
              <UsersIcon /> 42
            </div>
          </div>

          <div style={{
            flex: 1, padding: "20px", overflowY: "auto",
            display: "flex", flexDirection: "column", gap: 16,
          }}>
            {chat.map(msg => (
              <div key={msg.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                   <span style={{ 
                     fontSize: 12, fontWeight: 800, 
                     color: msg.user === "System" ? "var(--purple-light)" : "var(--text-2)" 
                   }}>{msg.user}</span>
                   <span style={{ fontSize: 10, color: "var(--text-3)" }}>{msg.time}</span>
                </div>
                <p style={{ 
                  fontSize: 13, color: msg.user === "System" ? "var(--text-3)" : "var(--text)", 
                  lineHeight: 1.5,
                  padding: msg.user === "System" ? "0" : "8px 12px",
                  background: msg.user === "System" ? "transparent" : "var(--bg-4)",
                  borderRadius: "0 12px 12px 12px",
                  border: msg.user === "System" ? "none" : "1px solid var(--border)",
                }}>{msg.text}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} style={{
            padding: "16px", borderTop: "1px solid var(--border)",
            display: "flex", gap: 10,
          }}>
            <input 
              type="text" 
              placeholder="Type your question..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{
                flex: 1, background: "var(--bg-4)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "10px 14px", color: "var(--text)",
                fontSize: 13, outline: "none",
              }}
            />
            <button type="submit" style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
              border: "none", color: "white", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(124,92,252,0.3)",
            }}>
              <SendIcon />
            </button>
          </form>
        </div>

      </div>

      <style>{`
        .live-ring {
            animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
        @keyframes pulse-ring {
            0% { transform: scale(.9); opacity: 0.8; }
            50% { transform: scale(1); opacity: 1; }
            100% { transform: scale(.9); opacity: 0.8; }
        }
      `}</style>
    </MainLayout>
  );
}
