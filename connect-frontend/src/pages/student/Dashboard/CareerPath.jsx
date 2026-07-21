import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { predictCareerPaths } from "../../../services/careerService";
import { useAuth } from "../../../context/AuthContext";

const scoreColor = (score) => {
  const n = parseFloat(score);
  if (n >= 70) return "#00D4A3";
  if (n >= 55) return "#4F8CFF";
  return "#8893A8";
};

export default function CareerPath() {
  const { user } = useAuth();
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    if (!user || loading) return;
    const profileSkills = Array.isArray(user.skills) ? user.skills : [];
    const profileInterests = typeof user.headline === "string" ? user.headline.trim() : "";

    setSkills(profileSkills.join(", "));
    setInterests(profileInterests);

    if (profileSkills.length > 0) {
      runAutoAnalysis(profileSkills.join(", "), profileInterests);
    } else {
      setError("No profile skills found. Add skills in your profile to auto-map career paths.");
    }
  }, [user]);

  async function runAutoAnalysis(skillText, interestText) {
    setLoading(true);
    setError("");

    try {
      const data = await predictCareerPaths({
        skills: skillText,
        interests: interestText,
        domain: "All Domains",
        topN: 4,
      });

      setResults(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setError("Could not reach the ML API. Make sure uvicorn is running on port 8000.");
    } finally {
      setLoading(false);
    }
  }

  const predictions = useMemo(() => results?.predictions || [], [results]);

  const averageMatch = useMemo(() => {
    if (!predictions.length) return 0;
    const total = predictions.reduce((sum, item) => sum + parseFloat(item.match_score || "0"), 0);
    return Math.round(total / predictions.length);
  }, [predictions]);

  const totalMissingSkills = useMemo(() => {
    const missing = new Set();
    predictions.forEach((p) => (p.missing_skills || []).forEach((s) => missing.add(s)));
    return missing.size;
  }, [predictions]);

  const topSkillSet = useMemo(() => {
    const matched = new Set();
    predictions.forEach((p) => (p.matched_skills || []).forEach((s) => matched.add(s)));
    return Array.from(matched).slice(0, 8);
  }, [predictions]);

  const canRefresh = skills.trim().length > 0;

  return (
    <MainLayout>
      <div style={pageShell}>
        <section style={heroStyle}>
          <div style={{ position: "relative", zIndex: 2 }}>
            <p style={heroTag}>AUTOMATED SKILL MAPPER</p>
            <h1 style={heroTitle}>Career Map from your profile skills</h1>
            <p style={heroSubtitle}>
              Skills are fetched automatically, analyzed against your dataset, and mapped to the top 4 career options with stage-by-stage roadmaps.
            </p>
            <div style={heroActions}>
              <button
                disabled={!canRefresh || loading}
                style={primaryButton(!canRefresh || loading)}
                onClick={() => runAutoAnalysis(skills, interests)}
              >
                {loading ? "Running analysis..." : "Refresh mapping"}
              </button>
              <span style={lastUpdatedStyle}>
                {lastUpdated ? `Updated: ${lastUpdated}` : "Waiting for first analysis"}
              </span>
            </div>
          </div>
          <div style={heroGlow} />
        </section>

        <section style={controlsPanel}>
          <div>
            <p style={fieldLabel}>Skills from profile</p>
            <textarea
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              rows={3}
              style={inputBox}
              placeholder="Add skills in profile or edit here"
            />
          </div>
          <div>
            <p style={fieldLabel}>Interests (optional)</p>
            <textarea
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              rows={3}
              style={inputBox}
              placeholder="Optional interests to improve ranking"
            />
          </div>
        </section>

        {error && <div style={errorBanner}>{error}</div>}

        <section style={kpiGrid}>
          <StatCard title="Mapped careers" value={String(predictions.length)} helper="Auto-selected top options" />
          <StatCard title="Average fit" value={`${averageMatch}%`} helper="Across mapped careers" />
          <StatCard title="Skill gaps" value={String(totalMissingSkills)} helper="Unique missing skills" />
          <StatCard title="Strongest skills" value={String(topSkillSet.length)} helper="Matched in recommendations" />
        </section>

        <section style={{ marginTop: 18 }}>
          {loading && <div style={loadingBanner}>Mapping careers from your skills...</div>}
          {!loading && predictions.length === 0 && !error && (
            <div style={emptyState}>No mapped careers yet. Add profile skills and click Refresh mapping.</div>
          )}

          <div style={careerGrid}>
            {predictions.map((prediction, index) => (
              <article key={`${prediction.career_path}-${index}`} style={careerCard(index)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10 }}>
                  <div>
                    <p style={rankTag}>Rank #{index + 1}</p>
                    <h3 style={careerTitle}>{prediction.career_path}</h3>
                    <p style={careerMeta}>{prediction.domain} | {prediction.experience_level}</p>
                  </div>
                  <span style={scorePill(prediction.match_score)}>{prediction.match_score}</span>
                </div>

                <div style={{ marginTop: 14 }}>
                  <RoadmapLineChart
                    roadmap={prediction.roadmap || []}
                    currentStageIndex={prediction.current_stage_index}
                  />
                  <p style={currentPointLabel}>Current stage: {prediction.current_stage_label}</p>
                </div>

                <div style={{ marginTop: 10 }}>
                  <p style={skillGroupLabel}>Skills you already have</p>
                  <div style={chipWrap}>
                    {(prediction.matched_skills || []).slice(0, 6).map((skill) => (
                      <span key={`${prediction.career_path}-${skill}`} style={matchedChip}>{skill}</span>
                    ))}
                    {(prediction.matched_skills || []).length === 0 && <span style={mutedSmall}>No direct skill matches yet</span>}
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <p style={skillGroupLabel}>Skills to build next</p>
                  <div style={chipWrap}>
                    {(prediction.missing_skills || []).slice(0, 6).map((skill) => (
                      <span key={`missing-${prediction.career_path}-${skill}`} style={missingChip}>+ {skill}</span>
                    ))}
                    {(prediction.missing_skills || []).length === 0 && <span style={mutedSmall}>Great coverage for this role</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

function RoadmapLineChart({ roadmap = [], currentStageIndex = 0 }) {
  if (!Array.isArray(roadmap) || roadmap.length === 0) return null;

  const width = 520;
  const height = 180;
  const padX = 26;
  const padY = 20;
  const xStep = roadmap.length > 1 ? (width - padX * 2) / (roadmap.length - 1) : 0;

  const toPoint = (item, idx) => {
    const x = padX + idx * xStep;
    const y = padY + ((100 - Number(item.readiness || 0)) / 100) * (height - padY * 2);
    return { x, y };
  };

  const points = roadmap.map(toPoint);
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const currentPoint = points[Math.max(0, Math.min(currentStageIndex, points.length - 1))];

  return (
    <div style={{ width: "100%", overflowX: "auto", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, background: "rgba(6,12,22,0.55)" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", minWidth: 320, height: 180 }}>
        <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1={padX} y1={padY} x2={padX} y2={height - padY} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <polyline
          points={polyline}
          fill="none"
          stroke="#41D1FF"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r={idx === currentStageIndex ? 5.5 : 3.5} fill={idx === currentStageIndex ? "#00D4A3" : "#4F8CFF"} />
            <text x={p.x} y={height - 7} textAnchor="middle" fill="rgba(255,255,255,0.64)" style={{ fontSize: 9 }}>
              {roadmap[idx]?.stage}
            </text>
          </g>
        ))}

        {currentPoint && (
          <>
            <line x1={currentPoint.x} y1={padY} x2={currentPoint.x} y2={height - padY} stroke="#00D4A3" strokeDasharray="4 3" />
            <text x={currentPoint.x + 8} y={padY + 10} fill="#00D4A3" style={{ fontSize: 10, fontWeight: 700 }}>
              Current
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

function StatCard({ title, value, helper }) {
  return (
    <div style={statCard}>
      <p style={statTitle}>{title}</p>
      <p style={statValue}>{value}</p>
      <p style={statHelper}>{helper}</p>
    </div>
  );
}

const heroStyle = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 18,
  border: "1px solid rgba(65,209,255,0.28)",
  background: "radial-gradient(circle at 78% 16%, rgba(65,209,255,0.22), transparent 36%), linear-gradient(135deg, #0a1220 0%, #0f1f2e 52%, #102b22 100%)",
  padding: "26px 24px",
};

const heroGlow = {
  position: "absolute",
  right: -120,
  top: -120,
  width: 280,
  height: 280,
  borderRadius: "50%",
  filter: "blur(26px)",
  background: "rgba(0,212,163,0.18)",
};

const heroTag = {
  margin: 0,
  color: "#87d8ff",
  fontWeight: 700,
  letterSpacing: 1,
  fontSize: 11,
};

const heroTitle = {
  margin: "8px 0 8px",
  color: "#F6FBFF",
  fontSize: 30,
  lineHeight: 1.1,
  fontFamily: "Plus Jakarta Sans",
  maxWidth: 740,
};

const heroSubtitle = {
  margin: 0,
  color: "rgba(246,251,255,0.78)",
  maxWidth: 760,
  fontSize: 14,
  lineHeight: 1.5,
};

const heroActions = {
  marginTop: 18,
  display: "flex",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap",
};

const lastUpdatedStyle = {
  fontSize: 12,
  color: "rgba(246,251,255,0.7)",
};

const primaryButton = (disabled) => ({
  border: "none",
  borderRadius: 10,
  padding: "11px 16px",
  fontSize: 14,
  fontWeight: 700,
  cursor: disabled ? "not-allowed" : "pointer",
  background: disabled ? "rgba(255,255,255,0.15)" : "linear-gradient(135deg, #41D1FF 0%, #00D4A3 100%)",
  color: disabled ? "rgba(255,255,255,0.64)" : "#06202a",
  boxShadow: disabled ? "none" : "0 10px 24px rgba(65,209,255,0.26)",
  transition: "all .18s ease",
});

const controlsPanel = {
  marginTop: 16,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 12,
};

const fieldLabel = {
  margin: "0 0 6px",
  color: "var(--text-3)",
  fontSize: 12,
  fontWeight: 600,
};

const inputBox = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--bg-2)",
  color: "var(--text)",
  padding: "10px 12px",
  fontSize: 13,
  resize: "vertical",
  outline: "none",
};

const errorBanner = {
  marginTop: 14,
  background: "rgba(235,87,87,0.12)",
  border: "1px solid rgba(235,87,87,0.34)",
  color: "#FF9D9D",
  borderRadius: 12,
  padding: "10px 12px",
  fontSize: 13,
};

const loadingBanner = {
  borderRadius: 12,
  padding: "10px 12px",
  fontSize: 13,
  border: "1px solid rgba(65,209,255,0.25)",
  background: "rgba(65,209,255,0.12)",
  color: "#93e4ff",
};

const emptyState = {
  borderRadius: 12,
  padding: "10px 12px",
  fontSize: 13,
  border: "1px solid var(--border)",
  background: "var(--bg-2)",
  color: "var(--text-3)",
};

const kpiGrid = {
  marginTop: 16,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
};

const pageShell = {
  width: "100%",
  maxWidth: 1400,
  margin: "0 auto",
  padding: "24px clamp(12px, 2vw, 24px) 40px",
};

const statCard = {
  background: "var(--bg-2)",
  borderRadius: 14,
  border: "1px solid var(--border)",
  padding: "12px 12px 11px",
};

const statTitle = {
  margin: 0,
  fontSize: 11,
  color: "var(--text-3)",
  letterSpacing: 0.4,
  textTransform: "uppercase",
};

const statValue = {
  margin: "8px 0 2px",
  fontSize: 26,
  color: "var(--text)",
  fontFamily: "Plus Jakarta Sans",
  fontWeight: 800,
};

const statHelper = {
  margin: 0,
  fontSize: 12,
  color: "var(--text-3)",
};

const careerGrid = {
  marginTop: 12,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
  gap: 12,
};

const careerCard = (index) => ({
  background: "linear-gradient(180deg, rgba(13,18,31,0.98) 0%, rgba(12,23,37,0.98) 100%)",
  borderRadius: 16,
  border: index === 0 ? "1px solid rgba(0,212,163,0.52)" : "1px solid rgba(65,209,255,0.26)",
  padding: 14,
  boxShadow: index === 0 ? "0 10px 30px rgba(0,212,163,0.16)" : "0 8px 24px rgba(0,0,0,0.22)",
});

const rankTag = {
  margin: 0,
  fontSize: 11,
  color: "#87d8ff",
  fontWeight: 700,
};

const careerTitle = {
  margin: "4px 0 4px",
  color: "#F4FBFF",
  fontFamily: "Plus Jakarta Sans",
  fontSize: 18,
  lineHeight: 1.2,
};

const careerMeta = {
  margin: 0,
  color: "rgba(244,251,255,0.72)",
  fontSize: 12,
};

const scorePill = (score) => ({
  fontSize: 13,
  fontWeight: 800,
  borderRadius: 999,
  padding: "4px 9px",
  color: scoreColor(score),
  background: `color-mix(in srgb, ${scoreColor(score)} 20%, transparent)`,
  border: `1px solid color-mix(in srgb, ${scoreColor(score)} 50%, transparent)`,
});

const currentPointLabel = {
  margin: "8px 0 0",
  color: "#8DEFD4",
  fontSize: 12,
  fontWeight: 700,
};

const skillGroupLabel = {
  margin: "0 0 6px",
  fontSize: 12,
  color: "rgba(244,251,255,0.74)",
};

const chipWrap = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
};

const matchedChip = {
  fontSize: 11,
  padding: "4px 8px",
  borderRadius: 999,
  color: "#00D4A3",
  border: "1px solid rgba(0,212,163,0.44)",
  background: "rgba(0,212,163,0.13)",
};

const missingChip = {
  fontSize: 11,
  padding: "4px 8px",
  borderRadius: 999,
  color: "#FFCE7A",
  border: "1px solid rgba(255,206,122,0.42)",
  background: "rgba(255,206,122,0.12)",
};

const mutedSmall = {
  color: "rgba(255,255,255,0.52)",
  fontSize: 11,
};