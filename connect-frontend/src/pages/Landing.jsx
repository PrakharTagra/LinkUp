import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CrownIcon from "../components/common/CrownIcon";
import {
  motion,
  useInView,
  AnimatePresence,
} from "framer-motion";

const connectLogo = "/connect-logo.png";

/* ─────────────────────────────────────────────
   SVG ICONS (replacing emojis)
───────────────────────────────────────────── */
const IconMentorship = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconGuarantee = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconCollege = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconVerified = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IconProfile = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconConnect = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const IconRocket = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);
const IconSeedling = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/>
    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/>
    <path d="M14.1 6a7 7 0 0 1 1.5 4.7c-1.7.1-3.1-.3-4.3-1.2"/>
  </svg>
);
const IconDiamond = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z"/>
    <path d="M7.5 10.5 12 15l4.5-4.5"/><path d="M12 3v7"/>
  </svg>
);
const IconLightning = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);
const IconBriefcase = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);
const IconTrendUp = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);
const IconAward = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);
const IconMapPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconCheck = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ─────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 0.68, 0, 1.1] } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 0.68, 0, 1.1] } },
};
const staggerContainer = (delay = 0.08) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay } },
});

function Reveal({ children, variants = fadeUp, delay = 0, style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} variants={variants} initial="hidden" animate={inView ? "show" : "hidden"} transition={{ delay }} style={style}>
      {children}
    </motion.div>
  );
}

function Counter({ to, prefix = "", suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / 70;
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 14);
    return () => clearInterval(timer);
  }, [inView, to]);
  return <span ref={ref}>{prefix}{val.toLocaleString("en-IN")}{suffix}</span>;
}

function MagneticBtn({ children, onClick, className, style }) {
  return (
    <button
      onClick={onClick}
      className={className}
      style={{ ...style }}
    >{children}</button>
  );
}

function GridBackground() {
  const particles = React.useMemo(() => (
    [...Array(10)].map((_, i) => ({
      left: `${5 + (i * 41) % 90}%`, top: `${8 + (i * 57) % 88}%`,
      size: i % 3 === 0 ? 3 : 2,
      color: i % 3 === 0 ? "rgba(124,92,252,0.75)" : i % 3 === 1 ? "rgba(0,229,195,0.65)" : "rgba(255,112,67,0.6)",
      duration: `${4 + (i % 5)}s`, delay: `${((i * 0.38) % 5).toFixed(2)}s`,
    }))
  ), []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden", willChange: "transform" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.032 }}>
        <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.8"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div style={{ position: "absolute", top: "-15%", left: "15%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,92,252,0.3) 0%, transparent 70%)", filter: "blur(50px)", transform: "translate3d(0,0,0)", animation: "glowPulse1 8s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: "25%", right: "-8%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,112,67,0.22) 0%, transparent 70%)", filter: "blur(55px)", transform: "translate3d(0,0,0)", animation: "glowPulse2 12s ease-in-out infinite 3s" }} />
      <div style={{ position: "absolute", bottom: "5%", left: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,229,195,0.2) 0%, transparent 70%)", filter: "blur(45px)", transform: "translate3d(0,0,0)", animation: "glowPulse1 10s ease-in-out infinite 6s" }} />
      {particles.map((p, i) => (
        <div key={i} style={{ position: "absolute", left: p.left, top: p.top, width: p.size, height: p.size, borderRadius: "50%", background: p.color, transform: "translate3d(0,0,0)", animation: `floatParticle ${p.duration} ease-in-out infinite ${p.delay}` }} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(124,92,252,0.4), rgba(0,229,195,0.4), transparent)", animation: "scanLine 16s linear infinite 2s", transform: "translate3d(0,0,0)" }} />
    </div>
  );
}

function OrbitRing({ radius, duration, color, dotSize = 8, reverse = false, badgeIcon }) {
  return (
    <div style={{ position: "absolute", width: radius * 2, height: radius * 2, borderRadius: "50%", border: `1px solid ${color}22`, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
      <motion.div
        style={{ width: "100%", height: "100%", position: "relative" }}
        animate={{ rotate: reverse ? -360 : 360 }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        <motion.div style={{ position: "absolute", top: "0%", left: "50%", transform: "translate(-50%, -50%)", width: dotSize, height: dotSize, borderRadius: "50%", background: color, boxShadow: `0 0 12px ${color}, 0 0 24px ${color}60` }} />
        {badgeIcon && (
          <motion.div
            style={{ position: "absolute", top: "50%", right: "-2%", transform: "translate(0, -50%)", width: 38, height: 38, borderRadius: 10, background: "var(--bg-3)", border: `1px solid ${color}50`, display: "flex", alignItems: "center", justifyContent: "center", color }}
            animate={{ rotate: reverse ? 360 : -360 }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
          >{badgeIcon}</motion.div>
        )}
      </motion.div>
    </div>
  );
}

function Typewriter({ words, speed = 75 }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wordIdx];
    let t;
    if (!deleting && charIdx < word.length)        t = setTimeout(() => setCharIdx(c => c + 1), speed);
    else if (!deleting && charIdx === word.length) t = setTimeout(() => setDeleting(true), 1800);
    else if (deleting && charIdx > 0)              t = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    else { setDeleting(false); setWordIdx(i => (i + 1) % words.length); }
    return () => clearTimeout(t);
  }, [charIdx, deleting, wordIdx, words, speed]);
  return (
    <span style={{ color: "var(--purple-light)" }}>
      {words[wordIdx].slice(0, charIdx)}
      <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} style={{ borderRight: "3px solid var(--purple-light)", marginLeft: 2 }} />
    </span>
  );
}

