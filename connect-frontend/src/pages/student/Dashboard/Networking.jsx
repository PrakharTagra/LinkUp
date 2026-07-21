import React, { useState, useEffect } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import AlumniCard from "../../../components/networking/AlumniCard";
import Loader from "../../../components/common/Loader";
import { useAuth } from "../../../context/AuthContext";
import { getAlumni } from "../../../services/userService";

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function Networking() {
  const { user } = useAuth();
  const [search,  setSearch]  = useState("");
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasSearch = search.trim().length > 0;

  useEffect(() => {
    const fetchAlumni = async () => {
      setLoading(true);
      try {
        const data = await getAlumni(hasSearch ? { name: search.trim() } : {});
        setAlumniList(data.alumni || []);
      } catch (err) {
        console.error("Networking fetch error", err);
        setAlumniList([]);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchAlumni, 250);

    return () => clearTimeout(timer);
  }, [hasSearch, search]);

  const normalize = (value = "") =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const splitKeywords = (value = "") =>
    normalize(value)
      .split(" ")
      .filter(word => word.length > 2);

  const interestKeywords = Array.isArray(user?.interests)
    ? user.interests.flatMap(item => splitKeywords(item))
    : splitKeywords(user?.interests || "");

  const skillKeywords = Array.isArray(user?.skills)
    ? user.skills.flatMap(item => splitKeywords(item))
    : splitKeywords(user?.skills || "");

  const activityKeywords = splitKeywords(
    `${user?.currentActivity || ""} ${user?.role || ""} ${user?.targetRole || ""}`
  );

  const studentKeywords = Array.from(new Set([
    ...interestKeywords,
    ...skillKeywords,
    ...activityKeywords,
  ]));

  const scoreAlumni = (alumni) => {
    if (!studentKeywords.length) return 0;
    const alumniText = normalize(`${alumni.role} ${alumni.college} ${alumni.company} ${alumni.name}`);
    return studentKeywords.reduce((score, keyword) => {
      if (alumniText.includes(keyword)) return score + 1;
      return score;
    }, 0);
  };

  const suggestedAlumni = [...alumniList].sort((a, b) => scoreAlumni(b) - scoreAlumni(a));

  return (
    <MainLayout>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 0" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 24, color: "var(--text)", marginBottom: 4 }}>
            Discover Alumni
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>
            Connect with verified alumni from top colleges and companies
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}>
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search by name, company, or role…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px 12px 38px",
              background: "var(--bg-3)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--text)", fontSize: 14,
              outline: "none", fontFamily: "DM Sans",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={e => { e.target.style.borderColor = "var(--purple)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,92,252,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {!hasSearch && (
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 4 }}>
              Suggestions
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-3)" }}>
              Recommended alumni based on your interests and current activity
            </p>
          </div>
        )}

        {hasSearch && (
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 4 }}>
              Search Results
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-3)" }}>
              Matching alumni for "{search.trim()}"
            </p>
          </div>
        )}

        {/* Alumni list */}
        {loading ? (
          <Loader text={hasSearch ? "Searching alumni..." : "Loading alumni..."} />
        ) : hasSearch && alumniList.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            background: "var(--bg-3)", border: "1px solid var(--border)",
            borderRadius: 18,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>
              No alumni found
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-3)" }}>
              Try a different name, company, or role keyword
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(hasSearch ? alumniList : suggestedAlumni).map((alumni, i) => (
              <div key={alumni._id || alumni.id} style={{ animation: "fadeUp 0.35s ease both", animationDelay: `${i * 50}ms` }}>
                <AlumniCard alumni={alumni} />
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}