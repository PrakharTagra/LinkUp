import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import Loader from "../../../components/common/Loader";
import API from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";

export default function AlumniMembershipPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [activating, setActivating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [earnings, setEarnings] = useState({});
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const isActive = Boolean(user?.alumniMembershipActive);

  const fetchMembershipData = async () => {
    setLoading(true);
    setError("");
    try {
      const [conversationRes, earningsRes] = await Promise.all([
        API.get("/messages/conversations"),
        API.get("/earnings/stats"),
      ]);

      setConversations(conversationRes.data.conversations || []);
      setEarnings(earningsRes.data || {});
    } catch (err) {
      console.error("Failed to load membership conversations", err);
      setConversations([]);
      setEarnings({});
      setError(err?.response?.data?.message || "Failed to load membership data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembershipData();
  }, []);

  const subscriberConversations = useMemo(
    () => conversations.filter((c) => Boolean(c.partner?.membershipTaken || c.partner?.subscribed)),
    [conversations]
  );

  const uniqueSubscribers = useMemo(() => {
    const map = new Map();
    subscriberConversations.forEach((c) => {
      const p = c.partner;
      if (p?._id && !map.has(String(p._id))) {
        map.set(String(p._id), p);
      }
    });
    return Array.from(map.values());
  }, [subscriberConversations]);

  const monthlyPrice = 199;
  const netPerSubscriber = Math.round(monthlyPrice * 0.7 * 100) / 100;
  const grossRevenue = Number(earnings?.totalGross || 0);
  const platformFee = Number(earnings?.platformFee || 0);
  const netRevenue = Number(earnings?.netEarnings || 0);
  const thisMonth = Number(earnings?.thisMonth || 0);

  const renewalDate = useMemo(() => {
    const base = user?.alumniMembershipStartedAt ? new Date(user.alumniMembershipStartedAt) : new Date();
    const d = new Date(base);
    d.setMonth(d.getMonth() + 1);
    return d;
  }, [user?.alumniMembershipStartedAt]);

  const renewalDaysLeft = useMemo(() => {
    const now = new Date();
    const ms = renewalDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
  }, [renewalDate]);

  const startedOn = user?.alumniMembershipStartedAt
    ? new Date(user.alumniMembershipStartedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "Not activated";

  const renewOn = renewalDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const onActivateSuccess = async () => {
    if (activating) return;
    setActivating(true);
    try {
      const res = await API.post("/users/membership/activate");
      const updated = res?.data?.user;
      if (updated) {
        login(updated);
      } else {
        login({ ...(user || {}), alumniMembershipActive: true, alumniPlan: "premium" });
      }
    } catch (err) {
      console.error("Membership activation failed", err);
      alert(err?.response?.data?.message || "Failed to activate membership.");
    } finally {
      setActivating(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "26px 0" }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 26, color: "var(--text)", marginBottom: 6 }}>
            Membership Dashboard
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>
            Activate your membership once. Students can then purchase your membership at ₹199/month.
          </p>
        </div>

        <div style={{
          borderRadius: 16,
          border: `1px solid ${isActive ? "rgba(0,229,195,0.3)" : "var(--border)"}`,
          background: "var(--bg-3)",
          padding: "16px 14px",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              Membership Status
            </p>
            <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 18, color: isActive ? "#00E5C3" : "var(--text)" }}>
              {isActive ? "Active" : "Inactive"}
            </p>
          </div>

          {!isActive && (
            <button
              onClick={onActivateSuccess}
              disabled={activating}
              style={{
                padding: "10px 16px",
                borderRadius: 11,
                border: "none",
                background: "linear-gradient(135deg, #00E5C3, #0A8FE8)",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "Plus Jakarta Sans",
                cursor: activating ? "not-allowed" : "pointer",
                opacity: activating ? 0.75 : 1,
              }}
            >
              {activating ? "Activating..." : "Activate Membership"}
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 14, padding: 4, background: "var(--bg-3)", borderRadius: 12, border: "1px solid var(--border)", width: "fit-content" }}>
          {[
            { id: "overview", label: "Overview" },
            { id: "subscribers", label: "Subscribers" },
            { id: "revenue", label: "Revenue" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 18px",
                borderRadius: 9,
                border: "none",
                background: activeTab === tab.id ? "linear-gradient(135deg,#00E5C3,#0A8FE8)" : "transparent",
                color: activeTab === tab.id ? "white" : "var(--text-3)",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "Plus Jakarta Sans",
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{
          borderRadius: 16,
          border: "1px solid var(--border)",
          background: "var(--bg-3)",
          padding: "16px 14px",
          marginBottom: 14,
        }}>
          <p style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 6 }}>
            Monthly Membership Price
          </p>
          <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 24, color: "var(--text)", marginBottom: 2 }}>
            ₹199
          </p>
          <p style={{ fontSize: 12, color: "var(--text-3)" }}>Students pay per month to subscribe to you.</p>
        </div>

        {loading && <Loader text="Loading membership data..." />}

        {!loading && error && (
          <div style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,75,110,0.25)",
            background: "rgba(255,75,110,0.08)",
            color: "#ff9cb0",
            fontSize: 12,
            fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        {!loading && activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 14 }}>
            <div style={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-3)", padding: "14px 12px" }}>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Subscribers</div>
              <div style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 22, color: "var(--text)" }}>{uniqueSubscribers.length}</div>
            </div>
            <div style={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-3)", padding: "14px 12px" }}>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>This Month</div>
              <div style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 22, color: "var(--text)" }}>₹{thisMonth.toLocaleString("en-IN")}</div>
            </div>
            <div style={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-3)", padding: "14px 12px" }}>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Started On</div>
              <div style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{startedOn}</div>
            </div>
            <div style={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-3)", padding: "14px 12px" }}>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Next Renewal</div>
              <div style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{renewOn} ({renewalDaysLeft}d)</div>
            </div>
          </div>
        )}

        {!loading && activeTab === "subscribers" && (
          <div>
            <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>
              Active Subscribers ({uniqueSubscribers.length})
            </h3>

            {uniqueSubscribers.length === 0 ? (
              <div style={{
                borderRadius: 14,
                border: "1px solid var(--border)",
                background: "var(--bg-3)",
                padding: "20px 16px",
                color: "var(--text-3)",
                fontSize: 13,
                textAlign: "center",
              }}>
                No active subscribers yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {uniqueSubscribers.map((student) => {
                  const initials = (student.name || "S")
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div key={student._id} style={{
                      borderRadius: 14,
                      border: "1px solid var(--border)",
                      background: "var(--bg-3)",
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                    }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                        <div style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background: student.avatar
                            ? `url(${student.avatar}) center/cover no-repeat`
                            : "linear-gradient(135deg, #00E5C3, #0A8FE8)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "Plus Jakarta Sans",
                          fontWeight: 700,
                          fontSize: 14,
                          flexShrink: 0,
                        }}>
                          {!student.avatar && initials}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 2 }}>
                            {student.name || "Student"}
                          </p>
                          <p style={{ fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {student.college || "College not available"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/alumni/dashboard/messages?user=${student._id}`)}
                        style={{
                          padding: "7px 12px",
                          borderRadius: 9,
                          border: "1px solid rgba(0,229,195,0.25)",
                          background: "rgba(0,229,195,0.1)",
                          color: "var(--teal)",
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: "Plus Jakarta Sans",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        Message
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === "revenue" && (
          <div style={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-3)", padding: "14px" }}>
            <h3 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 10 }}>
              Revenue Breakdown
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
              <div style={{ borderRadius: 12, border: "1px solid var(--border)", padding: "12px" }}>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Gross Revenue</div>
                <div style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 20, color: "var(--text)" }}>₹{grossRevenue.toLocaleString("en-IN")}</div>
              </div>
              <div style={{ borderRadius: 12, border: "1px solid var(--border)", padding: "12px" }}>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Platform Fee</div>
                <div style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 20, color: "var(--orange)" }}>₹{platformFee.toLocaleString("en-IN")}</div>
              </div>
              <div style={{ borderRadius: 12, border: "1px solid var(--border)", padding: "12px" }}>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Net Earnings</div>
                <div style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 20, color: "#00E5C3" }}>₹{netRevenue.toLocaleString("en-IN")}</div>
              </div>
              <div style={{ borderRadius: 12, border: "1px solid var(--border)", padding: "12px" }}>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Per Subscriber (70%)</div>
                <div style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 20, color: "var(--text)" }}>₹{netPerSubscriber}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
