import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import API from "../../utils/api";

const CARD = {
  background: "var(--bg-3)", border: "1px solid var(--border)",
  borderRadius: 18, padding: "22px 24px", marginBottom: 16,
};
const TITLE = {
  fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 18,
  color: "var(--text)", marginBottom: 14,
};
const BADGE = (color) => ({
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700,
  background: `${color}18`, border: `1px solid ${color}40`, color,
});
const STAT_BOX = {
  padding: "14px 16px", borderRadius: 14,
  background: "var(--bg-4)", border: "1px solid var(--border)",
  textAlign: "center",
};

export default function P2PDashboard() {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [gossipResult, setGossipResult] = useState(null);
  const [dhtResult, setDhtResult] = useState(null);
  const [searchSkill, setSearchSkill] = useState("");
  const [gossipMsg, setGossipMsg] = useState("");

  // ── Initialize P2P Network ──
  async function initNetwork() {
    setLoading(true);
    try {
      await API.post("/p2p/initialize");
      const res = await API.get("/p2p/dashboard");
      setDashboard(res.data);
      setInitialized(true);
    } catch (err) {
      console.error("Init failed", err);
    } finally {
      setLoading(false);
    }
  }

  // ── Gossip Simulation ──
  async function runGossip() {
    setLoading(true);
    try {
      const res = await API.post("/p2p/gossip", { message: gossipMsg || "New post published!" });
      setGossipResult(res.data);
    } catch (err) {
      console.error("Gossip failed", err);
    } finally {
      setLoading(false);
    }
  }

  // ── DHT Search ──
  async function runDHTSearch() {
    if (!searchSkill.trim()) return;
    setLoading(true);
    try {
      const res = await API.get(`/p2p/dht/search/${encodeURIComponent(searchSkill.trim())}`);
      setDhtResult(res.data);
    } catch (err) {
      console.error("DHT search failed", err);
    } finally {
      setLoading(false);
    }
  }

  // ── Refresh dashboard ──
  async function refreshDashboard() {
    try {
      const res = await API.get("/p2p/dashboard");
      setDashboard(res.data);
    } catch {}
  }

  useEffect(() => {
    refreshDashboard();
    
    // Poll every 2 seconds if the backend is still booting up the network
    const interval = setInterval(() => {
      refreshDashboard();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <MainLayout>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 0" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 26, color: "var(--text)" }}>
              P2P Algorithm Dashboard
            </h1>
            <span style={BADGE("#7C5CFC")}>Live</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>
            Interactive demonstration of Gossip Protocol, DHT Chord Lookup, and Peer Network algorithms running on Shivalik Connect.
          </p>
        </div>

        {/* Initialize Button */}
        {!initialized && !dashboard?.gossip?.totalPeers && (
          <div style={{ ...CARD, textAlign: "center", padding: "40px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌐</div>
            <h2 style={{ ...TITLE, marginBottom: 8 }}>Initialize P2P Network</h2>
            <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 20, maxWidth: 400, margin: "0 auto 20px" }}>
              This will load all students and alumni from the database into the P2P peer network, build the DHT ring, and establish gossip connections.
            </p>
            <button onClick={initNetwork} disabled={loading} style={{
              padding: "13px 32px", borderRadius: 12, border: "none",
              background: loading ? "var(--bg-4)" : "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
              color: loading ? "var(--text-3)" : "white", fontSize: 15, fontWeight: 700,
              fontFamily: "Plus Jakarta Sans", cursor: loading ? "wait" : "pointer",
              boxShadow: loading ? "none" : "0 6px 24px rgba(124,92,252,0.4)",
            }}>
              {loading ? "⏳ Initializing..." : "🚀 Initialize Network"}
            </button>
          </div>
        )}

        {/* Stats Overview */}
        {(initialized || dashboard?.gossip?.totalPeers > 0) && (
          <>
            {/* Network Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={STAT_BOX}>
                <p style={{ fontSize: 28, fontWeight: 800, color: "var(--purple-light)", fontFamily: "Plus Jakarta Sans" }}>
                  {dashboard?.gossip?.totalPeers || 0}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>Total Peers</p>
              </div>
              <div style={STAT_BOX}>
                <p style={{ fontSize: 28, fontWeight: 800, color: "var(--teal)", fontFamily: "Plus Jakarta Sans" }}>
                  {dashboard?.gossip?.totalConnections || 0}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>P2P Connections</p>
              </div>
              <div style={STAT_BOX}>
                <p style={{ fontSize: 28, fontWeight: 800, color: "var(--orange)", fontFamily: "Plus Jakarta Sans" }}>
                  {dashboard?.dht?.totalKeysStored || 0}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>DHT Keys</p>
              </div>
            </div>

            {/* ═══ SECTION 1: GOSSIP PROTOCOL ═══ */}
            <div style={CARD}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>📢</span>
                <h2 style={TITLE}>Gossip Protocol — Epidemic Dissemination</h2>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 16 }}>
                Simulate a post being gossiped across the peer network. Each peer forwards to {dashboard?.gossip?.fanout || 3} random neighbours. The message spreads in O(log N) rounds.
              </p>

              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <input
                  value={gossipMsg}
                  onChange={e => setGossipMsg(e.target.value)}
                  placeholder="Enter a message to gossip..."
                  style={{
                    flex: 1, padding: "11px 14px", borderRadius: 12,
                    background: "var(--bg-4)", border: "1px solid var(--border)",
                    color: "var(--text)", fontSize: 14, fontFamily: "DM Sans", outline: "none",
                  }}
                />
                <button onClick={runGossip} disabled={loading} style={{
                  padding: "11px 20px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
                  color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "Plus Jakarta Sans", whiteSpace: "nowrap",
                }}>
                  {loading ? "..." : "🔊 Gossip!"}
                </button>
              </div>

              {gossipResult && (
                <div style={{ background: "var(--bg-4)", borderRadius: 14, border: "1px solid var(--border)", padding: 16 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                    <span style={BADGE("#00E5C3")}>✓ {gossipResult.coveragePercent}% Coverage</span>
                    <span style={BADGE("#9B7EFF")}>{gossipResult.totalRounds} Rounds</span>
                    <span style={BADGE("#FF7043")}>{gossipResult.totalReached}/{gossipResult.totalPeers} Peers Reached</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>
                    <strong>Algorithm:</strong> {gossipResult.algorithm}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 12 }}>
                    <strong>Complexity:</strong> {gossipResult.complexity}
                  </p>

                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Propagation Trace:</p>
                  <div style={{ maxHeight: 200, overflowY: "auto", display: "grid", gap: 4 }}>
                    {gossipResult.trace?.slice(0, 20).map((hop, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "6px 10px", borderRadius: 8,
                        background: "var(--bg-3)", fontSize: 12, color: "var(--text-2)",
                      }}>
                        <span style={{ ...BADGE("#7C5CFC"), padding: "2px 8px", fontSize: 10 }}>R{hop.round}</span>
                        <span style={{ fontWeight: 700, color: "var(--text)" }}>{hop.fromName}</span>
                        <span style={{ color: "var(--teal)" }}>→</span>
                        <span style={{ fontWeight: 700, color: "var(--teal)" }}>{hop.toName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ═══ SECTION 2: DHT CHORD LOOKUP ═══ */}
            <div style={CARD}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>🔍</span>
                <h2 style={TITLE}>DHT — Chord Ring Lookup</h2>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 16 }}>
                Search for alumni by skill using the Distributed Hash Table. The key is hashed to a position on the ring, then routed in O(log N) hops to the responsible node.
              </p>

              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <input
                  value={searchSkill}
                  onChange={e => setSearchSkill(e.target.value)}
                  placeholder="Enter a skill (e.g., React, Python, Firebase)..."
                  onKeyDown={e => e.key === "Enter" && runDHTSearch()}
                  style={{
                    flex: 1, padding: "11px 14px", borderRadius: 12,
                    background: "var(--bg-4)", border: "1px solid var(--border)",
                    color: "var(--text)", fontSize: 14, fontFamily: "DM Sans", outline: "none",
                  }}
                />
                <button onClick={runDHTSearch} disabled={loading || !searchSkill.trim()} style={{
                  padding: "11px 20px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, #FF7043, #FF9800)",
                  color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "Plus Jakarta Sans", whiteSpace: "nowrap",
                }}>
                  {loading ? "..." : "🔎 DHT Search"}
                </button>
              </div>

              {dhtResult && (
                <div style={{ background: "var(--bg-4)", borderRadius: 14, border: "1px solid var(--border)", padding: 16 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                    <span style={BADGE(dhtResult.found ? "#00E5C3" : "#FF4B6E")}>
                      {dhtResult.found ? "✓ Found" : "✗ Not Found"}
                    </span>
                    <span style={BADGE("#9B7EFF")}>{dhtResult.totalHops} Hops</span>
                    <span style={BADGE("#FF7043")}>Key Hash: {dhtResult.keyHash}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>
                    <strong>Algorithm:</strong> {dhtResult.algorithm}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 12 }}>
                    <strong>Complexity:</strong> {dhtResult.complexity}
                  </p>

                  {dhtResult.hops?.length > 0 && (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Routing Trace:</p>
                      <div style={{ display: "grid", gap: 4, marginBottom: 14 }}>
                        {dhtResult.hops.map((hop, i) => (
                          <div key={i} style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "6px 10px", borderRadius: 8,
                            background: hop.action.includes("FOUND") ? "rgba(0,229,195,0.08)" : "var(--bg-3)",
                            border: hop.action.includes("FOUND") ? "1px solid rgba(0,229,195,0.2)" : "none",
                            fontSize: 12, color: "var(--text-2)",
                          }}>
                            <span style={{ ...BADGE("#FF7043"), padding: "2px 8px", fontSize: 10 }}>Hop {hop.hop}</span>
                            <span style={{ fontWeight: 700, color: "var(--text)" }}>{hop.nodeName}</span>
                            <span style={{ color: "var(--text-3)", fontSize: 11 }}>pos:{hop.position}</span>
                            <span style={{ color: "var(--text-3)", fontSize: 11, marginLeft: "auto" }}>{hop.action}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {dhtResult.matchingAlumni?.length > 0 && (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
                        Matching Alumni ({dhtResult.matchingAlumni.length}):
                      </p>
                      <div style={{ display: "grid", gap: 6 }}>
                        {dhtResult.matchingAlumni.map((a, i) => (
                          <div key={i} style={{
                            padding: "10px 12px", borderRadius: 10,
                            background: "var(--bg-3)", border: "1px solid var(--border)",
                            display: "flex", justifyContent: "space-between",
                          }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{a.name}</span>
                            <span style={{ fontSize: 12, color: "var(--text-3)" }}>{a.company || a.skill}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ═══ SECTION 3: DHT RING VISUALIZATION ═══ */}
            {dashboard?.dhtRing?.length > 0 && (
              <div style={CARD}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 22 }}>💍</span>
                  <h2 style={TITLE}>DHT Hash Ring</h2>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 16 }}>
                  Each peer is hashed to a position on a ring of size {dashboard?.dht?.ringSize || 256}. Peers are responsible for keys nearest to their position.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {dashboard.dhtRing.map((node, i) => (
                    <div key={i} style={{
                      padding: "10px 14px", borderRadius: 12,
                      background: "var(--bg-4)", border: "1px solid var(--border)",
                      minWidth: 130,
                    }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{node.name}</p>
                      <p style={{ fontSize: 11, color: "var(--purple-light)" }}>Position: {node.position}</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)" }}>Keys: {node.keysStored} · Fingers: {node.fingerTableSize}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ SECTION 4: NETWORK PEER LIST ═══ */}
            <div style={CARD}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>🌐</span>
                <h2 style={TITLE}>Peer Network Graph</h2>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 12 }}>
                Avg degree: {dashboard?.network?.avgDegree || 0} connections per peer. Used for BFS pathfinding and bridge node detection.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {(dashboard?.network?.peerList || []).slice(0, 12).map((p, i) => (
                  <div key={i} style={{
                    padding: "10px 12px", borderRadius: 10,
                    background: "var(--bg-4)", border: "1px solid var(--border)",
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{p.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-3)" }}>{p.neighbours} neighbours</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
