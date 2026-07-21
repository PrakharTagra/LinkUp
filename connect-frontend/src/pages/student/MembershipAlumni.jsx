import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Loader from "../../components/common/Loader";
import PaymentModal from "../../components/academics/PaymentModal";
import API from "../../utils/api";

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function MembershipAlumniPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [openPayment, setOpenPayment] = useState(false);

  const fetchAlumni = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/users/alumni-memberships");
      setAlumni(res.data.alumni || []);
    } catch (err) {
      console.error("Failed to load alumni memberships", err);
      setAlumni([]);
      setError(err?.response?.data?.message || "Failed to load memberships.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const query = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!query) return alumni;
    return alumni.filter((a) => {
      const text = `${a.name || ""} ${a.company || ""} ${a.college || ""} ${a.role || ""}`.toLowerCase();
      return text.includes(query);
    });
  }, [alumni, query]);

  const onSubscribe = (alumnus) => {
    setSelectedAlumni(alumnus);
    setOpenPayment(true);
  };

  const onPaymentSuccess = async () => {
    if (!selectedAlumni?._id) return;
    try {
      await API.post(`/users/${selectedAlumni._id}/membership`);
      setAlumni((prev) => prev.map((a) =>
        String(a._id) === String(selectedAlumni._id)
          ? { ...a, membershipTaken: true, subscribed: true }
          : a
      ));
    } catch (err) {
      console.error("Membership activation failed", err);
      alert(err?.response?.data?.message || "Failed to activate membership.");
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "26px 0" }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 26, color: "var(--text)", marginBottom: 6 }}>
            Alumni Memberships
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>
            Subscribe to alumni at ₹199/month for priority replies and learner perks.
          </p>
        </div>

        <div style={{ position: "relative", marginBottom: 16 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}>
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, college..."
            style={{
              width: "100%",
              padding: "11px 14px 11px 36px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--bg-3)",
              color: "var(--text)",
              fontSize: 13,
              fontFamily: "DM Sans",
              outline: "none",
            }}
          />
        </div>

        {loading && <Loader text="Loading alumni memberships..." />}

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

        {!loading && filtered.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "42px 20px",
            borderRadius: 16,
            border: "1px solid var(--border)",
            background: "var(--bg-3)",
            color: "var(--text-3)",
            fontSize: 14,
          }}>
            No alumni memberships found.
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
            {filtered.map((a) => {
              const initials = (a.name || "A")
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div key={a._id} style={{
                  borderRadius: 16,
                  border: `1px solid ${a.membershipTaken ? "rgba(0,229,195,0.28)" : "var(--border)"}`,
                  background: "var(--bg-3)",
                  padding: "16px 14px",
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: a.avatar
                        ? `url(${a.avatar}) center/cover no-repeat`
                        : "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "Plus Jakarta Sans",
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                    }}>
                      {!a.avatar && initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 2 }}>
                        {a.name || "Alumni"}
                      </p>
                      <p style={{ fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.role || "Alumni"}{a.company ? ` @ ${a.company}` : ""}
                      </p>
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 12 }}>
                    🎓 {a.college || "College not available"}
                  </p>

                  <div style={{
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.02)",
                    padding: "10px 12px",
                    marginBottom: 12,
                  }}>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Membership Price</div>
                    <div style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 20, color: "var(--text)" }}>₹199</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>per month</div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => navigate("/alumni-profile", { state: { alumniId: a._id, alumni: a } })}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: 10,
                        border: "1px solid var(--border)",
                        background: "transparent",
                        color: "var(--text-2)",
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "Plus Jakarta Sans",
                        cursor: "pointer",
                      }}
                    >
                      View
                    </button>

                    {a.membershipTaken ? (
                      <button
                        onClick={() => navigate(`/messages?user=${a._id}`)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          borderRadius: 10,
                          border: "1px solid rgba(0,229,195,0.28)",
                          background: "rgba(0,229,195,0.1)",
                          color: "var(--teal)",
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: "Plus Jakarta Sans",
                          cursor: "pointer",
                        }}
                      >
                        Message
                      </button>
                    ) : (
                      <button
                        onClick={() => onSubscribe(a)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          borderRadius: 10,
                          border: "none",
                          background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
                          color: "white",
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: "Plus Jakarta Sans",
                          cursor: "pointer",
                        }}
                      >
                        Subscribe
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={openPayment}
        onClose={() => {
          setOpenPayment(false);
          setSelectedAlumni(null);
        }}
        course={{
          title: `${selectedAlumni?.name || "Alumni"} Membership`,
          instructor: selectedAlumni?.name || "Alumni",
          price: 199,
        }}
        skipEnrollment
        onPaymentSuccess={onPaymentSuccess}
      />
    </MainLayout>
  );
}