function GlowCard({ children, accent = "var(--purple)", style = {}, onClick }) {
  const [hov, setHov] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  return (
    <motion.div
      ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onMouseMove={(e) => { const r = ref.current.getBoundingClientRect(); setPos({ x: e.clientX - r.left, y: e.clientY - r.top }); }}
      onClick={onClick}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      style={{ position: "relative", overflow: "hidden", background: "var(--bg-3)", border: `1px solid ${hov ? accent + "45" : "var(--border)"}`, borderRadius: 18, cursor: onClick ? "pointer" : "default", transition: "border-color 0.3s", ...style }}
    >
      {hov && (<div style={{ position: "absolute", pointerEvents: "none", zIndex: 0, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${accent}14 0%, transparent 70%)`, transform: `translate(${pos.x - 150}px, ${pos.y - 150}px)` }} />)}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </motion.div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <motion.button onClick={() => setOpen(!open)} whileHover={{ x: 4 }} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 4px", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 16 }}>
        <span style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 600, fontSize: 15, color: open ? "var(--text)" : "var(--text-2)", flex: 1, transition: "color 0.2s" }}>{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.25 }} style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: open ? "rgba(124,92,252,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${open ? "rgba(124,92,252,0.35)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: open ? "var(--purple-light)" : "var(--text-3)", fontSize: 18, transition: "all 0.2s" }}>+</motion.span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }} style={{ overflow: "hidden" }}>
            <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.8, paddingBottom: 18, paddingRight: 40 }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LANDING PAGE
───────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("student");
  if (user) {
    if (user.role === "alumni") return <Navigate to="/alumni/dashboard/feed" />;
    if (user.role === "admin")  return <Navigate to="/admin" />;
    return <Navigate to="/feed" />;
  }

  const features = [
    { Icon: IconMentorship, title: "Smart Mentorship",    desc: "Get matched with alumni based on your career goals, college, and interests.", accent: "var(--purple)" },
    { Icon: IconGuarantee,  title: "Membership Messaging", desc: "Subscribe to alumni memberships for faster responses and priority visibility in conversations.", accent: "var(--orange)" },
    { Icon: IconCollege,    title: "College Tie-ups",     desc: "Sessions hosted at real college infra. Partner college students get exclusive discounts.", accent: "var(--purple)" },
    { Icon: IconDiamond,    title: "Alumni Membership",   desc: "Enable memberships so students get fast replies and exclusive discounts on your offerings.", accent: "var(--orange)" },
    { Icon: IconVerified,   title: "Verified Profiles",   desc: "Every alumni is verified before going live. Connect with confidence, not uncertainty.", accent: "var(--teal)" },
    { Icon: IconAward,      title: "Career Roadmaps",     desc: "Get structured milestones from alumni so you know exactly what to build, learn, and apply for next.", accent: "var(--purple)" },
  ];

  const studentBenefits = [
    { section: "Home Feed", items: ["Personalised feed from connected alumni", "Posts based on interests & career goals"] },
    { section: "Academics", items: ["Join mentorship sessions & workshops", "Enroll in alumni-led paid courses", "Offline sessions at partner colleges"] },
    { section: "Networking", items: ["Search verified alumni by college/company", "Send connection requests & direct messages"] },
  ];

  const alumniSimple  = ["Post in the community feed", "Connect and reply to students", "Build your profile & reputation"];
  const alumniMembership = ["Enable membership in one click", "Students get fast-track replies", "Offer exclusive discounts to subscribers", "Build recurring earnings through subscriptions", "Pause or stop anytime", "Track everything in a subscriber dashboard"];
  const colleges = ["IIT Delhi", "DTU", "BITS Pilani", "NIT Trichy", "NSUT", "VIT Vellore", "SRM Chennai", "IIIT Hyd"];

  return (
    <div style={{ position: "relative", background: "var(--bg)", color: "var(--text)", minHeight: "100vh", overflowX: "hidden" }}>
      <GridBackground />

      {/* ──────────────── NAVBAR ──────────────── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 0.68, 0, 1.1] }}
        style={{ position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: 64, background: "rgba(8,9,14,0.78)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <motion.div style={{ display: "flex", alignItems: "center", gap: 10 }} whileHover={{ scale: 1.03 }}>
          <img
            src={connectLogo}
            alt="Connect"
            style={{ height: 40, width: "auto", objectFit: "contain", mixBlendMode: "screen" }}
          />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 23, letterSpacing: "-0.03em", color: "#FFFFFF" }}>Connect</span>
            <span style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 9, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)", marginTop: 1, textTransform: "uppercase", whiteSpace: "nowrap", paddingLeft: 1 }}>LEARN·MENTOR·SUCCEED</span>
          </div>
        </motion.div>
        <motion.div style={{ display: "flex", gap: 12 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <MagneticBtn className="btn-ghost" style={{ padding: "8px 20px", fontSize: 14 }} onClick={() => navigate("/login")}>Log in</MagneticBtn>
          <MagneticBtn className="btn-purple" style={{ padding: "8px 20px", fontSize: 14 }} onClick={() => navigate("/signup")}>Get Started →</MagneticBtn>
        </motion.div>
      </motion.nav>

      {/* ──────────────── HERO ──────────────── */}
      <motion.section style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "80px 24px 64px" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 0.68, 0, 1.2] }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 100, background: "rgba(124,92,252,0.12)", border: "1px solid rgba(124,92,252,0.3)", marginBottom: 28, color: "var(--purple-light)", fontSize: 13, fontWeight: 600 }}
        >
          <motion.span animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="live-dot" />
          India's #1 Student–Alumni Bridge
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.35, ease: [0.22, 0.68, 0, 1.05] }}
          style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: "clamp(40px, 7.5vw, 80px)", lineHeight: 1.06, marginBottom: 12, letterSpacing: "-0.03em" }}
        >
          Bridge the Gap Between<br />
          <span className="grad-text">You &</span>{" "}
          <Typewriter words={["Your Future.", "Your Mentor.", "Your Career.", "Your Network."]} />
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.55 }} style={{ fontSize: 17, color: "var(--text-2)", maxWidth: 520, margin: "0 auto 38px", lineHeight: 1.75 }}>
          Connect with verified alumni, get mentorship, join live sessions, and unlock your career — all in one platform.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
          <MagneticBtn className="btn-purple" style={{ fontSize: 15, padding: "14px 32px" }} onClick={() => navigate("/signup", { state: { role: "student" } })}>Start as Student</MagneticBtn>
          <MagneticBtn className="btn-outline-purple" style={{ fontSize: 15, padding: "13px 32px" }} onClick={() => navigate("/signup", { state: { role: "alumni" } })}>Join as Alumni</MagneticBtn>
        </motion.div>

        {/* ORBIT VISUAL */}
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, delay: 0.9, ease: [0.22, 0.68, 0, 1.1] }} style={{ position: "relative", width: 360, height: 360, margin: "0 auto 68px" }}>
          {/* Center hub — actual logo */}
          <motion.div
            animate={{ boxShadow: ["0 0 40px rgba(0,180,255,0.3)", "0 0 90px rgba(0,180,255,0.6)", "0 0 40px rgba(0,180,255,0.3)"] }}
            transition={{ duration: 3.5, repeat: Infinity }}
            style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 84, height: 84, borderRadius: 22, background: "rgba(8,9,14,0.9)", border: "1px solid rgba(79,200,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5, overflow: "hidden" }}
          >
            <img src={connectLogo} alt="Connect" style={{ width: 70, height: 70, objectFit: "contain", mixBlendMode: "screen" }} />
          </motion.div>

          <OrbitRing radius={95}  duration={9}  color="rgba(124,92,252,1)" dotSize={10} badgeIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>} />
          <OrbitRing radius={148} duration={15} color="rgba(0,229,195,1)"  dotSize={8}  badgeIcon={<IconDiamond />} reverse />
          <OrbitRing radius={172} duration={24} color="rgba(255,112,67,0.7)" dotSize={6} badgeIcon={<IconVerified />} />

          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} style={{ position: "absolute", top: "4%", right: "-20%", padding: "8px 14px", borderRadius: 12, background: "rgba(14,15,24,0.92)", backdropFilter: "blur(10px)", border: "1px solid rgba(0,229,195,0.3)", zIndex: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--teal)" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--teal)" }}>3,500+ Alumni</span>
          </motion.div>

          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} style={{ position: "absolute", bottom: "4%", left: "-22%", padding: "8px 14px", borderRadius: 12, background: "rgba(14,15,24,0.92)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,112,67,0.3)", zIndex: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <IconLightning />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--orange)" }}>Membership Perks</span>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={staggerContainer(0.1)} initial="hidden" animate="show" transition={{ delay: 1.1 }} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, maxWidth: 900, margin: "0 auto", background: "var(--border)", borderRadius: 18, overflow: "hidden", border: "1px solid var(--border)" }}>
          {[
            { to: 12000, suffix: "+", label: "Students" },
            { to: 3500,  suffix: "+", label: "Verified Alumni" },
            { to: 240,   suffix: "+", label: "College Partners" },
            { to: 2400000, prefix: "₹", suffix: "+", label: "Alumni Earnings" },
          ].map((s, i) => (
            <motion.div key={i} variants={fadeUp} style={{ padding: "22px 12px", textAlign: "center", background: "var(--bg-2)" }} whileHover={{ background: "var(--bg-3)", transition: { duration: 0.15 } }}>
              <div style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 26, color: "var(--text)" }}><Counter to={s.to} prefix={s.prefix || ""} suffix={s.suffix} /></div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <div style={{ height: 1, background: "var(--border)", margin: "0 48px", position: "relative", zIndex: 1 }} />

      {/* ──────────────── FEATURES ──────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "72px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "var(--purple-light)", textTransform: "uppercase", marginBottom: 12 }}>Everything You Need</div>
          <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)" }}>
            Built for Students.<br /><span className="grad-text">Powered by Alumni.</span>
          </h2>
        </Reveal>
        <motion.div variants={staggerContainer(0.07)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {features.map((f, i) => (
            <motion.div key={i} variants={fadeUp}>
              <GlowCard accent={f.accent} style={{ padding: 26, height: "100%" }}>
                <motion.div whileHover={{ scale: 1.15, rotate: 6 }} transition={{ type: "spring", stiffness: 300 }} style={{ width: 50, height: 50, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: `${f.accent}15`, border: `1px solid ${f.accent}25`, marginBottom: 16, color: f.accent }}>
                  <f.Icon />
                </motion.div>
                <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.75 }}>{f.desc}</p>
              </GlowCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <div style={{ height: 1, background: "var(--border)", margin: "0 48px", position: "relative", zIndex: 1 }} />

      {/* ──────────────── ALUMNI SPOTLIGHT ──────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "72px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "var(--orange)", textTransform: "uppercase", marginBottom: 12 }}>Alumni Spotlight</div>
          <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: "clamp(26px,4vw,42px)" }}>
            Meet Some of Our <span className="grad-text">Top Mentors</span>
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-2)", marginTop: 12, maxWidth: 500, margin: "12px auto 0" }}>Real people, real companies, real impact. These alumni are actively mentoring students like you.</p>
        </Reveal>
        <motion.div variants={staggerContainer(0.08)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
          {[
            { name: "Aditya Kumar",  company: "Google",    role: "SDE-3",          batch: "IIT Delhi '19",     avatar: "AK", sessions: 142, rating: 4.9, tags: ["DSA", "System Design", "FAANG Prep"], color: "var(--purple)" },
            { name: "Shreya Joshi",  company: "Microsoft", role: "Product Manager", batch: "BITS Pilani '20",   avatar: "SJ", sessions: 98,  rating: 5.0, tags: ["PM Interview", "Product Thinking"],  color: "var(--teal)" },
            { name: "Vikram Nair",   company: "Amazon",    role: "SDE-2",          batch: "NIT Trichy '21",    avatar: "VN", sessions: 76,  rating: 4.8, tags: ["Backend", "AWS", "Leadership"],       color: "var(--orange)" },
            { name: "Ishita Singh",  company: "Flipkart",  role: "Data Scientist",  batch: "DTU '20",           avatar: "IS", sessions: 115, rating: 4.9, tags: ["ML/AI", "Python", "Data Analytics"],  color: "var(--purple)" },
            { name: "Rahul Verma",   company: "NVIDIA",    role: "ML Engineer",     batch: "IIIT Hyd '19",      avatar: "RV", sessions: 84,  rating: 4.9, tags: ["Deep Learning", "MLOps", "Interview Prep"], color: "var(--teal)" },
            { name: "Neha Bansal",   company: "Uber",      role: "Backend Engineer", batch: "NSUT '18",         avatar: "NB", sessions: 131, rating: 5.0, tags: ["Backend", "Distributed Systems", "Career Growth"], color: "var(--orange)" },
          ].map((alumni, i) => (
            <motion.div key={i} variants={fadeUp}>
              <GlowCard accent={alumni.color} style={{ padding: 24, height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${alumni.color}, ${alumni.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "white", flexShrink: 0 }}>{alumni.avatar}</motion.div>
                  <div>
                    <div style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{alumni.name}</div>
                    <div style={{ fontSize: 12, color: alumni.color, fontWeight: 600 }}>{alumni.role} @ {alumni.company}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{alumni.batch}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                  {alumni.tags.map((tag, ti) => (
                    <span key={ti} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: `${alumni.color}15`, border: `1px solid ${alumni.color}30`, color: alumni.color }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ color: "#F5C842", fontSize: 13 }}>★</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{alumni.rating}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-3)", fontSize: 12 }}>
                    <IconUsers />
                    <span>{alumni.sessions} sessions</span>
                  </div>
                  <motion.button onClick={() => navigate("/signup")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 8, background: `${alumni.color}20`, border: `1px solid ${alumni.color}40`, color: alumni.color, cursor: "pointer" }}>Connect →</motion.button>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </motion.div>
        <Reveal style={{ textAlign: "center", marginTop: 32 }}>
          <motion.button onClick={() => navigate("/signup")} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-ghost" style={{ fontSize: 14, padding: "11px 28px" }}>
            View All 3,500+ Alumni →
          </motion.button>
        </Reveal>
      </section>

      {/* ──────────────── ALUMNI MEMBERSHIP SECTION ──────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "72px 48px", background: "var(--bg-2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#F5C842", textTransform: "uppercase", marginBottom: 12 }}>New Feature</div>
            <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 14 }}>
              Alumni <span style={{ background: "linear-gradient(135deg,#F5C842,#FF7043)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Memberships</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 560, margin: "0 auto", lineHeight: 1.75 }}>
              Students subscribe to their favourite alumni to unlock exclusive perks, while alumni build stronger relationships and recurring engagement.
            </p>
          </Reveal>

          {/* How it works — 2 columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40 }}>
            {/* For Students */}
            <Reveal delay={0.05}>
              <GlowCard accent="#00E5C3" style={{ padding: 32, height: "100%" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 13px", borderRadius: 100, background: "rgba(0,229,195,0.1)", border: "1px solid rgba(0,229,195,0.25)", marginBottom: 20 }}>
                  <IconProfile />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#00E5C3" }}>For Students</span>
                </div>
                <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Subscribe to Any Alumni</h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 22 }}>
                  Subscribe to lock in fast replies and exclusive discounts from the alumni you learn from most.
                </p>
                {[
                  { icon: "⚡", label: "Fast-track replies", desc: "Jump the queue — your messages get priority attention", color: "#F5C842" },
                  { icon: "🏷️", label: "Exclusive discounts", desc: "Get subscriber-only discounts on courses, sessions, and workshops", color: "#00E5C3" },
                  { icon: "⭐", label: "Subscriber badge", desc: "Show off your commitment with a visible subscriber badge", color: "var(--purple-light)" },
                ].map((perk, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(0,229,195,0.1)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{perk.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{perk.label}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>{perk.desc}</div>
                    </div>
                  </motion.div>
                ))}
                <div style={{ marginTop: 22, padding: "14px 16px", background: "rgba(0,229,195,0.06)", border: "1px solid rgba(0,229,195,0.2)", borderRadius: 12 }}>
                  <span style={{ fontSize: 13, color: "var(--text-2)" }}>Membership gives you better response speed, better visibility, and better learning continuity.</span>
                </div>
              </GlowCard>
            </Reveal>

            {/* For Alumni */}
            <Reveal delay={0.1}>
              <GlowCard accent="var(--orange)" style={{ padding: 32, height: "100%" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 13px", borderRadius: 100, background: "rgba(255,112,67,0.1)", border: "1px solid rgba(255,112,67,0.25)", marginBottom: 20 }}>
                  <IconDiamond />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--orange)" }}>For Alumni</span>
                </div>
                <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Earn Monthly Income</h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 22 }}>
                  Activate your membership in one click. Students subscribe, and you build consistent recurring engagement.
                </p>
                {[
                  { icon: "💰", label: "Recurring subscriber earnings", desc: "Turn your expertise into steady monthly income from your subscriber base", color: "var(--orange)" },
                  { icon: "📊", label: "Full dashboard", desc: "Track subscribers, revenue, and renewal dates in real time", color: "var(--orange)" },
                  { icon: "⏸️", label: "Pause anytime", desc: "No lock-in — start or stop your membership whenever you want", color: "var(--orange)" },
                ].map((perk, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,112,67,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{perk.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{perk.label}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>{perk.desc}</div>
                    </div>
                  </motion.div>
                ))}
                <div style={{ marginTop: 22, padding: "14px 16px", background: "rgba(255,112,67,0.06)", border: "1px solid rgba(255,112,67,0.2)", borderRadius: 12 }}>
                  <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>As your subscriber base grows, your monthly earning potential grows with it.</div>
                </div>
              </GlowCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ──────────────── TABS ──────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "72px 48px", background: "var(--bg-2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: "clamp(26px, 4vw, 42px)", marginBottom: 24 }}>Choose Your Path</h2>
            <div style={{ display: "inline-flex", padding: 4, borderRadius: 14, background: "var(--bg-3)", border: "1px solid var(--border)", gap: 4 }}>
              {["student", "alumni"].map(t => (
                <motion.button key={t} onClick={() => setActiveTab(t)} whileTap={{ scale: 0.96 }} style={{ padding: "10px 28px", borderRadius: 11, border: "none", fontFamily: "Plus Jakarta Sans", fontWeight: 600, fontSize: 14, cursor: "pointer", background: activeTab === t ? t === "student" ? "linear-gradient(135deg,#7C5CFC,#9B7EFF)" : "linear-gradient(135deg,#FF7043,#FF9A6C)" : "transparent", color: activeTab === t ? "white" : "var(--text-3)", boxShadow: activeTab === t ? `0 4px 18px ${t === "student" ? "rgba(124,92,252,0.4)" : "rgba(255,112,67,0.4)"}` : "none", transition: "all 0.25s" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    {t === "student" ? <IconProfile /> : <IconDiamond />}
                    {t === "student" ? "Student" : "Alumni"}
                  </span>
                </motion.button>
              ))}
            </div>
          </Reveal>

          <AnimatePresence mode="wait">
            {activeTab === "student" && (
              <motion.div key="student" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.35 }} className="glass-card" style={{ padding: 36 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 36, alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <span className="badge-membership" style={{ marginBottom: 14, display: "inline-flex", alignItems: "center", gap: 5 }}><IconLightning /> Free to join</span>
                    <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 24, marginBottom: 10 }}>Everything a student needs</h3>
                    <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>From personalised alumni feeds to membership-driven perks — Connect gives students an unfair advantage.</p>
                    <MagneticBtn className="btn-purple" style={{ fontSize: 14 }} onClick={() => navigate("/signup", { state: { role: "student" } })}>Sign up as Student →</MagneticBtn>
                  </div>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    {studentBenefits.map((group, gi) => (
                      <div key={gi} style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 8 }}>{group.section}</div>
                        {group.items.map((item, ii) => (
                          <motion.div key={ii} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ii * 0.07 + gi * 0.12 }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13, color: "var(--text-2)" }}>
                            <span style={{ color: "var(--teal)", flexShrink: 0 }}><IconCheck color="var(--teal)" /></span>
                            {item}
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ marginTop: 24, padding: "14px 18px", borderRadius: 13, background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.2)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span className="badge-membership" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><IconLightning /> Membership Benefits</span>
                  <span style={{ fontSize: 13, color: "var(--text-2)" }}>Subscribe to alumni memberships for faster responses and subscriber-only discounts on their offerings.</span>
                </motion.div>
              </motion.div>
            )}
            {activeTab === "alumni" && (
              <motion.div key="alumni" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <GlowCard accent="var(--teal)" style={{ padding: 28 }}>
                  <div style={{ marginBottom: 12, color: "var(--teal)" }}><IconSeedling /></div>
                  <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Simple</h3>
                  <p style={{ color: "var(--teal)", fontWeight: 600, fontSize: 13, marginBottom: 16 }}>Free Forever</p>
                  {alumniSimple.map((b, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < alumniSimple.length - 1 ? "1px solid var(--border)" : "none", fontSize: 13, color: "var(--text-2)" }}>
                      <span style={{ color: "var(--teal)", flexShrink: 0 }}><IconCheck color="var(--teal)" /></span>{b}
                    </motion.div>
                  ))}
                  <motion.button className="btn-ghost" style={{ width: "100%", marginTop: 16 }} onClick={() => navigate("/signup", { state: { role: "alumni", plan: "simple" } })} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>Join for Free</motion.button>
                </GlowCard>
                <div style={{ position: "relative" }}>
                  <div className="plan-card-glow" style={{ height: "100%", borderRadius: 18 }}>
                    <GlowCard accent="var(--orange)" style={{ padding: 28, height: "100%", background: "linear-gradient(160deg, rgba(15,17,28,0.96) 0%, rgba(22,20,26,0.98) 54%, rgba(31,22,18,0.98) 100%)", border: "1px solid rgba(255,154,108,0.26)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 22px 38px rgba(0,0,0,0.35)" }}>
                      <div style={{ position: "absolute", top: 18, right: 18 }}>
                        <motion.span animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ display: "inline-flex", alignItems: "center" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#F5C842"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </motion.span>
                      </div>
                      <div style={{ marginBottom: 12, color: "var(--orange)" }}><IconDiamond /></div>
                      <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Membership</h3>
                      <p style={{ color: "var(--orange)", fontWeight: 600, fontSize: 13, marginBottom: 2 }}>Recurring subscriber benefits</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 16 }}>Prioritized conversations, stronger trust, and long-term growth</p>
                      {alumniMembership.map((b, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < alumniMembership.length - 1 ? "1px solid var(--border)" : "none", fontSize: 13 }}>
                          <span style={{ color: "var(--orange)", flexShrink: 0 }}><IconCheck color="var(--orange)" /></span>
                          <span style={{ color: "var(--text-2)" }}>{b}</span>
                        </motion.div>
                      ))}
                      <motion.button className="btn-orange" style={{ width: "100%", marginTop: 16 }} onClick={() => navigate("/signup", { state: { role: "alumni" } })} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>Start Membership →</motion.button>
                    </GlowCard>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ──────────────── COLLEGE TIE-UPS ──────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "72px 48px", maxWidth: 1060, margin: "0 auto" }}>
        <Reveal>
          <div style={{ borderRadius: 22, overflow: "hidden", position: "relative", background: "linear-gradient(135deg,#0F1018 0%,#14151F 50%,#0F1018 100%)", border: "1px solid var(--border)" }}>
            <motion.div animate={{ x: ["-100%","100%"] }} transition={{ duration: 6, repeat: Infinity, ease: "linear", repeatDelay: 3 }} style={{ height: 3, width: "100%", background: "linear-gradient(90deg,transparent,var(--purple),var(--orange),var(--teal),transparent)" }} />
            <div style={{ padding: "40px 44px", display: "flex", gap: 44, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ flex: 2, minWidth: 280 }}>
                <span className="badge-college" style={{ marginBottom: 14, display: "inline-flex", alignItems: "center", gap: 6 }}><IconCollege /> College Partnerships</span>
                <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: "clamp(22px,3.5vw,32px)", marginBottom: 14, lineHeight: 1.2 }}>
                  Your Campus,<br /><span className="grad-text">Our Platform</span>
                </h2>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75, marginBottom: 24 }}>
                  We tie up with colleges to use their infrastructure — lecture halls, labs, auditoriums — for alumni-led workshops and sessions. Partner college students get exclusive discounts.
                </p>
                <motion.div variants={staggerContainer(0.05)} initial="hidden" whileInView="show" viewport={{ once: true }} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {colleges.map((c, i) => (
                    <motion.span key={i} variants={scaleIn} whileHover={{ scale: 1.08, borderColor: "rgba(124,92,252,0.5)" }} style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 100, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-2)", transition: "border-color 0.2s" }}>{c}</motion.span>
                  ))}
                  <motion.span variants={scaleIn} style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 100, background: "rgba(124,92,252,0.15)", border: "1px solid rgba(124,92,252,0.3)", color: "var(--purple-light)" }}>+230 more</motion.span>
                </motion.div>
              </div>
              <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { num: "240+", label: "Partner Colleges", color: "var(--purple-light)" },
                  { num: "Exclusive",  label: "Student discounts", color: "var(--teal)" },
                  { num: "₹500+", label: "Extra alumni pay / session", color: "var(--orange)" },
                ].map((s, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.05, y: -2 }} style={{ padding: "16px 18px", borderRadius: 14, background: "var(--bg-4)", border: "1px solid var(--border)", textAlign: "center" }}>
                    <div style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 26, color: s.color }}>{s.num}</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ──────────────── HOW IT WORKS ──────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "72px 48px", background: "var(--bg-2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "var(--teal)", textTransform: "uppercase", marginBottom: 12 }}>Simple Process</div>
            <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: "clamp(26px,4vw,42px)" }}>
              Get Started in <span className="grad-text-teal">3 Steps</span>
            </h2>
          </Reveal>
          <motion.div variants={staggerContainer(0.14)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {[
              { step: "01", Icon: IconProfile,  title: "Create Your Profile",  desc: "Sign up as a student or alumni. Verify your details and set your goals, skills, and interests in minutes.", color: "var(--purple)" },
              { step: "02", Icon: IconConnect,  title: "Connect & Discover",   desc: "Browse verified alumni by college, company, or domain. Send connection requests and start real conversations.", color: "var(--teal)" },
              { step: "03", Icon: IconRocket,   title: "Grow Together",        desc: "Join sessions, enroll in courses, get mentorship — alumni earn revenue while helping students succeed.", color: "var(--orange)" },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlowCard accent={s.color} style={{ padding: "30px 28px", position: "relative", overflow: "hidden", height: "100%" }}>
                  <div style={{ position: "absolute", top: -10, right: 14, fontFamily: "Plus Jakarta Sans", fontWeight: 900, fontSize: 90, color: "rgba(255,255,255,0.025)", lineHeight: 1, userSelect: "none" }}>{s.step}</div>
                  <motion.div whileHover={{ scale: 1.15, rotate: -6 }} transition={{ type: "spring", stiffness: 300 }} style={{ width: 50, height: 50, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: `${s.color}18`, border: `1px solid ${s.color}30`, marginBottom: 16, color: s.color }}><s.Icon /></motion.div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.color, letterSpacing: "0.08em", marginBottom: 8 }}>STEP {s.step}</div>
                  <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.75 }}>{s.desc}</p>
                </GlowCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ──────────────── TESTIMONIALS ──────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "72px 48px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "var(--purple-light)", textTransform: "uppercase", marginBottom: 12 }}>Real Stories</div>
            <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: "clamp(26px,4vw,42px)" }}>
              What Our <span className="grad-text">Community Says</span>
            </h2>
          </Reveal>
          <motion.div variants={staggerContainer(0.07)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 18 }}>
            {[
              { name: "Arjun Mehta",   role: "Student · IIT Delhi",            avatar: "A",  quote: "Got my first referral at Google within 3 weeks. My mentor was super responsive and the guidance was incredibly practical.", accent: "var(--purple)" },
              { name: "Priya Nair",    role: "Alumni · Meta · Ex-BITS Pilani", avatar: "P",  quote: "Earning ₹18,000/month from weekend sessions. Connect makes it super easy to host and manage everything.", accent: "var(--orange)" },
              { name: "Rohan Gupta",   role: "Student · DTU",                  avatar: "R",  quote: "The networking feature helped me land 4 internship calls in a month. Alumni here are genuinely willing to help.", accent: "var(--teal)" },
              { name: "Ananya Sharma", role: "Alumni · Amazon · Ex-VIT",       avatar: "An", quote: "I've mentored 60+ students this year. The platform keeps me motivated and payouts are instant and reliable.", accent: "var(--purple)" },
              { name: "Dev Khanna",    role: "Student · NSUT",                 avatar: "D",  quote: "Enrolled in a System Design course by an IIT alumnus. Best ₹999 I ever spent — landed a backend role at Zepto!", accent: "var(--orange)" },
              { name: "Meera Pillai",  role: "Alumni · Flipkart · Ex-NIT",     avatar: "M",  quote: "College partnership sessions are brilliant. Hosted a workshop at BITS Pilani — packed room, extra pay, great vibe!", accent: "var(--teal)" },
            ].map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlowCard accent={t.accent} style={{ padding: "22px 24px", height: "100%" }}>
                  <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                    {[1,2,3,4,5].map(s => (
                      <motion.span key={s} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: s * 0.06 + i * 0.04, type: "spring" }} style={{ color: "#F5C842", fontSize: 13 }}>★</motion.span>
                    ))}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.82, marginBottom: 18, fontStyle: "italic" }}>"{t.quote}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <motion.div whileHover={{ scale: 1.12, rotate: 6 }} style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg,${t.accent},${t.accent}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white" }}>{t.avatar}</motion.div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{t.name}</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)" }}>{t.role}</p>
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <div style={{ height: 1, background: "var(--border)", margin: "0 48px", position: "relative", zIndex: 1 }} />

      {/* ──────────────── FAQ ──────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "72px 48px", background: "var(--bg-2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "var(--orange)", textTransform: "uppercase", marginBottom: 12 }}>Got Questions?</div>
            <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: "clamp(26px,4vw,42px)" }}>
              Frequently Asked <span className="grad-text">Questions</span>
            </h2>
          </Reveal>
          {[
            { q: "Is Connect free for students?",                        a: "Yes! Students can join, browse alumni, view the feed, and message connected alumni completely free. Paid features include premium mentorship sessions and courses." },
            { q: "How are alumni verified?",                             a: "Every alumni goes through a manual verification process — we check their LinkedIn, educational credentials, and professional background before they go live on the platform." },
            { q: "How do student memberships work?",                     a: "Students can subscribe to individual alumni memberships. This unlocks faster responses and a flat discount on that alumni's courses, sessions, and workshops." },
            { q: "What is Alumni Membership and how does it work?",          a: "Any alumni can activate a membership. Students subscribe to unlock fast-track replies and exclusive discounts on that alumni's courses, sessions, and workshops." },
            { q: "How does alumni earning work?",                              a: "Alumni earn through paid sessions, courses, workshops, and memberships, while building long-term recurring relationships with students." },
            { q: "Can I use Connect if my college isn't listed?",        a: "Absolutely! Any student or alumni can join regardless of college. College partnerships simply unlock additional benefits like offline sessions and exclusive discounts." },
            { q: "Can I subscribe to multiple alumni?",                       a: "Yes! You can subscribe to as many alumni as you like. Each subscription gives you faster responses and subscriber-only discounts from that specific alumni. You can manage all subscriptions from the Membership Alumni page in your dashboard." },
          ].map((faq, i) => (
            <Reveal key={i} delay={i * 0.05}><FaqItem q={faq.q} a={faq.a} /></Reveal>
          ))}
        </div>
      </section>

      {/* ──────────────── CAREER OUTCOMES ──────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "72px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "var(--teal)", textTransform: "uppercase", marginBottom: 12 }}>Proven Impact</div>
          <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: "clamp(26px,4vw,42px)" }}>
            Real Careers, <span className="grad-text-teal">Real Results</span>
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-2)", marginTop: 12, maxWidth: 520, margin: "12px auto 0" }}>Students on Connect are landing internships, full-time offers, and mentorship — faster than ever.</p>
        </Reveal>

        {/* Big outcome numbers */}
        <motion.div variants={staggerContainer(0.1)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}>
          {[
            { Icon: IconBriefcase, stat: "8,400+",  label: "Internship Referrals",   sub: "from alumni to students",      color: "var(--purple)" },
            { Icon: IconTrendUp,   stat: "₹18L avg", label: "First Package",          sub: "for mentored students",        color: "var(--teal)" },
            { Icon: IconAward,     stat: "94%",       label: "Session Satisfaction",   sub: "rated 4.5★ or above",         color: "var(--orange)" },
            { Icon: IconRocket,    stat: "3 weeks",   label: "Avg. Time to First Lead", sub: "after joining Connect",      color: "var(--purple)" },
          ].map((item, i) => (
            <motion.div key={i} variants={fadeUp}>
              <GlowCard accent={item.color} style={{ padding: "28px 24px", textAlign: "center", height: "100%" }}>
                <motion.div whileHover={{ scale: 1.18, rotate: 6 }} transition={{ type: "spring", stiffness: 300 }} style={{ width: 48, height: 48, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", background: `${item.color}15`, border: `1px solid ${item.color}25`, marginBottom: 14, color: item.color, margin: "0 auto 14px" }}>
                  <item.Icon />
                </motion.div>
                <div style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 28, color: item.color, marginBottom: 6 }}>{item.stat}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{item.sub}</div>
              </GlowCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Company logos strip */}
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Our students now work at</span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {["Google", "Microsoft", "Amazon", "Flipkart", "Zepto", "Razorpay", "PhonePe", "Swiggy", "Meesho", "CRED", "Groww", "Zomato"].map((co, i) => (
              <motion.div key={i} whileHover={{ scale: 1.08, borderColor: "rgba(124,92,252,0.4)", color: "var(--text)" }} style={{ fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 10, background: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text-2)", cursor: "default", transition: "all 0.2s" }}>{co}</motion.div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ──────────────── FINAL CTA ──────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "90px 48px 110px", textAlign: "center", overflow: "hidden" }}>
        <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.12, 0.32, 0.12] }} transition={{ duration: 5.5, repeat: Infinity }} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,92,252,0.32) 0%,transparent 70%)", pointerEvents: "none" }} />
        <Reveal>
          <motion.h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: "clamp(34px,5.5vw,60px)", marginBottom: 16, position: "relative" }}>
            Ready to <span className="grad-text">Connect?</span>
          </motion.h2>
          <p style={{ fontSize: 17, color: "var(--text-2)", maxWidth: 480, margin: "0 auto 44px", lineHeight: 1.78, position: "relative" }}>
            Join thousands of students and alumni already building real careers together.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
            <MagneticBtn className="btn-purple" style={{ fontSize: 16, padding: "15px 38px" }} onClick={() => navigate("/signup")}>Join Free Today →</MagneticBtn>
            <MagneticBtn className="btn-ghost" style={{ fontSize: 16, padding: "14px 38px" }} onClick={() => navigate("/login")}>Already have an account</MagneticBtn>
          </div>
        </Reveal>
      </section>

      {/* ──────────────── FOOTER ──────────────── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, position: "relative", zIndex: 1, background: "rgba(8,9,14,0.6)", backdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={connectLogo} alt="Connect" style={{ height: 34, width: "auto", objectFit: "contain", mixBlendMode: "screen" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em", color: "#FFFFFF", lineHeight: 1.1 }}>Connect</span>
            <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>LEARN · MENTOR · SUCCEED</span>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-3)" }}>© {new Date().getFullYear()} Connect. Bridging students & alumni across India.</p>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Contact"].map(l => (
            <motion.span key={l} whileHover={{ color: "var(--text)", y: -1 }} style={{ fontSize: 13, color: "var(--text-3)", cursor: "pointer" }}>{l}</motion.span>
          ))}
        </div>
      </footer>
    </div>
  );
}