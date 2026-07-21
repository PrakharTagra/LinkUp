import React, { useState } from "react";
import { enrollAcademicItem } from "../../utils/academicCatalog";
import UpiGateway from "./UpiGateway";

const CloseIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const METHODS = [
  { id: "upi",  icon: "📱", label: "UPI",                    sub: "GPay, PhonePe, Paytm"    },
  { id: "card", icon: "💳", label: "Credit / Debit Card",    sub: "Visa, Mastercard, Rupay" },
  { id: "net",  icon: "🏦", label: "Net Banking",            sub: "All major banks supported" },
];

export default function PaymentModal({ isOpen, onClose, course, onPaymentSuccess, skipEnrollment = false }) {
  const [method,  setMethod]  = useState("upi");
  const [loading, setLoading] = useState(false);
  const [showGateway, setShowGateway] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !course) return null;

  const handleGatewayComplete = async ({ id, method }) => {
    try {
      setLoading(true);
      if (!skipEnrollment) {
        await enrollAcademicItem(course, { method, paymentId: id });
      }
      
      onPaymentSuccess?.(course);
      setSuccess(true);
      setTimeout(() => { 
        setSuccess(false); 
        setShowGateway(false);
        onClose(); 
      }, 2000);
    } catch (err) {
      console.error("Payment modal enrollment error", err);
      alert(err.response?.data?.message || "Enrollment failed. Please try again.");
      setShowGateway(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPayment = () => {
    if (method === "upi") {
      setShowGateway(true);
    } else {
        // Simple simulator for card/net
        handleGatewayComplete({ id: "pay_sim_" + Date.now(), method });
    }
  };

  const discount = course.originalPrice
    ? Math.round((1 - course.price / course.originalPrice) * 100)
    : null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 600,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, animation: "fadeIn 0.2s ease",
    }}>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }} />

      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: 420,
        background: "var(--bg-2)",
        border: "1px solid var(--border-bright)",
        borderRadius: 24, overflow: "hidden",
        animation: "fadeUp 0.28s cubic-bezier(.22,.68,0,1.2)",
      }}>
        {/* Gradient top bar */}
        <div style={{ height: 5, background: "linear-gradient(90deg, #7C5CFC, #FF7043, #00E5C3)" }} />

        {/* Success screen */}
        {success ? (
          <div style={{ padding: "48px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 22, color: "var(--text)", marginBottom: 8 }}>Payment Successful!</h2>
            <p style={{ fontSize: 14, color: "var(--text-2)" }}>
              {skipEnrollment
                ? <><strong>{course.title}</strong> is now active. Check your email for payment details.</>
                : <>You're enrolled in <strong>{course.title}</strong>. Check your email for details.</>}
            </p>
          </div>
        ) : showGateway ? (
            <div style={{ padding: "12px" }}>
                <UpiGateway 
                    amount={course.price} 
                    courseTitle={course.title} 
                    onPaymentComplete={handleGatewayComplete} 
                />
                <button onClick={() => setShowGateway(false)} style={{
                    marginTop: 12, width: "100%", padding: 10, background: "transparent",
                    border: "none", color: "var(--text-3)", fontSize: 13, cursor: "pointer",
                    fontFamily: "Plus Jakarta Sans"
                }}>← Change Payment Method</button>
            </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 17, color: "var(--text)" }}>Complete Payment</h2>
              <button onClick={onClose} style={{
                width: 30, height: 30, borderRadius: 8, background: "transparent",
                border: "1px solid var(--border)", color: "var(--text-3)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-4)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-3)"; }}
              ><CloseIcon /></button>
            </div>

            <div style={{ padding: "20px 22px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Course summary */}
              <div style={{
                padding: "14px 16px",
                background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 14,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 3 }}>{course.title}</p>
                    <p style={{ fontSize: 12, color: "var(--text-2)" }}>by {course.instructor?.name || course.instructor}</p>
                  </div>
                  {discount && (
                    <span style={{ padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: "rgba(0,229,195,0.1)", color: "var(--teal)" }}>{discount}% OFF</span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                  <span style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 22, color: "var(--text)" }}>₹{course.price.toLocaleString()}</span>
                  {course.originalPrice && (
                    <span style={{ fontSize: 13, color: "var(--text-3)", textDecoration: "line-through" }}>₹{course.originalPrice.toLocaleString()}</span>
                  )}
                </div>
              </div>

              {/* Payment method */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Payment Method
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {METHODS.map(m => (
                    <button key={m.id} onClick={() => setMethod(m.id)} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                      background: method === m.id ? "rgba(124,92,252,0.1)" : "var(--bg-3)",
                      border: `1.5px solid ${method === m.id ? "rgba(124,92,252,0.4)" : "var(--border)"}`,
                      transition: "all 0.18s", textAlign: "left",
                    }}>
                      <span style={{ fontSize: 20 }}>{m.icon}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{m.label}</p>
                        <p style={{ fontSize: 11, color: "var(--text-3)" }}>{m.sub}</p>
                      </div>
                      <div style={{ marginLeft: "auto" }}>
                        <div style={{
                          width: 16, height: 16, borderRadius: "50%",
                          border: `2px solid ${method === m.id ? "var(--purple)" : "var(--border)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {method === m.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--purple)" }} />}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pay button */}
              <button onClick={handleStartPayment} disabled={loading} style={{
                width: "100%", padding: "14px",
                background: loading ? "var(--bg-4)" : "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
                border: "none", borderRadius: 13,
                color: loading ? "var(--text-3)" : "white",
                fontSize: 16, fontWeight: 700, fontFamily: "Plus Jakarta Sans",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 6px 24px rgba(124,92,252,0.4)",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}>
                {loading ? (
                  <><span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "var(--purple)", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Processing…</>
                ) : `Proceed to Pay ₹${course.price.toLocaleString()} →`}
              </button>

              <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-3)" }}>
                🔒 Secured by Connect · 256-bit encryption
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}