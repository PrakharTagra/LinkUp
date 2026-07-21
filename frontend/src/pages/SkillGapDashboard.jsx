import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import Loader from "../components/common/Loader";
import {
  analyzeSkillGapForDomains,
  getSkillGapDomains,
  getSkillGapMyProfile,
} from "../services/skillGapService";

function Pill({ active, children, onClick, muted = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: `1px solid ${active ? "rgba(124,92,252,0.45)" : "var(--border)"}`,
        background: active ? "rgba(124,92,252,0.16)" : muted ? "var(--bg-3)" : "var(--bg-2)",
        color: active ? "var(--purple-light)" : "var(--text-2)",
        borderRadius: 999,
        padding: "7px 12px",
        fontSize: 12,
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {children}
    </button>
  );
}

function StatCard({ title, value, sub }) {
  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "14px 16px",
      }}
    >
      <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 5 }}>{title}</div>
      <div style={{ fontSize: 26, fontFamily: "Plus Jakarta Sans", fontWeight: 800, color: "var(--text)" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function ResourceList({ title, items, type }) {
  if (!items?.length) {
    return null;
  }

  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: 14,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item) => (
          <div
            key={`${type}-${item.id || item.title}`}
            style={{
              background: "var(--bg-3)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "10px 12px",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{item.title}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
              {item.skill ? `${item.skill} gap` : "Skill aligned"}
              {item.price ? ` - Rs ${item.price}` : ""}
              {item.level ? ` - ${item.level}` : ""}
              {item.type ? ` - ${item.type}` : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SkillGapDashboard() {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [domains, setDomains] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      setLoading(true);
      setError("");

      try {
        const [profileData, domainsData] = await Promise.all([
          getSkillGapMyProfile(),
          getSkillGapDomains(),
        ]);

        if (!mounted) {
          return;
        }

        setProfile(profileData);
        setDomains(domainsData);

        const defaultDomains = domainsData.slice(0, 2).map((d) => d.domain);
        setSelectedDomains(defaultDomains);

        if (defaultDomains.length) {
          setAnalyzing(true);
          const analysis = await analyzeSkillGapForDomains(defaultDomains);
          if (mounted) {
            setResult(analysis);
          }
          setAnalyzing(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || err.message || "Could not load skill gap dashboard");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleDomain = (domain) => {
    setSelectedDomains((prev) => {
      if (prev.includes(domain)) {
        return prev.filter((d) => d !== domain);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), domain];
      }
      return [...prev, domain];
    });
  };

  const runAnalysis = async () => {
    if (!selectedDomains.length) {
      setError("Choose at least one domain to run analysis");
      return;
    }

    setAnalyzing(true);
    setError("");
    try {
      const analysis = await analyzeSkillGapForDomains(selectedDomains);
      setResult(analysis);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Skill gap analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const topGapSkills = useMemo(() => result?.summary?.top_gap_skills || [], [result]);

  return (
    <MainLayout>
      <div style={{ padding: "24px 0 30px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 24, color: "var(--text)", marginBottom: 5 }}>
            Skill Gap Analyzer
          </h1>
          <p style={{ color: "var(--text-3)", fontSize: 14 }}>
            Compare your profile against market postings and get domain-specific skill gaps, alumni matches, and resources.
          </p>
        </div>

        {loading ? <Loader text="Loading student profile and domain intelligence..." /> : null}

        {!loading && error ? (
          <div
            style={{
              marginBottom: 16,
              background: "rgba(255,90,110,0.08)",
              border: "1px solid rgba(255,90,110,0.3)",
              color: "#ff8ca1",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        ) : null}

        {!loading && profile ? (
          <div
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              display: "grid",
              gridTemplateColumns: "1.3fr 1fr",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Student Profile</div>
              <div style={{ fontFamily: "Plus Jakarta Sans", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>{profile.name}</div>
              <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 4 }}>
                {profile.branch || "Branch not set"} - Year {profile.year || 1}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {(profile.skills || []).length ? (
                  profile.skills.map((skill) => (
                    <Pill key={skill} muted>
                      {skill}
                    </Pill>
                  ))
                ) : (
                  <span style={{ color: "var(--text-3)", fontSize: 12 }}>Add skills in profile to improve recommendations</span>
                )}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>Choose up to 3 target domains</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {domains.map((d) => (
                  <Pill key={d.domain} active={selectedDomains.includes(d.domain)} onClick={() => toggleDomain(d.domain)}>
                    {d.domain} ({d.postings_count})
                  </Pill>
                ))}
              </div>
              <button
                type="button"
                onClick={runAnalysis}
                disabled={analyzing}
                style={{
                  marginTop: 12,
                  width: "100%",
                  border: "none",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
                  color: "white",
                  padding: "10px 14px",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: analyzing ? "not-allowed" : "pointer",
                  opacity: analyzing ? 0.7 : 1,
                }}
              >
                {analyzing ? "Analyzing domains..." : "Analyze Skill Gap"}
              </button>
            </div>
          </div>
        ) : null}

        {!loading && analyzing ? <Loader text="Running domain-wise skill analysis..." /> : null}

        {!loading && !analyzing && result ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>
              <StatCard title="Readiness Score" value={`${result.summary?.readiness_score || 0}%`} sub="Across selected domains" />
              <StatCard title="Matched Skills" value={result.summary?.matched_skills_count || 0} sub="Already in your profile" />
              <StatCard title="Required Skills" value={result.summary?.required_skills_count || 0} sub="From market trend data" />
              <StatCard title="Top Role Match" value={result.summary?.recommended_role || "-"} sub={`${result.summary?.best_role_match_score || 0}% fit`} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Domain-wise gap breakdown</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(result.domain_insights || []).map((insight) => (
                    <div
                      key={insight.domain}
                      style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 13 }}>{insight.domain}</div>
                        <div style={{ color: "var(--text-3)", fontSize: 11 }}>
                          {insight.matched_skills.length} matched - {insight.gap_skills.length} gaps
                        </div>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {insight.gap_skills.slice(0, 8).map((skill) => (
                          <Pill key={`${insight.domain}-${skill}`} muted>
                            {skill}
                          </Pill>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Gap summary</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {topGapSkills.length ? (
                    topGapSkills.map((skill) => (
                      <Pill key={skill} muted>
                        {skill}
                      </Pill>
                    ))
                  ) : (
                    <span style={{ color: "var(--text-3)", fontSize: 12 }}>No gaps found for selected domains</span>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: 14,
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Alumni working in selected domains</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                {(result.recommended_alumni || []).length ? (
                  result.recommended_alumni.map((a) => (
                    <div key={a.id} style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
                      <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 13 }}>{a.name}</div>
                      <div style={{ color: "var(--text-3)", fontSize: 11, marginTop: 2 }}>{a.company || "Alumni"}</div>
                      <div style={{ color: "var(--purple-light)", fontSize: 11, marginTop: 6 }}>{a.domain || "Domain not set"}</div>
                      <div style={{ color: "var(--text-3)", fontSize: 11, marginTop: 4 }}>Match score: {a.match_score || 0}</div>
                    </div>
                  ))
                ) : (
                  <span style={{ color: "var(--text-3)", fontSize: 12 }}>No domain-matched alumni found yet</span>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: 18 }}>
              <ResourceList title="Recommended Courses" type="course" items={result.recommended_resources?.courses || []} />
              <ResourceList title="Recommended Sessions" type="session" items={result.recommended_resources?.sessions || []} />
              <ResourceList title="Recommended Workshops" type="workshop" items={result.recommended_resources?.workshops || []} />
            </div>
          </>
        ) : null}
      </div>
    </MainLayout>
  );
}
